import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ChevronLeftIcon, HomeIcon, MenuIcon } from "../shared/icons";
import { NotificationBell } from "../shared/NotificationBell";
import { deviceInfo } from "../../styles/responsive";

export const TopBar = ({ title, onBackPress }: { title: string; onBackPress?: () => void }) => {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      console.log('Back button pressed, can go back:', router.canGoBack());
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push("/");
      }
    }
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity activeOpacity={0.8} onPress={handleBackPress}>
        <ChevronLeftIcon size={deviceInfo.isTablet ? 26 : 22} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.actions}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/")}>
          <HomeIcon size={deviceInfo.isTablet ? 24 : 20} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/Menu/Menu")}>
          <MenuIcon size={deviceInfo.isTablet ? 24 : 20} />
        </TouchableOpacity>
        <NotificationBell size={deviceInfo.isTablet ? 24 : 20} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: deviceInfo.isTablet ? 20 : 14,
    paddingVertical: deviceInfo.isTablet ? 14 : 10,
  },
  title: { 
    flex: 1, 
    textAlign: "center", 
    fontWeight: "800", 
    fontSize: deviceInfo.isTablet ? 20 : 16, 
    color: "#23324D" 
  },
  actions: { 
    flexDirection: "row", 
    gap: deviceInfo.isTablet ? 14 : 10 
  },
});
