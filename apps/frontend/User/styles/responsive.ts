import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 반응형 너비 계산
export const getResponsiveWidth = () => {
  // 화면 크기에 따른 최적의 너비 계산
  if (screenWidth <= 360) {
    // 작은 화면 (iPhone SE 등)
    return screenWidth - 20; // 양쪽 여백 10px씩
  } else if (screenWidth <= 414) {
    // 중간 화면 (iPhone 12/13 등)
    return Math.min(screenWidth - 40, 380); // 최대 380px
  } else if (screenWidth <= 768) {
    // 큰 폰/작은 태블릿
    return Math.min(screenWidth - 60, 420); // 최대 420px
  } else {
    // 태블릿/데스크톱
    return Math.min(screenWidth * 0.6, 500); // 화면의 60% 또는 최대 500px
  }
};

// 공통 반응형 스타일
export const responsiveStyles = StyleSheet.create({
  // 메인 컨테이너 (기존 phone 스타일 대체)
  container: {
    width: getResponsiveWidth(),
    paddingVertical: 8,
    alignSelf: 'center', // 가운데 정렬
  },
  
  // 태블릿 이상에서 카드형 레이아웃
  cardContainer: {
    width: getResponsiveWidth(),
    paddingVertical: 8,
    alignSelf: 'center',
    backgroundColor: screenWidth > 768 ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    borderRadius: screenWidth > 768 ? 20 : 0,
    marginHorizontal: screenWidth > 768 ? 20 : 0,
    marginVertical: screenWidth > 768 ? 20 : 0,
  },
  
  // ScrollView 컨테이너
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: screenWidth > 768 ? 20 : 0,
  },
  
  // 백그라운드 래퍼 (태블릿에서 다른 스타일)
  backgroundWrapper: {
    flex: 1,
    backgroundColor: '#F5F7FF', // 배경 이미지가 로드되지 않을 때의 fallback 색상
  },
  
  // 태블릿용 중앙 정렬 컨테이너
  centeredWrapper: {
    flex: 1,
    justifyContent: screenWidth > 768 ? 'center' : 'flex-start',
    alignItems: 'center',
    paddingTop: screenWidth > 768 ? 40 : 0,
  },
  
  // 안전한 배경 영역 (노치, 상태바 고려)
  safeBackgroundArea: {
    flex: 1,
    paddingTop: screenWidth > 768 ? 0 : 20, // 상태바 높이 고려
  },
  
  // 전체 화면 배경 컨테이너
  fullScreenBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
});

// 디바이스 타입 체크 유틸리티
export const deviceInfo = {
  isSmallPhone: screenWidth <= 360,
  isMediumPhone: screenWidth > 360 && screenWidth <= 414,
  isLargePhone: screenWidth > 414 && screenWidth <= 768,
  isTablet: screenWidth > 768,
  screenWidth,
  screenHeight,
};

// 반응형 폰트 크기
export const getResponsiveFontSize = (baseSize: number) => {
  const scale = screenWidth / 360; // 360px을 기준으로 스케일링
  const newSize = baseSize * scale;
  
  // 최소/최대 폰트 크기 제한
  return Math.max(12, Math.min(newSize, baseSize * 1.3));
};

// 반응형 여백/패딩
export const getResponsiveSpacing = (baseSpacing: number) => {
  if (screenWidth <= 360) return baseSpacing;
  if (screenWidth <= 414) return baseSpacing * 1.1;
  if (screenWidth <= 768) return baseSpacing * 1.2;
  return baseSpacing * 1.3;
};