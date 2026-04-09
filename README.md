# Eathletes

AI-powered sports nutrition coaching. Personalized daily nutrition plans that adapt to your training load.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **PostgreSQL** via [Neon](https://neon.tech) + Prisma ORM
- **NextAuth v4** — JWT-based authentication
- **Anthropic Claude** (`claude-3-5-haiku-20241022`) — AI plan generation
- **Tailwind CSS v4** — dark theme with electric orange + cool green palette

## Setup

### 1. Clone and install
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

Fill in:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `AUTH_SECRET` — run `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3000`
- `ANTHROPIC_API_KEY` — your Anthropic API key

### 3. Set up the database
```bash
npx prisma db push
```

### 4. Run dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Landing page** — value prop with live demo UI
- **Sign up / Log in** — email + password auth
- **3-step onboarding** — body metrics, sport & goals, dietary preferences
- **Dashboard** — today's AI nutrition plan with macro targets, meal plan, AI reasoning, and energy feedback
- **Training schedule** — weekly calendar view, add/delete workouts
- **Profile** — edit athlete profile, all fields

## User Flow

1. Create account at `/signup`
2. Complete 3-step onboarding (body metrics, sport, dietary prefs)
3. Add workouts on the `/schedule` page
4. Hit "Generate Plan" on `/dashboard` for an AI-personalized nutrition plan
5. Rate energy at end of day to help the AI improve

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/signup` | Create account |
| POST | `/api/auth/[...nextauth]` | NextAuth handler |
| POST | `/api/onboarding` | Save athlete profile |
| GET | `/api/profile` | Get current profile |
| PUT | `/api/profile` | Update profile |
| GET | `/api/workouts` | List workouts (week filter) |
| POST | `/api/workouts` | Create workout |
| DELETE | `/api/workouts/[id]` | Delete workout |
| GET | `/api/plans/today` | Get today's nutrition plan |
| POST | `/api/plans/generate` | Generate AI nutrition plan |
| POST | `/api/plans/[id]/feedback` | Submit energy rating |

## Design

Dark performance dashboard aesthetic. Barlow Condensed for display text, DM Sans for body. Electric orange (`#FF5722`) accents, cool green (`#4CAF50`) for macros/success states.
