import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { View } from "react-native";
import { globalStyles } from "../styles/styles";
import { colors } from "../styles/styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";


export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaView style={globalStyles.container}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: colors.lightBg } 
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        {/* <Stack.Screen name="(auth)/_layout.tsx" /> */}
        {/* <Stack.Screen name="register" /> */}
        {/* <Stack.Screen name="(tabs)" /> */}
      </Stack>
    </SafeAreaView>
    </GestureHandlerRootView>



  );
} 