import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";
import Svg, { Path } from "react-native-svg";

interface CategorySelectProps {
  label: string;
  options: string[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
}

export const CategorySelect = ({ 
  label, 
  options, 
  value, 
  onSelect, 
  placeholder = "선택" 
}: CategorySelectProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setIsVisible(false);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity 
        style={styles.field} 
        onPress={() => setIsVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={value ? styles.selectedText : styles.placeholder}>
          {value || placeholder}
        </Text>
        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
          <Path 
            d="M6 9L12 15L18 9" 
            stroke="#7C89A6" 
            strokeWidth={2} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </Svg>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label} 선택</Text>
            
            <ScrollView style={styles.optionsList}>
              <TouchableOpacity 
                style={styles.option}
                onPress={() => handleSelect("")}
              >
                <Text style={[styles.optionText, !value && styles.selectedOption]}>
                  전체
                </Text>
              </TouchableOpacity>
              
              {options.map((option) => (
                <TouchableOpacity 
                  key={option}
                  style={styles.option}
                  onPress={() => handleSelect(option)}
                >
                  <Text style={[
                    styles.optionText, 
                    value === option && styles.selectedOption
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  field: {
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D8E0FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    shadowColor: "#B4C4FF",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  placeholder: { 
    color: "#7C89A6", 
    fontWeight: "700",
    fontSize: 12,
  },
  selectedText: {
    color: "#2E3C5C",
    fontWeight: "700",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2E3C5C',
    textAlign: 'center',
    marginBottom: 16,
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 14,
    color: '#2E3C5C',
    fontWeight: '600',
  },
  selectedOption: {
    color: '#6B86FF',
    fontWeight: '800',
    backgroundColor: '#EEF3FF',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#6B86FF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
  },
});