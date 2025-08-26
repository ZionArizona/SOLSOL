import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const Shortcut = ({
  title,
  Icon,
  onPress,
}: {
  title: string;
  Icon: React.FC<{ size?: number }>;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.shortcut} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.iconWrap}>
      <Icon size={28} />
    </View>
    <Text style={styles.label}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  shortcut: { width: "23%", alignItems: "center", gap: 8 },
  iconWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: "#F2F6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 12, color: "#1E2B4B", fontWeight: "700", textAlign: "center" },
});
