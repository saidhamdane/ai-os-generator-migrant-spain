# System Architecture — MigrantCopilot Spain

## Architecture Summary

A single Next.js application with App Router, deployed on Vercel. PostgreSQL database via Prisma. Authentication via Supabase Auth. Payments via Stripe. Email via Resend. No microservices. No external AI in v1 — roadmap generation is a pure deterministic function.

---

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 14 (App Router) | React Server Components where possible |
| Styling | Tailwind CSS + shadcn/ui | RTL-compatible via `dir` attribute |
| Backend | Next.js Route Handlers | Under `/app/api/` |
| Database | PostgreSQL | Hosted on Supabase or Railway |
| ORM | Prisma | Type-safe queries, migrations |
| Auth | Supabase Auth | Email+password only in v1 |
| Payments | Stripe | Checkout + Customer Portal + Webhooks |
| Email | Resend | Transactional + weekly reminders |
| i18n | next-intl | Locales: `ar` (RTL), `es` (LTR) |
| Deployment | Vercel | Preview + Production environments |

---

## Project File Structure

```
/
├── app/
│   ├── [locale]/                    # next-intl locale routing
│   │   ├── layout.tsx               # locale-aware layout (dir="rtl" for ar)
│   │   ├── page.tsx                 # Landing page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx           # Authenticated layout + nav
│   │   │   ├── onboarding/
│   │   │   │   └── page.tsx         # Multi-step intake form
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx         # Home dashboard
│   │   │   ├── roadmap/
│   │   │   │   └── page.tsx         # Full roadmap view
│   │   │   ├── documents/
│   │   │   │   └── page.tsx         # Document checklist
│   │   │   ├── procedures/
│   │   │   │   ├── page.tsx         # Procedure list
│   │   │   │   └── [slug]/page.tsx  # Single procedure guide
│   │   │   ├── reminders/
│   │   │   │   └── page.tsx         # Reminders + timeline
│   │   │   └── profile/
│   │   │       └── page.tsx         # Profile + billing
│   └── api/
│       ├── auth/                    # Supabase auth callbacks
│       ├── onboarding/
│       │   └── route.ts             # POST /api/onboarding
│       ├── roadmap/
│       │   ├── route.ts             # GET /api/roadmap
│       │   └── steps/
│       │       └── [id]/route.ts    # PATCH /api/roadmap/steps/:id
│       ├── checklist/
│       │   ├── route.ts             # GET /api/checklist
│       │   └── items/
│       │       └── [id]/route.ts    # PATCH /api/checklist/items/:id
│       ├── procedures/
│       │   └── route.ts             # GET /api/procedures
│       ├── stripe/
│       │   ├── checkout/route.ts    # POST — create checkout session
│       │   ├── portal/route.ts      # POST — create portal session
│       │   └── webhook/route.ts     # POST — handle Stripe events
│       └── reminders/
│           └── route.ts             # GET /api/reminders
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── onboarding/
│   │   └── IntakeForm.tsx
│   ├── roadmap/
│   │   ├── RoadmapCard.tsx
│   │   └── StepItem.tsx
│   ├── checklist/
│   │   ├── ChecklistGroup.tsx
│   │   └── ChecklistItem.tsx
│   ├── procedures/
│   │   └── ProcedureCard.tsx
│   ├── dashboard/
│   │   ├── NextStepCard.tsx
│   │   └── ProgressBar.tsx
│   └── shared/
│       ├── UpgradeCTA.tsx
│       └── LanguageToggle.tsx
├── lib/
│   ├── prisma.ts                    # Prisma client singleton
│   ├── supabase.ts                  # Supabase client
│   ├── stripe.ts                    # Stripe client
│   ├── resend.ts                    # Resend client
│   ├── roadmap-engine.ts            # generateRoadmap() pure function
│   ├── checklist-engine.ts          # generateChecklist() pure function
│   └── subscription.ts             # isPaidUser() helper
├── messages/
│   ├── ar.json                      # Arabic translations
│   └── es.json                      # Spanish translations
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                      # Procedure guides fixture seed
└── emails/
    ├── WelcomeEmail.tsx
    ├── RoadmapReadyEmail.tsx
    └── WeeklyReminderEmail.tsx
```

---

## Core Modules

### Module 1 — Auth
- Provider: Supabase Auth (email + password)
- On signup: create `User` record in Prisma DB via Supabase webhook or post-signup API call
- Session: managed by Supabase; validated server-side via `@supabase/ssr`
- Route protection: middleware checks session; redirects unauthenticated users to `/login`
- Locale: user's `preferredLanguage` stored in DB, read on every authenticated request

### Module 2 — Onboarding Intake
- Route: `GET/POST /api/onboarding`
- Multi-step form with 7 questions. Client-side step state only.
- On final submit: POST full `IntakeAnswers` object to API
- API creates/updates `UserProfile`, then calls `generateRoadmap()` and `generateChecklist()`
- Results saved to DB. Response redirects user to `/dashboard`
- Idempotent: if `UserProfile` already exists, update and regenerate

### Module 3 — Roadmap Engine
- File: `lib/roadmap-engine.ts`
- Input: `UserProfile`
- Output: `RoadmapStep[]` — ordered list of procedure steps
- Logic: pure conditional rules (no LLM), deterministic

Example rule tree:
```typescript
// lib/roadmap-engine.ts (pseudocode)
export function generateRoadmap(profile: UserProfile): RoadmapStepInput[] {
  const steps: RoadmapStepInput[] = []
  if (!profile.hasEmpadronamiento) steps.push(STEP_EMPADRONAMIENTO)
  if (!profile.hasNIE && profile.hasEmpadronamiento) steps.push(STEP_NIE)
  if (profile.hasNIE && !profile.hasTIE && profile.isNonEU) steps.push(STEP_TIE)
  if (profile.hasNIE) steps.push(STEP_SOCIAL_SECURITY)
  if (profile.isWorking) steps.push(STEP_WORK_CONTRACT_REGISTRATION)
  return steps.map((s, i) => ({ ...s, stepOrder: i + 1, status: 'pending' }))
}
```

Step definitions live as constants in `lib/roadmap-steps.ts`. Each step references a procedure guide `slug`.

### Module 4 — Checklist Engine
- File: `lib/checklist-engine.ts`
- Input: `RoadmapStep[]` (from engine output)
- Output: `ChecklistItem[]` per step's required documents
- Logic: each step has a hard-coded `requiredDocuments[]` list
- Creates a single `DocumentChecklist` with all items grouped by step

### Module 5 — Procedure Explainer
- Content stored in `ProcedureGuide` table (seeded at deploy)
- Route: `GET /api/procedures` (list), `GET /api/procedures/[slug]` (single)
- Rendered as static-style pages with language toggle (Arabic/Spanish)
- RTL handled at layout level based on current locale

### Module 6 — Subscription + Access Control
- File: `lib/subscription.ts`
- Key function: `isPaidUser(userId: string): Promise<boolean>`
- Checks `Subscription` table for active status
- Called server-side in API routes and RSC page components
- Stripe webhook at `/api/stripe/webhook` handles: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### Module 7 — Email (Resend)
- Triggered events:
  1. Signup → `WelcomeEmail`
  2. Roadmap generated → `RoadmapReadyEmail`
  3. Weekly cron (Vercel Cron) → `WeeklyReminderEmail` for users with open steps
- Templates: React Email components in `/emails/`
- Cron route: `app/api/cron/weekly-reminders/route.ts` (protected by `CRON_SECRET`)

---

## API Routes Summary

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/onboarding | Required | Submit intake answers |
| GET | /api/roadmap | Required | Get user's roadmap + steps |
| PATCH | /api/roadmap/steps/:id | Required | Update step status |
| GET | /api/checklist | Required | Get user's document checklist |
| PATCH | /api/checklist/items/:id | Required | Update document item status |
| GET | /api/procedures | Public | List all procedure guides |
| GET | /api/procedures/:slug | Public | Get single procedure guide |
| GET | /api/reminders | Required | Get user's reminders |
| POST | /api/stripe/checkout | Required | Create Stripe checkout session |
| POST | /api/stripe/portal | Required | Create Stripe customer portal session |
| POST | /api/stripe/webhook | Stripe signature | Handle Stripe billing events |
| POST | /api/cron/weekly-reminders | CRON_SECRET | Send weekly reminder emails |

---

## Data Flow

### Onboarding Flow
```
User submits intake form
  → POST /api/onboarding
  → Save UserProfile
  → generateRoadmap(profile) → Save RoadmapSteps
  → generateChecklist(steps) → Save ChecklistItems
  → Send RoadmapReadyEmail via Resend
  → Return 201 → Client redirects to /dashboard
```

### Step Completion Flow
```
User clicks "Mark as done"
  → PATCH /api/roadmap/steps/:id { status: 'done' }
  → Update RoadmapStep in DB
  → Return updated step
  → Client re-fetches roadmap or optimistic update
  → Next step becomes active (client-side highlight)
```

### Subscription Flow
```
User clicks "Upgrade"
  → POST /api/stripe/checkout
  → Create Stripe Checkout Session
  → Redirect to Stripe-hosted checkout page
  → User pays
  → Stripe fires checkout.session.completed webhook
  → /api/stripe/webhook creates/updates Subscription in DB
  → User redirected to /dashboard with full access
```

---

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ID_MONTHLY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@migrantcopilot.es

# App
NEXT_PUBLIC_APP_URL=https://migrantcopilot.es
CRON_SECRET=

# Next-intl
NEXT_PUBLIC_DEFAULT_LOCALE=ar
```

---

## Deployment Notes

- Single Vercel project with Preview + Production environments
- Database: start with Supabase Postgres (free tier) or Railway ($5/month)
- Vercel Cron Jobs for weekly reminder emails (configured in `vercel.json`)
- All secrets in Vercel environment variables (never committed)
- Prisma migrations run via `vercel build` hook or manual `prisma migrate deploy`

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/weekly-reminders",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

---

## MVP Simplicity Rules

- No admin panel in v1 — manage data directly via Prisma Studio or Supabase dashboard
- No background job queue — cron is sufficient for v1 reminder volume
- No full-text search — procedure library is small enough for client-side filtering
- No CDN image management — no images in v1 (text-only content)
- No multi-tenancy — single-user model only
