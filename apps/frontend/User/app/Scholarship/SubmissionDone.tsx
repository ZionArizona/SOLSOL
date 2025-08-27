import React, { useState, useEffect } from "react";
import { ImageBackground, ScrollView, StatusBar, StyleSheet, View, Text, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import BG from "../../assets/images/SOLSOLBackground.png";
import { TopBar } from "../../components/scholarship/TopBar";
import { ConfirmInfoTable } from "../../components/scholarship/ConfirmInfoTable";
import { PrimaryButton } from "../../components/scholarship/PrimaryButton";
import Svg, { Circle, Path } from "react-native-svg";
import { scholarshipApi, Scholarship } from "../../services/scholarship.api";

export default function SubmissionDone() {
  const { scholarshipId } = useLocalSearchParams<{ scholarshipId?: string }>();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadScholarship = async () => {
      if (!scholarshipId) return;
      
      try {
        setLoading(true);
        const scholarshipData = await scholarshipApi.getScholarship(parseInt(scholarshipId));
        if (scholarshipData) {
          setScholarship(scholarshipData);
        }
      } catch (error) {
        console.error('장학금 정보 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScholarship();
  }, [scholarshipId]);

  const formatDateTime = (date: Date) => {
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
        <StatusBar barStyle="dark-content" />
        <View style={[{ justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color="#6B86FF" />
        </View>
      </ImageBackground>
    );
  }
  return (
    <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }}>
        <View style={styles.phone}>
          <TopBar title="장학금 신청" />

          {/* 메인 그라데이션 카드 */}
          <LinearGradient
            colors={["#EAF0FF", "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.bigCard}
          >
            {/* 체크 아이콘 */}
            <View style={styles.checkWrap}>
              <Svg width={64} height={64} viewBox="0 0 64 64">
                <Circle cx="32" cy="32" r="32" fill="#2AC680" />
                <Path
                  d="M20 33.5l7.2 7.2L44 23.9"
                  stroke="#fff"
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>

            <Text style={styles.bigTitle}>제출 완료!</Text>
            <Text style={styles.subText}>장학금 신청이 성공적으로{'\n'}완료되었습니다.</Text>

            {/* 요약 정보 박스 */}
            <ConfirmInfoTable
              rows={[
                { label: "장학금", value: scholarship?.scholarshipName || "장학금 정보" },
                { label: "신청일시", value: formatDateTime(new Date()) },
                { label: "제출 서류", value: "3개 파일" },
                { label: "심사 기간", value: "3~5일 예상" },
              ]}
              style={{ marginTop: 16 }}
            />

            {/* 확인 버튼 */}
            <PrimaryButton
              label="확인"
              onPress={() => {
                if (scholarshipId) {
                  router.push(`/Scholarship/ScholarshipDetail?id=${scholarshipId}`);
                } else {
                  router.back();
                }
              }}
              style={{ marginTop: 16, minWidth: 200, paddingHorizontal: 40 }}
            />
          </LinearGradient>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  phone: { width: 360, paddingVertical: 8 },
  bigCard: {
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#A8B8FF",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  checkWrap: {
    width: 96,
    height: 96,
    borderRadius: 24,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    shadowColor: "#C6D3FF",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  bigTitle: { fontSize: 20, fontWeight: "900", color: "#1F2A44", marginTop: 2 },
  subText: { textAlign: "center", color: "#7A88A6", fontWeight: "700", marginTop: 6, lineHeight: 20 },
});
