import { useState } from 'react';
import { runPricingUsecase } from '../core/usecases';
import { authService } from '../app/auth';
import { CalculationResult, ScenarioResults } from '../types/ui';
import { TripDraft } from '../types/ui';
import { tripRepository } from '../app/config/dependencies';

export const useScenarioComparison = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateScenarios = async (
    tripId: string,
    draft: TripDraft
  ): Promise<ScenarioResults> => {
    setIsCalculating(true);
    setError(null);

    try {
      const userId = authService.getUserId();
      const results: ScenarioResults = {
        base: null,
        quality: null,
        premium: null,
      };

      // Load original trip
      const originalTrip = await tripRepository.getById(tripId, userId);
      if (!originalTrip) {
        throw new Error('Trip not found');
      }

      const originalTier = (originalTrip.metadata?.tier as string) || 'base';

      // Calculate each scenario sequentially via runPricingUsecase
      // Each call updates the trip tier temporarily and recalculates
      const tiers: Array<'base' | 'quality' | 'premium'> = ['base', 'quality', 'premium'];

      for (const tier of tiers) {
        try {
          // Update trip with this tier temporarily
          await tripRepository.update(tripId, userId, {
            metadata: {
              ...originalTrip.metadata,
              tier,
            },
          });

          // Call runPricingUsecase for this tier
          const result = await runPricingUsecase(tripId, userId);
          if (result) {
            results[tier] = mapCalculationToResult(result.calculation, result.validationWarnings);
          }
        } catch (err) {
          // Continue to next tier if one fails
          console.error(`Failed to calculate ${tier} scenario:`, err);
        }
      }

      // Restore original tier
      await tripRepository.update(tripId, userId, {
        metadata: {
          ...originalTrip.metadata,
          tier: originalTier,
        },
      });

      return results;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate scenarios';
      setError(message);
      return { base: null, quality: null, premium: null };
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    calculateScenarios,
    isCalculating,
    error,
  };
};


function mapCalculationToResult(
  calculation: any,
  warnings: Array<{ field: string; message: string }>
): CalculationResult {
  const categoryMap = new Map<string, any[]>();

  calculation.lineItems.forEach((item: any) => {
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

