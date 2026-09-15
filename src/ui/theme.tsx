import React from 'react';
import { Pressable, Text, View, type TextProps, type ViewStyle } from 'react-native';

export const colors = { bg: '#101C19', surface: '#182822', felt: '#234638', text: '#F1EDE0', muted: '#9AAEA3', gold: '#D7BD7D', line: '#304239', green: '#AED1AC', red: '#D58874' };
export function Type({ style, serif, muted, children, ...props }: TextProps & { serif?: boolean; muted?: boolean }) {
  const content = React.Children.map(children, child => typeof child === 'string' ? child.split(/([\u3400-\u9fff]+)/).map((part, i) => /[\u3400-\u9fff]/.test(part) ? <Text key={i} style={{ fontFamily: 'JadeHanzi' }}>{part}</Text> : part) : child);
  return <Text {...props} style={[{ fontFamily: serif ? 'CormorantGaramond_500Medium' : 'DMSans_400Regular', color: muted ? colors.muted : colors.text, fontSize: 14 }, style]}>{content}</Text>;
}
export function Label({ children, style }: { children: React.ReactNode; style?: TextProps['style'] }) {
  return <Type style={[{ fontFamily: 'DMSans_600SemiBold', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' }, style]}>{children}</Type>;
}
export function Button({ children, onPress, secondary, disabled, compact, label, style }: {
  children: React.ReactNode; onPress: () => void; secondary?: boolean; disabled?: boolean; compact?: boolean; label?: string; style?: ViewStyle;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed, hovered }) => [{ minHeight: compact ? 42 : 52, paddingHorizontal: compact ? 17 : 25, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: secondary ? (hovered ? '#30463B' : '#24392F') : (hovered ? '#E5CD96' : colors.gold), opacity: disabled ? 0.36 : pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }], borderWidth: secondary ? 1 : 0, borderColor: '#3C5143' }, style]}>
    <Type style={{ color: secondary ? colors.text : '#1B2A20', fontFamily: 'DMSans_600SemiBold', fontSize: compact ? 12 : 14 }}>{children}</Type>
  </Pressable>;
}
export function Brand({ small = false }: { small?: boolean }) {
  return <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
    <View style={{ width: small ? 30 : 36, height: small ? 38 : 45, borderRadius: 7, backgroundColor: colors.gold, borderBottomWidth: 4, borderBottomColor: '#A99158', alignItems: 'center', justifyContent: 'center' }}><Type style={{ fontSize: 25, color: '#243B2D' }}>發</Type></View>
    <Type serif style={{ fontSize: small ? 25 : 31, letterSpacing: -0.5 }}>jade table<Type style={{ color: colors.gold, fontSize: 22 }}>.</Type></Type>
  </View>;
}
