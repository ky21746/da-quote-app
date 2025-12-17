# UI Phase 3 - Pricing Insight + Scenario Comparison

## Overview

Extended UI layer with pricing insights and scenario comparison (Base/Quality/Premium) while maintaining strict Core boundaries. All calculations flow exclusively through `runPricingUsecase`.

## New Components

### PricingScenarioComparison
**Location**: `src/components/TripSummary/PricingScenarioComparison.tsx`

**Purpose**: Compare pricing across three tiers (Base/Quality/Premium)

**Behavior**:
- Displays three stacked cards (mobile-first)
- Each card shows:
  - Total cost
  - Price per person
  - Markup amount (if applicable)
  - Top 3 cost categories by contribution

**Data Source**: `scenarioResults` from `TripContext`

### CostParetoPanel
**Location**: `src/components/TripSummary/CostParetoPanel.tsx`

**Purpose**: Expose 80/20 cost drivers (Pareto principle)

**Display**:
- Categories sorted by cost descending
- Percentage of total per category
- Visual emphasis (font weight/color) for top contributors
- Progress bars for visual representation
- Text-first insight (no charts library)

**Features**:
- Highlights top contributors (80% rule)
- Shows cumulative percentage
- Mobile-responsive layout

## Updated Components

### TripSummaryPage
**Location**: `src/components/TripSummary/TripSummaryPage.tsx`

**New Features**:
- Toggle button: "Compare Scenarios"
- When enabled:
  - Renders `PricingScenarioComparison`
  - Renders `CostParetoPanel` for selected scenario
- Default: Shows selected tier summary with Pareto panel

**Behavior**:
- Comparison calculations triggered on toggle
- Sequential calls to `runPricingUsecase` (3 times)
- Loading states during calculation
- Error handling for failed scenarios

## Extended State Model

### TripContext Updates

**New State**:
```typescript
scenarioResults: ScenarioResults = {
  base: CalculationResult | null,
  quality: CalculationResult | null,
  premium: CalculationResult | null
}
```

**New Methods**:
- `setScenarioResults(results)` - Update scenario results

### ScenarioResults Type

```typescript
interface ScenarioResults {
  base: CalculationResult | null;
  quality: CalculationResult | null;
  premium: CalculationResult | null;
}
```

## New Hook

### useScenarioComparison
**Location**: `src/hooks/useScenarioComparison.ts`

**Purpose**: Calculate scenarios for all three tiers

**Behavior**:
- Calls `runPricingUsecase` THREE TIMES sequentially
- Each call:
  1. Updates trip tier temporarily
  2. Calls `runPricingUsecase(tripId, userId)`
  3. Stores result
  4. Restores original tier

**Returns**:
- `calculateScenarios(tripId, draft)` - Calculate all scenarios
- `isCalculating` - Loading state
- `error` - Error message if failed

**Important**: All pricing calculations go through `runPricingUsecase` only.

## Core Integration Verification

### Pricing Flow (Unchanged)

**Entry Point**: `runPricingUsecase(tripId, userId)` ONLY

**Path for Scenarios**:
```
UI → useScenarioComparison.calculateScenarios()
  → For each tier (base/quality/premium):
    → Update trip tier temporarily
    → runPricingUsecase(tripId, userId) [Core]
      → CalculateTripQuoteUseCase.execute()
        → PricingEngine.calculate()
          → Returns CalculationResult
    → Restore original tier
  → Returns ScenarioResults
```

**No Direct Core Access**: UI only uses hooks/context.

**No Pricing Logic in UI**: All calculations in Core.

## Updated File Structure

```
src/
├── components/
│   └── TripSummary/
│       ├── CostParetoPanel.tsx          # NEW
│       ├── PricingScenarioComparison.tsx # NEW
│       ├── TripSummaryPage.tsx          # UPDATED
│       ├── ValidationWarnings.tsx
│       └── index.ts
├── hooks/
│   ├── useScenarioComparison.ts        # NEW
│   ├── usePricing.ts
│   └── useTripCreation.ts
├── context/
│   └── TripContext.tsx                  # UPDATED (scenarioResults)
└── types/
    └── ui.ts                            # UPDATED (ScenarioResults)
```

## Visual Flow Description

### Summary Page (Default View)

```
┌─────────────────────────┐
│ Trip Summary           │
├─────────────────────────┤
│ Total: USD 1,500       │
│ Per Person: USD 750     │
│                         │
│ Breakdown by Category  │
│ ┌─────────────────────┐ │
│ │ Accommodation $800  │ │
│ │ Activities    $500  │ │
│ └─────────────────────┘ │
│                         │
│ Cost Breakdown (Pareto)│
│ ┌─────────────────────┐ │
│ │ Accommodation 53%   │ │
│ │ Activities    33%   │ │
│ └─────────────────────┘ │
│                         │
│ [Compare Scenarios]     │
│                         │
│ [New Trip] [Back]       │
└─────────────────────────┘
```

### Summary Page (Comparison View)

```
┌─────────────────────────┐
│ Trip Summary           │
├─────────────────────────┤
│ [Hide Comparison]      │
│                         │
│ Scenario Comparison    │
│ ┌─────────────────────┐ │
│ │ Base               │ │
│ │ Total: USD 1,200   │ │
│ │ Per Person: $600   │ │
│ │ Top: Acc, Act, Veh │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Quality            │ │
│ │ Total: USD 1,500   │ │
│ │ Per Person: $750    │ │
│ │ Top: Acc, Act, Veh │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Premium            │ │
│ │ Total: USD 2,000   │ │
│ │ Per Person: $1,000  │ │
│ │ Top: Acc, Act, Veh │ │
│ └─────────────────────┘ │
│                         │
│ Cost Breakdown (Pareto)│
│ [Shown for Base tier]   │
│                         │
│ [New Trip] [Back]       │
└─────────────────────────┘
```

## Key Constraints Maintained

✅ **All pricing via `runPricingUsecase` only** - 3 sequential calls
✅ **No pricing logic in UI** - All calculations in Core
✅ **No direct Firebase access** - Only through Core repositories
✅ **Read-only results** - UI never mutates calculations
✅ **Mobile-first** - All components responsive
✅ **Text-first insights** - No charts library, text-based Pareto
✅ **Core boundaries preserved** - No Core modifications

## Calculation Flow Verification

### Scenario Comparison Flow

1. User clicks "Compare Scenarios"
2. `useScenarioComparison.calculateScenarios()` called
3. For each tier (base → quality → premium):
   - Update trip tier temporarily via `tripRepository.update()`
   - Call `runPricingUsecase(tripId, userId)` [Core]
   - Store result in `scenarioResults`
   - Restore original tier
4. Display results in `PricingScenarioComparison`
5. Display Pareto for selected scenario

**Total Calls to `runPricingUsecase`**: 3 (one per tier)

## Next Steps (Not Implemented)

- Caching scenario results
- Parallel calculation (currently sequential)
- Export comparison to PDF/Excel
- AI recommendations based on scenarios
- Scenario selection for final quote
- Historical scenario comparison

## Verification Checklist

- ✅ All scenario calculations via `runPricingUsecase` only
- ✅ No pricing logic in UI components
- ✅ Sequential calculation (no parallel optimization)
- ✅ Original trip tier restored after comparison
- ✅ Pareto panel shows 80/20 insight
- ✅ Mobile-responsive design
- ✅ TypeScript strict mode
- ✅ Core boundaries maintained
- ✅ No Core code modifications

