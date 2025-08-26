import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ChevronLeftIcon, HomeIcon, MenuIcon, BellIcon } from "../shared/icons";

export const TopBar = ({ title }: { title: string }) => {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity activeOpacity={0.8}>
        <ChevronLeftIcon size={22} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.actions}>
        <TouchableOpacity activeOpacity={0.8}><HomeIcon size={20} /></TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8}><MenuIcon size={20} /></TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8}><BellIcon size={20} /></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  title: { flex: 1, textAlign: "center", fontWeight: "800", fontSize: 16, color: "#23324D" },
  actions: { flexDirection: "row", gap: 10 },
});
