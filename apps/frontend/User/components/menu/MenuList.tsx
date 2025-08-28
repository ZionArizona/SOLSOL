import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { BellIcon, CalendarIcon, FileBoxIcon, HomeIcon, ScholarshipIcon, UserCircleIcon } from "../shared/icons";
import { MenuItem } from "./MenuItem";

export const MenuList = () => {
  return (
    <LinearGradient colors={["#EFF3F8", "#FFFFFF"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.card}>
      <MenuItem
        icon={<CalendarIcon size={24} />}
        title="일정 관리"
        desc="내 학사/장학 일정 확인"
        onPress={() => router.push("/Schedule/MyCalendar")}
      />
      <MenuItem
        icon={<FileBoxIcon size={24} />}
        title="마이 서류박스"
        desc="내 서류 모으고 관리하기"
        onPress={() => router.push("/MyDocs/MyDocs")}
      />
      <MenuItem
        icon={<ScholarshipIcon size={24} />}
        title="마이 장학금"
        desc="신청/찜한 장학금 한 눈에"
        onPress={() => router.push("/MyScholarship/MyScholarship")}
      />
      <MenuItem
        icon={<BellIcon size={24} />}
        title="알림함"
        desc="중요 알림 모아보기"
        onPress={() => router.push("/Notifications/Notifications")}
      />
      <MenuItem
        icon={<UserCircleIcon size={24} />}
        title="마이페이지"
        desc="개인정보, 비밀번호, 내 서류, 신청 내역"
        onPress={() => router.push("/UserBasic/MyPage")}
      />
      <MenuItem
        icon={<HomeIcon size={22} />}
        title="장학금 둘러보기"
        desc="추천/전체 장학금 탐색"
        onPress={() => router.push("/Scholarship/ScholarshipApply")}
      />
      {/* 로그인/로그아웃은 프로젝트 상태에 맞게 분기해서 사용 */}
      <MenuItem
        icon={<UserCircleIcon size={24} />}
        title="로그아웃"
        desc="계정 전환 및 보안"
        onPress={() => router.push("/UserBasic/LoginPage")}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12, marginTop: 8,
    borderRadius: 16, paddingVertical: 6,
    shadowColor: "#B8C2D6", shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width:0, height:6 }, elevation: 2,
  },
});
