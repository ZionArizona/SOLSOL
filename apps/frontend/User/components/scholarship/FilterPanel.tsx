import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CategorySelect } from "./parts/CategorySelect";
import { scholarshipApi, FilterParams } from "../../services/scholarship.api";

interface FilterPanelProps {
  onFilterChange?: (params: FilterParams) => void;
  initialFilter?: FilterParams;
}

interface RecruitmentStatus {
  value: string;
  label: string;
}

export const FilterPanel = ({ onFilterChange, initialFilter }: FilterPanelProps) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilter?.category || "");
  const [selectedStatus, setSelectedStatus] = useState<string>(initialFilter?.status || "OPEN");
  const [loading, setLoading] = useState(false);

  const recruitmentStatuses: RecruitmentStatus[] = [
    { value: "OPEN", label: "신청가능" },
    { value: "CLOSED", label: "모집마감" },
    { value: "DRAFT", label: "신청예정" }
  ];

  // 컴포넌트 마운트 시 카테고리 목록 로드 및 초기 필터 설정
  useEffect(() => {
    loadInitialData();
  }, []);

  // 초기 필터 변경 시 상태 업데이트
  useEffect(() => {
    if (initialFilter) {
      console.log('🎯 Updating FilterPanel state from initialFilter:', initialFilter);
      setSelectedCategory(initialFilter.category || "");
      
      // status가 undefined면 "전체"(빈 문자열)로, 그렇지 않으면 해당 값으로 설정
      const statusValue = initialFilter.status === undefined ? "" : (initialFilter.status || "OPEN");
      console.log('🎯 Setting selectedStatus from initialFilter:', initialFilter.status, '->', statusValue);
      setSelectedStatus(statusValue);
    }
  }, [initialFilter]);

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

  // 즉시 필터 적용
  const applyCurrentFilter = () => {
    if (!onFilterChange) return;
    
    const filterParams: FilterParams = {
      category: selectedCategory || undefined,
      status: selectedStatus,
    };
    
    console.log('🎯 Applying filter with params:', filterParams);
    onFilterChange(filterParams);
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: string) => {
    console.log('📄 Category change requested:', category);
    
    // "전체" 선택 시 빈 문자열로 처리
    const categoryValue = category === "전체" ? "" : category;
    console.log('📄 Setting selectedCategory to:', categoryValue);
    setSelectedCategory(categoryValue);
    
    // 카테곣리 변경 후 즉시 필터 적용
    setTimeout(() => {
      const filterParams: FilterParams = {
        category: categoryValue || undefined,
        status: selectedStatus === "" ? undefined : selectedStatus,
      };
      console.log('🎯 Category changed, applying filter:', filterParams);
      onFilterChange?.(filterParams);
    }, 0);
  };

  // 모집상태 변경 핸들러
  const handleStatusChange = (label: string) => {
    console.log('📄 Status change requested:', label);
    console.log('📄 Current selectedStatus:', selectedStatus);
    
    // "전체" 선택 시 처리
    if (label === "전체") {
      console.log('📄 Setting selectedStatus to empty string for ALL');
      setSelectedStatus(""); // 빈 문자열로 설정
      setTimeout(() => {
        const filterParams: FilterParams = {
          category: selectedCategory || undefined,
          status: undefined, // 전체 선택 시 status는 undefined
        };
        console.log('🎯 Status changed to ALL, applying filter:', filterParams);
        onFilterChange?.(filterParams);
      }, 0);
    } else {
      const status = recruitmentStatuses.find(s => s.label === label);
      console.log('📄 Found status for label:', label, '->', status);
      if (status) {
        console.log('📄 Setting selectedStatus to:', status.value);
        setSelectedStatus(status.value);
        // 모집상태 변경 후 즉시 필터 적용
        setTimeout(() => {
          const filterParams: FilterParams = {
            category: selectedCategory || undefined,
            status: status.value,
          };
          console.log('🎯 Status changed, applying filter:', filterParams);
          onFilterChange?.(filterParams);
        }, 0);
      } else {
        console.log('❌ No status found for label:', label);
      }
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
          value={(() => {
            console.log('📄 CategorySelect value prop:', selectedCategory, '-> display:', selectedCategory || "전체");
            return selectedCategory || "전체";
          })()}
          onSelect={handleCategoryChange}
          placeholder="전체"
          includeAllOption={true}
        />
        
        {/* 모집상태 선택 */}
        <CategorySelect
          label="모집상태"
          options={recruitmentStatuses.map(status => status.label)}
          value={(() => {
            const displayValue = selectedStatus === "" ? "전체" : (recruitmentStatuses.find(status => status.value === selectedStatus)?.label || "신청가능");
            console.log('📄 StatusSelect value prop:', selectedStatus, '-> display:', displayValue);
            return displayValue;
          })()}
          onSelect={handleStatusChange}
          placeholder="신청가능"
          includeAllOption={true}
        />
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
});
