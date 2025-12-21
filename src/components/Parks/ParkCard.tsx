import React from 'react';
import { ParkCard as ParkCardType } from '../../types/ui';
import { Select, Input, PricingCatalogSelect, PricingCatalogMultiSelect } from '../common';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { getParks, assertValidParkId } from '../../utils/parks';
import { Trees } from 'lucide-react';
import { DayCard } from './DayCard';
import { useTrip } from '../../context/TripContext';

interface ParkCardProps {
  card: ParkCardType;
  onUpdate: (updates: Partial<ParkCardType>) => void;
  onRemove: () => void;
}

export const ParkCard: React.FC<ParkCardProps> = ({ card, onUpdate, onRemove }) => {
  const { items: pricingItems, isLoading: catalogLoading } = usePricingCatalog();
  const { updateDayCard } = useTrip();

  const parkOptions = [
    { value: '', label: 'Select a park...' },
    ...getParks().map((park) => ({ value: park.id, label: park.label })),
  ];

  return (
    <div className="border border-gray-300 rounded-lg p-4 md:p-6 lg:p-8 mb-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="flex items-center gap-2 font-semibold text-brand-dark">
          <Trees size={20} className="text-brand-dark" />
          Park Card
        </h3>
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
            // Keep nights when changing park, but reset days
            arrival: undefined,
            lodging: undefined,
            transport: undefined,
            days: card.nights ? Array.from({ length: card.nights }, (_, i) => ({
              id: `day_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`,
              dayNumber: i + 1,
              activities: [],
              extras: [],
            })) : [],
            activities: [],
            extras: [],
            logistics: {
              internalMovements: [],
            },
          });
        }}
        options={parkOptions}
      />

      {/* Nights Input - shown only after park selected */}
      {card.parkId && (
        <Input
          label="Nights"
          type="number"
          value={card.nights || 1}
          onChange={(value) => onUpdate({ nights: Number(value) })}
          min={1}
          max={30}
        />
      )}

      {/* Park-level settings shown only after park selected */}
      {card.parkId && (() => {
        // HARD ASSERT: ParkId must not be lost
        if (!card.parkId || card.parkId === '') {
          throw new Error("ParkId lost in Trip Builder flow");
        }

        // Type guard: Validate parkId exists in parks list
        assertValidParkId(card.parkId);

        const days = card.days || [];

        return (
          <div className="space-y-4 mt-4">
            {/* 3. Arrival to Park (Flight or Vehicle) - park-level */}
            <PricingCatalogSelect
              label="Arrival to Park (Flight or Vehicle)"
              value={card.arrival}
              onChange={(pricingItemId) => onUpdate({ arrival: pricingItemId })}
              category="Aviation"
              parkId={card.parkId}
              items={pricingItems}
              isLoading={catalogLoading}
            />

            {/* 4. Lodging - park-level (applies to all nights) */}
            <PricingCatalogSelect
              label="Lodging (all nights)"
              value={card.lodging}
              onChange={(pricingItemId) => onUpdate({ lodging: pricingItemId })}
              category="Lodging"
              parkId={card.parkId}
              items={pricingItems}
              isLoading={catalogLoading}
            />

            {/* 5. Activities - park-level */}
            <PricingCatalogMultiSelect
              label="Activities"
              selectedIds={card.activities || []}
              onChange={(pricingItemIds) => onUpdate({ activities: pricingItemIds })}
              category="Activities"
              parkId={card.parkId}
              items={pricingItems}
              isLoading={catalogLoading}
            />

            {/* 6. Logistics - park-level */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-brand-dark mb-3">Logistics</h4>

              {/* Arrival Between Parks */}
              <PricingCatalogSelect
                label="Arrival Between Parks"
                value={card.logistics?.arrival}
                onChange={(pricingItemId) => onUpdate({
                  logistics: {
                    arrival: pricingItemId,
                    vehicle: card.logistics?.vehicle,
                    internalMovements: card.logistics?.internalMovements || [],
                    notes: card.logistics?.notes,
                  }
                })}
                category="Logistics"
                parkId={card.parkId}
                items={pricingItems}
                isLoading={catalogLoading}
              />

              {/* Vehicle & Driver */}
              <PricingCatalogSelect
                label="Vehicle & Driver"
                value={card.logistics?.vehicle}
                onChange={(pricingItemId) => onUpdate({
                  logistics: {
                    arrival: card.logistics?.arrival,
                    vehicle: pricingItemId,
                    internalMovements: card.logistics?.internalMovements || [],
                    notes: card.logistics?.notes,
                  }
                })}
                category="Vehicle"
                parkId={card.parkId}
                items={pricingItems}
                isLoading={catalogLoading}
              />

              {/* Internal Movements */}
              <PricingCatalogMultiSelect
                label="Internal Movements"
                selectedIds={card.logistics?.internalMovements || []}
                onChange={(pricingItemIds) => onUpdate({
                  logistics: {
                    arrival: card.logistics?.arrival,
                    vehicle: card.logistics?.vehicle,
                    internalMovements: pricingItemIds,
                    notes: card.logistics?.notes,
                  }
                })}
                category="Logistics"
                parkId={card.parkId}
                items={pricingItems}
                isLoading={catalogLoading}
              />

              {/* Logistics Notes */}
              <Input
                label="Logistics Notes (optional)"
                value={card.logistics?.notes || ''}
                onChange={(value) => onUpdate({
                  logistics: {
                    arrival: card.logistics?.arrival,
                    vehicle: card.logistics?.vehicle,
                    internalMovements: card.logistics?.internalMovements || [],
                    notes: value as string,
                  }
                })}
                placeholder="Additional logistics information..."
              />
            </div>

            {/* Day Cards - show all days based on trip days, not just nights */}
            {card.parkId && days.length > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-brand-dark mb-3">
                  Daily Itinerary ({days.length} days, {card.nights || 0} nights)
                </h4>
                <div className="space-y-3">
                  {days.map((dayCard, index) => {
                    // Determine if this day has lodging (all days except possibly the last one)
                    const hasLodging = index < (card.nights || days.length - 1);
                    const isLastDay = index === days.length - 1;

                    return (
                      <div key={dayCard.id} className={!hasLodging ? 'opacity-75' : ''}>
                        {!hasLodging && (
                          <div className="mb-2 text-xs text-orange-600 font-medium">
                            ⚠️ No lodging for this day
                          </div>
                        )}
                        <DayCard
                          dayCard={dayCard}
                          parkId={card.parkId!}
                          isFirstDay={index === 0}
                          isLastDay={isLastDay}
                          onUpdate={(updates) => updateDayCard(card.id, dayCard.id, updates)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

