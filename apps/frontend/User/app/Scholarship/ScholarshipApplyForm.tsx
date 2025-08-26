import React, { useState } from "react";
import { ImageBackground, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import BG from "../../assets/images/SOLSOLBackground.png";
import { TopBar } from "../../components/scholarship/TopBar";
import { SectionHeader } from "../../components/scholarship/SectionHeader";
import { ReasonTextArea } from "../../components/scholarship/ReasonTextArea";
import { FileUploadPanel } from "../../components/scholarship/FileUploadPanel";
import { Checklist } from "../../components/scholarship/Checklist";
import { PrimaryButton } from "../../components/scholarship/PrimaryButton";
import { router } from "expo-router";

export default function ScholarshipApplyForm() {
  const [files, setFiles] = useState<{ name: string; uri: string }[]>([]);
  const [reason, setReason] = useState("");

  const checklistItems = [
    { id: "1", label: "성적증명서", done: files.some(f => /성적|grade/i.test(f.name)) },
    { id: "2", label: "재학증명서", done: files.some(f => /재학|enroll/i.test(f.name)) },
    { id: "3", label: "장학금 신청서", done: files.some(f => /신청서|apply/i.test(f.name)) },
    { id: "4", label: "통장사본",     done: false },
  ];
  const canSubmit = reason.trim().length > 0 && checklistItems.slice(0, 3).every(i => i.done);

  return (
    <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }}>
        <View style={styles.phone}>
          <TopBar title="장학금 신청" />

          <SectionHeader title="신청 사유 및 비고" />
          <ReasonTextArea
            placeholder="장학금 신청 사유를 작성해주세요..."
            value={reason}
            onChangeText={setReason}
          />

          <SectionHeader title="제출 서류" actionLabel="믿 내 서류 확인하기" onPressAction={() => {}} />
          <FileUploadPanel
            files={files}
            onAdd={(f) => setFiles((p) => [...p, f])}
            onRemove={(idx) => setFiles((p) => p.filter((_, i) => i !== idx))}
          />

          <Checklist title="제출 서류 체크리스트" items={checklistItems} />

          <PrimaryButton
            label="신청하기"
            disabled={!canSubmit}
            onPress={() => {router.push("/Scholarship/SubmissionDone");}}
            style={{ marginTop: 12, marginHorizontal: 12 }}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({ phone: { width: 360, paddingVertical: 8 } });
