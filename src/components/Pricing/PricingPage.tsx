import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { Button, ProgressStepper, Input } from '../common';
import { PricingTable } from './PricingTable';
import { calculatePricingFromCatalog, PricingResult } from '../../utils/catalogPricingEngine';
import { CalculationResult, CategoryBreakdown, LineItemDisplay } from '../../types/ui';
import { formatCurrency } from '../../utils/currencyFormatter';

/**
 * Convert PricingResult to CalculationResult format for TripSummaryPage
 */
function convertToCalculationResult(
  pricingResult: PricingResult,
  tripId: string
): CalculationResult {
  // Group breakdown by category
  const categoryMap = new Map<string, LineItemDisplay[]>();

  pricingResult.breakdown.forEach((item) => {
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, []);
    }
    categoryMap.get(item.category)!.push({
      description: `${item.itemName} (${item.park})`,
      quantity: 1,
      unitPrice: formatCurrency(item.basePrice),
      total: formatCurrency(item.calculatedTotal),
    });
  });

  // Convert to CategoryBreakdown array
  const breakdown: CategoryBreakdown[] = Array.from(categoryMap.entries()).map(
    ([category, items]) => {
      // Calculate subtotal from the original breakdown items
      const categoryItems = pricingResult.breakdown.filter((item) => item.category === category);
      const subtotal = categoryItems.reduce((sum, item) => sum + item.calculatedTotal, 0);
      return {
        category,
        items,
        subtotal: formatCurrency(subtotal),
      };
    }
  );

  return {
    calculationId: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    tripId,
    total: formatCurrency(pricingResult.totals.grandTotal),
    pricePerPerson: formatCurrency(pricingResult.totals.perPerson),
    breakdown,
    markup: {
      type: 'percent',
      value: 0,
      amount: 'USD 0.00',
    },
    warnings: [],
  };
}

export const PricingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { draft, setDraft, setCalculationResult } = useTrip();
  const { items: pricingItems } = usePricingCatalog();

  // Local state for adjustments
  const [unexpectedPercentage, setUnexpectedPercentage] = useState<number>(
    draft?.unexpectedPercentage || 0
  );
  const [localAgentCommissionPercentage, setLocalAgentCommissionPercentage] = useState<number>(
    draft?.localAgentCommissionPercentage || 0
  );
  const [myProfitPercentage, setMyProfitPercentage] = useState<number>(
    draft?.myProfitPercentage || 0
  );

  // Update local state when draft changes
  useEffect(() => {
    if (draft) {
      setUnexpectedPercentage(draft.unexpectedPercentage || 0);
      setLocalAgentCommissionPercentage(draft.localAgentCommissionPercentage || 0);
      setMyProfitPercentage(draft.myProfitPercentage || 0);
    }
  }, [draft, draft?.unexpectedPercentage, draft?.localAgentCommissionPercentage, draft?.myProfitPercentage]);

  const progressSteps = [
    'Setup',
    'Parks',
    'Summary',
    'Pricing',
  ];

  // Calculate pricing from catalog
  const basePricingResult = useMemo(() => {
    if (!draft) {
      return {
        breakdown: [],
        totals: { grandTotal: 0, perPerson: 0 },
      };
    }
    return calculatePricingFromCatalog(draft, pricingItems);
  }, [draft, pricingItems]);

  // Calculate adjustments
  const adjustments = useMemo(() => {
    const baseTotal = basePricingResult.totals.grandTotal;

    // Calculate vehicle total (sum of Vehicle category items)
    const vehicleTotal = basePricingResult.breakdown
      .filter((item) => item.category === 'Vehicle')
      .reduce((sum, item) => sum + item.calculatedTotal, 0);

    // 1. Calculate Contingency (Unforeseen Costs) on Base Total
    const unexpectedAmount = (baseTotal * (unexpectedPercentage || 0)) / 100;
    const subtotalAfterUnexpected = baseTotal + unexpectedAmount;

    // 2. Calculate Local Agent Commission on (Base Total + Contingency)
    // Note: Applying to the running total instead of just vehicle total as per request
    const localAgentCommissionAmount = (subtotalAfterUnexpected * (localAgentCommissionPercentage || 0)) / 100;
    const subtotalAfterLocalAgent = subtotalAfterUnexpected + localAgentCommissionAmount;

    // 3. Calculate Profit Margin on (Base + Contingency + Local Agent)
    const myProfitAmount = (subtotalAfterLocalAgent * (myProfitPercentage || 0)) / 100;

    return {
      baseTotal,
      vehicleTotal,
      unexpectedAmount,
      localAgentCommissionAmount,
      myProfitAmount,
      finalTotal: subtotalAfterLocalAgent + myProfitAmount,
    };
  }, [basePricingResult, unexpectedPercentage, localAgentCommissionPercentage, myProfitPercentage]);

  const travelers = draft?.travelers || 0;

  if (!draft) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Draft not loaded</p>
          <Button onClick={() => navigate('/trip/new')}>Start New Trip</Button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8 lg:p-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Pricing</h1>

        <ProgressStepper currentStep={4} steps={progressSteps} />

        {/* Pricing Table (Read-only from Catalog) */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Line Items</h2>
          <PricingTable lines={basePricingResult.breakdown} />
        </div>

        {/* Pricing Adjustments */}
        <div className="mb-6 p-4 md:p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pricing Adjustments</h2>
          <div className="space-y-4">
            <Input
              label="Contingency (Unforeseen Costs) (%)"
              type="number"
              value={unexpectedPercentage}
              onChange={(value) => {
                const numValue = typeof value === 'number' ? value : Number(value);
                setUnexpectedPercentage(numValue);
                if (draft) {
                  setDraft({ ...draft, unexpectedPercentage: numValue });
                }
              }}
              min={0}
              max={100}
              step={0.1}
            />
            <Input
              label="Local Agent Commission (%)"
              type="number"
              value={localAgentCommissionPercentage}
              onChange={(value) => {
                const numValue = typeof value === 'number' ? value : Number(value);
                setLocalAgentCommissionPercentage(numValue);
                if (draft) {
                  setDraft({ ...draft, localAgentCommissionPercentage: numValue });
                }
              }}
              min={0}
              max={100}
              step={0.1}
            />
            <Input
              label="Profit Margin (%)"
              type="number"
              value={myProfitPercentage}
              onChange={(value) => {
                const numValue = typeof value === 'number' ? value : Number(value);
                setMyProfitPercentage(numValue);
                if (draft) {
                  setDraft({ ...draft, myProfitPercentage: numValue });
                }
              }}
              min={0}
              max={100}
              step={0.1}
            />
          </div>
        </div>

        {/* Final Output Section */}
        <div className="mb-6 p-4 md:p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Final Output</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Travelers:</span>
              <span className="font-semibold text-gray-800">{travelers}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-600">Base Total:</span>
              <span className="font-semibold text-gray-800">
                {formatCurrency(adjustments.baseTotal)}
              </span>
            </div>
            {unexpectedPercentage > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Contingency (Unforeseen Costs) ({unexpectedPercentage}%):
                </span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(adjustments.unexpectedAmount)}
                </span>
              </div>
            )}
            {localAgentCommissionPercentage > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Local Agent Commission ({localAgentCommissionPercentage}%):
                </span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(adjustments.localAgentCommissionAmount)}
                </span>
              </div>
            )}
            {myProfitPercentage > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Profit Margin ({myProfitPercentage}%):
                </span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(adjustments.myProfitAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-800">Grand Total:</span>
              <span className="font-bold text-lg text-gray-900">
                {formatCurrency(adjustments.finalTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Final Price Per Person:</span>
              <span className="font-semibold text-gray-800">
                {formatCurrency(travelers > 0 ? adjustments.finalTotal / travelers : 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex gap-2">
          <Button onClick={() => navigate(-1)} variant="secondary">
            Back
          </Button>
          <Button
            onClick={() => {
              // Update draft with adjustments
              if (draft) {
                setDraft({
                  ...draft,
                  unexpectedPercentage,
                  localAgentCommissionPercentage,
                  myProfitPercentage,
                });
              }
              // Convert pricing result to CalculationResult format (with adjustments)
              const adjustedResult: PricingResult = {
                breakdown: basePricingResult.breakdown,
                totals: {
                  grandTotal: adjustments.finalTotal,
                  perPerson: travelers > 0 ? adjustments.finalTotal / travelers : 0,
                },
              };
              const calculationResult = convertToCalculationResult(
                adjustedResult,
                id || 'draft'
              );
              // Save to context so TripSummaryPage can display it
              setCalculationResult(calculationResult);
              // Navigate to summary
              navigate(`/trip/${id}/summary`);
            }}
            variant="primary"
          >
            Proceed
          </Button>
        </div>
      </div>
    </div>
  );
};
