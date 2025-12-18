import React from 'react';
import { useTrip } from '../../context/TripContext';
import { Button, Input, PricingCatalogSelect, PricingCatalogMultiSelect } from '../common';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { getParks, assertValidParkId } from '../../utils/parks';
import { ParkCard as ParkCardType } from '../../types/ui';

export const LogisticsSection: React.FC = () => {
  const { draft, updateParkCard } = useTrip();
  const { items: pricingItems, isLoading: catalogLoading } = usePricingCatalog();

  const parks = draft?.parks || [];

  if (parks.length === 0) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg text-center text-gray-500">
        No parks added yet. Please add parks in the previous step.
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Logistics by Park</h2>
      
      <div className="space-y-4">
        {parks.map((card) => {
          if (!card.parkId) {
            return null; // Skip cards without park selected
          }

          // Validate parkId
          assertValidParkId(card.parkId);

          const logistics = card.logistics || {
            internalMovements: [],
          };

          const parkName = getParks().find((p) => p.id === card.parkId)?.label || card.parkId;

          return (
            <div key={card.id} className="border border-gray-300 rounded-lg p-4 bg-white">
              <h3 className="font-semibold text-gray-800 mb-4">{parkName}</h3>

              <div className="space-y-4">
                {/* Arrival / Movement Between Parks */}
                <PricingCatalogSelect
                  label="Arrival / Movement Between Parks"
                  value={logistics.arrival}
                  onChange={(pricingItemId) =>
                    updateParkCard(card.id, {
                      logistics: {
                        ...logistics,
                        arrival: pricingItemId,
                      },
                    })
                  }
                  category="Logistics"
                  parkId={card.parkId}
                  items={pricingItems}
                  isLoading={catalogLoading}
                />

                {/* Vehicle & Driver */}
                <PricingCatalogSelect
                  label="Vehicle & Driver"
                  value={logistics.vehicle}
                  onChange={(pricingItemId) =>
                    updateParkCard(card.id, {
                      logistics: {
                        ...logistics,
                        vehicle: pricingItemId,
                      },
                    })
                  }
                  category="Logistics"
                  parkId={card.parkId}
                  items={pricingItems}
                  isLoading={catalogLoading}
                />

                {/* Internal Movements (Multi-select) */}
                <PricingCatalogMultiSelect
                  label="Internal Movements"
                  selectedIds={logistics.internalMovements}
                  onChange={(pricingItemIds) =>
                    updateParkCard(card.id, {
                      logistics: {
                        ...logistics,
                        internalMovements: pricingItemIds,
                      },
                    })
                  }
                  category="Logistics"
                  parkId={card.parkId}
                  items={pricingItems}
                  isLoading={catalogLoading}
                />

                {/* Notes (Optional) */}
                <Input
                  label="Notes (optional)"
                  value={logistics.notes || ''}
                  onChange={(value) =>
                    updateParkCard(card.id, {
                      logistics: {
                        ...logistics,
                        notes: value as string,
                      },
                    })
                  }
                  placeholder="Operator / planner notes..."
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


