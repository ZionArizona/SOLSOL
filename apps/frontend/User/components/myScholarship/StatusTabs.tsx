import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export const StatusTabs = ({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (key: string) => void;
}) => {
  return (
    <View style={styles.wrap}>
      {tabs.map((tab) => (
        <TouchableOpacity key={tab} style={[styles.tab, active === tab && styles.active]} onPress={() => onChange(tab)}>
          <Text style={[styles.label, active === tab && styles.activeLabel]}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", marginHorizontal: 12, marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  active: { borderBottomColor: "#6B86FF" },
  label: { fontSize: 13, fontWeight: "600", color: "#2C3E66" },
  activeLabel: { color: "#6B86FF", fontWeight: "800" },
});
