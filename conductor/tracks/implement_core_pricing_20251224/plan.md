# Track Plan: Implement Core Pricing Logic

## Phase 1: Setup Pricing Engine and Basic Calculations

- [ ] Task: Create `PricingEngine` class and method structure
    - [ ] Task: Write failing tests for `PricingEngine.calculate()` with basic per-day and per-person items
    - [ ] Task: Implement `PricingEngine.calculate()` to pass basic per-day and per-person item tests
- [ ] Task: Integrate `Money` value object for currency-aware calculations
    - [ ] Task: Write failing tests for `Money` object integration
    - [ ] Task: Implement `Money` object integration to pass tests
- [ ] Task: Conductor - User Manual Verification 'Setup Pricing Engine and Basic Calculations' (Protocol in workflow.md)

## Phase 2: Accommodation and Activities Pricing

- [ ] Task: Implement accommodation pricing logic
    - [ ] Task: Write failing tests for accommodation pricing (nights × travelers)
    - [ ] Task: Implement accommodation pricing to pass tests
- [ ] Task: Implement activities pricing logic
    - [ ] Task: Write failing tests for activities pricing (matching trip activities)
    - [ ] Task: Implement activities pricing to pass tests
- [ ] Task: Conductor - User Manual Verification 'Accommodation and Activities Pricing' (Protocol in workflow.md)

## Phase 3: Tax Application and Final Calculation Structure

- [ ] Task: Apply 10% Uganda tax to subtotal
    - [ ] Task: Write failing tests for 10% tax application
    - [ ] Task: Implement 10% tax application to pass tests
- [ ] Task: Ensure `Calculation` entity is correctly structured with line items, subtotal, taxes, and total
    - [ ] Task: Write failing tests for `Calculation` entity structure
    - [ ] Task: Implement `Calculation` entity structure to pass tests
- [ ] Task: Conductor - User Manual Verification 'Tax Application and Final Calculation Structure' (Protocol in workflow.md)
