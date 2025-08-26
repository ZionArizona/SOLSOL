import React, { useMemo, useState } from "react";
import { ImageBackground, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import BG from "../../assets/images/SOLSOLBackground.png";
import { TopBar } from "../../components/scholarship/TopBar";
import { StoragePanel } from "../../components/mydocs/StoragePanel";
import { ActionTabs } from "../../components/mydocs/ActionTabs";
import { SearchBar } from "../../components/mydocs/SearchBar";
import { DocCard, DocItem } from "../../components/mydocs/DocCard";
import { DocumentUploadModal } from "../../components/mydocs/DocumentUploadModal";

export default function MyDocs() {
  const [activeTab, setActiveTab] = useState<string>("전체");
  const [query, setQuery] = useState("");
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [documents, setDocuments] = useState<DocItem[]>([]);

  // 초기 샘플 데이터를 documents state에 설정
  React.useEffect(() => {
    setDocuments([
      {
        id: "1",
        fileName: "성적증명서_2025-1학기.pdf",
        category: "성적증명",
        size: "2.3MB",
        uploadedAt: "7/15 업로드",
        metaTags: ["성적증명서", "학기1"],
        status: "사용가능",
        usageCount: 3,
        colorKey: "grade",
      },
      {
        id: "2",
        fileName: "TOEIC_성적표_920점.jpg",
        category: "어학",
        size: "2.3MB",
        uploadedAt: "6/20 업로드",
        metaTags: ["어학성적", "TOEIC"],
        status: "사용가능",
        usageCount: 2,
        colorKey: "lang",
      },
      {
        id: "3",
        fileName: "한컴1급_자격증.pdf",
        category: "자격증",
        size: "1.2MB",
        uploadedAt: "5/10 업로드",
        metaTags: ["자격증"],
        status: "사용가능",
        usageCount: 1,
        colorKey: "license",
      },
    ]);
  }, []);

  const filtered = documents.filter(d => {
    const matchTab = activeTab === "전체" ? true : d.category === activeTab;
    const matchQuery = query.trim().length === 0 ? true : d.fileName.toLowerCase().includes(query.toLowerCase());
    return matchTab && matchQuery;
  });

  const handleUpload = (uploadData: any) => {
    const newDoc: DocItem = {
      id: Date.now().toString(),
      fileName: uploadData.fileName,
      category: uploadData.category,
      size: "Unknown",
      uploadedAt: new Date().toLocaleDateString("ko-KR") + " 업로드",
      metaTags: uploadData.metaTags,
      status: "사용가능",
      usageCount: 0,
      colorKey: uploadData.category === "성적증명" ? "grade" : 
                uploadData.category === "자격증" ? "license" : 
                uploadData.category === "어학" ? "lang" : "etc",
    };
    setDocuments(prev => [...prev, newDoc]);
  };

  const handleBulkDelete = () => {
    setDocuments(prev => prev.filter(doc => !selectedDocs.includes(doc.id)));
    setSelectedDocs([]);
    setBulkMode(false);
  };

  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedDocs([]);
  };

  const toggleDocSelection = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSingleDelete = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  return (
    <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }}>
        <View style={styles.phone}>
          <TopBar title="마이 서류 박스" />

          {/* 상단: 저장공간/카운트 현황 */}
          <StoragePanel
            used="350MB"
            capacity="1GB"
            percent={65}
            total={8}
            reusable={5}
            expiring={6}
          />

          {/* 탭 + 업로드/일괄관리 버튼 */}
          <ActionTabs
            tabs={["전체", "성적증명", "자격증", "어학", "기타"]}
            active={activeTab}
            onChange={setActiveTab}
            onUploadPress={() => setUploadModalVisible(true)}
            onBulkPress={toggleBulkMode}
            bulkMode={bulkMode}
            selectedCount={selectedDocs.length}
            onBulkDelete={handleBulkDelete}
          />

          {/* 검색 */}
          <SearchBar value={query} onChangeText={setQuery} placeholder="서류명으로 검색..." />

          {/* 리스트 */}
          <View style={{ paddingHorizontal: 12, marginTop: 8 }}>
            {filtered.map(item => (
              <DocCard 
                key={item.id} 
                item={item} 
                onDelete={bulkMode ? undefined : handleSingleDelete}
                bulkMode={bulkMode}
                selected={selectedDocs.includes(item.id)}
                onToggleSelect={() => toggleDocSelection(item.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 서류 업로드 모달 */}
      <DocumentUploadModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onUpload={handleUpload}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  phone: { width: 360, paddingVertical: 8 },
});
