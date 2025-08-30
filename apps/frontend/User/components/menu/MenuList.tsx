import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { BellIcon, CalendarIcon, FileBoxIcon, HomeIcon, ScholarshipIcon, UserCircleIcon } from "../shared/icons";
import { MenuItem } from "./MenuItem";
import { logoutCore } from "../../utils/logout"

// 계좌 아이콘 컴포넌트
const AccountIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7" stroke="#6B86FF" strokeWidth={2} strokeLinecap="round"/>
    <Path d="M3 7L12 13L21 7" stroke="#6B86FF" strokeWidth={2} strokeLinecap="round"/>
    <Path d="M21 7H3V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7Z" stroke="#6B86FF" strokeWidth={2} strokeLinecap="round"/>
    <Path d="M7 15H11" stroke="#6B86FF" strokeWidth={1.5} strokeLinecap="round"/>
  </Svg>
);

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
      <MenuItem
        icon={<AccountIcon size={24} />}
        title="내 계좌 보기"
        desc="계좌 잔액 및 환전 내역 확인"
        onPress={() => router.push("/Menu/AccountView")}
      />
      {/* 로그인/로그아웃은 프로젝트 상태에 맞게 분기해서 사용 */}
      <MenuItem
        icon={<UserCircleIcon size={24} />}
        title="로그아웃"
        desc="계정 전환 및 보안"
        onPress={async () => {
          try {
            await logoutCore();                    // ✅ 토큰 삭제 + 로컬 정리 + 디버그 로그
            router.replace('/UserBasic/LoginPage');  // ✅ 뒤로가기로 돌아가지 않도록 replace
          } catch (e) {
            console.error('❌ 로그아웃 처리 실패:', e);
          }
        }}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 8,
    borderRadius: 16,
    shadowColor: "#FFFFFF", shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width:0, height:6 }, elevation: 2,
  },
});
