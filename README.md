# Shiori

Telegram Mini App for browsing and managing an anime catalog (Persian UI, RTL). Outside Telegram, the **Profile** page supports email login/register (web session) for browsing with a linked account.

## Features

- Catalog: home (featured, recent, seasonal, popular), explore, anime detail, studios, translators
- Weekly schedule (AniList-backed, mapped to local catalog) with translation-request CTA
- User list (favorites + watch progress); custom lists / history / downloads are device-local
- Notifications inbox + Telegram DM preferences (Telegram mini-app)
- Support tickets (Telegram mini-app)
- Link web account → Telegram via `start_param` / `linkToken` (`useTelegramLinkComplete`)
- Theme: auto (follow Telegram / system) or manual light/dark

## Tech stack

| Layer | Stack |
|-------|--------|
| UI | React 18, TypeScript, Vite, Tailwind CSS |
| Platform | `@twa-dev/sdk` (Telegram Web App, Bot API 8+) |
| State | TanStack Query + Zustand |
| Backend | **shiori-api** (NestJS + Postgres) |
| Schedule | AniList GraphQL (`src/utils/api.ts`) |

Admin panel: **`dash.shiori.cloud`** (separate repo).

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_SHIORI_API_URL
npm run dev
```

Also run **shiori-api** locally (`http://localhost:4001`) and point `VITE_SHIORI_API_URL` at it.

```bash
npm run build        # production (API-only when VITE_SHIORI_API_URL is in .env)
npm run build:api    # same — explicit production mode
npm run preview
```

## Environment

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_SHIORI_API_URL` | **Yes** | REST API base (no trailing slash) |
| `VITE_TELEGRAM_BOT_USERNAME` | No | Bot username for deep-links / link-telegram |
| `VITE_DARAMET_DONATE_URL` | No | External donate URL (monetization relaunch) |

Monetization UI (subscription / token wallet / softsub·hardsub tabs) is gated by flags in `src/config/monetizationFlags.ts` (off for launch).

## Architecture

```
src/services/
├── shioriCatalog.ts      # catalog via API
├── shioriUserList.ts     # favorites / progress via API
└── shioriAppAuth.ts      # email session + Telegram link
```

## Deploy

Self-hosted only — Docker image on GHCR (`docker-publish.yml`) or static `dist/` behind nginx. See [`docs/DEPLOY.md`](docs/DEPLOY.md).

```bash
docker pull ghcr.io/<owner>/shiori:latest
docker run -d -p 8080:80 ghcr.io/<owner>/shiori:latest
```

## Related

- `api.shiori.cloud` — backend + cron
- `dash.shiori.cloud` — staff panel
- SQL migrations in `api.shiori.cloud/scripts/sql/`

## License

MIT
