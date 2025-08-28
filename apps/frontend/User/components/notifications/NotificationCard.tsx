import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { BellIcon, CalendarIcon, ScholarshipIcon } from "../shared/icons";
import Svg, { Path, Circle } from "react-native-svg";

export type NotificationItem = {
  id: string;
  type: "scholarship" | "schedule" | "deadline";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionLabel: string;
  actionRoute: string;
};

export const NotificationCard = ({ 
  notification, 
  onMarkAsRead 
}: { 
  notification: NotificationItem;
  onMarkAsRead?: (id: string) => void;
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case "scholarship":
        return <ScholarshipIcon size={24} style={{ opacity: 0.8 }} />;
      case "schedule":
        return <CalendarIcon size={24} style={{ opacity: 0.8 }} />;
      case "deadline":
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={10} stroke="#E36464" strokeWidth={1.8} />
            <Path d={`M12 6v6l4 2`} stroke="#E36464" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );
      default:
        return <BellIcon size={24} />;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case "scholarship":
        return "#6B86FF";
      case "schedule":
        return "#5EC3A2";
      case "deadline":
        return "#E36464";
      default:
        return "#9AA7C8";
    }
  };

  const getTypeLabel = () => {
    switch (notification.type) {
      case "scholarship":
        return "장학금";
      case "schedule":
        return "일정";
      case "deadline":
        return "마감임박";
      default:
        return "알림";
    }
  };

  const handlePress = async () => {
    // 읽지 않은 알림인 경우 읽음 처리 (실패해도 네비게이션은 계속 진행)
    if (!notification.isRead && onMarkAsRead) {
      try {
        await onMarkAsRead(notification.id);
      } catch (error) {
        console.warn('알림 읽음 처리 실패:', error);
        // 읽음 처리 실패해도 네비게이션은 계속 진행
      }
    }
    router.push(notification.actionRoute);
  };

  return (
    <LinearGradient
      colors={notification.isRead ? ["#F8FAFC", "#FFFFFF"] : ["#EEF3FF", "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={[styles.typeLabel, { color: getTypeColor() }]}>
              {getTypeLabel()}
            </Text>
            <Text style={styles.timestamp}>{notification.timestamp}</Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
        </View>
        {!notification.isRead && <View style={styles.unreadDot} />}
      </View>

      <Text style={styles.message} numberOfLines={2}>
        {notification.message}
      </Text>

      <TouchableOpacity style={styles.actionButton} onPress={handlePress} activeOpacity={0.8}>
        <Text style={[styles.actionText, { color: getTypeColor() }]}>
          {notification.actionLabel}
        </Text>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Path d="M9 18l6-6-6-6" stroke={getTypeColor()} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#B2C4FF",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F2F6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  timestamp: {
    fontSize: 11,
    color: "#A0A9C1",
    fontWeight: "600",
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2C3E66",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6B86FF",
    marginLeft: 8,
    marginTop: 4,
  },
  message: {
    fontSize: 13,
    color: "#5A6B8C",
    lineHeight: 18,
    marginBottom: 12,
    fontWeight: "600",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E7ECFF",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "800",
  },
});