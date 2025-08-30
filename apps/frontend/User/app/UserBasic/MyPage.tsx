import React, { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { InfoEditPanel } from "../../components/mypage/InfoEditPanel";
import { NavBar } from "../../components/mypage/NavBar";
import { PasswordChangePanel } from "../../components/mypage/PasswordChangePanel";
import { TopBar } from "../../components/scholarship/TopBar";
import { colors } from "../../theme/colors";
import { responsiveStyles, deviceInfo } from "../../styles/responsive";
import { ResponsiveBackground } from "../../components/shared/ResponsiveBackground";

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("info");

  return (
    <ResponsiveBackground>
      <StatusBar barStyle="dark-content" />


      <ScrollView contentContainerStyle={responsiveStyles.scrollContainer}>
        <View style={deviceInfo.isTablet ? responsiveStyles.cardContainer : responsiveStyles.container}>
          <TopBar title="마이페이지" />

          {/* 상단 네비게이션 */}
          <NavBar
            tabs={[
              { key: "info", label: "내 정보 확인" },
              { key: "password", label: "비밀번호 수정" },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          {/* 탭별 콘텐츠 */}
          {activeTab === "info" && <InfoEditPanel />}
          {activeTab === "password" && <PasswordChangePanel />}
        </View>
      </ScrollView>
    </ResponsiveBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bgFallback },
  container: { flex: 1, backgroundColor: "transparent" },

});