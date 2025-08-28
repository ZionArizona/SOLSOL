import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CategorySelect } from "./parts/CategorySelect";
import { scholarshipApi, FilterParams } from "../../services/scholarship.api";

interface FilterPanelProps {
  onFilterChange?: (params: FilterParams) => void;
}

interface RecruitmentStatus {
  value: string;
  label: string;
}

export const FilterPanel = ({ onFilterChange }: FilterPanelProps) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("OPEN");
  const [loading, setLoading] = useState(false);

  const recruitmentStatuses: RecruitmentStatus[] = [
    { value: "OPEN", label: "신청가능" },
    { value: "CLOSED", label: "모집마감" },
    { value: "DRAFT", label: "신청예정" },
    { value: "ALL", label: "전체" }
  ];

  // 컴포넌트 마운트 시 카테고리 목록 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const categoriesData = await scholarshipApi.getCategories();

      if (categoriesData) {
        console.log('📂 Categories loaded:', categoriesData);
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('❌ Failed to load filter data:', error);
    }
  };

  // 필터 적용
  const handleApplyFilter = async () => {
    if (!onFilterChange) return;
    
    setLoading(true);
    try {
      const filterParams: FilterParams = {
        category: selectedCategory || undefined,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
      };
      
      console.log('🎯 Applying filter with params:', filterParams);
      onFilterChange(filterParams);
    } catch (error) {
      console.error('❌ Filter application failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 필터 초기화
  const handleResetFilter = () => {
    setSelectedCategory("");
    setSelectedStatus("OPEN");
    
    if (onFilterChange) {
      const resetParams: FilterParams = {
        status: 'OPEN',
      };
      console.log('🔄 Resetting filter');
      onFilterChange(resetParams);
    }
  };

  return (
    <LinearGradient
      colors={["#D6DDF0", "#E8ECF7"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.grid}>
        {/* 사용자 선택 가능한 카테고리 */}
        <CategorySelect
          label="카테고리"
          options={categories}
          value={selectedCategory}
          onSelect={setSelectedCategory}
          placeholder="전체"
        />
        
        {/* 모집상태 선택 */}
        <CategorySelect
          label="모집상태"
          options={recruitmentStatuses.map(status => status.label)}
          value={recruitmentStatuses.find(status => status.value === selectedStatus)?.label || "신청가능"}
          onSelect={(label) => {
            const status = recruitmentStatuses.find(s => s.label === label);
            if (status) {
              setSelectedStatus(status.value);
            }
          }}
          placeholder="신청가능"
        />
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity 
          style={[styles.btn, styles.primary]} 
          onPress={handleApplyFilter}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.btnText, { color: "#fff" }]}>필터 적용</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.btn, styles.ghost]} 
          onPress={handleResetFilter}
        >
          <Text style={[styles.btnText, { color: "#6576A2" }]}>초기화</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 10,
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#9fb6ff",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  btnRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: "#6B86FF",
  },
  ghost: {
    backgroundColor: "#E7EBFF",
  },
  btnText: { 
    fontWeight: "800",
    fontSize: 12,
  },
});
