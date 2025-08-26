import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export const SectionHeader = ({
  title, actionLabel, onPressAction,
}: { title: string; actionLabel?: string; onPressAction?: () => void }) => (
  <View style={styles.row}>
    <Text style={styles.title}>{title}</Text>
    {actionLabel ? (
      <TouchableOpacity onPress={onPressAction} activeOpacity={0.85} style={styles.pill}>
        <Text style={styles.pillText}>{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, marginTop: 6 },
  title: { fontWeight: "900", color: "#2C3E66" },
  pill: { backgroundColor: "#E7ECFF", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  pillText: { color: "#6B86FF", fontWeight: "800", fontSize: 12 },
});
