import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CalendarSmallIcon, NoteIcon, SparkIcon, FileIcon, DotIcon } from "../shared/icons";

type IconName = "calendar" | "note" | "spark" | "file";

const IconByName = ({ name }: { name: IconName }) => {
  switch (name) {
    case "calendar": return <CalendarSmallIcon size={18} />;
    case "note":     return <NoteIcon size={18} />;
    case "spark":    return <SparkIcon size={18} />;
    case "file":     return <FileIcon size={18} />;
  }
};

export const InfoPanel = ({
  title,
  headerIcon,
  body,
}: {
  title: string;
  headerIcon: IconName;
  body: React.ReactNode;
}) => {
  return (
    <LinearGradient
      colors={["#E7ECFF", "#F4F7FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <IconByName name={headerIcon} />
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={{ marginTop: 8 }}>{body}</View>
    </LinearGradient>
  );
};

const P = ({ children, muted, accent }: { children: React.ReactNode; muted?: boolean; accent?: boolean }) => (
  <Text style={[styles.p, muted && styles.pMuted, accent && styles.pAccent]}>{children}</Text>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.bulletRow}>
    <DotIcon size={6} />
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

InfoPanel.P = P;
InfoPanel.Bullet = Bullet;

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#B2C4FF",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontWeight: "900", color: "#2C3E66" },
  p: { color: "#2C3E66", lineHeight: 20, fontWeight: "700" },
  pMuted: { color: "#6E7FA3" },
  pAccent: { color: "#14B46C", fontWeight: "900" },
  bulletRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  bulletText: { color: "#2C3E66", fontWeight: "700" },
});
