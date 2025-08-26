import React, { useMemo, useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, ImageBackground, Image, TouchableWithoutFeedback} from 'react-native';
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
  exam: '#FCA5A5',
  club: '#A7F3D0',
  mileage: '#BFDBFE',
};

const MyCalendar: React.FC<MyCalendarProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 10)); // 2025-08 (month: 0-indexed)

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentDate(prevMonth);
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentDate(nextMonth);
  };

  // 현재 월에 맞는 더미 일정 생성
  const events = useMemo<MyEvent[]>(() => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    return [
      { id: '1', title: '장학금', start: new Date(currentYear, currentMonth, 1),  end: new Date(currentYear, currentMonth, 1),allDay: true, category: 'notice'},
      { id: '2', title: '동아리 모임',start: new Date(currentYear, currentMonth, 3), end: new Date(currentYear, currentMonth, 3),allDay: true, category: 'club'},
      { 
        id: '3', 
        title: '중간 점검', 
        start: new Date(currentYear, currentMonth, 10), 
        end: new Date(currentYear, currentMonth, 10), 
        allDay: true, 
        category: 'mileage'
      },
      {
        id: '4',
        title: '시험 공지',
        start: new Date(currentYear, currentMonth, 13),
        end: new Date(currentYear, currentMonth, 13),
        allDay: true,
        category: 'exam',
      },
      {
        id: '5',
        title: '프로젝트 발표',
        start: new Date(currentYear, currentMonth, 23),
        end: new Date(currentYear, currentMonth, 23),
        allDay: true,
        category: 'notice',
      },
    ];
  }, [currentDate]);

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
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
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


        {/* 달력 흰색 컨테이너 */}
        <View style={styles.calendarWrap}>
          <Calendar<MyEvent>
            mode="month"
            locale="ko"
            date={currentDate}
            events={events}
            height={400}
            weekStartsOn={0}
            swipeEnabled
            // ✅ 겹침/선/여백 튜닝
            headerContainerStyle={styles.calHeader}
            headerContentStyle={styles.calHeaderContent}
            calendarCellStyle={styles.calCell} // 내부 그리드만 hairline
            eventCellStyle={() => ({ backgroundColor: 'transparent', borderWidth: 0 })}
            renderEvent={(event, touchableOpacityProps) => (
              <TouchableOpacity
                {...touchableOpacityProps}
                style={[styles.chip, { backgroundColor: CAT_COLORS[event.category ?? 'notice'] }]}
              >
                <Text numberOfLines={1} style={styles.chipText}>
                  {event.title}
                </Text>
              </TouchableOpacity>
            )}
            onPressEvent={(e) => console.log('event', e)}
            onPressCell={(d) => console.log('cell date', d)}
          />
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0},
  background: { flex: 1},
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16},
  leftWrap: { width: 96, justifyContent: 'center'},
  rightWrap: { width: 96, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'},
  backButton: { padding: 8},
  backText: { fontSize: 16, color: '#8FA1FF', fontWeight: '600'},
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#333'},
  iconBtn: { padding: 4, marginLeft: 8},
  icon: { width: 20, height: 20, resizeMode: 'contain'},

  yearMonthContainer: { flexDirection: 'row', marginHorizontal: 12, marginTop: 6, marginBottom: 8, alignItems: 'center', justifyContent: 'center'},
  yearMonthText: { fontSize: 20, fontWeight: '700', color: '#333',marginHorizontal: 20},
  navButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8FA1FF',
  },

  calendarWrap: {
    marginHorizontal: 12,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',  // 완전 흰색 배경
    padding: 10,
    minHeight: 400,  // 최소 높이 설정
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  calHeader: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
  calHeaderContent: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'transparent',
    // marginBottom 제거로 흰 선 없애기
  },
  calCell: {
    // 내부 그리드 라인만 아주 얇게
    borderColor: 'rgba(0,0,0,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent',
  },

  // 이벤트 칩
  chip: {
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 3,
    minHeight: 16,
  },
  chipText: {
    fontSize: 8,
    lineHeight: 12,
    color: '#111',
  },
});

export default MyCalendar;