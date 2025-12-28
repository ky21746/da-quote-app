import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { useScenarioComparison } from '../../hooks/useScenarioComparison';
import { Button } from '../common';
import { ValidationWarnings } from './ValidationWarnings';
import { PricingScenarioComparison } from './PricingScenarioComparison';
import { CostParetoPanel } from './CostParetoPanel';
import { quoteService } from '../../services/quoteService';
import { pdfService } from '../../services/pdfService';
import { getCategoryIcon } from '../../utils/iconHelpers';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { validateCapacity } from '../../core/validators/CapacityValidator';

export const TripSummaryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { calculationResult, draft, scenarioResults, setScenarioResults } = useTrip();
  const { items: pricingItems } = usePricingCatalog();
  const { calculateScenarios, isCalculating: isCalculatingScenarios, error: scenarioError } =
    useScenarioComparison();
  const [showComparison, setShowComparison] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);
  const [savedReferenceNumber, setSavedReferenceNumber] = useState<number | null>(null);

  const selectedPricingItemIds = React.useMemo(() => {
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

  const capacityValidation = React.useMemo(() => {
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

  useEffect(() => {
    // Load scenarios when comparison is enabled
    if (showComparison && draft && id && !scenarioResults.base) {
      calculateScenarios(id, draft).then((results) => {
        setScenarioResults(results);
      });
    }
  }, [showComparison, draft, id, scenarioResults.base, calculateScenarios, setScenarioResults]);

  const handleSaveQuote = async () => {
    if (!draft || !calculationResult) return;
    if (!capacityValidation.isValid) return;
    setIsSaving(true);
    try {
      const result = await quoteService.saveQuote(draft, calculationResult);
      setSavedQuoteId(result.id);
      setSavedReferenceNumber(result.referenceNumber);
      alert(`Quote saved! ID: ${result.id}`);
    } catch (error: any) {
      console.error('Failed to save quote:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      console.error('Error details:', error);
      alert(`Failed to save quote: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!draft || !calculationResult) return;
    if (!capacityValidation.isValid) return;
    await pdfService.generateQuotePDF(draft, calculationResult, savedQuoteId || undefined);
  };

  if (!calculationResult) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No calculation result found.</p>
          <Button onClick={() => navigate('/trip/new')}>Start New Trip</Button>
        </div>
      </div>
    );
  }

  const { total, pricePerPerson, breakdown, markup, warnings } = calculationResult;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8 lg:p-10">
        {savedReferenceNumber !== null && (
          <div className="mb-4 p-3 bg-brand-olive/5 border border-brand-olive/20 rounded">
            <div className="text-xs font-semibold text-brand-olive/80 uppercase tracking-wide">Proposal Ref</div>
            <div className="text-xl font-bold text-brand-dark">
              217-{String(savedReferenceNumber - 217000).padStart(3, '0')}
            </div>
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Itinerary & Quote</h1>

        {draft && (
          <div className="mb-6 p-4 md:p-6 bg-gray-50 rounded">
            <h2 className="font-semibold text-gray-700 mb-2">{draft.name}</h2>
            <p className="text-sm text-gray-600">
              {draft.travelers} travelers • {draft.days} days • {draft.tier}
            </p>
          </div>
        )}

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
                        // We do not mutate draft here (TripContext doesn't expose setDraft in summary).
                        alert(`Increase quantity to ${action.requiredQuantity} for item ${action.itemId}`);
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

        <div className="mb-6">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-lg font-semibold text-gray-700">Total Cost</span>
            <span className="text-2xl font-bold text-blue-600">{total}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-600">Price per Person</span>
            <span className="text-lg font-semibold text-gray-800">{pricePerPerson}</span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-brand-dark mb-3">Line-by-Line Breakdown</h3>
          {breakdown.map((category) => (
            <div key={category.category} className="mb-4 border-b border-brand-olive/20 pb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="flex items-center gap-2 font-medium text-brand-dark capitalize">
                  {getCategoryIcon(category.category)}
                  {category.category}
                </span>
                <span className="text-sm font-semibold text-brand-dark">
                  {category.subtotal}
                </span>
              </div>
              <div className="ml-4 space-y-2">
                {category.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-sm bg-brand-olive/5 p-2 rounded border border-brand-olive/10"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-brand-dark">{item.description}</div>
                      <div className="text-xs text-brand-olive/70">
                        {item.quantity} × {item.unitPrice}
                      </div>
                    </div>
                    <span className="font-semibold text-brand-dark ml-4">{item.total}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {markup.value > 0 && (
          <div className="mb-6 p-4 md:p-6 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Markup ({markup.type === 'percent' ? `${markup.value}%` : 'Fixed'})
              </span>
              <span className="text-sm font-semibold text-gray-800">{markup.amount}</span>
            </div>
          </div>
        )}

        <ValidationWarnings warnings={warnings} />

        {/* Cost Pareto Panel - shown for selected scenario */}
        {!showComparison && <CostParetoPanel calculation={calculationResult} />}

        {/* Comparison Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300 transition-colors"
          >
            {showComparison ? 'Hide Scenario Comparison' : 'Compare Scenarios'}
          </button>
        </div>

        {/* Scenario Comparison - shown when enabled */}
        {showComparison && (
          <>
            {isCalculatingScenarios && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded">
                Calculating scenarios...
              </div>
            )}
            {scenarioError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {scenarioError}
              </div>
            )}
            <PricingScenarioComparison scenarios={scenarioResults} />
            {scenarioResults.base && <CostParetoPanel calculation={scenarioResults.base} />}
          </>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={handleSaveQuote} 
            variant="primary"
            disabled={isSaving || !!savedQuoteId || !capacityValidation.isValid}
          >
            {isSaving ? 'Saving...' : savedQuoteId ? '✓ Saved' : 'Save Quote'}
          </Button>
          <Button onClick={handleExportPDF} variant="secondary" disabled={!capacityValidation.isValid}>
            Export PDF
          </Button>
          <Button onClick={() => navigate('/trip/new')} variant="secondary">
            New Trip
          </Button>
          <Button onClick={() => navigate(-1)} variant="secondary">
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

