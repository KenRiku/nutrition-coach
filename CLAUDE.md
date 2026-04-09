# Eathletes — Claude Code Guide

## Project Overview
Eathletes is an AI-powered sports nutrition coaching app built with Next.js 16, TypeScript, PostgreSQL (Neon), Prisma, NextAuth v4, and the Anthropic Claude API.

## Tech Stack
- **Framework**: Next.js 16 (App Router), TypeScript
- **Database**: PostgreSQL via Neon, accessed with Prisma ORM + `@prisma/adapter-neon`
- **Auth**: NextAuth v4 with JWT sessions and bcrypt password hashing
- **AI**: Anthropic Claude (`claude-3-5-haiku-20241022`) for nutrition plan generation
- **Styling**: Tailwind CSS v4 + CSS custom properties (inline styles for component specifics)
- **Fonts**: Barlow Condensed (display) + DM Sans (body) via Google Fonts

## Key Architecture Decisions

### Database
- Uses Neon serverless PostgreSQL with the `PrismaNeon` adapter
- `lib/prisma.ts` creates a single PrismaClient instance with the Neon adapter
- `prisma.config.ts` sets the `DATABASE_URL` via the `datasource.url` config (not in schema.prisma)
- Schema at `prisma/schema.prisma`

### Authentication
- NextAuth v4 with CredentialsProvider
- JWT session strategy
- `authOptions` in `lib/auth.ts`
- Session callback adds `user.id` from token
- After signup, client calls `signIn()` automatically

### AI Nutrition Generation
- `POST /api/plans/generate` calls Anthropic with a detailed prompt
- Prompt includes: athlete profile, today's workouts, weekly training context
- Response parsed as JSON and saved to `NutritionPlan` + `Meal` records
- Previous same-day plan is deleted before creating a new one

## Development Commands
```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db push   # Push schema to database (first time setup)
npx prisma studio    # Visual database browser
```

## Environment Variables
See `.env.example`. Required:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `AUTH_SECRET` — NextAuth secret (generate: `openssl rand -base64 32`)
- `NEXTAUTH_URL` — App URL (http://localhost:3000 for dev)
- `ANTHROPIC_API_KEY` — Anthropic API key

## File Structure Notes
- Pages use inline styles for brand-specific styling (dark theme, orange/green palette)
- API routes use `getServerSession(authOptions)` for auth checks
- Client components use `useSession()` from `next-auth/react`
- `components/providers.tsx` wraps the app with `<SessionProvider>`

## Database Setup
1. Create a Neon project at neon.tech
2. Copy the connection string to `.env` as `DATABASE_URL`
3. Run `npx prisma db push` to create tables
4. Run `npm run dev` to start the app
