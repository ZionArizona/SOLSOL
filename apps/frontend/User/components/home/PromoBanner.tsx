import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";
import { BannerArt } from "../shared/icons";

type Props = {
  title: string;
  ctaLabel: string;
  onPressCTA: () => void;
  page: number;      // 0-based
  total: number;     // e.g. 3
};

export const PromoBanner = ({ title, ctaLabel, onPressCTA, page, total }: Props) => {
  return (
    <LinearGradient
      colors={["#EDF4FF", "#DDE8FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity activeOpacity={0.9} style={styles.cta} onPress={onPressCTA}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>

        <View style={styles.dots}>
          {Array.from({ length: total }).map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
      </View>

      <BannerArt size={96} style={{ marginRight: 6 }} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  banner: {
    marginTop: 10,
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "800", color: "#222", lineHeight: 26 },
  cta: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: "#7aa6ff",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 2,
  },
  ctaText: { fontWeight: "700", color: colors.primary },
  dots: { flexDirection: "row", gap: 6, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 6, backgroundColor: "#C6D5FF" },
  dotActive: { backgroundColor: "#5D87FF" },
});
