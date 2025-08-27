import React, { useState, useEffect } from "react";
import { ImageBackground, ScrollView, StatusBar, StyleSheet, View, Alert, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import BG from "../../assets/images/SOLSOLBackground.png";
import { TopBar } from "../../components/scholarship/TopBar";
import { SectionHeader } from "../../components/scholarship/SectionHeader";
import { ReasonTextArea } from "../../components/scholarship/ReasonTextArea";
import { FileUploadPanel } from "../../components/scholarship/FileUploadPanel";
import { Checklist } from "../../components/scholarship/Checklist";
import { PrimaryButton } from "../../components/scholarship/PrimaryButton";
import { router } from "expo-router";
import { scholarshipApi, Scholarship } from "../../services/scholarship.api";
import { applicationApi } from "../../services/application.api";

export default function ScholarshipApplyForm() {
  const { scholarshipId, edit } = useLocalSearchParams<{ scholarshipId: string; edit?: string }>();
  const [files, setFiles] = useState<{ name: string; uri: string }[]>([]);
  const [reason, setReason] = useState("");
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [isEditMode, setIsEditMode] = useState(edit === 'true');
  const [existingApplication, setExistingApplication] = useState<any>(null);

  // 장학금 정보 로드
  useEffect(() => {
    const loadScholarship = async () => {
      if (!scholarshipId) {
        Alert.alert('오류', '장학금 ID가 없습니다.');
        router.back();
        return;
      }

      try {
        setLoading(true);
        
        // 장학금 정보 로드
        const scholarshipData = await scholarshipApi.getScholarship(parseInt(scholarshipId));
        
        if (scholarshipData) {
          setScholarship(scholarshipData);
          
          // 수정 모드일 때 기존 신청 내용 로드
          if (isEditMode) {
            const applicationData = await applicationApi.getApplicationByScholarship(parseInt(scholarshipId));
            if (applicationData) {
              setExistingApplication(applicationData);
              setReason(applicationData.reason || "");
            } else {
              Alert.alert('오류', '기존 신청 정보를 찾을 수 없습니다.');
              setIsEditMode(false);
            }
          }
        } else {
          Alert.alert('오류', '장학금 정보를 찾을 수 없습니다.');
          router.back();
        }
      } catch (error) {
        console.error('장학금 정보 로드 오류:', error);
        Alert.alert('오류', '장학금 정보를 불러오는 중 오류가 발생했습니다.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadScholarship();
  }, [scholarshipId]);

  // 신청/수정 처리 함수
  const handleSubmit = async () => {
    if (!scholarshipId) return;
    
    setSubmitting(true);
    try {
      let success;
      const submitReason = reason.trim() || "장학금 신청";
      
      if (isEditMode) {
        success = await applicationApi.updateApplication(parseInt(scholarshipId), submitReason);
        Alert.alert('성공', '장학금 신청이 수정되었습니다.');
      } else {
        success = await applicationApi.submitApplication({
          scholarshipId: parseInt(scholarshipId),
          reason: submitReason
        });
      }
      
      if (success) {
        if (isEditMode) {
          router.back(); // 수정 완료 후 이전 페이지로
        } else {
          router.push(`/Scholarship/SubmissionDone?scholarshipId=${scholarshipId}`);
        }
      } else {
        const actionText = isEditMode ? '수정' : '신청';
        Alert.alert('실패', `장학금 ${actionText}에 실패했습니다.`);
      }
    } catch (error) {
      const actionText = isEditMode ? '수정' : '신청';
      console.error(`장학금 ${actionText} 오류:`, error);
      Alert.alert('오류', `장학금 ${actionText} 중 오류가 발생했습니다.`);
    } finally {
      setSubmitting(false);
    }
  };

  // 지원취소 처리 함수
  const handleCancel = async () => {
    console.log('🔥 지원취소 버튼 클릭됨');
    console.log('🔥 scholarshipId:', scholarshipId);
    
    if (!scholarshipId) {
      console.log('❌ scholarshipId가 없음');
      return;
    }
    
    console.log('🔥 Alert 다이얼로그 표시');
    
    // Alert 확인 없이 바로 취소 실행
    console.log('🔥 확인 버튼 클릭, API 호출 시작');
    setCanceling(true);
    try {
      const success = await applicationApi.cancelApplication(parseInt(scholarshipId));
      console.log('🔥 API 호출 결과:', success);
      
      if (success) {
        console.log('🔥 취소 성공, 상세페이지로 이동');
        router.push(`/Scholarship/ScholarshipDetail?id=${scholarshipId}`);
      } else {
        Alert.alert('실패', '신청 취소에 실패했습니다.');
      }
    } catch (error) {
      console.error('🔥 지원취소 오류:', error);
      Alert.alert('오류', '신청 취소 중 오류가 발생했습니다.');
    } finally {
      setCanceling(false);
    }
  };

  const checklistItems = [
    { id: "1", label: "성적증명서", done: files.some(f => /성적|grade/i.test(f.name)) },
    { id: "2", label: "재학증명서", done: files.some(f => /재학|enroll/i.test(f.name)) },
    { id: "3", label: "장학금 신청서", done: files.some(f => /신청서|apply/i.test(f.name)) },
    { id: "4", label: "통장사본", done: false },
  ];
  const canSubmit = true; // 신청 사유는 선택사항

  if (loading) {
    return (
      <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
        <StatusBar barStyle="dark-content" />
        <View style={[styles.phone, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color="#6B86FF" />
        </View>
      </ImageBackground>
    );
  }

  if (!scholarship) {
    return (
      <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
        <StatusBar barStyle="dark-content" />
        <View style={[styles.phone, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <Text>장학금 정보를 찾을 수 없습니다.</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }}>
        <View style={styles.phone}>
          <TopBar title={isEditMode ? "장학금 신청 수정" : "장학금 신청"} />

          <SectionHeader title="신청 사유 및 비고" />
          <ReasonTextArea
            placeholder="장학금 신청 사유를 작성해주세요..."
            value={reason}
            onChangeText={setReason}
          />

          <SectionHeader title="제출 서류" actionLabel="mybox 서류확인하기" onPressAction={() => {}} />
          <FileUploadPanel
            files={files}
            onAdd={(f) => setFiles((p) => [...p, f])}
            onRemove={(idx) => setFiles((p) => p.filter((_, i) => i !== idx))}
          />

          <Checklist title="제출 서류 체크리스트" items={checklistItems} />

          {isEditMode ? (
            // 수정 모드: 수정하기 + 지원취소 버튼
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, marginHorizontal: 12 }}>
              <TouchableOpacity
                style={[styles.cancelButton, { opacity: canceling ? 0.6 : 1 }]}
                onPress={() => {
                  console.log('🔥 지원취소 TouchableOpacity 클릭됨');
                  console.log('🔥 canceling:', canceling, 'submitting:', submitting);
                  handleCancel();
                }}
                disabled={canceling || submitting}
              >
                <Text style={styles.cancelButtonText}>
                  {canceling ? '취소중...' : '지원취소'}
                </Text>
              </TouchableOpacity>
              
              <PrimaryButton
                label={submitting ? "수정중..." : "수정하기"}
                disabled={!canSubmit || submitting || canceling}
                onPress={handleSubmit}
                style={{ flex: 1 }}
              />
            </View>
          ) : (
            // 신규 신청 모드: 신청하기 버튼만
            <PrimaryButton
              label={submitting ? "신청중..." : "신청하기"}
              disabled={!canSubmit || submitting}
              onPress={handleSubmit}
              style={{ marginTop: 12, marginHorizontal: 12 }}
            />
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({ 
  phone: { width: 360, paddingVertical: 8 },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
