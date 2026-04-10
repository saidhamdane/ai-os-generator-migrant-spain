#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/ai-os-generator

mkdir -p outputs/prd
mkdir -p outputs/architecture
mkdir -p outputs/frontend
mkdir -p outputs/launch

cat > outputs/prd/mvp-prd.md <<'EOF'
# MVP PRD — MigrantCopilot Spain

## Product Name
MigrantCopilot Spain

## One-Line Promise
A web-first AI assistant that tells new immigrants in Spain exactly what to do next, which documents they need, and how to avoid costly bureaucracy mistakes.

## Target User
Primary:
- First-year immigrants in Spain
- Arabic-speaking newcomers who struggle with Spanish bureaucracy

Secondary later:
- Students
- Families
- Workers
- People renewing papers

## Core Problem
New immigrants in Spain face confusing procedures, language barriers, scattered information, and missed steps around settlement and immigration workflows.

## MVP Goal
Help a user understand their current situation, identify the correct next steps, receive a personalized checklist, and track progress in a simple dashboard.

## Core MVP Features
1. Guided Intake
   - Ask user about arrival date, status, city, family situation, work situation, language, and current paperwork state

2. Personalized Roadmap
   - Generate step-by-step next actions based on profile

3. Smart Document Checklist
   - Show required documents for the user’s situation
   - Mark ready / missing / needs translation

4. Reminder System
   - Show upcoming steps, deadlines, and pending actions

5. Plain-Language Explainer
   - Explain forms and procedures in simple Arabic and Spanish

## Excluded from V1
- Lawyer marketplace
- Jobs board
- Housing marketplace
- Community/social feed
- Native mobile app
- Full document OCR automation
- Human consultation booking network
- Government integrations

## Primary User Workflow
1. User signs up
2. User completes onboarding intake
3. System classifies situation
4. System builds roadmap
5. System shows checklist + next action
6. User tracks completed steps in dashboard
7. User receives reminders and explanations

## Main Screens
- Landing page
- Sign up / login
- Onboarding intake
- Personalized roadmap
- Document checklist
- Procedure explainer
- Reminders / timeline
- Profile / language settings

## Success Metric
Primary:
- User completes onboarding and views their roadmap within first session

Secondary:
- User completes at least one tracked step
- User returns within 7 days
- Free-to-paid conversion on roadmap/checklist value

## Monetization
Free:
- Basic intake
- Limited roadmap preview
- Limited checklist preview

Paid subscription:
- Full personalized roadmap
- Full checklist
- Reminders
- Guided workflow
- Downloadable action plan
- Detailed explanations

Upsells later:
- Premium templates
- Appeal/letter generation
- Expert referral

## Risks
- Scope creep into too many migrant needs
- Legal accuracy expectations
- Need to keep language simple and trustworthy
- Need strong disclaimer positioning without killing conversion
EOF

cat > outputs/architecture/system-architecture.md <<'EOF'
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
EOF

cat > outputs/architecture/db-schema.md <<'EOF'
# DB Schema — MigrantCopilot Spain

## Core Entities

### User
Purpose:
Store account identity and user-level preferences.

Fields:
- id
- email
- passwordHash or authProviderId
- fullName
- preferredLanguage
- countryOfOrigin
- cityInSpain
- createdAt
- updatedAt

### UserProfile
Purpose:
Store onboarding and migrant situation data.

Fields:
- id
- userId
- arrivalDate
- immigrationGoal
- currentStatus
- hasWorkContract
- hasAddress
- familySituation
- needsTranslationHelp
- notes
- createdAt
- updatedAt

### Roadmap
Purpose:
Main personalized plan for a user.

Fields:
- id
- userId
- title
- summary
- status
- generatedAt
- createdAt
- updatedAt

### RoadmapStep
Purpose:
Atomic actions inside a roadmap.

Fields:
- id
- roadmapId
- title
- description
- category
- priority
- stepOrder
- status
- dueDate
- createdAt
- updatedAt

### DocumentChecklist
Purpose:
Container for user-specific document requirements.

Fields:
- id
- userId
- title
- createdAt
- updatedAt

### ChecklistItem
Purpose:
Individual required document or preparation item.

Fields:
- id
- checklistId
- name
- description
- status
- isRequired
- needsTranslation
- notes
- createdAt
- updatedAt

### ProcedureGuide
Purpose:
Simple-language explainer content.

Fields:
- id
- slug
- title
- category
- language
- shortExplanation
- detailedExplanation
- createdAt
- updatedAt

### Reminder
Purpose:
Track follow-up and timeline items.

Fields:
- id
- userId
- title
- description
- remindAt
- status
- createdAt
- updatedAt

### Subscription
Purpose:
Track paid access.

Fields:
- id
- userId
- provider
- providerCustomerId
- providerSubscriptionId
- plan
- status
- currentPeriodEnd
- createdAt
- updatedAt

## Relationships
- User 1:1 UserProfile
- User 1:N Roadmap
- Roadmap 1:N RoadmapStep
- User 1:N DocumentChecklist
- DocumentChecklist 1:N ChecklistItem
- User 1:N Reminder
- User 1:N Subscription

## Recommended Status Enums

### roadmap.status
- draft
- active
- completed
- archived

### roadmap_step.status
- pending
- in_progress
- done
- skipped

### checklist_item.status
- missing
- ready
- uploaded
- not_applicable

### reminder.status
- pending
- sent
- done
- dismissed

### subscription.status
- inactive
- trialing
- active
- past_due
- canceled

## Prisma Notes
- use UUID ids
- index userId across child tables
- index status fields where dashboard queries are common
- keep ProcedureGuide reusable and content-managed later
EOF

cat > outputs/frontend/dashboard-structure.md <<'EOF'
# Dashboard Structure — MigrantCopilot Spain

## Dashboard Goal
Show the immigrant exactly:
- where they are now
- what to do next
- which documents are missing
- what deadlines matter

## Primary Navigation
1. Home
2. My Roadmap
3. Documents
4. Procedures
5. Reminders
6. Profile

## Screen Details

### 1. Home
Purpose:
Quick overview and immediate next action.

Components:
- welcome block
- current status summary
- next best step card
- pending documents summary
- upcoming reminder
- upgrade CTA for free users

Primary CTA:
- Continue my plan

### 2. My Roadmap
Purpose:
View all personalized steps.

Components:
- roadmap header
- progress bar
- ordered steps list
- priority tags
- mark as done button
- blocked/missing dependency notes

Primary CTA:
- Mark current step complete

### 3. Documents
Purpose:
Track required paperwork.

Components:
- checklist groups
- missing vs ready tabs
- translation-needed tag
- upload placeholder for later phase
- download action plan CTA for paid users

Primary CTA:
- Update document status

### 4. Procedures
Purpose:
Explain procedures in simple language.

Components:
- searchable procedure cards
- Arabic / Spanish toggle
- simple explainer view
- important notes / warnings
- related next actions

Primary CTA:
- Read explanation

### 5. Reminders
Purpose:
Keep user on track.

Components:
- timeline list
- due soon section
- completed reminders
- email reminder preferences later

Primary CTA:
- Confirm reminder completed

### 6. Profile
Purpose:
Manage user data and preferences.

Components:
- personal details
- migration profile summary
- preferred language
- city in Spain
- billing/subscription section

Primary CTA:
- Update profile

## First-Run UX Flow
1. user lands on dashboard
2. if intake incomplete -> force onboarding continuation
3. after intake -> show generated roadmap
4. highlight one next step only
5. show document checklist preview
6. present upgrade CTA after core value is visible

## UX Priorities
- no clutter
- mobile-first layout
- one obvious next action
- simple Arabic copy
- clear step status
- trust-oriented visual tone
EOF

cat > outputs/launch/launch-strategy.md <<'EOF'
# Launch Strategy — MigrantCopilot Spain

## Core Positioning
An AI copilot for new immigrants in Spain that turns confusing bureaucracy into a clear action plan.

## Ideal Early Adopters
- Arabic-speaking immigrants in Spain
- newcomers in first 12 months
- people struggling with paperwork, procedures, and next-step uncertainty

## Core Offer
Tell us your situation and get:
- your next steps
- your required documents
- your personalized roadmap
- reminders to stay on track

## Launch Channels
1. Arabic-speaking Facebook groups for immigrants in Spain
2. Telegram / WhatsApp migrant communities
3. Short-form educational content on TikTok / Instagram Reels

## Message Angle
You do not need to understand Spanish bureaucracy alone.
Get a clear next-step plan in simple language.

## Funnel
1. user sees educational content
2. user lands on landing page
3. user completes short intake
4. user sees limited roadmap preview
5. user upgrades for full plan, checklist, and reminders

## Landing Page Hooks
- What should I do first in Spain?
- Which documents do I need?
- What mistakes should I avoid?
- Get a personalized migration action plan in Arabic and Spanish

## Pricing Direction
- Free preview
- Paid monthly subscription
- Keep pricing simple with one main plan first

Suggested early test:
- 9€ to 19€/month range depending on depth of value

## First Revenue Plan
- launch with one paid plan
- gate full checklist + reminders + downloadable action plan
- validate conversion before adding upsells

## Feedback Loop
After onboarding, ask:
- Was your roadmap clear?
- What was missing?
- Which step confused you most?
- What document did you struggle with?

Use answers to improve:
- roadmap templates
- procedure explainers
- checklist completeness
- conversion copy
EOF

echo "Generated:"
find outputs -type f | sort
