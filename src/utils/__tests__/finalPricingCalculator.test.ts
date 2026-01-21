/**
 * Unit Tests for Final Pricing Calculator
 * Tests the business logic for calculating final client price including:
 * - Contingency (Unforeseen Costs)
 * - Local Agent Commission
 * - Profit Margin
 * 
 * These tests protect the final pricing layers above the catalog pricing engine.
 */

import { calculateFinalPricing, FinalPricingInput } from '../finalPricingCalculator';

describe('finalPricingCalculator', () => {
  describe('Contingency (Unforeseen Costs)', () => {
    test('GIVEN 10% contingency WHEN calculating THEN adds 10% to base total', () => {
      const input: FinalPricingInput = {
        baseTotal: 10000,
        unexpectedPercentage: 10,
        localAgentCommissionPercentage: 0,
        myProfitPercentage: 0,
        travelers: 4,
      };

      const result = calculateFinalPricing(input);

      expect(result.unexpectedAmount).toBe(1000); // 10% of 10000
      expect(result.subtotalAfterUnexpected).toBe(11000);
      expect(result.finalTotal).toBe(11000);
    });

    test('GIVEN 0% contingency WHEN calculating THEN no contingency added', () => {
      const input: FinalPricingInput = {
        baseTotal: 5000,
        unexpectedPercentage: 0,
        localAgentCommissionPercentage: 0,
        myProfitPercentage: 0,
        travelers: 2,
      };

      const result = calculateFinalPricing(input);

      expect(result.unexpectedAmount).toBe(0);
      expect(result.subtotalAfterUnexpected).toBe(5000);
    });

    test('GIVEN 15% contingency WHEN calculating THEN adds 15% correctly', () => {
      const input: FinalPricingInput = {
        baseTotal: 8000,
        unexpectedPercentage: 15,
        localAgentCommissionPercentage: 0,
        myProfitPercentage: 0,
        travelers: 3,
      };

      const result = calculateFinalPricing(input);

      expect(result.unexpectedAmount).toBe(1200); // 15% of 8000
      expect(result.subtotalAfterUnexpected).toBe(9200);
    });
  });

  describe('Local Agent Commission', () => {
    test('GIVEN 5% commission WHEN calculating THEN applies to subtotal after contingency', () => {
      const input: FinalPricingInput = {
        baseTotal: 10000,
        unexpectedPercentage: 10, // +1000 = 11000
        localAgentCommissionPercentage: 5,
        myProfitPercentage: 0,
        travelers: 4,
      };

      const result = calculateFinalPricing(input);

      expect(result.subtotalAfterUnexpected).toBe(11000);
      expect(result.localAgentCommissionAmount).toBe(550); // 5% of 11000
      expect(result.subtotalAfterLocalAgent).toBe(11550);
      expect(result.finalTotal).toBe(11550);
    });

    test('GIVEN 0% commission WHEN calculating THEN no commission added', () => {
      const input: FinalPricingInput = {
        baseTotal: 10000,
        unexpectedPercentage: 10,
        localAgentCommissionPercentage: 0,
        myProfitPercentage: 0,
        travelers: 4,
      };

      const result = calculateFinalPricing(input);

      expect(result.localAgentCommissionAmount).toBe(0);
      expect(result.subtotalAfterLocalAgent).toBe(11000);
    });

    test('GIVEN 10% commission without contingency WHEN calculating THEN applies to base total', () => {
      const input: FinalPricingInput = {
        baseTotal: 5000,
        unexpectedPercentage: 0,
        localAgentCommissionPercentage: 10,
        myProfitPercentage: 0,
        travelers: 2,
      };

      const result = calculateFinalPricing(input);

      expect(result.localAgentCommissionAmount).toBe(500); // 10% of 5000
      expect(result.subtotalAfterLocalAgent).toBe(5500);
    });
  });

  describe('Profit Margin', () => {
    test('GIVEN 20% profit WHEN calculating THEN applies to subtotal after commission', () => {
      const input: FinalPricingInput = {
        baseTotal: 10000,
        unexpectedPercentage: 10, // +1000 = 11000
        localAgentCommissionPercentage: 5, // +550 = 11550
        myProfitPercentage: 20,
        travelers: 4,
      };

      const result = calculateFinalPricing(input);

      expect(result.subtotalAfterLocalAgent).toBe(11550);
      expect(result.myProfitAmount).toBe(2310); // 20% of 11550
      expect(result.finalTotal).toBe(13860);
    });

    test('GIVEN 0% profit WHEN calculating THEN no profit added', () => {
      const input: FinalPricingInput = {
        baseTotal: 10000,
        unexpectedPercentage: 10,
        localAgentCommissionPercentage: 5,
        myProfitPercentage: 0,
        travelers: 4,
      };

      const result = calculateFinalPricing(input);

      expect(result.myProfitAmount).toBe(0);
      expect(result.finalTotal).toBe(11550);
    });

    test('GIVEN 25% profit without other adjustments WHEN calculating THEN applies to base total', () => {
      const input: FinalPricingInput = {
        baseTotal: 8000,
        unexpectedPercentage: 0,
        localAgentCommissionPercentage: 0,
        myProfitPercentage: 25,
        travelers: 3,
      };

      const result = calculateFinalPricing(input);

      expect(result.myProfitAmount).toBe(2000); // 25% of 8000
      expect(result.finalTotal).toBe(10000);
    });
  });

  describe('Compounding Effect', () => {
    test('GIVEN all percentages WHEN calculating THEN compounds correctly', () => {
      const input: FinalPricingInput = {
        baseTotal: 10000,
        unexpectedPercentage: 10, // +1000 = 11000
        localAgentCommissionPercentage: 5, // +550 = 11550
        myProfitPercentage: 20, // +2310 = 13860
        travelers: 4,
      };

      const result = calculateFinalPricing(input);

      // Step by step verification
      expect(result.baseTotal).toBe(10000);
      expect(result.unexpectedAmount).toBe(1000);
      expect(result.subtotalAfterUnexpected).toBe(11000);
      expect(result.localAgentCommissionAmount).toBe(550);
      expect(result.subtotalAfterLocalAgent).toBe(11550);
      expect(result.myProfitAmount).toBe(2310);
      expect(result.finalTotal).toBe(13860);
    });

    test('GIVEN different percentages WHEN calculating THEN each layer compounds on previous', () => {
      const input: FinalPricingInput = {
        baseTotal: 5000,
        unexpectedPercentage: 20, // +1000 = 6000
        localAgentCommissionPercentage: 10, // +600 = 6600
        myProfitPercentage: 15, // +990 = 7590
        travelers: 2,
      };

      const result = calculateFinalPricing(input);

      expect(result.unexpectedAmount).toBe(1000);
      expect(result.subtotalAfterUnexpected).toBe(6000);
      expect(result.localAgentCommissionAmount).toBe(600);
      expect(result.subtotalAfterLocalAgent).toBe(6600);
      expect(result.myProfitAmount).toBe(990);
      expect(result.finalTotal).toBe(7590);
    });
  });

  describe('Final Price Per Person', () => {
    test('GIVEN 4 travelers WHEN calculating THEN divides final total correctly', () => {
      const input: FinalPricingInput = {
        baseTotal: 10000,
        unexpectedPercentage: 10,
        localAgentCommissionPercentage: 5,
        myProfitPercentage: 20,
        travelers: 4,
      };

      const result = calculateFinalPricing(input);

      expect(result.finalTotal).toBe(13860);
      expect(result.finalPricePerPerson).toBe(3465); // 13860 / 4
    });

    test('GIVEN 0 travelers WHEN calculating THEN per person is 0', () => {
      const input: FinalPricingInput = {
        baseTotal: 10000,
        unexpectedPercentage: 10,
        localAgentCommissionPercentage: 5,
        myProfitPercentage: 20,
        travelers: 0,
      };

      const result = calculateFinalPricing(input);

      expect(result.finalTotal).toBe(13860);
      expect(result.finalPricePerPerson).toBe(0);
    });

    test('GIVEN 1 traveler WHEN calculating THEN per person equals final total', () => {
      const input: FinalPricingInput = {
        baseTotal: 5000,
        unexpectedPercentage: 10,
        localAgentCommissionPercentage: 0,
        myProfitPercentage: 20,
        travelers: 1,
      };

      const result = calculateFinalPricing(input);

      expect(result.finalTotal).toBe(6600); // 5000 + 500 + 0 + 1100
      expect(result.finalPricePerPerson).toBe(6600);
    });
  });

  describe('Edge Cases', () => {
    test('GIVEN all percentages are 0 WHEN calculating THEN final equals base', () => {
      const input: FinalPricingInput = {
        baseTotal: 7500,
        unexpectedPercentage: 0,
        localAgentCommissionPercentage: 0,
        myProfitPercentage: 0,
        travelers: 3,
      };

      const result = calculateFinalPricing(input);

      expect(result.finalTotal).toBe(7500);
      expect(result.unexpectedAmount).toBe(0);
      expect(result.localAgentCommissionAmount).toBe(0);
      expect(result.myProfitAmount).toBe(0);
    });

    test('GIVEN base total is 0 WHEN calculating THEN all amounts are 0', () => {
      const input: FinalPricingInput = {
        baseTotal: 0,
        unexpectedPercentage: 10,
        localAgentCommissionPercentage: 5,
        myProfitPercentage: 20,
        travelers: 4,
      };

      const result = calculateFinalPricing(input);

      expect(result.finalTotal).toBe(0);
      expect(result.unexpectedAmount).toBe(0);
      expect(result.localAgentCommissionAmount).toBe(0);
      expect(result.myProfitAmount).toBe(0);
    });
  });

  describe('Golden Regression Tests', () => {
    test('GOLDEN: Standard 10-5-20 pricing model on $10,000 base should equal $13,860', () => {
      // This is a common pricing model:
      // - 10% contingency for unforeseen costs
      // - 5% local agent commission
      // - 20% profit margin
      const input: FinalPricingInput = {
        baseTotal: 10000,
        unexpectedPercentage: 10,
        localAgentCommissionPercentage: 5,
        myProfitPercentage: 20,
        travelers: 4,
      };

      const result = calculateFinalPricing(input);

      // Detailed breakdown:
      // Base: $10,000
      // + Contingency (10%): $1,000 → $11,000
      // + Commission (5% of $11,000): $550 → $11,550
      // + Profit (20% of $11,550): $2,310 → $13,860
      expect(result.finalTotal).toBe(13860);
      expect(result.finalPricePerPerson).toBe(3465);
    });

    test('GOLDEN: Conservative 5-10-15 pricing model on $15,000 base should equal $19,868.75', () => {
      // Conservative pricing model:
      // - 5% contingency
      // - 10% local agent commission
      // - 15% profit margin
      const input: FinalPricingInput = {
        baseTotal: 15000,
        unexpectedPercentage: 5,
        localAgentCommissionPercentage: 10,
        myProfitPercentage: 15,
        travelers: 6,
      };

      const result = calculateFinalPricing(input);

      // Detailed breakdown:
      // Base: $15,000
      // + Contingency (5%): $750 → $15,750
      // + Commission (10% of $15,750): $1,575 → $17,325
      // + Profit (15% of $17,325): $2,598.75 → $19,923.75
      expect(result.finalTotal).toBe(19923.75);
      expect(result.finalPricePerPerson).toBeCloseTo(3320.625, 2);
    });
  });
});
