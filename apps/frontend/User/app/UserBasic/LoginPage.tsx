import React, {useState, useRef} from 'react';
import { View, StyleSheet, StatusBar, ImageBackground, Platform, TouchableOpacity, Image, Text, TextInput, Pressable, KeyboardAvoidingView, ScrollView} from 'react-native';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const LoginPage = ({ onLoginSuccess, onBack }: LoginPageProps) => {
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [maskedPw, setMaskedPw] = useState('');
    const [autoLogin, setAutoLogin] = useState(false);

    const handlePasswordChange = (text: string) => {
        setPw(text);
        // 입력된 텍스트를 점으로 마스킹
        setMaskedPw('•'.repeat(text.length));
    }; 

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            {/* 상태바 설정 => 상단에 시간, 배터리, 와이파이 정보를 수정하기 위한 용도!*/ }
            <StatusBar
            translucent={false}
            backgroundColor={'#ffffff'}
            barStyle="dark-content"
            />

            {/* 뒤로가기 버튼 */}
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Image source={require('../../assets/images/BackIcon.png')} style={styles.backIcon}/>
            </TouchableOpacity>

            {/* 이미지 바탕 화면 */}
            <ImageBackground source={require('../../assets/images/SOLSOLBackground.png')} style={styles.background} resizeMode="cover">
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.content}>
                    {/* 곰 캐릭터 (173x173), StatusBar로부터 124, 좌우 110 */}
                    <Image
                        // ⬇️ 캐릭터 파일명은 프로젝트에 맞게 바꿔줘
                        source={require('../../assets/images/LoginPageCharacter.png')}
                        style={styles.character}
                    />

                    {/* 타이틀 (상하 48, 좌우 114, 캐릭터와 12 간격) */}
                    <Text style={styles.title}>HeyCalendar에{'\n'}오신 것을 환영해요!</Text>

                    <TouchableOpacity onPress={() => emailInputRef.current?.focus()}>
                        <TextInput
                            ref={emailInputRef}
                            style={[styles.input, { marginTop: 35 }]}
                            placeholder="이메일을 입력해주세요"
                            placeholderTextColor="#888"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="default"
                            multiline={false}
                            numberOfLines={1}
                            onFocus={() => console.log('Email input focused')}
                            testID="email-input"
                            pointerEvents="none"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {
                        console.log('Password TouchableOpacity pressed');
                        passwordInputRef.current?.focus();
                    }}>
                        <TextInput
                            ref={passwordInputRef}
                            style={[styles.input, { marginTop: 20 }]}
                            placeholder="비밀번호를 입력해주세요"
                            placeholderTextColor="#888"
                            value={maskedPw}
                            onChangeText={handlePasswordChange}
                            keyboardType="default"
                            autoComplete="off"
                            textContentType="password"
                            onFocus={() => console.log('Password input focused')}
                            onBlur={() => console.log('Password input blurred')}
                            testID="password-input"
                            editable={true}
                        />
                    </TouchableOpacity>

                    {/* 로그인 버튼 (비밀번호와 24 간격, 좌우 40) */}
                    <Pressable style={[styles.loginButton, { marginTop: 24 }]} onPress={onLoginSuccess}>
                        <Text style={styles.loginText}>로그인</Text>
                    </Pressable>

                    {/* 옵션 행 (로그인과 12 간격, 좌우 40)
                        - [□ 자동로그인]  |  [아직 회원이 아니신가요?  회원가입] */}
                    <View style={styles.optionsRow}>
                        {/* 자동로그인 + 체크박스(커스텀) */}
                        <Pressable style={styles.autoRow} onPress={() => setAutoLogin(v => !v)}>
                        <View style={[styles.checkbox, autoLogin && styles.checkboxChecked]}>
                            {autoLogin && <View style={styles.checkboxDot} />}
                        </View>
                        <Text style={styles.optionText}>자동로그인</Text>
                        </Pressable>

                        {/* 회원가입 유도 */}
                        <View style={styles.signupRow}>
                        <Text style={styles.optionText}>아직 회원이 아니신가요?</Text>
                        <Pressable onPress={() => {/* TODO: navigate to SignUp */}}>
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
  background: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  character: {
    width: 173,
    height: 173,
    alignSelf: 'center',
    marginTop: 124,          // StatusBar로부터 124
    marginHorizontal: 110,   // 좌우 여백 110
    resizeMode: 'contain',
  },
  title: {
    marginTop: 12,           // 캐릭터와 12 간격
    marginHorizontal: 114,   // 좌우 여백 114
    height: 48,              // 요청된 높이 반영
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    color: '#111',
  },
  input: {
    marginHorizontal: 40,    // 좌우 40
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#C9C9C9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    color: '#000',
  },
  loginButton: {
    marginHorizontal: 40,    // 좌우 40
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // 이미지 색감에 맞춘 부드러운 블루톤 (필요 시 조정)
    backgroundColor: '#8FA1FF',
  },
  loginText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  optionsRow: {
    marginTop: 12,           
    marginHorizontal: 40,    
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  autoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#8FA1FF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    borderColor: '#6E87FF',
    backgroundColor: '#E9EDFF',
  },
  checkboxDot: {
    width: 10,
    height: 10,
  },
  optionText: {
    fontSize: 13,
    color: '#333',
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  link: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6E87FF',
  },
});

export default LoginPage;