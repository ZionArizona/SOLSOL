import React, { useState, useEffect } from "react";
import { ImageBackground, ScrollView, StatusBar, StyleSheet, View, ActivityIndicator, RefreshControl, Text } from "react-native";
import BG from "../../assets/images/SOLSOLBackground.png";
import { TopBar } from "../../components/scholarship/TopBar";
import { MileagePanel } from "../../components/scholarship/MileagePanel";
import { SummaryPanel } from "../../components/myScholarship/SummaryPanel";
import { StatusTabs } from "../../components/myScholarship/StatusTabs";
import { ScholarshipProgressCard } from "../../components/myScholarship/ScholarshipProgressCard";
import { scholarshipApi, Application } from "../../services/scholarship.api";
import { mileageApi } from "../../services/mileage.api";

export default function MyScholarshipPage() {
  const [activeTab, setActiveTab] = useState("전체");
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentMileage, setCurrentMileage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 상태별 개수 계산
  const statusCounts = {
    total: applications.length,
    inProgress: applications.filter(app => app.status === 'PENDING').length,
    approved: applications.filter(app => app.status === 'APPROVED').length,
    rejected: applications.filter(app => app.status === 'REJECTED').length,
  };

  // 승인된 장학금 총액 계산 (임시로 0으로 설정, 실제로는 API에서 받아와야 함)
  const totalBenefit = 0;

  // 데이터 로드 함수
  const loadData = async () => {
    try {
      setLoading(true);

      const [applicationData, mileageData] = await Promise.all([
        scholarshipApi.getMyApplications(),
        mileageApi.getUserMileage()
      ]);

      if (applicationData) {
        setApplications(applicationData.applications);
      }

      if (mileageData) {
        setCurrentMileage(mileageData.currentMileage);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
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

  // 탭별 필터링된 신청서
  const filteredApplications = applications.filter(application => {
    switch (activeTab) {
      case "접수완료":
        return application.status === 'PENDING';
      case "심사중":
        return application.status === 'PENDING';
      case "면접":
        return application.status === 'PENDING';
      case "합격":
        return application.status === 'APPROVED';
      case "불합격":
        return application.status === 'REJECTED';
      default:
        return true;
    }
  });

  // 신청서를 ScholarshipProgressCard 형태로 변환
  const convertToProgressCard = (application: Application) => {
    // 상태에 따른 진행 단계 계산
    let currentStep = 1;
    let status = "진행중";
    
    switch (application.status) {
      case 'PENDING':
        currentStep = 2;
        status = "심사중";
        break;
      case 'APPROVED':
        currentStep = 4;
        status = "합격";
        break;
      case 'REJECTED':
        currentStep = 4;
        status = "불합격";
        break;
    }

    return {
      id: application.applicationNm.toString(),
      title: application.scholarshipTitle,
      amount: "미정", // API에서 금액 정보가 없는 경우
      date: new Date(application.appliedAt).toLocaleDateString('ko-KR') + " 신청",
      steps: ["신청", "서류심사", "면접", "결과발표"],
      currentStep,
      status,
    };
  };

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

  return (
    <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.phone}>
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
            tabs={["전체", "접수완료", "심사중", "면접", "합격", "불합격"]}
            active={activeTab}
            onChange={setActiveTab}
          />

          {/* 장학금 리스트 */}
          {filteredApplications.length > 0 ? (
            filteredApplications.map((application) => (
              <ScholarshipProgressCard 
                key={application.applicationNm} 
                scholarship={convertToProgressCard(application)} 
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {activeTab === "전체" 
                  ? "아직 신청한 장학금이 없습니다." 
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
  phone: { width: 360, paddingVertical: 8 },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#7C89A6",
    textAlign: 'center',
    fontWeight: '600',
  },
});
