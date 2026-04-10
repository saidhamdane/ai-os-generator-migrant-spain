# Dashboard Structure — MigrantCopilot Spain

## Design Principles

- **Mobile-first**: All layouts designed for 375px width, then scaled up
- **RTL-first**: Arabic is the primary language; use `dir="rtl"` on root for `ar` locale
- **One action per screen**: Every screen has exactly one primary CTA above the fold
- **Trust-oriented**: No confusing widgets; clear status, clear next step
- **Paywall-transparent**: Free users see what they're missing; no dark patterns

---

## Navigation Structure

### Desktop Sidebar (left for LTR / right for RTL)

```
Logo
─────────────────
🏠  Home               /dashboard
🗺️  My Roadmap         /roadmap
📄  Documents          /documents
📖  Procedures         /procedures
🔔  Reminders          /reminders
👤  Profile            /profile
─────────────────
[Upgrade to Pro]       shown only for free users
```

### Mobile Bottom Navigation

```
[Home] [Roadmap] [Documents] [Procedures] [Profile]
```

Reminders accessible via Home screen widget on mobile.

---

## Screen Definitions

---

### Screen 1 — Home Dashboard `/dashboard`

**Purpose:** Show user exactly where they are and what to do next.

**Layout (top to bottom):**

```
┌─────────────────────────────────────────┐
│  Welcome, [Name]                         │
│  مرحباً بك في خطة إقامتك               │
├─────────────────────────────────────────┤
│  PROGRESS BAR                            │
│  ██████░░░░░░  3 of 8 steps done        │
├─────────────────────────────────────────┤
│  NEXT STEP CARD  ← most prominent        │
│  ┌────────────────────────────────────┐  │
│  │  Step 4 — Solicitar NIE            │  │
│  │  📍 Comisaría de Madrid            │  │
│  │  📄 3 documents needed             │  │
│  │  [Start this step →]               │  │
│  └────────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  DOCUMENTS ALERT                         │
│  2 documents missing for your next step  │
│  [View checklist →]                      │
├─────────────────────────────────────────┤
│  UPCOMING REMINDER                       │
│  ⏰ NIE appointment — in 3 days          │
├─────────────────────────────────────────┤
│  FREE USER CTA (hidden for paid)         │
│  ┌────────────────────────────────────┐  │
│  │  Unlock your full plan — €9.99/mo  │  │
│  │  [Upgrade now]                     │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Components:**
- `<WelcomeBlock>` — user name + locale greeting
- `<ProgressBar>` — `completedSteps / totalSteps`, percentage label
- `<NextStepCard>` — current active step, location, document count, CTA button
- `<DocumentsAlert>` — count of missing docs for current step, link to /documents
- `<UpcomingReminder>` — first pending reminder with date
- `<UpgradeCTA>` — shown only when `isPaidUser === false`

**Empty state:** If intake not complete → full-screen redirect to `/onboarding`

**Data fetched (server component):**
```typescript
// app/[locale]/(app)/dashboard/page.tsx
const user = await getAuthUser()
const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } })
if (!profile?.intakeCompleted) redirect('/onboarding')
const roadmap = await prisma.roadmap.findFirst({
  where: { userId: user.id, status: 'active' },
  include: { steps: { orderBy: { stepOrder: 'asc' } }, checklist: { include: { items: true } } }
})
const nextStep = roadmap?.steps.find(s => s.status !== 'done' && s.status !== 'skipped')
const isPaid = await isPaidUser(user.id)
```

---

### Screen 2 — Onboarding Intake `/onboarding`

**Purpose:** Capture user situation in 7 steps, generate personalized plan.

**Layout:** Full-screen wizard, one question per screen.

**Step components:**

```
Step 1/7
─────────────────────────────────
When did you arrive in Spain?
متى وصلت إلى إسبانيا؟

[Date picker]

[Continue →]
─────────────────────────────────
```

**Step sequence:**
1. Arrival date → `DatePicker`
2. City in Spain → `Select` (Madrid / Barcelona / Valencia / Seville / Other)
3. Immigration status → `RadioGroup` (Tourist visa / Work visa / Irregular / Other)
4. Empadronamiento registered? → `YesNoNotSure`
5. NIE or TIE? → `RadioGroup` (Have NIE / Have TIE / Neither / Not sure)
6. Currently working? → `RadioGroup` (Yes formal / Yes informal / No)
7. Preferred language → `RadioGroup` (Arabic / Spanish)

**Component:** `<IntakeForm>` with internal step state. Each step saves to `localStorage` for resume support. On final step: POST to `/api/onboarding`.

**Progress indicator:** `Step X of 7` shown at top. Back button available on steps 2–7.

**Submission states:**
- Loading: spinner with "Generating your plan..." text in Arabic + Spanish
- Error: toast with retry button
- Success: redirect to `/dashboard`

---

### Screen 3 — My Roadmap `/roadmap`

**Purpose:** View all steps, mark progress, read explanations.

**Layout:**

```
┌─────────────────────────────────────────┐
│  My Roadmap — خطتي الشخصية              │
│  ██████████░░  6 of 8 steps complete    │
├─────────────────────────────────────────┤
│  STEP 1  ✅ Done                         │
│  Empadronamiento                         │
│  التسجيل في بلدية الإقامة              │
├─────────────────────────────────────────┤
│  STEP 2  ✅ Done                         │
│  Número de Seguridad Social              │
├─────────────────────────────────────────┤
│  STEP 3  🔵 In Progress ← highlighted   │
│  Solicitar NIE                           │
│  طلب رقم التعريف الأجنبي               │
│  📄 3 documents needed                   │
│  [Read full guide] [Mark as done]        │
├─────────────────────────────────────────┤
│  STEP 4–8  🔒 Locked (free users)        │
│  [Upgrade to see all steps]              │
└─────────────────────────────────────────┘
```

**Component: `<StepItem>`**

Props:
```typescript
interface StepItemProps {
  step: RoadmapStep
  isPaid: boolean
  locale: 'ar' | 'es'
  onMarkDone: (stepId: string) => void
}
```

States:
- `done`: green checkmark, collapsed, timestamp shown
- `in_progress`: highlighted border, expanded by default, CTA visible
- `pending`: gray, collapsed, shown if paid; blurred if free and beyond limit
- `skipped`: strikethrough, collapsed

**Free user gate:** Steps 1–2 fully visible. Steps 3+ blurred with overlay: "Upgrade to see your full roadmap" and upgrade CTA button.

**"Mark as done" behavior:**
- Optimistic update: step immediately shows as done
- PATCH `/api/roadmap/steps/:id` `{ status: 'done' }`
- Next pending step auto-highlights
- Toast: "Step marked complete!" in user's language

---

### Screen 4 — Documents `/documents`

**Purpose:** Track all required paperwork by step.

**Layout:**

```
┌─────────────────────────────────────────┐
│  My Documents — وثائقي                  │
│  [All] [Missing] [Ready]                 │
├─────────────────────────────────────────┤
│  FOR: Empadronamiento                    │
│  ✅ Pasaporte / جواز السفر             │
│  ⚠️  Contrato de alquiler / عقد الإيجار│
│     Needs translation                    │
│  ❌ Formulario de empadronamiento        │
│     → How to get this [link]            │
├─────────────────────────────────────────┤
│  FOR: Solicitar NIE                      │
│  ❌ EX-15 Form  (blurred — free user)   │
│  ❌ Foto carné  (blurred)               │
│  [Upgrade to see all documents]          │
├─────────────────────────────────────────┤
│  [Download my document checklist PDF]   │
│  (paid users only)                       │
└─────────────────────────────────────────┘
```

**Component: `<ChecklistGroup>`**

Groups items by `stepCategory`. Each group is collapsible.

**Component: `<ChecklistItem>`**

Props:
```typescript
interface ChecklistItemProps {
  item: ChecklistItem
  isPaid: boolean
  locale: 'ar' | 'es'
  onStatusChange: (itemId: string, status: DocumentStatus) => void
}
```

Status update UI: tap/click on status badge opens dropdown: Missing / Ready / Needs Translation / N/A.

**Tabs:** All | Missing | Ready — filter on client side.

**Download CTA:** Paid users only. `GET /api/checklist/export` returns PDF. Locked for free users with upgrade prompt.

---

### Screen 5 — Procedures `/procedures` and `/procedures/[slug]`

**Purpose:** Explain bureaucratic procedures in plain Arabic and Spanish.

**List view `/procedures`:**

```
┌─────────────────────────────────────────┐
│  Procedures — الإجراءات                 │
│  [Search...]                             │
├─────────────────────────────────────────┤
│  REGISTRATION                            │
│  ┌────────────────────────────────────┐  │
│  │ Empadronamiento                    │  │
│  │ التسجيل البلدي — what it is       │  │
│  │ [Read guide →]                     │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ Número de Seguridad Social         │  │
│  │ [Read guide →]                     │  │
│  └────────────────────────────────────┘  │
│  ...                                     │
└─────────────────────────────────────────┘
```

**Detail view `/procedures/[slug]`:**

```
┌─────────────────────────────────────────┐
│  ← Back     [🇲🇦 AR] [🇪🇸 ES]           │
├─────────────────────────────────────────┤
│  Empadronamiento                         │
│  التسجيل في بلدية إقامتك               │
├─────────────────────────────────────────┤
│  What is it?                             │
│  ما هو؟                                  │
│  [Short explanation in selected lang]    │
├─────────────────────────────────────────┤
│  Full guide                              │
│  [Detailed explanation in selected lang] │
├─────────────────────────────────────────┤
│  ⚠️ Important notes                      │
│  [Warning text]                          │
├─────────────────────────────────────────┤
│  Related to: Step 1 of your roadmap      │
│  [Go to Step 1 →]                        │
└─────────────────────────────────────────┘
```

**Language toggle:** `<LanguageToggle>` — switches rendered text between `ar` and `es` content fields. Does not change app locale; this is a content-display toggle only.

**RTL note:** When showing Arabic content, wrap in `<div dir="rtl" lang="ar">`.

---

### Screen 6 — Reminders `/reminders`

**Purpose:** Keep user on track with upcoming procedural deadlines.

**Layout:**

```
┌─────────────────────────────────────────┐
│  Reminders — التذكيرات                  │
├─────────────────────────────────────────┤
│  DUE SOON                                │
│  ⏰ NIE appointment — Tomorrow           │
│     موعد طلب NIE — غداً                 │
│     [Mark done]                          │
├─────────────────────────────────────────┤
│  UPCOMING                                │
│  📅 TIE application deadline — 15 days  │
│  📅 Social Security registration         │
├─────────────────────────────────────────┤
│  COMPLETED                               │
│  ✅ Empadronamiento — Done Apr 1         │
└─────────────────────────────────────────┘
```

**Data:** Auto-generated reminders created alongside roadmap steps (e.g., step with `dueDate` → reminder `remindAt = dueDate - 3 days`).

**Email reminders:** Set up via weekly cron. UI shows notice: "You will receive a weekly email summary of pending reminders."

**Free users:** Reminders section is fully locked. Shows upgrade prompt: "Upgrade to track your deadlines and receive email reminders."

---

### Screen 7 — Profile `/profile`

**Purpose:** Manage personal info, language preference, and subscription.

**Layout:**

```
┌─────────────────────────────────────────┐
│  Profile — حسابي                        │
├─────────────────────────────────────────┤
│  Name: Ahmed El Fassi                   │
│  Email: ahmed@email.com                  │
│  City: Madrid                            │
│  [Edit →]                                │
├─────────────────────────────────────────┤
│  LANGUAGE                                │
│  [Arabic ✓] [Spanish]                   │
├─────────────────────────────────────────┤
│  SUBSCRIPTION                            │
│  Plan: Free                              │
│  [Upgrade to Pro — €9.99/month]          │
│  ─ or ─                                  │
│  Plan: Pro (active until Dec 31)         │
│  [Manage billing →]  ← Stripe Portal     │
├─────────────────────────────────────────┤
│  DANGER ZONE                             │
│  [Delete account]                        │
└─────────────────────────────────────────┘
```

**Language switch:** Updates `User.preferredLanguage` via PATCH and reloads page with new locale.

**Billing:** "Manage billing" → POST `/api/stripe/portal` → redirect to Stripe Customer Portal.

---

## First-Run UX Flow

```
User signs up
  → redirect to /onboarding
  → intake step 1 (arrival date)
  → ... 7 steps ...
  → "Generating your plan..." loading screen
  → redirect to /dashboard
  → Dashboard: welcome message, progress bar at 0%
  → NextStepCard: Step 1 highlighted with instruction
  → User scrolls: sees document alert for Step 1
  → User clicks "Start this step" → goes to /roadmap#step-1
  → Step 1 expanded with full details and "Read guide" button
  → User clicks "Read guide" → /procedures/empadronamiento
  → User reads guide
  → User returns to /roadmap → clicks "Mark as done"
  → Step 2 unlocks
  → At Step 3 (free limit): upgrade prompt appears
```

---

## i18n Implementation Notes

**Library:** `next-intl`

**Locale routing:** `app/[locale]/` — locale in URL (`/ar/dashboard`, `/es/dashboard`)

**Locale detection on signup:**
- Default to `ar` unless user selects otherwise in intake step 7
- Stored in `User.preferredLanguage`
- Middleware reads locale from URL; redirects to preferred locale if mismatch

**RTL layout:**
```typescript
// app/[locale]/layout.tsx
export default function LocaleLayout({ children, params: { locale } }) {
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>{children}</body>
    </html>
  )
}
```

**Translation files structure:**
```json
// messages/ar.json
{
  "dashboard": {
    "welcome": "مرحباً، {name}",
    "nextStep": "الخطوة التالية",
    "progress": "{done} من {total} خطوات مكتملة"
  },
  "roadmap": {
    "markDone": "تم الإنجاز",
    "startStep": "ابدأ هذه الخطوة"
  }
}
```

---

## Tailwind + RTL Conventions

- Use `rtl:` variant for directional utilities: `rtl:text-right`, `rtl:flex-row-reverse`
- Sidebar: `ltr:left-0 rtl:right-0`
- Icons: use neutral icons that work in both directions (avoid directional arrows where possible; use `rtl:rotate-180` when needed)
- shadcn/ui components: mostly RTL-compatible out of the box with `dir` on root
