import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { userApi, UserInfo } from "../../services/user.api";

export const InfoEditPanel = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
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

  if (initialLoad) {
    return (
      <LinearGradient colors={["#EEF2FF", "#FFFFFF"]} style={styles.card}>
        <Text style={styles.title}>내 정보 확인</Text>
        <Text style={styles.loadingText}>정보를 불러오는 중...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#EEF2FF", "#FFFFFF"]} style={styles.card}>
      <Text style={styles.title}>내 정보 확인</Text>
      
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
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>이름</Text>
            <Text style={styles.readOnlyValue}>{userInfo.userName || '정보 없음'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>학년</Text>
            <Text style={styles.readOnlyValue}>{userInfo.grade ? `${userInfo.grade}학년` : '정보 없음'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>현재 마일리지</Text>
            <Text style={styles.mileageValue}>{userInfo.userMileage?.toLocaleString() || '0'}P</Text>
          </View>
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
  label: { fontSize: 14, fontWeight: "600", color: "#2C3E66" },
  readOnlyValue: { fontSize: 14, color: "#7C89A6", fontWeight: "500" },
  mileageValue: { fontSize: 14, color: "#6B86FF", fontWeight: "700" },
});
