import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { FLOWERS, HONORS, NUMERALS, kindName } from '@/game/tiles';
import { useGame } from '@/game/provider';

const dotPositions: [number, number][][] = [
  [[50,50]], [[25,25],[75,75]], [[22,22],[50,50],[78,78]],
  [[25,22],[75,22],[25,78],[75,78]], [[25,22],[75,22],[50,50],[25,78],[75,78]],
  [[25,20],[75,20],[25,50],[75,50],[25,80],[75,80]],
  [[25,15],[50,30],[75,45],[25,65],[75,65],[25,87],[75,87]],
  [[25,15],[75,15],[25,38],[75,38],[25,62],[75,62],[25,85],[75,85]],
  [[20,18],[50,18],[80,18],[20,50],[50,50],[80,50],[20,82],[50,82],[80,82]],
];
export function TileFace({ kind, size = 42, selected = false, drawn = false, onPress, back = false, smallLabel = false, disabled = false }: {
  kind?: number; size?: number; selected?: boolean; drawn?: boolean; onPress?: () => void; back?: boolean; smallLabel?: boolean; disabled?: boolean;
}) {
  const lift = useRef(new Animated.Value(0)).current;
  const { reducedMotion } = useGame();
  useEffect(() => {
    if (reducedMotion) lift.setValue(selected ? -9 : 0);
    else Animated.spring(lift, { toValue: selected ? -9 : 0, useNativeDriver: true, friction: 7, tension: 140 }).start();
  }, [selected, lift, reducedMotion]);
  const k = kind ?? 32;
  const ink = k < 9 || k === 31 ? '#A94B3E' : k < 18 || k === 32 || k >= 34 ? '#2E6851' : '#35494E';
  const height = size * 1.4;
  const face = <Animated.View style={{ width: size, height, transform: [{ translateY: lift }], borderRadius: Math.max(3, size * 0.12), backgroundColor: back ? '#507660' : '#F1EDDE', borderWidth: selected || drawn ? 2 : 1, borderColor: selected ? '#EBD092' : drawn ? '#D7BD7D' : back ? '#799885' : '#DDD9C9', borderBottomWidth: size > 28 ? 4 : 2, borderBottomColor: back ? '#294D3B' : '#B5B39F', boxShadow: `0 ${size > 28 ? 4 : 2}px 5px rgba(0,0,0,0.20)`, alignItems: 'center', justifyContent: 'center' }}>
    {back ? <View style={{ width: '65%', height: '70%', borderColor: '#80A18A', borderWidth: 1, borderRadius: 3, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: size * 0.25, height: size * 0.25, borderColor: '#80A18A', borderWidth: 1, transform: [{ rotate: '45deg' }] }} /></View>
      : k < 9 ? <View style={{ alignItems: 'center' }}><Text style={{ fontFamily: 'JadeHanzi', color: '#374F44', fontSize: size * 0.46, lineHeight: size * 0.53 }}>{NUMERALS[k]}</Text><Text style={{ fontFamily: 'JadeHanzi', color: ink, fontSize: size * 0.46, lineHeight: size * 0.51 }}>萬</Text></View>
      : k < 27 ? <View style={{ width: '78%', height: '78%' }}>{dotPositions[k % 9].map(([x, y], i) => <View key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: size * (k % 9 === 0 ? 0.44 : 0.16), height: size * (k < 18 ? 0.25 : k % 9 === 0 ? 0.44 : 0.16), transform: [{ translateX: -size * (k % 9 === 0 ? 0.22 : 0.08) }, { translateY: -size * (k < 18 ? 0.125 : k % 9 === 0 ? 0.22 : 0.08) }], borderRadius: k < 18 ? 2 : 30, borderWidth: Math.max(1, size * 0.035), borderColor: ink, backgroundColor: k < 18 ? '#4B805E' : 'transparent' }} />)}</View>
      : k === 33 ? <View style={{ width: '58%', height: '70%', borderRadius: 3, borderWidth: Math.max(1, size * 0.065), borderColor: '#536D85' }} />
      : <Text style={{ fontFamily: 'JadeHanzi', fontSize: size * (k >= 34 ? 0.63 : 0.76), color: ink }}>{k >= 34 ? FLOWERS[k - 34] : HONORS[k - 27]}</Text>}
    {!back && smallLabel && size >= 34 && <Text style={{ position: 'absolute', left: 2, top: 0, color: '#65716A', fontFamily: 'DMSans_600SemiBold', fontSize: 8 }}>{k < 27 ? k % 9 + 1 : k < 31 ? ['E','S','W','N'][k - 27] : ''}</Text>}
  </Animated.View>;
  if (!onPress) return <View accessibilityLabel={back ? 'Concealed tile' : kindName(k)}>{face}</View>;
  return <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={`${kindName(k)}${drawn ? ', drawn tile' : ''}`} accessibilityState={{ selected, disabled }} style={{ paddingTop: 11, paddingBottom: 5 }}>{face}</Pressable>;
}
