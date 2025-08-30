import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { router } from "expo-router";
import { SectionBox } from "../scholarship/SectionBox";
import { ScholarshipItemCard } from "../scholarship/ScholarshipItemCard";
import { scholarshipApi } from "../../services/scholarship.api";

type Scholarship = {
  id: number;
  scholarshipName: string;
  amount: number;
  recruitmentStartDate: string;
  recruitmentEndDate: string;
};

export const UrgentScholarshipList = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUrgentScholarships();
  }, []);

  const loadUrgentScholarships = async () => {
    try {
      setLoading(true);
      const response = await scholarshipApi.getScholarships({ 
        page: 0, 
        size: 20, 
        status: 'OPEN' 
      });
      
      if (response && response.scholarships) {
        // 10일 이내 마감되는 장학금 필터링
        const now = new Date();
        const tenDaysLater = new Date();
        tenDaysLater.setDate(now.getDate() + 10);
        
        const urgentItems = response.scholarships.filter((scholarship: Scholarship) => {
          const endDate = new Date(scholarship.recruitmentEndDate);
          return endDate >= now && endDate <= tenDaysLater;
        });
        
        // 마감일 기준으로 정렬 (가까운 순)
        urgentItems.sort((a: Scholarship, b: Scholarship) => {
          return new Date(a.recruitmentEndDate).getTime() - new Date(b.recruitmentEndDate).getTime();
        });
        
        setScholarships(urgentItems);
      } else {
        setScholarships([]);
      }
    } catch (error) {
      console.error('긴급 장학금 로드 실패:', error);
      setScholarships([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (endDate: string): string => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '마감됨';
    if (diffDays === 0) return '오늘 마감';
    if (diffDays === 1) return '내일 마감';
    return `${diffDays}일 남음`;
  };

  const handleScholarshipPress = (scholarshipId: number) => {
    router.push(`/Scholarship/ScholarshipDetail?id=${scholarshipId}`);
  };

  return (
    <View style={styles.sectionContainer}>
      <SectionBox caption="10일 이내 신청 마감하는 장학금">
        <View style={styles.scholarshipScrollContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6B86FF" />
            </View>
          ) : scholarships.length > 0 ? (
            <ScrollView
              style={styles.scholarshipScrollView}
              contentContainerStyle={styles.scholarshipScrollContent}
              showsVerticalScrollIndicator
              nestedScrollEnabled
            >
              {scholarships.map((scholarship) => (
                <View key={`urgent-${scholarship.id}`} style={{ marginBottom: 12 }}>
                  <ScholarshipItemCard
                    title={scholarship.scholarshipName}
                    amount={scholarship.amount.toLocaleString()}
                    period={`${new Date(scholarship.recruitmentStartDate).toLocaleDateString()} ~ ${new Date(scholarship.recruitmentEndDate).toLocaleDateString()}`}
                    status={getDaysRemaining(scholarship.recruitmentEndDate)}
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
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginHorizontal: 0,
  },
  scholarshipScrollContainer: {
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.65)",
    padding: 8,
  },
  loadingContainer: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  scholarshipScrollView: {
    maxHeight: 240,
  },
  scholarshipScrollContent: {
    paddingVertical: 4,
  },
  emptyState: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#7A89A6",
    fontSize: 14,
    fontWeight: "600",
  },
});