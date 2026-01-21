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

The test suite includes **39 unit tests** covering two main areas:

### A. Catalog Pricing Engine (21 tests)
Tests the core pricing calculation from the catalog.

### B. Final Pricing Calculator (18 tests)
Tests the final client price including markup, commissions, and profit.

---

## A. Catalog Pricing Engine Tests (21 tests)

These tests cover the following scenarios:

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

### Test Files
1. **`catalogPricingEngine.test.ts`** - Tests catalog pricing calculation (21 tests)
2. **`finalPricingCalculator.test.ts`** - Tests final pricing with adjustments (18 tests)

### Fixtures (`fixtures.ts`)
Test fixtures provide builder functions for creating test data:
- `createTripDraft()` - Create a trip with sensible defaults
- `createTripDay()` - Create a single day in a trip
- `createPricingItem()` - Create a catalog item
- Specialized builders for each cost type

### Test Pattern
All tests follow the **Given/When/Then** pattern:

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

---

## B. Final Pricing Calculator Tests (18 tests)

### 1. Contingency (Unforeseen Costs) - 3 tests
- 10% contingency adds correctly to base total
- 0% contingency adds nothing
- 15% contingency calculates correctly

### 2. Local Agent Commission - 3 tests
- 5% commission applies to subtotal after contingency
- 0% commission adds nothing
- 10% commission without contingency applies to base

### 3. Profit Margin - 3 tests
- 20% profit applies to subtotal after commission
- 0% profit adds nothing
- 25% profit without other adjustments applies to base

### 4. Compounding Effect - 2 tests
- All percentages compound correctly
- Different percentages compound on previous layers

### 5. Final Price Per Person - 3 tests
- Divides final total by travelers correctly
- Handles 0 travelers (returns 0)
- Single traveler equals final total

### 6. Edge Cases - 2 tests
- All percentages at 0 returns base total
- Base total of 0 returns 0 for everything

### 7. Golden Regression Tests - 2 tests
- **Standard 10-5-20 model**: $10,000 base → $13,860 final
- **Conservative 5-10-15 model**: $15,000 base → $19,923.75 final

---

## Pricing Formula

The final pricing follows this compounding formula:

```
1. Base Total (from catalog)
2. + Contingency (unexpectedPercentage% of Base)
3. = Subtotal After Contingency
4. + Local Agent Commission (localAgentCommissionPercentage% of Subtotal)
5. = Subtotal After Commission
6. + Profit Margin (myProfitPercentage% of Subtotal)
7. = Final Total
8. ÷ Travelers = Final Price Per Person
```

**Important:** Each percentage compounds on the previous subtotal, not on the base total.

---

## What is NOT Tested

The following are intentionally excluded from this test suite:
- **Manual line items** (to be added in future)
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

### Catalog Pricing Golden Tests:
- **5-day Bwindi safari**: $6,730
- **Single-day hierarchical lodging**: $850

### Final Pricing Golden Tests:
- **Standard 10-5-20 model**: $10,000 → $13,860
- **Conservative 5-10-15 model**: $15,000 → $19,923.75

If you intentionally change pricing logic:
1. Run tests - they should fail
2. Update the expected values in the golden tests
3. Document the change in git commit message

**Critical:** Changing any percentage (contingency, commission, profit) MUST break at least one test.

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
