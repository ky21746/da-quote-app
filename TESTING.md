# Unit Testing Documentation

## Overview

This project includes a comprehensive unit test suite for the pricing engine, which is the core business logic that calculates trip costs from the pricing catalog.

## Running Tests

### Run All Unit Tests
```bash
npm run test:unit
```

This will run all tests in `__tests__` directories and exit (no watch mode).

### Run Tests in Watch Mode
```bash
npm test
```

This will run tests in interactive watch mode (useful during development).

## Test Coverage

The test suite includes **21 unit tests** covering the following scenarios:

### 1. Per-Person Pricing (3 tests)
- `per_person`: basePrice × travelers
- `per_person_per_day`: basePrice × travelers × days
- Edge case: 0 travelers

### 2. Per-Night Pricing (2 tests)
- `per_night_per_person`: basePrice × nights × travelers
- `per_night`: basePrice × nights (fixed room price)

### 3. Fixed Pricing (2 tests)
- `fixed_group`: basePrice (one-time fee)
- `fixed_per_day`: basePrice × parkNights (vehicle rental)

### 4. Hierarchical Lodging (3 tests)
- `perPerson` pricing with seasonal selection
- `perRoom` pricing with seasonal selection
- Missing configuration fallback

### 5. Quantity Calculations (3 tests)
- `itemQuantities` override mechanism
- Activity quantity multiplication
- Invalid quantity defaults to 1

### 6. Edge Cases (4 tests)
- Empty pricing catalog
- Trip with no days
- Excluded park fees (appear with $0)
- Free-hand line items

### 7. Mixed Basket Totals (2 tests)
- Multiple item types in single day
- Multi-day trips with different items per day

### 8. Golden Regression Tests (2 tests)
- **5-day Bwindi safari**: Full realistic trip with known total ($6,730)
- **Single-day hierarchical lodging**: Luxury getaway with seasonal pricing ($850)

## Test Structure

### Fixtures (`fixtures.ts`)
Test fixtures provide builder functions for creating test data:
- `createTripDraft()` - Create a trip with sensible defaults
- `createTripDay()` - Create a single day in a trip
- `createPricingItem()` - Create a catalog item
- Specialized builders for each cost type

### Test File (`catalogPricingEngine.test.ts`)
Tests are organized by scenario using Jest's `describe` blocks and follow the **Given/When/Then** pattern:

```typescript
test('GIVEN per_person item WHEN calculating THEN total equals basePrice × travelers', () => {
  // Arrange
  const item = createPerPersonItem(50, 'Park Entry Fee');
  const trip = createTripDraft({ travelers: 4 });
  
  // Act
  const result = calculatePricingFromCatalog(trip, [item]);
  
  // Assert
  expect(result.totals.grandTotal).toBe(200); // 50 × 4
});
```

## What is NOT Tested

The following are intentionally excluded from this test suite:
- **Markup calculations** (not part of core pricing engine)
- **Manual line items** (handled separately)
- **UI components** (React components are not unit tested here)
- **Firebase/Firestore** (no network calls in unit tests)

## Test Principles

1. **Deterministic**: All tests produce the same result every time
2. **Isolated**: No dependencies on external services or databases
3. **Fast**: All 21 tests run in < 1 second
4. **Focused**: Tests only the pricing engine business logic

## Continuous Integration

These tests should be run:
- Before every commit
- In CI/CD pipeline before deployment
- After any changes to pricing logic

## Regression Protection

The golden tests serve as regression guards. If you intentionally change pricing logic:
1. Run tests - they should fail
2. Update the expected values in the golden tests
3. Document the change in git commit message

## Adding New Tests

When adding new pricing features:
1. Add fixtures in `fixtures.ts` if needed
2. Add test cases in `catalogPricingEngine.test.ts`
3. Follow the Given/When/Then naming pattern
4. Ensure tests are deterministic (no random values, no real dates)
5. Run `npm run test:unit` to verify

## Dependencies

- **Jest**: Test runner (included with react-scripts)
- **@types/jest**: TypeScript definitions for Jest
- **react-scripts**: Provides Jest configuration

No additional test libraries are required.
