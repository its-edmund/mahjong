# Jade Table

A quiet, modern Taiwanese mahjong game for iOS and web. Built with Expo, React Native, Expo Router, and a platform-independent TypeScript rules engine.

**Status:** playable single-player prototype. Four seats, one human, three local heuristic computer opponents. No backend, account, subscription, API keys, or real-money play.

## Start playing

Requires Node.js **22.13+** and npm. Dependencies are locked in `package-lock.json`.

```sh
npm ci
npm run web
```

For iPhone, install the matching Expo Go release, then run:

```sh
npm start
```

Scan the Expo QR code on the same local network. Try Expo Go before creating a native build. `npm run ios` opens a simulator on a Mac with Xcode installed. This repository was developed on Linux; an actual iOS device build and haptic/audio verification are still required.

## Repository

Source: [its-edmund/mahjong](https://github.com/its-edmund/mahjong).

```sh
git clone https://github.com/its-edmund/mahjong.git
cd mahjong
npm ci
npm start
```

Scan the QR code with your iPhone Camera to open Expo Go. Keep your phone and computer on the same Wi-Fi and leave the development server running. If LAN connectivity is unavailable, stop it and run `npx expo start --tunnel`.

The earlier web implementation is preserved on `backup/pre-jade-table-2026-09-15`. Jade Table replaces the default branch's file contents while preserving commit history.

## What works

- Responsive lobby and table, with custom ivory tiles, jade felt, embedded fonts, and an original synthesized tile sound.
- Two-row hands on narrow phones, single-row hands on wider screens; selected tiles lift before a deliberate discard.
- Seeded 144-tile shuffle, 16-tile deal, three suits, honors, flowers, and seasons.
- Automatic normal draws and flower replacements; 16-tile wall reserve.
- Chi, pong, exposed kong, concealed kong, added kong, and robbing an added kong.
- Claim arbitration: win first, then pong/kong, then chi. Equal win claims go to the nearest player in turn order.
- Five-set-plus-pair win detection, including exposed sets and kongs.
- Exact standard-hand shanten for 16-tile mahjong and deterministic local strategy. Computer discard choices use only their own hand and visible tiles. This is a heuristic opponent, not a trained neural model or LLM.
- A little hint, legal-action buttons, complete public discards and melds, scores, result summaries, and next hands.
- Soft sounds, optional iOS haptics, reduced-motion tile selection, tile labels, and adjustable opponent pacing.
- Local autosave of hands and settings; timers pause on leaving the table or backgrounding the native app. No cross-device sync.

## Rules and scope

The first version is **Taiwanese 16-tile**. Hong Kong/Cantonese 13-tile play is not implemented.

This is an explicitly defined practice table, not a claim to implement every Taiwanese household's rules. See [docs/rules.md](docs/rules.md). The in-app guide shows the same supported scoring bonuses and limitations.

The current score is **10 base points + 5 per tai**. Self-draw is paid by all three opponents; a discard win is paid by its discarder. Zero-tai wins are allowed. The dealer retains after a win or a draw and otherwise rotates. East stays the prevailing wind.

Not yet implemented: full Taiwanese tai catalogue, special flower wins, dealer/streak payment bonuses, passed-win restrictions, four-wind match progression, alternative rule presets, advanced AI difficulty tiers, multiplayer, cloud saves, TestFlight distribution, or hosted production web deployment.

## Checks

```sh
npm run check       # strict TypeScript + rules-engine regression tests
npm run build:web   # production web export to dist/
```

Tests cover hand validity, legal actions, claim priority, flower chains, kong variants, scoring conservation, and twenty seeded games with tile and hand-size invariants on every move. The repository includes a GitHub Actions workflow for type checks, tests, and the web export.

## Project map

```text
app/                    Expo routes: lobby, table, guide, preferences
src/game/tiles.ts       Tile identities, names, deterministic shuffle
src/game/hand.ts        Winning decomposition, shanten, discard strategy
src/game/engine.ts      Pure state transitions, claims, practice scoring
src/game/provider.tsx   Session, autosave, timers, audio, haptics
src/ui/                Shared design tokens and custom tile faces
tests/                 Engine regressions and complete-game simulations
docs/                  Rules contract and development roadmap
```

The engine has no React or Expo dependency. It accepts a state and an action and returns a new state; invalid actions throw without mutating the original. Keep rules changes here, not inside UI components. The bot discard interface receives a hand, exposed-set count, and public tiles, not the full game state.

## iOS release preparation

`eas.json` includes development, simulator preview, and production profiles. Before an EAS build, choose your own `ios.bundleIdentifier`, configure the project with `eas init`, and supply an Apple Developer account. Add `expo-dev-client` only if using the development profile. App icons, signing, App Store metadata, and a physical-device QA pass remain release tasks.

## Design direction

Inspired by the restraint and clarity of [Offsuit](https://offsuit.app/poker), with an original name, layout, tile artwork, and sound. No Offsuit assets or code are included. The goal is a table you want to spend time at: legible tiles, intentional actions, helpful context, and space to think.

Fonts are distributed by `@expo-google-fonts` under their bundled font licenses. Other dependencies retain their own licenses.
