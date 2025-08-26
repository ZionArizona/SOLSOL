import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const MyScholarshipsPanel = () => {
  const applied = [
    { title: "성적우수 장학금", date: "2025-07-30" },
    { title: "가계곤란 장학금", date: "2025-08-05" },
  ];

  return (
    <LinearGradient colors={["#EAF2FF", "#FFFFFF"]} style={styles.card}>
      <Text style={styles.title}>신청 장학금</Text>
      {applied.map((s, idx) => (
        <View key={idx} style={styles.row}>
          <Text style={styles.sch}>{s.title}</Text>
          <Text style={styles.date}>{s.date}</Text>
        </View>
      ))}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: { margin: 12, borderRadius: 16, padding: 14 },
  title: { fontWeight: "900", color: "#2C3E66", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  sch: { color: "#2C3E66", fontWeight: "700" },
  date: { color: "#7C89A6", fontWeight: "700" },
});
