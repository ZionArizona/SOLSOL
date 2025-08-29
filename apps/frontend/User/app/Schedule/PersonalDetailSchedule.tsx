import React, { useMemo } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

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

  const dateLine = useMemo(() => {
    if (!hasEvent || !event) return '';
    return formatKoreanDate(event.start);
  }, [event, hasEvent]);

  const timeLine = useMemo(() => {
    if (!hasEvent || !event) return '';
    return `${toKoreanAmPm(event.start)} - ${toKoreanAmPm(event.end)}`;
  }, [event, hasEvent]);

  const alarmText = useMemo(() => notifyToText(event?.notifyMinutes), [event?.notifyMinutes]);

  return (
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

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>캘린더</Text>
              <Text style={styles.infoVal}>사용자화</Text>
            </View>
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
              <TouchableOpacity style={[styles.actionBtn, styles.actionDanger]} onPress={() => onDelete?.(event!.id)}>
                <Text style={[styles.actionText, styles.actionDangerText]}>삭제</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
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
});

export default PersonalDetailSchedule;