import React, { useState, useEffect, useMemo } from "react";
import { ImageBackground, ScrollView, StatusBar, StyleSheet, View, ActivityIndicator, RefreshControl, Text } from "react-native";
import BG from "../../assets/images/SOLSOLBackground.png";
import { TopBar } from "../../components/scholarship/TopBar";
import { NotificationTabs } from "../../components/notifications/NotificationTabs";
import { NotificationCard, NotificationItem } from "../../components/notifications/NotificationCard";
import { notificationApi, Notification, NotificationType } from "../../services/notification.api";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<string>("전체");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      await notificationApi.markAsRead(parseInt(notificationId));
      
      // 로컬 상태 업데이트
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === parseInt(notificationId)
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

  // 백엔드 데이터를 프론트엔드 형태로 변환
  const convertedNotifications = useMemo<NotificationItem[]>(() => {
    const result = notifications && Array.isArray(notifications) ? notifications.map(convertToNotificationItem) : [];
    console.log('🔄 Converting notifications:', notifications?.length || 0, 'items');
    console.log('🔄 Converted result:', result.length, 'items');
    if (result.length > 0) {
      console.log('🔄 First converted item:', result[0]);
    }
    return result;
  }, [notifications]);

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