// app/UserBasic/RegistPage.tsx
import React, { useState } from 'react';
import {View, Text, ImageBackground, Image, TouchableOpacity, KeyboardAvoidingView, StyleSheet, StatusBar, Platform, TextInput, ScrollView, Keyboard, TouchableWithoutFeedback, Alert, Pressable, FlatList} from 'react-native';
import { router } from 'expo-router';
// import RNPickerSelect from 'react-native-picker-select';
// import { Picker } from '@react-native-picker/picker';
// 필요 시 .env: EXPO_PUBLIC_API_BASE

const API_BASE = 'http://localhost:8080';

// 10개 대학교 목록
const universities = [{ label: '경기대학교', value: '경기대학교' },{ label: '광주대학교', value: '광주대학교' },{ label: '동국대학교', value: '동국대학교' },{ label: '용인대학교', value: '용인대학교' },{ label: '숙명여자대학교', value: '숙명여자대학교' },
  { label: '이화여자대학교', value: '이화여자대학교' },{ label: '전북과학대학교', value: '전북과학대학교' },{ label: '청주대학교', value: '청주대학교' },{ label: '한양대학교', value: '한양대학교' },{ label: '홍익대학교', value: '홍익대학교' }];

export default function RegistPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [univName, setUnivName] = useState('');
    const [dept, setDept] = useState('');
    const [studentId, setStudentId] = useState('');
    const [agreeAll, setAgreeAll] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleRegister = async () => {

    if ( !name.trim() || !email.trim() || !pw.trim() || !univName.trim() ||!dept.trim() || !studentId.trim() ) {
        Alert.alert('입력 필요', '모두 입력해 주세요.'); return;
    }

    if (!agreeAll) {
        Alert.alert('동의 필요', '이용약관 및 개인정보 수집·이용에 모두 동의해주세요.');
        return;
    }
    try {
        setSubmitting(true);
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            userName : name.trim(), userId : email.trim(), password : pw, univName : univName.trim(), deptName : dept.trim(), userNm : studentId.trim()
            }),
        });

        const raw = await res.text();
        let ok = res.ok;
        try {
            const json = JSON.parse(raw);
            ok = ok && (json.ok === true || json.status === 'ok');
        } catch {
            if (raw.trim().toLowerCase() === 'ok') ok = true;
        }

        if(!ok) throw new Error(raw || `HTTP ${res.status}`);
        
        Alert.alert('가입 완료', '회원가입 요청이 정상 처리되었습니다.', [
        {
            text: '확인',
            onPress: () => {
            if ((router as any).canGoBack?.()) router.back();
            else router.replace('/UserBasic/LoginPage'); // 혹은 '/'
            }
        }
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
            onTouchStart={() => setShowDropdown(false)}
          >
            <View style={styles.headerWrap}>
              <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Image source={require('../../assets/images/BackIcon.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>회원 가입</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>INFORMATION</Text>
              <Text style={styles.requiredText}>* 필수입력사항</Text>
            </View>


            <View style={styles.formWrap}>
              <TextInput style={[styles.inputBox, { marginTop: 14 }]} placeholder="이름 *" placeholderTextColor="#888" value={name} onChangeText={setName} />
              <TextInput style={[styles.inputBox, { marginTop: 12 }]} placeholder="이메일 *" placeholderTextColor="#888" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
              <TextInput style={[styles.inputBox, { marginTop: 12 }]} placeholder="비밀번호 *" placeholderTextColor="#888" secureTextEntry textContentType="password" value={pw} onChangeText={setPw} />
              <View style={{ marginTop: 12, position: 'relative', zIndex: 1 }}>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => setShowDropdown(!showDropdown)}
                >
                  <Text style={univName ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {univName || '학교 선택하기 *'}
                  </Text>
                  <Text style={styles.dropdownArrow}>{showDropdown ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                
                {showDropdown && (
                  <View style={styles.dropdownList}>
                    <FlatList
                      data={universities}
                      keyExtractor={(item) => item.value}
                      style={styles.dropdownScroll}
                      showsVerticalScrollIndicator={true}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            setUnivName(item.value);
                            setShowDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{item.label}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}
              </View>
              <TextInput style={[styles.inputBox, { marginTop: 12 }]} placeholder="학과 *" placeholderTextColor="#888" value={dept} onChangeText={setDept} />
              <TextInput style={[styles.inputBox, { marginTop: 12 }]} placeholder="학번 *" placeholderTextColor="#888" keyboardType="numeric" value={studentId} onChangeText={setStudentId} />

              <View style={{ marginTop: 20 }}>
                <View style={styles.consentBox}>
                  <Text style={styles.consentTitle}>헤이영 캠퍼스 계좌 생성 동의서</Text>
                  <Text style={styles.bullet}>{'\u2022'} 신한은행 연동 계좌 생성에 동의합니다.</Text>
                  <Text style={styles.bullet}>{'\u2022'} 신한은행 개인 정보 사용에 동의합니다.</Text>
                  <Text style={styles.bullet}>{'\u2022'} 신한은행 개인 정보 활용에 동의합니다.</Text>
                  <Text style={styles.bullet}>{'\u2022'} 계좌 이용약관에 모두 동의합니다.</Text>
                  <Text style={styles.bullet}>{'\u2022'} 위 모든 내용을 숙지했음을 동의합니다.</Text>
                </View>
              </View>

              {/* ✅ 동의 체크: 동의서와 14만큼 간격 */}
              <Pressable style={[styles.agreeRow, { marginTop: 14 }]} onPress={() => setAgreeAll(v => !v)}>
                <View style={[styles.checkbox, agreeAll && styles.checkboxChecked]}>
                  {agreeAll && <View style={styles.checkboxDot} />}
                </View>
                <Text style={styles.agreeText}>이용약관 및 개인정보 수집, 이용에 모두 동의합니다.</Text>
              </Pressable>

              {/* ✅ 회원가입 버튼: 동의 텍스트와 16만큼 간격 */}
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
  headerTitle: {width: 80, height: 27, marginLeft: 130, fontSize: 20, fontWeight: '700', color: '#111',includeFontPadding: false, textAlignVertical: 'center', lineHeight: 24,},

  /* INFORMATION 라인 */
  infoRow: { marginTop: 39, paddingLeft: 34, paddingRight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',},
  infoLabel: { fontSize: 16, fontWeight: '600', color: '#111' },
  requiredText: { fontSize: 13, color: '#111' },

  /* 폼 */
  formWrap: { paddingLeft: 34, paddingRight: 34 },
  inputBox: {
    height: 50, width: '100%',
    borderWidth: 1, borderColor: '#BDBDBD', borderRadius: 4,
    paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.9)',
    fontSize: 14, color: '#111',
  },

  /* 동의서 박스 */
  consentBox: { backgroundColor: '#fff', borderRadius: 8, padding: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2,},
  consentTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 10,},
  bullet: { fontSize: 14, color: '#111', marginBottom: 6,},

  /* 동의 체크 */
  agreeRow: { flexDirection: 'row', alignItems: 'center',},
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#8FA1FF',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', marginRight: 8,
  },
  checkboxChecked: { borderColor: '#6E87FF', backgroundColor: '#E9EDFF',},
  checkboxDot: { width: 10, height: 10, backgroundColor: '#6E87FF' },
  agreeText: { fontSize: 13, color: '#333' },

  /* 회원가입 버튼 */
  joinButton: {
    height: 48, borderRadius: 10, backgroundColor: '#8FA1FF',
    alignItems: 'center', justifyContent: 'center',
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
  dropdownText: {
    fontSize: 14,
    color: '#111',
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: '#888',
  },
  dropdownArrow: {
    fontSize: 14,
    color: '#666',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 4,
    marginTop: 2,
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 52,
    zIndex: 1000,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#111',
  },
});