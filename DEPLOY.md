# Deploy

Everyday production deploys: **push or merge to `main`**. Vercel Git integration builds the app; no GitHub Actions `vercel deploy` workflow (that would double-build).

**Production URL:** https://temankopi.vercel.app

## Architecture

| Surface | Host | Notes |
|---------|------|-------|
| Teman Kopi PWA (Vite SPA) | Vercel | Single app at repo root; offline-capable static + service worker |

## Auto-deploy on `main`

1. Ensure the [Vercel GitHub App](https://github.com/apps/vercel) can access `ddewantaraq/temankopi` (Install / Configure → repository access).
2. In the Vercel project **Settings → Git**, connect `ddewantaraq/temankopi` (or `npx vercel git connect`).
3. Set **Production Branch** to `main`.
4. Push or merge to `main` → Vercel builds and promotes production.

Path-ignore / Ignored Build Step scripts are for monorepos. This repo is a single app, so they are **not** used.

Do **not** add GitHub Actions that call `vercel deploy` while Git integration is connected.

### Bootstrap status

| Item | Status |
|------|--------|
| GitHub remote | `git@github.com:ddewantaraq/temankopi.git` |
| Vercel project settings | Vite, `npm install`, `npm run build`, output `dist`, Node **22.x** |
| Production domain | https://temankopi.vercel.app |
| Git ↔ Vercel link | Requires granting the Vercel GitHub App access to this repo (same pattern as botlevy-commerce), then connect in dashboard / `vercel git connect` |

## Vercel project settings

Project: `temankopi` (`prj_k9hBfttVnztDjRhWAQvbvmOUJcH0`)

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework | Vite |
| Install | `npm install` |
| Build | `npm run build` |
| Output | `dist` |
| Node | 22.x |
| Rewrites | [`vercel.json`](./vercel.json) SPA fallback to `/index.html` |

## Manual fallback

If Git deploy is unavailable:

```bash
npm run build
npx vercel --prod --yes
```

Local CLI link metadata lives under `.vercel/` (gitignored). Do not commit tokens or secrets.

## Smoke after deploy

1. Open https://temankopi.vercel.app
2. Toggle **ID | EN** on the home topbar
3. Airplane mode → Periksa Tanaman → analyze offline
4. Riwayat + Tentang Model still load offline after first visit
