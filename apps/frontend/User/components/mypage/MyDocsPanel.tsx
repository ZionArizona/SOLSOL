import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const MyDocsPanel = () => {
  const docs = ["성적증명서.pdf", "재학증명서.pdf"];

  return (
    <LinearGradient colors={["#EAF2FF", "#FFFFFF"]} style={styles.card}>
      <Text style={styles.title}>마이 서류</Text>
      {docs.map((d, idx) => (
        <View key={idx} style={styles.row}>
          <Text style={styles.doc}>{d}</Text>
        </View>
      ))}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: { margin: 12, borderRadius: 16, padding: 14 },
  title: { fontWeight: "900", color: "#2C3E66", marginBottom: 8 },
  row: { paddingVertical: 6 },
  doc: { color: "#2C3E66", fontWeight: "700" },
});
