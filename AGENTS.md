<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- **Stack**: Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + TypeScript 5
- **Dev server**: `npm run dev` (runs on port 3000 by default)
- **Lint**: `npm run lint` (ESLint with next/core-web-vitals and next/typescript configs)
- **Build**: `npm run build`
- **No test framework** is configured yet. Add one (e.g. Vitest or Jest) if needed.
- **Path aliases**: `@/*` maps to `./src/*`
- Tailwind v4 uses `@import "tailwindcss"` in CSS (not `@tailwind` directives). Theme tokens are defined with `@theme inline {}` blocks.
- The project uses Geist font loaded via `next/font/google`.
