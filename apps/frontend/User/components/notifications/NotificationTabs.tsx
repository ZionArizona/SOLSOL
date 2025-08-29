import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

export const NotificationTabs = ({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, active === tab && styles.activeTab]}
            onPress={() => onChange(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, active === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginHorizontal: 8,
  },
  scrollView: {
    flexGrow: 0,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#E9EDFF",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1, // 각 탭이 균등하게 공간을 차지
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
    alignItems: "center", // 텍스트 중앙 정렬
  },
  activeTab: {
    backgroundColor: "#6B86FF",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2C3E66",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
});