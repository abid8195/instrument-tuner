# Instrument Tuner

A free, offline-first instrument tuner. Real-time pitch detection straight
from your microphone — guitar, violin, cello, ukulele, bass, or chromatic —
with zero installs, zero accounts, and zero data leaving your browser.

## Features

- Real-time pitch detection via the Web Audio API (autocorrelation)
- Visual gauge showing how sharp or flat the played note is, in cents
- Preset tunings for guitar, violin, cello, ukulele, and bass
- Chromatic mode for any note
- Reference tone playback per string
- Fully offline after first load (PWA, installable)
- All processing happens on-device — audio never leaves the browser

## Development

```bash
pnpm install
pnpm dev
```

```bash
pnpm typecheck   # tsc -b, strict mode
pnpm build       # production build
pnpm preview     # serve the production build locally
```

## License

MIT
