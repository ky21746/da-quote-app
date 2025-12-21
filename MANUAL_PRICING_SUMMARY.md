# Manual Pricing Implementation Summary

## Overview

Replaced automated pricing flow with FULL MANUAL CONTROL. User decides EVERYTHING per line. No defaults, no assumptions, no hidden logic.

## Data Model

### LineItemDraft
**Location**: `src/types/ui.ts`

```typescript
interface LineItemDraft {
  id: string;
  category: string;
  description: string;
  pricingMode: 'PER_PERSON' | 'PER_UNIT';
  unitPrice: number;
  quantity: number; // Only for PER_UNIT
  participants: number; // From trip, NOT inferred
}
```

**Key Points**:
- NO tier-based assumptions
- NO automatic model selection
- User controls every field

## UI Components

### ManualPricingEditor
**Location**: `src/components/ManualPricing/ManualPricingEditor.tsx`

**Features**:
- Add line item (starts empty - NO defaults)
- Category selection (dropdown)
- Description (text input)
- Pricing Mode (radio):
  - Per Person
  - Fixed (Per Unit)
- Unit Price (number input)
- Quantity (only shown for PER_UNIT)
- Participants (read-only, from trip)

**Actions**:
- Add line
- Duplicate line
- Remove line

**Display** (read-only):
- Line total (calculated)
- Per-person cost (derived for display)

### ManualPricingPage
**Location**: `src/components/ManualPricing/ManualPricingPage.tsx`
**Route**: `/trip/:id/pricing`

**Features**:
- Full manual pricing editor
- Real-time grand total calculation
- Per-person total display
- Calculate & navigate to summary

## Calculation Engine

### ManualPricingEngine
**Location**: `src/core/services/ManualPricingEngine.ts`

**STRICT Rules**:
- Iterates LineItemDrafts ONLY
- PER_PERSON: `total = unitPrice * participants`
- PER_UNIT: `total = unitPrice * quantity`
- NEVER infers quantity
- NEVER infers pricing mode
- ONLY computes sums

**No Logic**:
- No tier selection
- No automatic model selection
- No pricebook lookup
- No inference
- Pure calculation only

## Updated Flow

### New User Journey

```
1. Trip Builder (/trip/new)
   ↓ User fills basic trip info
   ↓ Creates trip
   ↓ Navigates to /trip/:id/pricing

2. Manual Pricing (/trip/:id/pricing)
   ↓ User adds line items manually
   ↓ Each line: category, description, pricing mode, price
   ↓ User controls EVERYTHING
   ↓ Clicks "Calculate & View Summary"
   ↓ Navigates to /trip/:id/summary

3. Summary (/trip/:id/summary)
   ↓ Shows line-by-line breakdown
   ↓ Grand total
   ↓ Per-person total
```

## Updated Components

### TripBuilderPage
- Now navigates directly to `/trip/:id/pricing` (manual pricing)
- Removed automatic calculation flow

### TripDaysEditorPage
- Added "Manual Pricing" button
- Keeps existing flow for backward compatibility

### TripSummaryPage
- Updated breakdown display
- Shows line-by-line totals clearly
- No grouping unless explicit

## Removed Assumptions

### What Was Removed:
- ❌ Tier-based pricing (base/quality/premium)
- ❌ Automatic pricebook lookup
- ❌ Automatic model selection
- ❌ Inference of quantities
- ❌ Default values
- ❌ Hidden calculations

### What Remains:
- ✅ User-defined line items ONLY
- ✅ Explicit pricing mode selection
- ✅ Manual quantity/participants input
- ✅ Simple sum calculation
- ✅ Display-only per-person calculation

## Files Created/Updated

### New Files:
1. `src/core/services/ManualPricingEngine.ts` - Strict calculation engine
2. `src/core/usecases/CalculateManualPricing.ts` - Use case wrapper
3. `src/components/ManualPricing/ManualPricingEditor.tsx` - Line items editor
4. `src/components/ManualPricing/ManualPricingPage.tsx` - Full pricing page
5. `src/hooks/useManualPricing.ts` - React hook

### Updated Files:
1. `src/types/ui.ts` - Added LineItemDraft, PricingMode
2. `src/routes/AppRoutes.tsx` - Added `/trip/:id/pricing` route
3. `src/components/TripBuilder/TripBuilderPage.tsx` - Navigate to manual pricing
4. `src/components/TripSummary/TripSummaryPage.tsx` - Updated breakdown display

## Verification

### User Control Checklist:
- ✅ User decides category per line
- ✅ User decides description per line
- ✅ User decides pricing mode per line
- ✅ User decides unit price per line
- ✅ User decides quantity (for PER_UNIT)
- ✅ Participants passed from trip (NOT inferred)
- ✅ Engine ONLY sums
- ✅ NO defaults
- ✅ NO assumptions
- ✅ NO hidden logic

## Key Constraints Maintained

- ✅ **NO pricing logic in UI** - Calculation in Core only
- ✅ **NO automatic assumptions** - User controls everything
- ✅ **NO defaults** - All fields start empty
- ✅ **NO inference** - Engine only computes sums
- ✅ **Mobile-first** - Responsive design
- ✅ **TypeScript strict** - Full type safety




