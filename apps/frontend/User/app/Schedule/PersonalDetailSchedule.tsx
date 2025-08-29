import React, { useMemo, useState } from 'react';
import { Alert, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { DocumentUploadModal } from '../../components/mydocs/DocumentUploadModal';
import { apiClient } from '../../services/api';
import { PersonalFileUploadPanel } from './PersonalFileUploadPanel';

type DetailEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  notifyMinutes?: number;   // 0, 5, 10, 30, 60 ...
  repeatText?: string;      // 예: "매주 토요일" / "없음"
  memo?: string;            // 메모/노트
};

type Props = {
  isVisible: boolean;
  event: DetailEvent | null | undefined;
  onClose: () => void;
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
};

const DAY_KO = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

const formatKoreanDate = (d: Date) => {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${DAY_KO[d.getDay()]}`;
};

const pad2 = (n: number) => n.toString().padStart(2, '0');

const toKoreanAmPm = (date: Date) => {
  const h = date.getHours();
  const m = date.getMinutes();
  const isPM = h >= 12;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${isPM ? '오후' : '오전'} ${h12}:${pad2(m)}`;
};

const notifyToText = (min?: number) => {
  if (min == null) return '없음';
  if (min === 0) return '없음';
  if (min === 60) return '1시간 전';
  return `${min}분 전`;
};

const PersonalDetailSchedule: React.FC<Props> = ({ isVisible, event, onClose, onEdit, onDelete }) => {
  const hasEvent = !!event;
  
  // 첨부파일 상태
  const [attachedFiles, setAttachedFiles] = useState<{name: string; uri: string}[]>([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const dateLine = useMemo(() => {
    if (!hasEvent || !event) return '';
    return formatKoreanDate(event.start);
  }, [event, hasEvent]);

  const timeLine = useMemo(() => {
    if (!hasEvent || !event) return '';
    return `${toKoreanAmPm(event.start)} - ${toKoreanAmPm(event.end)}`;
  }, [event, hasEvent]);

  const alarmText = useMemo(() => notifyToText(event?.notifyMinutes), [event?.notifyMinutes]);

  const handleDelete = async () => {
    if (!hasEvent || !event) return;

    Alert.alert(
      '일정 삭제',
      '정말로 이 일정을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: async () => {
            try {
              // 토큰에서 userNm 추출
              const token = await require('../../utils/tokenManager').default.getAccessToken();
              let userNm = null;
              if (token) {
                try {
                  const payload = require('../../utils/tokenManager').default.decodeAccessToken(token);
                  userNm = payload?.userNm || payload?.sub || payload?.userId;
                } catch (error) {
                  console.warn('토큰에서 userNm 추출 실패:', error);
                }
              }

              const deleteData = {
                userNm: userNm,
                scheduleName: event.title.trim()
              };

              console.log('🗑️ 일정 삭제 API 호출 시작');
              console.log('📤 전송할 데이터:', JSON.stringify(deleteData, null, 2));
              console.log('🌐 전체 API URL:', `${apiClient.baseURL}/calendar/delete`);

              // 토큰 헤더 생성
              const headers: any = {
                'Content-Type': 'application/json',
              };
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }

              // fetch를 직접 사용하여 text 응답 처리
              const response = await fetch(`${apiClient.baseURL}/calendar/delete`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(deleteData),
              });

              console.log('✅ 일정 삭제 API 호출 완료!');
              console.log('📊 응답 상태:', response.status);

              if (response.ok) {
                // 응답을 text로 읽기
                const responseText = await response.text();
                console.log('📥 응답 텍스트:', responseText);

                if (responseText === "ok") {
                  console.log('🎉 삭제 성공으로 판정!');
                  // 삭제 성공 시 모달 닫고 부모 컴포넌트에 삭제된 일정 ID 전달
                  onClose();
                  if (onDelete) onDelete(event.id);
                } else {
                  console.log('❌ 예상치 못한 응답:', responseText);
                  Alert.alert('삭제 실패', '일정 삭제에 실패했습니다.');
                }
              } else {
                console.log('❌ HTTP 오류:', response.status, response.statusText);
                Alert.alert('삭제 실패', `서버 오류가 발생했습니다. (${response.status})`);
              }

            } catch (error: any) {
              console.error('❌ 일정 삭제 실패:', error);
              Alert.alert(
                '삭제 실패', 
                error?.message || '일정 삭제에 실패했습니다. 다시 시도해주세요.'
              );
            }
          }
        }
      ]
    );
  };

  return (
    <>
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      swipeDirection="down"
      onSwipeComplete={onClose}
      propagateSwipe
      avoidKeyboard
      style={styles.bottomModal}
    >
      <View style={styles.sheet}>
        <ImageBackground
          source={require('../../assets/images/SOLSOLBackground.png')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>나의 일정 관리</Text>

          <View style={styles.headerRight}>
            {/* 편집 아이콘 대용 버튼 */}
            {hasEvent && onEdit && (
              <TouchableOpacity onPress={() => onEdit?.(event!.id)} style={styles.iconBtn}>
                <Text style={styles.iconText}>✎</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 내용 카드 */}
        <View style={styles.card}>
          {/* 제목 */}
          <Text numberOfLines={2} style={styles.title}>
            {hasEvent ? event!.title : '일정 없음'}
          </Text>

          {/* 날짜/시간 */}
          {hasEvent && (
            <>
              <Text style={styles.dateText}>{dateLine}</Text>
              <Text style={styles.timeText}>{timeLine}</Text>
            </>
          )}

          {/* 정보 그리드 */}
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>알림</Text>
              <Text style={styles.infoVal}>{alarmText}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>반복</Text>
              <Text style={styles.infoVal}>{event?.repeatText ?? '없음'}</Text>
            </View>

            {/* <View style={styles.infoRow}>
              <Text style={styles.infoKey}>캘린더</Text>
              <Text style={styles.infoVal}>사용자화</Text>
            </View> */}
          </View>

          {/* 메모 */}
          {event?.memo ? (
            <View style={{ marginTop: 18 }}>
              <Text style={styles.memoTitle}>메모</Text>
              <Text style={styles.memoText}>{event.memo}</Text>
            </View>
          ) : null}

          {/* 액션 버튼 */}
          <View style={styles.actionRow}>
            {onEdit && hasEvent && (
              <TouchableOpacity style={[styles.actionBtn, styles.actionPrimary]} onPress={() => onEdit?.(event!.id)}>
                <Text style={[styles.actionText, styles.actionPrimaryText]}>수정</Text>
              </TouchableOpacity>
            )}

            {onDelete && hasEvent && (
              <TouchableOpacity style={[styles.actionBtn, styles.actionDanger]} onPress={handleDelete}>
                <Text style={[styles.actionText, styles.actionDangerText]}>삭제</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 첨부파일 섹션 */}
          <View style={{ marginTop: 24 }}>
            <Text style={styles.attachmentTitle}>첨부파일</Text>
            <View style={styles.fileUploadContainer}>
              <PersonalFileUploadPanel
                files={attachedFiles}
                onAdd={(file) => setAttachedFiles(prev => [...prev, file])}
                onRemove={(index) => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                onUploadPress={() => setShowDocumentModal(true)}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>

    {/* DocumentUploadModal - Modal 밖에 배치 */}
    <DocumentUploadModal
      visible={showDocumentModal}
      onClose={() => setShowDocumentModal(false)}
      onUpload={(data) => {
        // 업로드된 파일을 첨부파일 목록에 추가
        setAttachedFiles(prev => [...prev, {
          name: data.fileName,
          uri: data.file.uri || ''
        }]);
        setShowDocumentModal(false);
      }}
    />
  </>);
};

const styles = StyleSheet.create({
  bottomModal: { justifyContent: 'flex-end', margin: 0 },
  sheet: {
    height: '90%',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: { fontSize: 18, color: '#8FA1FF', fontWeight: '800' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#333' },
  headerRight: { width: 40, alignItems: 'flex-end' },
  iconBtn: { padding: 6 },
  iconText: { fontSize: 16, color: '#333' },

  card: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  title: { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 8 },
  dateText: { fontSize: 13, color: '#6B7280', marginBottom: 4, fontWeight: '600' },
  timeText: { fontSize: 16, color: '#111', marginBottom: 18, fontWeight: '700' },

  infoGrid: { marginTop: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  infoKey: { fontSize: 14, color: '#111', fontWeight: '800' },
  infoVal: { fontSize: 14, color: '#4B5563', fontWeight: '600' },

  memoTitle: { fontSize: 14, color: '#111', fontWeight: '800', marginBottom: 6 },
  memoText: { fontSize: 14, color: '#111', fontWeight: '600' },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { fontSize: 15, fontWeight: '800' },
  actionPrimary: { backgroundColor: '#EAEFFF' },
  actionPrimaryText: { color: '#4A5BFF' },
  actionDanger: { backgroundColor: '#FFE8E8' },
  actionDangerText: { color: '#D14343' },

  // 첨부파일 스타일
  attachmentTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 10 },
  fileUploadContainer: {
    minHeight: 300,
    maxHeight: 400,
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 12,
  },
});

export default PersonalDetailSchedule;