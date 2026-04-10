# DB Schema — MigrantCopilot Spain

## Prisma Schema

Paste this directly into `prisma/schema.prisma`.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

enum Language {
  ar
  es
}

enum ImmigrationStatus {
  tourist_visa
  work_visa
  student_visa
  irregular
  other
}

enum FamilySituation {
  single
  married_here
  married_abroad
  children_here
  other
}

enum RoadmapStatus {
  draft
  active
  completed
  archived
}

enum StepStatus {
  pending
  in_progress
  done
  skipped
}

enum StepCategory {
  registration
  documentation
  health
  work
  banking
  education
  other
}

enum DocumentStatus {
  missing
  ready
  needs_translation
  not_applicable
}

enum ReminderStatus {
  pending
  sent
  done
  dismissed
}

enum SubscriptionStatus {
  inactive
  trialing
  active
  past_due
  canceled
}

enum SubscriptionPlan {
  free
  monthly
  yearly
}

// ─────────────────────────────────────────────
// MODELS
// ─────────────────────────────────────────────

model User {
  id                String        @id @default(uuid())
  email             String        @unique
  fullName          String?
  preferredLanguage Language      @default(ar)
  countryOfOrigin   String?       // e.g. "MA" (Morocco), "DZ" (Algeria)
  cityInSpain       String?       // e.g. "Madrid"
  supabaseUserId    String?       @unique // links to Supabase Auth uid
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  profile           UserProfile?
  roadmaps          Roadmap[]
  reminders         Reminder[]
  subscriptions     Subscription[]

  @@index([email])
  @@index([supabaseUserId])
}

model UserProfile {
  id                   String            @id @default(uuid())
  userId               String            @unique
  user                 User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Intake answers
  arrivalDate          DateTime?
  immigrationStatus    ImmigrationStatus?
  cityInSpain          String?
  hasEmpadronamiento   Boolean           @default(false)
  hasNIE               Boolean           @default(false)
  hasTIE               Boolean           @default(false)
  hasSocialSecurity    Boolean           @default(false)
  isWorking            Boolean           @default(false)
  isNonEU              Boolean           @default(true)  // determines TIE requirement
  needsTranslationHelp Boolean           @default(true)
  familySituation      FamilySituation?
  notes                String?

  // Intake state
  intakeCompleted      Boolean           @default(false)
  intakeStep           Int               @default(0)    // resume support

  createdAt            DateTime          @default(now())
  updatedAt            DateTime          @updatedAt

  @@index([userId])
}

model Roadmap {
  id          String        @id @default(uuid())
  userId      String
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  title       String        // e.g. "Your First Year in Spain Plan"
  summary     String?       // short description in user's language
  status      RoadmapStatus @default(active)
  generatedAt DateTime      @default(now())
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  steps       RoadmapStep[]
  checklist   DocumentChecklist?

  @@index([userId])
  @@index([status])
}

model RoadmapStep {
  id            String       @id @default(uuid())
  roadmapId     String
  roadmap       Roadmap      @relation(fields: [roadmapId], references: [id], onDelete: Cascade)

  // Display content (bilingual)
  titleAr       String
  titleEs       String
  descriptionAr String
  descriptionEs String

  // Classification
  category      StepCategory
  procedureSlug String?      // links to ProcedureGuide.slug

  // Ordering + state
  stepOrder     Int
  status        StepStatus   @default(pending)
  priority      Int          @default(0)  // higher = more urgent

  // Optional deadline
  dueDate       DateTime?
  completedAt   DateTime?

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([roadmapId])
  @@index([status])
  @@unique([roadmapId, stepOrder])
}

model DocumentChecklist {
  id        String          @id @default(uuid())
  roadmapId String          @unique
  roadmap   Roadmap         @relation(fields: [roadmapId], references: [id], onDelete: Cascade)

  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt

  items     ChecklistItem[]

  @@index([roadmapId])
}

model ChecklistItem {
  id            String           @id @default(uuid())
  checklistId   String
  checklist     DocumentChecklist @relation(fields: [checklistId], references: [id], onDelete: Cascade)

  // Display content (bilingual)
  nameAr        String
  nameEs        String
  descriptionAr String?
  descriptionEs String?

  // State
  status        DocumentStatus   @default(missing)
  isRequired    Boolean          @default(true)
  needsTranslation Boolean       @default(false)
  notes         String?

  // Grouping
  stepCategory  StepCategory     // groups item under procedure section
  itemOrder     Int              @default(0)

  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  @@index([checklistId])
  @@index([status])
}

model ProcedureGuide {
  id                  String   @id @default(uuid())
  slug                String   @unique  // e.g. "empadronamiento"
  category            StepCategory

  // Titles
  titleAr             String
  titleEs             String

  // Short explanation (shown in cards / previews)
  shortExplanationAr  String
  shortExplanationEs  String

  // Detailed explanation (shown in full guide view)
  detailedAr          String   @db.Text
  detailedEs          String   @db.Text

  // Important warnings / notes
  importantNotesAr    String?  @db.Text
  importantNotesEs    String?  @db.Text

  // Metadata
  isPublished         Boolean  @default(true)
  sortOrder           Int      @default(0)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([slug])
  @@index([isPublished])
}

model Reminder {
  id          String         @id @default(uuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  titleAr     String
  titleEs     String
  description String?
  remindAt    DateTime
  status      ReminderStatus @default(pending)

  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([userId])
  @@index([remindAt])
  @@index([status])
}

model Subscription {
  id                     String             @id @default(uuid())
  userId                 String
  user                   User               @relation(fields: [userId], references: [id], onDelete: Cascade)

  provider               String             @default("stripe")
  providerCustomerId     String?            // Stripe customer ID
  providerSubscriptionId String?            @unique  // Stripe subscription ID
  plan                   SubscriptionPlan   @default(free)
  status                 SubscriptionStatus @default(inactive)
  currentPeriodEnd       DateTime?

  createdAt              DateTime           @default(now())
  updatedAt              DateTime           @updatedAt

  @@index([userId])
  @@index([status])
  @@index([providerCustomerId])
}
```

---

## Relationships Summary

```
User
  └── UserProfile (1:1)
  └── Roadmap[] (1:N)
        └── RoadmapStep[] (1:N)
        └── DocumentChecklist (1:1)
              └── ChecklistItem[] (1:N)
  └── Reminder[] (1:N)
  └── Subscription[] (1:N)

ProcedureGuide (standalone, seeded content)
  referenced by RoadmapStep.procedureSlug
```

---

## Seed Data — Procedure Guides

File: `prisma/seed.ts`

Seed the following 8 guides at deploy time:

| slug | category | titleEs |
|---|---|---|
| `empadronamiento` | registration | Empadronamiento |
| `nie` | documentation | NIE — Número de Identificación de Extranjero |
| `tie` | documentation | TIE — Tarjeta de Identidad de Extranjero |
| `seguridad-social` | registration | Número de Seguridad Social |
| `cuenta-bancaria` | banking | Abrir cuenta bancaria en España |
| `tarjeta-sanitaria` | health | Tarjeta Sanitaria (SIP/CIP) |
| `homologacion-titulos` | education | Homologación de Títulos Universitarios |
| `sepe-demandante` | work | SEPE — Registro como Demandante de Empleo |

---

## Migrations Workflow

```bash
# Initial setup
npx prisma migrate dev --name init

# After schema changes
npx prisma migrate dev --name <description>

# Production deploy
npx prisma migrate deploy

# Seed procedure guides
npx prisma db seed
```

---

## Indexes Rationale

| Index | Reason |
|---|---|
| `User.email` | Login lookup |
| `User.supabaseUserId` | Auth link lookup |
| `Roadmap.userId` | Dashboard query — load user roadmap |
| `Roadmap.status` | Filter active roadmaps |
| `RoadmapStep.roadmapId` | Load steps for a roadmap |
| `RoadmapStep.status` | Filter pending/done steps |
| `ChecklistItem.checklistId` | Load items for a checklist |
| `ChecklistItem.status` | Filter missing documents |
| `Reminder.userId` | Load user reminders |
| `Reminder.remindAt` | Cron job — find reminders due today |
| `Reminder.status` | Filter pending reminders |
| `Subscription.userId` | Check user subscription status |
| `Subscription.providerCustomerId` | Stripe webhook lookup |
| `ProcedureGuide.slug` | Guide lookup by slug |

---

## Key Design Decisions

1. **Bilingual fields in DB** — `titleAr` / `titleEs` stored as separate columns rather than a JSON blob. Simpler queries, no extra parsing layer.

2. **Roadmap is per-user not per-template** — Roadmap and steps are generated and persisted per user. This allows step status to be tracked independently per user.

3. **ProcedureGuide is standalone content** — Not linked via FK to steps (only by slug string). This allows guides to be updated without cascading changes to user roadmaps.

4. **Subscription is 1:N** — Allows historical records. Always query latest active subscription for access check.

5. **UserProfile.intakeStep** — Enables intake resumption. Stored as integer (current question index). Reset to 0 on completion.
