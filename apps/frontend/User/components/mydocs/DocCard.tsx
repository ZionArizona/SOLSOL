import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export type DocItem = {
  id: string;
  fileName: string;
  category: "성적증명" | "자격증" | "어학" | "기타";
  size: string;
  uploadedAt: string;
  metaTags: string[];  // 아래 작은 칩들
  status: "사용가능" | "만료임박" | "검토중";
  usageCount: number;
  colorKey?: "grade" | "license" | "lang" | "etc";
};

export const DocCard = ({ item }: { item: DocItem }) => {
  const color = {
    grade: "#6B86FF",
    license: "#5EC3A2",
    lang: "#6AA8FF",
    etc: "#9AA7C8",
  }[item.colorKey || "etc"];

  return (
    <LinearGradient colors={["#EEF3FF", "#FFFFFF"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.card}>
      {/* 파일명 */}
      <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>

      {/* 상단 라벨 줄 */}
      <View style={styles.metaRow}>
        <Text style={[styles.badge, { backgroundColor: "#E7ECFF", color: "#6B86FF" }]}>{item.category}</Text>
        <Text style={styles.dim}>· {item.size} · {item.uploadedAt}</Text>
        <View style={[styles.usagePill]}>
          <Text style={styles.usageText}>{item.usageCount}회 사용</Text>
        </View>
      </View>

      {/* progress-like status row */}
      <View style={styles.statusRow}>
        <View style={[styles.dot, { backgroundColor: item.status === "사용가능" ? "#39C07F" : "#F2B14A" }]} />
        <Text style={styles.statusText}>{item.status}</Text>
      </View>

      {/* 태그들 */}
      <View style={styles.tags}>
        {item.metaTags.map((t, idx) => (
          <Text key={idx} style={[styles.tag, { borderColor: color, color }]}>{t}</Text>
        ))}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: "#B2C4FF", shadowOpacity: 0.18, shadowRadius: 10, shadowOffset:{width:0,height:6}, elevation:2
  },
  fileName: { color: "#2C3E66", fontWeight: "900", marginBottom: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: "900" },
  dim: { color: "#7C89A6", fontWeight: "700", flex: 1, marginLeft: 8 },
  usagePill: { backgroundColor: "#EDF0FF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  usageText: { fontSize: 12, color: "#6B86FF", fontWeight: "900" },

  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { color: "#2C3E66", fontWeight: "800" },

  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  tag: { borderWidth: 1.5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: "900" },
});
