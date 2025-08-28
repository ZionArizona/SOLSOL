import React, { useState, useEffect, useMemo } from "react";
import { ImageBackground, ScrollView, StatusBar, StyleSheet, View, ActivityIndicator, RefreshControl, Text } from "react-native";
import BG from "../../assets/images/SOLSOLBackground.png";
import { TopBar } from "../../components/scholarship/TopBar";
import { NotificationTabs } from "../../components/notifications/NotificationTabs";
import { NotificationCard, NotificationItem } from "../../components/notifications/NotificationCard";
import { notificationApi, Notification, NotificationType } from "../../services/notification.api";
import { useWebSocket } from "../../contexts/WebSocketContext";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<string>("전체");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // WebSocket 컨텍스트에서 실시간 알림 가져오기
  const { 
    notifications: realtimeNotifications, 
    unreadCount, 
    isConnected, 
    connectionState, 
    markAsRead: markRealtimeAsRead 
  } = useWebSocket();

  // 백엔드 알림 데이터를 프론트엔드 형태로 변환
  const convertToNotificationItem = (notification: Notification): NotificationItem => {
    const formatTimestamp = (createdAt: string) => {
      const now = new Date();
      const created = new Date(createdAt);
      const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return "방금 전";
      if (diffInHours < 24) return `${diffInHours}시간 전`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}일 전`;
      
      return `${Math.floor(diffInDays / 7)}주일 전`;
    };

    const getTypeAndRoute = (type: NotificationType) => {
      switch (type) {
        case NotificationType.NEW_SCHOLARSHIP:
          return { 
            displayType: "scholarship", 
            actionLabel: "장학금 보기", 
            actionRoute: "/Scholarship/ScholarshipDetail" 
          };
        case NotificationType.SCHOLARSHIP_RESULT:
          return { 
            displayType: "scholarship", 
            actionLabel: "결과 확인", 
            actionRoute: "/MyScholarship/MyScholarship" 
          };
        case NotificationType.SCHEDULE:
          return { 
            displayType: "schedule", 
            actionLabel: "일정 확인", 
            actionRoute: "/Schedule/MyCalendar" 
          };
        case NotificationType.DEADLINE_REMINDER:
          return { 
            displayType: "deadline", 
            actionLabel: "신청하기", 
            actionRoute: "/Scholarship/ScholarshipApply" 
          };
        default:
          return { 
            displayType: "scholarship", 
            actionLabel: "확인하기", 
            actionRoute: "/" 
          };
      }
    };

    const typeInfo = getTypeAndRoute(notification.type);

    return {
      id: notification.id.toString(),
      type: typeInfo.displayType,
      title: notification.title,
      message: notification.message,
      timestamp: formatTimestamp(notification.createdAt),
      isRead: notification.isRead,
      actionLabel: typeInfo.actionLabel,
      actionRoute: typeInfo.actionRoute
    };
  };

  // 데이터 로드 함수
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getUserNotifications();
      console.log('🎯 Received notifications data:', data);
      console.log('🎯 Data is array:', Array.isArray(data));
      console.log('🎯 Data length:', data?.length || 0);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('알림 데이터 로드 실패:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 새로고침 함수
  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  // 알림 읽음 처리 함수
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const id = parseInt(notificationId);
      
      // 백엔드에 읽음 처리 요청
      await notificationApi.markAsRead(id);
      
      // WebSocket 컨텍스트에서도 읽음 처리
      markRealtimeAsRead(id);
      
      // 로컬 상태 업데이트
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadNotifications();
  }, []);

  // 실시간 알림이 업데이트될 때마다 기존 알림과 병합
  const mergedNotifications = useMemo(() => {
    // WebSocket 실시간 알림을 백엔드 형식으로 변환
    const convertedRealtimeNotifications = realtimeNotifications.map(wsNotification => ({
      id: wsNotification.id || Math.floor(Math.random() * 1000000), // 임시 ID
      userNm: wsNotification.userNm,
      type: wsNotification.type as NotificationType,
      title: wsNotification.title,
      message: wsNotification.message,
      relatedId: wsNotification.relatedId || null,
      isRead: wsNotification.isRead,
      actionRoute: wsNotification.actionRoute || null,
      createdAt: wsNotification.createdAt,
      updatedAt: wsNotification.updatedAt
    }));

    // 기존 API 알림과 실시간 알림 병합 (중복 제거)
    const allNotifications = [...convertedRealtimeNotifications, ...notifications];
    const uniqueNotifications = allNotifications.filter((notification, index, self) => 
      index === self.findIndex(n => n.id === notification.id)
    );

    // 생성일 기준으로 내림차순 정렬
    return uniqueNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications, realtimeNotifications]);

  // 병합된 데이터를 프론트엔드 형태로 변환
  const convertedNotifications = useMemo<NotificationItem[]>(() => {
    const result = mergedNotifications && Array.isArray(mergedNotifications) ? mergedNotifications.map(convertToNotificationItem) : [];
    console.log('🔄 Converting merged notifications:', mergedNotifications?.length || 0, 'items');
    console.log('🔄 Converted result:', result.length, 'items');
    console.log('🔌 WebSocket connected:', isConnected, 'State:', connectionState);
    console.log('📊 Unread count:', unreadCount);
    if (result.length > 0) {
      console.log('🔄 First converted item:', result[0]);
    }
    return result;
  }, [mergedNotifications, isConnected, connectionState, unreadCount]);

  // 탭별 필터링된 알림 데이터
  const filteredNotifications = useMemo(() => {
    return convertedNotifications.filter(notification => {
      switch (activeTab) {
        case "장학금":
          return notification.type === "scholarship";
        case "일정":
          return notification.type === "schedule";
        case "마감임박":
          return notification.type === "deadline";
        case "읽지않음":
          return !notification.isRead;
        default:
          return true;
      }
    });
  }, [convertedNotifications, activeTab]);

  if (loading) {
    return (
      <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
        <StatusBar barStyle="dark-content" />
        <View style={[styles.phone, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color="#6B86FF" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.phone}>
          <TopBar title="알림함" />

          {/* 알림 탭 */}
          <NotificationTabs
            tabs={["전체", "장학금", "일정", "마감임박", "읽지않음"]}
            active={activeTab}
            onChange={setActiveTab}
          />

          {/* 알림 리스트 */}
          <View style={styles.notificationList}>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <NotificationCard 
                  key={notification.id} 
                  notification={notification} 
                  onMarkAsRead={handleMarkAsRead}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {activeTab === "전체" 
                    ? "알림이 없습니다." 
                    : `${activeTab} 알림이 없습니다.`
                  }
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  phone: { width: 360, paddingVertical: 8 },
  notificationList: { paddingHorizontal: 12, marginTop: 8 },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#7C89A6",
    textAlign: 'center',
    fontWeight: '600',
  },
});