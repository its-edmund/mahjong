import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '@/game/provider';
import { canWin, claimOptions, kongOptions, liveTiles, seatOf, visibleTiles, type Game } from '@/game/engine';
import { chooseDiscard, shanten } from '@/game/hand';
import { FLOWERS, WIND_MARKS, WINDS, kindName } from '@/game/tiles';
import { Brand, Button, Label, Type, colors } from '@/ui/theme';
import { TileFace } from '@/ui/tile';

function Opponent({ game, index, horizontal = false, compact = false }: { game: Game; index: number; horizontal?: boolean; compact?: boolean }) {
  const p = game.players[index], active = game.turn === index && game.phase !== 'end';
  return <View style={{ alignItems: 'center', gap: 7, maxWidth: horizontal ? 230 : 65 }}>
    <View style={{ flexDirection: horizontal ? 'row' : 'column', alignItems: 'center', gap: horizontal ? 9 : 6 }}>
      <View style={{ width: compact ? 33 : 39, height: compact ? 33 : 39, borderRadius: 25, borderWidth: active ? 2 : 1, borderColor: active ? colors.gold : '#708474', backgroundColor: ['','#52685B','#6F6551','#54656A'][index], alignItems: 'center', justifyContent: 'center' }}><Type serif style={{ fontSize: compact ? 22 : 26 }}>{['','林','梅','君'][index]}</Type></View>
      <View style={{ alignItems: horizontal ? 'flex-start' : 'center', gap: 2 }}><Type style={{ fontSize: 12, color: active ? colors.gold : colors.text, fontFamily: 'DMSans_600SemiBold' }}>{p.name} <Type style={{ fontSize: 10, color: '#A3BBA4' }}>{WIND_MARKS[seatOf(game, index)]}</Type></Type><Type style={{ color: '#A8BEAF', fontSize: 10, fontVariant: ['tabular-nums'] }}>{p.score.toLocaleString()}</Type></View>
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'center', maxWidth: horizontal ? 210 : 41 }}>{p.hand.map(t => <TileFace key={t.id} back size={horizontal ? 9 : 6} />)}</View>
    {p.melds.length > 0 && <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>{p.melds.map((m, i) => <View key={i} style={{ flexDirection: 'row', gap: 1 }}>{m.tiles.map(t => <TileFace key={t.id} kind={t.kind} back={m.concealed} size={horizontal ? 10 : 8} />)}</View>)}</View>}
    {p.flowers.length > 0 && <Type style={{ fontSize: 9, color: '#C7C9A3' }}>{p.flowers.length} flowers</Type>}
  </View>;
}

function DiscardArea({ game, index, size }: { game: Game; index: number; size: number }) {
  const p = game.players[index];
  return <View style={{ flex: 1, gap: 6, minHeight: size * 3.6 }}>
    <Type style={{ color: '#A7BCAA', fontSize: 9, letterSpacing: 1 }}>{WIND_MARKS[seatOf(game, index)]} · {p.name.toUpperCase()} {p.discards.length > 12 ? `(${p.discards.length})` : ''}</Type>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>{p.discards.slice(-12).map(t => <TileFace key={t.id} kind={t.kind} size={size} drawn={game.lastDiscard?.tile.id === t.id} />)}</View>
  </View>;
}

export default function Table() {
  const { width } = useWindowDimensions();
  const wide = width >= 1040, phone = width < 600;
  const { top, bottom } = useSafeAreaInsets();
  const { game, loaded, settings, dispatch, setPlaying, start, touch, error } = useGame();
  const [selected, setSelected] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const [history, setHistory] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  useFocusEffect(useCallback(() => { setPlaying(true); return () => setPlaying(false); }, [setPlaying]));
  useEffect(() => { setSelected(null); setHint(false); }, [game?.revision, game?.seed]);
  useEffect(() => { if (loaded && !game) router.replace('/'); }, [loaded, game]);
  const distance = useMemo(() => game ? shanten(game.players[0].hand, game.players[0].melds.length) : 5, [game?.players[0].hand.map(t => t.id).join(','), game?.players[0].melds.length]);
  if (!game) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  const me = game.players[0], myTurn = game.turn === 0 && game.phase === 'discard';
  const claims = claimOptions(game, 0);
  const kongs = myTurn ? kongOptions(game) : [];
  const winning = myTurn && canWin(game);
  const tileSize = phone ? Math.min(37, Math.floor((width - 54) / 9) - 3) : Math.min(43, Math.floor(((wide ? Math.min(width - 380, 870) : width - 64) - 34) / 17) - 3);
  const rows = phone ? [me.hand.slice(0, 9), me.hand.slice(9)] : [me.hand];
  const chosen = me.hand.find(t => t.id === selected);
  const status = game.phase === 'end' ? 'HAND COMPLETE' : claims.length ? 'A TILE FOR YOU?' : myTurn ? 'YOUR MOVE' : game.turn === 0 ? 'YOUR TURN' : `${game.players[game.turn].name.toUpperCase()}’S TURN`;
  const requestHint = () => { const tile = chooseDiscard(me.hand, me.melds.length, visibleTiles(game)); setSelected(tile.id); setHint(true); touch(); };
  return <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: top + (phone ? 16 : 24), paddingHorizontal: phone ? 12 : 28, paddingBottom: bottom + 24 }}>
    <View style={{ width: '100%', maxWidth: 1200, alignSelf: 'center', gap: phone ? 18 : 25 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: phone ? 7 : 0 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Home, save and pause table" onPress={() => router.replace('/')}><Brand small /></Pressable>
        <View style={{ flexDirection: 'row', gap: 8 }}><Button compact secondary onPress={() => router.push('/guide')} label="How to play">?</Button><Button compact secondary onPress={() => router.push('/settings')}>Settings</Button></View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 26 }}>
        <View style={{ flex: 1, gap: 17, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 5 }}><Label style={{ color: colors.gold, fontSize: phone ? 9 : 10 }}>THE EVERYDAY TABLE</Label><Type muted style={{ fontSize: 11 }}>Taiwanese · Hand {game.handNumber}</Type></View>
          <View style={{ height: phone ? 340 : 425, borderRadius: phone ? 28 : 40, backgroundColor: colors.felt, borderWidth: 1, borderColor: '#49634D', borderBottomWidth: 7, borderBottomColor: '#152F24', overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,0.14)' }}>
            <View pointerEvents="none" style={{ position: 'absolute', top: 9, bottom: 9, left: 9, right: 9, borderWidth: 1, borderColor: '#3A5945', borderRadius: phone ? 21 : 33 }} />
            <View style={{ position: 'absolute', top: 19, alignSelf: 'center' }}><Opponent game={game} index={2} horizontal compact={phone} /></View>
            <View style={{ position: 'absolute', top: phone ? 155 : 160, left: phone ? 15 : 28 }}><Opponent game={game} index={3} compact={phone} /></View>
            <View style={{ position: 'absolute', top: phone ? 155 : 160, right: phone ? 15 : 28 }}><Opponent game={game} index={1} compact={phone} /></View>
            <View style={{ position: 'absolute', top: phone ? 115 : 120, width: phone ? '57%' : '64%', maxWidth: 410, alignSelf: 'center', gap: 12 }}>
              <View style={{ flexDirection: 'row', gap: 13 }}><DiscardArea game={game} index={3} size={phone ? 12 : 18} /><DiscardArea game={game} index={2} size={phone ? 12 : 18} /></View>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#43604A', paddingVertical: 10 }}><Type serif style={{ fontSize: phone ? 25 : 31, color: '#D9C78F' }}>東</Type><View style={{ gap: 3 }}><Label style={{ fontSize: 8, letterSpacing: 1.8, color: '#D7D9BF' }}>EAST TABLE</Label><Type selectable style={{ fontSize: 10, color: '#B4C7B7', fontVariant: ['tabular-nums'] }}>{liveTiles(game)} tiles remaining</Type></View></View>
              <View style={{ flexDirection: 'row', gap: 13 }}><DiscardArea game={game} index={0} size={phone ? 12 : 18} /><DiscardArea game={game} index={1} size={phone ? 12 : 18} /></View>
            </View>
            <View style={{ position: 'absolute', bottom: 16, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7, paddingHorizontal: 15, backgroundColor: '#1D392D', borderRadius: 20, borderWidth: 1, borderColor: '#4D6450' }}><View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: myTurn || claims.length ? colors.gold : '#7A9980' }} /><Label style={{ fontSize: 8, color: myTurn || claims.length ? colors.gold : '#BCCBBB', letterSpacing: 1.5 }}>{status}</Label></View>
          </View>
          <View accessibilityLiveRegion="polite" style={{ alignItems: 'center', minHeight: 17 }}><Type muted style={{ fontSize: 11, textAlign: 'center' }}>{game.log[0]}</Type></View>
          {game.phase === 'end' && <View style={{ padding: 22, backgroundColor: '#293F30', borderRadius: 22, borderWidth: 1, borderColor: '#6F7450', gap: 13 }}>
            <Label style={{ color: colors.gold }}>{game.result?.winner === 0 ? 'NICELY PLAYED' : game.result?.winner === null ? 'UNTIL THE NEXT HAND' : 'A GOOD HAND'}</Label>
            <Type serif style={{ fontSize: 35 }}>{game.result?.winner === null ? 'A peaceful draw.' : `${game.players[game.result!.winner!].name === 'You' ? 'You win' : `${game.players[game.result!.winner!].name} wins`}.`}</Type>
            <Type style={{ lineHeight: 21, color: colors.muted }}>{game.result?.winner === null ? 'The wall has reached its reserve. Scores stay the same.' : `${game.result?.selfDraw ? 'Self-draw' : 'Discard win'} · ${game.result?.tai} tai · ${game.result?.deltas[game.result.winner!]} points`}</Type>
            {game.result?.winner !== null && <><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>{game.players[game.result!.winner!].hand.map(t => <TileFace key={t.id} kind={t.kind} size={24} />)}</View><Type muted style={{ fontSize: 11, lineHeight: 19 }}>Base: 10 points{game.result?.breakdown.map(x => ` · ${x.label}: ${x.tai} tai`).join('')}{'\n'}Each tai adds 5 points. Practice house scoring.</Type></>}
            <Button onPress={() => { start(true); setHistory(false); }}>Another hand  →</Button>
          </View>}
          <View style={{ backgroundColor: '#17281F', borderWidth: 1, borderColor: colors.line, padding: phone ? 12 : 18, borderRadius: 22, gap: 9 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Label style={{ fontSize: 9 }}>YOUR HAND <Type style={{ color: colors.gold, fontSize: 12 }}> {WIND_MARKS[seatOf(game, 0)]}</Type></Label><Type selectable muted style={{ fontSize: 11 }}>{me.score.toLocaleString()} points {distance === 0 && !myTurn ? ' · Ready hand' : ''}</Type></View>
            <View style={{ gap: 0, alignItems: 'center' }}>{rows.map((row, i) => <View key={i} style={{ flexDirection: 'row', gap: 3, justifyContent: 'center', minHeight: row.length ? tileSize * 1.4 + 16 : 0 }}>{row.map(t => <TileFace key={t.id} kind={t.kind} size={tileSize} selected={selected === t.id} drawn={myTurn && game.drawnId === t.id} smallLabel={settings.labels} onPress={() => { setSelected(t.id); setHint(false); touch(); }} disabled={!myTurn} />)}</View>)}</View>
            {(me.melds.length > 0 || me.flowers.length > 0) && <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>{me.melds.map((m, i) => <View key={i} style={{ flexDirection: 'row', gap: 2 }}>{m.tiles.map(t => <TileFace key={t.id} kind={t.kind} size={22} />)}<Type muted style={{ fontSize: 8, alignSelf: 'center' }}>{m.concealed ? 'C' : ''}</Type></View>)}{me.flowers.length > 0 && <Type style={{ color: colors.gold, fontSize: 13 }}>{me.flowers.map(t => FLOWERS[t.kind - 34]).join('  ')} <Type muted style={{ fontSize: 10 }}>flowers</Type></Type>}</View>}
            <Type style={{ textAlign: 'center', color: hint ? colors.gold : colors.muted, fontSize: 11, lineHeight: 17 }}>{claims.length ? 'You can claim this tile, or let it pass.' : myTurn ? chosen ? `${hint ? 'Suggested discard: ' : ''}${kindName(chosen.kind)}${hint ? '. Keeps your hand closer to completion.' : '. Tap Discard to play it.'}` : 'Choose a tile to discard. Take your time.' : game.phase === 'end' ? 'Every hand is a new beginning.' : 'The table is thinking. Your turn will arrive shortly.'}</Type>
          </View>
          {claims.length > 0 ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>{claims.map((claim, i) => <Button compact key={i} onPress={() => dispatch({ type: 'claim', claim })}>{claim.type === 'hu' ? '胡  Win' : claim.type === 'pong' ? '碰  Pong' : claim.type === 'kong' ? '槓  Kong' : `吃  Chi ${[...claim.kinds, game.lastDiscard!.tile.kind].sort((a,b) => a-b).map(k => k % 9 + 1).join('·')}`}</Button>)}<Button compact secondary onPress={() => dispatch({ type: 'claim', claim: null })}>Pass</Button></View>
          : game.phase !== 'end' && <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><Button compact secondary disabled={!myTurn} onPress={requestHint}>A little hint</Button><View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{kongs.map(k => <Button compact secondary key={k} onPress={() => dispatch({ type: 'kong', kind: k })}>Kong: {kindName(k)}</Button>)}{winning && <Button onPress={() => dispatch({ type: 'hu' })}>胡  Self-draw</Button>}<Button disabled={!myTurn || selected === null} onPress={() => { if (selected !== null) dispatch({ type: 'discard', tileId: selected }); }}>Discard tile  ↑</Button></View></View>}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 3 }}><Button secondary compact onPress={() => setHistory(v => !v)}>{history ? 'Close table history' : 'Discards & melds'}</Button><Button secondary compact onPress={() => setConfirmNew(v => !v)}>New table</Button></View>
          {confirmNew && <View style={{ padding: 18, borderRadius: 18, borderWidth: 1, borderColor: colors.line, gap: 14 }}><Type>Start fresh? This replaces your saved hand and resets points.</Type><View style={{ flexDirection: 'row', gap: 8 }}><Button compact onPress={() => { start(); setConfirmNew(false); }}>Start fresh</Button><Button compact secondary onPress={() => setConfirmNew(false)}>Keep playing</Button></View></View>}
          {history && <View style={{ padding: 20, backgroundColor: colors.surface, borderRadius: 20, gap: 22 }}><Label>THE OPEN TABLE</Label>{game.players.map((p, i) => <View key={i} style={{ gap: 10 }}><Type>{p.name} · {WINDS[seatOf(game, i)]} · {p.discards.length} discards</Type><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>{p.discards.map(t => <TileFace key={t.id} kind={t.kind} size={26} />)}{!p.discards.length && <Type muted>No discards yet.</Type>}</View>{p.melds.map((m, mi) => <View key={mi} style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>{m.tiles.map(t => <TileFace key={t.id} kind={t.kind} back={m.concealed && i !== 0 && game.phase !== 'end'} size={26} />)}<Type muted style={{ fontSize: 11 }}> {m.concealed ? 'Concealed kong' : m.type}</Type></View>)}{p.flowers.length > 0 && <Type muted>Flowers: {p.flowers.map(t => FLOWERS[t.kind - 34]).join(' ')}</Type>}</View>)}</View>}
          {error && <Type selectable style={{ color: colors.red }}>{error}</Type>}
        </View>
        {wide && <View style={{ width: 245, paddingTop: 2, gap: 26 }}>
          <Label style={{ color: colors.muted }}>AT THE TABLE</Label>
          <View style={{ padding: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 22, gap: 15 }}><Type serif style={{ fontSize: 29 }}>Find your rhythm.</Type><Type muted style={{ fontSize: 12, lineHeight: 21 }}>Build five sets and a pair. Keep what connects. Let the rest go.</Type><View style={{ flexDirection: 'row', gap: 5, paddingVertical: 4 }}>{[18,19,20].map(k => <TileFace key={k} kind={k} size={34} />)}<View style={{ width: 8 }} />{[32,32].map((k,i) => <TileFace key={i} kind={k} size={27} />)}</View><Type style={{ color: colors.gold, fontSize: 11 }}>A sequence. A pair. A beginning.</Type></View>
          <View style={{ gap: 16 }}><Label style={{ color: colors.muted }}>THE COMPANY</Label>{game.players.map((p, i) => <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Type style={{ fontSize: 13 }}><Type style={{ color: colors.gold }}> {WIND_MARKS[seatOf(game, i)]} </Type> {p.name}</Type><Type selectable muted style={{ fontSize: 13, fontVariant: ['tabular-nums'] }}>{p.score.toLocaleString()}</Type></View>)}</View>
          <View style={{ height: 1, backgroundColor: colors.line }} />
          <View style={{ gap: 13 }}><Label style={{ color: colors.muted }}>TABLE TALK</Label>{game.log.slice(0, 4).map((line, i) => <Type key={`${i}-${line}`} muted style={{ fontSize: 11, lineHeight: 18, opacity: 1 - i * 0.13 }}>{line}</Type>)}</View>
          <Type muted style={{ fontSize: 10, lineHeight: 18 }}>Relaxed practice scoring.{"\n"}No timers. No stakes. Just the game.</Type>
        </View>}
      </View>
    </View>
  </ScrollView>;
}
