# Asset provenance

- `tile-clack.wav`: original synthesized audio, created for this project. A short decaying mix of two sine waves and seeded noise, no sampled commercial recording.
- `jade-hanzi.ttf`: a renamed, subset version of **Noto Serif TC Regular**, supplied by `@expo-google-fonts/noto-serif-tc`. Only the Chinese characters used in the application are retained. See `OFL-hanzi.txt` for the SIL Open Font License. The family is renamed **Jade Hanzi** in the subset.
- DM Sans and Cormorant Garamond are bundled through their `@expo-google-fonts` packages and retain their included licenses. Import only the used weights to avoid exporting the entire font family.

Chinese glyphs are explicitly rendered with the embedded subset rather than relying on operating-system fonts. If adding new Chinese text, extend the subset or bundle a complete compatible font.
