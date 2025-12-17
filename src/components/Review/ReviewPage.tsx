import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { Button, ProgressStepper } from '../common';
import { ParkCard } from '../../types/ui';
import { getPricingItemById, getPricingItemsByIds } from '../../utils/pricingCatalogHelpers';
import { PARKS } from '../../constants/parks';

export const ReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { draft } = useTrip();
  const { items: pricingItems } = usePricingCatalog();

  const getParkName = (parkId?: string): string => {
    if (!parkId) return 'Not selected';
    return PARKS.find((p) => p.id === parkId)?.label || parkId;
  };

  const progressSteps = [
    'Basic Setup',
    'Attractions & Parks',
    'Logistics',
    'Review & Pricing',
  ];

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

  const parks = draft.parks || [];

  const renderParkReview = (card: ParkCard, index: number) => {
    const parkName = getParkName(card.parkId);
    const arrivalItem = card.arrival ? getPricingItemById(pricingItems, card.arrival) : undefined;
    const lodgingItem = card.lodging ? getPricingItemById(pricingItems, card.lodging) : undefined;
    const transportItem = card.transport ? getPricingItemById(pricingItems, card.transport) : undefined;
    const activityItems = getPricingItemsByIds(pricingItems, card.activities);
    const extraItems = getPricingItemsByIds(pricingItems, card.extras);
    const logistics = card.logistics;
    const logisticsArrival = logistics?.arrival ? getPricingItemById(pricingItems, logistics.arrival) : undefined;
    const logisticsVehicle = logistics?.vehicle ? getPricingItemById(pricingItems, logistics.vehicle) : undefined;
    const logisticsInternal = getPricingItemsByIds(pricingItems, logistics?.internalMovements || []);

    return (
      <div key={card.id} className="mb-6 p-4 border border-gray-300 rounded-lg bg-white">
        {/* Park Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{parkName}</h3>
          <Button
            onClick={() => navigate(`/trip/${id}/edit`)}
            variant="secondary"
            type="button"
          >
            Edit Park
          </Button>
        </div>

        {/* Selected Components */}
        <div className="space-y-4">
          {/* Arrival / Aviation */}
          {arrivalItem ? (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Arrival / Aviation:</span>{' '}
              <span className="text-gray-600">{arrivalItem.itemName}</span>
              <span className="text-gray-500 ml-2">
                (USD {arrivalItem.basePrice.toFixed(2)} - {arrivalItem.costType.replace(/_/g, ' ')})
              </span>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Arrival / Aviation: Not selected</div>
          )}

          {/* Lodging */}
          {lodgingItem ? (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Lodging:</span>{' '}
              <span className="text-gray-600">{lodgingItem.itemName}</span>
              <span className="text-gray-500 ml-2">
                (USD {lodgingItem.basePrice.toFixed(2)} - {lodgingItem.costType.replace(/_/g, ' ')})
              </span>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Lodging: Not selected</div>
          )}

          {/* Transportation */}
          {transportItem ? (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Transportation:</span>{' '}
              <span className="text-gray-600">{transportItem.itemName}</span>
              <span className="text-gray-500 ml-2">
                (USD {transportItem.basePrice.toFixed(2)} - {transportItem.costType.replace(/_/g, ' ')})
              </span>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Transportation: Not selected</div>
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
                      (USD {activity.basePrice.toFixed(2)} - {activity.costType.replace(/_/g, ' ')})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Activities: None selected</div>
          )}

          {/* Extras */}
          {extraItems.length > 0 ? (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Extras:</span>
              <ul className="ml-4 mt-1 space-y-1">
                {extraItems.map((extra) => (
                  <li key={extra.id} className="text-gray-600">
                    {extra.itemName}
                    <span className="text-gray-500 ml-2">
                      (USD {extra.basePrice.toFixed(2)} - {extra.costType.replace(/_/g, ' ')})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Extras: None selected</div>
          )}

          {/* Logistics */}
          {logistics && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Logistics</h4>
              <div className="space-y-2 text-sm">
                {logisticsArrival ? (
                  <div>
                    <span className="font-medium text-gray-700">Arrival Between Parks:</span>{' '}
                    <span className="text-gray-600">{logisticsArrival.itemName}</span>
                    <span className="text-gray-500 ml-2">
                      (USD {logisticsArrival.basePrice.toFixed(2)} - {logisticsArrival.costType.replace(/_/g, ' ')})
                    </span>
                  </div>
                ) : (
                  <div className="text-gray-400">Arrival Between Parks: Not selected</div>
                )}

                {logisticsVehicle ? (
                  <div>
                    <span className="font-medium text-gray-700">Vehicle & Driver:</span>{' '}
                    <span className="text-gray-600">{logisticsVehicle.itemName}</span>
                    <span className="text-gray-500 ml-2">
                      (USD {logisticsVehicle.basePrice.toFixed(2)} - {logisticsVehicle.costType.replace(/_/g, ' ')})
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
                            (USD {movement.basePrice.toFixed(2)} - {movement.costType.replace(/_/g, ' ')})
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Review</h1>

        <ProgressStepper currentStep={4} steps={progressSteps} />

        {/* Trip Overview Card */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
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

        {/* Parks Review */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Parks Review</h2>
          {parks.length === 0 ? (
            <div className="p-4 border border-gray-200 rounded-lg text-center text-gray-500">
              No parks added yet
            </div>
          ) : (
            <div className="space-y-4">{parks.map((card, index) => renderParkReview(card, index))}</div>
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

