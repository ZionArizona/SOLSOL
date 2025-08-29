import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ImageBackground, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// theme
import { colors } from "../../theme/colors";

// bg image
import SOLSOLBackground from "../../assets/images/SOLSOLBackground.png";

import { HeaderSection } from "../../components/home/HeaderSection";
import { MileageCard } from "../../components/home/MileageCard";
import { PromoBanner } from "../../components/home/PromoBanner";
import { StudentCard } from "../../components/home/StudentCard";
import { ThisWeekList } from "../../components/home/ThisWeekList";
import { MenuIcon, UserCircleIcon } from "../../components/shared/icons";
import { NotificationBell } from "../../components/shared/NotificationBell";
import { useAuth } from "../../contexts/AuthContext";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { mileageApi } from "../../services/mileage.api";
import { userApi } from "../../services/user.api";

// 학과 매핑 정보
const DEPARTMENT_BY_ID: Record<number, string> = {
  1: '경제학과',
  2: '간호학과',
  3: '디자인학과',
  4: '빅데이터융합학과',
  5: '소프트웨어공학과',
  6: '식품공학과',
  7: '인공지능학과',
  8: '영어교육과',
  9: '컴퓨터공학과',
  10: '화학과',
};

const getDepartmentNameById = (id: number | string | null | undefined): string => {
  if (id === null || id === undefined) return '컴퓨터공학과'; // 기본값 유지
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (!Number.isFinite(numId)) return '컴퓨터공학과';
  return DEPARTMENT_BY_ID[numId as number] ?? '컴퓨터공학과';
};

export default function MainPage() {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [mileage, setMileage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // WebSocket 실시간 알림
  const { unreadCount, isConnected } = useWebSocket();

  const handleScholarshipPress = () => {
    router.push("/Scholarship/ScholarshipApply");
  };

  const handleCalendarPress = () => {
    router.push("/Schedule/MyCalendar");
  };

  // 사용자 정보 및 마일리지 데이터 로드
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        
        let userData = null;
        let mileageValue = 0;
        
        // 사용자 정보 가져오기 (마일리지 포함)
        try {
          userData = await userApi.getMyInfo();
          console.log('🏠 MainPage: User data received:', userData);
          
          if (userData) {
            setUserInfo(userData);
            
            // 사용자 정보에서 직접 마일리지 가져오기
            if (userData.userMileage !== null && userData.userMileage !== undefined) {
              mileageValue = userData.userMileage;
              console.log('🏠 MainPage: Got mileage from user data:', mileageValue);
            }
          }
        } catch (userError) {
          console.log('🏠 MainPage: 사용자 정보 API 실패 - JWT 토큰 정보 사용:', userError);
        }

        // fallback: 사용자 정보에서 마일리지를 못가져왔으면 mileageApi 시도
        if (mileageValue === 0) {
          try {
            console.log('🏠 MainPage: Trying fallback mileage API...');
            const mileageData = await mileageApi.getUserMileage();
            console.log('🏠 MainPage: Fallback mileage data:', mileageData);
            
            if (mileageData && (mileageData.availableMileage || mileageData.totalMileage || mileageData.userMileage)) {
              mileageValue = mileageData.availableMileage || mileageData.totalMileage || mileageData.userMileage || 0;
              console.log('🏠 MainPage: Got mileage from fallback API:', mileageValue);
            }
          } catch (mileageError) {
            console.log('🏠 MainPage: Fallback 마일리지 API도 실패:', mileageError);
          }
        }
        
        console.log('🏠 MainPage: Final mileage value:', mileageValue);
        setMileage(mileageValue);
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



const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const CANDIDATE_KEYS: (keyof any)[] = [
  // 숫자 ID일 가능성 높은 키
  'deptId', 'departmentId', 'dept', 'deptNo', 'majorId',
  // 숫자/문자 섞여 들어오는 키(여기가 포인트!)
  'deptName', 'deptNm',
  // 라벨로 올 수 있는 키
  'departmentName', 'majorName', 'department',
];

const resolveDeptLabel = (info: any): string => {
  for (const key of CANDIDATE_KEYS) {
    const val = info?.[key];

    // 1) 숫자/숫자문자면 -> 매핑
    const n = toNum(val);
    if (n && DEPARTMENT_BY_ID[n]) {
      return DEPARTMENT_BY_ID[n];
    }

    // 2) 문자열 라벨이면 그대로
    if (typeof val === 'string') {
      const s = val.trim();
      if (s.length > 0 && !/^\d+$/.test(s)) {
        // 전부 숫자면 라벨이 아니라고 보고 패스, 아니면 라벨로 간주
        return s;
      }
    }
  }
  return '학과 정보 없음';
};




const getDepartmentInfo = () => {
  if (!userInfo && !user) return "정보 없음";
  const info = userInfo || user;

  const deptName = resolveDeptLabel(info);
  const grade = info?.grade ? `재학 ${info.grade}학년` : '';

  return grade ? `${deptName}, ${grade}` : deptName;
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
              <NotificationBell size={20} />
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
            <PromoBanner
              title={`신청부터 지금까지,\n헤이영 캘린더가\n다 챙겨드려요`}
              ctaLabel="나의 일정 바로가기"
              onPressCTA={handleCalendarPress}
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
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF4D4F',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  connectionIndicator: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#52C41A',
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