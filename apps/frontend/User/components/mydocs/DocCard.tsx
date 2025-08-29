import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

export type DocItem = {
  id: string;
  fileName: string;
  category: "성적증명" | "자격증" | "어학" | "기타";
  size: string;
  uploadedAt: string;
  metaTags: string[];  // 아래 작은 칩들
  status: "사용가능" | "만료임박" | "검토중";
  usageCount: number;
  colorKey?: "grade" | "license" | "lang" | "etc";
};

export const DocCard = ({ 
  item, 
  onDelete, 
  bulkMode, 
  selected, 
  onToggleSelect 
}: { 
  item: DocItem; 
  onDelete?: (id: string) => void;
  bulkMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}) => {
  const color = {
    grade: "#6B86FF",
    license: "#5EC3A2",
    lang: "#6AA8FF",
    etc: "#9AA7C8",
  }[item.colorKey || "etc"];

  const handleDelete = () => {
    console.log('🗑️ DocCard handleDelete 호출:', item.id, 'onDelete 함수:', onDelete ? '있음' : '없음');
    
    if (!onDelete) return;

    const id = String(item.id);
  //   if (onDelete) {
  //     Alert.alert(
  //       "서류 삭제",
  //       `'${item.fileName}' 파일을 삭제하시겠습니까?`,
  //       [
  //         { text: "취소", style: "cancel" },
  //         { 
  //           text: "삭제", 
  //           style: "destructive",
  //           onPress: () => {
  //             console.log('🗑️ 삭제 확인 버튼 누름:', item.id);
  //             onDelete(item.id);
  //           }
  //         }
  //       ]
  //     );
  //   } else {
  //     console.log('❌ onDelete 함수가 없습니다!');
  //   }
  // };

  if (Platform.OS === 'web') {
    // ✅ 웹: confirm 사용 (Alert 버튼 onPress 무시 이슈 회피)
    const ok = window.confirm(`'${item.fileName}' 파일을 삭제하시겠습니까?`);
    if (ok) {
      console.log('🗑️ (web) 삭제 확인 버튼 누름:', id);
      onDelete(id);
    }
    return;
  }

  // ✅ 네이티브: 반드시 함수로 감싸 전달
  Alert.alert(
    '서류 삭제',
    `'${item.fileName}' 파일을 삭제하시겠습니까?`,
    [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          console.log('🗑️ (native) 삭제 확인 버튼 누름:', id);
          onDelete(id);
        },
      },
    ],
  );
};

  return (
    <TouchableOpacity 
      style={[styles.cardContainer, selected && styles.selectedCard]}
      onPress={bulkMode ? onToggleSelect : undefined}
      activeOpacity={bulkMode ? 0.7 : 1}
    >
      <LinearGradient colors={["#EEF3FF", "#FFFFFF"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.card}>
        {/* 파일명과 액션 버튼들 */}
        <View style={styles.headerRow}>
          <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>
          <View style={styles.actions}>
            {bulkMode ? (
              <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                {selected && (
                  <Svg width={12} height={12} viewBox="0 0 24 24">
                    <Path d="M20 6L9 17L4 12" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                )}
              </View>
            ) : (
              (() => {
                console.log('🔍 삭제 버튼 렌더링 조건:', 'onDelete:', onDelete ? '있음' : '없음', 'bulkMode:', bulkMode);
                return onDelete && (
                  <TouchableOpacity 
                    onPress={() => {
                      console.log('🔘 삭제 버튼 터치됨:', item.id);
                      handleDelete();
                    }} 
                    style={styles.deleteBtn}
                  >
                    <Svg width={16} height={16} viewBox="0 0 24 24">
                      <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#E36464" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
                      <Path d="M10 11v6M14 11v6" stroke="#E36464" strokeWidth={1.5} strokeLinecap="round"/>
                    </Svg>
                  </TouchableOpacity>
                );
              })()
            )}
          </View>
        </View>

      {/* 상단 라벨 줄 */}
      <View style={styles.metaRow}>
        <Text style={[styles.badge, { backgroundColor: "#E7ECFF", color: "#6B86FF" }]}>{item.category}</Text>
        <Text style={styles.dim}>· {item.size} · {item.uploadedAt}</Text>
        <View style={[styles.usagePill]}>
          <Text style={styles.usageText}>{item.usageCount}회 사용</Text>
        </View>
      </View>

      {/* progress-like status row */}
      <View style={styles.statusRow}>
        <View style={[styles.dot, { backgroundColor: item.status === "사용가능" ? "#39C07F" : "#F2B14A" }]} />
        <Text style={styles.statusText}>{item.status}</Text>
      </View>

      {/* 태그들 */}
      <View style={styles.tags}>
        {item.metaTags.map((t, idx) => (
          <Text key={idx} style={[styles.tag, { borderColor: color, color }]}>{t}</Text>
        ))}
      </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    marginBottom: 10,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#6B86FF",
  },
  card: {
    borderRadius: 16, 
    padding: 14,
    shadowColor: "#B2C4FF", 
    shadowOpacity: 0.18, 
    shadowRadius: 10, 
    shadowOffset:{width:0,height:6}, 
    elevation:2
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  fileName: { 
    color: "#2C3E66", 
    fontWeight: "900", 
    flex: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FCE9E9",
    alignItems: "center",
    justifyContent: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#D0D7E6",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxSelected: {
    backgroundColor: "#6B86FF",
    borderColor: "#6B86FF",
  },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: "900" },
  dim: { color: "#7C89A6", fontWeight: "700", flex: 1, marginLeft: 8 },
  usagePill: { backgroundColor: "#EDF0FF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  usageText: { fontSize: 12, color: "#6B86FF", fontWeight: "900" },

  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { color: "#2C3E66", fontWeight: "800" },

  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  tag: { borderWidth: 1.5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: "900" },
});
