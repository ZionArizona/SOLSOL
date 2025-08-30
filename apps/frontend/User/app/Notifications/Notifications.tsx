import React, { useState, useEffect, useMemo } from "react";
import { ScrollView, StatusBar, StyleSheet, View, ActivityIndicator, RefreshControl, Text, ImageBackground, TouchableOpacity } from "react-native";
import { TopBar } from "../../components/scholarship/TopBar";
import { NotificationTabs } from "../../components/notifications/NotificationTabs";
import { NotificationCard, NotificationItem } from "../../components/notifications/NotificationCard";
import { notificationApi, Notification, NotificationType } from "../../services/notification.api";
import { useWebSocket } from "../../contexts/WebSocketContext";
// MainPage와 일치하도록 수정
import SOLSOLBackground from "../../assets/images/SOLSOLBackground.png";

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
    markAsRead: markRealtimeAsRead,
    deleteNotification: deleteRealtimeNotification 
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
        case NotificationType.MILEAGE_DEPOSIT:
          return { 
            displayType: "scholarship", 
            actionLabel: "마일리지 확인", 
            actionRoute: "/MyPage/MyPage" 
          };
        case NotificationType.ACCOUNT_TRANSFER:
          return { 
            displayType: "scholarship", 
            actionLabel: "계좌 확인", 
            actionRoute: "/MyPage/MyPage" 
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
            actionLabel: "장학금 보기", 
            actionRoute: "/Scholarship/ScholarshipDetail" 
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
      actionRoute: notification.actionRoute || typeInfo.actionRoute
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

  // 알림 읽음 처리 함수 (모든 알림 읽으면 자동 삭제)
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const id = parseInt(notificationId);
      const notification = notifications.find(n => n.id === id);
      
      if (!notification) return;
      
      console.log(`📖 Starting to mark notification as read and delete: ${id}, type: ${notification.type}`);
      
      // 모든 알림을 읽으면 자동 삭제
      console.log(`🗑️ Auto-deleting notification: ${id}`);
      
      // 백엔드에서 알림 삭제
      await notificationApi.deleteNotification(id);
      
      // WebSocket 컨텍스트에서도 삭제
      deleteRealtimeNotification(id);
      
      // 로컬 상태에서 제거
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      console.log(`✅ Auto-deleted notification after reading: ${id}`);
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  // 스와이프로 알림 삭제하는 함수
  const handleSwipeDelete = async (notificationId: string) => {
    try {
      const id = parseInt(notificationId);
      console.log(`🗑️ Swiping to delete notification: ${id}`);
      
      // 백엔드에서 알림 삭제
      await notificationApi.deleteNotification(id);
      
      // WebSocket 컨텍스트에서도 삭제
      deleteRealtimeNotification(id);
      
      // 로컬 상태에서 제거
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      console.log(`✅ Swipe deleted notification: ${id}`);
    } catch (error) {
      console.error('스와이프 삭제 실패:', error);
    }
  };

  // 장학금 보기를 위한 알림 삭제 함수 (장학금 관련 알림만)
  const handleDeleteNotificationForAction = async (notificationId: string, actionRoute: string) => {
    try {
      const id = parseInt(notificationId);
      console.log(`🗑️ Starting to delete notification for action: ${id}`);
      
      // 장학금 관련 알림인 경우에만 삭제 처리
      if (actionRoute.includes('/Scholarship/ScholarshipDetail')) {
        // 먼저 읽지 않은 알림이면 읽음 처리 (unreadCount 감소)
        const notification = notifications.find(n => n.id === id);
        if (notification && !notification.isRead) {
          await notificationApi.markAsRead(id);
          markRealtimeAsRead(id);
          console.log(`✅ Marked notification ${id} as read before deletion`);
        }
        
        // 백엔드에서 알림 삭제
        await notificationApi.deleteNotification(id);
        console.log(`✅ Backend deleteNotification successful for: ${id}`);
        
        // WebSocket 컨텍스트에서도 삭제 처리
        deleteRealtimeNotification(id);
        console.log(`✅ WebSocket deleteNotification successful for: ${id}`);
        
        // 로컬 상태에서 제거
        setNotifications(prev => {
          const updated = prev.filter(notification => notification.id !== id);
          console.log(`📝 Local state updated - removed notification ${id}, remaining: ${updated.length}`);
          return updated;
        });
      } else {
        // 다른 타입의 알림은 읽음 처리만
        await handleMarkAsRead(notificationId);
      }
    } catch (error) {
      console.error('알림 삭제 처리 실패:', error);
    }
  };

  // 알림 페이지 진입 시 모든 알림을 읽음 처리하여 뱃지 제거
  const markAllUnreadAsRead = async () => {
    try {
      console.log('📖 [Notifications Page] Marking all notifications as read to clear badge');
      console.log('📊 Current unread count:', unreadCount);
      console.log('📋 API notifications:', notifications.length);
      console.log('📋 WebSocket notifications:', realtimeNotifications.length);
      
      // 1단계: 모든 WebSocket 알림을 읽음 처리 (뱃지 클리어)
      console.log('🔄 Step 1: Clearing WebSocket notifications for badge');
      realtimeNotifications.forEach(notification => {
        if (notification.id) {
          markRealtimeAsRead(notification.id);
          console.log(`✅ Marked WebSocket notification ${notification.id} as read`);
        }
      });
      
      // 2단계: API 알림들도 읽음 처리 (백엔드 동기화)
      console.log('🔄 Step 2: Marking API notifications as read');
      const apiUnreadNotifications = notifications.filter(n => !n.isRead);
      
      for (const notification of apiUnreadNotifications) {
        try {
          await notificationApi.markAsRead(notification.id);
          console.log(`✅ API: Marked notification ${notification.id} as read`);
        } catch (error) {
          console.warn(`⚠️ Failed to mark API notification ${notification.id} as read:`, error);
        }
      }
      
      // 3단계: 로컬 상태 업데이트
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      console.log('✅ All notifications marked as read - badge should be cleared');
      
    } catch (error) {
      console.error('❌ Failed to mark notifications as read:', error);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드 및 모든 알림 읽음 처리
  useEffect(() => {
    loadNotifications();
  }, []);

  // 페이지 진입 시 자동으로 모든 알림 읽음 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        console.log('🚀 Auto-triggering mark all as read after page load');
        markAllUnreadAsRead();
      }
    }, 500); // 0.5초 후 자동 실행

    return () => clearTimeout(timer);
  }, [loading]);

  // WebSocket은 뱃지 업데이트용으로만 사용, 화면에는 API 알림만 표시
  const displayNotifications = useMemo(() => {
    console.log('📋 Displaying API notifications only:', notifications.length);
    console.log('📊 WebSocket notifications (for badge only):', realtimeNotifications.length);
    
    // API 알림만 표시하여 중복 방지
    return notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications, realtimeNotifications.length]);

  // API 데이터를 프론트엔드 형태로 변환
  const convertedNotifications = useMemo<NotificationItem[]>(() => {
    const result = displayNotifications && Array.isArray(displayNotifications) ? displayNotifications.map(convertToNotificationItem) : [];
    console.log('🔄 Converting API notifications:', displayNotifications?.length || 0, 'items');
    console.log('🔄 Converted result:', result.length, 'items');
    console.log('🔌 WebSocket connected:', isConnected, 'State:', connectionState);
    console.log('📊 Unread count:', unreadCount);
    if (result.length > 0) {
      console.log('🔄 First converted item:', result[0]);
      console.log('🔄 Read states:', result.map(item => ({ id: item.id, isRead: item.isRead, type: item.type })));
    }
    return result;
  }, [displayNotifications, isConnected, connectionState, unreadCount]);

  // 탭별 필터링된 알림 데이터
  const filteredNotifications = useMemo(() => {
    const filtered = convertedNotifications.filter(notification => {
      switch (activeTab) {
        case "장학금":
          return notification.type === "scholarship";
        case "마감임박":
          return notification.type === "deadline";
        case "내 일정":
          return notification.type === "schedule";
        default:
          return true;
      }
    });
    console.log(`📋 Filtered notifications for "${activeTab}":`, filtered.length, 'items');
    console.log(`📋 Filter details:`, filtered.map(item => ({ id: item.id, type: item.type, isRead: item.isRead })));
    return filtered;
  }, [convertedNotifications, activeTab]);

  if (loading) {
    return (
      <ImageBackground source={SOLSOLBackground} style={styles.bg} resizeMode="cover">
        <StatusBar barStyle="dark-content" />
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#6B86FF" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={SOLSOLBackground} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* MainPage와 동일한 고정 너비 컨테이너 */}
        <View style={styles.phone}>
          <TopBar title="알림함" />


          {/* 알림 탭 */}
          <NotificationTabs
            tabs={["전체", "장학금", "마감임박", "내 일정"]}
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
                  onSwipeDelete={handleSwipeDelete}
                  onDeleteForAction={handleDeleteNotificationForAction}
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

// MainPage와 동일한 고정 너비 설정
const PHONE_WIDTH = 360;

const styles = StyleSheet.create({
  bg: { 
    flex: 1, 
    backgroundColor: "#F5F7FF" 
  },
  container: { 
    flex: 1, 
    backgroundColor: "transparent" 
  },
  contentContainer: {
    paddingBottom: 24,
    alignItems: "center", // 가운데 정렬 (웹에서 좌우 여백 방지)
  },
  phone: {
    width: PHONE_WIDTH,
    paddingBottom: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markAllReadContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  markAllReadBtn: {
    backgroundColor: "#6B86FF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  markAllReadText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: '700',
  },
  notificationList: { 
    paddingHorizontal: 12, 
    marginTop: 8 
  },
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