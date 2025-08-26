import React from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const ReasonTextArea = ({
  value, onChangeText, placeholder,
}: { value: string; onChangeText: (t: string) => void; placeholder?: string }) => (
  <LinearGradient colors={["#EEF2FF", "#FFFFFF"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.card}>
    <View style={styles.inner}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8B97B6"
        multiline
        style={styles.input}
      />
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  card: { marginHorizontal: 12, marginTop: 8, borderRadius: 16, padding: 10,
    shadowColor: "#B2C4FF", shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  inner: { borderRadius: 12, backgroundColor: "#FFFFFF", padding: 10 },
  input: { minHeight: 90, fontSize: 14, color: "#2C3E66" },
});
