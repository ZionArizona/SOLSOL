import React from "react";
import { Text, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";

export const PrimaryButton = ({
  label, onPress, disabled, style,
}: { label: string; onPress: () => void; disabled?: boolean; style?: ViewStyle }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    style={[styles.btn, disabled && styles.disabled, style]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.text}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#617BFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#A8B8FF",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  text: { color: "#fff", fontWeight: "900" },
  disabled: { backgroundColor: "#B9C4FF" },
});
