import React, {useState, useRef} from 'react';
import { View, StyleSheet, StatusBar, ImageBackground, Platform, TouchableOpacity, Image, Text, TextInput, Pressable, KeyboardAvoidingView, ScrollView, Alert} from 'react-native';
import {router} from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { AuthTokens } from '../../utils/tokenManager';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}


const goBackOrHome = () => {
  if ((router as any).canGoBack?.()) router.back();  // 스택에 이전 페이지 있으면 pop
  else router.replace('/');                          // 없으면 메인으로 (index.tsx 기준)
};


// const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'http://localhost:3000';
const API_BASE = 'http://localhost:8080';

const LoginPage = ({ onLoginSuccess}: LoginPageProps) => {
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const { login } = useAuth(); // AuthContext에서 login 함수 가져오기

    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [autoLogin, setAutoLogin] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !pw) {
        Alert.alert('로그인', '이메일과 비밀번호를 입력해주세요.');
        return;
        }
        try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            userId: email.trim(),
            password: pw,
            }),
        });

        // 응답 파싱
        const data: AuthTokens = await res.json().catch(() => ({}));

        if (!res.ok) {
            const msg = (data && (data as any).message || (data as any).error) || `HTTP ${res.status}`;
            throw new Error(msg);
        }

        console.log('✅ 로그인 성공:', data);
        
        // 토큰 저장 및 인증 상태 업데이트
        await login(data);
        
        // 로그인 성공 콜백
        onLoginSuccess();
        } catch (err: any) {
        console.error('❌ 로그인 실패:', err?.message || err);
        Alert.alert('로그인 실패', err?.message || '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
        setLoading(false);
        }
  };


    return (
        <KeyboardAvoidingView  style={styles.container}  behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            {/* 상태바 설정 => 상단에 시간, 배터리, 와이파이 정보를 수정하기 위한 용도!*/ }
            <StatusBar translucent={false} backgroundColor={'#ffffff'} barStyle="dark-content"/>

            {/* 뒤로가기 버튼 */}
            <TouchableOpacity onPress={goBackOrHome} style={styles.backButton}>
                <Image source={require('../../assets/images/BackIcon.png')} style={styles.backIcon}/>
            </TouchableOpacity>

            {/* 이미지 바탕 화면 */}
            <ImageBackground source={require('../../assets/images/SOLSOLBackground.png')} style={styles.background} resizeMode="cover">
                
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.content}>
                    {/* 곰 캐릭터 (173x173), StatusBar로부터 124, 좌우 110 */}
                    <Image source={require('../../assets/images/LoginPageCharacter.png')} style={styles.character} />

                    {/* 타이틀 (상하 48, 좌우 114, 캐릭터와 12 간격) */}
                    <Text style={styles.title}>HeyCalendar에{'\n'}오신 것을 환영해요!</Text>

                    <TouchableOpacity onPress={() => emailInputRef.current?.focus()}>
                        <TextInput ref={emailInputRef} style={[styles.input, { marginTop: 35 }]} placeholder="이메일을 입력해주세요"
                            placeholderTextColor="#888" value={email} onChangeText={setEmail} keyboardType="default" multiline={false}
                            numberOfLines={1} onFocus={() => console.log('Email input focused')} testID="email-input"
                            pointerEvents="none"/>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { console.log('Password TouchableOpacity pressed'); passwordInputRef.current?.focus(); }}>
                        <TextInput
                            ref={passwordInputRef}
                            style={[styles.input, { marginTop: 20 }]}
                            placeholder="비밀번호를 입력해주세요"
                            placeholderTextColor="#888"
                            value={pw}
                            onChangeText={(text)=>{
                                setPw(text);
                                console.log("입력된 비밀번호 : ", text);
                            }}
                            keyboardType="default"
                            autoComplete="off"
                            textContentType="password"
                            secureTextEntry={true}
                            onFocus={() => console.log('Password input focused')}
                            onBlur={() => console.log('Password input blurred')}
                            testID="password-input"
                            editable={true}
                        />
                    </TouchableOpacity>

                     {/* 로그인 버튼 */}
                    <Pressable style={[styles.loginButton, { marginTop: 24, opacity: loading ? 0.6 : 1 }]} onPress={handleLogin} disabled={loading}>
                        <Text style={styles.loginText}>{loading ? '로그인 중...' : '로그인'}</Text>
                    </Pressable>

                    

                    <View style={styles.optionsRow}>
                        {/* 자동로그인 토글 */}
                        <Pressable style={styles.autoRow} onPress={() => setAutoLogin(v => !v)}>
                            <View style={[styles.checkbox, autoLogin && styles.checkboxChecked]}>
                            {autoLogin && <View style={styles.checkboxDot} />}
                            </View>
                            <Text style={styles.optionText}>자동로그인</Text>
                        </Pressable>

                        {/* 회원가입 이동 */}
                        <View style={styles.signupRow}>
                            <Text style={styles.optionText}>아직 회원이 아니신가요?</Text>
                            <Pressable onPress={() => router.push('/UserBasic/RegistPage')}>
                                <Text style={styles.link}>회원가입</Text>
                            </Pressable>
                        </View>
                    </View>

                </View>
                </ScrollView>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  background: { flex: 1, justifyContent: 'flex-start', alignItems: 'stretch',},
  scrollContent: { flexGrow: 1,},
  content: { flex: 1,},
  text: { fontSize: 24, fontWeight: 'bold',},
  backButton: { position: 'absolute', top: 48, left: 16, zIndex: 10, padding: 8,},
  backIcon: { width: 24, height: 24, resizeMode: 'contain', },
  character: { width: 173, height: 173, alignSelf: 'center', marginTop: 124, marginHorizontal: 110, resizeMode: 'contain', },
  title: { marginTop: 12, marginHorizontal: 114, height: 48, textAlign: 'center', fontSize: 20, fontWeight: '700', lineHeight: 24, color: '#111', },
  input: { marginHorizontal: 40, minHeight: 48, borderWidth: 1, borderColor: '#C9C9C9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.9)', fontSize: 16, color: '#000',},
  loginButton: { marginHorizontal: 40, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#8FA1FF', },
  loginText: { color: '#fff', fontWeight: '700', fontSize: 16, },
  optionsRow: { marginTop: 12, marginHorizontal: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', },
  autoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#8FA1FF', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', },
  checkboxChecked: { borderColor: '#6E87FF', backgroundColor: '#E9EDFF', },
  checkboxDot: { width: 10, height: 10, },
  optionText: { fontSize: 13, color: '#333', },
  signupRow: { flexDirection: 'row', alignItems: 'center', gap: 8, },
  link: { fontSize: 13, fontWeight: '700', color: '#6E87FF', },
});

export default LoginPage;