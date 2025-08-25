import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';

// const sbh = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

// 오른쪽 아이콘 거리 계산 (요구사항 고정값)
const LOGIN_RIGHT = 19;                // ChatIcon: 오른쪽 19
// const CHAT_TOP = sbh + 18;            // ChatIcon: 상단(상태바 기준) +22
const LOGIN_TOP = 23;

interface HeaderBarProps {
  onLoginPress: () => void;
}

const HeaderBar = ({ onLoginPress }: HeaderBarProps) => {
  return (
    <View style={styles.root}>
      {/* 왼쪽 로고 + 텍스트 (서로 붙게) */}
      <View style={[styles.leftRow, { top: 5, left: 11 }]}>
        <Image
          source={require('../../assets/images/HanYangIcon.png')}
          style={styles.logo}
        />
        <Text style={styles.title} numberOfLines={1}>한양대학교</Text>
      </View>

      {/* 오른쪽 로그인 아이콘 클릭시 */}
      <TouchableOpacity 
        onPress={onLoginPress}
        style={[styles.loginButton, { top: LOGIN_TOP, right: LOGIN_RIGHT }]}
      >
        <Image
          source={require('../../assets/images/LoginIcon.png')}
          style={styles.login}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    // height: sbh + 80, // 헤더 높이 여유 (필요 시 조절)
    height :80,
    zIndex:10,
    elevation:10,
  },
  leftRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 59,
    height: 59,
    resizeMode: 'contain',
  },
  title: {
    // “이미지 오른쪽면과 바로 붙어” => 여백 0
    marginLeft: 0,
    // 한양대학교 텍스트 크기 조절하는 fontSize
    fontSize: 20,
    fontWeight: '700',
    color: '#444',
  },
  login: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  loginButton: {
    position: 'absolute',
    padding: 4,
  },
});

export default HeaderBar;
