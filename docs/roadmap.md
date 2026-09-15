# Product direction

## Already playable

One human versus three local computer opponents, clean native/web UI, the core Taiwanese turn loop, practice scoring, sounds and haptics, hints, and on-device persistence.

## Next: confirm the table rules

1. Select the specific family/house tai table and flower rules.
2. Implement optimal scoring across all valid decompositions.
3. Add dealer/streak payments, wind progression, special wins, and passed-win restrictions for that ruleset.
4. Maintain a fixture for every scoring pattern and arbitration edge case.

## Next: deepen the feel

1. Physical-iPhone playtest: touch target size, two-row hand layout, audio interruptions, background/resume, and safe areas.
2. Animate dealing and discards with consistent motion and a reduced-motion alternative.
3. Create a recognizable one-bamboo bird tile and richer vector bamboo artwork.
4. Add interactive first-hand teaching, explanations for hint choices, and hand history replay.
5. Finish app icons and launch screens, then TestFlight.

## Next: more interesting opponents

The current bot minimizes standard-hand shanten, then uses a simple connected-shape and visible-availability tie-breaker. It calls wins immediately and generally claims sets only when they improve shanten. It is not an expert player.

Add exact improving-tile counts, discard safety, scoring-aware planning, and opponent personalities. Keep strategy input limited to the bot's own concealed hand plus public observations. Add seeded tournaments to compare policies without hidden-information access.

## Later

- Separate Cantonese/Hong Kong 13-tile preset.
- Daily seeded hands and locally tracked progress.
- Optional cloud sync and accounts only when needed.
- Multiplayer after engine/rule contracts stabilize; authoritative server validation and private per-seat state are prerequisites.
- Web hosting with SPA route fallback and long-lived immutable asset caching.
