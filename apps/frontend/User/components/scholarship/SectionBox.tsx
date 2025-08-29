import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const SectionBox = ({
  children,
  caption,
  empty,
}: {
  children?: React.ReactNode;
  caption?: string;
  empty?: boolean;
}) => {
  return (
    <LinearGradient
      colors={["#E6ECFF", "#F3F6FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.box}
    >
      {caption && <Text style={styles.caption}>{caption}</Text>}

      {empty ? (
        <View style={styles.empty}>
          <View style={styles.divider} />
        </View>
      ) : (
        children
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  box: {
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 10,
    shadowColor: "#B2C4FF",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  caption: { color: "#7182A6", fontWeight: "900", fontSize: 12, marginBottom: 8, marginLeft: 8 },
  empty: {
    height: 120,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    width: 160,
    height: 1.5,
    backgroundColor: "#C7D2FF",
  },
});
