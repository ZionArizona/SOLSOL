import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MainPageProps {
  onLogout: () => void;
}

const MainPage = ({ onLogout }: MainPageProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default MainPage;