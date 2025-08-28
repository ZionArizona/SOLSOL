import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const StoragePanel = ({
  used, capacity, percent, total, reusable, expiring,
}: { used: string; capacity: string; percent: number; total: number; reusable: number; expiring: number }) => {
  return (
    <LinearGradient colors={["#EEF3FF", "#FFFFFF"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.card}>
      <Text style={styles.title}>서류 현황</Text>

      <View style={styles.progressBox}>
        <View style={styles.progressBg}>
          <View style={[styles.progressFg, { width: `${Math.max(0, Math.min(percent, 100))}%` }]} />
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{used} / {capacity}</Text>
          <Text style={styles.progressText}>{percent}% 유효</Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metricItem}>
          <Text style={styles.metricNum}>{total}</Text>
          <Text style={styles.metricLabel}>총 서류</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricNum}>{reusable}</Text>
          <Text style={styles.metricLabel}>유효</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricNum}>{expiring}</Text>
          <Text style={styles.metricLabel}>사용횟수</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: { marginHorizontal: 12, marginTop: 8, borderRadius: 16, padding: 14, shadowColor: "#B2C4FF", shadowOpacity: 0.2, shadowRadius: 10, shadowOffset:{width:0,height:6}, elevation:3 },
  title: { fontWeight: "900", color: "#2C3E66", marginBottom: 10 },
  progressBox: { backgroundColor: "#F6F8FF", borderRadius: 12, padding: 12, marginBottom: 12 },
  progressBg: { height: 10, backgroundColor: "#E3E9FF", borderRadius: 6, overflow: "hidden" },
  progressFg: { height: 10, backgroundColor: "#6B86FF", borderRadius: 6 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  progressText: { fontSize: 12, color: "#6E7A96", fontWeight: "800" },
  metrics: { flexDirection: "row", justifyContent: "space-around", marginTop: 8 },
  metricItem: { alignItems: "center" },
  metricNum: { fontSize: 18, fontWeight: "900", color: "#1F2A44" },
  metricLabel: { fontSize: 12, color: "#7C89A6", fontWeight: "700" },
});
