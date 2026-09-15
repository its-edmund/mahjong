import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond/500Medium';
import { CormorantGaramond_500Medium_Italic } from '@expo-google-fonts/cormorant-garamond/500Medium_Italic';
import { GameProvider } from '@/game/provider';
import { colors } from '@/ui/theme';

export default function Layout() {
  const [loaded, error] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, CormorantGaramond_500Medium, CormorantGaramond_500Medium_Italic, JadeHanzi: require('../assets/jade-hanzi.ttf') });
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return <GameProvider><StatusBar style="light" /><Stack screenOptions={{ contentStyle: { backgroundColor: colors.bg }, headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text, headerTitleStyle: { fontFamily: 'DMSans_600SemiBold' }, headerShadowVisible: false }}>
    <Stack.Screen name="index" options={{ title: 'Jade Table', headerShown: false }} />
    <Stack.Screen name="table" options={{ title: 'The everyday table', headerShown: false, animation: 'fade' }} />
    <Stack.Screen name="guide" options={{ title: 'A seat at the table', presentation: 'modal' }} />
    <Stack.Screen name="settings" options={{ title: 'Make yourself comfortable', presentation: 'modal' }} />
  </Stack></GameProvider>;
}
