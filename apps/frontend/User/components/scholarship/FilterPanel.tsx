import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SelectMock } from "./parts/SelectMock";

export const FilterPanel = () => {
  return (
    <LinearGradient
      colors={["#D6DDF0", "#E8ECF7"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.grid}>
        <SelectMock label="단과대학" />
        <SelectMock label="학교" />
        <SelectMock label="카테고리" />
        <SelectMock label="학년" />
        <SelectMock label="지원유형" />
        <SelectMock label="지급(환수)여부" />
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity style={[styles.btn, styles.primary]}>
          <Text style={[styles.btnText, { color: "#fff" }]}>필터 적용</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.ghost]}>
          <Text style={[styles.btnText, { color: "#6576A2" }]}>초기화</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 10,
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#9fb6ff",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  btnRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  primary: {
    backgroundColor: "#6B86FF",
  },
  ghost: {
    backgroundColor: "#E7EBFF",
  },
  btnText: { fontWeight: "800" },
});
