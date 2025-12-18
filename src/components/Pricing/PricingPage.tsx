import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { Button, ProgressStepper } from '../common';
import { PricingTable } from './PricingTable';
import { calculatePricingFromCatalog, PricingResult } from '../../utils/catalogPricingEngine';
import { CalculationResult, CategoryBreakdown, LineItemDisplay } from '../../types/ui';

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
      unitPrice: `USD ${item.basePrice.toFixed(2)}`,
      total: `USD ${item.calculatedTotal.toFixed(2)}`,
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
        subtotal: `USD ${subtotal.toFixed(2)}`,
      };
    }
  );

  return {
    calculationId: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    tripId,
    total: `USD ${pricingResult.totals.grandTotal.toFixed(2)}`,
    pricePerPerson: `USD ${pricingResult.totals.perPerson.toFixed(2)}`,
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
  const { draft, setCalculationResult } = useTrip();
  const { items: pricingItems } = usePricingCatalog();

  const progressSteps = [
    'Setup',
    'Parks',
    'Logistics',
    'Pricing',
  ];

  // Calculate pricing from catalog
  const pricingResult = useMemo(() => {
    if (!draft) {
      return {
        breakdown: [],
        totals: { grandTotal: 0, perPerson: 0 },
      };
    }
    return calculatePricingFromCatalog(draft, pricingItems);
  }, [draft, pricingItems]);

  const travelers = draft?.travelers || 0;

  if (!draft) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Draft not loaded</p>
          <Button onClick={() => navigate('/trip/new')}>Start New Trip</Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number): string => {
    return `USD ${amount.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Pricing</h1>

        <ProgressStepper currentStep={4} steps={progressSteps} />

        {/* Pricing Table (Read-only from Catalog) */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Line Items</h2>
          <PricingTable lines={pricingResult.breakdown} />
        </div>

        {/* Final Output Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Final Output</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Travelers:</span>
              <span className="font-semibold text-gray-800">{travelers}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-800">Grand Total:</span>
              <span className="font-bold text-lg text-gray-900">
                {formatCurrency(pricingResult.totals.grandTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Final Price Per Person:</span>
              <span className="font-semibold text-gray-800">
                {formatCurrency(pricingResult.totals.perPerson)}
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
              // Convert pricing result to CalculationResult format
              const calculationResult = convertToCalculationResult(
                pricingResult,
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
