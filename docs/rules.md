# Rules contract: Taiwanese practice table v1

This file defines the shipped behavior. Taiwanese mahjong is not a single universal house ruleset; choose and test changes explicitly.

## Tiles and turn order

- 136 standard tiles: four copies of 27 suited kinds and seven honor kinds.
- Eight unique flowers/seasons, automatically exposed and replaced from the tail.
- Four players. Index order `0 → 1 → 2 → 3 → 0` is counterclockwise on the table: human bottom, Lin right, Mei top, Jun left.
- Seat East begins with 16 playable tiles and draws one before the first discard. All players receive four batches of four tiles, with replacement flowers.
- Ordinary draws take from the front. Replacements take from the back. Play stops with 16 tiles left; the reserve remains 16 even after replacements. A flower at the exhaustion boundary is exposed and the hand ends drawn if it cannot be replaced.
- Kongs count as one three-tile set for the logical hand size. Before discarding, the concealed hand size is `17 - 3 × exposedSetCount`; after discarding it is `16 - 3 × exposedSetCount`.

## Calls

- Chi: next player only, suited run, all valid run choices offered.
- Pong: any other player with two matching tiles.
- Exposed kong: any other player with three matching tiles and a replacement available.
- Concealed kong: four matching tiles during a draw-derived discard turn, replacement required.
- Added kong: a hand tile extends an exposed pong, with a win-only interruption before the replacement.
- Kongs may not be declared immediately after a chi/pong without a draw.
- Win from a discard outranks pong/kong, which outrank chi. Simultaneous winners use nearest player in turn order, not multiple payouts.
- Passing a win imposes no temporary restriction in this version.
- Concealed kongs cannot be robbed. Special hands and flower-win claims are not implemented.

## Completion and score

A regular winning hand consists of **five sets plus one pair**, with kongs occupying a set. Honors cannot form sequences; sequences cannot cross suits. Zero-tai wins are permitted.

| Bonus | Tai |
| --- | ---: |
| Self-draw | 1 |
| Concealed hand | 1 |
| Concealed self-draw | 3 total, replaces the preceding two |
| Each dragon triplet/kong | 1 |
| Seat wind triplet/kong | 1 |
| East prevailing wind triplet/kong | 1 |
| Each flower/season matching seat number | 1 |
| All triplets | 4 |
| Half flush: one suit plus honors | 4 |
| Full flush: one suit, no honors | 8 |

Concealed kongs do not break a concealed hand. Wind bonuses may stack when East is both seat and prevailing wind. Full flush and half flush are mutually exclusive. For ambiguous winning decompositions, the solver's first valid decomposition is scored; maximizing tai across all decompositions is a future enhancement.

Payment per payer: `10 + 5 × tai`. Discard win: discarder pays. Self-draw: each of three opponents pays. The four scores always sum to 4,000; negative scores are allowed because this is a practice table. No money is involved.

The dealer retains after winning or a drawn hand; otherwise dealership rotates once. Hand numbers increment. Dealer streak is recorded for future use but does not change payment. This is an ongoing East practice table, not a complete four-wind match.

## References and decisions

- [Taiwanese overview, Mahjong Wiki](https://mahjong.wikidot.com/rules:Taiwanese-overview) for general 16-tile structure.
- [Taiwanese scoring, Mahjong Wiki](https://mahjong.wikidot.com/rules:Taiwanese-scoring) for variant context.
- The explicit contract above takes precedence over any external house rules.
- Initial user choice: Taiwanese 16-tile rather than Hong Kong 13-tile. Keep potential southern Chinese variants separate rather than mixing rules into this preset.
