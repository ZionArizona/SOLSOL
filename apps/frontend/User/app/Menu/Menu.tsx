import React from "react";
import { ImageBackground, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import BG from "../../assets/images/SOLSOLBackground.png";
import { MenuList } from "../../components/menu/MenuList";
import { TopBar } from "../../components/scholarship/TopBar";

export default function MenuPage() {
  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }}>
        <View style={styles.phone}>
          <TopBar title="메뉴" />
          <MenuList />
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({ phone: { width: "100%", paddingVertical: 8 } });
