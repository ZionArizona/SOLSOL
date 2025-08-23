import { useEffect, useState } from 'react';
import { ImageBackground, Platform, ScrollView, StatusBar, StyleSheet, View, ActivityIndicator } from 'react-native';
import HeaderBar from './UserBasic/HeaderBar';
import LoginPage from './UserBasic/LoginPage';
import MainPage from './MainPage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginPage, setShowLoginPage] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const loginStatus = await AsyncStorage.getItem('isLoggedIn');
      
      if (token && loginStatus === 'true') {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginIconPress = () => {
    setShowLoginPage(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginPage(false);
    checkLoginStatus();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // 로그인 된 상태면 MainPage.tsx 표시
  if (isLoggedIn) {
    return <MainPage onLogout={checkLoginStatus} />;
  }

  // 로그인 페이지 표시
  if (showLoginPage) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onBack={() => setShowLoginPage(false)} />;
  }

  // 로그인 안 된 상태의 초기 화면
  return (
    <View style={styles.container}>
        {/* 상태바 설정 => 상단에 시간, 배터리, 와이파이 정보를 수정하기 위한 용도!*/ }
        <StatusBar
          translucent={false}
          backgroundColor={'#ffffff'}
          barStyle="dark-content"
        />

        {/* 이미지 바탕 화면 */}
        <ImageBackground
          source={require('../assets/images/SOLSOLBackground.png')}
          style={styles.background}
          resizeMode="cover" // 화면에 꽉 차게
        >

        <HeaderBar onLoginPress={handleLoginIconPress}/>

        </ImageBackground>
      </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    //StatusBar.translucent=false,
  },
  background: {
    flex: 1,
    justifyContent: 'flex-start', // 중앙 정렬 예시
    alignItems: 'stretch',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});