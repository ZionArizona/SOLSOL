import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PrimaryButton } from "../scholarship/PrimaryButton";

export const PasswordChangePanel = () => {
  const [pw, setPw] = useState("");
  const [newPw, setNewPw] = useState("");

  return (
    <LinearGradient colors={["#EEF2FF", "#FFFFFF"]} style={styles.card}>
      <Text style={styles.title}>비밀번호 수정</Text>
      <TextInput
        style={styles.input}
        placeholder="현재 비밀번호"
        secureTextEntry
        value={pw}
        onChangeText={setPw}
      />
      <TextInput
        style={styles.input}
        placeholder="새 비밀번호"
        secureTextEntry
        value={newPw}
        onChangeText={setNewPw}
      />
      <PrimaryButton label="변경하기" onPress={() => console.log("비밀번호 변경")} style={{ marginTop: 10 }} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: { margin: 12, borderRadius: 16, padding: 14 },
  title: { fontWeight: "900", color: "#2C3E66", marginBottom: 8 },
  input: { backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginTop: 6 },
});
