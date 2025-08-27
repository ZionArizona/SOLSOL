import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export const ActionTabs = ({
  tabs, active, onChange, onUploadPress, onBulkPress, bulkMode, selectedCount, onBulkDelete
}: {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
  onUploadPress: () => void;
  onBulkPress: () => void;
  bulkMode?: boolean;
  selectedCount?: number;
  onBulkDelete?: () => void;
}) => {
  return (
    <View style={{ marginTop: 8, marginHorizontal: 12 }}>
      {/* 상단 라벨 + 버튼들 */}
      <View style={styles.row}>
        <Text style={styles.label}>
          {bulkMode ? `내 서류 모아보기 (${selectedCount || 0}개 선택)` : "내 서류 모아보기"}
        </Text>
        <View style={styles.actions}>
          {bulkMode ? (
            <>
              <TouchableOpacity 
                style={[styles.pill, styles.deleteBtn]} 
                onPress={onBulkDelete} 
                activeOpacity={0.85}
                disabled={!selectedCount || selectedCount === 0}
              >
                <Text style={[styles.pillText, styles.deleteBtnText]}>
                  삭제 ({selectedCount || 0})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pill, { marginLeft: 6 }]} onPress={onBulkPress} activeOpacity={0.85}>
                <Text style={styles.pillText}>완료</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.pill} onPress={onUploadPress} activeOpacity={0.85}>
                <Text style={styles.pillText}>서류 업로드</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pill, { marginLeft: 6 }]} onPress={onBulkPress} activeOpacity={0.85}>
                <Text style={styles.pillText}>일괄 관리</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* 하단 탭 */}
      <View style={styles.tabs}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, active === t && styles.tabActive]}
            onPress={() => onChange(t)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, active === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontWeight: "900", color: "#2C3E66" },
  actions: { flexDirection: "row" },
  pill: { backgroundColor: "#E7ECFF", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  pillText: { color: "#6B86FF", fontWeight: "800", fontSize: 12 },
  deleteBtn: { backgroundColor: "#FFE7E7" },
  deleteBtnText: { color: "#E36464" },
  tabs: { flexDirection: "row", marginTop: 8, backgroundColor: "#E9EDFF", borderRadius: 12, overflow: "hidden" },
  tab: { flex: 1, alignItems: "center", paddingVertical: 8 },
  tabActive: { backgroundColor: "#6B86FF" },
  tabText: { fontSize: 12, fontWeight: "800", color: "#2C3E66" },
  tabTextActive: { color: "#fff" },
});
