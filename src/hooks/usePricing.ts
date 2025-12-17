import { useState } from 'react';
import { runPricingUsecase } from '../core/usecases';
import { authService } from '../app/auth';
import { CalculationResult } from '../types/ui';
import { Calculation, CalculationLineItem } from '../core/domain/entities';

export const usePricing = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateQuote = async (tripId: string): Promise<CalculationResult | null> => {
    setIsCalculating(true);
    setError(null);

    try {
      const userId = authService.getUserId();
      const result = await runPricingUsecase(tripId, userId);

      return mapCalculationToResult(result.calculation, result.validationWarnings);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate quote';
      setError(message);
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    calculateQuote,
    isCalculating,
    error,
  };
};

function mapCalculationToResult(
  calculation: Calculation,
  warnings: Array<{ field: string; message: string }>
): CalculationResult {
  // Group line items by category
  const categoryMap = new Map<string, CalculationLineItem[]>();

  calculation.lineItems.forEach((item) => {
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, []);
    }
    categoryMap.get(item.category)!.push(item);
  });

  // Build breakdown
  const breakdown = Array.from(categoryMap.entries()).map(([category, items]) => {
    const subtotal = items.reduce((sum, item) => sum + item.total.amount, 0);
    return {
      category,
      items: items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        total: item.total.toString(),
      })),
      subtotal: calculation.subtotal.currency + ' ' + subtotal.toFixed(2),
    };
  });

  // Calculate price per person
  const totalAmount = calculation.total.amount;
  const travelers = (calculation.metadata?.travelers as number) || 1;
  const pricePerPerson = totalAmount / travelers;

  return {
    calculationId: calculation.id,
    tripId: calculation.tripId,
    total: calculation.total.toString(),
    pricePerPerson: `${calculation.total.currency} ${pricePerPerson.toFixed(2)}`,
    breakdown,
    markup: {
      type: 'percent',
      value: 0,
      amount: 'USD 0.00',
    },
    warnings: warnings.map((w) => w.message),
  };
}

