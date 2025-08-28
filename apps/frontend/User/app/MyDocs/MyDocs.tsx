import React, { useMemo, useState, useEffect } from "react";
import { ImageBackground, ScrollView, StatusBar, StyleSheet, View, Alert } from "react-native";
import BG from "../../assets/images/SOLSOLBackground.png";
import { TopBar } from "../../components/scholarship/TopBar";
import { StoragePanel } from "../../components/mydocs/StoragePanel";
import { ActionTabs } from "../../components/mydocs/ActionTabs";
import { SearchBar } from "../../components/mydocs/SearchBar";
import { DocCard, DocItem } from "../../components/mydocs/DocCard";
import { DocumentUploadModal } from "../../components/mydocs/DocumentUploadModal";
import { getMyDocuments, deleteDocument, convertToDocItem } from "../../services/document.api";

export default function MyDocs() {
  const [activeTab, setActiveTab] = useState<string>("전체");
  const [query, setQuery] = useState("");
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 서류 목록 로드
  const loadDocuments = async () => {
    try {
      setLoading(true);
      console.log('📋 서류 목록 로드 시작...');
      
      const docs = await getMyDocuments();
      console.log('📋 받아온 서류 데이터:', docs);
      
      if (docs && docs.length > 0) {
        const convertedDocs = docs.map((doc, index) => convertToDocItem(doc, index));
        setDocuments(convertedDocs);
        console.log('✅ 서류 목록 로드 성공:', convertedDocs.length, '개');
      } else {
        console.log('📋 서류가 없습니다. 빈 배열 설정');
        setDocuments([]);
      }
    } catch (error) {
      console.error('❌ 서류 목록 로드 실패:', error);
      
      // 더 자세한 오류 정보 로깅
      if (error instanceof Error) {
        console.error('오류 메시지:', error.message);
        console.error('오류 스택:', error.stack);
      }
      
      Alert.alert('오류', `서류 목록을 불러오는데 실패했습니다.\n${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      
      // 실패 시에는 빈 배열로 설정 (샘플 데이터 제거)
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadDocuments();
  }, []);

  const filtered = documents.filter(d => {
    const matchTab = activeTab === "전체" ? true : d.category === activeTab;
    const matchQuery = query.trim().length === 0 ? true : d.fileName.toLowerCase().includes(query.toLowerCase());
    return matchTab && matchQuery;
  });

  // 서류 현황 계산
  const calculateDocumentStats = () => {
    const total = documents.length;
    const available = documents.filter(doc => doc.status === "사용가능").length;
    const totalUsage = documents.reduce((sum, doc) => sum + (doc.usageCount || 0), 0);
    
    // 진행률은 유효한 서류 비율로 계산 (총 서류 대비 사용가능한 서류)
    const availablePercent = total > 0 ? Math.round((available / total) * 100) : 0;
    
    return {
      used: `${available}개`,
      capacity: `${total}개`,
      percent: availablePercent,
      total: total,
      reusable: available,
      expiring: totalUsage, // expiring 파라미터를 총 사용횟수로 활용
    };
  };

  const documentStats = calculateDocumentStats();

  const handleUpload = (uploadData: any) => {
    // 업로드 성공 후 서류 목록 새로고침
    loadDocuments();
  };

  const handleBulkDelete = async () => {
    try {
      // 선택된 문서들을 순차적으로 삭제
      for (const docId of selectedDocs) {
        await deleteDocument(Number(docId));
      }
      
      // 삭제 후 목록 새로고침
      await loadDocuments();
      setSelectedDocs([]);
      setBulkMode(false);
      Alert.alert('성공', '선택한 서류가 삭제되었습니다.');
    } catch (error) {
      console.error('일괄 삭제 실패:', error);
      Alert.alert('오류', '서류 삭제에 실패했습니다.');
    }
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

  const handleSingleDelete = async (docId: string) => {
    try {
      console.log('🗑️ 서류 삭제 시작:', docId);
      await deleteDocument(Number(docId));
      console.log('✅ 서류 삭제 성공:', docId);
      
      await loadDocuments();
      Alert.alert('성공', '서류가 삭제되었습니다.');
    } catch (error) {
      console.error('❌ 단일 삭제 실패:', error);
      if (error instanceof Error) {
        console.error('오류 메시지:', error.message);
      }
      Alert.alert('오류', `서류 삭제에 실패했습니다.\n${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  return (
    <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }}>
        <View style={styles.phone}>
          <TopBar title="마이 서류 박스" />

          {/* 상단: 서류 현황 */}
          <StoragePanel
            used={documentStats.used}
            capacity={documentStats.capacity}
            percent={documentStats.percent}
            total={documentStats.total}
            reusable={documentStats.reusable}
            expiring={documentStats.expiring}
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
