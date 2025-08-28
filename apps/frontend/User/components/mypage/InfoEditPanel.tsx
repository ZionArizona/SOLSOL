import React, { useState, useEffect } from "react";
import { View, TextInput, Text, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PrimaryButton } from "../scholarship/PrimaryButton";
import { userApi, UserInfo, UserInfoUpdateRequest } from "../../services/user.api";

export const InfoEditPanel = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userName, setUserName] = useState("");
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // 사용자 정보 로드
  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const info = await userApi.getMyInfo();
      if (info) {
        setUserInfo(info);
        setUserName(info.userName || "");
        setGrade(info.grade?.toString() || "");
      } else {
        Alert.alert("오류", "사용자 정보를 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("사용자 정보 로드 실패:", error);
      Alert.alert("오류", "사용자 정보 로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleSave = async () => {
    if (!userInfo) return;

    try {
      setLoading(true);
      const updateData: UserInfoUpdateRequest = {};
      
      // 변경된 항목만 포함
      if (userName !== userInfo.userName) {
        updateData.userName = userName;
      }
      if (grade !== userInfo.grade?.toString()) {
        updateData.grade = parseInt(grade) || userInfo.grade;
      }

      // 변경사항이 없으면 리턴
      if (Object.keys(updateData).length === 0) {
        Alert.alert("알림", "변경된 정보가 없습니다.");
        return;
      }

      const updatedInfo = await userApi.updateMyInfo(updateData);
      if (updatedInfo) {
        setUserInfo(updatedInfo);
        Alert.alert("성공", "정보가 성공적으로 수정되었습니다.");
      } else {
        Alert.alert("오류", "정보 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("정보 수정 실패:", error);
      Alert.alert("오류", "정보 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) {
    return (
      <LinearGradient colors={["#EEF2FF", "#FFFFFF"]} style={styles.card}>
        <Text style={styles.title}>내 정보 수정</Text>
        <Text style={styles.loadingText}>정보를 불러오는 중...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#EEF2FF", "#FFFFFF"]} style={styles.card}>
      <Text style={styles.title}>내 정보 수정</Text>
      
      {userInfo && (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.label}>학번</Text>
            <Text style={styles.readOnlyValue}>{userInfo.userNm}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>아이디</Text>
            <Text style={styles.readOnlyValue}>{userInfo.userId}</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>이름</Text>
            <TextInput 
              style={styles.input} 
              value={userName} 
              onChangeText={setUserName} 
              placeholder="이름을 입력하세요"
              editable={!loading}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>학년</Text>
            <TextInput 
              style={styles.input} 
              value={grade} 
              onChangeText={setGrade} 
              placeholder="학년을 입력하세요"
              keyboardType="numeric"
              editable={!loading}
            />
          </View>

          <PrimaryButton 
            label={loading ? "저장 중..." : "저장"} 
            onPress={handleSave} 
            style={{ marginTop: 16 }}
            disabled={loading}
          />
        </>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: { margin: 12, borderRadius: 16, padding: 14, shadowColor: "#B2C4FF", shadowOpacity: 0.2, shadowRadius: 10, elevation: 2 },
  title: { fontWeight: "900", color: "#2C3E66", marginBottom: 16, fontSize: 16 },
  loadingText: { color: "#7C89A6", textAlign: "center", paddingVertical: 20 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingVertical: 8 },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "600", color: "#2C3E66", marginBottom: 4 },
  readOnlyValue: { fontSize: 14, color: "#7C89A6", fontWeight: "500" },
  input: { backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: "#E5E8F0" },
});
