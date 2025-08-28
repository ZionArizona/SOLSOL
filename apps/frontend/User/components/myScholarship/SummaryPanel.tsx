import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const SummaryPanel = ({
  total,
  inProgress,
  approved,
  benefit,
}: {
  total: number;
  inProgress: number;
  approved: number;
  benefit: number;
}) => {
  return (
    <LinearGradient colors={["#EAF0FF", "#FFFFFF"]} style={styles.card}>
      <Text style={styles.caption}>신청 현황 요약</Text>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.num}>{total}</Text>
          <Text style={styles.label}>총 신청</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.num}>{inProgress}</Text>
          <Text style={styles.label}>심사중</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.num}>{approved}</Text>
          <Text style={styles.label}>합격</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.num}>{benefit}</Text>
          <Text style={styles.label}>수혜금액(마일리지)</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: { margin: 12, padding: 14, borderRadius: 14, shadowColor: "#B2C4FF", shadowOpacity: 0.2, shadowRadius: 10 },
  caption: { fontWeight: "700", marginBottom: 10, color: "#2C3E66" },
  row: { flexDirection: "row", justifyContent: "space-around" },
  item: { alignItems: "center" },
  num: { fontWeight: "900", fontSize: 18, color: "#1F2A44" },
  label: { fontSize: 12, color: "#7C89A6" },
});
