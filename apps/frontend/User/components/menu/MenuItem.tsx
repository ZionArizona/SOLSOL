import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const MenuItem = ({
  icon,
  title,
  desc,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.row} onPress={onPress}>
      <View style={styles.iconWrap}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {!!desc && <Text style={styles.desc}>{desc}</Text>}
      </View>
      <Text style={styles.chev}>{">"}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#ECEFF5",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#F1F3F7", alignItems: "center", justifyContent: "center",
    marginRight: 10,
  },
  title: { fontSize: 14, fontWeight: "800", color: "#2C3E66" },
  desc: { fontSize: 12, color: "#7C89A6", marginTop: 2 },
  chev: { color: "#9AA4BE", fontWeight: "900", paddingLeft: 8 },
});
