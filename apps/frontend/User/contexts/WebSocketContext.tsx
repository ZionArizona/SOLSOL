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
      connect();
    } else {
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
      // 중복 알림 방지
      const exists = prev.some(n => n.id === notification.id);
      if (exists) return prev;
      
      // 최신 알림을 상단에 추가
      return [notification, ...prev];
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