import React, { useState, useEffect } from "react";
import { ImageBackground, ScrollView, StatusBar, StyleSheet, View, ActivityIndicator, RefreshControl, Text } from "react-native";
import { router } from "expo-router";
import BG from "../../assets/images/SOLSOLBackground.png";
import { TopBar } from "../../components/scholarship/TopBar";
import { MileagePanel } from "../../components/scholarship/MileagePanel";
import { SummaryPanel } from "../../components/myScholarship/SummaryPanel";
import { StatusTabs } from "../../components/myScholarship/StatusTabs";
import { ScholarshipProgressCard } from "../../components/myScholarship/ScholarshipProgressCard";
import { scholarshipApi } from "../../services/scholarship.api";
import { applicationApi, Application } from "../../services/application.api";
import { bookmarkApi } from "../../services/bookmark.api";
import { mileageApi } from "../../services/mileage.api";
import { responsiveStyles, deviceInfo } from "../../styles/responsive";

export default function MyScholarshipPage() {
  const [activeTab, setActiveTab] = useState("전체");
  const [applications, setApplications] = useState<Application[]>([]);
  const [bookmarkedScholarships, setBookmarkedScholarships] = useState<any[]>([]);
  const [currentMileage, setCurrentMileage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 장학금의 현재 진행 상태 계산 (심사 기간 기준)
  const getApplicationStatus = (application: Application) => {
    const today = new Date();
    const appliedAt = new Date(application.appliedAt);
    
    // 가상의 심사 시작일 (신청 후 7일) - 실제로는 장학금 데이터에서 가져와야 함
    const evaluationStartDate = new Date(appliedAt);
    evaluationStartDate.setDate(evaluationStartDate.getDate() + 7);
    
    switch (application.state) {
      case 'PENDING':
        // 심사 시작일 전이면 "접수완료", 후면 "심사중"
        if (today < evaluationStartDate) {
          return { currentStep: 1, status: "접수완료" };
        } else {
          return { currentStep: 2, status: "심사중" };
        }
      case 'APPROVED':
        return { currentStep: 3, status: "합격" };
      case 'REJECTED':
        return { currentStep: 3, status: "불합격" };
      default:
        return { currentStep: 1, status: "진행중" };
    }
  };

  // 상태별 개수 계산
  const statusCounts = {
    total: applications.length,
    inProgress: applications.filter(app => {
      const { status } = getApplicationStatus(app);
      return status === "접수완료" || status === "심사중";
    }).length,
    approved: applications.filter(app => app.state === 'APPROVED').length,
    rejected: applications.filter(app => app.state === 'REJECTED').length,
  };

  // 승인된 장학금 총액 계산 (임시로 0으로 설정, 실제로는 API에서 받아와야 함)
  const totalBenefit = 0;

  // 찜목록 데이터 로드 함수
  const loadBookmarkedScholarships = async () => {
    try {
      console.log('🔖 Starting to load bookmarked scholarships...');
      const bookmarkedScholarships = await bookmarkApi.getMyBookmarks();
      console.log('🔖 Bookmarked scholarships API response:', bookmarkedScholarships);
      console.log('🔖 Bookmarked scholarships count:', bookmarkedScholarships?.length || 0);
      
      if (bookmarkedScholarships && bookmarkedScholarships.length > 0) {
        console.log('🔖 First bookmarked scholarship:', bookmarkedScholarships[0]);
      }
      
      setBookmarkedScholarships(bookmarkedScholarships || []);
      console.log('🔖 Bookmarked scholarships state updated');
    } catch (error) {
      console.error('🔖 Failed to fetch bookmarked scholarships:', error);
      setBookmarkedScholarships([]);
    }
  };

  // 데이터 로드 함수
  const loadData = async () => {
    try {
      setLoading(true);

      // 사용자 정보를 먼저 가져와서 마일리지 포함하여 가져오기
      const [applicationData, userInfoData] = await Promise.all([
        applicationApi.getMyApplications(),
        import('../../services/user.api').then(({ userApi }) => 
          userApi.getMyInfo().catch(e => {
            console.log('👤 MyScholarship: userApi failed:', e);
            return null;
          })
        ),
        loadBookmarkedScholarships()
      ]);

      console.log('📋 Application data loaded:', applicationData);
      console.log('👤 User info data loaded:', userInfoData);

      if (applicationData && Array.isArray(applicationData)) {
        setApplications(applicationData);
      } else {
        setApplications([]);
      }

      // 마일리지 설정 - 사용자 정보에서 우선 가져오기
      let mileageValue = 0;
      
      // 1차: 사용자 정보에서 직접 가져오기
      if (userInfoData && userInfoData.userMileage !== null && userInfoData.userMileage !== undefined) {
        mileageValue = userInfoData.userMileage;
        console.log('💰 MyScholarship: Got mileage from user data:', mileageValue);
      } else {
        // 2차: fallback으로 mileageApi 시도
        try {
          console.log('💰 MyScholarship: Trying fallback mileage API...');
          const mileageData = await mileageApi.getUserMileage();
          console.log('💰 MyScholarship: Fallback mileage data:', mileageData);
          
          if (mileageData && (mileageData.availableMileage || mileageData.totalMileage || mileageData.userMileage)) {
            mileageValue = mileageData.availableMileage || mileageData.totalMileage || mileageData.userMileage || 0;
            console.log('💰 MyScholarship: Got mileage from fallback API:', mileageValue);
          }
        } catch (mileageError) {
          console.log('💰 MyScholarship: Fallback mileage API failed:', mileageError);
        }
      }
      
      console.log('💰 MyScholarship: Final mileage value:', mileageValue);
      setCurrentMileage(mileageValue);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      setApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 새로고침 함수
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  // 장학금 카드 클릭 핸들러
  const handleScholarshipPress = (scholarshipId: string) => {
    router.push(`/Scholarship/ScholarshipDetail?id=${scholarshipId}`);
  };

  // 신청서를 ScholarshipProgressCard 형태로 변환
  const convertToProgressCard = (application: Application) => {
    const { currentStep, status } = getApplicationStatus(application);

    return {
      id: application.scholarshipNm?.toString() || application.userNm,
      title: application.scholarshipName || `장학금 ${application.scholarshipNm}`,
      amount: application.amount ? `${application.amount.toLocaleString()}원` : "미정",
      date: new Date(application.appliedAt).toLocaleDateString('ko-KR') + " 신청",
      steps: ["신청", "서류심사", "결과발표"],
      currentStep,
      status,
    };
  };

  // 북마크된 장학금을 ProgressCard 형태로 변환
  const convertBookmarkToProgressCard = (scholarship: any) => {
    return {
      id: scholarship.id?.toString() || scholarship.scholarshipId?.toString() || Math.random().toString(),
      title: scholarship.scholarshipName || scholarship.title || `장학금 ${scholarship.id}`,
      amount: `${scholarship.amount?.toLocaleString() || '미정'}원`,
      date: `마감일: ${scholarship.recruitmentEndDate ? new Date(scholarship.recruitmentEndDate).toLocaleDateString('ko-KR') : '미정'}`,
      steps: ["등록", "신청가능", "마감"],
      currentStep: scholarship.recruitmentStatus === 'OPEN' ? 2 : 
                  scholarship.recruitmentStatus === 'CLOSED' ? 3 : 1,
      status: scholarship.recruitmentStatus === 'OPEN' ? "신청가능" : 
             scholarship.recruitmentStatus === 'CLOSED' ? "마감" : "등록됨",
      type: "bookmark" // 북마크된 장학금임을 표시
    };
  };

  // 탭별 필터링된 데이터
  const getFilteredData = () => {
    switch (activeTab) {
      case "찜목록":
        console.log('🔖 Processing bookmarked scholarships:', bookmarkedScholarships);
        console.log('🔖 Number of bookmarked scholarships:', bookmarkedScholarships.length);
        return bookmarkedScholarships.map(convertBookmarkToProgressCard);
      
      case "전체":
        // 전체 탭에서는 신청한 장학금 + 찜한 장학금 모두 표시
        const applicationCards = applications.map(app => ({
          ...convertToProgressCard(app),
          type: "application" // 신청한 장학금임을 표시
        }));
        
        const bookmarkCards = bookmarkedScholarships.map(scholarship => ({
          ...convertBookmarkToProgressCard(scholarship),
          type: "bookmark" // 북마크된 장학금임을 표시
        }));
        
        // 중복 제거 (같은 장학금을 신청하고 찜했을 수도 있음)
        const allCards = [...applicationCards, ...bookmarkCards];
        const uniqueCards = allCards.filter((card, index, self) => 
          index === self.findIndex(c => c.id === card.id)
        );
        
        console.log('📊 전체 탭 - 신청:', applicationCards.length, '찜:', bookmarkCards.length, '전체(중복제거):', uniqueCards.length);
        return uniqueCards;
      
      default:
        // 다른 상태별 탭들은 신청한 장학금만 표시
        return applications.filter(application => {
          const { status } = getApplicationStatus(application);
          
          switch (activeTab) {
            case "접수완료":
              return status === "접수완료";
            case "심사중":
              return status === "심사중";
            case "합격":
              return application.state === 'APPROVED';
            case "불합격":
              return application.state === 'REJECTED';
            default:
              return true;
          }
        }).map(convertToProgressCard);
    }
  };

  const filteredData = getFilteredData();

  if (loading) {
    return (
      <ImageBackground source={BG} style={responsiveStyles.backgroundWrapper} resizeMode="cover">
        <StatusBar barStyle="dark-content" />
        <View style={responsiveStyles.centeredWrapper}>
          <ActivityIndicator size="large" color="#6B86FF" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={BG} style={responsiveStyles.backgroundWrapper} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={responsiveStyles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={deviceInfo.isTablet ? responsiveStyles.cardContainer : responsiveStyles.container}>
          <TopBar title="마이 장학금" />

          {/* 마일리지 패널 */}
          <MileagePanel points={currentMileage} />

          {/* 신청 현황 요약 */}
          <SummaryPanel 
            total={statusCounts.total} 
            inProgress={statusCounts.inProgress} 
            approved={statusCounts.approved} 
            benefit={totalBenefit} 
          />

          {/* 상태 탭 */}
          <StatusTabs
            tabs={["전체", "찜목록", "접수완료", "심사중", "합격", "불합격"]}
            active={activeTab}
            onChange={setActiveTab}
          />

          {/* 장학금 리스트 */}
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <ScholarshipProgressCard 
                key={item.id} 
                scholarship={item}
                onPress={() => handleScholarshipPress(item.id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {activeTab === "전체" 
                  ? "아직 신청한 장학금이 없습니다." 
                  : activeTab === "찜목록"
                  ? "찜한 장학금이 없습니다."
                  : `${activeTab} 상태의 장학금이 없습니다.`
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    padding: deviceInfo.isTablet ? 60 : 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: deviceInfo.isTablet ? 16 : 14,
    color: "#7C89A6",
    textAlign: 'center',
    fontWeight: '600',
  },
});
