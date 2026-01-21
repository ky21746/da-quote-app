import React, { useMemo } from 'react';
import { PricingItem } from '../../types/ui';
import { calculatePricingFromCatalog } from '../../utils/catalogPricingEngine';
import { calculateFinalPricing } from '../../utils/finalPricingCalculator';
import { formatCurrency } from '../../utils/currencyFormatter';
import { Scenario } from '../../context/ScenarioComparisonContext';

interface ScenarioComparisonViewProps {
  scenarios: Scenario[];
  pricingItems: PricingItem[];
}

interface ScenarioCalculation {
  scenarioId: string;
  scenarioName: string;
  isBase: boolean;
  baseTotal: number;
  unexpectedAmount: number;
  localAgentCommissionAmount: number;
  myProfitAmount: number;
  finalTotal: number;
  finalPricePerPerson: number;
}

export const ScenarioComparisonView: React.FC<ScenarioComparisonViewProps> = ({
  scenarios,
  pricingItems,
}) => {
  const calculations = useMemo(() => {
    return scenarios.map((scenario): ScenarioCalculation => {
      const basePricingResult = calculatePricingFromCatalog(scenario.draft, pricingItems);
      
      const finalPricing = calculateFinalPricing({
        baseTotal: basePricingResult.totals.grandTotal,
        unexpectedPercentage: scenario.draft.unexpectedPercentage || 0,
        localAgentCommissionPercentage: scenario.draft.localAgentCommissionPercentage || 0,
        myProfitPercentage: scenario.draft.myProfitPercentage || 0,
        travelers: scenario.draft.travelers || 0,
      });

      return {
        scenarioId: scenario.scenarioId,
        scenarioName: scenario.scenarioName,
        isBase: scenario.isBase,
        baseTotal: finalPricing.baseTotal,
        unexpectedAmount: finalPricing.unexpectedAmount,
        localAgentCommissionAmount: finalPricing.localAgentCommissionAmount,
        myProfitAmount: finalPricing.myProfitAmount,
        finalTotal: finalPricing.finalTotal,
        finalPricePerPerson: finalPricing.finalPricePerPerson,
      };
    });
  }, [scenarios, pricingItems]);

  if (calculations.length === 0) {
    return null;
  }

  const baseScenario = calculations.find((c) => c.isBase);

  return (
    <div className="mb-6 p-4 md:p-6 bg-purple-50 rounded-lg border border-purple-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Scenario Comparison</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left">Metric</th>
              {calculations.map((calc) => (
                <th
                  key={calc.scenarioId}
                  className={`border border-gray-300 px-3 py-2 text-right ${
                    calc.isBase ? 'bg-blue-100 font-bold' : ''
                  }`}
                >
                  {calc.scenarioName}
                  {calc.isBase && <div className="text-xs font-normal text-gray-600">(Base)</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-2 font-medium">Base Total</td>
              {calculations.map((calc) => (
                <td key={calc.scenarioId} className="border border-gray-300 px-3 py-2 text-right">
                  {formatCurrency(calc.baseTotal)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-2 font-medium">Contingency</td>
              {calculations.map((calc) => (
                <td key={calc.scenarioId} className="border border-gray-300 px-3 py-2 text-right">
                  {formatCurrency(calc.unexpectedAmount)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-2 font-medium">Commission</td>
              {calculations.map((calc) => (
                <td key={calc.scenarioId} className="border border-gray-300 px-3 py-2 text-right">
                  {formatCurrency(calc.localAgentCommissionAmount)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-2 font-medium">Profit</td>
              {calculations.map((calc) => (
                <td key={calc.scenarioId} className="border border-gray-300 px-3 py-2 text-right">
                  {formatCurrency(calc.myProfitAmount)}
                </td>
              ))}
            </tr>
            <tr className="bg-gray-50 font-semibold">
              <td className="border border-gray-300 px-3 py-2">Final Total</td>
              {calculations.map((calc) => (
                <td key={calc.scenarioId} className="border border-gray-300 px-3 py-2 text-right">
                  {formatCurrency(calc.finalTotal)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-2 font-medium">Per Person</td>
              {calculations.map((calc) => (
                <td key={calc.scenarioId} className="border border-gray-300 px-3 py-2 text-right">
                  {formatCurrency(calc.finalPricePerPerson)}
                </td>
              ))}
            </tr>
            {baseScenario && calculations.length > 1 && (
              <tr className="bg-yellow-50">
                <td className="border border-gray-300 px-3 py-2 font-medium">Difference vs Base</td>
                {calculations.map((calc) => {
                  if (calc.isBase) {
                    return (
                      <td
                        key={calc.scenarioId}
                        className="border border-gray-300 px-3 py-2 text-right text-gray-500"
                      >
                        —
                      </td>
                    );
                  }
                  const diff = calc.finalTotal - baseScenario.finalTotal;
                  const diffPerPerson = calc.finalPricePerPerson - baseScenario.finalPricePerPerson;
                  const isPositive = diff > 0;
                  return (
                    <td
                      key={calc.scenarioId}
                      className={`border border-gray-300 px-3 py-2 text-right font-semibold ${
                        isPositive ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      <div>{isPositive ? '+' : ''}{formatCurrency(diff)}</div>
                      <div className="text-xs">
                        ({isPositive ? '+' : ''}{formatCurrency(diffPerPerson)} pp)
                      </div>
                    </td>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
