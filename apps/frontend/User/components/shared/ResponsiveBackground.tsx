import React, { ReactNode } from 'react';
import { ImageBackground, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BG from '../../assets/images/SOLSOLBackground.png';
import { deviceInfo } from '../../styles/responsive';

interface ResponsiveBackgroundProps {
  children: ReactNode;
  overlay?: boolean; // 태블릿에서 오버레이 그라데이션 추가
  style?: any;
}

export const ResponsiveBackground: React.FC<ResponsiveBackgroundProps> = ({ 
  children, 
  overlay = true,
  style 
}) => {
  if (deviceInfo.isTablet && overlay) {
    // 태블릿에서는 배경 이미지 + 그라데이션 오버레이
    return (
      <ImageBackground 
        source={BG} 
        style={[styles.backgroundWrapper, style]} 
        resizeMode="cover"
        imageStyle={styles.backgroundImage}
      >
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.1)', 
            'rgba(240, 245, 255, 0.15)', 
            'rgba(255, 255, 255, 0.1)'
          ]}
          style={styles.gradientOverlay}
        />
        <View style={styles.contentContainer}>
          {children}
        </View>
      </ImageBackground>
    );
  }
  
  // 스마트폰에서는 기본 배경 이미지
  return (
    <ImageBackground 
      source={BG} 
      style={[styles.backgroundWrapper, style]} 
      resizeMode="cover"
      imageStyle={styles.backgroundImage}
    >
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundWrapper: {
    flex: 1,
  },
  backgroundImage: {
    // 태블릿에서 배경 이미지 최적화
    opacity: deviceInfo.isTablet ? 0.9 : 1,
    // 배경 이미지가 컨테이너보다 작을 때를 대비한 설정
    ...(deviceInfo.isTablet && {
      transform: [{ scale: 1.1 }], // 약간 확대하여 여백 방지
    })
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
});