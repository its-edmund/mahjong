import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, advanceBot, canWin, claimOptions, kongOptions, liveTiles, newGame, validateGame, type Game } from '../src/game/engine';
import { chooseDiscard, isWinningHand, shanten } from '../src/game/hand';
import { createWall, type Tile } from '../src/game/tiles';

function hand(kinds: number[]): Tile[] {
  const used = new Map<number, number>();
  return kinds.map(kind => { const copy = used.get(kind) ?? 0; used.set(kind, copy + 1); return { id: kind * 4 + copy, kind }; });
}
function fixture(hands: number[][], discarder?: number, discardKind?: number): Game {
  const g = newGame(1);
  let pool = createWall(2);
  const take = (kind: number) => { const i = pool.findIndex(t => t.kind === kind); assert.ok(i >= 0, `No copy of ${kind}`); return pool.splice(i, 1)[0]; };
  g.players.forEach((p, i) => { p.hand = (hands[i] ?? []).map(take); p.flowers = []; p.melds = []; p.discards = []; });
  if (discarder !== undefined && discardKind !== undefined) {
    const tile = take(discardKind); g.players[discarder].discards.push(tile); g.lastDiscard = { player: discarder, tile }; g.turn = discarder;
  }
  g.wall = pool; g.phase = discarder === undefined ? 'discard' : 'claim'; g.drawnId = discarder === undefined ? g.players[0].hand[0]?.id ?? null : null;
  return g;
}
const winning = [0,1,2, 3,4,5, 9,10,11, 18,19,20, 31,31,31, 32,32];

test('wall has 144 unique tiles: four of each base kind and eight flowers', () => {
  const wall = createWall(44);
  assert.equal(wall.length, 144); assert.equal(new Set(wall.map(t => t.id)).size, 144);
  for (let k = 0; k < 42; k++) assert.equal(wall.filter(t => t.kind === k).length, k < 34 ? 4 : 1);
  assert.deepEqual(createWall(44), wall); assert.notDeepEqual(createWall(45), wall);
});
test('deal replaces flowers and gives each player sixteen playable tiles', () => {
  for (let seed = 0; seed < 50; seed++) {
    const g = newGame(seed); assert.ok(validateGame(g));
    for (const p of g.players) { assert.equal(p.hand.length, 16); assert.ok(p.hand.every(t => t.kind < 34)); }
  }
});
test('win solver accepts five sets plus pair and rejects 13-tile rules, suit crossing, and impossible copies', () => {
  assert.ok(isWinningHand(hand(winning))); assert.equal(shanten(hand(winning)), -1);
  assert.equal(shanten(hand(winning.slice(0, -1))), 0);
  assert.ok(!isWinningHand(hand(winning.slice(3))));
  assert.ok(isWinningHand(hand(winning.slice(3)), 1));
  assert.ok(!isWinningHand(hand([7,8,9, ...winning.slice(3)])));
  assert.ok(!isWinningHand(hand([0,0,0,0,0,0, 9,10,11, 18,19,20, 31,31,31, 32,32])));
  assert.ok(!isWinningHand(hand([...winning.slice(0,16),34])));
});
test('solver backtracks when triples must be split into sequences', () => {
  assert.ok(isWinningHand(hand([0,0,0,1,1,1,2,2,2,3,4,5,18,19,20,32,32])));
});
test('illegal actions leave the original state unchanged', () => {
  const g = newGame(17), before = JSON.stringify(g);
  assert.throws(() => act(g, { type: 'discard', tileId: g.players[0].hand[0].id }));
  assert.equal(JSON.stringify(g), before);
  const drawn = act(g, { type: 'draw' });
  assert.throws(() => act(drawn, { type: 'discard', tileId: -1 }));
  assert.throws(() => act(drawn, { type: 'hu' }));
  assert.throws(() => act(drawn, { type: 'claim', claim: null }));
});
test('chi only comes from the preceding player, with all legal sequence options', () => {
  const g = fixture([[0,1,3,4], [], [], []], 3, 2);
  assert.equal(claimOptions(g,0).filter(c=>c.type==='chi').length,3);
  g.lastDiscard!.player = 1;
  assert.equal(claimOptions(g,0).filter(c=>c.type==='chi').length,0);
});
test('bot win outranks a human pong and transfers the tile only once', () => {
  const g = fixture([[32,32], winning.slice(0,16), [], []], 3, 32);
  const pong = claimOptions(g,0).find(c=>c.type==='pong')!;
  const next = act(g,{type:'claim',claim:pong});
  assert.equal(next.result?.winner,1); assert.equal(next.phase,'end'); assert.ok(validateGame(next));
  assert.equal(next.players[3].discards.length,0);
  assert.equal(next.result?.deltas.reduce((n,x)=>n+x,0),0);
});
test('equal win priority goes to nearest player in turn order', () => {
  const wait = winning.slice(0,16);
  const second = [3,4,5,6,7,8, 12,13,14, 21,22,23, 30,30,30,32];
  const g = fixture([wait,second,[],[]],3,32);
  const next=act(g,{type:'claim',claim:claimOptions(g,0).find(c=>c.type==='hu')!});
  assert.equal(next.result?.winner,0); assert.ok(validateGame(next));
});
test('exposed kong draws exactly one replacement and counts as one set', () => {
  const g=fixture([[32,32,32,0,1,2,3,4,5,9,10,11,18,19,20,31],[],[],[]],3,32);
  const kong=claimOptions(g,0).find(c=>c.type==='kong')!;
  const next=act(g,{type:'claim',claim:kong});
  assert.equal(next.turn,0); assert.equal(next.players[0].hand.length,14); assert.equal(next.players[0].melds[0].tiles.length,4); assert.ok(validateGame(next));
});
test('concealed kong replaces from the back, replacing flowers in a chain', () => {
  const g=fixture([[32,32,32,32,0,1,2,3,4,5,9,10,11,18,19,20,31],[],[],[]]);
  const flower=g.wall.splice(g.wall.findIndex(t=>t.kind===34),1)[0];
  const replacement=g.wall.splice(g.wall.findIndex(t=>t.kind===30),1)[0];
  g.wall.push(replacement,flower);
  assert.deepEqual(kongOptions(g),[32]);
  const next=act(g,{type:'kong',kind:32});
  assert.equal(next.drawnId,replacement.id); assert.equal(next.players[0].flowers[0].id,flower.id); assert.equal(next.players[0].hand.length,14); assert.ok(validateGame(next));
});
test('added kong can be robbed before replacement draw', () => {
  const g=fixture([winning.filter(k=>k!==2),[2,2,2],[],[2]]);
  const tiles=g.players[1].hand.splice(0,3); g.players[3].melds=[{type:'pong',tiles,from:1}];
  g.turn=3;g.drawnId=g.players[3].hand[0].id;
  const pending=act(g,{type:'kong',kind:2});
  assert.equal(pending.phase,'kong-claim');
  const won=act(pending,{type:'claim',claim:claimOptions(pending,0)[0]});
  assert.equal(won.result?.winner,0);assert.equal(won.players[3].melds[0].type,'pong');assert.equal(won.wall.length,pending.wall.length);assert.ok(validateGame(won));
});
test('added kong completes when everyone passes', () => {
  const g=fixture([[],[32,32,32],[],[32]]);
  g.players[3].melds=[{type:'pong',tiles:g.players[1].hand.splice(0,3),from:1}];g.turn=3;g.drawnId=g.players[3].hand[0].id;
  const next=act(act(g,{type:'kong',kind:32}),{type:'claim',claim:null});
  assert.equal(next.phase,'discard');assert.equal(next.players[3].melds[0].type,'kong');assert.equal(next.players[3].hand.length,1);assert.ok(validateGame(next));
});
test('human claims are never automatically skipped',()=>{
  const g=fixture([[32,32],[],[],[]],1,32);
  assert.equal(advanceBot(g),g);
  assert.throws(()=>act(g,{type:'claim',claim:{player:0,type:'kong',kinds:[32,32,32]}}));
});
test('wall reserve ends a hand, without drawing past it', () => {
  const g=newGame(10);g.wall=g.wall.slice(0,16);g.phase='draw';
  const next=act(g,{type:'draw'});assert.equal(next.phase,'end');assert.equal(next.result?.winner,null);assert.equal(next.wall.length,16);assert.equal(liveTiles(next),0);
});
test('self-draw pays from all opponents and total points stay constant', () => {
  const g=fixture([winning,[],[],[]]);
  assert.ok(canWin(g));const next=act(g,{type:'hu'});
  assert.equal(next.result?.selfDraw,true);assert.ok(next.result!.deltas.slice(1).every(n=>n<0));assert.ok(validateGame(next));
  assert.equal(next.result?.breakdown.find(x=>x.label==='Concealed self-draw')?.tai,3);
});
test('dealer retains after winning or drawing and rotates after another player wins', () => {
  const g=newGame(1);g.result={winner:0,selfDraw:true,tai:0,breakdown:[],deltas:[0,0,0,0]};g.phase='end';
  assert.equal(newGame(2,g).dealer,0);g.result.winner=2;assert.equal(newGame(2,g).dealer,1);g.result.winner=null;assert.equal(newGame(2,g).dealer,0);
});
test('save validation rejects duplicate tiles, bad identity and malformed state', () => {
  const g=newGame(11);assert.ok(validateGame(JSON.parse(JSON.stringify(g))));
  g.wall[0]=g.wall[1];assert.ok(!validateGame(g));assert.ok(!validateGame({} as Game));
});
test('twenty complete seeded games conserve all tiles and scores without deadlocks', () => {
  let wins=0;
  for(let seed=1;seed<=20;seed++) {
    let g=newGame(seed),moves=0;
    while(g.phase!=='end' && moves++<500) {
      if(g.phase==='discard' && g.turn===0) {
        if(canWin(g)) g=act(g,{type:'hu'});
        else if(kongOptions(g).length) g=act(g,{type:'kong',kind:kongOptions(g)[0]});
        else g=act(g,{type:'discard',tileId:chooseDiscard(g.players[0].hand,g.players[0].melds.length).id});
      } else if(claimOptions(g,0).length) g=act(g,{type:'claim',claim:claimOptions(g,0)[0]});
      else g=advanceBot(g);
      assert.ok(validateGame(g),`Invalid game at seed ${seed}, move ${moves}`);
      if(g.phase!=='end') g.players.forEach((p,i)=>{
        const extra=(g.phase==='discard'||g.phase==='kong-claim')&&g.turn===i?1:0;
        assert.equal(p.hand.length,16-p.melds.length*3+extra,`Wrong hand size at seed ${seed}, player ${i}, ${g.phase}`);
      });
    }
    assert.equal(g.phase,'end',`Seed ${seed} did not finish`);
    if(g.result?.winner!==null) wins++;
  }
  assert.ok(wins>0,'Simulation must exercise winning paths');
});
