import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MascotPng from "../../assets/images/LoginPageCharacter.png";

export const DetailHeaderCard = ({ title, amount }: { title: string; amount: string }) => {
  return (
    <LinearGradient
      colors={["#C8D6FF", "#EEF4FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.thumb}>
        <LinearGradient
          colors={["#BFD4FF", "#EAF0FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Image source={MascotPng} style={{ width: 56, height: 56 }} resizeMode="contain" />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.amount}>
        {amount} <Text style={{ color: "#7E9BFF" }}>마일리지</Text>
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    shadowColor: "#A8B8FF",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  thumb: {
    width: 92,
    height: 92,
    borderRadius: 20,
    marginBottom: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#9FB6FF",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  title: { fontWeight: "900", fontSize: 18, color: "#1F2A44" },
  amount: { marginTop: 6, fontWeight: "900", fontSize: 16, color: "#5B7BFF" },
});
