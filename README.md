# DA Quote App - Architecture Documentation

## Overview

This is a trip pricing application built with Clean Architecture principles, designed for Uganda-first travel quotes. The architecture is modular, testable, and UI-agnostic.

## Architecture Layers

### `/core` - Business Logic Layer
Pure business logic with no external dependencies.

- **`/domain`**: Core entities, value objects, enums, and repository interfaces
- **`/usecases`**: Application use cases (orchestration layer)
- **`/services`**: Pure calculation services (PricingEngine)
- **`/validators`**: Validation logic
- **`/mappers`**: Data transformation between domain and persistence

### `/data` - Data Access Layer
Firebase-specific implementations.

- **`/firebase`**: Repository implementations for Firestore
- **`/seed`**: Data seeding utilities (if needed)

### `/app` - Application Layer
Application configuration and infrastructure.

- **`/config`**: Dependency injection and use case initialization
- **`/auth`**: Authentication service
- **`/security`**: Firestore security rules

## Entry Points

### Main Pricing Entry Point

```typescript
import { runPricingUsecase } from './core/usecases';

const result = await runPricingUsecase(tripId, userId);
// result.calculation - The calculated quote
// result.validationWarnings - Any warnings from validation
```

### Use Cases (via dependencies)

```typescript
import { calculateTripQuoteUseCase, saveCalculationUseCase } from './app';

// Calculate quote
const result = await calculateTripQuoteUseCase.execute({ tripId, userId });

// Save calculation
await saveCalculationUseCase.execute({ calculation });
```

## Core Interfaces

### Repository Interfaces

- **`PricebookRepository`**: Access to pricing data
- **`TripRepository`**: Trip CRUD operations
- **`CalculationRepository`**: Calculation persistence

### Domain Entities

- **`Trip`**: Trip entity with days, dates, travelers
- **`Pricebook`**: Pricing catalog with items
- **`Calculation`**: Calculated quote with line items
- **`Day`**: Individual day in a trip

### Value Objects

- **`Money`**: Currency-aware money value
- **`DateRange`**: Date range with validation

## Flow: End-to-End

### 1. User Creates/Updates Trip
```
UI → TripRepository.save(trip)
```

### 2. User Requests Quote
```
UI → runPricingUsecase(tripId, userId)
  → CalculateTripQuoteUseCase.execute()
    → TripRepository.getById() [Load Trip]
    → TripValidator.validateAll() [Validate]
    → PricebookRepository.getCurrent() [Load Pricebook]
    → PricingValidator.validateConsistency() [Validate]
    → PricingEngine.calculate() [Calculate]
    → CalculationRepository.save() [Save snapshot]
  → Return Calculation + Warnings
```

### 3. Calculation Process
- PricingEngine calculates:
  - Per-day items
  - Per-person items
  - Accommodation (nights × travelers)
  - Activities (matching trip activities)
- Applies 10% tax (Uganda)
- Returns structured Calculation with line items

## Validation Strategy

### Trip Validation
- **Completeness**: Required fields, minimum travelers, at least one day
- **Day Selections**: Dates within range, no gaps (warnings)

### Pricing Validation
- **Consistency**: Pricebook validity, location matching (warnings)

Validation returns errors (blocking) and warnings (non-blocking).

## Security

### Authentication
- Email/Password or Anonymous authentication
- User ID required for all trip operations

### Firestore Rules
- Trips: Users can only access their own trips
- Calculations: Authenticated users can read/write
- Pricebooks: Read-only for authenticated users

Rules file: `src/app/security/firestore.rules`

## Data Structure

### Collections

**trips**
```
{
  id: string
  userId: string
  status: TripStatus
  destination: string
  startDate: ISO string
  endDate: ISO string
  travelers: number
  days: Day[]
  createdAt: ISO string
  updatedAt: ISO string
  metadata: object
}
```

**pricebooks**
```
{
  id: string
  version: PricebookVersion
  items: PricebookItem[]
  effectiveFrom: ISO string
  effectiveTo?: ISO string
  createdAt: ISO string
  updatedAt: ISO string
}
```

**calculations**
```
{
  id: string
  tripId: string
  pricebookVersion: string
  lineItems: CalculationLineItem[]
  subtotalAmount: number
  subtotalCurrency: string
  taxesAmount: number
  taxesCurrency: string
  totalAmount: number
  totalCurrency: string
  calculatedAt: ISO string
  metadata: object
}
```

## Usage Example (Future UI Integration)

```typescript
import { runPricingUsecase } from './core/usecases';
import { authService } from './app';

// 1. Authenticate
await authService.signInWithEmail(email, password);
const userId = authService.getUserId();

// 2. Calculate quote
const result = await runPricingUsecase(tripId, userId);

// 3. Display result
console.log('Total:', result.calculation.total.toString());
console.log('Warnings:', result.validationWarnings);
```

## Next Steps (UI Layer)

When building UI:
1. Import `runPricingUsecase` from `./core/usecases`
2. Use `authService` from `./app` for authentication
3. Use repository interfaces via `./app/config/dependencies` for CRUD
4. All business logic is encapsulated in Core layer

## GitHub Setup

### Initial Setup

1. Clone the repository (if not already cloned)
2. Copy `.env.example` to `.env.local` and fill in your Firebase credentials
3. Install dependencies: `npm install` (when package.json is added)
4. Deploy Firestore rules: `firebase deploy --only firestore:rules`

### Commit Convention

**MANDATORY**: All commits must follow this format:

```
YYYY-MM-DD HH:MM | <scope>: <description>
```

Examples:
- `2025-12-17 14:42 | core: pricing engine architecture baseline`
- `2025-12-17 15:10 | infra: firebase initialization via env`

### Branch Strategy

- `main`: Stable, production-ready code
- `dev`: Development branch for active work
- No WIP commits on `main`

### Connecting to GitHub

1. Create a new repository on GitHub (do not initialize with README)
2. Add remote: `git remote add origin <your-repo-url>`
3. Push: `git push -u origin main`
4. Create dev branch: `git checkout -b dev && git push -u origin dev`

## CI Enforcement

### 🔒 **Mandatory Unit Test Gate**


This project enforces **mandatory unit tests** for all pricing-related changes:

- **39 unit tests** protecting pricing logic
- **CI pipeline** runs on every PR and push to main/develop
- **Failing tests block merges** - no exceptions

**Quick Start:**
```bash
# Run tests locally before pushing
npm run test:unit
```

**Documentation:**
- Full testing guide: [`TESTING.md`](./TESTING.md)
- CI enforcement details: [`CI_ENFORCEMENT.md`](./CI_ENFORCEMENT.md)

**Rules:**
- ✅ All tests pass → Merge allowed
- ❌ Any test fails → Merge blocked
- 🚫 Do NOT disable tests to make CI pass
- 🚫 Do NOT weaken golden tests

---

## Notes

- **Internal System**: This is an internal application, not for public distribution
- No UI code in this architecture
- No PDF generation
- No AI integration
- Pure TypeScript, production-ready
- Firebase initialized via environment variables (see `.env.example`)

