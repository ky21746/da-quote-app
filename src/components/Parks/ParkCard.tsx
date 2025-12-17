import React from 'react';
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
  const { items: pricingItems, isLoading: catalogLoading } = usePricingCatalog();

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
            isLoading={catalogLoading}
          />

          {/* Lodging */}
          <PricingCatalogSelect
            label="Lodging"
            value={card.lodging}
            onChange={(pricingItemId) => onUpdate({ lodging: pricingItemId })}
            category="Lodging"
            parkId={card.parkId}
            items={pricingItems}
            isLoading={catalogLoading}
          />

          {/* Local Transportation */}
          <PricingCatalogSelect
            label="Local Transportation"
            value={card.transport}
            onChange={(pricingItemId) => onUpdate({ transport: pricingItemId })}
            category="Vehicle"
            parkId={card.parkId}
            items={pricingItems}
            isLoading={catalogLoading}
          />

          {/* Activities (Multi-select) */}
          <PricingCatalogMultiSelect
            label="Activities"
            selectedIds={card.activities}
            onChange={(pricingItemIds) => onUpdate({ activities: pricingItemIds })}
            category="Activities"
            parkId={card.parkId}
            items={pricingItems}
            isLoading={catalogLoading}
          />

          {/* Extras (Multi-select) */}
          <PricingCatalogMultiSelect
            label="Extras"
            selectedIds={card.extras}
            onChange={(pricingItemIds) => onUpdate({ extras: pricingItemIds })}
            category="Extras"
            parkId={card.parkId}
            items={pricingItems}
            isLoading={catalogLoading}
          />

          {/* Logistics Section (Collapsible) - Hidden in Parks page, shown in Logistics page */}
          {/* Note: Logistics fields are now handled in LogisticsSection component */}
        </div>
        );
      })()}
    </div>
  );
};

