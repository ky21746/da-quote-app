import React from 'react';
import { CalculationResult } from '../../types/ui';

interface CostParetoPanelProps {
  calculation: CalculationResult | null;
}

export const CostParetoPanel: React.FC<CostParetoPanelProps> = ({ calculation }) => {
  if (!calculation) {
    return null;
  }

  // Parse total amount
  const totalAmount = parseFloat(calculation.total.replace(/[^0-9.]/g, ''));

  // Calculate percentages for each category
  const categoriesWithPercentages = calculation.breakdown
    .map((cat) => {
      const categoryAmount = parseFloat(cat.subtotal.replace(/[^0-9.]/g, ''));
      const percentage = totalAmount > 0 ? (categoryAmount / totalAmount) * 100 : 0;
      return {
        category: cat.category,
        amount: cat.subtotal,
        percentage,
        categoryAmount,
      };
    })
    .sort((a, b) => b.categoryAmount - a.categoryAmount);

  // Identify top contributors (80/20 rule visual emphasis)
  const cumulativePercentages: number[] = [];
  let cumulative = 0;
  categoriesWithPercentages.forEach((cat) => {
    cumulative += cat.percentage;
    cumulativePercentages.push(cumulative);
  });

  const topContributors = categoriesWithPercentages.filter(
    (_, idx) => cumulativePercentages[idx] <= 80
  );

  return (
    <div className="mb-6 p-4 bg-brand-olive/5 rounded-lg border border-brand-olive/20">
      <h3 className="text-lg font-bold text-brand-dark mb-4">Cost Breakdown (Pareto)</h3>

      <div className="space-y-3">
        {categoriesWithPercentages.map((cat, idx) => {
          const isTopContributor = topContributors.some((tc) => tc.category === cat.category);
          const isTop3 = idx < 3;

          return (
            <div
              key={cat.category}
              className={`flex justify-between items-center p-2 rounded ${
                isTopContributor ? 'bg-brand-olive/10 border border-brand-olive/30' : 'bg-white border border-brand-olive/10'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`capitalize ${
                      isTop3
                        ? 'font-bold text-brand-dark'
                        : isTopContributor
                        ? 'font-semibold text-brand-dark'
                        : 'text-brand-dark/80'
                    }`}
                  >
                    {cat.category}
                  </span>
                  <span
                    className={`${
                      isTop3
                        ? 'font-bold text-brand-dark'
                        : isTopContributor
                        ? 'font-semibold text-brand-dark'
                        : 'text-brand-dark/80'
                    }`}
                  >
                    {cat.amount}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 bg-brand-olive/20 rounded-full h-2 mr-2">
                    <div
                      className="bg-brand-gold h-2 rounded-full"
                      style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-brand-dark/70 w-12 text-right">
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {topContributors.length > 0 && (
        <div className="mt-4 pt-4 border-t border-brand-olive/20">
          <p className="text-xs text-brand-dark/70">
            <span className="font-semibold">Top {topContributors.length} categories</span> account
            for{' '}
            <span className="font-semibold">
              {cumulativePercentages[topContributors.length - 1]?.toFixed(1) || '0'}%
            </span>{' '}
            of total cost
          </p>
        </div>
      )}
    </div>
  );
};



