import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar } from 'react-native-big-calendar';
import { useAuth } from '../../contexts/AuthContext';

interface MyCalendarProps {
  onBack: () => void;
}

type MyEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  category?: 'notice' | 'exam' | 'club' | 'mileage';
};

const CAT_COLORS: Record<NonNullable<MyEvent['category']>, string> = {
  notice: '#FDE68A',
  exam:   '#FCA5A5',
  club:   '#A7F3D0',
  mileage:'#BFDBFE',
};

/** 백엔드 응답 타입 (필요 필드만) */
type ScholarshipResponse = {
  id: number;
  scholarshipName: string;
  recruitmentEndDate: string; // ISO-8601 "YYYY-MM-DD"
};

type ApiResponse<T> = {
  success?: boolean;
  code?: string;
  message?: string;
  data?: T;
} | T; // 혹시 바로 배열로 내려오는 경우도 대응

type ListItem = { id: string; title: string; daysLeft: number };

const API_BASE = 'http://10.0.2.2:8080';

const MS_DAY = 24 * 60 * 60 * 1000;
const startOfToday = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const parseLocalDate = (s: string) => {
  // "YYYY-MM-DD" → Date(YYYY, MM-1, DD, 23:59:59) (그 날 끝까지 유효)
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 23, 59, 59, 999);
};
const diffDaysFromToday = (until: Date) => {
  const today = startOfToday().getTime();
  const end = until.getTime();
  return Math.ceil((end - today) / MS_DAY);
};

const MyCalendar: React.FC<MyCalendarProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 10)); // 2025-08
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [list, setList] = useState<ListItem[]>([]);

  // 이전/다음 달
  const goToPreviousMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };
  const goToNextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  // 캘린더 더미 이벤트
  const events = useMemo<MyEvent[]>(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    return [
      { id: '1', title: '장학금',       start: new Date(y, m, 1),  end: new Date(y, m, 1),  allDay: true, category: 'notice' },
      { id: '2', title: '동아리 모임',   start: new Date(y, m, 3),  end: new Date(y, m, 3),  allDay: true, category: 'club' },
      { id: '3', title: '중간 점검',     start: new Date(y, m, 10), end: new Date(y, m, 10), allDay: true, category: 'mileage' },
      { id: '4', title: '시험 공지',     start: new Date(y, m, 13), end: new Date(y, m, 13), allDay: true, category: 'exam' },
      { id: '5', title: '프로젝트 발표', start: new Date(y, m, 23), end: new Date(y, m, 23), allDay: true, category: 'notice' },
    ];
  }, [currentDate]);

  /** 마운트 시 장학금 목록 호출 → 오늘 기준 유효(recruitmentEndDate >= today)만 필터 */
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErrorText(null);
      try {
        const res = await fetch(`${API_BASE}/api/scholarships`);
        const json: ApiResponse<ScholarshipResponse[]> = await res.json();

        const data: ScholarshipResponse[] = Array.isArray(json)
          ? json
          : (json as any).data ?? [];

        const items: ListItem[] = data
          .map((s) => {
            const end = parseLocalDate(s.recruitmentEndDate);
            return {
              id: String(s.id ?? s.scholarshipName),
              title: s.scholarshipName,
              endDate: end,
              daysLeft: diffDaysFromToday(end),
            };
          })
          // 오늘 기준 마감 지난 건 제외
          .filter((it) => it.daysLeft >= 0)
          // 마감 임박 순으로 정렬
          .sort((a, b) => a.daysLeft - b.daysLeft)
          // 필요하면 상위 N개만: .slice(0, 50)
          .map(({ id, title, daysLeft }) => ({ id, title, daysLeft }));

        if (alive) setList(items);
      } catch (e: any) {
        if (alive) setErrorText(e?.message ?? '장학금 목록을 불러오지 못했습니다.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar translucent={false} backgroundColor="#ffffff" barStyle="dark-content" />
      <ImageBackground
        source={require('../../assets/images/SOLSOLBackground.png')}
        style={styles.background}
        resizeMode="cover"
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.leftWrap}>
            <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.backText}>← 뒤로</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerTitle}>나의 일정 관리</Text>
          <View style={styles.rightWrap}>
            <TouchableOpacity onPress={() => {}} style={styles.iconBtn}>
              <Image source={require('../../assets/images/BellIcon.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}} style={styles.iconBtn}>
              <Image source={require('../../assets/images/HomeIcon.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}} style={styles.iconBtn}>
              <Image source={require('../../assets/images/HamburgerButton.png')} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 상단 년월 네비게이션 */}
        <View style={styles.yearMonthContainer}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.yearMonthText}>
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        {/* 달력 카드 */}
        <View style={styles.calendarWrap}>
          <Calendar<MyEvent>
            mode="month"
            locale="ko"
            date={currentDate}
            events={events}
            height={400}
            weekStartsOn={0}
            swipeEnabled
            headerContainerStyle={styles.calHeader}
            headerContentStyle={styles.calHeaderContent}
            calendarCellStyle={styles.calCell}
            eventCellStyle={() => ({ backgroundColor: 'transparent', borderWidth: 0 })}
            renderEvent={(event, touchableOpacityProps) => (
              <TouchableOpacity
                {...touchableOpacityProps}
                style={[styles.chip, { backgroundColor: CAT_COLORS[event.category ?? 'notice'] }]}
              >
                <Text numberOfLines={1} style={styles.chipText}>{event.title}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* 섹션 타이틀 */}
        <Text style={styles.sectionTitle}>이번주 장학금 목록</Text>

        {/* 흰 박스 (스크롤) */}
        <View style={styles.weeklyWrap}>
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>불러오는 중…</Text>
            </View>
          ) : errorText ? (
            <View style={styles.centerBox}>
              <Text style={styles.errorText}>{errorText}</Text>
            </View>
          ) : list.length === 0 ? (
            <View style={styles.centerBox}>
              <Text style={styles.emptyText}>표시할 장학금이 없어요.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.weeklyContent} showsVerticalScrollIndicator={false}>
              {list.map(item => (
                <View key={item.id} style={styles.greenRow}>
                  <Text style={styles.greenTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.greenDays}>{`+${item.daysLeft}일`}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0 },
  background: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 },
  leftWrap: { width: 96, justifyContent: 'center' },
  rightWrap: { width: 96, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: '#8FA1FF', fontWeight: '600' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#333' },
  iconBtn: { padding: 4, marginLeft: 8 },
  icon: { width: 20, height: 20, resizeMode: 'contain' },

  yearMonthContainer: { flexDirection: 'row', marginHorizontal: 12, marginTop: 6, marginBottom: 8, alignItems: 'center', justifyContent: 'center' },
  yearMonthText: { fontSize: 20, fontWeight: '700', color: '#333', marginHorizontal: 20 },
  navButton: {
    padding: 12, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2,
  },
  navButtonText: { fontSize: 18, fontWeight: '600', color: '#8FA1FF' },

  calendarWrap: {
    marginHorizontal: 12, marginBottom: 10, borderRadius: 16, backgroundColor: '#FFFFFF',
    padding: 10, minHeight: 400,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5,
  },
  calHeader: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 0, backgroundColor: 'transparent' },
  calHeaderContent: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'transparent' },
  calCell: { borderColor: 'rgba(0,0,0,0.08)', borderWidth: StyleSheet.hairlineWidth, backgroundColor: 'transparent' },

  chip: { borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2, marginTop: 3, minHeight: 16 },
  chipText: { fontSize: 8, lineHeight: 12, color: '#111' },

  sectionTitle: { marginTop: 8, marginLeft: 16, marginBottom: 6, fontSize: 14, fontWeight: '700', color: '#333' },

  weeklyWrap: {
    marginHorizontal: 12, marginBottom: 16, borderRadius: 16, backgroundColor: '#FFFFFF',
    paddingVertical: 10, paddingHorizontal: 10, height: 260, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 4,
  },
  weeklyContent: { paddingBottom: 6 },

  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 6, color: '#6B7280' },
  errorText: { color: '#EF4444' },
  emptyText: { color: '#9CA3AF' },

  greenRow: {
    backgroundColor: '#7ED957',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greenTitle: { fontSize: 16, fontWeight: '800', color: '#114411', maxWidth: '75%' },
  greenDays:  { fontSize: 16, fontWeight: '800', color: '#114411' },
});

export default MyCalendar;