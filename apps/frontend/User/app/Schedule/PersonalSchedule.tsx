import DateTimePicker, { AndroidNativeProps, IOSNativeProps } from '@react-native-community/datetimepicker';
import React, { useEffect, useMemo, useState } from 'react';
import { ImageBackground, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { DocumentUploadModal } from '../../components/mydocs/DocumentUploadModal';
import { apiClient } from '../../services/api';
import { PersonalFileUploadPanel } from './PersonalFileUploadPanel';

type SavePayload = {
  title: string;
  start: Date;          // selectedDate + startTime
  end: Date;            // selectedDate + endTime (end < start면 +1일 처리 옵션)
  notifyMinutes: number; // 0, 5, 10, 30, 60 등
};

type Props = {
  isVisible: boolean;
  selectedDate: Date | null; // 달력에서 선택한 날짜(일자)
  onClose: () => void;
  onSave: (payload: SavePayload) => void;
};

const minuteOptions = [0, 5, 10, 30, 60];

const PersonalSchedule: React.FC<Props> = ({ isVisible, selectedDate, onClose, onSave }) => {
  // ── 제목
  const [title, setTitle] = useState('');

  // ── 첨부파일 상태
  const [attachedFiles, setAttachedFiles] = useState<{name: string; uri: string}[]>([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // ── 시간 (시간만 선택)
  const nearestHour = useMemo(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return d;
  }, []);

  const [startTime, setStartTime] = useState<Date>(nearestHour);
  const [endTime, setEndTime] = useState<Date>(new Date(nearestHour.getTime() + 60 * 60 * 1000));

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // ── 알림 시점
  const [notifyMinutes, setNotifyMinutes] = useState<number>(10);

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (isVisible) {
      // 모달이 열릴 때 모든 상태 초기화
      setTitle('');
      setAttachedFiles([]);
      
      // 시간도 기본값으로 리셋
      const resetHour = new Date();
      resetHour.setMinutes(0, 0, 0);
      resetHour.setHours(resetHour.getHours() + 1);
      
      setStartTime(resetHour);
      setEndTime(new Date(resetHour.getTime() + 60 * 60 * 1000));
      setNotifyMinutes(10);
    }
  }, [isVisible]);

  const timeLabel = (d: Date) =>
    `${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}`;

  const combineDateAndTime = (dateOnly: Date, timeOnly: Date) => {
    const dt = new Date(dateOnly);
    dt.setHours(timeOnly.getHours(), timeOnly.getMinutes(), 0, 0);
    return dt;
  };

  const handleSave = async () => {
    if (!selectedDate) {
      console.log('❌ 선택된 날짜가 없습니다.');
      return;
    }
    if (!title.trim()) {
      console.log('❌ 일정 제목을 입력해주세요.');
      return;
    }

    const start = combineDateAndTime(selectedDate, startTime);
    let end = combineDateAndTime(selectedDate, endTime);

    // 종료가 시작보다 이르면 동일 날짜로는 말이 안 되므로 +1일 처리(원하면 Alert 주고 막아도 됨)
    if (end <= start) {
      end = new Date(start.getTime() + 30 * 60 * 1000); // 최소 30분 보장
    }

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

      // 백엔드 API 호출을 위한 데이터 포맷팅
      const apiData = {
        userNm: userNm,
        date: selectedDate.toISOString().split('T')[0], // 'YYYY-MM-DD'
        scheduleName: title.trim(),
        startTime: `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`, // 'HH:mm'
        endTime: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`, // 'HH:mm'
        notifyMinutes: notifyMinutes,
      };

      console.log('📅 일정 저장 API 호출 시작');
      console.log('📤 전송할 데이터:', JSON.stringify(apiData, null, 2));
      console.log('🌐 전체 API URL:', `${apiClient.baseURL}/calendar/events`);
      console.log('🔐 현재 토큰 상태:', token ? `토큰 있음 (길이: ${token.length})` : '토큰 없음');
      console.log('👤 추출된 userNm:', userNm);

      // 백엔드 API 호출 (BASE_URL: /api + /calendar/events = /api/calendar/events)
      const response = await apiClient.post('/calendar/events', apiData);
      
      console.log('✅ 일정 저장 성공!');
      //console.log('📥 서버 응답 status:', response?.status);
      console.log('📥 서버 응답 data:', response?.data);
      
      // 부모 컴포넌트에 저장된 일정 데이터 전달
      onSave({ title: title.trim(), start, end, notifyMinutes });
      
      // 저장 완료 후 모달 닫기
      console.log('✅ 일정이 저장되었습니다.');
      onClose();

    } catch (error: any) {
      console.error('❌ 일정 저장 실패:', error?.message || '일정 저장에 실패했습니다.');
    }
  };

  // Android: picker를 열면 시스템 다이얼로그가 열렸다 닫히므로 state 플로우 주의
  const onChangeStart: AndroidNativeProps['onChange'] & IOSNativeProps['onChange'] = (e, date) => {
    if (Platform.OS === 'android') setShowStartPicker(false);
    if (date) setStartTime(date);
  };
  const onChangeEnd: AndroidNativeProps['onChange'] & IOSNativeProps['onChange'] = (e, date) => {
    if (Platform.OS === 'android') setShowEndPicker(false);
    if (date) setEndTime(date);
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

        {/* 상단바 */}
        <View style={styles.header}>
          <Text style={styles.title}>나의 일정 관리</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.done}>완료</Text>
          </TouchableOpacity>
        </View>

        {/* 본문 */}
        <View style={styles.content}>
          {/* 일정 등록 */}
          <Text style={styles.labelBig}>일정 등록</Text>
          <TextInput
            placeholder="일정 등록하기"
            value={title}
            onChangeText={setTitle}
            style={styles.textInput}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          {/* 시간 선택하기 */}
          <Text style={[styles.labelBig, { marginTop: 18 }]}>시간 선택하기</Text>
          <View style={styles.timeRow}>
            <TouchableOpacity style={styles.timeChip} onPress={() => setShowStartPicker(true)}>
              <Text style={styles.timeChipLabel}>시작</Text>
              <Text style={styles.timeChipValue}>{timeLabel(startTime)}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.timeChip} onPress={() => setShowEndPicker(true)}>
              <Text style={styles.timeChipLabel}>종료</Text>
              <Text style={styles.timeChipValue}>{timeLabel(endTime)}</Text>
            </TouchableOpacity>
          </View>

          {/* 알림 시점 선택 */}
          <Text style={[styles.labelBig, { marginTop: 18 }]}>알림 시점 선택</Text>
          <View style={styles.notifyRow}>
            {minuteOptions.map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.notifyChip,
                  notifyMinutes === m && styles.notifyChipActive,
                ]}
                onPress={() => setNotifyMinutes(m)}
              >
                <Text style={[
                  styles.notifyText,
                  notifyMinutes === m && styles.notifyTextActive
                ]}>
                  {m === 0 ? '없음' : (m === 60 ? '1시간 전' : `${m}분 전`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 첨부파일 */}
          <Text style={[styles.labelBig, { marginTop: 18 }]}>첨부파일</Text>
          <View style={styles.fileUploadContainer}>
            <PersonalFileUploadPanel
              files={attachedFiles}
              onAdd={(file) => setAttachedFiles(prev => [...prev, file])}
              onRemove={(index) => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
              onUploadPress={() => setShowDocumentModal(true)}
            />
          </View>
        </View>

        {/* iOS in-sheet pickers */}
        {Platform.OS === 'ios' && showStartPicker && (
          <DateTimePicker
            mode="time"
            value={startTime}
            onChange={onChangeStart}
            display="spinner"
            minuteInterval={5}
            style={styles.iosPicker}
          />
        )}
        {Platform.OS === 'ios' && showEndPicker && (
          <DateTimePicker
            mode="time"
            value={endTime}
            onChange={onChangeEnd}
            display="spinner"
            minuteInterval={5}
            style={styles.iosPicker}
          />
        )}

        {/* Android pickers are dialog based */}
        {Platform.OS === 'android' && showStartPicker && (
          <DateTimePicker
            mode="time"
            value={startTime}
            onChange={onChangeStart}
            is24Hour
            minuteInterval={5}
          />
        )}
        {Platform.OS === 'android' && showEndPicker && (
          <DateTimePicker
            mode="time"
            value={endTime}
            onChange={onChangeEnd}
            is24Hour
            minuteInterval={5}
          />
        )}
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
  title: { flex: 1, fontSize: 18, fontWeight: '700', color: '#333' },
  done: { fontSize: 16, fontWeight: '800', color: '#333' },

  content: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 18 },

  labelBig: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 10 },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111',
  },

  timeRow: { flexDirection: 'row', gap: 12},
  timeChip: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  timeChipLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4, fontWeight: '600' },
  timeChipValue: { fontSize: 18, color: '#111', fontWeight: '800' },

  notifyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  notifyChip: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)'},
  notifyChipActive: { borderColor: '#8FA1FF', shadowColor: '#8FA1FF', shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }},
  notifyText: { fontSize: 13, fontWeight: '700', color: '#333' },
  notifyTextActive: { color: '#4A5BFF' },

  iosPicker: {
    backgroundColor: '#fff',
  },

  // 첨부파일 컨테이너 - 크기 조절 가능
  fileUploadContainer: {
    minHeight: 360,        // 최소 높이 (조절 가능)
    maxHeight: 500,        // 최대 높이 (조절 가능)  
    width: '100%',         // 넓이 (조절 가능: 예: 300, '80%' 등)
    backgroundColor: '#f9f9f9',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 12,
  },
});

export default PersonalSchedule;
