import React, { useMemo, useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, ImageBackground, View, Platform, Text , TouchableOpacity, ActivityIndicator } from "react-native";
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
import { UserCircleIcon, MenuIcon, BellIcon } from "../../components/shared/icons";
import { useAuth } from "../../contexts/AuthContext";
import { userApi } from "../../services/user.api";
import { mileageApi } from "../../services/mileage.api";

export default function MainPage() {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [mileage, setMileage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleScholarshipPress = () => {
    router.push("/Scholarship/ScholarshipApply");
  };

  // 사용자 정보 및 마일리지 데이터 로드
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        
        // 사용자 정보 가져오기 (실패해도 JWT 토큰 정보 사용)
        try {
          const userData = await userApi.getMyInfo();
          if (userData) {
            setUserInfo(userData);
          }
        } catch (userError) {
          console.log('사용자 정보 API 실패 - JWT 토큰 정보 사용:', userError);
          // JWT 토큰에서 추출한 정보를 사용하므로 별도 처리 불필요
        }

        // 마일리지 정보 가져오기 (실패해도 기본값 사용)
        try {
          const mileageData = await mileageApi.getUserMileage();
          if (mileageData) {
            setMileage(mileageData.availableMileage || 0);
          }
        } catch (mileageError) {
          console.log('마일리지 정보 로드 실패 - 기본값(0) 사용:', mileageError);
          setMileage(0);
        }
      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadUserData();
    }
  }, [user]);

  // 학과 정보 포맷팅
  const getDepartmentInfo = () => {
    if (!userInfo && !user) return "정보 없음";
    
    const info = userInfo || user;
    const dept = info.deptName || info.deptNm || '학과 정보 없음';
    const grade = info.grade ? `재학 ${info.grade}학년` : '';
    
    return grade ? `${dept}, ${grade}` : dept;
  };

  // 사용자 이름 가져오기
  const getUserName = () => {
    if (!userInfo && !user) return "사용자";
    return (userInfo?.userName) || user?.userName || "사용자";
  };

  // 학번 가져오기 (userNm은 실제로는 학번이 아니라 사용자 식별자일 수 있음)
  const getStudentNumber = () => {
    if (!userInfo && !user) return "";
    
    // 백엔드에서 받은 사용자 정보에 학번이 있는지 확인
    if (userInfo?.userNm) {
      return `(${userInfo.userNm})`;
    }
    
    // JWT 토큰에서 추출된 정보 사용 (sub가 학번일 수 있음)
    if (user?.sub && user.sub !== user.userName) {
      return `(${user.sub})`;
    }
    
    return "";
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
          <View style={styles.headerWithProfile}>
            <HeaderSection school={user?.univName || "한양대학교"}/>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={() => router.push("/Menu/Menu")}
                activeOpacity={0.8}
              >
                <MenuIcon size={20} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={() => router.push("/Notifications/Notifications")}
                activeOpacity={0.8}
              >
                <BellIcon size={20} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.profileButton} 
                onPress={() => router.push("/UserBasic/MyPage")}
                activeOpacity={0.8}
              >
                <UserCircleIcon size={20} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.block}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>사용자 정보를 불러오는 중...</Text>
              </View>
            ) : (
              <StudentCard
                name={getUserName()}
                studentNo={getStudentNumber()}
                dept={getDepartmentInfo()}
              />
            )}
          </View>

          
          <View style={styles.block}>
            <Text>Hey Calendar !</Text>
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
              points={mileage}
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
  headerWithProfile: {
    position: "relative",
  },
  headerButtons: {
    position: "absolute",
    right: 18,
    top: 18,
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    padding: 4,
  },
  profileButton: {
    padding: 4,
  },
  loadingContainer: {
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 32,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#9bb3ff",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 3,
  },
  loadingText: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
  },
});
