import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export const NavBar = ({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: { key: string; label: string }[];
  activeTab: string;
  onChange: (key: string) => void;
}) => {
  return (
    <View style={styles.wrap}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.active]}
          onPress={() => onChange(tab.key)}
        >
          <Text style={[styles.label, activeTab === tab.key && styles.activeLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    marginTop: 10,
    marginHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#E7ECFF",
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  active: { backgroundColor: "#6B86FF" },
  label: { fontWeight: "700", color: "#2C3E66", fontSize: 13 },
  activeLabel: { color: "#fff" },
});
