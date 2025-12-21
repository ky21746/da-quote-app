import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { Button, ProgressStepper } from '../common';
import { getPricingItemById, getPricingItemsByIds } from '../../utils/pricingCatalogHelpers';
import { getParks, assertValidParkId } from '../../utils/parks';
import { formatCurrency } from '../../utils/currencyFormatter';
import { Calendar, AlertCircle } from 'lucide-react';

export const ReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { draft } = useTrip();
  const { items: pricingItems } = usePricingCatalog();

  const getParkName = (parkId?: string): string => {
    if (!parkId) return 'Not selected';
    try {
      assertValidParkId(parkId);
      return getParks().find((p) => p.id === parkId)?.label || parkId;
    } catch {
      return parkId;
    }
  };

  const progressSteps = [
    'Setup',
    'Parks',
    'Summary',
    'Pricing',
  ];

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

  const tripDays = draft.tripDays || [];

  const renderDayReview = (day: typeof tripDays[0]) => {
    const parkName = getParkName(day.parkId);
    const arrivalItem = day.arrival ? getPricingItemById(pricingItems, day.arrival) : undefined;
    const lodgingItem = day.lodging ? getPricingItemById(pricingItems, day.lodging) : undefined;
    const activityItems = getPricingItemsByIds(pricingItems, day.activities || []);
    const logistics = day.logistics;
    const logisticsVehicle = logistics?.vehicle ? getPricingItemById(pricingItems, logistics.vehicle) : undefined;
    const logisticsInternal = getPricingItemsByIds(pricingItems, logistics?.internalMovements || []);

    // Collect warnings for this day
    const warnings: string[] = [];
    
    if (day.parkId && !day.arrival) {
      warnings.push(`Day ${day.dayNumber} - ${parkName}: Arrival to Park not selected`);
    }
    
    if (day.parkId && !day.lodging && day.dayNumber < (draft.days || 0)) {
      // Only warn about missing lodging if it's not the last day
      warnings.push(`Day ${day.dayNumber} - ${parkName}: Lodging not selected`);
    }
    
    if (day.parkId && (!day.activities || day.activities.length === 0)) {
      warnings.push(`Day ${day.dayNumber} - ${parkName}: No activities selected`);
    }
    
    if (day.parkId && logistics && !logistics.vehicle) {
      warnings.push(`Day ${day.dayNumber} - ${parkName}: Vehicle & Driver not selected`);
    }

    return (
      <div key={day.dayNumber} className="mb-6 p-4 md:p-6 border border-gray-300 rounded-lg bg-white">
        {/* Day Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-brand-dark" />
            <h3 className="text-lg font-semibold text-gray-800">Day {day.dayNumber}</h3>
            {day.parkId && (
              <>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600">{parkName}</span>
              </>
            )}
          </div>
          <Button
            onClick={() => navigate(`/trip/${id}/edit`)}
            variant="secondary"
            type="button"
          >
            Edit Day
          </Button>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium text-yellow-800 mb-2">Missing Selections:</div>
                <ul className="space-y-1">
                  {warnings.map((warning, idx) => (
                    <li key={idx} className="text-sm text-yellow-700">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Selected Components */}
        <div className="space-y-4">
          {/* Park */}
          {day.parkId ? (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Park:</span>{' '}
              <span className="text-gray-600">{parkName}</span>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Park: Not selected</div>
          )}

          {/* Arrival / Aviation */}
          {arrivalItem ? (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Arrival to Park:</span>{' '}
              <span className="text-gray-600">{arrivalItem.itemName}</span>
              <span className="text-gray-500 ml-2">
                ({formatCurrency(arrivalItem.basePrice)} - {arrivalItem.costType.replace(/_/g, ' ')})
              </span>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Arrival to Park: Not selected</div>
          )}

          {/* Lodging */}
          {lodgingItem ? (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Lodging:</span>{' '}
              <span className="text-gray-600">{lodgingItem.itemName}</span>
              <span className="text-gray-500 ml-2">
                ({formatCurrency(lodgingItem.basePrice)} - {lodgingItem.costType.replace(/_/g, ' ')})
              </span>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Lodging: Not selected</div>
          )}

          {/* Activities */}
          {activityItems.length > 0 ? (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Activities:</span>
              <ul className="ml-4 mt-1 space-y-1">
                {activityItems.map((activity) => (
                  <li key={activity.id} className="text-gray-600">
                    {activity.itemName}
                    <span className="text-gray-500 ml-2">
                      ({formatCurrency(activity.basePrice)} - {activity.costType.replace(/_/g, ' ')})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Activities: None selected</div>
          )}

          {/* Logistics */}
          {(logistics?.vehicle || (logistics?.internalMovements && logistics.internalMovements.length > 0) || logistics?.notes) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Logistics</h4>
              <div className="space-y-2 text-sm">
                {logisticsVehicle ? (
                  <div>
                    <span className="font-medium text-gray-700">Vehicle & Driver:</span>{' '}
                    <span className="text-gray-600">{logisticsVehicle.itemName}</span>
                    <span className="text-gray-500 ml-2">
                      ({formatCurrency(logisticsVehicle.basePrice)} - {logisticsVehicle.costType.replace(/_/g, ' ')})
                    </span>
                  </div>
                ) : (
                  <div className="text-gray-400">Vehicle & Driver: Not selected</div>
                )}

                {logisticsInternal.length > 0 ? (
                  <div>
                    <span className="font-medium text-gray-700">Internal Movements:</span>
                    <ul className="ml-4 mt-1 space-y-1">
                      {logisticsInternal.map((movement) => (
                        <li key={movement.id} className="text-gray-600">
                          {movement.itemName}
                          <span className="text-gray-500 ml-2">
                            ({formatCurrency(movement.basePrice)} - {movement.costType.replace(/_/g, ' ')})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-gray-400">Internal Movements: None selected</div>
                )}

                {logistics.notes && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="font-medium text-gray-700">Notes:</span>{' '}
                    <span className="text-gray-600 italic">{logistics.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8 lg:p-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Review</h1>

        <ProgressStepper currentStep={4} steps={progressSteps} />

        {/* Trip Overview Card */}
        <div className="mb-6 p-4 md:p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="font-semibold text-gray-700 mb-3">Trip Overview</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">Trip Name:</span> {draft.name}
            </div>
            <div>
              <span className="font-medium">Number of Travelers:</span> {draft.travelers}
            </div>
            <div>
              <span className="font-medium">Number of Days:</span> {draft.days}
            </div>
            <div>
              <span className="font-medium">Tier:</span> {draft.tier}
            </div>
          </div>
        </div>

        {/* Days Review */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Trip Days Review</h2>
          {tripDays.length === 0 ? (
            <div className="p-4 md:p-6 border border-gray-200 rounded-lg text-center text-gray-500">
              No trip days configured yet
            </div>
          ) : (
            <div className="space-y-4">{tripDays.map((day) => renderDayReview(day))}</div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex gap-2">
          <Button onClick={() => navigate(-1)} variant="secondary">
            Back
          </Button>
          <Button
            onClick={() => navigate(`/trip/${id}/pricing`)}
            variant="primary"
          >
            Proceed to Pricing
          </Button>
        </div>
      </div>
    </div>
  );
};

