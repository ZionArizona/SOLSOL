import { router } from 'expo-router';
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
import { scholarshipApi } from '../../services/scholarship.api';

type MyEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  category?: 'notice' | 'exam' | 'club' | 'mileage';
};

const CAT_COLORS: Record<NonNullable<MyEvent['category']>, string> = {
  notice: '#FDE68A', exam: '#FCA5A5', club: '#A7F3D0', mileage: '#BFDBFE',
};

/** 백엔드 응답(필요 필드만) */
type ScholarshipResponse = {
  id: number;
  scholarshipName: string;
  recruitmentEndDate: string; // "YYYY-MM-DD"
};
type ApiResponse<T> = { data?: T } | T;

type ListItem = { id: string; title: string; daysLeft: number };

const MS_DAY = 24 * 60 * 60 * 1000;
const startOfToday = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const parseLocalDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0); // 시간을 00:00:00으로 설정
};
const diffDaysFromToday = (until: Date) => {
  const today = startOfToday();
  const targetDate = new Date(until.getFullYear(), until.getMonth(), until.getDate(), 0, 0, 0, 0);
  return Math.ceil((targetDate.getTime() - today.getTime()) / MS_DAY) - 1;
};
const formatNumber = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const MyCalendar = () => {
const { user } = useAuth() as any;
const mileage = typeof (user as any)?.userMileage === 'number' ? (user as any).userMileage : 0;

const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 10)); // 2025-08
const [loading, setLoading] = useState(false);
const [errorText, setErrorText] = useState<string | null>(null);
const [list, setList] = useState<ListItem[]>([]);

const goToPreviousMonth = () => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d); };
const goToNextMonth     = () => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d); };

  // 달력 더미
const events = useMemo<MyEvent[]>(() => {
    const y = currentDate.getFullYear(); const m = currentDate.getMonth();
    return [
      { id: '1', title: '장학금',       start: new Date(y, m, 1),  end: new Date(y, m, 1),  allDay: true, category: 'notice' },
      { id: '2', title: '동아리 모임',   start: new Date(y, m, 3),  end: new Date(y, m, 3),  allDay: true, category: 'club' },
      { id: '3', title: '중간 점검',     start: new Date(y, m, 10), end: new Date(y, m, 10), allDay: true, category: 'mileage' },
      { id: '4', title: '시험 공지',     start: new Date(y, m, 13), end: new Date(y, m, 13), allDay: true, category: 'exam' },
      { id: '5', title: '프로젝트 발표', start: new Date(y, m, 23), end: new Date(y, m, 23), allDay: true, category: 'notice' },
    ];
  }, [currentDate]);

  // 진입시 GET /api/scholarships
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setErrorText(null);
      try {
        console.log('🎓 MyCalendar: 장학금 목록 요청 시작');
        const response = await scholarshipApi.getScholarships();
        
        console.log('🎓 MyCalendar: API 응답:', response);
        
        if (response && response.scholarships) {
          const today = startOfToday();
          console.log('📅 오늘 날짜:', today.toLocaleDateString('ko-KR'));
          
          const items: ListItem[] = response.scholarships
            .map(s => {
              const end = parseLocalDate(s.recruitmentEndDate);
              const daysLeft = diffDaysFromToday(end);
              
              console.log(`📅 ${s.scholarshipName}:`);
              console.log(`   - 원본 날짜: ${s.recruitmentEndDate}`);
              console.log(`   - 파싱된 날짜: ${end.toLocaleDateString('ko-KR')} ${end.toLocaleTimeString('ko-KR')}`);
              console.log(`   - D-Day: ${daysLeft}`);
              console.log(`   - 시간 차이(ms): ${end.getTime() - today.getTime()}`);
              
              return { id: String(s.id), title: s.scholarshipName, daysLeft };
            })
            .filter(it => it.daysLeft >= 0)
            .sort((a,b) => a.daysLeft - b.daysLeft);

          console.log('🎓 MyCalendar: 처리된 아이템들:', items);
          if (alive) setList(items);
        } else {
          console.log('❌ MyCalendar: 응답 데이터 구조가 예상과 다름');
          throw new Error('장학금 데이터를 받지 못했습니다.');
        }
      } catch (e: any) {
        console.error('❌ MyCalendar: API 호출 실패:', e);
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
      <ImageBackground source={require('../../assets/images/SOLSOLBackground.png')} style={styles.background} resizeMode="cover">

        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.leftWrap}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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

        {/* ✅ 마일리지 카드 */}
        <View style={styles.mileageCard}>
          <View style={{ flex: 1 }}>
            {/* <Text style={styles.mileageLabel}>회원님의 현재 마일리지는</Text> */}
            {/* <Text style={styles.mileagePoint}>
              {formatNumber(mileage)} <Text style={styles.mileageUnit}>P</Text>
            </Text> */}

            <View style={styles.mileageBtnRow}>
              <TouchableOpacity style={[styles.mileageBtn, styles.mileagePrimary]} onPress={() => { router.push("/Scholarship/ScholarshipApply") }}>
                <Text style={styles.mileagePrimaryText}>장학금 목록</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.mileageBtn, styles.mileageSecondary]} onPress={() => { /* TODO: navigate */ }}>
                <Text style={styles.mileageSecondaryText}>마일리지 적립 목록</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 이미지가 없으면 아래 줄을 주석 처리하거나 다른 이미지를 넣어주세요 */}
          {/* <Image source={require('../../assets/images/MileageBear.png')} style={styles.mileageImage} /> */}
        </View>

        {/* 상단 년월 네비 */}
        <View style={styles.yearMonthContainer}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}><Text style={styles.navButtonText}>←</Text></TouchableOpacity>
          <Text style={styles.yearMonthText}>{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}><Text style={styles.navButtonText}>→</Text></TouchableOpacity>
        </View>

        {/* 달력 */}
        <View style={styles.calendarWrap}>
          <Calendar<MyEvent>
            mode="month"
            locale="ko"
            date={currentDate}
            events={events}
            height={380}
            weekStartsOn={0}
            swipeEnabled
            headerContainerStyle={styles.calHeader}
            headerContentStyle={styles.calHeaderContent}
            calendarCellStyle={styles.calCell}
            eventCellStyle={() => ({ backgroundColor: 'transparent', borderWidth: 0 })}
            renderEvent={(event, touchableOpacityProps) => (
              <TouchableOpacity {...touchableOpacityProps} style={[styles.chip, { backgroundColor: CAT_COLORS[event.category ?? 'notice'] }]}>
                <Text numberOfLines={1} style={styles.chipText}>{event.title}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* 섹션 타이틀 */}
        <TouchableOpacity onPress={() => router.push("/Scholarship/ScholarshipApply")}>
          <Text style={styles.sectionTitle}>이번주 장학금 목록</Text>
        </TouchableOpacity>

        {/* 흰 박스(스크롤) */}
        <View style={styles.weeklyWrap}>
          {loading ? (
            <View style={styles.centerBox}><ActivityIndicator /><Text style={styles.loadingText}>불러오는 중…</Text></View>
          ) : errorText ? (
            <View style={styles.centerBox}><Text style={styles.errorText}>{errorText}</Text></View>
          ) : list.length === 0 ? (
            <View style={styles.centerBox}><Text style={styles.emptyText}>표시할 장학금이 없어요.</Text></View>
          ) : (
            <ScrollView 
              contentContainerStyle={styles.weeklyContent} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {list.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  onPress={() => {
                    console.log('📱 장학금 아이템 클릭:', item.title);
                    console.log('📱 이동 경로: /Scholarship/ScholarshipApply');
                    router.push("/Scholarship/ScholarshipApply");
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.greenRow}>
                    <Text style={styles.greenTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.greenDays}>{`마감 ${item.daysLeft}일전`}</Text>
                  </View>
                </TouchableOpacity>
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

  // 헤더
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 },
  leftWrap: { width: 96, justifyContent: 'center' },
  rightWrap: { width: 96, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: '#8FA1FF', fontWeight: '600' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#333' },
  iconBtn: { padding: 4, marginLeft: 8 },
  icon: { width: 20, height: 20, resizeMode: 'contain' },

  // 마일리지 카드
  mileageCard: {
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 10,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mileageLabel: { fontSize: 13, color: '#4B5563', marginBottom: 4, fontWeight: '600' },
  mileagePoint: { fontSize: 28, fontWeight: '900', color: '#111827', marginBottom: 12 },
  mileageUnit: { fontSize: 22, fontWeight: '900', color: '#111827' },
  mileageBtnRow: { flexDirection: 'row', gap: 10 },
  mileageBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 },
  mileagePrimary: { backgroundColor: '#8FA1FF' },
  mileagePrimaryText: { color: '#fff', fontWeight: '800' },
  mileageSecondary: { backgroundColor: '#6B7280' },
  mileageSecondaryText: { color: '#fff', fontWeight: '800' },
  mileageImage: { width: 80, height: 80, resizeMode: 'contain', marginLeft: 8 },

  // 상단 년월
  yearMonthContainer: { flexDirection: 'row', marginHorizontal: 12, marginBottom: 8, alignItems: 'center', justifyContent: 'center' },
  yearMonthText: { fontSize: 20, fontWeight: '700', color: '#333', marginHorizontal: 20 },
  navButton: {
    padding: 12, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2,
  },
  navButtonText: { fontSize: 18, fontWeight: '600', color: '#8FA1FF' },

  // 달력 카드
  calendarWrap: {
    marginHorizontal: 12, marginBottom: 10, borderRadius: 16, backgroundColor: '#FFFFFF',
    padding: 10, minHeight: 360,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5,
  },
  calHeader: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 0, backgroundColor: 'transparent' },
  calHeaderContent: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'transparent' },
  calCell: { borderColor: 'rgba(0,0,0,0.08)', borderWidth: StyleSheet.hairlineWidth, backgroundColor: 'transparent' },

  chip: { borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2, marginTop: 3, minHeight: 16 },
  chipText: { fontSize: 8, lineHeight: 12, color: '#111' },

  // 섹션 타이틀
  sectionTitle: { marginTop: 8, marginLeft: 16, marginBottom: 6, fontSize: 14, fontWeight: '700', color: '#333' },

  // 이번주 박스
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
    backgroundColor: '#7ED957', borderRadius: 10,
    paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  greenTitle: { fontSize: 16, fontWeight: '800', color: '#114411', maxWidth: '75%' },
  greenDays:  { fontSize: 16, fontWeight: '800', color: '#114411' },
});

export default MyCalendar;