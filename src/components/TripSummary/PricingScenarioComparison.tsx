import React from 'react';
import { CalculationResult } from '../../types/ui';

interface PricingScenarioComparisonProps {
  scenarios: {
    base: CalculationResult | null;
    quality: CalculationResult | null;
    premium: CalculationResult | null;
  };
}

export const PricingScenarioComparison: React.FC<PricingScenarioComparisonProps> = ({
  scenarios,
}) => {
  const getTopCategories = (result: CalculationResult | null, count: number = 3) => {
    if (!result) return [];
    return [...result.breakdown]
      .sort((a, b) => {
        const aAmount = parseFloat(a.subtotal.replace(/[^0-9.]/g, ''));
        const bAmount = parseFloat(b.subtotal.replace(/[^0-9.]/g, ''));
        return bAmount - aAmount;
      })
      .slice(0, count)
      .map((cat) => ({
        name: cat.category,
        amount: cat.subtotal,
      }));
  };

  const renderScenarioCard = (
    tier: 'base' | 'quality' | 'premium',
    result: CalculationResult | null
  ) => {
    const topCategories = getTopCategories(result);
    const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

    return (
      <div
        key={tier}
        className="mb-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-3">{tierLabel}</h3>

        {result ? (
          <>
            <div className="mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm text-gray-600">Total Cost</span>
                <span className="text-xl font-bold text-blue-600">{result.total}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-600">Per Person</span>
                <span className="text-base font-semibold text-gray-800">
                  {result.pricePerPerson}
                </span>
              </div>
            </div>

            {result.markup.value > 0 && (
              <div className="mb-3 p-2 bg-gray-50 rounded">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Markup</span>
                  <span className="font-medium text-gray-800">{result.markup.amount}</span>
                </div>
              </div>
            )}

            {topCategories.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-2">Top Cost Categories</p>
                <div className="space-y-1">
                  {topCategories.map((cat, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700 capitalize">{cat.name}</span>
                      <span className="font-medium text-gray-800">{cat.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-500">Calculating...</div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Scenario Comparison</h2>
      <div className="space-y-4">
        {renderScenarioCard('base', scenarios.base)}
        {renderScenarioCard('quality', scenarios.quality)}
        {renderScenarioCard('premium', scenarios.premium)}
      </div>
    </div>
  );
};






