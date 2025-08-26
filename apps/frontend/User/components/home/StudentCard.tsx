import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";
import MascotImage from "../../assets/images/LoginPageCharacter.png";

type Props = {
  name: string;
  studentNo: string;
  dept: string;
};

export const StudentCard = ({ name, studentNo, dept }: Props) => {
  return (
    <LinearGradient
      colors={["#CFE0FF", "#EAF1FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Image source={MascotImage} style={{ width: 56, height: 56 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.badge}>모바일 학생증</Text>
          <Text style={styles.name}>
            {name} <Text style={{ opacity: 0.7 }}>{studentNo}</Text>
          </Text>
          <Text style={styles.dept}>{dept}</Text>
        </View>
        
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#9bb3ff",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 3,
  },
  badge: { color: colors.muted, fontSize: 12, marginBottom: 4, fontWeight: "700" },
  name: { fontSize: 18, fontWeight: "800", color: colors.title },
  dept: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
