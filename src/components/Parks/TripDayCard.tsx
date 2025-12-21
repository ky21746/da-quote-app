import React from 'react';
import { Select, Input, PricingCatalogSelect, PricingCatalogMultiSelect } from '../common';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { getParks, assertValidParkId } from '../../utils/parks';
import { Calendar, ChevronRight } from 'lucide-react';

interface TripDayCardProps {
  dayNumber: number; // 1, 2, 3... (global trip day)
  parkId?: string;
  arrival?: string; // pricingItemId
  lodging?: string; // pricingItemId
  activities: string[]; // pricingItemIds
  logistics?: {
    vehicle?: string; // pricingItemId
    internalMovements: string[]; // pricingItemIds
    notes?: string;
  };
  onUpdate: (updates: {
    parkId?: string;
    arrival?: string;
    lodging?: string;
    activities?: string[];
    logistics?: {
      vehicle?: string;
      internalMovements?: string[];
      notes?: string;
    };
  }) => void;
  onNextDay?: () => void;
  isLastDay?: boolean;
}

export const TripDayCard: React.FC<TripDayCardProps> = ({
  dayNumber,
  parkId,
  arrival,
  lodging,
  activities,
  logistics,
  onUpdate,
  onNextDay,
  isLastDay,
}) => {
  const { items: pricingItems, isLoading: catalogLoading } = usePricingCatalog();

  const parkOptions = [
    { value: '', label: 'Select a park...' },
    ...getParks().map((park) => ({ value: park.id, label: park.label })),
  ];

  return (
    <div className="border border-gray-300 rounded-lg p-4 md:p-6 lg:p-8 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={20} className="text-brand-dark" />
        <h3 className="font-semibold text-brand-dark">Day {dayNumber}</h3>
      </div>

      <div className="space-y-4">
        {/* 1. Park Selection */}
        <Select
          label="Park"
          value={parkId || ''}
          onChange={(value) => {
            const selectedParkId = value || undefined;
            if (selectedParkId) {
              assertValidParkId(selectedParkId);
            }
            onUpdate({
              parkId: selectedParkId,
              arrival: undefined, // Reset arrival when park changes
            });
          }}
          options={parkOptions}
        />

        {/* 2. Arrival to Park (Flight or Vehicle) */}
        {parkId && (
          <PricingCatalogSelect
            label="Arrival to Park (Flight or Vehicle)"
            value={arrival}
            onChange={(pricingItemId) => onUpdate({ arrival: pricingItemId })}
            category="Aviation"
            parkId={parkId}
            items={pricingItems}
            isLoading={catalogLoading}
          />
        )}

        {/* 3. Lodging */}
        {parkId && (
          <PricingCatalogSelect
            label="Lodging"
            value={lodging}
            onChange={(pricingItemId) => onUpdate({ lodging: pricingItemId })}
            category="Lodging"
            parkId={parkId}
            items={pricingItems}
            isLoading={catalogLoading}
          />
        )}

        {/* 4. Activities */}
        {parkId && (
          <PricingCatalogMultiSelect
            label="Activities"
            selectedIds={activities || []}
            onChange={(pricingItemIds) => onUpdate({ activities: pricingItemIds })}
            category="Activities"
            parkId={parkId}
            items={pricingItems}
            isLoading={catalogLoading}
          />
        )}

        {/* 5. Logistics */}
        {parkId && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-brand-dark mb-3">Logistics</h4>

            {/* Vehicle & Driver */}
            <PricingCatalogSelect
              label="Vehicle & Driver"
              value={logistics?.vehicle}
              onChange={(pricingItemId) => onUpdate({
                logistics: {
                  ...logistics,
                  vehicle: pricingItemId,
                  internalMovements: logistics?.internalMovements || [],
                }
              })}
              category="Vehicle"
              parkId={parkId}
              items={pricingItems}
              isLoading={catalogLoading}
            />

            {/* Internal Movements */}
            <PricingCatalogMultiSelect
              label="Internal Movements"
              selectedIds={logistics?.internalMovements || []}
              onChange={(pricingItemIds) => onUpdate({
                logistics: {
                  ...logistics,
                  internalMovements: pricingItemIds,
                }
              })}
              category="Logistics"
              parkId={parkId}
              items={pricingItems}
              isLoading={catalogLoading}
            />

            {/* Logistics Notes */}
            <Input
              label="Logistics Notes (optional)"
              value={logistics?.notes || ''}
              onChange={(value) => onUpdate({
                logistics: {
                  ...logistics,
                  notes: value as string,
                  internalMovements: logistics?.internalMovements || [],
                }
              })}
              placeholder="Additional logistics information..."
            />
          </div>
        )}
      </div>

      {!isLastDay && onNextDay && (
        <div className="mt-8 flex justify-end pt-4 border-t border-gray-100">
          <button
            onClick={onNextDay}
            className="flex items-center gap-2 px-4 py-2 bg-brand-olive text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
          >
            Next Day
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
