import React from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '@/game/provider';
import { Brand, Button, Label, Type, colors } from '@/ui/theme';
import { TileFace } from '@/ui/tile';

export default function Home() {
  const { width } = useWindowDimensions();
  const wide = width >= 850;
  const { top, bottom } = useSafeAreaInsets();
  const { start, game, loaded, error } = useGame();
  const resume = game && game.phase !== 'end';
  const play = () => { if (!resume) start(Boolean(game)); router.push('/table'); };
  return <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: colors.bg }} contentContainerStyle={{ flexGrow: 1, paddingTop: top + 26, paddingBottom: bottom + 28, paddingHorizontal: wide ? 48 : 24 }}>
    <View style={{ maxWidth: 1120, width: '100%', alignSelf: 'center', flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Brand small={!wide} /><Button compact secondary onPress={() => router.push('/guide')}>How to play ↗</Button></View>
      <View style={{ flexDirection: wide ? 'row' : 'column', alignItems: 'center', paddingTop: wide ? 80 : 44, paddingBottom: wide ? 65 : 16, gap: wide ? 30 : 8 }}>
        <View style={{ flex: wide ? 1 : undefined, width: wide ? undefined : '100%', gap: 22 }}>
          <Label style={{ color: colors.gold }}>THE SIXTEEN TILE CLUB</Label>
          <Type serif style={{ fontSize: wide ? 76 : 51, lineHeight: wide ? 78 : 53, letterSpacing: -1.7 }}>A little strategy.{"\n"}<Type style={{ fontFamily: 'CormorantGaramond_500Medium_Italic', color: colors.gold, fontSize: wide ? 76 : 51 }}>A little serendipity.</Type></Type>
          <Type muted style={{ fontSize: 16, lineHeight: 26, maxWidth: 355 }}>The familiar rhythm of mahjong,{"\n"}with a little more room to breathe.</Type>
          {wide && <View style={{ flexDirection: 'row', gap: 18, paddingTop: 13 }}><Label style={{ color: colors.muted }}>16 TILES</Label><Type muted>·</Type><Label style={{ color: colors.muted }}>4 SEATS</Label><Type muted>·</Type><Label style={{ color: colors.muted }}>YOUR PACE</Label></View>}
        </View>
        <View accessibilityLabel="Ivory mahjong tiles on a jade green table" style={{ width: wide ? 440 : Math.min(width - 48, 350), height: wide ? 340 : 240, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', width: '91%', height: '91%', borderRadius: 200, backgroundColor: '#192D24', borderWidth: 1, borderColor: '#2B4536' }} />
          <View style={{ position: 'absolute', width: '77%', height: '76%', borderRadius: 180, borderWidth: 1, borderColor: '#355140', backgroundColor: '#203A2D' }} />
          <Type serif style={{ position: 'absolute', top: wide ? 50 : 28, fontSize: 18, color: '#91A18A', letterSpacing: 4 }}>慢慢來</Type>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 17, gap: wide ? 9 : 6, transform: [{ rotate: '-10deg' }] }}>{[0, 1, 2, 32].map((kind, i) => <View key={kind} style={{ transform: [{ translateY: [14, -2, -7, 4][i] }, { rotate: `${[-8, -2, 3, 12][i]}deg` }] }}><TileFace kind={kind} size={wide ? 68 : 53} /></View>)}</View>
          <View style={{ position: 'absolute', bottom: wide ? 40 : 22, right: wide ? 48 : 20, flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#304B3A', borderRadius: 30, paddingVertical: 10, paddingHorizontal: 17, borderWidth: 1, borderColor: '#49644D' }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gold }} /><Type style={{ fontSize: 11, color: '#D9D8B9' }}>A good hand starts here.</Type></View>
        </View>
      </View>
      <View style={{ backgroundColor: colors.surface, borderRadius: 25, padding: wide ? 32 : 24, borderWidth: 1, borderColor: colors.line, flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'stretch', gap: 24 }}>
        <View style={{ flex: 1, gap: 8 }}><Label style={{ color: colors.gold }}>TAIWANESE MAHJONG</Label><Type serif style={{ fontSize: 34 }}>The everyday table.</Type><Type muted style={{ fontSize: 13, lineHeight: 21 }}>Three thoughtful opponents. No rush. Just one more hand.</Type></View>
        <View style={{ gap: 10 }}><Button disabled={!loaded} onPress={play}>{!loaded ? 'Setting the table…' : resume ? 'Return to your table  →' : game ? 'Play another hand  →' : 'Take a seat  →'}</Button><Type muted style={{ textAlign: 'center', fontSize: 11 }}>Single player · Saved on this device</Type></View>
      </View>
      {error && <Type selectable style={{ color: colors.red, paddingTop: 16 }}>{error}</Type>}
      <View style={{ paddingTop: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Label style={{ color: '#748A7D', fontSize: 9, letterSpacing: 1.5 }}>A CLASSIC, AT YOUR PACE.</Label><Button compact secondary onPress={() => router.push('/settings')}>Preferences</Button></View>
    </View>
  </ScrollView>;
}
