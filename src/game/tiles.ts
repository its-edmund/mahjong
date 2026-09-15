export type Tile = { id: number; kind: number };
export const WINDS = ['East', 'South', 'West', 'North'];
export const WIND_MARKS = ['東', '南', '西', '北'];
export const NUMERALS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
export const HONORS = [...WIND_MARKS, '中', '發', '白'];
export const FLOWERS = ['梅', '蘭', '竹', '菊', '春', '夏', '秋', '冬'];
export const kindName = (kind: number): string => kind < 27
  ? `${kind % 9 + 1} ${['characters', 'bamboo', 'dots'][Math.floor(kind / 9)]}`
  : kind < 31 ? `${WINDS[kind - 27]} wind`
  : kind < 34 ? ['Red dragon', 'Green dragon', 'White dragon'][kind - 31]
  : ['Plum', 'Orchid', 'Bamboo flower', 'Chrysanthemum', 'Spring', 'Summer', 'Autumn', 'Winter'][kind - 34];
export const sortTiles = (tiles: Tile[]) => [...tiles].sort((a, b) => a.kind - b.kind || a.id - b.id);
export const countsOf = (tiles: Tile[]) => {
  const counts = Array(34).fill(0) as number[];
  for (const tile of tiles) if (tile.kind < 34) counts[tile.kind]++;
  return counts;
};
export function createWall(seed: number): Tile[] {
  let value = seed >>> 0;
  const random = () => {
    value += 0x6D2B79F5;
    let x = Math.imul(value ^ (value >>> 15), 1 | value);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  const wall = Array.from({ length: 144 }, (_, id) => ({ id, kind: id < 136 ? Math.floor(id / 4) : id - 102 }));
  for (let i = wall.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [wall[i], wall[j]] = [wall[j], wall[i]];
  }
  return wall;
}
