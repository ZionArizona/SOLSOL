import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const ScholarshipProgressCard = ({
  scholarship,
  onPress,
}: {
  scholarship: { title: string; amount: string; date: string; steps: string[]; currentStep: number; status: string; rejectionReason?: string };
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={["#F2F5FF", "#FFFFFF"]} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>{scholarship.title}</Text>
        <Text style={styles.status}>{scholarship.status}</Text>
      </View>
      <Text style={styles.amount}>{scholarship.amount}</Text>
      <Text style={styles.date}>{scholarship.date}</Text>

      {/* 프로그레스바 */}
      <View style={styles.progressRow}>
        {scholarship.steps.map((step, idx) => (
          <View key={idx} style={styles.step}>
            <View
              style={[
                styles.circle,
                idx < scholarship.currentStep ? styles.circleDone : styles.circlePending,
              ]}
            />
            <Text style={styles.stepLabel}>{step}</Text>
          </View>
        ))}
      </View>

      {/* 반려 사유 표시 */}
      {scholarship.status === "불합격" && scholarship.rejectionReason && (
        <View style={styles.rejectionReasonContainer}>
          <Text style={styles.rejectionReasonLabel}>반려 사유:</Text>
          <Text style={styles.rejectionReasonText}>{scholarship.rejectionReason}</Text>
        </View>
      )}

      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { margin: 12, padding: 16, borderRadius: 16, shadowColor: "#B2C4FF", shadowOpacity: 0.2, shadowRadius: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  title: { fontWeight: "900", fontSize: 16, color: "#2C3E66" },
  status: { fontSize: 13, fontWeight: "700", color: "#6B86FF" },
  amount: { fontSize: 14, fontWeight: "700", color: "#6B86FF" },
  date: { fontSize: 12, color: "#7C89A6", marginBottom: 12 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 8 },
  step: { alignItems: "center", flex: 1 },
  circle: { width: 14, height: 14, borderRadius: 7, marginBottom: 4 },
  circleDone: { backgroundColor: "#6B86FF" },
  circlePending: { backgroundColor: "#D3DAEE" },
  stepLabel: { fontSize: 10, color: "#2C3E66" },
  success: { marginTop: 8, fontSize: 12, color: "#2C3E66" },
  rejectionReasonContainer: { marginTop: 12, padding: 12, backgroundColor: "#FFF3CD", borderRadius: 8, borderLeftWidth: 3, borderLeftColor: "#F59E0B" },
  rejectionReasonLabel: { fontSize: 12, fontWeight: "700", color: "#92400E", marginBottom: 4 },
  rejectionReasonText: { fontSize: 12, color: "#92400E", lineHeight: 16 },
});
