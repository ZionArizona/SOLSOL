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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginHorizontal: 12,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 4,
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