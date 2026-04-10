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
