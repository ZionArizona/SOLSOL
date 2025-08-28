import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { applicationApi, Application } from "../../services/application.api";
import { router } from "expo-router";

export const MyScholarshipsPanel = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationApi.getMyApplications();
      setApplications(data || []);
    } catch (error) {
      console.error("신청 내역 로드 실패:", error);
      Alert.alert("오류", "신청 내역을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationPress = (application: Application) => {
    // 장학금 상세보기로 이동 (scholarshipNm을 사용)
    router.push(`/Scholarship/ScholarshipDetail?id=${application.scholarshipNm}`);
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'APPROVED':
        return '#4CAF50';
      case 'REJECTED':
        return '#F44336';
      case 'PENDING':
      default:
        return '#FF9800';
    }
  };

  const getStatusText = (state: string) => {
    switch (state) {
      case 'APPROVED':
        return '승인됨';
      case 'REJECTED':
        return '거절됨';
      case 'PENDING':
      default:
        return '심사중';
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#EAF2FF", "#FFFFFF"]} style={styles.card}>
        <Text style={styles.title}>신청 장학금</Text>
        <Text style={styles.loadingText}>불러오는 중...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#EAF2FF", "#FFFFFF"]} style={styles.card}>
      <Text style={styles.title}>신청 장학금</Text>
      
      {applications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>신청한 장학금이 없습니다.</Text>
          <TouchableOpacity 
            style={styles.goToScholarshipButton}
            onPress={() => router.push("/Scholarship/ScholarshipApply")}
          >
            <Text style={styles.goToScholarshipText}>장학금 둘러보기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        applications.map((app, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.applicationCard}
            onPress={() => handleApplicationPress(app)}
            activeOpacity={0.7}
          >
            <View style={styles.applicationHeader}>
              <Text style={styles.scholarshipName} numberOfLines={1}>
                {app.scholarshipName || `장학금 ${app.scholarshipNm}`}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(app.state) }]}>
                <Text style={styles.statusText}>{getStatusText(app.state)}</Text>
              </View>
            </View>
            <View style={styles.applicationInfo}>
              <Text style={styles.applicationDate}>신청일: {app.appliedAt?.split('T')[0] || 'N/A'}</Text>
              {app.reason && (
                <Text style={styles.applicationReason} numberOfLines={2}>
                  사유: {app.reason}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: { margin: 12, borderRadius: 16, padding: 14, shadowColor: "#B2C4FF", shadowOpacity: 0.2, shadowRadius: 10, elevation: 2 },
  title: { fontWeight: "900", color: "#2C3E66", marginBottom: 16, fontSize: 16 },
  loadingText: { color: "#7C89A6", textAlign: "center", paddingVertical: 20 },
  emptyContainer: { alignItems: "center", paddingVertical: 30 },
  emptyText: { color: "#7C89A6", marginBottom: 16, fontSize: 14 },
  goToScholarshipButton: { backgroundColor: "#4A90E2", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  goToScholarshipText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  applicationCard: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: "#E5E8F0" },
  applicationHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  scholarshipName: { flex: 1, color: "#2C3E66", fontWeight: "700", fontSize: 14, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  applicationInfo: { marginTop: 4 },
  applicationDate: { color: "#7C89A6", fontSize: 12, marginBottom: 4 },
  applicationReason: { color: "#666", fontSize: 12, fontStyle: "italic" },
});
