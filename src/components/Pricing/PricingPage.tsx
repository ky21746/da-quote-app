import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { Button, ProgressStepper, Input } from '../common';
import { PricingTable } from './PricingTable';
import { calculatePricingFromCatalog, PricingResult } from '../../utils/catalogPricingEngine';
import { CalculationResult, CategoryBreakdown, LineItemDisplay } from '../../types/ui';
import { formatCurrency } from '../../utils/currencyFormatter';
import { validateCapacity } from '../../core/validators/CapacityValidator';
import { useActiveTripContext } from '../../hooks/useActiveTripContext';
import { useScenarioDuplication } from '../../hooks/useScenarioDuplication';
import { ScenarioComparisonView } from './ScenarioComparisonView';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

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
      quantity: item.quantity ?? 1,
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
  const { activeTripId } = useActiveTripContext();

  const tripId = activeTripId ?? id ?? null;

  const [showLineItems, setShowLineItems] = useState(false);
  const [showPricingAdjustments, setShowPricingAdjustments] = useState(true);

  const selectedPricingItemIds = useMemo(() => {
    if (!draft) return [];

    const ids: string[] = [];

    if (draft.tripDays && draft.tripDays.length > 0) {
      for (const day of draft.tripDays) {
        if (day.parkFees && day.parkFees.length > 0) {
          for (const fee of day.parkFees) {
            if (fee.excluded !== true) ids.push(fee.itemId);
          }
        }
        if (day.arrival) ids.push(day.arrival);
        if (day.lodging) ids.push(day.lodging);
        if (day.activities && day.activities.length > 0) ids.push(...day.activities);
        if (day.logistics?.vehicle) ids.push(day.logistics.vehicle);
        if (day.logistics?.internalMovements && day.logistics.internalMovements.length > 0) {
          ids.push(...day.logistics.internalMovements);
        }
      }
    }

    if (draft.parks && draft.parks.length > 0) {
      for (const park of draft.parks) {
        if (park.arrival) ids.push(park.arrival);
        if (park.lodging) ids.push(park.lodging);
        if (park.transport) ids.push(park.transport);
        if (park.activities && park.activities.length > 0) ids.push(...park.activities);
        if (park.extras && park.extras.length > 0) ids.push(...park.extras);
        if (park.logistics?.arrival) ids.push(park.logistics.arrival);
        if (park.logistics?.vehicle) ids.push(park.logistics.vehicle);
        if (park.logistics?.internalMovements && park.logistics.internalMovements.length > 0) {
          ids.push(...park.logistics.internalMovements);
        }
        if (park.days && park.days.length > 0) {
          for (const day of park.days) {
            if (day.activities && day.activities.length > 0) ids.push(...day.activities);
            if (day.extras && day.extras.length > 0) ids.push(...day.extras);
            if (day.departureToNextPark) ids.push(day.departureToNextPark);
          }
        }
      }
    }

    return ids.filter(Boolean);
  }, [draft]);

  const capacityValidation = useMemo(() => {
    if (!draft) return { isValid: true, issues: [] as any[] };
    return validateCapacity({
      travelers: draft.travelers,
      selectedItemIds: selectedPricingItemIds,
      catalogItems: pricingItems,
      quantitiesByItemId: draft.itemQuantities,
      defaultQuantitiesByItemId: Object.fromEntries(
        pricingItems.map((i) => [i.id, typeof i.quantity === 'number' ? i.quantity : 1])
      ),
    });
  }, [draft, pricingItems, selectedPricingItemIds]);

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

  // Debounce percentage values to prevent recalculation on every keystroke
  const debouncedUnexpectedPercentage = useDebouncedValue(unexpectedPercentage, 300);
  const debouncedLocalAgentCommissionPercentage = useDebouncedValue(localAgentCommissionPercentage, 300);
  const debouncedMyProfitPercentage = useDebouncedValue(myProfitPercentage, 300);

  // Scenario comparison
  const { scenarios, duplicateScenario, createBaseScenario, updateScenario } = useScenarioDuplication();
  const [showScenarioComparison, setShowScenarioComparison] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  // Get the currently selected scenario or fall back to main draft
  const selectedScenario = selectedScenarioId
    ? scenarios.find((s) => s.scenarioId === selectedScenarioId)
    : null;

  // Use selected scenario's draft if available, otherwise use main draft
  const activeDraft = selectedScenario ? selectedScenario.draft : draft;

  // Update local state when active draft changes
  useEffect(() => {
    if (activeDraft) {
      setUnexpectedPercentage(activeDraft.unexpectedPercentage || 0);
      setLocalAgentCommissionPercentage(activeDraft.localAgentCommissionPercentage || 0);
      setMyProfitPercentage(activeDraft.myProfitPercentage || 0);
    }
  }, [activeDraft, activeDraft?.unexpectedPercentage, activeDraft?.localAgentCommissionPercentage, activeDraft?.myProfitPercentage]);

  const progressSteps = [
    'Setup',
    'Parks',
    'Review & Fix',
    'Pricing',
  ];

  // Calculate pricing from catalog
  const basePricingResult = useMemo(() => {
    if (!activeDraft) {
      return {
        breakdown: [],
        totals: { grandTotal: 0, perPerson: 0 },
      };
    }
    return calculatePricingFromCatalog(activeDraft, pricingItems);
  }, [activeDraft, pricingItems]);

  // Calculate adjustments (using debounced values)
  const adjustments = useMemo(() => {
    const baseTotal = basePricingResult.totals.grandTotal;

    // Calculate vehicle total (sum of Vehicle category items)
    const vehicleTotal = basePricingResult.breakdown
      .filter((item) => item.category === 'Vehicle')
      .reduce((sum, item) => sum + item.calculatedTotal, 0);

    // 1. Calculate Contingency (Unforeseen Costs) on Base Total
    const unexpectedAmount = (baseTotal * (debouncedUnexpectedPercentage || 0)) / 100;
    const subtotalAfterUnexpected = baseTotal + unexpectedAmount;

    // 2. Calculate Local Agent Commission on (Base Total + Contingency)
    // Note: Applying to the running total instead of just vehicle total as per request
    const localAgentCommissionAmount = (subtotalAfterUnexpected * (debouncedLocalAgentCommissionPercentage || 0)) / 100;
    const subtotalAfterLocalAgent = subtotalAfterUnexpected + localAgentCommissionAmount;

    // 3. Calculate Profit Margin on (Base + Contingency + Local Agent)
    const myProfitAmount = (subtotalAfterLocalAgent * (debouncedMyProfitPercentage || 0)) / 100;

    return {
      baseTotal,
      vehicleTotal,
      unexpectedAmount,
      localAgentCommissionAmount,
      myProfitAmount,
      finalTotal: subtotalAfterLocalAgent + myProfitAmount,
    };
  }, [basePricingResult, debouncedUnexpectedPercentage, debouncedLocalAgentCommissionPercentage, debouncedMyProfitPercentage]);

  const travelers = activeDraft?.travelers || 0;

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

        <div className="mb-6 p-4 md:p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-800">Final Output</h2>
              <div className="text-xs text-gray-500">Calculated from catalog + adjustments</div>
            </div>
            <button
              type="button"
              className="shrink-0 px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-100"
              onClick={() => setShowPricingAdjustments((v) => !v)}
            >
              {showPricingAdjustments ? 'Hide adjustments' : 'Show adjustments'}
            </button>
          </div>

          <div className="mt-4 space-y-2 text-sm">
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
                <span className="text-gray-600">Profit Margin ({myProfitPercentage}%):</span>
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

        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-800">Line Items</h2>
              <div className="text-xs text-gray-500">
                {basePricingResult.breakdown.length} items
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-100"
              onClick={() => setShowLineItems((v) => !v)}
            >
              {showLineItems ? 'Hide table' : 'Show table'}
            </button>
          </div>
          {showLineItems && <PricingTable lines={basePricingResult.breakdown} />}
        </div>

        {!capacityValidation.isValid && (
          <div className="mb-6 p-4 md:p-6 bg-red-100 border border-red-400 text-red-800 rounded">
            <div className="font-semibold mb-2">
              The selected item capacity is insufficient for the number of travelers.
            </div>
            <div className="space-y-3">
              {capacityValidation.issues.map((issue: any, idx: number) => (
                <div key={`${issue.itemId}_${idx}`} className="bg-white/60 border border-red-200 rounded p-3">
                  <div className="text-sm font-medium">Item: {issue.itemId}</div>
                  <div className="text-xs mt-1">
                    Travelers: {issue.travelers} | Capacity: {issue.capacity} | Quantity: {issue.quantity}
                  </div>
                  <div className="flex gap-2 flex-wrap mt-3">
                    <Button
                      variant="primary"
                      onClick={() => {
                        const action = (issue.actions || []).find((a: any) => a.type === 'increase_quantity');
                        if (!action) return;
                        setDraft({
                          ...draft,
                          itemQuantities: {
                            ...(draft.itemQuantities || {}),
                            [action.itemId]: action.requiredQuantity,
                          },
                          itemQuantitySources: {
                            ...(draft.itemQuantitySources || {}),
                            [action.itemId]: 'auto',
                          },
                        });
                      }}
                    >
                      Increase quantity
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const action = (issue.actions || []).find((a: any) => a.type === 'replace_item');
                        const alternatives = action?.alternatives || [];
                        if (alternatives.length === 0) {
                          alert('No higher-capacity alternative found in catalog.');
                          return;
                        }
                        alert(
                          `Replace item with a higher-capacity alternative. Options:\n` +
                            alternatives
                              .map((alt: any) => `${alt.itemId} (capacity ${alt.capacity})`)
                              .join('\n')
                        );
                      }}
                    >
                      Replace item
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scenario Selector */}
        {scenarios.length > 0 && (
          <div className="mb-6 p-4 md:p-6 bg-purple-50 rounded-lg border border-purple-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Active Scenario</h2>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                className={`px-4 py-2 rounded border ${
                  selectedScenarioId === null
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedScenarioId(null)}
              >
                Main Draft
              </button>
              {scenarios.map((scenario) => (
                <button
                  key={scenario.scenarioId}
                  type="button"
                  className={`px-4 py-2 rounded border ${
                    selectedScenarioId === scenario.scenarioId
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedScenarioId(scenario.scenarioId)}
                >
                  {scenario.scenarioName}
                  {scenario.isBase && <span className="ml-1 text-xs">(Base)</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scenario Comparison */}
        {showScenarioComparison && scenarios.length > 0 && (
          <ScenarioComparisonView scenarios={scenarios} pricingItems={pricingItems} />
        )}

        {showPricingAdjustments && (
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
                  if (selectedScenario) {
                    // Update the selected scenario's draft
                    const updatedDraft = { ...selectedScenario.draft, unexpectedPercentage: numValue };
                    updateScenario(selectedScenario.scenarioId, updatedDraft);
                  } else if (draft) {
                    // Update main draft
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
                  if (selectedScenario) {
                    // Update the selected scenario's draft
                    const updatedDraft = { ...selectedScenario.draft, localAgentCommissionPercentage: numValue };
                    updateScenario(selectedScenario.scenarioId, updatedDraft);
                  } else if (draft) {
                    // Update main draft
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
                  if (selectedScenario) {
                    // Update the selected scenario's draft
                    const updatedDraft = { ...selectedScenario.draft, myProfitPercentage: numValue };
                    updateScenario(selectedScenario.scenarioId, updatedDraft);
                  } else if (draft) {
                    // Update main draft
                    setDraft({ ...draft, myProfitPercentage: numValue });
                  }
                }}
                min={0}
                max={100}
                step={0.1}
              />
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => navigate(-1)} variant="secondary">
            Back
          </Button>
          <Button
            onClick={() => {
              if (!draft) return;
              if (scenarios.length === 0) {
                createBaseScenario(draft);
              }
              duplicateScenario(draft);
              setShowScenarioComparison(true);
            }}
            variant="secondary"
          >
            Duplicate Scenario
          </Button>
          {scenarios.length > 0 && (
            <Button
              onClick={() => setShowScenarioComparison((v) => !v)}
              variant="secondary"
            >
              {showScenarioComparison ? 'Hide' : 'Show'} Comparison
            </Button>
          )}
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
                tripId || 'draft'
              );
              // Save to context so TripSummaryPage can display it
              setCalculationResult(calculationResult);
              // Navigate to summary
              if (!tripId) {
                navigate('/trip/new');
                return;
              }
              navigate(`/trip/${tripId}/summary`);
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
