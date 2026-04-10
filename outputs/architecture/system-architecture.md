# System Architecture — MigrantCopilot Spain

## Architecture Summary
A web-first SaaS built with Next.js for frontend and API routes, PostgreSQL + Prisma for structured data, and a simple rules/AI layer for roadmap generation, checklist building, reminders, and plain-language procedure explanations.

## Recommended Stack
- Frontend: Next.js
- Styling: Tailwind CSS
- Backend: Next.js Route Handlers / Server Actions
- Database: PostgreSQL
- ORM: Prisma
- Auth: Supabase Auth or NextAuth-compatible auth flow
- Payments: Stripe
- Email: Resend
- Deployment: Vercel

## Core Modules

### 1. Auth Module
Responsibilities:
- sign up
- sign in
- user session
- language preference
- subscription-aware access

### 2. Onboarding Intake Module
Responsibilities:
- capture migrant profile
- collect initial settlement and paperwork status
- save structured answers
- trigger roadmap generation

### 3. Roadmap Engine
Responsibilities:
- classify user situation
- generate next-step plan
- prioritize steps
- update status as user progresses

Version 1 note:
- start with deterministic rules + structured prompts
- avoid opaque AI-only logic for critical flows

### 4. Checklist Engine
Responsibilities:
- generate personalized required-documents list
- attach statuses
- note dependencies
- flag translation / missing items

### 5. Procedure Explainer
Responsibilities:
- provide simple-language explanation
- Arabic + Spanish first
- explain terms, forms, and steps

### 6. Reminder Module
Responsibilities:
- upcoming tasks
- dashboard timeline
- email reminders later

### 7. Subscription Module
Responsibilities:
- free vs paid access
- Stripe checkout
- entitlement checks

## Data Flow

### User Onboarding Flow
1. user signs up
2. user completes intake
3. intake saved in DB
4. roadmap engine generates user roadmap
5. checklist engine creates document checklist
6. dashboard loads personalized state

### Ongoing Usage Flow
1. user marks step as done
2. progress saved
3. next steps recalculated if needed
4. reminders updated
5. dashboard refreshes timeline and checklist state

## External Services
- Stripe for subscription billing
- Resend for transactional email/reminders
- Vercel for deployment
- Optional LLM provider later for explanation generation

## Deployment Shape
- Single Next.js app
- PostgreSQL hosted database
- Vercel deployment
- Environment-based secret management

## MVP Simplicity Rules
- one web app only
- no microservices
- no complex role system
- no admin panel beyond minimal internal tooling
