import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import { InfoEditPanel } from "../../components/mypage/InfoEditPanel";
import { NavBar } from "../../components/mypage/NavBar";
import { PasswordChangePanel } from "../../components/mypage/PasswordChangePanel";
import { TopBar } from "../../components/scholarship/TopBar";
import { UserCircleIcon } from "../../components/shared/icons";
import { colors } from "../../theme/colors";
import { responsiveStyles, deviceInfo } from "../../styles/responsive";
import { ResponsiveBackground } from "../../components/shared/ResponsiveBackground";

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("info");

  return (
    <ResponsiveBackground>
      <StatusBar barStyle="dark-content" />

      <View style={styles.myButtonWrap}>
        <TouchableOpacity
          onPress={() => router.push("/UserBasic/MyPage")}
          activeOpacity={0.85}
          style={styles.myButton}
        >
          <UserCircleIcon size={deviceInfo.isTablet ? 24 : 20} />
        </TouchableOpacity>
      </View>

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

  // 🔝 우상단 오버레이 스타일
  myButtonWrap: {
    position: "absolute",
    top: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 8,
    right: deviceInfo.isTablet ? 20 : 12,
    zIndex: 999,
    elevation: 999,
  },
  myButton: {
    padding: deviceInfo.isTablet ? 8 : 4,
  },
});