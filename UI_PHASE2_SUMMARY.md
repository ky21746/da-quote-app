# UI Phase 2 - Day Breakdown + Category Editor

## Overview

Extended UI layer with day-level structure editing and category selectors, while maintaining strict Core boundaries. All pricing calculations flow exclusively through `runPricingUsecase`.

## New Components

### Category Selectors (Reusable)

**Location**: `src/components/common/`

1. **LodgingSelector**
   - Displays accommodation options from pricebook
   - Returns selected `lodgingId` (string | undefined)
   - Filters by location if provided

2. **VehicleSelector**
   - Toggle checkbox for vehicle requirement
   - Returns `vehicleEnabled` (boolean)

3. **DomesticFlightSelector**
   - Displays domestic flight routes from pricebook
   - Returns selected `domesticFlightRouteId` (string | undefined)

4. **ParksSelector**
   - Multi-select checkbox list for parks & permits
   - Returns `parksIds` (string[])

5. **ActivitiesSelector**
   - Multi-select checkbox list for activities
   - Returns `activitiesIds` (string[])
   - Filters by location if provided

### Trip Days Editor Page

**Location**: `src/components/TripDays/TripDaysEditorPage.tsx`
**Route**: `/trip/:id/edit`

**Features**:
- Per-day structure editing (1..N days)
- Day title input (optional)
- All category selectors per day
- Saves days breakdown to context
- Calls `runPricingUsecase` on "Save & Calculate Price"

## Extended State Model

### TripContext Updates

**New State**:
- `daysBreakdown: DayDraft[]` - Array of day structures
- `setDaysBreakdown()` - Update entire days array
- `updateDay(dayNumber, updates)` - Update single day

### DayDraft Type

```typescript
interface DayDraft {
  dayNumber: number;
  title?: string;
  selections: {
    lodgingId?: string;
    vehicleEnabled?: boolean;
    domesticFlightRouteId?: string;
    parksIds: string[];
    activitiesIds: string[];
  };
}
```

**Important**: No prices in UI state - only structural IDs/flags.

## Updated Flow

### Complete User Journey

```
1. Trip Builder (/trip/new)
   ↓ User fills basic trip info
   ↓ Creates trip via useTripCreation
   ↓ Navigates to /trip/:id/edit

2. Trip Days Editor (/trip/:id/edit)
   ↓ User defines per-day structure
   ↓ Selects lodging, vehicle, flights, parks, activities
   ↓ Clicks "Save & Calculate Price"
   ↓ Calls usePricing → runPricingUsecase(tripId)
   ↓ Navigates to /trip/:id/summary

3. Trip Summary (/trip/:id/summary)
   ↓ Displays calculation result
   ↓ Shows breakdown by category
   ↓ Displays validation warnings
```

## Core Integration Verification

### Pricing Flow (Unchanged)

**Entry Point**: `runPricingUsecase(tripId, userId)`

**Path**:
```
UI → usePricing.calculateQuote()
  → runPricingUsecase() [Core]
    → CalculateTripQuoteUseCase.execute()
      → PricingEngine.calculate()
        → Returns CalculationResult
```

**No Direct Core Access**: UI only uses hooks/context.

### Catalog Access

**Hook**: `useCatalog(category)`
- Loads items from `pricebookRepository.getCurrent()` [Core]
- Returns `CatalogOption[]` for selectors
- No pricing logic in UI

## Validation Display

**Component**: `ValidationWarnings`
**Location**: `src/components/TripSummary/ValidationWarnings.tsx`

**Features**:
- Displays warnings from Core validators
- Read-only display
- Yellow warning styling
- Shows inline in Summary page

**Warning Types** (from Core):
- Missing lodging when required
- Empty day
- Inconsistent selections
- Pricebook validity issues

## Updated File Structure

```
src/
├── components/
│   ├── TripDays/                    # NEW
│   │   ├── TripDaysEditorPage.tsx
│   │   └── index.ts
│   ├── TripSummary/
│   │   ├── ValidationWarnings.tsx   # NEW
│   │   ├── TripSummaryPage.tsx
│   │   └── index.ts
│   └── common/
│       ├── ActivitiesSelector.tsx   # NEW
│       ├── DomesticFlightSelector.tsx # NEW
│       ├── LodgingSelector.tsx      # NEW
│       ├── ParksSelector.tsx        # NEW
│       ├── VehicleSelector.tsx      # NEW
│       └── [existing components]
├── hooks/
│   ├── useCatalog.ts                # NEW
│   ├── usePricing.ts                # (unchanged)
│   └── useTripCreation.ts           # (updated)
├── types/
│   ├── catalog.ts                   # NEW
│   └── ui.ts                        # (extended)
└── routes/
    └── AppRoutes.tsx                # (updated - added /trip/:id/edit)
```

## Routes

**New Route**: `/trip/:id/edit` → `TripDaysEditorPage`

**Complete Routes**:
- `/trip/new` → TripBuilderPage
- `/trip/:id/edit` → TripDaysEditorPage (NEW)
- `/trip/:id/summary` → TripSummaryPage
- `/` → Redirect to `/trip/new`

## Key Constraints Maintained

✅ **No pricing logic in UI** - All calculations via `runPricingUsecase`
✅ **No direct Firebase access** - Only through Core repositories
✅ **Structural data only** - IDs/flags, no prices in UI state
✅ **Core boundaries preserved** - UI communicates via hooks/context only
✅ **Mobile-first** - All components responsive
✅ **TypeScript strict** - Full type safety

## Visual Flow Description

### Trip Days Editor Screen

```
┌─────────────────────────┐
│ Trip Days Breakdown     │
│ Trip Name • 7 days      │
├─────────────────────────┤
│                         │
│ ┌─ Day 1 ────────────┐ │
│ │ Title: [Day 1]     │ │
│ │ Lodging: [Select ▼]│ │
│ │ ☐ Vehicle          │ │
│ │ Flight: [Select ▼] │ │
│ │ Parks:             │ │
│ │   ☑ Park A         │ │
│ │   ☐ Park B         │ │
│ │ Activities:        │ │
│ │   ☑ Safari         │ │
│ │   ☑ Tour           │ │
│ └─────────────────────┘ │
│                         │
│ [Repeat for Days 2-7]   │
│                         │
│ [Back] [Save & Calc]    │
└─────────────────────────┘
```

### Summary with Warnings

```
┌─────────────────────────┐
│ Trip Summary            │
├─────────────────────────┤
│ Total: USD 1,500        │
│ Per Person: USD 750     │
│                         │
│ Breakdown:              │
│ ┌─────────────────────┐ │
│ │ Accommodation $800  │ │
│ │ Activities    $500  │ │
│ └─────────────────────┘ │
│                         │
│ ⚠️ Validation Warnings  │
│ ┌─────────────────────┐ │
│ │ Missing lodging for │ │
│ │ Day 3              │ │
│ └─────────────────────┘ │
│                         │
│ [New Trip] [Back]       │
└─────────────────────────┘
```

## Next Steps (Not Implemented)

- Day-by-day price preview
- Edit existing trip days
- Bulk day operations
- Advanced filtering in selectors
- Price override inputs (future)

## Verification Checklist

- ✅ All pricing via `runPricingUsecase` only
- ✅ No direct Firebase calls from UI
- ✅ Catalog loaded from Core repositories
- ✅ Days breakdown stored in context
- ✅ Validation warnings displayed
- ✅ Mobile-responsive design
- ✅ TypeScript strict mode
- ✅ Core boundaries maintained




