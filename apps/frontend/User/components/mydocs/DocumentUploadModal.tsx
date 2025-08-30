import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  ScrollView,
  Alert,
  Platform 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import { UploadIcon } from "../shared/icons";
import Svg, { Path } from "react-native-svg";
import { uploadDocument, uploadDocumentRN, uploadApplicationDocumentRN, uploadApplicationDocumentWeb } from "../../services/document.api";

type FileItem = { name: string; uri: string; size?: number; type?: string };

export type DocumentUploadModalProps = {
  visible: boolean;
  onClose: () => void;
  onUpload: (data: {
    fileName: string;
    category: string;
    metaTags: string[];
    file: FileItem;
  }) => void;
  mode?: 'mybox' | 'scholarship'; // 저장 모드: MyBox 또는 장학금 신청용
  scholarshipNm?: string; // 장학금 모드일 때 필요
  documentNm?: string; // 장학금 모드일 때 필요
};

export const DocumentUploadModal = ({ 
  visible, 
  onClose, 
  onUpload, 
  mode = 'mybox', 
  scholarshipNm,
  documentNm 
}: DocumentUploadModalProps) => {
  const [fileName, setFileName] = useState("");
  const [category, setCategory] = useState("기타");
  const [tags, setTags] = useState("");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [actualWebFile, setActualWebFile] = useState<File | null>(null); // 웹용 실제 File 객체 저장
  const [uploading, setUploading] = useState(false);

  const categories = ["성적증명", "자격증", "어학", "기타"];

  const pickFile = async () => {
    try {
      if (Platform.OS === 'web') {
        // 웹 환경에서는 HTML input 사용
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '*/*';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            setSelectedFile({
              name: file.name,
              uri: '', // 웹에서는 사용하지 않음
              size: file.size,
              type: file.type,
            });
            setActualWebFile(file); // 실제 File 객체 저장
            if (!fileName) {
              setFileName(file.name);
            }
          }
        };
        input.click();
      } else {
        // 모바일 환경
        const res = await DocumentPicker.getDocumentAsync({ 
          multiple: false, 
          copyToCacheDirectory: true, 
          type: "*/*" 
        });
        
        if (res.type === "success") {
          setSelectedFile({ 
            name: res.name, 
            uri: res.uri, 
            size: res.size,
            type: res.mimeType 
          });
          if (!fileName) {
            setFileName(res.name);
          }
        }
      }
    } catch (error) {
      Alert.alert("오류", "파일 선택 중 오류가 발생했습니다.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert("알림", "파일을 선택해주세요.");
      return;
    }
    if (!fileName.trim()) {
      Alert.alert("알림", "파일명을 입력해주세요.");
      return;
    }

    try {
      setUploading(true);
      
      if (mode === 'scholarship') {
        // 장학금 신청 모드: MyBox에 저장하지 않고 바로 콜백 호출
        const metaTags = tags.split(",").map(t => t.trim()).filter(t => t.length > 0);
        onUpload({
          fileName: fileName.trim(),
          category,
          metaTags,
          file: {
            ...selectedFile,
            webFile: actualWebFile // 웹용 실제 File 객체 전달
          }
        });
        Alert.alert("성공", "서류가 추가되었습니다.");
      } else {
        // MyBox 모드: 기존대로 MyBox에 저장
        if (Platform.OS === 'web') {
          // 웹 환경에서는 저장된 실제 File 객체 사용
          if (!actualWebFile) {
            Alert.alert("오류", "파일이 제대로 선택되지 않았습니다.");
            return;
          }
          
          await uploadDocument(actualWebFile, fileName.trim(), category);
          Alert.alert("성공", "서류가 MyBox에 업로드되었습니다.");
        } else {
          // 모바일 환경에서는 React Native 업로드 함수 사용
          if (!selectedFile.uri || !selectedFile.size || !selectedFile.type) {
            Alert.alert("오류", "파일 정보가 불완전합니다.");
            return;
          }

          await uploadDocumentRN(
            selectedFile.uri,
            fileName.trim(),
            selectedFile.type,
            selectedFile.size,
            category
          );
          Alert.alert("성공", "서류가 MyBox에 업로드되었습니다.");
        }

        // 성공 시 콜백 호출
        const metaTags = tags.split(",").map(t => t.trim()).filter(t => t.length > 0);
        onUpload({
          fileName: fileName.trim(),
          category,
          metaTags,
          file: selectedFile
        });
      }

      // Reset form
      setFileName("");
      setCategory("기타");
      setTags("");
      setSelectedFile(null);
      setActualWebFile(null); // 웹 파일 객체도 초기화
      onClose();
      
    } catch (error) {
      console.error('업로드 실패:', error);
      Alert.alert("오류", error instanceof Error ? error.message : "업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFileName("");
    setCategory("기타");
    setTags("");
    setSelectedFile(null);
    setActualWebFile(null); // 웹 파일 객체도 초기화
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient 
            colors={["#EEF3FF", "#FFFFFF"]} 
            start={{x:0,y:0}} 
            end={{x:1,y:1}} 
            style={styles.modal}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>서류 업로드</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Svg width={20} height={20} viewBox="0 0 24 24">
                  <Path d="M18 6L6 18M6 6l12 12" stroke="#2C3E66" strokeWidth={2} strokeLinecap="round"/>
                </Svg>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* File Selection */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>파일 선택</Text>
              </View>
              <LinearGradient colors={["#D6DDF0", "#E8ECF7"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.fileCard}>
                <TouchableOpacity style={styles.fileSelector} onPress={pickFile}>
                  <Text style={styles.fileSelectorText}>
                    {selectedFile ? selectedFile.name : "파일 선택하기"}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.helpText}>업로드할 서류를 선택해주세요.</Text>
              </LinearGradient>

              {/* File Name */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>파일명</Text>
              </View>
              <LinearGradient colors={["#EEF2FF", "#FFFFFF"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.inputCard}>
                <View style={styles.inputInner}>
                  <TextInput
                    style={styles.textInput}
                    value={fileName}
                    onChangeText={setFileName}
                    placeholder="파일명을 입력하세요"
                    placeholderTextColor="#8B97B6"
                  />
                </View>
              </LinearGradient>
              <Text style={styles.tagHelpText}>예: 성적증명서_김헤영</Text>

              {/* Category */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>카테고리</Text>
              </View>
              <LinearGradient colors={["#EEF2FF", "#FFFFFF"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.inputCard}>
                <View style={styles.categoryGrid}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryItem,
                        category === cat && styles.categoryItemActive
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[
                        styles.categoryText,
                        category === cat && styles.categoryTextActive
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </LinearGradient>

              {/* Tags */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>태그</Text>
              </View>
              <LinearGradient colors={["#EEF2FF", "#FFFFFF"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.inputCard}>
                <View style={styles.inputInner}>
                  <TextInput
                    style={[styles.textInput, { minHeight: 60 }]}
                    value={tags}
                    onChangeText={setTags}
                    placeholder="태그를 쉼표로 구분해서 입력하세요"
                    placeholderTextColor="#8B97B6"
                    multiline
                  />
                </View>
              </LinearGradient>
              <Text style={styles.tagHelpText}>예: 성적증명서, 1학기, 장학금용</Text>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.uploadBtn, { opacity: uploading ? 0.5 : 1 }]} 
                onPress={handleUpload}
                disabled={uploading}
              >
                <Text style={styles.uploadBtnText}>
                  {uploading ? "업로드 중..." : "업로드"}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 360,
    maxHeight: "80%",
  },
  modal: {
    borderRadius: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E7ECFF",
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2C3E66",
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    maxHeight: 400,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontWeight: "900",
    color: "#2C3E66",
  },
  fileCard: {
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#9fb6ff",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  fileSelector: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    shadowColor: "#C1CCFF",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  fileSelectorText: {
    color: "#2C3E66",
    fontWeight: "900",
  },
  inputCard: {
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 16,
    padding: 10,
    shadowColor: "#B2C4FF",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  inputInner: {
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    padding: 10,
  },
  textInput: {
    fontSize: 14,
    color: "#2C3E66",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 10,
  },
  categoryItem: {
    backgroundColor: "#E7ECFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryItemActive: {
    backgroundColor: "#6B86FF",
  },
  categoryText: {
    color: "#6B86FF",
    fontWeight: "800",
    fontSize: 12,
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  helpText: {
    marginTop: 10,
    textAlign: "center",
    color: "#7A88A6",
    fontSize: 12,
    fontWeight: "700",
  },
  tagHelpText: {
    paddingHorizontal: 12,
    marginTop: 4,
    fontSize: 12,
    color: "#7A88A6",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#7C89A6",
  },
  uploadBtn: {
    flex: 1,
    backgroundColor: "#6B86FF",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});