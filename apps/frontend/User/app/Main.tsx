import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MainProps {
  onLogout: () => void;
}

const Main = ({ onLogout }: MainProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Main Page (Logged In)</Text>
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

export default Main;