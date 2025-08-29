import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

type FileItem = { name: string; uri: string };

export const PersonalFileUploadPanel = ({
  files, onAdd, onRemove, onUploadPress
}: { 
  files: FileItem[]; 
  onAdd: (f: FileItem) => void; 
  onRemove: (index: number) => void;
  onUploadPress?: () => void;
}) => {
  const pickFile = async () => {
    if (onUploadPress) {
      onUploadPress();
    }
    // DocumentPicker 직접 실행하지 않음 - onUploadPress만 호출
  };

  return (
    <>
      <TouchableOpacity onPress={pickFile} activeOpacity={0.9}>
        <LinearGradient colors={["#D6DDF0", "#E8ECF7"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.card}>
          <View style={styles.selectBtn}>
            <Text style={styles.selectText}>파일 선택하기</Text>
          </View>
          <Text style={styles.help}>장학금 신청 시 필요한 서류를{'\n'}미리 업로드 할 수 있습니다.</Text>
        </LinearGradient>
      </TouchableOpacity>

      {files.map((f, idx) => (
        <View key={`${f.uri}-${idx}`} style={styles.fileRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="#2C3E66" strokeWidth={1.6}/>
              <Path d="M14 2v6h6" stroke="#2C3E66" strokeWidth={1.6}/>
            </Svg>
            <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
          </View>
          <TouchableOpacity onPress={() => onRemove(idx)} style={styles.removeBtn}>
            <Svg width={12} height={12} viewBox="0 0 24 24">
              <Path d="M18 6L6 18M6 6l12 12" stroke="#E36464" strokeWidth={2} strokeLinecap="round"/>
            </Svg>
          </TouchableOpacity>
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 12,
        marginTop: 15,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 16,
        minHeight: 300,           // ← 보라색 박스 높이 늘리기 (원하는 값으로 조절)
        justifyContent: 'center', // 세로 가운데 정렬
        alignItems: 'center',     // 가로 가운데 정렬
        shadowColor: "#9fb6ff",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
    },



  selectBtn: { alignSelf: "center", backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14,
    shadowColor: "#C1CCFF", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 1 },
  selectText: { color: "#2C3E66", fontWeight: "900" },
  help: { marginTop: 10, textAlign: "center", color: "#7A88A6", fontSize: 12, fontWeight: "700" },

  fileRow: { flexDirection: "row", alignItems: "center", gap: 6, marginHorizontal: 12, marginTop: 8,
    backgroundColor: "#FFFFFF", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: "#E0E7FF", shadowColor: "#C7D4FF", shadowOpacity: 0.12, shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  fileName: { flex: 1, color: "#2C3E66", fontWeight: "700" },
  removeBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#FCE9E9", alignItems: "center", justifyContent: "center" },
});