import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PrimaryButton } from "../scholarship/PrimaryButton";

export const InfoEditPanel = () => {
  const [name, setName] = useState("김소연");
  const [dept, setDept] = useState("컴퓨터공학과");

  return (
    <LinearGradient colors={["#EEF2FF", "#FFFFFF"]} style={styles.card}>
      <Text style={styles.title}>내 정보 수정</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="이름" />
      <TextInput style={styles.input} value={dept} onChangeText={setDept} placeholder="학과" />

      <PrimaryButton label="저장" onPress={() => console.log("정보 저장", { name, dept })} style={{ marginTop: 10 }} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: { margin: 12, borderRadius: 16, padding: 14, shadowColor: "#B2C4FF", shadowOpacity: 0.2, shadowRadius: 10, elevation: 2 },
  title: { fontWeight: "900", color: "#2C3E66", marginBottom: 8 },
  input: { backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginTop: 6 },
});
