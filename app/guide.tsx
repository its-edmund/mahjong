import React from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Label, Type, colors } from '@/ui/theme';
import { TileFace } from '@/ui/tile';

export default function Guide() {
  return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 24, paddingBottom: 60, gap: 27, maxWidth: 680, width: '100%', alignSelf: 'center' }}>
    <Label style={{ color: colors.gold }}>TAIWANESE · SIXTEEN TILES</Label><Type serif style={{ fontSize: 46, lineHeight: 48 }}>A familiar game.{"\n"}A fresh little start.</Type>
    <Type muted style={{ fontSize: 15, lineHeight: 25 }}>You and three computer opponents take turns drawing and discarding. Build five sets and one pair to win: 17 tiles at the moment you finish.</Type>
    <View style={{ backgroundColor: colors.surface, borderRadius: 22, padding: 22, gap: 18 }}><Label>THE BUILDING BLOCKS</Label>{[{ title: 'A sequence · 順子', text: 'Three consecutive numbers in the same suit.', tiles: [0,1,2] }, { title: 'A triplet · 刻子', text: 'Three copies of the same tile.', tiles: [32,32,32] }, { title: 'The pair · 對子', text: 'Two copies of the same tile. Every winning hand needs one.', tiles: [18,18] }].map(item => <View key={item.title} style={{ gap: 9 }}><View style={{ flexDirection: 'row', gap: 5 }}>{item.tiles.map((k,i) => <TileFace key={i} kind={k} size={34} />)}</View><Type>{item.title}</Type><Type muted style={{ fontSize: 12, lineHeight: 20 }}>{item.text}</Type></View>)}</View>
    {[
      ['01', 'Draw. Consider. Discard.', 'Your draw arrives automatically. Tap a tile to lift it, then tap Discard. The gold outline marks your latest draw. Need a nudge? A little hint suggests a discard using only your hand and the open table.'],
      ['02', 'Sometimes, take an opportunity.', 'Chi (吃) makes a sequence using a discard from the player before you. Pong (碰) makes a triplet from any discard. Kong (槓) makes a set of four and gives a replacement draw. Available calls appear as buttons. Win claims take priority, then pong/kong, then chi.'],
      ['03', 'Flowers are a little extra.', 'Flowers and seasons move beside your hand and are replaced automatically from the back of the wall. A kong also draws from the back. This table ends the hand with 16 tiles left in reserve.'],
      ['04', 'Know when to say hu.', 'Tap Win (胡) when a discard completes your hand, or Self-draw when you draw the winning tile. The game checks your five sets and pair. An added kong can be robbed for a win; a concealed kong cannot. If several players can win, the nearest in turn order wins.'],
      ['05', 'Keep it comfortable.', 'Open Discards & melds to inspect the entire public table. Home or a settings screen pauses play. There is no turn timer. Opponents have no access to your concealed tiles or the wall.'],
    ].map(([number, title, text]) => <View key={number} style={{ gap: 10 }}><Label style={{ color: colors.gold }}>{number}</Label><Type serif style={{ fontSize: 29 }}>{title}</Type><Type muted style={{ lineHeight: 23 }}>{text}</Type></View>)}
    <View style={{ gap: 13, padding: 22, borderRadius: 20, borderWidth: 1, borderColor: colors.line }}><Label>PRACTICE HOUSE SCORING</Label><Type muted style={{ fontSize: 12, lineHeight: 22 }}>A win pays 10 points plus 5 per tai. Self-draw: every opponent pays. Discard win: only the discarder pays. Zero-tai hands are allowed.</Type><Type muted style={{ fontSize: 12, lineHeight: 23 }}>Self-draw: 1 tai · Concealed hand: 1 · Concealed self-draw: 3 total · Each dragon triplet: 1 · Seat wind: 1 · East wind: 1 · Each matching seat flower: 1 · All triplets: 4 · Half flush: 4 · Full flush: 8.</Type><Type muted style={{ fontSize: 12, lineHeight: 22 }}>This first version uses a small, explicit set of house bonuses. It does not yet include a complete Taiwanese scoring table, special flower wins, dealer bonuses, or a full four-wind match. East remains the prevailing wind. The dealer retains on a win or draw and otherwise passes to the next player.</Type></View>
    <Button onPress={() => router.back()}>I’m ready</Button>
  </ScrollView>;
}
