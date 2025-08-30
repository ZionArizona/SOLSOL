import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { BellIcon } from "./icons";
import { useWebSocket } from "../../contexts/WebSocketContext";

interface NotificationBellProps {
  size?: number;
  color?: string;
}

export const NotificationBell = ({ size = 20, color }: NotificationBellProps) => {
  const { unreadCount, isConnected } = useWebSocket();
  
  console.log(`🔔 NotificationBell: unreadCount=${unreadCount}, isConnected=${isConnected}`);

  const handlePress = () => {
    router.push("/Notifications/Notifications");
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.notificationContainer}>
        <BellIcon size={size} color={color} />
        {unreadCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {unreadCount > 99 ? '99+' : unreadCount.toString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF4D4F',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});