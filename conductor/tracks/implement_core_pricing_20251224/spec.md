# Track: Implement Core Pricing Logic

## Specification

This track focuses on implementing the core pricing logic within the `/core/services/PricingEngine.ts` as described in the `README.md`. The goal is to accurately calculate trip quotes based on various factors and apply the correct tax.

### Functionality

The `PricingEngine.calculate()` method should:

1.  **Process Per-Day Items:** Calculate costs for items that are charged per day.
2.  **Process Per-Person Items:** Calculate costs for items that are charged per person.
3.  **Process Accommodation:** Calculate lodging costs based on the number of nights and travelers.
4.  **Process Activities:** Calculate costs for activities, ensuring they match the selected trip activities.
5.  **Apply Tax:** Apply a 10% tax rate specific to Uganda to the subtotal.
6.  **Return Structured Calculation:** Output a `Calculation` entity containing `lineItems`, `subtotalAmount`, `taxesAmount`, and `totalAmount` with the correct currency.

### Dependencies

-   Relies on `Pricebook` and `Trip` entities from the `/core/domain/entities` layer.
-   Utilizes `Money` value object from `/core/domain/valueObjects` for currency-aware calculations.

### Acceptance Criteria

-   The `PricingEngine.calculate()` function correctly processes all specified pricing categories.
-   The 10% Uganda tax is accurately applied to the subtotal.
-   The returned `Calculation` object is correctly structured and contains accurate line items, subtotal, taxes, and total.
-   Unit tests are implemented for the `PricingEngine` to ensure calculation accuracy for various scenarios (e.g., zero travelers, multiple days, different activity combinations, tax application).
