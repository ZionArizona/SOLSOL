import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LoginMascot from "../../assets/images/LoginPageCharacter.png";


export const MileagePanel = ({ points }: { points: number }) => {
  return (
    <LinearGradient
      colors={["#BFD4FF", "#EAF0FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.caption}>회원님의 현재 마일리지는</Text>
        <Text style={styles.point}>
          {points.toLocaleString()} <Text style={styles.px}>P</Text>
        </Text>
      </View>

      {/* PNG 마스코트 이미지 */}
      <Image source={LoginMascot} style={styles.mascot} resizeMode="contain" />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#9fb6ff",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  caption: { color: "#2C3E66", fontWeight: "700" },
  point: { fontSize: 28, fontWeight: "900", color: "#1F2A44", marginTop: 2 },
  px: { fontSize: 14, fontWeight: "900" },
  mascot: {
    width: 64,
    height: 64,
  },
});
