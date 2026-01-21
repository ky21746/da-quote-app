# CI Enforcement - Unit Test Gate

## Overview

This project enforces **mandatory unit tests** for all pricing-related changes through a CI pipeline that blocks merges if tests fail.

---

## What is Enforced

### ✅ **Mandatory Test Gate**
- **39 unit tests** protecting pricing logic
- **21 catalog pricing tests** - Core pricing calculation
- **18 final pricing tests** - Markup, commission, profit
- **4 golden regression tests** - Business truth

### 🚫 **Blocking Conditions**
The CI pipeline will **FAIL** and **BLOCK MERGE** if:
- Any unit test fails
- Test command exits with non-zero code
- Test coverage drops below expected

---

## When CI Runs

The CI pipeline runs automatically on:

### 1. **Pull Requests**
- Every PR to `main`, `develop`, or `master`
- Tests run before merge is allowed
- PR cannot be merged if tests fail

### 2. **Direct Pushes**
- Every push to `main`, `develop`, or `master`
- Ensures main branch always has passing tests
- Prevents broken code from entering production

---

## CI Workflow

```yaml
Trigger: PR or Push to main/develop
  ↓
Checkout code
  ↓
Setup Node.js 18.x
  ↓
Install dependencies (npm ci)
  ↓
Run unit tests (npm run test:unit)
  ↓
  ├─ ✅ All tests pass → Merge allowed
  └─ ❌ Any test fails → MERGE BLOCKED
```

---

## What This Protects

### **Catalog Pricing Engine**
- Per-person pricing calculations
- Per-night pricing calculations
- Fixed pricing calculations
- Hierarchical lodging (seasonal)
- Quantity calculations
- Edge cases

### **Final Pricing Calculator**
- Contingency (Unforeseen Costs)
- Local Agent Commission
- Profit Margin
- Compounding effect
- Final price per person

### **Golden Tests (Business Truth)**
- **Catalog Golden Tests:**
  - 5-day Bwindi safari: $6,730
  - Single-day hierarchical: $850
- **Final Pricing Golden Tests:**
  - Standard 10-5-20 model: $10,000 → $13,860
  - Conservative 5-10-15 model: $15,000 → $19,923.75

---

## Mandatory Rules (NON-NEGOTIABLE)

### 🔒 **Hard Rules**
1. **Unit tests are mandatory** for any pricing-related change
2. **Failing tests MUST block merges** - no exceptions
3. **Do NOT disable or skip tests** to make CI pass
4. **Do NOT weaken golden tests** to avoid failures
5. **Do NOT change pricing logic** just to "make tests pass" unless explicitly instructed

### ⚠️ **If Tests Fail**
1. **Identify the root cause** - Is this a bug or intentional change?
2. **Fix the code** - Not the tests
3. **If intentional change:**
   - Get explicit approval
   - Update golden test expectations
   - Document the change in commit message
4. **Re-run tests** - Verify fix works
5. **Only then merge**

---

## How to Run Tests Locally

Before pushing code, always run tests locally:

```bash
# Run all unit tests (no watch mode)
npm run test:unit

# Run tests in watch mode (during development)
npm test

# Run specific test file
npm test catalogPricingEngine.test.ts
```

---

## CI Configuration

**File:** `.github/workflows/ci.yml`

**Key Features:**
- Runs on Node.js 18.x
- Uses `npm ci` for clean install
- Runs `npm run test:unit` with CI=true
- Fails pipeline if any test fails
- Provides test summary in GitHub Actions UI

---

## Troubleshooting

### ❌ **CI Fails: "Tests Failed"**
**Solution:** Run `npm run test:unit` locally to see which tests failed. Fix the code, not the tests.

### ❌ **CI Fails: "npm ci failed"**
**Solution:** Check `package.json` for dependency issues. Run `npm install` locally to verify.

### ❌ **Golden Test Fails**
**Solution:** This is a **regression alarm**! Do NOT change the golden test unless:
1. You have explicit approval
2. The pricing change is intentional
3. You document the change

### ✅ **All Tests Pass Locally but Fail in CI**
**Possible causes:**
- Environment differences (Node version)
- Missing dependencies
- Non-deterministic tests (check for random values, dates)

---

## Benefits

### 🛡️ **Protection**
- Prevents pricing regressions
- Catches bugs before production
- Enforces business rules

### 📊 **Confidence**
- Safe to refactor
- Safe to add features
- Safe to change dependencies

### 🚀 **Speed**
- Fast feedback (< 1 second for all tests)
- No manual testing needed
- Automated quality gate

---

## Maintenance

### **Adding New Tests**
When adding new pricing features:
1. Write tests FIRST (TDD)
2. Ensure tests fail initially
3. Implement feature
4. Verify tests pass
5. Push - CI will validate

### **Updating Golden Tests**
Only update golden tests if:
1. Pricing change is intentional
2. You have explicit approval
3. You document the change
4. You update BOTH the test AND the documentation

---

## Summary

**The pricing system cannot regress silently.**

- ✅ Failing pricing test → Merge blocked
- ✅ Passing test suite → Merge allowed
- ✅ 39 tests protecting business logic
- ✅ Automatic enforcement on every PR
- ✅ No manual intervention needed

**This is enforcement, not advisory.**
