import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

export const ConfirmInfoTable = ({
  rows,
  style,
}: {
  rows: { label: string; value: string }[];
  style?: ViewStyle;
}) => {
  return (
    <View style={[styles.box, style]}>
      {rows.map((r, i) => (
        <View key={`${r.label}-${i}`} style={[styles.row, i !== 0 && styles.rowTop]}>
          <Text style={styles.label}>{r.label}</Text>
          <Text style={[styles.value, i === 0 && styles.valueEm]} numberOfLines={1}>
            {r.value}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    padding: 10,
    shadowColor: "#D0D9FF",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  rowTop: { borderTopWidth: 1, borderTopColor: "#EEF2FF" },
  label: { color: "#7C89A6", fontWeight: "800" },
  value: { color: "#2C3E66", fontWeight: "900" },
  valueEm: { color: "#1F2A44" },
});
