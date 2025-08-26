import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const SelectMock = ({ label }: { label: string }) => {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <Text style={styles.placeholder}>선택</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { width: "48%" },
  label: { fontSize: 12, color: "#2E3C5C", opacity: 0.9, marginBottom: 6, fontWeight: "700" },
  field: {
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D8E0FF",
    justifyContent: "center",
    paddingHorizontal: 10,
    shadowColor: "#B4C4FF",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  placeholder: { color: "#7C89A6", fontWeight: "700" },
});
