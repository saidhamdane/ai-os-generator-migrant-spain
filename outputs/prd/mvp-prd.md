# MVP PRD — MigrantCopilot Spain

## Product Name
MigrantCopilot Spain (Arabic: مساعد المهاجر في إسبانيا)

## One-Line Promise
Tell us your situation and get a clear, step-by-step action plan in Arabic or Spanish for your first year in Spain.

---

## Target User

**Primary (v1 only):**
Arabic-speaking immigrant in Spain, within their first 12 months of arrival. Does not speak fluent Spanish. Needs to navigate empadronamiento, NIE/TIE, and social-security registration without a guide.

**Excluded in v1:**
- Students with student visa (different procedure tree)
- Families applying for reunification (added in v2)
- Renewal cases (different flows, added in v2)

---

## Core Problem

New Arabic-speaking immigrants in Spain face:
1. Confusing and changing bureaucratic procedures (empadronamiento, NIE, TIE, Social Security, SEPE)
2. Language barrier — all official forms and offices operate in Spanish
3. No single trusted source that explains what to do in what order
4. High risk of missed deadlines or incorrect documents leading to process restart

---

## MVP Goal

A first-year immigrant completes a 5-minute onboarding intake and immediately receives:
- Their numbered next steps in order
- A checklist of documents needed for their next step
- Plain Arabic/Spanish explanations of each step
- Dashboard to track what they've done and what's pending

---

## Core MVP Features (v1 scope — 5 features only)

### Feature 1 — Onboarding Intake
A structured multi-step form (5–7 questions) that classifies the user's situation.

Questions asked:
1. When did you arrive in Spain? (date picker)
2. Which city do you live in? (dropdown: Madrid, Barcelona, Valencia, Seville, Other)
3. What is your current immigration status? (Tourist visa / Work visa / Student visa / Irregular / Other)
4. Do you have a Spanish address registered? (Yes / No / Not sure)
5. Do you have a NIE or TIE? (Yes — NIE / Yes — TIE / No / Not sure)
6. Are you currently working in Spain? (Yes — formal / Yes — informal / No)
7. Do you need everything explained in Arabic? (Yes / No — I can read Spanish)

Output: `UserProfile` record saved to DB. Triggers roadmap generation.

### Feature 2 — Personalized Roadmap
Based on intake answers, the system selects the correct procedure template and generates an ordered list of steps.

Template decision logic (v1 — rules-based, not AI):
- If no empadronamiento → Step 1 = Empadronamiento
- If no NIE and has empadronamiento → Step = Solicitar NIE
- If has NIE and no TIE (non-EU) → Step = Solicitar TIE
- If TIE obtained → Step = Afiliación Seguridad Social
- Each step has: title, short description, documents needed, office to visit, typical wait time

Each step card shows:
- Step number and title (Arabic + Spanish)
- Status: pending / in_progress / done / skipped
- Button: "Mark as done" / "Start this step"
- Expandable: full explanation

### Feature 3 — Document Checklist
Generated from roadmap steps. One checklist per user, grouped by procedure.

Items shown per document:
- Document name (Arabic + Spanish)
- Status: missing / ready / needs_translation
- Note field: e.g. "Ask your landlord for this"
- Dependency note: e.g. "Required for Step 2 — NIE appointment"

Free users see: first 3 items only, rest blurred with upgrade CTA.
Paid users see: full checklist with ability to update status.

### Feature 4 — Procedure Explainer
A library of static, pre-written procedure guides. Not AI-generated in v1.

Procedures covered in v1 (8 total):
1. Empadronamiento — what it is, who needs it, documents, how to book appointment
2. NIE — what it is, who needs it, how to apply, EX-15 form guide
3. TIE (Tarjeta de Identidad de Extranjero) — types, documents, process
4. Número de Seguridad Social — how to register, what it's used for
5. Cuenta bancaria en España — how to open without residence permit
6. SIP card (Valencia) / CIP card (Cataluña) — health card registration
7. Homologación de títulos — academic credential recognition overview
8. SEPE — registration as job seeker

Each guide has: slug, title_ar, title_es, short_explanation_ar, short_explanation_es, detailed_explanation_ar, detailed_explanation_es, important_notes, related_step_category.

### Feature 5 — Dashboard + Progress Tracking
Single-page authenticated dashboard with 5 sections (see dashboard-structure.md for full detail).

Core behavior:
- After intake: show roadmap with first step highlighted
- User marks steps done → progress bar updates
- Checklist updates when user changes document status
- Free users see limited view + upgrade prompt
- Paid users see everything unlocked

---

## User Acceptance Criteria (per feature)

### Intake
- [ ] User can complete intake in under 5 minutes
- [ ] All questions work in Arabic (RTL layout) and Spanish
- [ ] Intake is resumable if user navigates away
- [ ] Intake data is saved after each step (progressive save)
- [ ] Incomplete intake prompts continuation on next login

### Roadmap
- [ ] Roadmap loads within 3 seconds of intake completion
- [ ] Steps are ordered correctly per decision logic
- [ ] User can mark steps done and see progress update instantly
- [ ] Each step has Arabic and Spanish text
- [ ] Steps cannot be marked done out of order if dependency exists

### Checklist
- [ ] Checklist auto-generates from roadmap on first load
- [ ] User can update document status (missing / ready / needs_translation)
- [ ] Free users see blur overlay after item 3
- [ ] Paid users see full list with notes

### Procedure Explainer
- [ ] 8 guides available at launch
- [ ] Language toggle switches between Arabic and Spanish
- [ ] Arabic text renders RTL correctly
- [ ] Each guide links to related roadmap step

### Dashboard
- [ ] Dashboard loads authenticated user state correctly
- [ ] New user without intake → redirected to intake immediately
- [ ] Progress bar reflects current roadmap completion
- [ ] Next action is always visible above the fold

---

## Monetization Gates

| Feature | Free | Paid |
|---|---|---|
| Intake | Full | Full |
| Roadmap | First 2 steps visible | All steps |
| Checklist | First 3 items | Full list + status update |
| Procedures | All 8 readable | All 8 + downloadable PDF |
| Reminders | None | Email reminders for upcoming steps |
| Action Plan PDF | No | Yes — downloadable |

**Paid plan:** €12/month or €89/year (test €9.99/month at launch)

---

## Excluded from V1

- Lawyer network or consultation booking
- Job board or housing listings
- Community features or forums
- Document upload or OCR
- Government API integrations
- Native mobile app (iOS/Android)
- Push notifications
- AI-generated procedure content (v1 uses pre-written guides)
- English or French language support
- Admin panel (use DB directly for v1 operations)

---

## Primary User Workflow

```
1. User lands on landing page
2. User clicks "Start for free"
3. User signs up with email + password
4. User is redirected to onboarding intake (/onboarding)
5. User answers 7 questions
6. System classifies situation → creates roadmap + checklist
7. User lands on /dashboard
8. Dashboard shows: welcome message, Step 1 highlighted, documents needed
9. User reads explanation for Step 1
10. User marks Step 1 complete
11. Step 2 unlocks
12. At step 3 or 4, upgrade prompt appears for free user
13. User upgrades → full access immediately
14. User receives weekly email reminders for open steps
```

---

## Technical Notes for Developers

- RTL support: use `dir="rtl"` for Arabic pages, `dir="ltr"` for Spanish; apply via `lang` context
- Roadmap generation: implement as a pure function `generateRoadmap(profile: UserProfile): RoadmapStep[]` — deterministic rules, no LLM in v1
- Procedure guides: seed into DB at deploy time from a JSON fixture file
- Stripe: use Customer Portal for self-serve subscription management
- Email: Resend for welcome, roadmap-ready, and weekly step-reminder emails
- i18n: use `next-intl` with locale `ar` and `es`; store user's preferred locale in DB

---

## Success Metrics

**Primary (must achieve in first 30 days):**
- 60% of signed-up users complete the full intake
- 40% of users who see the roadmap view at least one procedure guide

**Secondary:**
- 10% free-to-paid conversion within first 7 days of signup
- 30% of paid users return at least once in week 2

**Failure signal:**
- Intake completion rate below 30% → simplify intake questions
- Zero step-completions in first session → onboarding is confusing, iterate
