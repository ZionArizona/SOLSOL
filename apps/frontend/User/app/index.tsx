import { useEffect, useState } from 'react';
import { ImageBackground, Platform, ScrollView, StatusBar, StyleSheet, View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import HeaderBar from './UserBasic/HeaderBar';
import LoginPage from './UserBasic/LoginPage';
import MainPage from './MainPage';
import MyCalendar from './Schedule/MyCalendar';
import { useAuth } from '../contexts/AuthContext';

export default function App() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    // 로그인 상태이면 로그 출력 (디버깅용)
    if (isAuthenticated && user) {
      console.log('✅ 자동 로그인 완료:', user.userName);
    }
  }, [isAuthenticated, user]);

  const handleLoginIconPress = () => {
    setShowLoginPage(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginPage(false);
    // AuthContext가 자동으로 상태를 업데이트하므로 별도 체크 불필요
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#8FA1FF" />
      </View>
    );
  }

  // MyCalendar 페이지 표시
  if (showCalendar) {
    return <MyCalendar onBack={() => setShowCalendar(false)} />;
  }

  // 로그인 된 상태면 MainPage.tsx로 자동 이동
  if (isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar translucent={false} backgroundColor={'#ffffff'} barStyle="dark-content" />
        
        {/* 캘린더로 이동하는 버튼 추가 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.calendarButton} 
            onPress={() => {
              console.log('캘린더 버튼 클릭됨');
              setShowCalendar(true);
            }}
          >
            <Text style={styles.calendarButtonText}>📅 내 캘린더 보기</Text>
          </TouchableOpacity>
        </View>
        
        <MainPage onLogout={handleLogout} />
      </View>
    );
  }

  // 로그인 페이지 표시 (토큰이 없을 때 기본적으로 표시)
  if (showLoginPage) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onBack={() => setShowLoginPage(false)} />;
  }

  // 로그인 안 된 상태면 LoginPage로 자동 이동
  return <LoginPage onLoginSuccess={handleLoginSuccess} onBack={() => {}} />;
}


const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0},
  background: { flex: 1, justifyContent: 'flex-start', alignItems: 'stretch'},
  centerContent: { justifyContent: 'center', alignItems: 'center'},
  buttonContainer: { position: 'absolute', top: 100, right: 20, zIndex: 999, elevation: 999},
  calendarButton: {
    backgroundColor: '#FF6B6B',  // 빨간색으로 변경해서 더 눈에 띄게
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 999,
  },
  calendarButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold'},
});