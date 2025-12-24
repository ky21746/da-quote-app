# Track Plan: Stabilize TripDay Selection Flow (Park switch + Park Fees + Activities)

## Phase 1: Reproduce and Lock Down State Correctness [checkpoint: 68f9b8e]

- [x] Task: Add minimal regression checks for Trip Day state updates
   - [x] Task: Write a minimal test (or lightweight check) ensuring partial updates do not overwrite unrelated TripDay fields (e.g., updating activities does not clear parkFees) [a4c59bb]
   - [x] Task: Ensure updateTripDay merges updates deterministically (idempotent) [b2e0068]
- [ ] Task: Conductor - User Manual Verification 'TripDay State Correctness' (Protocol in workflow.md)

## Phase 2: Park Switch and Park Fees Isolation

- [ ] Task: Ensure park switch replaces auto-added Park Fees
   - [ ] Task: On TripDay parkId change, remove all parkFees where source === 'auto' then inject active fees for the new park (no duplicates)
   - [ ] Task: Confirm park switch does not modify lodging/logistics/activities selections
- [ ] Task: Conductor - User Manual Verification 'Park Switch + Park Fees' (Protocol in workflow.md)

## Phase 3: Activities Independence + Build Verification

- [ ] Task: Ensure activities selection never affects parkFees
   - [ ] Task: Verify that selecting/deselecting activities does not remove/exclude/toggle any parkFee
   - [ ] Task: Verify parkFee exclusion is only via explicit checkbox
- [ ] Task: Run `npm run build` and verify Pricing/Summary no regression
- [ ] Task: Conductor - User Manual Verification 'Activities Independence + Build' (Protocol in workflow.md)
