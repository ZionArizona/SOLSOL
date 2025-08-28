import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SelectMockProps {
  label: string;
  value?: string;
  disabled?: boolean;
}

export const SelectMock = ({ label, value, disabled = false }: SelectMockProps) => {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        {label}
      </Text>
      <View style={[styles.field, disabled && styles.fieldDisabled]}>
        <Text style={value ? styles.valueText : styles.placeholder}>
          {value || "선택"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { 
    width: "48%",
    marginBottom: 8,
  },
  label: { 
    fontSize: 12, 
    color: "#2E3C5C", 
    opacity: 0.9, 
    marginBottom: 6, 
    fontWeight: "700" 
  },
  labelDisabled: {
    opacity: 0.6,
  },
  field: {
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D8E0FF",
    justifyContent: "center",
    paddingHorizontal: 10,
    shadowColor: "#B4C4FF",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  fieldDisabled: {
    backgroundColor: "#F5F7FF",
    borderColor: "#E0E6FF",
    opacity: 0.8,
  },
  placeholder: { 
    color: "#7C89A6", 
    fontWeight: "700",
    fontSize: 12,
  },
  valueText: {
    color: "#2E3C5C",
    fontWeight: "700",
    fontSize: 12,
  },
});
