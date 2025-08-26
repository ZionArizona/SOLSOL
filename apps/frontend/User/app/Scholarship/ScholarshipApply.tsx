import React, { useMemo } from "react";
import { View, StyleSheet, ImageBackground, ScrollView, StatusBar } from "react-native";
import { router } from "expo-router";
import SOLBG from "../../assets/images/SOLSOLBackground.png";
import { TopBar } from "../../components/scholarship/TopBar";
import { MileagePanel } from "../../components/scholarship/MileagePanel";
import { FilterPanel } from "../../components/scholarship/FilterPanel";
import { ScholarshipItemCard } from "../../components/scholarship/ScholarshipItemCard";
import { SectionBox } from "../../components/scholarship/SectionBox";

export default function ScholarshipApply() {
  const items = useMemo(
    () => [
      { id: "1", title: "성적우수 장학금", amount: "500,000", period: "7/11 ~ 7/31", status: "오늘 마감" },
      { id: "2", title: "성적우수 장학금", amount: "500,000", period: "7/11 ~ 7/31", status: "오늘 마감" },
      { id: "3", title: "성적우수 장학금", amount: "500,000", period: "7/11 ~ 7/31", status: "오늘 마감" },
    ],
    []
  );

  const handleScholarshipPress = (scholarshipId: string) => {
    router.push(`/Scholarship/ScholarshipDetail?id=${scholarshipId}`);
  };

  return (
    <ImageBackground source={SOLBG} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.phone}>
          <TopBar title="장학금 신청" />

          <MileagePanel points={4000} />

          <FilterPanel />

          <SectionBox>
            {items.map((it) => (
              <View key={it.id} style={{ marginBottom: 12 }}>
                <ScholarshipItemCard
                  title={it.title}
                  amount={it.amount}
                  period={it.period}
                  status={it.status}
                  onPress={() => handleScholarshipPress(it.id)}
                />
              </View>
            ))}
          </SectionBox>

          <SectionBox caption="10일 이내 신청 마감하는 장학금" empty />
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
});
