# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Dev server with Turbopack (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint
npm run type-check # TypeScript check without building
```

## What this project is

A minimal static hub page hosted at `hub.zephyron.tech` (Vercel). No backend, no database, no auth — pure Next.js static export.

Three service tiles link to:
- `wiki.zephyron.tech` — Wiki
- `cloud.zephyron.tech` — Nextcloud
- `auth.zephyron.tech` — Authentik

## Design system

Mirrors `../zephyron-website/` exactly — same CSS custom properties, same font stack:
- **Display font:** Surgena (local TTF at `public/fonts/`)
- **Body font:** Poppins (Google Fonts via `next/font`)
- **Color palette:** navy-950 background, violet-400/500 accent — all tokens defined in `globals.css`
- **Atmosphere:** fixed `body::before` radial gradients (violet glow top-right, blue glow top-left)

When adding tiles or modifying visuals, keep the token names consistent with the main website (`--fg`, `--fg-muted`, `--surface`, `--border`, `--violet-*`, `--navy-*`).

## Path aliases

`@/*` → `./src/*`
