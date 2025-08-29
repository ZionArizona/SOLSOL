import { apiClient } from './api';

export interface Notification {
  id: number;
  userNm: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: number;
  isRead: boolean;
  actionRoute?: string;
  createdAt: string;
  updatedAt?: string;
}

export enum NotificationType {
  NEW_SCHOLARSHIP = 'NEW_SCHOLARSHIP',
  SCHOLARSHIP_RESULT = 'SCHOLARSHIP_RESULT', 
  MILEAGE_DEPOSIT = 'MILEAGE_DEPOSIT',
  ACCOUNT_TRANSFER = 'ACCOUNT_TRANSFER',
  SCHEDULE = 'SCHEDULE',
  DEADLINE_REMINDER = 'DEADLINE_REMINDER'
}

export const notificationApi = {
  // 모든 알림 조회
  async getUserNotifications(): Promise<Notification[]> {
    const response = await apiClient.get('/notifications');
    console.log('🔍 Notification API Response:', response.data);
    console.log('📋 Response structure:', typeof response.data);
    console.log('🗂️ Response keys:', Object.keys(response.data || {}));
    
    // 배열인 경우 첫 번째 항목의 상세 내용 확인
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('📝 First notification details:', response.data[0]);
      console.log('🔑 First notification keys:', Object.keys(response.data[0] || {}));
    }
    
    // 응답 구조에 따라 적절히 처리
    if (response.data && response.data.data) {
      // ApiResponse 구조: {success, message, data}
      console.log('✅ Using ApiResponse structure');
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      // 직접 배열 응답
      console.log('✅ Using direct array response');
      console.log('📊 Notifications count:', response.data.length);
      return response.data;
    } else {
      console.log('❌ Unknown response structure');
      return [];
    }
  },

  // 타입별 알림 조회
  async getNotificationsByType(type: NotificationType): Promise<Notification[]> {
    const response = await apiClient.get(`/notifications/type/${type}`);
    return response.data.data;
  },

  // 읽지 않은 알림 조회
  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await apiClient.get('/notifications/unread');
    return response.data.data;
  },

  // 읽지 않은 알림 개수 조회
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get('/notifications/unread/count');
    return response.data.data;
  },

  // 알림 읽음 처리
  async markAsRead(notificationId: number): Promise<void> {
    await apiClient.put(`/notifications/${notificationId}/read`);
  },

  // 모든 알림 읽음 처리
  async markAllAsRead(): Promise<void> {
    await apiClient.put('/notifications/read-all');
  },

  // 알림 삭제
  async deleteNotification(notificationId: number): Promise<void> {
    await apiClient.delete(`/notifications/${notificationId}`);
  }
};