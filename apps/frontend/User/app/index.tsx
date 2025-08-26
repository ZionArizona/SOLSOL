// app/index.tsx
import React from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  Platform,
  ImageBackground,
} from 'react-native';
import MainPage from './UserBasic/MainPage';

// ✅ 지금은 디자인 확인을 위해 MainPage만 렌더링합니다.
//    나중에 백엔드 연동/인증 분기를 복구하는 템플릿은
//    파일 하단의 주석을 참고하세요.

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar translucent={false} backgroundColor="#ffffff" barStyle="dark-content" />
      <ImageBackground
        source={require('../assets/images/SOLSOLBackground.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <MainPage />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  background: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
});

/* ─────────────────────────────────────────────────────────────
   🔁 나중에 복구용 템플릿 (백엔드 연동/인증 분기)
   필요할 때 아래를 참고해 기존 분기를 되살리세요.

import { useEffect, useState } from 'react';
import {
  View, StatusBar, StyleSheet, Platform, ImageBackground,
  ActivityIndicator, TouchableOpacity, Text
} from 'react-native';
import HeaderBar from './UserBasic/HeaderBar';
import LoginPage from './UserBasic/LoginPage';
import MyCalendar from './MyCalendar';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) console.log('✅ 자동 로그인 완료:', user.userName);
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent:'center', alignItems:'center' }]}>
        <ActivityIndicator size="large" color="#8FA1FF" />
      </View>
    );
  }

  if (showCalendar) return <MyCalendar onBack={() => setShowCalendar(false)} />;

  return (
    <View style={styles.container}>
      <StatusBar translucent={false} backgroundColor="#ffffff" barStyle="dark-content" />
      <View style={{ position:'absolute', top:100, right:20, zIndex:999, elevation:999 }}>
        <TouchableOpacity
          style={{
            backgroundColor:'#FF6B6B', paddingHorizontal:25, paddingVertical:15,
            borderRadius:30, borderWidth:2, borderColor:'#fff',
            shadowColor:'#000', shadowOffset:{ width:0, height:4 }, shadowOpacity:0.3, shadowRadius:5, elevation:999
          }}
          onPress={() => setShowCalendar(true)}
        >
          <Text style={{ color:'#fff', fontSize:18, fontWeight:'bold' }}>📅 내 캘린더 보기</Text>
        </TouchableOpacity>
      </View>

      <ImageBackground source={require('../assets/images/SOLSOLBackground.png')} style={styles.background} resizeMode="cover">
        {isAuthenticated ? (
          <MainPage />
        ) : showLoginPage ? (
          <LoginPage onLoginSuccess={() => setShowLoginPage(false)} onBack={() => setShowLoginPage(false)} />
        ) : (
          <HeaderBar onLoginPress={() => setShowLoginPage(true)} />
        )}
      </ImageBackground>
    </View>
  );
}
───────────────────────────────────────────────────────────── */
