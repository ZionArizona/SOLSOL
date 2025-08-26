import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, ImageBackground } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface MyCalendarProps {
  onBack: () => void;
}

const MyCalendar: React.FC<MyCalendarProps> = ({ onBack }) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar translucent={false} backgroundColor={'#ffffff'} barStyle="dark-content" />
      
      <ImageBackground source={require('../assets/images/SOLSOLBackground.png')} style={styles.background} resizeMode="cover">
      
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>내 캘린더</Text>
          <View style={styles.placeholder} />
        </View>
      
      
      
      
      
        
      
      
      </ImageBackground>


      

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  background: { flex: 1, justifyContent: 'flex-start', alignItems: 'stretch',},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#8FA1FF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  gradeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  calendarPlaceholder: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeholderText: {
    fontSize: 18,
    color: '#999',
  },
});

export default MyCalendar;