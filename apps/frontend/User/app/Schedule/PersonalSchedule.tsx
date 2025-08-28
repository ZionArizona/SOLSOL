import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

type Props = {
  isVisible: boolean;
  selectedDate: Date | null;
  onClose: () => void;
  onSave: (title: string, date: Date) => void; // 지금은 Hello World만, 나중에 사용
};

const PersonalSchedule: React.FC<Props> = ({ isVisible, selectedDate, onClose, onSave }) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      swipeDirection="down"
      onSwipeComplete={onClose}
      propagateSwipe
      avoidKeyboard
      style={styles.bottomModal} // 하단에서 슬라이드
    >
      <View style={styles.sheet}>
        {/* 배경 (페이지와 같은 그라데이션) */}
        <ImageBackground
          source={require('../../assets/images/SOLSOLBackground.png')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        {/* 상단 바 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            // 데모: 선택 날짜에 "Hello World" 저장하고 닫기
            if (selectedDate) onSave('Hello World', selectedDate);
            onClose();
          }}>
            <Text style={styles.done}>완료</Text>
          </TouchableOpacity>
        </View>

        {/* 내용 */}
        <View style={styles.centerBox}>
          <Text style={styles.hello}>Hello World</Text>
        </View>
      </View>
    </Modal>
  );
};

export default PersonalSchedule;

const styles = StyleSheet.create({
  bottomModal: { justifyContent: 'flex-end', margin: 0 },
  sheet: {
    height: '90%', // 화면 90%
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { flex: 1, fontSize: 18, fontWeight: '700', color: '#333' },
  done: { fontSize: 16, fontWeight: '800', color: '#333' },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hello: { fontSize: 18, fontWeight: '600', color: '#111' },
});