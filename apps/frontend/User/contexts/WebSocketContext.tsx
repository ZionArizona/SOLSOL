import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { webSocketService, NotificationMessage } from '../services/websocket.api';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  isConnected: boolean;
  connectionState: string;
  notifications: NotificationMessage[];
  unreadCount: number;
  connect: () => void;
  disconnect: () => void;
  markAsRead: (notificationId: number) => void;
  deleteNotification: (notificationId: number) => void;
  deleteNotificationsByScholarship: (scholarshipId: number) => void;
  clearNotifications: () => void;
  addNotification: (notification: NotificationMessage) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('DISCONNECTED');
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  // 읽지 않은 알림 개수 계산
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // 디버깅: 알림 개수 로깅
  React.useEffect(() => {
    console.log(`🔢 WebSocket notifications count: ${notifications.length}, unread: ${unreadCount}`);
    console.log('🔢 All notifications:', notifications.map(n => ({ id: n.id, title: n.title, isRead: n.isRead })));
  }, [notifications, unreadCount]);

  useEffect(() => {
    // 연결 상태 감지 리스너
    const connectionListener = (connected: boolean) => {
      setIsConnected(connected);
      setConnectionState(webSocketService.getConnectionState());
    };

    // 새 알림 수신 리스너  
    const messageListener = (notification: NotificationMessage) => {
      console.log('🔔 New notification received:', notification);
      addNotification(notification);
      
      // 모바일에서 푸시 알림 또는 토스트 표시 가능
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.png'
          });
        }
      }
    };

    // 리스너 등록
    webSocketService.addConnectionListener(connectionListener);
    webSocketService.addMessageListener(messageListener);

    // 사용자가 로그인된 경우 자동 연결
    if (user?.userNm) {
      console.log('🔌 Auto-connecting WebSocket for user:', user.userNm);
      webSocketService.connect(user.userNm);
    }

    return () => {
      // 리스너 제거
      webSocketService.removeConnectionListener(connectionListener);
      webSocketService.removeMessageListener(messageListener);
    };
  }, [user]);

  // 사용자 변경 시 재연결
  useEffect(() => {
    if (user?.userNm) {
      console.log('🔄 User changed, reconnecting WebSocket:', user.userNm);
      connect();
    } else {
      console.log('🔄 No user, disconnecting WebSocket');
      disconnect();
    }
  }, [user?.userNm]);

  const connect = () => {
    if (user?.userNm) {
      console.log('🔌 Connecting WebSocket...');
      webSocketService.connect(user.userNm);
      setConnectionState(webSocketService.getConnectionState());
    }
  };

  const disconnect = () => {
    console.log('🔌 Disconnecting WebSocket...');
    webSocketService.disconnect();
    setIsConnected(false);
    setConnectionState('DISCONNECTED');
  };

  const addNotification = (notification: NotificationMessage) => {
    setNotifications(prev => {
      // id가 null인 경우 임시 ID 생성 (더 유니크하게)
      if (!notification.id) {
        notification.id = Date.now() * 1000 + Math.floor(Math.random() * 1000);
        console.log(`🆔 WebSocket: Generated ID ${notification.id} for notification`);
      }
      
      // 더 강력한 중복 알림 방지 로직
      const exists = prev.some(n => {
        // 1. 같은 ID인 경우
        if (n.id === notification.id && n.id !== null && n.id !== undefined) {
          console.log(`🔄 WebSocket: Duplicate by ID ${notification.id}`);
          return true;
        }
        
        // 2. 같은 제목과 메시지, 5초 이내인 경우
        if (n.title === notification.title && n.message === notification.message) {
          const timeDiff = Math.abs(new Date(n.createdAt).getTime() - new Date(notification.createdAt).getTime());
          if (timeDiff < 5000) {
            console.log(`🔄 WebSocket: Duplicate by content and time (${timeDiff}ms)`);
            return true;
          }
        }
        
        // 3. 같은 relatedId, type, title인 경우 (장학금 관련 알림)
        if (n.relatedId && notification.relatedId && 
            n.relatedId === notification.relatedId && 
            n.type === notification.type && 
            n.title === notification.title) {
          const timeDiff = Math.abs(new Date(n.createdAt).getTime() - new Date(notification.createdAt).getTime());
          if (timeDiff < 10000) { // 10초 이내
            console.log(`🔄 WebSocket: Duplicate by relatedId ${notification.relatedId} and type ${notification.type}`);
            return true;
          }
        }
        
        return false;
      });
      
      if (exists) {
        console.log(`🔄 WebSocket: Duplicate notification detected, skipping: ${notification.title}`);
        return prev;
      }
      
      console.log(`➕ WebSocket: Adding notification ${notification.id} - ${notification.title} (type: ${notification.type})`);
      // 최신 알림을 상단에 추가
      const updated = [notification, ...prev];
      console.log(`📊 WebSocket: Total notifications after add: ${updated.length}`);
      return updated;
    });
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      console.log(`🔄 WebSocket: Marked notification ${notificationId} as read. New unread count: ${updated.filter(n => !n.isRead).length}`);
      return updated;
    });
  };

  const deleteNotification = (notificationId: number) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== notificationId);
      console.log(`🗑️ WebSocket: Deleted notification ${notificationId}. New total count: ${updated.length}`);
      return updated;
    });
  };

  const deleteNotificationsByScholarship = (scholarshipId: number) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.relatedId !== scholarshipId);
      const deletedCount = prev.length - updated.length;
      console.log(`🗑️ WebSocket: Deleted ${deletedCount} notifications for scholarship ${scholarshipId}. New total count: ${updated.length}`);
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value: WebSocketContextType = {
    isConnected,
    connectionState,
    notifications,
    unreadCount,
    connect,
    disconnect,
    markAsRead,
    deleteNotification,
    deleteNotificationsByScholarship,
    clearNotifications,
    addNotification
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket(): WebSocketContextType {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}