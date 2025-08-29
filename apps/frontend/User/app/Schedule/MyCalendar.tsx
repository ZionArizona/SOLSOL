import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-big-calendar';
import { ScholarshipItemCard } from '../../components/scholarship/ScholarshipItemCard';
import { SectionBox } from '../../components/scholarship/SectionBox';
import { useAuth } from '../../contexts/AuthContext';
import { scholarshipApi } from '../../services/scholarship.api';
import PersonalDetailSchedule from './PersonalDetailSchedule'; // [ADD]
import PersonalSchedule from './PersonalSchedule';

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
  notifyMinutes?: number;          // [ADD] 상세 모달에 보여주기 위함
  repeatText?: string;             // [ADD] 옵션
  memo?: string;                   // [ADD] 옵션
};

type Scholarship = {
  id: number;
  scholarshipName: string;
  amount: number;
  recruitmentStartDate: string;
  recruitmentEndDate: string;
};

const CAT_COLORS: Record<NonNullable<MyEvent['category']>, string> = {
  notice: '#BFDBFE',
  exam: '#BFDBFE',
  club: '#BFDBFE',
  mileage: '#BFDBFE',
};

const MyCalendar: React.FC<MyCalendarProps> = ({ onBack }) => {
  // 뒤로가기 처리
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    }
  };
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 10)); // 2025-08 (month: 0-indexed)
  const [events, setEvents] = useState<MyEvent[]>([]);
  
  // 모달 상태 관리 (등록)
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 상세 모달 상태 관리  // [ADD]
  const [detailVisible, setDetailVisible] = useState(false);      // [ADD]
  const [detailEvent, setDetailEvent] = useState<MyEvent | null>(null); // [ADD]
  
  // 장학금 관련 상태
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(false);

  // 이전/다음 달 이동
  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentDate(prevMonth);
  };
  const goToNextMonth = () => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentDate(nextMonth);
  };

  // [ADD] 문자열 날짜/시간을 로컬 Date로 만드는 유틸 (UTC 파싱 이슈 방지)
  const toLocalDateTime = (dateStr: string, timeStr: string) => {
    // date: 'YYYY-MM-DD', time: 'HH:mm' 또는 'HH:mm:ss'
    const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
    const [hh, mm] = timeStr.split(':').slice(0, 2).map((n) => parseInt(n, 10));
    return new Date(y, (m - 1), d, hh, mm, 0, 0);
  };

  // 개인 일정 로드
  const loadPersonalSchedules = async () => {
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

      if (!userNm) {
        console.warn('userNm을 찾을 수 없습니다.');
        setEvents([]);
        return;
      }

      console.log('📅 개인 일정 로드 시작, userNm:', userNm);
      
      // 백엔드에 개인 일정 요청 (기본 경로: /api + /calendar)
      const response = await require('../../services/api').apiClient.post('/calendar', { userNm });
      
      console.log('📅 개인 일정 로드 성공:', response);
      console.log('📅 받은 응답 전체:', JSON.stringify(response, null, 2));
      
      const responseData = response?.data || response;
      
      if (responseData?.schedules && Array.isArray(responseData.schedules)) {
        console.log(`📅 총 ${responseData.count}개의 일정을 불러왔습니다.`);
        
        const personalEvents: MyEvent[] = responseData.schedules.map((schedule: any) => {
          // 'HH:mm:ss' → 앞의 HH:mm만 사용해 로컬 Date 생성
          const startStr = (schedule.startTime || '').substring(0, 5); // "01:00"
          const endStr   = (schedule.endTime || '').substring(0, 5);   // "02:00"

          const startDateTime = toLocalDateTime(schedule.scheduleDate, startStr); // [CHANGE] 로컬 Date
          const endDateTime   = toLocalDateTime(schedule.scheduleDate, endStr);   // [CHANGE]

          return {
            id: `personal_${schedule.id}`,
            title: schedule.scheduleName,
            start: startDateTime,
            end: endDateTime,
            allDay: false,
            category: 'notice',
            notifyMinutes: schedule.notifyMinutes ?? 0, // [ADD] 상세 표시에 사용
          };
        });
        
        console.log('📅 변환된 이벤트 데이터:', personalEvents);
        setEvents(personalEvents);
      } else if (responseData?.count === 0) {
        console.log('📅 등록된 개인 일정이 없습니다.');
        setEvents([]);
      } else {
        console.log('📅 예상치 못한 응답 형식:', response);
        console.log('📅 responseData 확인:', responseData);
        setEvents([]);
      }
      
    } catch (error) {
      console.error('❌ 개인 일정 로드 실패:', error);
      setEvents([]);
    }
  };

  // 컴포넌트 마운트 시 개인 일정 로드
  React.useEffect(() => {
    loadPersonalSchedules();
  }, []);
  
  // 월 변경 시 다시 로드하고 싶다면 주석 해제
  React.useEffect(() => {
    // loadPersonalSchedules();
  }, [currentDate]);

  // 장학금 데이터 로드
  useEffect(() => {
    loadScholarships();
  }, []);

  const urgentScholarships = useMemo(() => {
    if (!scholarships || !Array.isArray(scholarships)) return [];
    const urgent = scholarships.filter(scholarship => {
      if (!scholarship.recruitmentEndDate) return false;
      const end = new Date(scholarship.recruitmentEndDate);
      if (isNaN(end.getTime())) return false;
      const today = new Date();
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 10;
    });
    return urgent;
  }, [scholarships]);
  
  // 셀 탭 → 등록 모달
  const openScheduleModal = (date: Date) => {
    setSelectedDate(date);
    setScheduleModalVisible(true);
  };
  
  // 이벤트 탭 → 상세 모달  // [ADD]
  const openDetailModal = (e: MyEvent) => {
    setDetailEvent(e);
    setDetailVisible(true);
  };

  // 등록 완료 콜백
  const handleScheduleSave = ({ title, start, end, notifyMinutes }: { title: string; start: Date; end: Date; notifyMinutes: number }) => {
    const newEvent: MyEvent = {
      id: `personal_${Date.now()}`,
      title,
      start,
      end,
      allDay: false,
      category: 'notice',
      notifyMinutes, // [ADD]
    };
    setEvents(prev => [...prev, newEvent]);
    // 필요하면 서버 재조회
    // setTimeout(() => loadPersonalSchedules(), 600);
  };
  
  // 등록 모달 닫기
  const handleScheduleClose = () => {
    setScheduleModalVisible(false);
    setSelectedDate(null);
  };

  // 상세 액션 (선택 사항)  // [ADD]
  const handleEdit = (id: string) => {
    // 예: 수정 플로우로 라우팅하거나 PersonalSchedule 열어서 값 바인딩
    console.log('edit:', id);
    setDetailVisible(false);
  };
  const handleDelete = async (id: string) => {
    console.log('MyCalendar - 일정 삭제:', id);
    
    // events 배열에서 해당 id의 일정 제거
    setEvents(prev => prev.filter(event => event.id !== id));
    
    // 상세 모달 닫기
    setDetailVisible(false);
    
    console.log('✅ MyCalendar - 일정이 달력에서 제거되었습니다.');
  };

  // 장학금
  const handleScholarshipPress = (scholarshipId: number) => {
    router.push(`/Scholarship/ScholarshipDetail?id=${scholarshipId}`);
  };
  const loadScholarships = async () => {
    try {
      setLoading(true);
      try {
        const response = await scholarshipApi.getScholarships({ page: 0, size: 20, status: 'OPEN' });
        if (response && response.scholarships) {
          setScholarships(response.scholarships);
        } else {
          setScholarships([]);
        }
      } catch (apiError) {
        console.log('📚 API 호출 실패:', apiError);
        setScholarships([]);
      }
    } catch (error) {
      console.error('장학금 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

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
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.backText}>← 뒤로</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.headerTitle}>나의 일정 관리</Text>

          <View style={styles.rightWrap}>
            <TouchableOpacity 
              onPress={() => { router.push('/Notifications/Notifications'); }} 
              style={styles.iconBtn}
            >
              <Image source={require('../../assets/images/BellIcon.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => { router.push('/'); }} 
              style={styles.iconBtn}
            >
              <Image source={require('../../assets/images/HomeIcon.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => { router.push('/Menu/Menu'); }} 
              style={styles.iconBtn}
            >
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

        {/* 달력 */}
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
            renderEvent={(event, touchableOpacityProps) => {
              const { key, ...pressableProps } = touchableOpacityProps ?? {};
              return (
                <TouchableOpacity
                  {...pressableProps}
                  style={[styles.chip, { backgroundColor: CAT_COLORS[event.category ?? 'notice'] }]}
                >
                  <Text numberOfLines={1} style={styles.chipText}>{event.title}</Text>
                </TouchableOpacity>
              );
            }}
            onPressCell={openScheduleModal}
            onPressEvent={openDetailModal}   // [ADD] 이벤트 탭 → 상세
          />
        </View>

        {/* 10일 이내 마감 장학금 섹션 */}
        <View style={styles.sectionContainer}>
          <SectionBox caption="10일 이내 신청 마감하는 장학금">
            <View style={styles.scholarshipScrollContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#6B86FF" />
                </View>
              ) : urgentScholarships.length > 0 ? (
                <ScrollView
                  style={styles.scholarshipScrollView}
                  contentContainerStyle={styles.scholarshipScrollContent}
                  showsVerticalScrollIndicator
                  nestedScrollEnabled
                >
                  {urgentScholarships.map((scholarship) => (
                    <View key={`urgent-${scholarship.id}`} style={{ marginBottom: 12 }}>
                      <ScholarshipItemCard
                        title={scholarship.scholarshipName}
                        amount={scholarship.amount.toLocaleString()}
                        period={`${new Date(scholarship.recruitmentStartDate).toLocaleDateString()} ~ ${new Date(scholarship.recruitmentEndDate).toLocaleDateString()}`}
                        status={(function() {
                          const end = new Date(scholarship.recruitmentEndDate);
                          const today = new Date();
                          const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          if (diffDays < 0) return '마감됨';
                          if (diffDays === 0) return '오늘 마감';
                          if (diffDays === 1) return '내일 마감';
                          if (diffDays <= 7) return `${diffDays}일 남음`;
                          return '신청 가능';
                        })()}
                        onPress={() => handleScholarshipPress(scholarship.id)}
                      />
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>마감 임박 장학금이 없습니다.</Text>
                </View>
              )}
            </View>
          </SectionBox>
        </View>
      </ImageBackground>
      
      {/* 등록 모달 */}
      <PersonalSchedule
        isVisible={scheduleModalVisible}
        selectedDate={selectedDate}
        onClose={handleScheduleClose}
        onSave={handleScheduleSave}
      />

      {/* 상세 모달 */}  {/* [ADD] */}
      <PersonalDetailSchedule
        isVisible={detailVisible}
        event={detailEvent}
        onClose={() => setDetailVisible(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
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
  navButtonText: { fontSize: 18, fontWeight: '600', color: '#8FA1FF' },

  calendarWrap: {
    marginHorizontal: 12,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 10,
    minHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  calHeader: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 0, backgroundColor: 'transparent' },
  calHeaderContent: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'transparent' },
  calCell: { borderColor: 'rgba(0,0,0,0.08)', borderWidth: StyleSheet.hairlineWidth, backgroundColor: 'transparent' },

  chip: { borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2, marginTop: 3, minHeight: 16 },
  chipText: { fontSize: 8, lineHeight: 12, color: '#111' },

  sectionContainer: { flex: 1 },
  scholarshipScrollContainer: { height: 260 },
  scholarshipScrollView: { flex: 1 },
  scholarshipScrollContent: { paddingVertical: 8 },
  loadingContainer: { paddingVertical: 32, alignItems: 'center', justifyContent: 'center' },
  emptyState: { paddingVertical: 32, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, color: '#7C89A6', textAlign: 'center', fontWeight: '600' },
});

export default MyCalendar;