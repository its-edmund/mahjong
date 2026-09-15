import React, { createContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo, AppState } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { act, advanceBot, claimOptions, newGame, validateGame, type Action, type Game } from './engine';

type Settings = { sound: boolean; haptics: boolean; pace: 'relaxed' | 'quick'; labels: boolean };
const initialSettings: Settings = { sound: true, haptics: true, pace: 'relaxed', labels: true };
const KEY = 'jade-table.v1';
type Session = {
  game: Game | null; settings: Settings; loaded: boolean; error: string | null;
  start: (next?: boolean) => void; dispatch: (action: Action) => void; setPlaying: (v: boolean) => void;
  changeSettings: (s: Partial<Settings>) => void; touch: () => void; reducedMotion: boolean;
};
const Context = createContext<Session | null>(null);
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [game, setGame] = useState<Game | null>(null);
  const [settings, setSettings] = useState(initialSettings);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [foreground, setForeground] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const writes = useRef(Promise.resolve());
  const player = useAudioPlayer(require('../../assets/tile-clack.wav'));
  const gameRef = useRef(game); gameRef.current = game;
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KEY).then(raw => {
      if (!raw || !active) return;
      const saved = JSON.parse(raw);
      if (saved.game && validateGame(saved.game)) setGame(saved.game);
      else if (saved.game) setError('Your saved hand could not be restored. Start a fresh table.');
      const s = saved.settings;
      if (s) setSettings({ sound: typeof s.sound === 'boolean' ? s.sound : true, haptics: typeof s.haptics === 'boolean' ? s.haptics : true, labels: typeof s.labels === 'boolean' ? s.labels : true, pace: s.pace === 'quick' ? 'quick' : 'relaxed' });
    }).catch(() => { if (active) setError('Your last session could not be restored. You can still play.'); }).finally(() => { if (active) setLoaded(true); });
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    const state = AppState.addEventListener('change', s => setForeground(s === 'active'));
    return () => { active = false; motion.remove(); state.remove(); };
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const data = JSON.stringify({ game, settings });
    writes.current = writes.current.then(() => AsyncStorage.setItem(KEY, data)).catch(() => setError('Autosave is unavailable. Keep this window open to finish your hand.'));
  }, [game, settings, loaded]);
  function sound() {
    if (!settings.sound) return;
    void player.seekTo(0).then(() => player.play()).catch(() => {});
  }
  function touch() {
    if (settings.haptics && process.env.EXPO_OS === 'ios') void Haptics.selectionAsync().catch(() => {});
  }
  function dispatch(action: Action) {
    const current = gameRef.current;
    if (!current) return;
    try {
      const next = act(current, action);
      gameRef.current = next; setGame(next);
      touch(); sound();
      if (next.phase === 'end' && next.result?.winner === 0 && settings.haptics && process.env.EXPO_OS === 'ios') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) { setError(e instanceof Error ? e.message : 'That move is unavailable.'); }
  }
  useEffect(() => {
    if (!playing || !foreground || !game || game.phase === 'end') return;
    if (game.phase === 'discard' && game.turn === 0) return;
    if (claimOptions(game, 0).length) return;
    const wait = game.phase === 'draw' ? 230 : settings.pace === 'quick' ? 320 : 820;
    const timer = setTimeout(() => {
      if (gameRef.current !== game) return;
      try {
        const next = advanceBot(game);
        gameRef.current = next; setGame(next);
        if (game.phase === 'discard') sound();
      } catch { setError('The table paused after an unexpected move. Start a new table to continue.'); setPlaying(false); }
    }, wait);
    return () => clearTimeout(timer);
  }, [game, playing, foreground, settings.pace, settings.sound]);
  return <Context value={{ game, settings, loaded, error, setPlaying, reducedMotion, touch, dispatch,
    start: (next = false) => { const fresh = newGame(Date.now(), next && game ? game : undefined); gameRef.current = fresh; setGame(fresh); setError(null); },
    changeSettings: s => setSettings(prev => ({ ...prev, ...s })),
  }}>{children}</Context>;
}
export function useGame() { const value = React.use(Context); if (!value) throw new Error('GameProvider is missing'); return value; }
