import React, { useState } from "react";
import { ImageBackground, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import BG from "../../assets/images/SOLSOLBackground.png";
import { TopBar } from "../../components/scholarship/TopBar";
import { MileagePanel } from "../../components/scholarship/MileagePanel";
import { SummaryPanel } from "../../components/myScholarship/SummaryPanel";
import { StatusTabs } from "../../components/myScholarship/StatusTabs";
import { ScholarshipProgressCard } from "../../components/myScholarship/ScholarshipProgressCard";

export default function MyScholarshipPage() {
  const [activeTab, setActiveTab] = useState("전체");

  // 샘플 데이터
  const scholarships = [
    {
      id: "1",
      title: "성적우수 장학금",
      amount: "50만원",
      date: "7월 15일 신청",
      steps: ["신청", "서류심사", "면접", "결과발표"],
      currentStep: 4,
      status: "합격",
    },
  ];

  return (
    <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }}>
        <View style={styles.phone}>
          <TopBar title="마이 장학금" />

          {/* 2. 신청 현황 요약 */}
          <SummaryPanel total={7} inProgress={4} approved={2} benefit={90} />

          {/* 3. 상태 탭 */}
          <StatusTabs
            tabs={["전체", "접수완료", "심사중", "면접", "합격", "불합격"]}
            active={activeTab}
            onChange={setActiveTab}
          />

          {/* 4. 장학금 리스트 */}
          {scholarships.map((s) => (
            <ScholarshipProgressCard key={s.id} scholarship={s} />
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  phone: { width: 360, paddingVertical: 8 },
});
