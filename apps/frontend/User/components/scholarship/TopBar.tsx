import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";

export const TopBar = ({ title, onBackPress }: { title: string; onBackPress?: () => void }) => {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      console.log('Back button pressed, can go back:', router.canGoBack());
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push("/");
      }
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftWrap}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.headerTitle}>{title}</Text>

      <View style={styles.rightWrap}>
        <TouchableOpacity 
          onPress={() => { router.push('/Notifications/Notifications'); }} 
          style={styles.iconBtn}
        >
          <Image source={require('../../assets/images/BellIcon.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => { router.push('/'); }} 
          style={styles.iconBtn}
        >
          <Image source={require('../../assets/images/HomeIcon.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => { router.push('/Menu/Menu'); }} 
          style={styles.iconBtn}
        >
          <Image source={require('../../assets/images/HamburgerButton.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 14, 
    paddingHorizontal: 16
  },
  leftWrap: { 
    width: 96, 
    justifyContent: 'center'
  },
  rightWrap: { 
    width: 96, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-end'
  },
  backButton: { 
    padding: 8
  },
  backText: { 
    fontSize: 16, 
    color: '#8FA1FF', 
    fontWeight: '600'
  },
  headerTitle: { 
    flex: 1, 
    textAlign: 'center', 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#333'
  },
  iconBtn: { 
    padding: 4, 
    marginLeft: 8
  },
  icon: { 
    width: 20, 
    height: 20, 
    resizeMode: 'contain'
  },
});
