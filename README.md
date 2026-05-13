# Baby Name Tinder App

A Next.js app where two parents swipe baby names separately and discover the
names they both like.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in Neon and Clerk values.
3. Push the database schema and seed names:
   ```bash
   npm run db:push
   npm run db:seed
   ```
4. Start the app:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` starts the local Next.js server.
- `npm run db:push` applies the Drizzle schema to Neon.
- `npm run db:seed` imports `data/baby-names.csv`.
- `npm test` runs unit tests.
