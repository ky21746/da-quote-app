/**
 * Final Pricing Calculator
 * Calculates the final client price including:
 * - Base total from catalog
 * - Contingency (Unforeseen Costs)
 * - Local Agent Commission
 * - Profit Margin
 */

export interface FinalPricingInput {
  baseTotal: number;
  unexpectedPercentage: number;
  localAgentCommissionPercentage: number;
  myProfitPercentage: number;
  travelers: number;
}

export interface FinalPricingResult {
  baseTotal: number;
  unexpectedAmount: number;
  subtotalAfterUnexpected: number;
  localAgentCommissionAmount: number;
  subtotalAfterLocalAgent: number;
  myProfitAmount: number;
  finalTotal: number;
  finalPricePerPerson: number;
}

/**
 * Calculate final pricing with all adjustments
 * 
 * Formula:
 * 1. Base Total (from catalog)
 * 2. + Contingency (unexpectedPercentage% of Base Total)
 * 3. + Local Agent Commission (localAgentCommissionPercentage% of subtotal after contingency)
 * 4. + Profit Margin (myProfitPercentage% of subtotal after local agent)
 * 5. = Final Total
 */
export function calculateFinalPricing(input: FinalPricingInput): FinalPricingResult {
  const { baseTotal, unexpectedPercentage, localAgentCommissionPercentage, myProfitPercentage, travelers } = input;

  // 1. Calculate Contingency (Unforeseen Costs) on Base Total
  const unexpectedAmount = (baseTotal * unexpectedPercentage) / 100;
  const subtotalAfterUnexpected = baseTotal + unexpectedAmount;

  // 2. Calculate Local Agent Commission on (Base Total + Contingency)
  const localAgentCommissionAmount = (subtotalAfterUnexpected * localAgentCommissionPercentage) / 100;
  const subtotalAfterLocalAgent = subtotalAfterUnexpected + localAgentCommissionAmount;

  // 3. Calculate Profit Margin on (Base + Contingency + Local Agent)
  const myProfitAmount = (subtotalAfterLocalAgent * myProfitPercentage) / 100;

  // 4. Final Total
  const finalTotal = subtotalAfterLocalAgent + myProfitAmount;

  // 5. Final Price Per Person
  const finalPricePerPerson = travelers > 0 ? finalTotal / travelers : 0;

  return {
    baseTotal,
    unexpectedAmount,
    subtotalAfterUnexpected,
    localAgentCommissionAmount,
    subtotalAfterLocalAgent,
    myProfitAmount,
    finalTotal,
    finalPricePerPerson,
  };
}
