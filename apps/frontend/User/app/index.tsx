// app/index.tsx
import { SafeAreaView, StatusBar, View, Text, StyleSheet } from 'react-native';

export default function Main() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.box}>
        <Text style={styles.title}>안녕하세요!</Text>
        <Text style={styles.desc}>여기에 첫 화면 UI를 만들어 주세요.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  box: { width: '85%', padding: 24, borderRadius: 16, elevation: 2, backgroundColor: '#f7f7f7' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  desc: { fontSize: 14, color: '#555' },
});
