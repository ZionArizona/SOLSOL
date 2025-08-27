import React, { useState, useMemo } from "react";
import { ImageBackground, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import BG from "../../assets/images/SOLSOLBackground.png";
import { TopBar } from "../../components/scholarship/TopBar";
import { NotificationTabs } from "../../components/notifications/NotificationTabs";
import { NotificationCard, NotificationItem } from "../../components/notifications/NotificationCard";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<string>("전체");

  // 샘플 알림 데이터
  const notifications = useMemo<NotificationItem[]>(() => [
    {
      id: "1",
      type: "scholarship",
      title: "새로운 장학금이 등록되었습니다",
      message: "성적우수 장학금 (50만원)이 새로 등록되었습니다. 지금 신청해보세요!",
      timestamp: "2시간 전",
      isRead: false,
      actionLabel: "장학금 보기",
      actionRoute: "/Scholarship/ScholarshipDetail"
    },
    {
      id: "2", 
      type: "schedule",
      title: "일정 알림",
      message: "내일(12/16) 장학금 면접이 예정되어 있습니다.",
      timestamp: "5시간 전",
      isRead: false,
      actionLabel: "일정 확인",
      actionRoute: "/Schedule/MyCalendar"
    },
    {
      id: "3",
      type: "deadline",
      title: "신청 마감 임박",
      message: "찜한 '학업장려 장학금' 신청 마감까지 3일 남았습니다.",
      timestamp: "1일 전",
      isRead: true,
      actionLabel: "신청하기",
      actionRoute: "/Scholarship/ScholarshipApplyForm"
    },
    {
      id: "4",
      type: "scholarship",
      title: "새로운 장학금이 등록되었습니다", 
      message: "저소득층 지원 장학금 (100만원)이 새로 등록되었습니다.",
      timestamp: "2일 전",
      isRead: true,
      actionLabel: "장학금 보기",
      actionRoute: "/Scholarship/ScholarshipDetail"
    },
    {
      id: "5",
      type: "schedule", 
      title: "일정 완료",
      message: "장학금 서류 제출이 완료되었습니다.",
      timestamp: "3일 전",
      isRead: true,
      actionLabel: "내역 확인",
      actionRoute: "/MyScholarship/MyScholarship"
    },
    {
      id: "6",
      type: "deadline",
      title: "신청 마감 임박",
      message: "찜한 '교내 근로 장학금' 신청 마감까지 1일 남았습니다.",
      timestamp: "1주일 전",
      isRead: true,
      actionLabel: "신청하기", 
      actionRoute: "/Scholarship/ScholarshipApplyForm"
    }
  ], []);

  const filteredNotifications = notifications.filter(notification => {
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

  return (
    <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }}>
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
            {filteredNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  phone: { width: 360, paddingVertical: 8 },
  notificationList: { paddingHorizontal: 12, marginTop: 8 },
});