import React from "react";
import { View, TextInput, StyleSheet, Text } from "react-native";

export const SearchBar = ({
  value, onChangeText, placeholder,
}: { value: string; onChangeText: (t: string) => void; placeholder?: string }) => {
  return (
    <View style={styles.box}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AA4BE"
        style={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    marginHorizontal: 12, marginTop: 8,
    backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#C7D4FF", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width:0, height:4 }, elevation: 2,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, color: "#2C3E66", fontWeight: "700" },
});
