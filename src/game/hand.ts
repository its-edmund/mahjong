import { countsOf, type Tile } from './tiles';

/** Five sets plus a pair. Exposed kongs occupy one set, not four hand slots. */
export function winningGroups(tiles: Tile[], exposedSets = 0): number[][] | null {
  const needed = 5 - exposedSets;
  if (needed < 0 || tiles.length !== needed * 3 + 2 || tiles.some(t => t.kind >= 34)) return null;
  const c = countsOf(tiles);
  if (c.some(n => n > 4)) return null;
  const failed = new Set<string>();
  function sets(left: number): number[][] | null {
    if (!left) return c.every(n => n === 0) ? [] : null;
    const key = c.join('');
    if (failed.has(key)) return null;
    const i = c.findIndex(n => n > 0);
    if (i < 0) return null;
    if (c[i] >= 3) {
      c[i] -= 3;
      const rest = sets(left - 1);
      c[i] += 3;
      if (rest) return [[i, i, i], ...rest];
    }
    if (i < 27 && i % 9 <= 6 && c[i + 1] && c[i + 2]) {
      c[i]--; c[i + 1]--; c[i + 2]--;
      const rest = sets(left - 1);
      c[i]++; c[i + 1]++; c[i + 2]++;
      if (rest) return [[i, i + 1, i + 2], ...rest];
    }
    failed.add(key);
    return null;
  }
  for (let i = 0; i < 34; i++) if (c[i] >= 2) {
    c[i] -= 2;
    const groups = sets(needed);
    c[i] += 2;
    if (groups) return [[i, i], ...groups];
  }
  return null;
}
export const isWinningHand = (tiles: Tile[], exposedSets = 0) => winningGroups(tiles, exposedSets) !== null;

/** Exact standard-hand shanten generalized to five melds; -1 means complete. */
export function shanten(tiles: Tile[], exposedSets = 0): number {
  const c = countsOf(tiles);
  let best = 10;
  const seen = new Set<string>();
  function visit(start: number, sets: number, pairs: number, partial: number) {
    while (start < 34 && c[start] === 0) start++;
    if (start === 34) {
      const total = exposedSets + sets;
      const eye = Math.min(1, pairs);
      best = Math.min(best, 10 - total * 2 - Math.min(5 - total, partial + pairs - eye) - eye);
      return;
    }
    const key = `${c.join('')}:${sets}:${pairs}:${partial}`;
    if (seen.has(key)) return;
    seen.add(key);
    const i = start;
    if (c[i] >= 3) { c[i] -= 3; visit(i, sets + 1, pairs, partial); c[i] += 3; }
    if (i < 27 && i % 9 < 7 && c[i + 1] && c[i + 2]) {
      c[i]--; c[i + 1]--; c[i + 2]--; visit(i, sets + 1, pairs, partial); c[i]++; c[i + 1]++; c[i + 2]++;
    }
    if (c[i] >= 2) { c[i] -= 2; visit(i, sets, pairs + 1, partial); c[i] += 2; }
    if (i < 27 && partial + sets < 5) for (const step of [1, 2]) {
      if (i % 9 + step < 9 && c[i + step]) {
        c[i]--; c[i + step]--; visit(i, sets, pairs, partial + 1); c[i]++; c[i + step]++;
      }
    }
    c[i]--; visit(i, sets, pairs, partial); c[i]++;
  }
  visit(0, 0, 0, 0);
  return best;
}

/** Strategy reads only the acting hand and public tiles. No wall or opponent hands. */
export function chooseDiscard(hand: Tile[], exposedSets: number, publicTiles: Tile[] = []): Tile {
  const known = countsOf([...publicTiles, ...hand]);
  const own = countsOf(hand);
  let best: Tile = hand[0];
  let bestValue = -Infinity;
  for (const tile of hand.filter((t, i) => hand.findIndex(x => x.kind === t.kind) === i)) {
    const remaining = hand.filter(t => t.id !== tile.id);
    const distance = shanten(remaining, exposedSets);
    const c = countsOf(remaining);
    let shape = 0;
    for (let k = 0; k < 34; k++) {
      if (!c[k]) continue;
      shape += c[k] >= 2 ? 2.8 : 0;
      if (k < 27) {
        if (k % 9 < 8 && c[k + 1]) shape += 2;
        if (k % 9 < 7 && c[k + 2]) shape += 0.8;
        if (k % 9 > 0 && k % 9 < 8) shape += 0.1;
      }
      shape += (4 - known[k]) * (c[k] >= 2 ? 0.3 : 0.05);
    }
    const value = -distance * 100 + shape + (own[tile.kind] === 1 && tile.kind >= 27 ? 0.2 : 0);
    if (value > bestValue) { bestValue = value; best = tile; }
  }
  return best;
}
