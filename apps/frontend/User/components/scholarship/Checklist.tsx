import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle } from "react-native-svg";

type Item = { id: string; label: string; done: boolean };

export const Checklist = ({ title, items }: { title: string; items: Item[] }) => {
  return (
    <LinearGradient colors={["#E7ECFF", "#F4F7FF"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.card}>
      <View style={styles.header}>
        <Svg width={16} height={16} viewBox="0 0 24 24">
          <Path d="M9 12l2 2 4-4" stroke="#26C281" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          <Circle cx="12" cy="12" r="9" stroke="#26C281" strokeWidth={2} fill="none"/>
        </Svg>
        <Text style={styles.title}>{title}</Text>
      </View>

      {items.map((it) => (
        <View key={it.id} style={styles.row}>
          <Svg width={16} height={16} viewBox="0 0 24 24">
            {it.done ? (
              <>
                <Path d="M9 12l2 2 4-4" stroke="#26C281" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                <Circle cx="12" cy="12" r="9" stroke="#26C281" strokeWidth={2} fill="none"/>
              </>
            ) : (
              <Circle cx="12" cy="12" r="9" stroke="#C9D2EA" strokeWidth={2} fill="none"/>
            )}
          </Svg>
          <Text style={[styles.item, !it.done && styles.dim]}>{it.label}</Text>
        </View>
      ))}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: { marginHorizontal: 12, marginTop: 10, borderRadius: 16, padding: 14,
    shadowColor: "#B2C4FF", shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  title: { fontWeight: "900", color: "#2C3E66" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  item: { color: "#2C3E66", fontWeight: "800" },
  dim: { color: "#9BA6BF" },
});
