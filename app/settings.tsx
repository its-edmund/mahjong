import React from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { useGame } from '@/game/provider';
import { Button, Label, Type, colors } from '@/ui/theme';

export default function Settings() {
  const { settings, changeSettings } = useGame();
  return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 24, paddingBottom: 60, gap: 28, maxWidth: 620, width: '100%', alignSelf: 'center' }}>
    <Type serif style={{ fontSize: 43 }}>Your kind of quiet.</Type><Type muted style={{ lineHeight: 23 }}>A few small things to make the table feel like yours.</Type>
    {([{ key: 'sound', title: 'Tile sounds', text: 'A soft clack as the tiles meet the table.' }, { key: 'haptics', title: 'Haptic feedback', text: 'A subtle touch on supported iPhones.' }, { key: 'labels', title: 'Tile corner labels', text: 'Small numbers and wind letters on your tiles.' }] as const).map(item => <View key={item.key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 23, borderBottomWidth: 1, borderBottomColor: colors.line, gap: 20 }}><View style={{ flex: 1, gap: 7 }}><Type style={{ fontSize: 16 }}>{item.title}</Type><Type muted style={{ lineHeight: 20, fontSize: 12 }}>{item.text}</Type></View><Switch accessibilityLabel={item.title} value={settings[item.key]} onValueChange={v => changeSettings({ [item.key]: v })} trackColor={{ false: '#394B40', true: '#A5935C' }} thumbColor={colors.text} /></View>)}
    <View style={{ gap: 16 }}><Label>TABLE PACE</Label><Type muted style={{ lineHeight: 21 }}>The opponents follow your rhythm. Your own turn never has a timer.</Type><View style={{ flexDirection: 'row', gap: 10 }}>{(['relaxed', 'quick'] as const).map(pace => <Button key={pace} secondary={settings.pace !== pace} style={{ flex: 1 }} onPress={() => changeSettings({ pace })}>{pace === 'relaxed' ? 'Relaxed' : 'A little quicker'}</Button>)}</View></View>
    <Type muted style={{ fontSize: 12, lineHeight: 20 }}>Your hand and preferences are saved on this device. iOS and web saves are separate.</Type>
    <Button onPress={() => router.back()}>Back to it</Button>
  </ScrollView>;
}
