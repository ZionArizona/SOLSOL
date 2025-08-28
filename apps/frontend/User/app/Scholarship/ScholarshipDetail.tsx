import React, { useState, useEffect } from "react";
import { ImageBackground, ScrollView, StatusBar, StyleSheet, View, ActivityIndicator, Alert, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import BG from "../../assets/images/SOLSOLBackground.png";
import { TopBar } from "../../components/scholarship/TopBar";
import { DetailHeaderCard } from "../../components/scholarship/DetailHeaderCard";
import { InfoPanel } from "../../components/scholarship/InfoPanel";
import { PrimaryButton } from "../../components/scholarship/PrimaryButton";
import { router } from "expo-router";
import { scholarshipApi, Scholarship } from "../../services/scholarship.api";
import { bookmarkApi } from "../../services/bookmark.api";
import { applicationApi } from "../../services/application.api";
import { notificationApi } from "../../services/notification.api";
import { useWebSocket } from "../../contexts/WebSocketContext";

export default function ScholarshipDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  
  const { markAsRead } = useWebSocket();

  // 특정 장학금과 관련된 알림들을 읽음 처리하는 함수
  const markNotificationsAsReadForScholarship = async (scholarshipId: number) => {
    try {
      console.log(`📖 Marking notifications as read for scholarship: ${scholarshipId}`);
      
      // 모든 알림을 가져와서 이 장학금과 관련된 것들을 찾음
      const notifications = await notificationApi.getUserNotifications();
      
      // 이 장학금 ID와 관련된 알림들 필터링
      const relatedNotifications = notifications.filter(notification => 
        notification.relatedId === scholarshipId && !notification.isRead
      );
      
      console.log(`📖 Found ${relatedNotifications.length} unread notifications for scholarship ${scholarshipId}`);
      
      // 각각의 알림을 읽음 처리
      for (const notification of relatedNotifications) {
        try {
          await notificationApi.markAsRead(notification.id);
          markAsRead(notification.id);
          console.log(`✅ Marked notification ${notification.id} as read`);
        } catch (error) {
          console.warn(`⚠️ Failed to mark notification ${notification.id} as read:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Failed to mark scholarship notifications as read:', error);
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return "날짜 정보 없음";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "날짜 정보 오류";
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // 기간 포맷팅 함수
  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return "기간 정보 없음";
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };

  // 마감일까지 남은 일수 계산
  const getDaysLeft = (endDate: string) => {
    if (!endDate) return "정보 없음";
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return "정보 오류";
    
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "마감됨";
    if (diffDays === 0) return "오늘 마감";
    if (diffDays === 1) return "내일 마감";
    return `${diffDays}일 남음`;
  };

  // 신청 가능 여부 확인
  const isApplicationOpen = () => {
    if (!scholarship) return false;
    
    // 모집 상태가 CLOSED인 경우
    if (scholarship.recruitmentStatus === 'CLOSED') return false;
    
    // 모집 종료일이 지난 경우
    if (scholarship.recruitmentEndDate) {
      const endDate = new Date(scholarship.recruitmentEndDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      if (today > endDate) return false;
    }
    
    return scholarship.recruitmentStatus === 'OPEN';
  };

  // 신청 상태 메시지 생성
  const getApplicationStatusMessage = () => {
    if (!scholarship) return "확인 중...";
    
    const isOpen = isApplicationOpen();
    const daysLeft = getDaysLeft(scholarship.recruitmentEndDate);
    
    if (!isOpen) {
      if (daysLeft === "마감됨") return "모집 마감";
      if (scholarship.recruitmentStatus === 'CLOSED') return "모집 마감";
      return "신청 불가";
    }
    
    // 모집 시작일 확인
    if (scholarship.recruitmentStartDate) {
      const startDate = new Date(scholarship.recruitmentStartDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      
      if (today < startDate) return "신청 예정";
    }
    
    return "신청 가능";
  };

  // 북마크 토글 함수
  const handleBookmarkToggle = async () => {
    if (!id) return;
    
    setBookmarkLoading(true);
    try {
      const newBookmarkStatus = await bookmarkApi.toggleBookmark(parseInt(id));
      setIsBookmarked(newBookmarkStatus);
      
      const message = newBookmarkStatus ? '찜목록에 추가되었습니다.' : '찜목록에서 제거되었습니다.';
      Alert.alert('알림', message);
    } catch (error) {
      console.error('북마크 토글 오류:', error);
      Alert.alert('오류', '찜하기 처리 중 오류가 발생했습니다.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  // 신청 버튼 라벨 결정
  const getApplicationButtonLabel = () => {
    if (!hasApplied) return "지원하기";
    
    switch (applicationStatus) {
      case 'REJECTED':
        return "재신청하기";
      case 'PENDING':
        return "수정하기";
      case 'APPROVED':
        return "합격됨";
      default:
        return "수정하기";
    }
  };

  // 신청 버튼 활성화 여부 확인
  const isApplicationButtonEnabled = () => {
    if (!isApplicationOpen()) return false;
    if (applicationStatus === 'APPROVED') return false; // 합격한 경우 수정 불가
    return true;
  };

  // 장학금 신청 페이지로 이동
  const handleApply = () => {
    if (!id) return;
    
    // 신청이 불가능한 경우 알림 표시
    if (!isApplicationOpen()) {
      Alert.alert('알림', '현재 신청할 수 없는 장학금입니다.');
      return;
    }
    
    // 합격한 경우 알림
    if (applicationStatus === 'APPROVED') {
      Alert.alert('알림', '이미 합격한 장학금입니다.');
      return;
    }
    
    const editMode = hasApplied ? '&edit=true' : '';
    router.push(`/Scholarship/ScholarshipApplyForm?scholarshipId=${id}${editMode}`);
  };

  // 장학금 데이터 로드
  useEffect(() => {
    const loadScholarship = async () => {
      if (!id) {
        Alert.alert('오류', '장학금 ID가 없습니다.');
        router.back();
        return;
      }

      try {
        setLoading(true);
        
        // 장학금 정보, 북마크 상태, 신청 상태를 병렬로 로드
        const [scholarshipData, bookmarkStatus, applicationData] = await Promise.all([
          scholarshipApi.getScholarship(parseInt(id)),
          bookmarkApi.isBookmarked(parseInt(id)),
          applicationApi.getApplicationByScholarship(parseInt(id))
        ]);
        
        console.log('🎓 Scholarship detail data:', scholarshipData);
        console.log('🔖 Bookmark status:', bookmarkStatus);
        console.log('📋 Application data:', applicationData);
        
        // 이 장학금과 관련된 알림을 자동으로 읽음 처리
        await markNotificationsAsReadForScholarship(parseInt(id));
        
        if (scholarshipData) {
          setScholarship(scholarshipData);
          setIsBookmarked(bookmarkStatus);
          setHasApplied(!!applicationData);
          setApplicationStatus(applicationData?.state || null);
        } else {
          Alert.alert('오류', '장학금 정보를 찾을 수 없습니다.');
          router.back();
        }
      } catch (error) {
        console.error('장학금 상세 정보 로드 오류:', error);
        Alert.alert('오류', '장학금 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadScholarship();
  }, [id]);

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
          <TopBar title="장학금 상세" />
          <DetailHeaderCard
            title={scholarship.scholarshipName}
            amount={scholarship.amount.toLocaleString()}
          />

          {/* 신청기간 */}
          <InfoPanel
            title="신청 기간"
            headerIcon="calendar"
            body={
              <>
                <InfoPanel.P muted>
                  {formatDateRange(scholarship.recruitmentStartDate, scholarship.recruitmentEndDate)}
                </InfoPanel.P>
                <InfoPanel.P accent>
                  {getDaysLeft(scholarship.recruitmentEndDate)}
                </InfoPanel.P>
              </>
            }
          />

          {/* 장학금 설명 */}
          <InfoPanel
            title="장학금 설명"
            headerIcon="note"
            body={
              <InfoPanel.P>
                {scholarship.description || "장학금 설명이 없습니다."}
              </InfoPanel.P>
            }
          />

          {/* 지원 자격 */}
          <InfoPanel
            title="지원 자격"
            headerIcon="spark"
            body={
              <InfoPanel.P>
                {scholarship.eligibilityCondition || "지원 자격 정보가 없습니다."}
              </InfoPanel.P>
            }
          />

          {/* 평가 기준 */}
          <InfoPanel
            title="평가 기준"
            headerIcon="file"
            body={
              <>
                {scholarship.criteria && scholarship.criteria.length > 0 ? (
                  scholarship.criteria.map((criterion, index) => (
                    <InfoPanel.Bullet key={index}>
                      {criterion.name} ({criterion.weightPercent}%)
                    </InfoPanel.Bullet>
                  ))
                ) : (
                  <InfoPanel.P>평가 기준 정보가 없습니다.</InfoPanel.P>
                )}
              </>
            }
          />

          {/* 연락처 정보 */}
          {scholarship.contactPersonName && (
            <InfoPanel
              title="문의처"
              headerIcon="phone"
              body={
                <>
                  <InfoPanel.P>담당자: {scholarship.contactPersonName}</InfoPanel.P>
                  {scholarship.contactPhone && (
                    <InfoPanel.P>전화: {scholarship.contactPhone}</InfoPanel.P>
                  )}
                  {scholarship.contactEmail && (
                    <InfoPanel.P>이메일: {scholarship.contactEmail}</InfoPanel.P>
                  )}
                  {scholarship.officeLocation && (
                    <InfoPanel.P>위치: {scholarship.officeLocation}</InfoPanel.P>
                  )}
                </>
              }
            />
          )}

          {/* 상태 정보 표시 */}
          <InfoPanel
            title="신청 상태"
            headerIcon="info"
            body={
              <>
                <InfoPanel.P accent>
                  {getApplicationStatusMessage()}
                </InfoPanel.P>
                {hasApplied && applicationStatus && (
                  <InfoPanel.P muted>
                    {applicationStatus === 'PENDING' && '심사 진행중입니다'}
                    {applicationStatus === 'APPROVED' && '축하합니다! 선발되었습니다'}
                    {applicationStatus === 'REJECTED' && '아쉽게도 탈락하였지만 재신청이 가능합니다'}
                  </InfoPanel.P>
                )}
              </>
            }
          />

          {/* 북마크 버튼 */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, marginHorizontal: 12 }}>
            <TouchableOpacity
              style={[styles.bookmarkButton, { backgroundColor: isBookmarked ? '#FF6B6B' : '#E0E0E0' }]}
              onPress={handleBookmarkToggle}
              disabled={bookmarkLoading}
            >
              <Text style={[styles.bookmarkButtonText, { color: isBookmarked ? '#FFFFFF' : '#666666' }]}>
                {bookmarkLoading ? '처리중...' : (isBookmarked ? '💖 찜해제' : '🤍 찜하기')}
              </Text>
            </TouchableOpacity>

            {isApplicationButtonEnabled() ? (
              <PrimaryButton
                label={getApplicationButtonLabel()}
                onPress={handleApply}
                style={{ flex: 1 }}
              />
            ) : (
              <TouchableOpacity
                style={[
                  styles.disabledButton, 
                  applicationStatus === 'APPROVED' && styles.approvedButton
                ]}
                disabled={true}
              >
                <Text style={[
                  styles.disabledButtonText,
                  applicationStatus === 'APPROVED' && styles.approvedButtonText
                ]}>
                  {applicationStatus === 'APPROVED' ? '합격됨' : getApplicationStatusMessage()}
                </Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  phone: { width: 360, paddingVertical: 8 },
  bookmarkButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  bookmarkButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999999',
  },
  approvedButton: {
    backgroundColor: '#4CAF50',
  },
  approvedButtonText: {
    color: '#FFFFFF',
  },
});
