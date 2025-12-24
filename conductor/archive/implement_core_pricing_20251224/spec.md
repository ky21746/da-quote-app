# Track: Stabilize TripDay Selection Flow (Park switch + Park Fees + Activities)

## Specification

This track focuses on **state correctness and determinism** in the Trip Day selection flow, specifically around:

1. Park switching behavior
2. Auto-added Park Fees persistence and isolation
3. Activities selection not impacting Park Fees

### Hard Constraints (MUST NOT)

- **NO pricing engine changes**
- **NO taxes changes**
- **NO validator changes**
- **NO refactors** (only minimal, targeted fixes)

### Functionality

The Trip Day selection flow must ensure:

1. **Park switch replaces auto Park Fees**
   - On `parkId` change for a Trip Day:
     - Remove all `parkFees` where `source === 'auto'` (previous park)
     - Add auto fees for the new park
     - Do **not** modify user-selected `activities`, `lodging`, or `logistics`

2. **Activities updates do not touch Park Fees**
   - Selecting/deselecting activities must **never** remove/exclude/toggle/override any Park Fee
   - Park Fee exclusion is allowed **only** via explicit user checkbox

3. **Deterministic & idempotent state updates**
   - Re-applying the same selection must not create duplicates
   - Partial updates must not accidentally overwrite unrelated fields

### Dependencies

- Trip Day UI and state update path (e.g., TripDayCard / TripContext updateTripDay)
- Pricing catalog items for identifying Park Fees by `category`, `parkId`, `active`

### Acceptance Criteria

- Switching parks always results in only the correct park's Park Fees being present
- Selecting/deselecting activities never affects Park Fees
- `npm run build` passes
- No regressions in Pricing or Summary
