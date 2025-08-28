import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-big-calendar';
import { ScholarshipItemCard } from '../../components/scholarship/ScholarshipItemCard';
import { SectionBox } from '../../components/scholarship/SectionBox';
import { useAuth } from '../../contexts/AuthContext';
import { scholarshipApi } from '../../services/scholarship.api';
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
};

type Scholarship = {
  id: number;
  scholarshipName: string;
  amount: number;
  recruitmentStartDate: string;
  recruitmentEndDate: string;
};

const CAT_COLORS: Record<NonNullable<MyEvent['category']>, string> = {
  notice: '#FDE68A',
  exam: '#FCA5A5',
  club: '#A7F3D0',
  mileage: '#BFDBFE',
};

const MyCalendar: React.FC<MyCalendarProps> = ({ onBack }) => {
  // 뒤로가기 처리
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // onBack이 없으면 router로 뒤로가기
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
  
  // 모달 상태 관리
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // 장학금 관련 상태
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(false);

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

  // 초기 더미 일정 설정
  React.useEffect(() => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const dummyEvents: MyEvent[] = [
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
    setEvents(dummyEvents);
  }, [currentDate]);

  // 장학금 데이터 로드
  useEffect(() => {
    loadScholarships();
  }, []);

  // 마감 임박 장학금 필터링 (10일 이내)
  const urgentScholarships = useMemo(() => {
    console.log('🚨 전체 장학금 수:', scholarships?.length || 0);
    
    if (!scholarships || !Array.isArray(scholarships)) {
      console.log('🚨 장학금 데이터가 없거나 배열이 아님');
      return [];
    }
    
    const urgent = scholarships.filter(scholarship => {
      if (!scholarship.recruitmentEndDate) {
        console.log('🚨 마감일이 없는 장학금:', scholarship.scholarshipName);
        return false;
      }
      
      const end = new Date(scholarship.recruitmentEndDate);
      if (isNaN(end.getTime())) {
        console.log('🚨 잘못된 마감일 형식:', scholarship.recruitmentEndDate);
        return false;
      }
      
      const today = new Date();
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      console.log(`🚨 ${scholarship.scholarshipName}: D-${diffDays} (${diffDays >= 0 && diffDays <= 10 ? '포함' : '제외'})`);
      
      return diffDays >= 0 && diffDays <= 10;
    });
    
    console.log('🚨 마감 임박 장학금 수:', urgent.length);
    return urgent;
  }, [scholarships]);
  
  // 모달 열기
  const openScheduleModal = (date: Date) => {
    setSelectedDate(date);
    setScheduleModalVisible(true);
  };
  
  // 일정 저장
  const handleScheduleSave = (title: string, date: Date) => {
    const newEvent: MyEvent = {
      id: `personal_${Date.now()}`,
      title,
      start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
      end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999),
      allDay: true,
      category: 'notice'
    };
    setEvents(prev => [...prev, newEvent]);
  };
  
  // 모달 닫기
  const handleScheduleClose = () => {
    setScheduleModalVisible(false);
    setSelectedDate(null);
  };

  // 날짜 포맷팅 함수
  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return "날짜 정보 없음";
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "날짜 정보 오류";
    
    const startStr = `${start.getMonth() + 1}/${start.getDate()}`;
    const endStr = `${end.getMonth() + 1}/${end.getDate()}`;
    return `${startStr} ~ ${endStr}`;
  };

  // 마감일 상태 계산
  const getDeadlineStatus = (endDate: string) => {
    if (!endDate) return "날짜 정보 없음";
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return "날짜 정보 오류";
    
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "마감됨";
    if (diffDays === 0) return "오늘 마감";
    if (diffDays === 1) return "내일 마감";
    if (diffDays <= 7) return `${diffDays}일 남음`;
    return "신청 가능";
  };

  // 장학금 클릭 핸들러
  const handleScholarshipPress = (scholarshipId: number) => {
    console.log('장학금 상세 보기:', scholarshipId);
    router.push(`/Scholarship/ScholarshipDetail?id=${scholarshipId}`);
  };

  // 장학금 데이터 로드
  const loadScholarships = async () => {
    try {
      setLoading(true);
      
      // 더미 장학금 데이터 추가 (테스트용)
      const dummyScholarships: Scholarship[] = [
        {
          id: 1,
          scholarshipName: "성적우수장학금",
          amount: 1000000,
          recruitmentStartDate: "2025-08-20",
          recruitmentEndDate: "2025-09-05", // 8일 후 마감
        },
        {
          id: 2,
          scholarshipName: "저소득층지원장학금",
          amount: 1500000,
          recruitmentStartDate: "2025-08-25",
          recruitmentEndDate: "2025-09-03", // 6일 후 마감
        },
        {
          id: 3,
          scholarshipName: "글로벌인재장학금",
          amount: 2000000,
          recruitmentStartDate: "2025-08-22",
          recruitmentEndDate: "2025-09-07", // 10일 후 마감
        }
      ];

      try {
        const response = await scholarshipApi.getScholarships({ 
          page: 0, 
          size: 20, 
          status: 'OPEN' 
        });
        
        if (response && response.scholarships) {
          console.log('📚 API에서 받은 장학금:', response.scholarships.length, '개');
          setScholarships([...dummyScholarships, ...response.scholarships]);
        } else {
          console.log('📚 API 응답이 없어서 더미 데이터만 사용');
          setScholarships(dummyScholarships);
        }
      } catch (apiError) {
        console.log('📚 API 호출 실패, 더미 데이터 사용:', apiError);
        setScholarships(dummyScholarships);
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
              onPress={() => {
                console.log('알림 페이지로 이동');
                router.push('/Notifications/Notifications');
              }} 
              style={styles.iconBtn}
            >
              <Image source={require('../../assets/images/BellIcon.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                console.log('홈으로 이동');
                router.push('/');
              }} 
              style={styles.iconBtn}
            >
              <Image source={require('../../assets/images/HomeIcon.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                console.log('메뉴 페이지로 이동');
                router.push('/Menu/Menu');
              }} 
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
          />
        </View>

        {/* 10일 이내 마감 장학금 섹션 (고정) */}
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
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                  {urgentScholarships.map((scholarship) => (
                    <View key={`urgent-${scholarship.id}`} style={{ marginBottom: 12 }}>
                      <ScholarshipItemCard
                        title={scholarship.scholarshipName}
                        amount={scholarship.amount.toLocaleString()}
                        period={formatDateRange(scholarship.recruitmentStartDate, scholarship.recruitmentEndDate)}
                        status={getDeadlineStatus(scholarship.recruitmentEndDate)}
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
      
      {/* PersonalSchedule 모달 */}
      <PersonalSchedule
        isVisible={scheduleModalVisible}
        selectedDate={selectedDate}
        onClose={handleScheduleClose}
        onSave={handleScheduleSave}
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

  // 섹션 컨테이너 (고정)
  sectionContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    flex: 1, // 남은 공간 차지
  },

  // 장학금 스크롤 컨테이너
  scholarshipScrollContainer: {
    height: 250, // 고정 높이로 변경 (원하는 높이로 조절)
  },

  // 장학금 전용 ScrollView
  scholarshipScrollView: {
    flex: 1,
  },
  
  scholarshipScrollContent: {
    paddingVertical: 8,
  },

  // 로딩 및 빈 상태
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#7C89A6',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default MyCalendar;