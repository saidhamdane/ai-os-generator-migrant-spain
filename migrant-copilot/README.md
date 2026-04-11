# MigrantCopilot — دليل المهاجر في إسبانيا

A bilingual (Arabic/Spanish) step-by-step guidance app for immigrants settling in Spain. Generates a personalised bureaucracy roadmap from a 5-minute onboarding quiz.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | PostgreSQL + Prisma |
| Auth | NextAuth.js (credentials) |
| Payments | Stripe (optional) |
| Email | Resend (optional) |
| Deploy | Vercel |

---

## Local Setup

### 1. Prerequisites

- Node.js 18+
- PostgreSQL running locally **or** a free [Supabase](https://supabase.com) project URL

### 2. Install dependencies

```bash
cd migrant-copilot
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/migrantcopilot"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run-openssl-rand-base64-32-to-generate"
```

Stripe and Resend keys are **optional** — the app runs in demo mode without them (payments are mocked, emails are skipped).

### 4. Set up the database

```bash
# Push schema to DB
npm run db:push

# Seed demo data (demo user + procedure guides)
npm run db:seed
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Account

After seeding, log in with:

| Field | Value |
|-------|-------|
| Email | `demo@migrantcopilot.es` |
| Password | `demo1234` |

The demo account has a complete Arabic roadmap pre-generated (Madrid, tourist visa, 7 steps).

---

## Key Pages

| Route | Description |
|-------|-------------|
| `/ar` or `/es` | Landing page (bilingual) |
| `/ar/signup` | Registration |
| `/ar/login` | Login |
| `/ar/onboarding` | 7-step intake quiz → generates roadmap |
| `/ar/dashboard` | Overview + next step |
| `/ar/roadmap` | Full step list with mark-done |
| `/ar/documents` | Document checklist with status |
| `/ar/procedures` | Procedure guides (public) |
| `/ar/procedures/[slug]` | Individual guide (AR/ES toggle) |
| `/ar/reminders` | Upcoming reminders (paid) |
| `/ar/profile` | Profile + subscription |

Replace `/ar/` with `/es/` for Spanish UI.

---

## Project Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:push      # Push Prisma schema to DB (no migration files)
npm run db:migrate   # Create + apply migration files (production)
npm run db:seed      # Seed demo user + all procedure guides
npm run db:studio    # Open Prisma Studio GUI
npm run db:reset     # Reset DB and re-seed
```

---

## Environment Variables

See `.env.example` for all variables. Required for basic operation:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_URL` | ✅ | App base URL |
| `NEXTAUTH_SECRET` | ✅ | Random 32-byte secret |
| `STRIPE_SECRET_KEY` | Optional | Enables real payments |
| `STRIPE_WEBHOOK_SECRET` | Optional | For Stripe webhooks |
| `STRIPE_PRICE_ID_MONTHLY` | Optional | Monthly plan price ID |
| `RESEND_API_KEY` | Optional | Enables weekly reminder emails |
| `CRON_SECRET` | Optional | Protects the cron endpoint |

---

## Free vs Paid

| Feature | Free | Pro (9.99€/mo) |
|---------|------|----------------|
| Onboarding quiz | ✅ | ✅ |
| First 2 roadmap steps | ✅ | ✅ |
| All roadmap steps | — | ✅ |
| Document checklist (3 items) | ✅ | ✅ |
| Full document checklist | — | ✅ |
| Procedure guides | ✅ | ✅ |
| Reminders | — | ✅ |
| Weekly email digest | — | ✅ |

---

## Deploy to Vercel

```bash
# From the repo root
vercel --cwd migrant-copilot
```

Set all required env vars in the Vercel dashboard. The `vercel.json` configures a weekly cron for reminder emails.

---

## Legal Disclaimer

This app provides general informational guidance only and is not legal advice. Always verify information on the relevant official Spanish government websites.
