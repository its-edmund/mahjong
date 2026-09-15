import { chooseDiscard, isWinningHand, shanten, winningGroups } from './hand';
import { countsOf, createWall, kindName, sortTiles, type Tile } from './tiles';

export type Meld = { type: 'chi' | 'pong' | 'kong'; tiles: Tile[]; from: number; concealed?: boolean };
export type Player = { name: string; hand: Tile[]; melds: Meld[]; flowers: Tile[]; discards: Tile[]; score: number };
export type Claim = { player: number; type: 'hu' | 'pong' | 'kong' | 'chi'; kinds: number[] };
export type Result = { winner: number | null; from?: number; selfDraw: boolean; tai: number; breakdown: { label: string; tai: number }[]; deltas: number[] };
export type Game = {
  version: 1; seed: number; players: Player[]; wall: Tile[]; dealer: number; streak: number; handNumber: number;
  turn: number; phase: 'draw' | 'discard' | 'claim' | 'kong-claim' | 'end';
  lastDiscard: { tile: Tile; player: number } | null; drawnId: number | null;
  pendingKong: { player: number; tile: Tile; meldIndex: number } | null;
  result: Result | null; log: string[]; revision: number;
};
export type Action = { type: 'draw' } | { type: 'discard'; tileId: number } | { type: 'claim'; claim: Claim | null }
  | { type: 'hu' } | { type: 'kong'; kind: number };
export const DEAD_WALL = 16;
export const liveTiles = (g: Game) => Math.max(0, g.wall.length - DEAD_WALL);
export const seatOf = (g: Game, player: number) => (player - g.dealer + 4) % 4;
const clone = (g: Game): Game => JSON.parse(JSON.stringify(g));
const log = (g: Game, text: string) => { g.log = [text, ...g.log].slice(0, 30); };

function finishDraw(g: Game) {
  g.phase = 'end';
  g.result = { winner: null, selfDraw: false, tai: 0, breakdown: [], deltas: [0, 0, 0, 0] };
  log(g, 'The wall is exhausted. A peaceful draw.');
}
function takeTile(g: Game, player: number, replacement = false): boolean {
  while (g.wall.length > DEAD_WALL) {
    const tile = replacement ? g.wall.pop()! : g.wall.shift()!;
    if (tile.kind >= 34) {
      g.players[player].flowers.push(tile);
      log(g, `${g.players[player].name} reveals ${kindName(tile.kind)}.`);
      replacement = true;
    } else {
      g.players[player].hand = sortTiles([...g.players[player].hand, tile]);
      g.drawnId = tile.id;
      return true;
    }
  }
  finishDraw(g);
  return false;
}
export function newGame(seed = Date.now(), previous?: Game): Game {
  const retains = previous?.result?.winner === previous?.dealer || previous?.result?.winner === null;
  const dealer = previous ? (previous.dealer + (retains ? 0 : 1)) % 4 : 0;
  const g: Game = {
    version: 1, seed, players: ['You', 'Lin', 'Mei', 'Jun'].map((name, i) => ({ name, hand: [], melds: [], flowers: [], discards: [], score: previous?.players[i].score ?? 1000 })),
    wall: createWall(seed), dealer, streak: previous && retains ? previous.streak + 1 : 0,
    handNumber: previous ? previous.handNumber + 1 : 1, turn: dealer, phase: 'draw', lastDiscard: null,
    drawnId: null, pendingKong: null, result: null, log: ['A fresh wall. A little possibility.'], revision: 0,
  };
  // Four rounds of four, beginning with the dealer. Flowers receive tail replacements.
  for (let batch = 0; batch < 4; batch++) for (let offset = 0; offset < 4; offset++) for (let n = 0; n < 4; n++) takeTile(g, (dealer + offset) % 4);
  g.drawnId = null;
  return g;
}

export function claimOptions(g: Game, player: number): Claim[] {
  if (g.phase !== 'claim' && g.phase !== 'kong-claim') return [];
  const target = g.phase === 'kong-claim' ? g.pendingKong : g.lastDiscard;
  if (!target || target.player === player) return [];
  const p = g.players[player], k = target.tile.kind, c = countsOf(p.hand), options: Claim[] = [];
  if (isWinningHand([...p.hand, target.tile], p.melds.length)) options.push({ player, type: 'hu', kinds: [k] });
  if (g.phase === 'kong-claim') return options;
  if (c[k] >= 3 && liveTiles(g) > 0) options.push({ player, type: 'kong', kinds: [k, k, k] });
  if (c[k] >= 2) options.push({ player, type: 'pong', kinds: [k, k] });
  if (player === (target.player + 1) % 4 && k < 27) {
    for (let first = Math.max(k - k % 9, k - 2); first <= Math.min(k, k - k % 9 + 6); first++) {
      const kinds = [first, first + 1, first + 2].filter(n => n !== k);
      if (kinds.every(n => c[n] > 0)) options.push({ player, type: 'chi', kinds });
    }
  }
  return options;
}

export function kongOptions(g: Game): number[] {
  if (g.phase !== 'discard' || !liveTiles(g) || g.drawnId === null) return [];
  const p = g.players[g.turn], c = countsOf(p.hand);
  return c.flatMap((n, k) => n === 4 || (n > 0 && p.melds.some(m => m.type === 'pong' && m.tiles[0].kind === k)) ? [k] : []);
}
export const canWin = (g: Game) => g.phase === 'discard' && g.drawnId !== null && isWinningHand(g.players[g.turn].hand, g.players[g.turn].melds.length);
export const visibleTiles = (g: Game) => g.players.flatMap(p => [...p.discards, ...p.flowers, ...p.melds.filter(m => !m.concealed).flatMap(m => m.tiles)]);

function score(g: Game, player: number, selfDraw: boolean, from?: number): Result {
  const p = g.players[player];
  const groups = winningGroups(p.hand, p.melds.length)!;
  const sets = [...groups.slice(1), ...p.melds.map(m => m.tiles.map(t => t.kind))];
  const all = [...p.hand, ...p.melds.flatMap(m => m.tiles)];
  const breakdown: Result['breakdown'] = [];
  const add = (label: string, tai: number) => breakdown.push({ label, tai });
  const closed = p.melds.every(m => m.concealed);
  if (selfDraw && closed) add('Concealed self-draw', 3);
  else { if (selfDraw) add('Self-draw', 1); if (closed) add('Concealed hand', 1); }
  for (let k = 31; k < 34; k++) if (sets.some(s => s[0] === k && s.every(n => n === k))) add(kindName(k), 1);
  const seat = seatOf(g, player);
  if (sets.some(s => s.every(k => k === 27 + seat))) add('Seat wind', 1);
  if (sets.some(s => s.every(k => k === 27))) add('East prevailing wind', 1);
  const flowers = p.flowers.filter(t => (t.kind - 34) % 4 === seat).length;
  if (flowers) add('Seat flowers', flowers);
  if (sets.every(s => s.every(k => k === s[0]))) add('All triplets', 4);
  const suits = new Set(all.filter(t => t.kind < 27).map(t => Math.floor(t.kind / 9)));
  if (suits.size === 1) add(all.some(t => t.kind >= 27) ? 'Half flush' : 'Full flush', all.some(t => t.kind >= 27) ? 4 : 8);
  const tai = breakdown.reduce((n, x) => n + x.tai, 0);
  const amount = 10 + tai * 5;
  const deltas = [0, 0, 0, 0];
  if (selfDraw) {
    for (let i = 0; i < 4; i++) if (i !== player) { deltas[i] = -amount; deltas[player] += amount; }
  } else { deltas[from!] = -amount; deltas[player] = amount; }
  return { winner: player, from, selfDraw, tai, breakdown, deltas };
}
function win(g: Game, player: number, selfDraw: boolean, from?: number) {
  g.result = score(g, player, selfDraw, from);
  g.players.forEach((p, i) => p.score += g.result!.deltas[i]);
  g.phase = 'end'; g.turn = player;
  log(g, `${g.players[player].name} wins${selfDraw ? ' by self-draw' : ''}. ${g.result.tai} tai.`);
}
function removeKinds(p: Player, kinds: number[]): Tile[] {
  return kinds.map(kind => {
    const index = p.hand.findIndex(t => t.kind === kind);
    if (index < 0) throw new Error('Tile is not in hand');
    return p.hand.splice(index, 1)[0];
  });
}
function chooseBotClaim(g: Game, player: number): Claim | null {
  const options = claimOptions(g, player);
  const hu = options.find(c => c.type === 'hu');
  if (hu) return hu;
  const p = g.players[player];
  const before = shanten(p.hand, p.melds.length);
  let best: Claim | null = null, bestDistance = before;
  for (const option of options) {
    const hand = [...p.hand];
    for (const k of option.kinds) hand.splice(hand.findIndex(t => t.kind === k), 1);
    const distance = shanten(hand, p.melds.length + 1);
    if (distance < bestDistance || (option.type === 'kong' && distance <= bestDistance)) { best = option; bestDistance = distance; }
  }
  return best;
}
function resolveClaims(g: Game, human: Claim | null) {
  const target = (g.phase === 'kong-claim' ? g.pendingKong : g.lastDiscard)!;
  const candidates = [human, ...[1, 2, 3].map(p => chooseBotClaim(g, p))].filter((x): x is Claim => x !== null);
  const priority = { hu: 3, kong: 2, pong: 2, chi: 1 };
  candidates.sort((a, b) => priority[b.type] - priority[a.type] || (a.player - target.player + 4) % 4 - (b.player - target.player + 4) % 4);
  const claim = candidates[0];
  if (!claim) {
    if (g.phase === 'kong-claim') {
      const pending = g.pendingKong!;
      const p = g.players[pending.player];
      const meld = p.melds[pending.meldIndex];
      meld.type = 'kong'; meld.tiles.push(...removeKinds(p, [pending.tile.kind]));
      g.pendingKong = null;
      log(g, `${p.name} adds to a kong.`);
      if (takeTile(g, g.turn, true)) g.phase = 'discard';
    } else { g.turn = (target.player + 1) % 4; g.phase = 'draw'; g.drawnId = null; }
    return;
  }
  const p = g.players[claim.player];
  if (g.phase === 'kong-claim') {
    removeKinds(g.players[target.player], [target.tile.kind]);
    g.pendingKong = null;
  } else {
    const discards = g.players[target.player].discards;
    discards.splice(discards.findIndex(t => t.id === target.tile.id), 1);
  }
  g.lastDiscard = null;
  if (claim.type === 'hu') {
    p.hand = sortTiles([...p.hand, target.tile]);
    win(g, claim.player, false, target.player); return;
  }
  const tiles = sortTiles([...removeKinds(p, claim.kinds), target.tile]);
  p.melds.push({ type: claim.type, tiles, from: target.player });
  g.turn = claim.player; g.drawnId = null; g.phase = 'discard';
  log(g, `${p.name} calls ${claim.type}.`);
  if (claim.type === 'kong') takeTile(g, claim.player, true);
}

export function act(game: Game, action: Action): Game {
  const g = clone(game), p = g.players[g.turn];
  if (g.phase === 'end') throw new Error('This hand is finished');
  if (action.type === 'draw') {
    if (g.phase !== 'draw') throw new Error('Not the draw phase');
    g.lastDiscard = null;
    if (takeTile(g, g.turn)) g.phase = 'discard';
  } else if (action.type === 'discard') {
    if (g.phase !== 'discard') throw new Error('Not the discard phase');
    const index = p.hand.findIndex(t => t.id === action.tileId);
    if (index < 0) throw new Error('Tile is not in hand');
    const tile = p.hand.splice(index, 1)[0];
    p.discards.push(tile); g.lastDiscard = { tile, player: g.turn };
    g.drawnId = null; g.phase = 'claim';
    log(g, `${p.name} discards ${kindName(tile.kind)}.`);
  } else if (action.type === 'hu') {
    if (!canWin(g)) throw new Error('This hand is not complete');
    win(g, g.turn, true);
  } else if (action.type === 'claim') {
    if (g.phase !== 'claim' && g.phase !== 'kong-claim') throw new Error('No tile to claim');
    if (action.claim && !claimOptions(g, 0).some(c => JSON.stringify(c) === JSON.stringify(action.claim))) throw new Error('Illegal claim');
    resolveClaims(g, action.claim);
  } else if (action.type === 'kong') {
    if (!kongOptions(g).includes(action.kind)) throw new Error('Illegal kong');
    const index = p.melds.findIndex(m => m.type === 'pong' && m.tiles[0].kind === action.kind);
    if (index >= 0) {
      g.pendingKong = { player: g.turn, tile: p.hand.find(t => t.kind === action.kind)!, meldIndex: index };
      g.phase = 'kong-claim';
    } else {
      p.melds.push({ type: 'kong', tiles: removeKinds(p, Array(4).fill(action.kind)), from: g.turn, concealed: true });
      log(g, `${p.name} declares a concealed kong.`);
      takeTile(g, g.turn, true);
    }
  }
  g.revision++;
  return g;
}
export function advanceBot(g: Game): Game {
  if (g.phase === 'end') return g;
  if (g.phase === 'draw') return act(g, { type: 'draw' });
  if (g.phase === 'claim' || g.phase === 'kong-claim') {
    if (claimOptions(g, 0).length) return g;
    return act(g, { type: 'claim', claim: null });
  }
  if (g.turn === 0) return g;
  if (canWin(g)) return act(g, { type: 'hu' });
  const kongs = kongOptions(g);
  if (kongs.length) return act(g, { type: 'kong', kind: kongs[0] });
  return act(g, { type: 'discard', tileId: chooseDiscard(g.players[g.turn].hand, g.players[g.turn].melds.length, visibleTiles(g)).id });
}

/** Save-file boundary validation, also used by full-game invariant tests. */
export function validateGame(g: Game): boolean {
  try {
    if (g.version !== 1 || g.players.length !== 4 || !['draw', 'discard', 'claim', 'kong-claim', 'end'].includes(g.phase)) return false;
    if (![g.turn, g.dealer].every(n => Number.isInteger(n) && n >= 0 && n < 4)) return false;
    const tiles = [...g.wall, ...g.players.flatMap(p => [...p.hand, ...p.flowers, ...p.discards, ...p.melds.flatMap(m => m.tiles)])];
    if (tiles.length !== 144 || new Set(tiles.map(t => t.id)).size !== 144) return false;
    if (tiles.some(t => !Number.isInteger(t.id) || t.id < 0 || t.id >= 144 || t.kind !== (t.id < 136 ? Math.floor(t.id / 4) : t.id - 102))) return false;
    if (g.players.some(p => !Number.isFinite(p.score) || p.hand.some(t => t.kind >= 34) || p.flowers.some(t => t.kind < 34))) return false;
    if (g.players.reduce((n, p) => n + p.score, 0) !== 4000) return false;
    return true;
  } catch { return false; }
}
