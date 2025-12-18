# UI Architecture Documentation

## Overview

Mobile-first React UI layer built on top of the Core architecture. The UI communicates exclusively through `runPricingUsecase` and does not contain any pricing logic.

## Directory Structure

```
src/
├── components/
│   ├── TripBuilder/          # Trip builder page component
│   ├── TripSummary/          # Summary page component
│   └── common/               # Reusable UI components
├── context/
│   └── TripContext.tsx       # Global state management
├── hooks/
│   ├── usePricing.ts         # Pricing calculation hook
│   └── useTripCreation.ts   # Trip creation hook
├── pages/                    # Page wrappers
├── routes/
│   └── AppRoutes.tsx         # React Router configuration
└── types/
    └── ui.ts                 # UI-specific TypeScript types
```

## Components

### TripBuilderPage
**Location**: `src/components/TripBuilder/TripBuilderPage.tsx`

**Features**:
- Trip name input
- Number of travelers
- Number of days
- Tier selection (Base / Quality / Premium)
- Markup configuration (type: percent/fixed, value)
- Submit button: "Calculate Price"

**Flow**:
1. User fills form
2. On submit: Creates trip via `useTripCreation`
3. Calculates quote via `usePricing` → `runPricingUsecase`
4. Navigates to `/trip/:id/summary`

### TripSummaryPage
**Location**: `src/components/TripSummary/TripSummaryPage.tsx`

**Features**:
- Total cost display
- Price per person
- Breakdown by categories
- Line items per category
- Markup display (if applied)
- Validation warnings display

**Data Source**: `calculationResult` from `TripContext`

## State Management

### TripContext
**Location**: `src/context/TripContext.tsx`

**State**:
- `draft: TripDraft | null` - Current trip draft
- `calculationResult: CalculationResult | null` - Latest calculation result

**Methods**:
- `setDraft()` - Update draft
- `setCalculationResult()` - Update calculation result
- `clearDraft()` - Clear draft

## Hooks

### usePricing
**Location**: `src/hooks/usePricing.ts`

**Purpose**: Calculate trip quote via Core

**Returns**:
- `calculateQuote(tripId)` - Calculate and return result
- `isCalculating` - Loading state
- `error` - Error message if failed

**Implementation**: Calls `runPricingUsecase(tripId, userId)`

### useTripCreation
**Location**: `src/hooks/useTripCreation.ts`

**Purpose**: Create trip entity in backend

**Returns**:
- `createTrip(draft)` - Create trip and return ID
- `isCreating` - Loading state
- `error` - Error message if failed

**Implementation**: Uses `tripRepository.save()` from Core

## Routing

**Routes**:
- `/trip/new` → TripBuilderPage
- `/trip/:id/summary` → TripSummaryPage
- `/` → Redirects to `/trip/new`

**Implementation**: React Router v6

## Data Flow

### Trip Creation & Calculation Flow

```
User Input (TripBuilderPage)
  ↓
useTripCreation.createTrip()
  ↓
tripRepository.save() [Core]
  ↓
usePricing.calculateQuote()
  ↓
runPricingUsecase() [Core]
  ↓
CalculateTripQuoteUseCase.execute()
  ↓
PricingEngine.calculate()
  ↓
CalculationResult → TripContext
  ↓
Navigate to Summary Page
  ↓
Display Result (TripSummaryPage)
```

## Styling

- **Framework**: Tailwind CSS
- **Approach**: Mobile-first responsive design
- **No heavy animations**: Minimal, functional UI
- **No custom design system**: Uses Tailwind utilities

## Integration Points

### Core Integration
- **Single Entry Point**: `runPricingUsecase()` from `src/core/usecases`
- **No Direct Core Access**: UI only uses hooks/context
- **Repository Access**: Only via `useTripCreation` hook

### Firebase Integration
- **Authentication**: `authService` from `src/app/auth`
- **Data Access**: Through Core repositories only

## Type Definitions

**Location**: `src/types/ui.ts`

**Types**:
- `TripDraft` - Form data structure
- `TripTier` - Base / Quality / Premium
- `MarkupType` - Percent / Fixed
- `CalculationResult` - Display-ready calculation data
- `CategoryBreakdown` - Category grouping
- `LineItemDisplay` - Line item for display

## Entry Point

**Main App**: `src/App.tsx`
- Wraps app with `TripProvider`
- Renders `AppRoutes`

**Index**: `src/index.tsx`
- React DOM root
- Renders `App` component

## Next Steps (Not Implemented)

- Day-by-day trip builder
- Trip editing
- Trip list/history
- Authentication UI
- Error boundaries
- Loading states (skeleton screens)

## Notes

- **No PDF generation**: Not in scope
- **No AI integration**: Not in scope
- **Mobile-first**: All components designed for mobile screens
- **Production-ready**: TypeScript, error handling, loading states


