# RadaSlips

RadaSlips turns a bookmaker booking code into a short, trackable share link that tipsters can post in WhatsApp, Telegram, or Facebook groups.

Every link opens a compliance gateway first. It shows the over-18 notice, a responsible-gambling message, and the bookmaker's licence details. After that it opens the exact bet slip on the bookmaker's site or app. Each link also carries the bookmaker's affiliate ID and the slip's own ID as a sub-ID, so bookmaker conversions can be credited back to the tipster who shared it.

## How it works

1. A tipster signs up, picks a bookmaker, and pastes a booking code.
2. The API builds the bookmaker URL from that code and adds the affiliate and sub-ID tracking. It then issues a share link such as `https://<app>/r/kamau-1a2b`.
3. Someone taps the link. The web app records the click and shows the compliance gateway.
4. They choose to continue, and are redirected to the bet slip on the bookmaker's site.
5. The tipster's dashboard shows clicks per slip.

## Repository layout

| Path | What it is |
| --- | --- |
| [`radaslips-api/`](radaslips-api) | NestJS API: auth, slips, click analytics. Prisma + PostgreSQL, Redis cache for link resolution |
| [`radaslips-web/`](radaslips-web) | Next.js app: tipster dashboard, sign-up/login, and the `/r/[code]` link gateway |
| [`docker-compose.yml`](docker-compose.yml) | Postgres, Redis, API and web for local development |

## Running locally

### With Docker (recommended)

```bash
docker compose up --build
```

This starts Postgres, Redis, the API, and the web app. The API container applies migrations and seeds the bookmakers on startup.

- Web: http://localhost:3001
- API: http://localhost:5000 (health check at `/health`)

### Without Docker

You need Node.js 22, PostgreSQL 16, and Redis 7.

```bash
# API
cd radaslips-api
cp .env.example .env        # set DATABASE_URL, REDIS_URL, JWT_SECRET
npm install
npx prisma migrate deploy
npm run db:seed
npm run start:dev           # http://localhost:5000

# Web (in a second terminal)
cd radaslips-web
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev                 # http://localhost:3001
```

## API overview

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register`, `/auth/login` | Tipster sign-up and login (phone number + password, JWT) |
| `GET` | `/auth/me` | Current tipster |
| `GET` | `/slips/bookmakers` | Bookmakers that support booking-code links |
| `POST` | `/slips` | Create a slip link from a booking code |
| `GET` | `/slips`, `/slips/:id` | The tipster's slips |
| `GET` | `/slips/resolve/:slug` | Public: resolve a share link for the gateway |
| `POST` | `/analytics/clicks/:slug` | Public: record a click |
| `GET` | `/analytics/overview`, `/analytics/slips/:slipId` | Tipster click stats |

## Bookmaker affiliate setup

Each bookmaker row has three optional tracking fields, set from the bookmaker's affiliate programme:

| Field | Example | Meaning |
| --- | --- | --- |
| `affiliateParam` | `btag` | Query parameter that carries our affiliate ID |
| `affiliateId` | `rada-123` | Our affiliate ID with that bookmaker |
| `subIdParam` | `subid` | Query parameter that receives the slip slug |

Once they're set, new slip links carry `?btag=rada-123&subid=<slug>`. Our affiliate ID replaces any tag already in the URL. Custom target URLs sent to the API must be `https` links on the bookmaker's own domain. Links are built when a slip is created, so older slips keep the tracking they had at the time.

## Tests

```bash
cd radaslips-api
npm test
```

## Status

This is an early MVP covering sports bet slips only. Commission tracking exists in the data model but isn't exposed yet. M-Pesa payouts and the tipster leaderboard are parked on the `feature/mpesa-payouts` branch.
