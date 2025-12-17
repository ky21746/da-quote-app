import React, { useState } from 'react';
import { ParkCard as ParkCardType } from '../../types/ui';
import { Select, Input, PricingCatalogSelect, PricingCatalogMultiSelect } from '../common';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { getParks, assertValidParkId } from '../../utils/parks';

interface ParkCardProps {
  card: ParkCardType;
  onUpdate: (updates: Partial<ParkCardType>) => void;
  onRemove: () => void;
}

export const ParkCard: React.FC<ParkCardProps> = ({ card, onUpdate, onRemove }) => {
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(false);
  const { items: pricingItems } = usePricingCatalog();
  
  const logistics = card.logistics || {
    internalMovements: [],
  };

  const parkOptions = [
    { value: '', label: 'Select a park...' },
    ...getParks().map((park) => ({ value: park.id, label: park.label })),
  ];

  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Park Card</h3>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Remove
        </button>
      </div>

      {/* Park Selector */}
      <Select
        label="Park"
        value={card.parkId || ''}
        onChange={(value) => {
          // When park changes, reset all dependent fields including logistics
          const selectedParkId = value || undefined;
          
          // HARD ASSERT: ParkId must not be lost
          if (selectedParkId === null || selectedParkId === '') {
            throw new Error("ParkId lost in Trip Builder flow");
          }
          
          // Type guard: Validate parkId before updating
          if (selectedParkId) {
            assertValidParkId(selectedParkId);
          }
          
          onUpdate({
            parkId: selectedParkId,
            arrival: undefined,
            lodging: undefined,
            transport: undefined,
            activities: [],
            extras: [],
            logistics: {
              internalMovements: [],
            },
          });
        }}
        options={parkOptions}
      />

      {/* Categories shown only after park selected */}
      {card.parkId && (() => {
        // HARD ASSERT: ParkId must not be lost
        if (!card.parkId || card.parkId === '') {
          throw new Error("ParkId lost in Trip Builder flow");
        }
        
        // Type guard: Validate parkId exists in parks list
        assertValidParkId(card.parkId);
        
        return (
        <div className="space-y-4 mt-4">
          {/* Arrival / Aviation */}
          <PricingCatalogSelect
            label="Arrival / Aviation"
            value={card.arrival}
            onChange={(pricingItemId) => onUpdate({ arrival: pricingItemId })}
            category="Aviation"
            parkId={card.parkId}
            items={pricingItems}
          />

          {/* Lodging */}
          <PricingCatalogSelect
            label="Lodging"
            value={card.lodging}
            onChange={(pricingItemId) => onUpdate({ lodging: pricingItemId })}
            category="Lodging"
            parkId={card.parkId}
            items={pricingItems}
          />

          {/* Local Transportation */}
          <PricingCatalogSelect
            label="Local Transportation"
            value={card.transport}
            onChange={(pricingItemId) => onUpdate({ transport: pricingItemId })}
            category="Vehicle"
            parkId={card.parkId}
            items={pricingItems}
          />

          {/* Activities (Multi-select) */}
          <PricingCatalogMultiSelect
            label="Activities"
            selectedIds={card.activities}
            onChange={(pricingItemIds) => onUpdate({ activities: pricingItemIds })}
            category="Activities"
            parkId={card.parkId}
            items={pricingItems}
          />

          {/* Extras (Multi-select) */}
          <PricingCatalogMultiSelect
            label="Extras"
            selectedIds={card.extras}
            onChange={(pricingItemIds) => onUpdate({ extras: pricingItemIds })}
            category="Extras"
            parkId={card.parkId}
            items={pricingItems}
          />

          {/* Logistics Section (Collapsible) */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <button
              onClick={() => setIsLogisticsOpen(!isLogisticsOpen)}
              className="w-full flex justify-between items-center text-left mb-2"
            >
              <h4 className="font-semibold text-gray-700">Logistics</h4>
              <span className="text-gray-500">
                {isLogisticsOpen ? '−' : '+'}
              </span>
            </button>

            {isLogisticsOpen && (
              <div className="space-y-4 mt-4 pl-2">
                {/* Arrival / Movement Between Parks */}
                <PricingCatalogSelect
                  label="Arrival / Movement Between Parks"
                  value={logistics.arrival}
                  onChange={(pricingItemId) =>
                    onUpdate({
                      logistics: {
                        ...logistics,
                        arrival: pricingItemId,
                      },
                    })
                  }
                  category="Logistics"
                  parkId={card.parkId}
                  items={pricingItems}
                />

                {/* Vehicle & Driver */}
                <PricingCatalogSelect
                  label="Vehicle & Driver"
                  value={logistics.vehicle}
                  onChange={(pricingItemId) =>
                    onUpdate({
                      logistics: {
                        ...logistics,
                        vehicle: pricingItemId,
                      },
                    })
                  }
                  category="Logistics"
                  parkId={card.parkId}
                  items={pricingItems}
                />

                {/* Internal Movements (Multi-select) */}
                <PricingCatalogMultiSelect
                  label="Internal Movements"
                  selectedIds={logistics.internalMovements}
                  onChange={(pricingItemIds) =>
                    onUpdate({
                      logistics: {
                        ...logistics,
                        internalMovements: pricingItemIds,
                      },
                    })
                  }
                  category="Logistics"
                  parkId={card.parkId}
                  items={pricingItems}
                />

                {/* Notes (Optional) */}
                <Input
                  label="Notes (optional)"
                  value={logistics.notes || ''}
                  onChange={(value) =>
                    onUpdate({
                      logistics: {
                        ...logistics,
                        notes: value as string,
                      },
                    })
                  }
                  placeholder="Operator / planner notes..."
                />
              </div>
            )}
          </div>
        </div>
        );
      })()}
    </div>
  );
};

