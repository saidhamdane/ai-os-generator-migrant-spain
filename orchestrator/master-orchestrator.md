# Master Orchestrator

## Goal
Coordinate the full project generation lifecycle from idea to launch-ready plan.

## Responsibilities
- Read project inputs
- Identify project category
- Select the right playbook
- Trigger the correct skills in the right order
- Enforce execution rules
- Standardize output quality

## Workflow
### Phase 1 — Understanding
Use:
- `skills/00-core/project-classifier.md`
- `skills/01-research/market-analysis.md`

Deliver:
- project type
- target user
- business problem
- market opportunity
- monetization direction

### Phase 2 — Product Definition
Use:
- `skills/02-product/mvp-definer.md`

Deliver:
- MVP scope
- included features
- excluded features
- success metric

### Phase 3 — Architecture
Use:
- `skills/03-architecture/system-architect.md`
- `skills/03-architecture/db-schema-designer.md`

Deliver:
- system architecture
- core entities
- data model
- integration map

### Phase 4 — Interface
Use:
- `skills/04-frontend/dashboard-ui-builder.md`

Deliver:
- dashboard sections
- main screens
- user flows
- UI priorities

### Phase 5 — Launch
Use:
- `skills/07-growth/launch-strategy.md`

Deliver:
- positioning
- launch channel strategy
- acquisition loop
- first revenue path

## Output Rule
Each phase must produce a standalone artifact that can be saved into `outputs/`.

## Routing Rule
Do not call skills randomly. Use only what is needed for the current project stage.
