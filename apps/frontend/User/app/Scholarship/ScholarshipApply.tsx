import React, { useMemo, useEffect, useState } from "react";
import { View, StyleSheet, ImageBackground, ScrollView, StatusBar, ActivityIndicator, Alert, RefreshControl, Text } from "react-native";
import { router } from "expo-router";
import { scholarshipApi, Scholarship, FilterParams } from "../../services/scholarship.api";
import { mileageApi } from "../../services/mileage.api";
import SOLBG from "../../assets/images/SOLSOLBackground.png";
import { TopBar } from "../../components/scholarship/TopBar";
import { MileagePanel } from "../../components/scholarship/MileagePanel";
import { FilterPanel } from "../../components/scholarship/FilterPanel";
import { ScholarshipItemCard } from "../../components/scholarship/ScholarshipItemCard";
import { SectionBox } from "../../components/scholarship/SectionBox";

export default function ScholarshipApply() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [currentMileage, setCurrentMileage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterParams>({ status: 'OPEN' });

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

  // 데이터 로드 함수
  const loadData = async (filterParams: FilterParams = currentFilter) => {
    try {
      setLoading(true);

      // 병렬로 데이터 로드 - 필터링된 장학금 데이터 사용
      const [scholarshipData, mileageData] = await Promise.all([
        scholarshipApi.getFilteredScholarships(filterParams),
        mileageApi.getUserMileage()
      ]);

      console.log('📚 Filtered scholarship data received:', scholarshipData);
      console.log('💰 Mileage data received:', mileageData);

      if (scholarshipData) {
        console.log('📚 Setting filtered scholarships:', scholarshipData.scholarships?.length || 0);
        if (scholarshipData.scholarships && scholarshipData.scholarships.length > 0) {
          console.log('📚 First filtered scholarship details:', scholarshipData.scholarships[0]);
          console.log('📚 Applied filter params:', filterParams);
        }
        setScholarships(scholarshipData.scholarships || []);
      } else {
        console.log('❌ No filtered scholarship data received');
        setScholarships([]);
      }

      if (mileageData) {
        console.log('💰 Setting current mileage:', mileageData.currentMileage);
        setCurrentMileage(mileageData.currentMileage);
      }
    } catch (error) {
      console.error('📚 Error loading filtered scholarship data:', error);
      Alert.alert('오류', '데이터를 불러오는 중 오류가 발생했습니다.');
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

  // 필터 변경 핸들러
  const handleFilterChange = (filterParams: FilterParams) => {
    console.log('🎯 Filter changed:', filterParams);
    console.log('🎯 Previous currentFilter:', currentFilter);
    setCurrentFilter(filterParams);
    loadData(filterParams);
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const handleScholarshipPress = (scholarshipId: number) => {
    router.push(`/Scholarship/ScholarshipDetail?id=${scholarshipId}`);
  };

  // 마감 임박 장학금 필터링 (10일 이내)
  const urgentScholarships = useMemo(() => {
    if (!scholarships || !Array.isArray(scholarships)) {
      return [];
    }
    return scholarships.filter(scholarship => {
      if (!scholarship.recruitmentEndDate) return false;
      const end = new Date(scholarship.recruitmentEndDate);
      if (isNaN(end.getTime())) return false;
      const today = new Date();
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 10;
    });
  }, [scholarships]);

  if (loading) {
    return (
      <ImageBackground source={SOLBG} style={styles.bg} resizeMode="cover">
        <StatusBar barStyle="dark-content" />
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#6B86FF" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={SOLBG} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.phone}>
          <TopBar title="장학금 신청" />

          <MileagePanel points={currentMileage} />

          <FilterPanel onFilterChange={handleFilterChange} initialFilter={currentFilter} />

          <SectionBox>
            {scholarships && scholarships.length > 0 ? (
              scholarships.map((scholarship) => (
                <View key={scholarship.id} style={{ marginBottom: 12 }}>
                  <ScholarshipItemCard
                    title={scholarship.scholarshipName}
                    amount={scholarship.amount.toLocaleString()}
                    period={formatDateRange(scholarship.recruitmentStartDate, scholarship.recruitmentEndDate)}
                    status={getDeadlineStatus(scholarship.recruitmentEndDate)}
                    category={scholarship.category}
                    onPress={() => handleScholarshipPress(scholarship.id)}
                  />
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>현재 신청 가능한 장학금이 없습니다.</Text>
              </View>
            )}
          </SectionBox>

          <SectionBox caption="10일 이내 신청 마감하는 장학금">
            {urgentScholarships.length > 0 ? (
              urgentScholarships.map((scholarship) => (
                <View key={`urgent-${scholarship.id}`} style={{ marginBottom: 12 }}>
                  <ScholarshipItemCard
                    title={scholarship.scholarshipName}
                    amount={scholarship.amount.toLocaleString()}
                    period={formatDateRange(scholarship.recruitmentStartDate, scholarship.recruitmentEndDate)}
                    status={getDeadlineStatus(scholarship.recruitmentEndDate)}
                    category={scholarship.category}
                    onPress={() => handleScholarshipPress(scholarship.id)}
                  />
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>마감 임박 장학금이 없습니다.</Text>
              </View>
            )}
          </SectionBox>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const PHONE_WIDTH = 360;

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flex: 1, backgroundColor: "transparent" },
  content: { alignItems: "center", paddingBottom: 24 },
  phone: { width: PHONE_WIDTH, paddingVertical: 8 },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: "#7C89A6",
    textAlign: 'center',
    fontWeight: '600',
  },
});
