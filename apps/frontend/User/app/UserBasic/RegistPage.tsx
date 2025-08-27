import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ImageBackground, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const API_BASE = 'http://10.0.2.2:8080';

// 10개 대학교 목록 (value는 백엔드로 전송될 정수 ID)
const universities = [ 
  { label: '경기대학교', value: 1 },  
  { label: '광주대학교', value: 2 }, 
  { label: '동국대학교', value: 3 }, 
  { label: '용인대학교', value: 4 }, 
  { label: '숙명여자대학교', value: 5 },  
  { label: '이화여자대학교', value: 6 }, 
  { label: '전북과학대학교', value: 7 }, 
  { label: '청주대학교', value: 8 }, 
  { label: '한양대학교', value: 9 }, 
  { label: '홍익대학교', value: 10 }
];

// 10개 학과 목록 (value는 백엔드로 전송될 정수 ID)
const departments = [
  { label: '경제학과', value: 1 },
  { label: '간호학과', value: 2 },
  { label: '디자인학과', value: 3 },
  { label: '빅데이터융합학과', value: 4 },
  { label: '소프트웨어공학과', value: 5 },
  { label: '식품공학과', value: 6 },
  { label: '인공지능학과', value: 7 },
  { label: '영어교육과', value: 8 },
  { label: '컴퓨터공학과', value: 9 },
  { label: '화학과', value: 10 }
];

export default function RegistPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [univName, setUnivName] = useState('');   // 화면 표시용
  const [univValue, setUnivValue] = useState<number | null>(null); // 서버 전송용
  const [deptName, setDeptName] = useState('');   // 화면 표시용
  const [deptValue, setDeptValue] = useState<number | null>(null); // 서버 전송용
  const [studentId, setStudentId] = useState('');
  const [agreeAll, setAgreeAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showUnivDropdown, setShowUnivDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);

    const handleRegister = async () => {
    if ( !name.trim() || !email.trim() || !pw.trim() || univValue === null || deptValue === null || !studentId.trim() ) {
      Alert.alert('입력 필요', '모두 입력해 주세요.');
      return;
    }

    if (!agreeAll) {
      Alert.alert('동의 필요', '이용약관 및 개인정보 수집·이용에 모두 동의해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      
      console.log('🔍 전송 전 값 확인:');
      console.log('univName (화면표시):', univName);
      console.log('univValue (전송값):', univValue);
      console.log('deptName (화면표시):', deptName);
      console.log('deptValue (전송값):', deptValue);
      
      const requestData = {
        userName: name.trim(),
        userId: email.trim(),
        password: pw,
        univNm: univValue,
        deptNm : deptValue,
        userNm: studentId.trim(),
        accountCreationConsent: true
      };
      
      console.log('📤 최종 전송 데이터:', JSON.stringify(requestData, null, 2));
      
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const raw = await res.text();
      
      // 백엔드 응답 데이터 출력
      console.log('🔍 백엔드 응답 데이터:', raw);
      console.log('📊 응답 상태:', res.status);
      console.log('📋 응답 헤더:', Object.fromEntries(res.headers.entries()));
      
      let ok = res.ok;
      try {
        const json = JSON.parse(raw);
        console.log('📋 파싱된 JSON:', JSON.stringify(json, null, 2));
        // 백엔드에서 success: true로 응답하므로 이를 체크
        ok = ok && json.success === true;
      } catch {
        console.log('⚠️ JSON 파싱 실패, 텍스트 응답:', raw);
        if (raw.trim().toLowerCase() === 'ok') ok = true;
      }

      if (!ok) throw new Error(raw || `HTTP ${res.status}`);

      Alert.alert('가입 완료', '회원가입 요청이 정상 처리되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            if ((router as any).canGoBack?.()) router.back();
            else router.replace('/UserBasic/LoginPage');
          },
        },
      ]);
    } catch (e: any) {
      Alert.alert('가입 실패', e?.message || '잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar translucent={false} backgroundColor={'#ffffff'} barStyle="dark-content" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ImageBackground
          source={require('../../assets/images/SOLSOLBackground.png')}
          style={styles.background}
          resizeMode="cover"
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 120 }}
            // onTouchStart={() => setShowDropdown(false)}  // ⛔️ 제거: 모달 스크롤 시 닫히는 원인
          >
            <View style={styles.headerWrap}>
              <View style={styles.headerRow}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Image
                    source={require('../../assets/images/BackIcon.png')}
                    style={styles.backIcon}
                  />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  회원 가입
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>INFORMATION</Text>
              <Text style={styles.requiredText}>* 필수입력사항</Text>
            </View>

            <View style={styles.formWrap}>
              <TextInput
                style={[styles.inputBox, { marginTop: 14 }]}
                placeholder="이름 *"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
              />

              <TextInput
                style={[styles.inputBox, { marginTop: 12 }]}
                placeholder="이메일 *"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <TextInput
                style={[styles.inputBox, { marginTop: 12 }]}
                placeholder="비밀번호 *"
                placeholderTextColor="#888"
                secureTextEntry
                textContentType="password"
                value={pw}
                onChangeText={setPw}
              />

              {/* 학교 선택 드롭다운 버튼 */}
              <TouchableOpacity
                style={[styles.dropdownButton, { marginTop: 12 }]}
                onPress={() => setShowUnivDropdown(true)}
                activeOpacity={0.7}
              >
                <Text style={univName ? styles.dropdownText : styles.dropdownPlaceholder}>
                  {univName || '학교 선택하기 *'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>

              {/* 모달: 대학교 선택 */}
              <Modal
                visible={showUnivDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowUnivDropdown(false)}
                presentationStyle="overFullScreen"
              >
                <View style={styles.modalOverlay}>
                  {/* 배경 터치 시 닫힘 */}
                  <TouchableWithoutFeedback onPress={() => setShowUnivDropdown(false)}>
                    <View style={styles.modalBackground} />
                  </TouchableWithoutFeedback>

                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>학교 선택</Text>

                    <ScrollView
                      style={styles.modalScroll}
                      showsVerticalScrollIndicator
                      bounces={false}
                      keyboardShouldPersistTaps="handled"
                      onStartShouldSetResponderCapture={() => true}
                      onMoveShouldSetResponderCapture={() => true}
                    >
                      {universities.map((uni) => (
                        <TouchableOpacity
                          key={uni.value}
                          style={[
                            styles.modalItem,
                            univName === uni.label && styles.modalItemSelected,
                          ]}
                          onPress={() => {
                            console.log('🏫 대학교 선택:', uni.label, '→ ID:', uni.value);
                            setUnivName(uni.label);   // 화면 표시용
                            setUnivValue(uni.value);  // 서버 전송용
                            setShowUnivDropdown(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.modalItemText,
                              univName === uni.label && styles.modalItemTextSelected,
                            ]}
                          >
                            {uni.label}
                          </Text>
                          {univName === uni.label && <Text style={styles.checkMark}>✓</Text>}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={() => setShowUnivDropdown(false)}
                    >
                      <Text style={styles.modalCloseText}>닫기</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              {/* 학과 선택 드롭다운 버튼 */}
              <TouchableOpacity
                style={[styles.dropdownButton, { marginTop: 12 }]}
                onPress={() => setShowDeptDropdown(true)}
                activeOpacity={0.7}
              >
                <Text style={deptName ? styles.dropdownText : styles.dropdownPlaceholder}>
                  {deptName || '학과 선택하기 *'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>

              {/* 모달: 학과 선택 */}
              <Modal
                visible={showDeptDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeptDropdown(false)}
                presentationStyle="overFullScreen"
              >
                <View style={styles.modalOverlay}>
                  {/* 배경 터치 시 닫힘 */}
                  <TouchableWithoutFeedback onPress={() => setShowDeptDropdown(false)}>
                    <View style={styles.modalBackground} />
                  </TouchableWithoutFeedback>

                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>학과 선택</Text>

                    <ScrollView
                      style={styles.modalScroll}
                      showsVerticalScrollIndicator
                      bounces={false}
                      keyboardShouldPersistTaps="handled"
                      onStartShouldSetResponderCapture={() => true}
                      onMoveShouldSetResponderCapture={() => true}
                    >
                      {departments.map((dept) => (
                        <TouchableOpacity
                          key={dept.value}
                          style={[
                            styles.modalItem,
                            deptName === dept.label && styles.modalItemSelected,
                          ]}
                          onPress={() => {
                            console.log('🎓 학과 선택:', dept.label, '→ ID:', dept.value);
                            setDeptName(dept.label);   // 화면 표시용
                            setDeptValue(dept.value);  // 서버 전송용
                            setShowDeptDropdown(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.modalItemText,
                              deptName === dept.label && styles.modalItemTextSelected,
                            ]}
                          >
                            {dept.label}
                          </Text>
                          {deptName === dept.label && <Text style={styles.checkMark}>✓</Text>}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={() => setShowDeptDropdown(false)}
                    >
                      <Text style={styles.modalCloseText}>닫기</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <TextInput
                style={[styles.inputBox, { marginTop: 12 }]}
                placeholder="학번 *"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={studentId}
                onChangeText={setStudentId}
              />

              <View style={{ marginTop: 20 }}>
                <View className="consent" style={styles.consentBox}>
                  <Text style={styles.consentTitle}>헤이영 캠퍼스 계좌 생성 동의서</Text>
                  <Text style={styles.bullet}>{'\u2022'} 신한은행 연동 계좌 생성에 동의합니다.</Text>
                  <Text style={styles.bullet}>{'\u2022'} 신한은행 개인 정보 사용에 동의합니다.</Text>
                  <Text style={styles.bullet}>{'\u2022'} 신한은행 개인 정보 활용에 동의합니다.</Text>
                  <Text style={styles.bullet}>{'\u2022'} 계좌 이용약관에 모두 동의합니다.</Text>
                  <Text style={styles.bullet}>{'\u2022'} 위 모든 내용을 숙지했음을 동의합니다.</Text>
                </View>
              </View>

              {/* 동의 체크 */}
              <Pressable
                style={[styles.agreeRow, { marginTop: 14 }]}
                onPress={() => setAgreeAll((v) => !v)}
              >
                <View style={[styles.checkbox, agreeAll && styles.checkboxChecked]}>
                  {agreeAll && <View style={styles.checkboxDot} />}
                </View>
                <Text style={styles.agreeText}>
                  이용약관 및 개인정보 수집, 이용에 모두 동의합니다.
                </Text>
              </Pressable>

              {/* 회원가입 버튼 */}
              <Pressable
                onPress={handleRegister}
                style={[styles.joinButton, { marginTop: 16, opacity: submitting ? 0.7 : 1 }]}
                disabled={submitting}
              >
                <Text style={styles.joinText}>{submitting ? '처리 중...' : '회원 가입'}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },

  /* 헤더 */
  headerWrap: { paddingTop: 36, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backIcon: { width: 24, height: 24, resizeMode: 'contain' },
  headerTitle: {
    width: 80,
    height: 27,
    marginLeft: 130,
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 24,
  },

  /* INFORMATION 라인 */
  infoRow: {
    marginTop: 39,
    paddingLeft: 34,
    paddingRight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: { fontSize: 16, fontWeight: '600', color: '#111' },
  requiredText: { fontSize: 13, color: '#111' },

  /* 폼 */
  formWrap: { paddingLeft: 34, paddingRight: 34 },
  inputBox: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    color: '#111',
  },

  /* 동의서 박스 */
  consentBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  consentTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 10 },
  bullet: { fontSize: 14, color: '#111', marginBottom: 6 },

  /* 동의 체크 */
  agreeRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#8FA1FF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  checkboxChecked: { borderColor: '#6E87FF', backgroundColor: '#E9EDFF' },
  checkboxDot: { width: 10, height: 10, backgroundColor: '#6E87FF' },
  agreeText: { fontSize: 13, color: '#333' },

  /* 회원가입 버튼 */
  joinButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#8FA1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  /* 커스텀 드롭다운 */
  dropdownButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  dropdownText: { fontSize: 14, color: '#111' },
  dropdownPlaceholder: { fontSize: 14, color: '#888' },
  dropdownArrow: { fontSize: 14, color: '#666' },

  /* Modal 스타일 */
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#111',
  },
  modalScroll: { maxHeight: 300 },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemSelected: { backgroundColor: '#E9EDFF' },
  modalItemText: { fontSize: 16, color: '#111', flex: 1 },
  modalItemTextSelected: { color: '#6E87FF', fontWeight: '600' },
  checkMark: { fontSize: 18, color: '#6E87FF', fontWeight: 'bold' },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#8FA1FF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});