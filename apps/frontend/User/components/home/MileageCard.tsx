import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity activeOpacity={0.9} style={styles.smallBtn} onPress={onPressScholar}>
          <Text style={styles.smallBtnText}>장학금 보러가기</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.pointText}>
        {points.toLocaleString()} <Text style={{ fontSize: 16 }}>P</Text>
      </Text>

      <View style={styles.row}>
        <Shortcut title="마이 캘린더" Icon={CalendarIcon} />
        <Shortcut title="마이 서류 박스" Icon={FileBoxIcon} />
        <Shortcut title="마이 장학금" Icon={ScholarshipIcon} />
        <Shortcut title="알림함" Icon={BellIcon} />
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { color: colors.muted, fontWeight: "700" },
  pointText: { marginTop: 6, fontSize: 26, fontWeight: "900", color: colors.title },
  smallBtn: {
    backgroundColor: "#EEF3FF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  smallBtnText: { color: colors.primary, fontWeight: "800", fontSize: 12 },
  row: { marginTop: 14, flexDirection: "row", justifyContent: "space-between" },
});
