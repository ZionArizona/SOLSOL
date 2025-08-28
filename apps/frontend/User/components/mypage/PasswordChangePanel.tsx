import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PrimaryButton } from "../scholarship/PrimaryButton";
import { userApi, PasswordChangeRequest } from "../../services/user.api";

export const PasswordChangePanel = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    // 입력 검증
    if (!currentPassword.trim()) {
      Alert.alert("오류", "현재 비밀번호를 입력해주세요.");
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert("오류", "새 비밀번호를 입력해주세요.");
      return;
    }

    if (newPassword.length < 4) {
      Alert.alert("오류", "새 비밀번호는 4자 이상이어야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("오류", "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert("오류", "현재 비밀번호와 새 비밀번호가 같습니다.");
      return;
    }

    try {
      setLoading(true);
      const passwordData: PasswordChangeRequest = {
        currentPassword,
        newPassword
      };

      const success = await userApi.changePassword(passwordData);
      if (success) {
        Alert.alert("성공", "비밀번호가 성공적으로 변경되었습니다.");
        // 입력 필드 초기화
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Alert.alert("오류", "비밀번호 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("비밀번호 변경 실패:", error);
      Alert.alert("오류", "비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#EEF2FF", "#FFFFFF"]} style={styles.card}>
      <Text style={styles.title}>비밀번호 수정</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>현재 비밀번호</Text>
        <TextInput
          style={styles.input}
          placeholder="현재 비밀번호를 입력하세요"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
          editable={!loading}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>새 비밀번호</Text>
        <TextInput
          style={styles.input}
          placeholder="새 비밀번호를 입력하세요 (4자 이상)"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          editable={!loading}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>비밀번호 확인</Text>
        <TextInput
          style={styles.input}
          placeholder="새 비밀번호를 다시 입력하세요"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!loading}
        />
      </View>

      <PrimaryButton 
        label={loading ? "변경 중..." : "변경하기"} 
        onPress={handleChangePassword} 
        style={{ marginTop: 16 }}
        disabled={loading}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: { margin: 12, borderRadius: 16, padding: 14, shadowColor: "#B2C4FF", shadowOpacity: 0.2, shadowRadius: 10, elevation: 2 },
  title: { fontWeight: "900", color: "#2C3E66", marginBottom: 16, fontSize: 16 },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "600", color: "#2C3E66", marginBottom: 4 },
  input: { backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: "#E5E8F0" },
});
