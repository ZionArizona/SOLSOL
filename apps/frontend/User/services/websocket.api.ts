import { getAuthToken } from '../utils/tokenManager';

export interface NotificationMessage {
  id?: number;
  userNm: string;
  type: 'SCHOLARSHIP_RESULT' | 'DEADLINE_REMINDER' | 'NEW_SCHOLARSHIP' | 'SCHEDULE';
  title: string;
  message: string;
  relatedId?: number;
  isRead: boolean;
  actionRoute?: string;
  createdAt: string;
  updatedAt: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private messageListeners: ((message: NotificationMessage) => void)[] = [];
  private connectionListeners: ((connected: boolean) => void)[] = [];
  private userNm: string | null = null;
  private stompSessionId: string | null = null;

  connect(userNm: string): void {
    this.userNm = userNm;
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      console.log('🔌 Connecting to WebSocket...');
      
      // React Native Web에서 WebSocket 연결
      this.ws = new WebSocket('ws://localhost:8080/ws');

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        this.notifyConnectionListeners(true);
        
        // STOMP CONNECT 명령 전송
        this.sendStompConnect();
      };

      this.ws.onmessage = (event) => {
        this.handleStompMessage(event.data);
      };

      this.ws.onclose = (event) => {
        console.log('❌ WebSocket disconnected:', event.code, event.reason);
        this.notifyConnectionListeners(false);
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('🚨 WebSocket error:', error);
        this.notifyConnectionListeners(false);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handleReconnect();
    }
  }

  private sendStompConnect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const connectFrame = [
        'CONNECT',
        'accept-version:1.0,1.1,2.0',
        'heart-beat:10000,10000',
        '',
        '\x00'
      ].join('\n');
      
      console.log('📤 Sending STOMP CONNECT');
      this.ws.send(connectFrame);
    }
  }

  private handleStompMessage(data: string): void {
    console.log('📨 Raw STOMP message:', data);
    
    const lines = data.split('\n');
    const command = lines[0];

    if (command === 'CONNECTED') {
      console.log('✅ STOMP connected');
      
      // 세션 ID 추출 (있다면)
      const sessionLine = lines.find(line => line.startsWith('session:'));
      if (sessionLine) {
        this.stompSessionId = sessionLine.split(':')[1];
      }
      
      // 사용자별 개인 큐 구독
      this.subscribeToUserNotifications();
      // 새 장학금 토픽 구독
      this.subscribeToNewScholarships();
      
    } else if (command === 'MESSAGE') {
      this.handleStompMessageContent(data);
    } else if (command === 'ERROR') {
      console.error('❌ STOMP Error:', data);
    }
  }

  private handleStompMessageContent(data: string): void {
    try {
      const lines = data.split('\n');
      
      // Find the start of message body (after empty line)
      const emptyLineIndex = lines.findIndex(line => line === '');
      if (emptyLineIndex !== -1 && emptyLineIndex < lines.length - 1) {
        const messageBody = lines.slice(emptyLineIndex + 1).join('\n').replace(/\x00$/, '');
        
        console.log('📨 STOMP message body:', messageBody);
        
        if (messageBody.trim()) {
          const notification: NotificationMessage = JSON.parse(messageBody);
          console.log('📬 Parsed notification:', notification);
          this.notifyMessageListeners(notification);
        }
      }
    } catch (error) {
      console.error('Error parsing STOMP message:', error, data);
    }
  }

  private subscribeToUserNotifications(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.userNm) {
      const destination = `/queue/notifications/${this.userNm}`;
      const subscribeFrame = [
        'SUBSCRIBE',
        `destination:${destination}`,
        'id:sub-user-notifications',
        '',
        '\x00'
      ].join('\n');
      
      console.log(`🔔 Subscribing to user notifications: ${destination}`);
      this.ws.send(subscribeFrame);
      console.log(`🔔 Subscribed to notifications for user: ${this.userNm}`);
    }
  }

  private subscribeToNewScholarships(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const destination = '/topic/new-scholarships';
      const subscribeFrame = [
        'SUBSCRIBE',
        `destination:${destination}`,
        'id:sub-new-scholarships',
        '',
        '\x00'
      ].join('\n');
      
      console.log('🆕 Subscribing to new scholarship notifications');
      this.ws.send(subscribeFrame);
      console.log('🆕 Subscribed to new scholarship notifications');
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.userNm) {
          this.connect(this.userNm);
        }
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  disconnect(): void {
    if (this.ws) {
      // STOMP DISCONNECT 명령 전송
      if (this.ws.readyState === WebSocket.OPEN) {
        const disconnectFrame = [
          'DISCONNECT',
          '',
          '\x00'
        ].join('\n');
        this.ws.send(disconnectFrame);
      }
      
      console.log('🔌 Disconnecting WebSocket...');
      this.ws.close();
      this.ws = null;
    }
    this.messageListeners = [];
    this.connectionListeners = [];
    this.userNm = null;
    this.stompSessionId = null;
    this.reconnectAttempts = 0;
  }

  addMessageListener(listener: (message: NotificationMessage) => void): void {
    this.messageListeners.push(listener);
  }

  removeMessageListener(listener: (message: NotificationMessage) => void): void {
    this.messageListeners = this.messageListeners.filter(l => l !== listener);
  }

  addConnectionListener(listener: (connected: boolean) => void): void {
    this.connectionListeners.push(listener);
  }

  removeConnectionListener(listener: (connected: boolean) => void): void {
    this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
  }

  private notifyMessageListeners(message: NotificationMessage): void {
    this.messageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'DISCONNECTED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'CONNECTED';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'DISCONNECTED';
      default: return 'UNKNOWN';
    }
  }
}

// 싱글톤 인스턴스
export const webSocketService = new WebSocketService();