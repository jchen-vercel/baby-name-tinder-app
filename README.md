# Baby Name Tinder App

A Next.js app where two parents swipe baby names separately and discover the
names they both like.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` (if present) and fill in Neon and Clerk values.
3. **AI chat (Vercel AI Gateway):** Enable AI Gateway for your Vercel project, then either:
   - run `vercel env pull .env.local` so `VERCEL_OIDC_TOKEN` is available locally, or
   - set `AI_GATEWAY_API_KEY` in `.env.local` for a static gateway key (e.g. CI).
   Without one of these, the name assistant API route will fail when calling the model.
4. Push the database schema and seed names:
   ```bash
   npm run db:push
   npm run db:seed
   ```
5. Start the app:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` starts the local Next.js server.
- `npm run db:push` applies the Drizzle schema to Neon.
- `npm run db:seed` imports `data/baby-names.csv`.
- `npm test` runs unit tests.
