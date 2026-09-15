# Prototype verification

Verified in the development environment on September 15, 2026:

- Strict TypeScript compilation: passed.
- Eighteen rules-engine tests: passed, including twenty complete seeded games with all 144 physical tiles accounted for and total scores conserved after every action.
- Production Expo web export: passed.
- Expo iOS JavaScript/Hermes export: passed. This is not an Xcode build or a physical-device test.
- Chromium desktop viewport at 1440 × 1000: lobby, play, hints, legal discard, claim/pass handling, public history, preferences, pause, home/resume, and persistence across reload exercised.
- Chromium mobile viewport at 390 × 844: lobby, new-table confirmation, two-row hand, hint selection, and discard exercised. No horizontal document overflow or page runtime errors observed in the mobile smoke check.
- Visual inspection found missing traditional glyphs in an initial font candidate. Replaced it with a bundled Noto Serif TC subset and verified all used Chinese characters exist in its character map.

Remaining release checks: actual iPhone touch and haptics, audio behavior with silent mode/headphones/interruptions, VoiceOver, Safari, device rotation, and native background/restore. Use one active browser tab for a saved session; cross-tab session arbitration is not implemented.

The rules and scoring deliberately remain the limited practice contract in `rules.md`.
