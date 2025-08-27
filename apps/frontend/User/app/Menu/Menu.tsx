import React from "react";
import { ImageBackground, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import BG from "../../assets/images/SOLSOLBackground.png";
import { TopBar } from "../../components/scholarship/TopBar";
import { MenuList } from "../../components/menu/MenuList";

export default function MenuPage() {
  return (
    <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }}>
        <View style={styles.phone}>
          <TopBar title="메뉴" />
          <MenuList />
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({ phone: { width: 360, paddingVertical: 8 } });
