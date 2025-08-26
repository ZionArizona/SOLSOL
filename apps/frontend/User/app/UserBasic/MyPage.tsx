import React, { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, ImageBackground, View, TouchableOpacity, Platform } from "react-native";
import BG from "../../assets/images/SOLSOLBackground.png";
import { TopBar } from "../../components/scholarship/TopBar";
import { NavBar } from "../../components/mypage/NavBar";
import { InfoEditPanel } from "../../components/mypage/InfoEditPanel";
import { PasswordChangePanel } from "../../components/mypage/PasswordChangePanel";
import { MyDocsPanel } from "../../components/mypage/MyDocsPanel";
import { MyScholarshipsPanel } from "../../components/mypage/MyScholarShipsPanel";
import { UserCircleIcon } from "../../components/shared/icons";
import { colors } from "../../theme/colors";
import { router } from "expo-router";

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("info");

  return (
    <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
      <StatusBar barStyle="dark-content" />

      <View style={styles.myButtonWrap}>
        <TouchableOpacity
          onPress={() => router.push("UserBasic/MyPage")}
          activeOpacity={0.85}
          style={styles.myButton}
        >
          <UserCircleIcon size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }}>
        <View style={styles.phone}>
          <TopBar title="마이페이지" />

          {/* 상단 네비게이션 */}
          <NavBar
            tabs={[
              { key: "info", label: "내 정보 수정" },
              { key: "password", label: "비밀번호 수정" },
              { key: "docs", label: "마이 서류" },
              { key: "scholar", label: "신청 장학금" },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          {/* 탭별 콘텐츠 */}
          {activeTab === "info" && <InfoEditPanel />}
          {activeTab === "password" && <PasswordChangePanel />}
          {activeTab === "docs" && <MyDocsPanel />}
          {activeTab === "scholar" && <MyScholarshipsPanel />}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  phone: { width: 360, paddingVertical: 8 },
  bg: { flex: 1, backgroundColor: colors.bgFallback },
  container: { flex: 1, backgroundColor: "transparent" },

  // 🔝 우상단 오버레이 스타일
  myButtonWrap: {
    position: "absolute",
    top: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 8,
    right: 12,
    zIndex: 999,
    elevation: 999,
  },
  myButton: {
    padding: 4,
  },
});