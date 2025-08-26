import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

type Item = { id: string; title: string; due: string };
type Props = { items: Item[] };

export const ThisWeekList = ({ items }: Props) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>이번주 장학금 목록</Text>

      {items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>이번 주 등록된 장학금이 없습니다.</Text>
        </View>
      ) : (
        items.map((it) => (
          <View key={it.id} style={styles.row}>
            <Text style={styles.itemTitle}>{it.title}</Text>
            <Text style={styles.due}>{it.due}</Text>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
  },
  title: { fontSize: 14, fontWeight: "800", color: "#1E2B4B", marginBottom: 8 },
  emptyBox: {
    height: 90,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6ECFF",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { color: "#7A89A6" },
  row: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEF2FF",
  },
  itemTitle: { fontWeight: "700", color: "#1E2B4B" },
  due: { marginTop: 2, color: colors.muted, fontSize: 12 },
});
