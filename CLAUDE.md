# Instrument Tuner

Offline-first instrument tuner. Real-time pitch detection from the
microphone, entirely client-side.

- Subdomain: `instrument-tuner.freeappstore.online`
- Dev: `pnpm install && pnpm dev`
- Build: `pnpm build`
- Deploy: `git push upstream main` — GitHub Actions builds and uploads
  `web/dist/` to the shared R2 bucket (`.github/workflows/deploy.yml`); a
  Cloudflare Worker on `*.freeappstore.online` serves it from there

Free, MIT-licensed, no tracking, no account. Mic audio never leaves the
browser. See https://freeappstore.online/skills.md for platform conventions.
