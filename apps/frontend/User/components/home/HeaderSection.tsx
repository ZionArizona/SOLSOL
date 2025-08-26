import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Chip } from "../shared/Chip";
import { colors } from "../../theme/colors";

type Props = {
  school: string;
  chips?: string[];
};

export const HeaderSection = ({ school, chips = [] }: Props) => {
  return (
    <View style={styles.wrap}>
      <Text style={styles.school}>{school}</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {chips.map((c) => (
          <Chip key={c} label={c} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  school: { fontSize: 18, fontWeight: "700", color: colors.title },
});
