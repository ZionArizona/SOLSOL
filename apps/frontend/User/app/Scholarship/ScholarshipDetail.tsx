import React from "react";
import { ImageBackground, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import BG from "../../assets/images/SOLSOLBackground.png";
import { TopBar } from "../../components/scholarship/TopBar";
import { DetailHeaderCard } from "../../components/scholarship/DetailHeaderCard";
import { InfoPanel } from "../../components/scholarship/InfoPanel";
import { PrimaryButton } from "../../components/scholarship/PrimaryButton";
import { router } from "expo-router";

export default function ScholarshipDetail() {
  return (
    <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }}>
        <View style={styles.phone}>
          <TopBar title="장학금 상세" />
          <DetailHeaderCard
            title="성적우수 장학금"
            amount="500,000"
          />

          {/* 신청기간 */}
          <InfoPanel
            title="신청 기간"
            headerIcon="calendar"
            body={
              <>
                <InfoPanel.P muted>2025년 7월 11일 ~ 2025년 7월 31일</InfoPanel.P>
                <InfoPanel.P accent>1일 남음</InfoPanel.P>
              </>
            }
          />

          {/* 장학금 설명 */}
          <InfoPanel
            title="장학금 설명"
            headerIcon="note"
            body={
              <InfoPanel.P>
                직전 학기 성적이 3.5 이상인 학생을 대상으로 지급하는 장학금입니다.
                학업에 대한 열정과 우수한 성과를 보인 학생들을 격려하고
                지원하기 위해 마련되었습니다.
              </InfoPanel.P>
            }
          />

          {/* 지원 자격 */}
          <InfoPanel
            title="지원 자격"
            headerIcon="spark"
            body={
              <>
                <InfoPanel.Bullet>재학생 (휴학생 제외)</InfoPanel.Bullet>
                <InfoPanel.Bullet>직전 학기 평균평점 3.5 이상</InfoPanel.Bullet>
                <InfoPanel.Bullet>등급과 미납자 제외</InfoPanel.Bullet>
              </>
            }
          />

          {/* 제출 서류 */}
          <InfoPanel
            title="제출 서류"
            headerIcon="file"
            body={
              <>
                <InfoPanel.Bullet>성적증명서</InfoPanel.Bullet>
                <InfoPanel.Bullet>재학증명서</InfoPanel.Bullet>
                <InfoPanel.Bullet>장학금 신청서</InfoPanel.Bullet>
              </>
            }
          />

          <PrimaryButton
            label="지원하기"
            onPress={() => router.push("/Scholarship/ScholarshipApplyForm")}
            style={{ marginTop: 16, marginHorizontal: 12 }}
          />

        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  phone: { width: 360, paddingVertical: 8 },
});
