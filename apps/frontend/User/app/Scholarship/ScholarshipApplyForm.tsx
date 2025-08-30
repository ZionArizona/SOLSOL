import React, { useState, useEffect } from "react";
import { ImageBackground, ScrollView, StatusBar, StyleSheet, View, ActivityIndicator, Text, TouchableOpacity, Modal } from "react-native";
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
import { getMyDocuments, DocumentItem, uploadDocumentRN } from "../../services/document.api";
import { DocumentUploadModal } from "../../components/mydocs/DocumentUploadModal";
import * as DocumentPicker from "expo-document-picker";
import { Platform } from "react-native";

export default function ScholarshipApplyForm() {
  const { scholarshipId, edit } = useLocalSearchParams<{ scholarshipId: string; edit?: string }>();
  const [files, setFiles] = useState<{ name: string; uri: string; webFile?: File; size?: number; type?: string }[]>([]);
  const [reason, setReason] = useState("");
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [isEditMode, setIsEditMode] = useState(edit === 'true');
  const [existingApplication, setExistingApplication] = useState<any>(null);
  
  // MyBox 관련 상태
  const [myDocuments, setMyDocuments] = useState<DocumentItem[]>([]);
  const [showMyBoxModal, setShowMyBoxModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());

  // 장학금 정보 로드
  useEffect(() => {
    const loadScholarship = async () => {
      if (!scholarshipId) {
        console.error('❌ 장학금 ID가 없습니다.');
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
              console.error('❌ 기존 신청 정보를 찾을 수 없습니다.');
              setIsEditMode(false);
            }
          }
        } else {
          console.error('❌ 장학금 정보를 찾을 수 없습니다.');
          router.back();
        }
      } catch (error) {
        console.error('장학금 정보 로드 오류:', error);
        console.error('❌ 장학금 정보를 불러오는 중 오류가 발생했습니다.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadScholarship();
  }, [scholarshipId]);

  // MyBox 서류 목록 로드
  const loadMyDocuments = async () => {
    try {
      console.log('📋 MyBox 서류 목록 로드 시작...');
      const docs = await getMyDocuments();
      console.log('📋 받아온 MyBox 서류:', docs.length, '개');
      setMyDocuments(docs);
    } catch (error) {
      console.error('❌ MyBox 서류 목록 로드 실패:', error);
      console.error('❌ MyBox 서류 목록을 불러올 수 없습니다.');
    }
  };

  // MyBox 서류 확인 모달 열기
  const handleOpenMyBox = async () => {
    console.log('📦 MyBox 모달 열기');
    await loadMyDocuments();
    setShowMyBoxModal(true);
  };

  // MyBox에서 서류 선택
  const handleSelectFromMyBox = () => {
    const selectedDocs = Array.from(selectedDocuments).map(docId => {
      const doc = myDocuments.find(d => d.id.toString() === docId);
      return doc ? { name: doc.fileName, uri: `mybox://${doc.id}` } : null;
    }).filter(Boolean) as { name: string; uri: string }[];

    console.log('✅ MyBox에서 선택된 서류:', selectedDocs);
    setFiles(prev => [...prev, ...selectedDocs]);
    setSelectedDocuments(new Set());
    setShowMyBoxModal(false);
    console.log(`✅ ${selectedDocs.length}개 서류가 추가되었습니다.`);
  };

  // 파일 업로드 후 MyBox에 저장
  const handleUploadToMyBox = async () => {
    console.log('📤 파일 업로드 모달 열기');
    setShowUploadModal(true);
  };

  // 업로드 완료 후 처리
  const handleUploadComplete = (uploadData: any) => {
    console.log('✅ 업로드 완료:', uploadData);
    // files 배열에 추가 (웹용 File 객체도 포함)
    setFiles(prev => [...prev, { 
      name: uploadData.fileName, 
      uri: uploadData.file.uri,
      webFile: uploadData.file.webFile, // 웹용 실제 File 객체
      size: uploadData.file.size,
      type: uploadData.file.type
    }]);
  };

  // 신청/수정 처리 함수
  const handleSubmit = async () => {
    if (!scholarshipId) return;
    
    setSubmitting(true);
    try {
      let success;
      const submitReason = reason.trim() || "장학금 신청";
      
      if (isEditMode) {
        success = await applicationApi.updateApplication(parseInt(scholarshipId), submitReason);
        console.log('✅ 장학금 신청이 수정되었습니다.');
      } else {
        // 1. 먼저 장학금 신청만 제출 (서류 없이)
        success = await applicationApi.submitApplication({
          scholarshipId: parseInt(scholarshipId),
          reason: submitReason,
          documents: []
        });

        if (success) {
          // 2. 선택된 파일들을 S3에 업로드하고 ApplicationDocument에 저장
          console.log(`🚀 총 ${files.length}개 파일 업로드 시작`);
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
              console.log(`📤 파일 ${i + 1}/${files.length} 업로드 시작:`, file.name);
              console.log(`📁 파일 정보:`, { 
                name: file.name, 
                size: file.size, 
                type: file.type, 
                hasWebFile: !!file.webFile,
                uri: file.uri 
              });
              
              if (file.uri.startsWith('mybox://')) {
                // MyBox 파일인 경우: 암호화된 데이터를 그대로 복사
                try {
                  console.log(`📁 MyBox 파일 복사 시작: ${file.name}`);
                  const myboxDocumentId = parseInt(file.uri.replace('mybox://', ''));
                  
                  // MyBox 파일을 ApplicationDocument로 복사 (암호화된 데이터 그대로)
                  const { copyMyBoxFileToApplicationDocument } = await import('../../services/document.api');
                  const documentNm = await copyMyBoxFileToApplicationDocument(
                    scholarshipId,
                    myboxDocumentId
                  );
                  
                  console.log(`✅ MyBox 파일 복사 완료: ${file.name}, documentNm: ${documentNm}`);
                } catch (error) {
                  console.error(`❌ MyBox 파일 복사 실패: ${file.name}`, error);
                  console.error(`❌ MyBox 파일 "${file.name}" 복사에 실패했습니다.`);
                  continue;
                }
              } else {
                // 직접 선택한 파일인 경우
                if (Platform.OS === 'web') {
                  // 웹에서는 저장된 webFile 사용
                  if (file.webFile) {
                    const { uploadApplicationDocumentWeb } = await import('../../services/document.api');
                    await uploadApplicationDocumentWeb(
                      file.webFile,
                      file.name,
                      'scholarship',
                      scholarshipId,
                      `doc_${i + 1}`
                    );
                  } else {
                    console.error('웹 환경에서 File 객체를 찾을 수 없습니다:', file.name);
                    continue;
                  }
                } else {
                  // 모바일에서는 file.uri 사용
                  const { uploadApplicationDocumentRN } = await import('../../services/document.api');
                  await uploadApplicationDocumentRN(
                    file.uri,
                    file.name,
                    file.type || 'application/octet-stream',
                    file.size || 0,
                    scholarshipId,
                    `doc_${i + 1}`
                  );
                }
                
                console.log(`✅ 파일 ${i + 1} 업로드 완료:`, file.name);
              }
            } catch (error) {
              console.error(`❌ 파일 ${i + 1} 업로드 실패:`, file.name, error);
              console.error(`❌ 파일 "${file.name}" 업로드에 실패했습니다.`);
            }
          }
          
          console.log('✅ 장학금 신청 및 서류 업로드가 완료되었습니다.');
        }
      }
      
      if (success) {
        if (isEditMode) {
          router.push('/MyScholarship/MyScholarship'); // 수정 완료 후 내 장학금 페이지로
        } else {
          // replace를 사용해서 뒤로가기 시 신청폼으로 돌아가지 않도록 함
          router.replace(`/Scholarship/SubmissionDone?scholarshipId=${scholarshipId}`);
        }
      } else {
        const actionText = isEditMode ? '수정' : '신청';
        console.error(`❌ 장학금 ${actionText}에 실패했습니다.`);
      }
    } catch (error) {
      const actionText = isEditMode ? '수정' : '신청';
      console.error(`장학금 ${actionText} 오류:`, error);
      console.error(`❌ 장학금 ${actionText} 중 오류가 발생했습니다.`);
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
        console.error('❌ 신청 취소에 실패했습니다.');
      }
    } catch (error) {
      console.error('🔥 지원취소 오류:', error);
      console.error('❌ 신청 취소 중 오류가 발생했습니다.');
    } finally {
      setCanceling(false);
    }
  };

  // 더 정확한 서류 매칭을 위한 체크리스트 개선
  // 장학금 정보의 필수서류를 기반으로 체크리스트 생성
  console.log('📋 Scholarship data:', scholarship);
  console.log('📋 Required documents:', scholarship?.requiredDocuments);
  
  const checklistItems = (scholarship?.requiredDocuments && scholarship.requiredDocuments.length > 0)
    ? scholarship.requiredDocuments.map((doc, index) => ({
        id: `doc_${index}`,
        label: doc.name,
        done: files.some(f => 
          doc.keywords?.some(keyword => 
            f.name.toLowerCase().includes(keyword.toLowerCase())
          ) || false
        ),
        required: doc.required
      }))
    : (scholarship?.criteria && scholarship.criteria.length > 0)
    ? scholarship.criteria.map((criterion, index) => ({
        id: `criteria_${index}`,
        label: criterion.name,
        done: files.some(f => 
          f.name.toLowerCase().includes(criterion.name.toLowerCase())
        ),
        required: true
      }))
    : [
        // 기본 체크리스트 (필수서류 정보가 없는 경우)
        { 
          id: "default_1", 
          label: "성적증명서", 
          done: files.some(f => /성적|grade|transcript/i.test(f.name)),
          required: true
        },
        { 
          id: "default_2", 
          label: "재학증명서", 
          done: files.some(f => /재학|enroll|enrollment/i.test(f.name)),
          required: true
        }
      ];

  console.log('📋 Generated checklist items:', checklistItems);
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

          <SectionHeader 
            title="제출 서류" 
            actionLabel="mybox 서류확인하기" 
            onPressAction={handleOpenMyBox} 
          />
          
          <FileUploadPanel
            files={files}
            onAdd={(f) => setFiles((p) => [...p, f])}
            onRemove={(idx) => setFiles((p) => p.filter((_, i) => i !== idx))}
            onUploadPress={handleUploadToMyBox}
          />

          <Checklist title="제출 서류 체크리스트" items={checklistItems} />

          {isEditMode ? (
            // 수정 모드: 지원취소 버튼만
            <TouchableOpacity
              style={[styles.cancelButton, { 
                opacity: canceling ? 0.6 : 1,
                marginTop: 12, 
                marginHorizontal: 12,
                backgroundColor: '#8B95A1' // 회색 계열로 변경
              }]}
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

      {/* MyBox 서류 선택 모달 */}
      <Modal
        visible={showMyBoxModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMyBoxModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>MyBox 서류 선택</Text>
              <TouchableOpacity onPress={() => setShowMyBoxModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {myDocuments.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>MyBox에 저장된 서류가 없습니다.</Text>
                  <TouchableOpacity 
                    style={styles.uploadButton}
                    onPress={() => {
                      setShowMyBoxModal(false);
                      setShowUploadModal(true);
                    }}
                  >
                    <Text style={styles.uploadButtonText}>새 서류 업로드하기</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                myDocuments.map(doc => (
                  <TouchableOpacity
                    key={doc.id}
                    style={[
                      styles.documentItem,
                      selectedDocuments.has(doc.id.toString()) && styles.documentItemSelected
                    ]}
                    onPress={() => {
                      const newSelected = new Set(selectedDocuments);
                      if (newSelected.has(doc.id.toString())) {
                        newSelected.delete(doc.id.toString());
                      } else {
                        newSelected.add(doc.id.toString());
                      }
                      setSelectedDocuments(newSelected);
                    }}
                  >
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentName}>{doc.fileName}</Text>
                      <Text style={styles.documentMeta}>
                        {(doc.sizeBytes / 1024 / 1024).toFixed(2)}MB · {new Date(doc.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={[
                      styles.checkbox,
                      selectedDocuments.has(doc.id.toString()) && styles.checkboxSelected
                    ]}>
                      {selectedDocuments.has(doc.id.toString()) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            
            {myDocuments.length > 0 && (
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.cancelModalButton}
                  onPress={() => {
                    setSelectedDocuments(new Set());
                    setShowMyBoxModal(false);
                  }}
                >
                  <Text style={styles.cancelModalButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.selectButton,
                    selectedDocuments.size === 0 && styles.selectButtonDisabled
                  ]}
                  onPress={handleSelectFromMyBox}
                  disabled={selectedDocuments.size === 0}
                >
                  <Text style={styles.selectButtonText}>
                    선택 ({selectedDocuments.size})
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* 서류 업로드 모달 */}
      <DocumentUploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadComplete}
        mode="scholarship"
        scholarshipNm={scholarship?.id}
        documentNm={`doc_${Date.now()}`} // 고유한 문서명 생성
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({ 
  phone: { width: 360, paddingVertical: 8 },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#8B95A1',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // 업로드 옵션 버튼들
  uploadOptions: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginBottom: 8,
    gap: 8,
  },
  uploadOptionButton: {
    flex: 1,
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E8FF',
  },
  uploadOptionText: {
    color: '#6B86FF',
    fontSize: 14,
    fontWeight: '600',
  },
  // 모달 스타일들
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    padding: 4,
  },
  modalContent: {
    maxHeight: 400,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#6B86FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  documentItemSelected: {
    borderColor: '#6B86FF',
    backgroundColor: '#F0F4FF',
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 12,
    color: '#666',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#6B86FF',
    borderColor: '#6B86FF',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  cancelModalButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  selectButton: {
    flex: 1,
    backgroundColor: '#6B86FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonDisabled: {
    backgroundColor: '#CCC',
  },
  selectButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
