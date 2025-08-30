import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { colors } from "../../theme/colors";
import { Shortcut } from "../shared/Shortcut";
import { CalendarIcon, FileBoxIcon, ScholarshipIcon, BellIcon } from "../shared/icons";

type Props = {
  label: string;
  points: number;
  onPressScholar: () => void;
};

export const MileageCard = ({ label, points, onPressScholar }: Props) => {
  return (
    <View style={styles.card}>
      {/* 상단: 라벨과 장학금 보러가기 버튼 */}
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity activeOpacity={0.9} style={styles.smallBtn} onPress={onPressScholar}>
          <Text style={styles.smallBtnText}>장학금 보러가기</Text>
        </TouchableOpacity>
      </View>

      {/* 중간: 포인트와 계좌 버튼을 나란히 배치 */}
      <View style={styles.middleRow}>
        <Text style={styles.pointText}>
          {points.toLocaleString()} <Text style={{ fontSize: 16 }}>P</Text>
        </Text>
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={[styles.smallBtn, styles.accountBtn]} 
          onPress={() => router.push("/Menu/AccountView")}
        >
          <Text style={[styles.smallBtnText, styles.accountBtnText]}>내 계좌 보러가기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <Shortcut 
          title="마이 캘린더" 
          Icon={CalendarIcon} 
          onPress={() => router.push("/Schedule/MyCalendar")}
        />
        <Shortcut 
          title="마이 서류" 
          Icon={FileBoxIcon} 
          onPress={() => router.push("/MyDocs/MyDocs")}
        />
        <Shortcut 
          title="마이 장학금" 
          Icon={ScholarshipIcon} 
          onPress={() => router.push("/MyScholarship/MyScholarship")}
        />
        <Shortcut 
          title="알림함" 
          Icon={BellIcon} 
          onPress={() => router.push("/Notifications/Notifications")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#b9c6ff",
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 2,
  },
  topRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginBottom: 10,
  },
  middleRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginBottom: 6,
  },
  label: { color: colors.muted, fontWeight: "700", flex: 1 },
  pointText: { fontSize: 26, fontWeight: "900", color: colors.title, flex: 1 },
  smallBtn: {
    backgroundColor: "#EEF3FF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  accountBtn: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#38BDF8",
  },
  smallBtnText: { color: colors.primary, fontWeight: "800", fontSize: 12 },
  accountBtnText: { color: "#0284C7" },
  row: { marginTop: 14, flexDirection: "row", justifyContent: "space-between" },
});
