import { useState } from 'react';
import { ManualPricingEngine } from '../core/services/ManualPricingEngine';
import { CalculateManualPricingUseCase } from '../core/usecases/CalculateManualPricing';
import { LineItemDraft, CalculationResult } from '../types/ui';
import { Calculation } from '../core/domain/entities';

export const useManualPricing = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (
    lineItems: LineItemDraft[]
  ): Promise<CalculationResult | null> => {
    setIsCalculating(true);
    setError(null);

    try {
      const engine = new ManualPricingEngine();
      const useCase = new CalculateManualPricingUseCase(engine);
      const result = await useCase.execute({ lineItems });

      return mapCalculationToResult(result.calculation);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate pricing';
      setError(message);
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    calculate,
    isCalculating,
    error,
  };
};

function mapCalculationToResult(calculation: Calculation): CalculationResult {
  const categoryMap = new Map<string, typeof calculation.lineItems>();

  calculation.lineItems.forEach((item) => {
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, []);
    }
    categoryMap.get(item.category)!.push(item);
  });

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

  const totalAmount = calculation.total.amount;
  const travelers = (calculation.metadata?.travelers as number) || 1;
  const pricePerPerson = totalAmount / travelers;

  return {
    calculationId: calculation.id,
    tripId: calculation.tripId || 'manual',
    total: calculation.total.toString(),
    pricePerPerson: `${calculation.total.currency} ${pricePerPerson.toFixed(2)}`,
    breakdown,
    markup: {
      type: 'percent',
      value: 0,
      amount: 'USD 0.00',
    },
    warnings: [],
  };
}

