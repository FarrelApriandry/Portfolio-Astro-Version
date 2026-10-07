# RelApri Portfolio — Astro Version

Personal portfolio for Farrel Apriandry. Astro SSR + React islands + Tailwind v4,
Neon Postgres for content, Vercel Analytics/Speed Insights.

## Setup

```sh
cp .env.example .env.local
# fill DATABASE_URL (Neon pooled connection string)

# generate admin credentials (password min 12 chars), then paste both lines into .env.local
node scripts/gen-admin-hash.mjs "<your-admin-password>"
```

Required env vars (`Vercel → Project Settings → Environment Variables` for production):

| Key | Purpose |
| --- | ------- |
| `DATABASE_URL` | Neon Postgres pooled connection string |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD_HASH` | scrypt hash from `scripts/gen-admin-hash.mjs` |
| `ADMIN_SESSION_SECRET` | long random secret for signing admin session cookies |

## Commands

```sh
bun install
bun dev        # local dev server
bun build      # production build → ./dist/
bun preview    # preview the build locally
```

## Security notes

- Admin credentials live only in env vars — never in source or git history.
- Admin sessions are HMAC-signed cookies (7-day TTL, httpOnly, secure in prod).
- Login is rate-limited (10 failed attempts / 10 min per IP, per instance).
- If Neon is unreachable, public pages render a cached snapshot with a
  "cached content" banner instead of 500-ing; admin edits are disabled.
- After deploying: if the old hardcoded password ever shipped anywhere,
  rotate it immediately (run the hash script again and update env vars).
