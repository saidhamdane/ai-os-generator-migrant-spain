# Skill: DB Schema Designer

## Goal
Design the core entities and relationships required for the MVP.

## When To Use
After system architecture is defined.

## Inputs
- MVP definition
- architecture output

## Steps
1. Extract the key nouns from the workflow.
2. Turn them into entities.
3. Define required fields.
4. Define relationships.
5. Mark lifecycle/status fields where needed.
6. Keep the schema minimal but extensible.

## Output
- entity list
- field list per entity
- relationships
- status fields
- notes for Prisma/Postgres implementation

## Constraints
- Do not overdesign audit tables unless needed.
- Avoid premature normalization.
- Every entity must support a real user workflow.

## Success Criteria
The schema supports the MVP cleanly and can be implemented directly in Prisma.
