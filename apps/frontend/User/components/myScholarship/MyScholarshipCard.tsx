import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const MyScholarshipCard = ({
  scholarship,
}: {
  scholarship: { id: string; title: string; date: string; status: string };
}) => {
  return (
    <LinearGradient
      colors={["#EAF0FF", "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.row}>
        <Text style={styles.title}>{scholarship.title}</Text>
        <Text style={styles.status}>{scholarship.status}</Text>
      </View>
      <Text style={styles.date}>{scholarship.date}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#B2C4FF",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  title: { fontSize: 15, fontWeight: "700", color: "#2C3E66" },
  status: { fontSize: 12, fontWeight: "800", color: "#6B86FF" },
  date: { fontSize: 12, color: "#7C89A6" },
});
