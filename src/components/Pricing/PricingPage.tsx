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
import { DollarSign, Users, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ItineraryButton } from '../Itinerary/ItineraryButton';
import { ItineraryPreviewModal } from '../Itinerary/ItineraryPreviewModal';
import { getItineraryApiClient } from '../../services/itineraryApi';
import { CreateItineraryRequest } from '../../types/itinerary';

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
  
  // Itinerary state
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const itineraryStatus = draft?.itineraryStatus || 'none';
  const itineraryId = draft?.itineraryId;

  // Handle itinerary generation
  const handleGenerateItinerary = async () => {
    if (!draft || !tripId) {
      alert('Please save the trip first before generating itinerary');
      return;
    }

    setIsGeneratingItinerary(true);

    try {
      const apiClient = getItineraryApiClient();
      
      // Clean tripData - remove undefined values and keep only essential fields
      const cleanTripData = {
        name: draft.name || 'Untitled Trip',
        travelers: draft.travelers || 0,
        days: draft.days || 0,
        tripDays: draft.tripDays || [],
        tier: draft.tier,
        ages: draft.ages,
      };
      
      const request: CreateItineraryRequest = {
        tripId,
        tripData: cleanTripData as any,
        pricing: basePricingResult,
        metadata: {
          preferences: {
            language: 'en',
            includeImages: true,
            includePricing: true,
            format: 'detailed',
          },
        },
      };

      const response = await apiClient.createItinerary(request);

      // Update draft with itinerary info
      setDraft({
        ...draft,
        itineraryId: response.itineraryId,
        itineraryStatus: response.status,
        itineraryLastGenerated: new Date().toISOString(),
      });

      // If completed immediately, show modal
      if (response.status === 'completed') {
        setShowItineraryModal(true);
      } else if (response.status === 'processing') {
        alert(`Itinerary is being generated. Estimated time: ${response.estimatedTime || 30} seconds`);
        // Poll for completion
        pollItineraryStatus(response.itineraryId);
      }
    } catch (error: any) {
      console.error('Failed to generate itinerary:', error);
      alert(`Failed to generate itinerary: ${error.message || 'Unknown error'}`);
      
      if (draft) {
        setDraft({
          ...draft,
          itineraryStatus: 'failed',
        });
      }
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  // Poll itinerary status
  const pollItineraryStatus = async (itinId: string) => {
    const apiClient = getItineraryApiClient();
    let attempts = 0;
    const maxAttempts = 20; // 20 attempts * 3 seconds = 60 seconds max

    const poll = async () => {
      try {
        const response = await apiClient.getItinerary(itinId);
        
        if (response.status === 'completed') {
          if (draft) {
            setDraft({
              ...draft,
              itineraryStatus: 'completed',
            });
          }
          alert('Itinerary is ready!');
          return;
        } else if (response.status === 'failed') {
          if (draft) {
            setDraft({
              ...draft,
              itineraryStatus: 'failed',
            });
          }
          alert('Itinerary generation failed');
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000); // Poll every 3 seconds
        }
      } catch (error) {
        console.error('Failed to poll itinerary status:', error);
      }
    };

    poll();
  };

  // Handle itinerary button click
  const handleItineraryButtonClick = () => {
    if (itineraryStatus === 'completed' && itineraryId) {
      setShowItineraryModal(true);
    } else if (itineraryStatus === 'none' || itineraryStatus === 'failed' || itineraryStatus === 'outdated') {
      handleGenerateItinerary();
    }
  };

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
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="w-8 h-8 text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-800">Pricing</h1>
        </div>

        <ProgressStepper currentStep={4} steps={progressSteps} />

        <div className="mb-6 p-4 md:p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-primary-600 shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Final Output</h2>
                <div className="text-xs text-gray-500">Calculated from catalog + adjustments</div>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-100 inline-flex items-center gap-2 transition-colors"
              onClick={() => setShowPricingAdjustments((v) => !v)}
            >
              {showPricingAdjustments ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide adjustments
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show adjustments
                </>
              )}
            </button>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                Travelers:
              </span>
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

        {/* Itinerary Generation */}
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Trip Itinerary</h2>
              <p className="text-sm text-gray-600">
                Generate a detailed day-by-day itinerary with images and descriptions
              </p>
            </div>
            <ItineraryButton
              status={itineraryStatus}
              isLoading={isGeneratingItinerary}
              onClick={handleItineraryButtonClick}
              disabled={!tripId}
            />
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

        {/* Itinerary Preview Modal */}
        {itineraryId && (
          <ItineraryPreviewModal
            itineraryId={itineraryId}
            isOpen={showItineraryModal}
            onClose={() => setShowItineraryModal(false)}
          />
        )}

        {!capacityValidation.isValid && (
          <div className="mb-6 p-4 md:p-6 bg-red-50 border-2 border-red-400 text-red-800 rounded-lg">
            <div className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              The selected item capacity is insufficient for the number of travelers.
            </div>
            <div className="space-y-3">
              {capacityValidation.issues.map((issue: any, idx: number) => {
                const item = pricingItems.find((i) => i.id === issue.itemId);
                const itemName = item?.itemName || issue.itemId;
                const totalCapacity = issue.capacity * issue.quantity;
                return (
                  <div key={`${issue.itemId}_${idx}`} className="bg-white border border-red-200 rounded-lg p-4 shadow-sm">
                    <div className="text-sm font-medium text-red-900 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      {itemName}
                    </div>
                    <div className="text-xs mt-1 text-red-800">
                      <strong>Problem:</strong> You have {issue.travelers} travelers, but this item can only accommodate {totalCapacity} {totalCapacity === 1 ? 'person' : 'people'}
                      {issue.quantity > 1 ? ` (${issue.quantity} × ${issue.capacity} capacity)` : ` (capacity: ${issue.capacity})`}.
                    </div>
                    <div className="text-xs mt-1 text-red-700">
                      <strong>Solution:</strong> Increase quantity to {Math.ceil(issue.travelers / issue.capacity)} or replace with a higher-capacity item.
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
                        const altNames = alternatives
                          .map((alt: any) => {
                            const altItem = pricingItems.find((i) => i.id === alt.itemId);
                            return `${altItem?.itemName || alt.itemId} (capacity ${alt.capacity})`;
                          })
                          .join('\n');
                        alert(
                          `Replace item with a higher-capacity alternative. Options:\n${altNames}`
                        );
                      }}
                    >
                      Replace item
                    </Button>
                  </div>
                </div>
                );
              })}
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
