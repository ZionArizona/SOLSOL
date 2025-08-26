import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const ScholarshipItemCard = ({
  title,
  amount,
  period,
  status,
  onPress,
}: {
  title: string;
  amount: string;
  period: string;
  status: string;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={["#EAF2FF", "#E9F1FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.thumb} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.amount}>
            {amount} <Text style={styles.mile}>마일리지</Text>
          </Text>
          <Text style={styles.period}>신청기간: {period}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{status}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    shadowColor: "#AFC2FF",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#C8D8FF",
  },
  title: { fontWeight: "900", color: "#1F2A44", fontSize: 14 },
  amount: { marginTop: 4, fontWeight: "900", color: "#5A84FF" },
  mile: { fontSize: 12, fontWeight: "900" },
  period: { marginTop: 4, color: "#8391B2", fontWeight: "700", fontSize: 12 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#EDF0FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: { color: "#8B90A8", fontWeight: "900", fontSize: 11 },
});
