import React, { useMemo } from "react";
import { ScrollView, StatusBar, StyleSheet, ImageBackground, View, Platform } from "react-native";
import { router } from "expo-router";

// theme
import { colors } from "../../theme/colors";

// bg image
import SOLSOLBackground from "../../assets/images/SOLSOLBackground.png";

import { HeaderSection } from "../../components/home/HeaderSection";
import { StudentCard } from "../../components/home/StudentCard";
import { PromoBanner } from "../../components/home/PromoBanner";
import { MileageCard } from "../../components/home/MileageCard";
import { ThisWeekList } from "../../components/home/ThisWeekList";

export default function MainPage() {
  const points = useMemo(() => 4000, []);

  const handleScholarshipPress = () => {
    router.push("/Scholarship/ScholarshipApply");
  };

  return (
    <ImageBackground source={SOLSOLBackground} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* 📱 모바일 폭 고정 컨테이너 */}
        <View style={styles.phone}>
          <HeaderSection school="한양대학교"/>

          <View style={styles.block}>
            <StudentCard
              name="김소연"
              studentNo="(1312967)"
              dept="컴퓨터공학과, 재학 4학년"
            />
          </View>

          
          <View style={styles.block}>
            <p>Hey Calendar !</p>
            <PromoBanner
              title={`신청부터 지금까지,\n헤이영 캘린더가\n다 챙겨드려요`}
              ctaLabel="나의 일정 바로가기"
              onPressCTA={() => {}}
              page={0}
              total={3}
            />
          </View>

          <View style={styles.block}>
            <MileageCard
              label="회원님의 현재 마일리지는"
              points={points}
              onPressScholar={handleScholarshipPress}
            />
          </View>

          <View style={[styles.block, { marginBottom: 20 }]}>
            <ThisWeekList items={[]} />
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const PHONE_WIDTH = 360; // 피그마 기준: 360~390 중 원하는 값

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bgFallback },
  container: { flex: 1, backgroundColor: "transparent" },
  contentContainer: {
    paddingBottom: 24,
    alignItems: "center", // 가운데 정렬 (웹에서 좌우 여백 방지)
  },
  phone: {
    width: PHONE_WIDTH,
    // iOS/Android와 Web 모두에서 카드 느낌
    paddingBottom: 16,
  },
  block: {
    // 각 섹션 사이 간격 (피그마 느낌의 세로 간격)
    marginTop: 12,
  },
});
