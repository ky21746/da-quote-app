import React from 'react';
import { DayCard as DayCardType } from '../../types/ui';
import { Input, PricingCatalogSelect, PricingCatalogMultiSelect } from '../common';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { Calendar } from 'lucide-react';
import { useTrip } from '../../context/TripContext';

interface DayCardProps {
  dayCard: DayCardType;
  parkId: string;
  isFirstDay: boolean;
  isLastDay: boolean;
  onUpdate: (updates: Partial<DayCardType>) => void;
}

export const DayCard: React.FC<DayCardProps> = ({
  dayCard,
  parkId,
  isFirstDay,
  isLastDay,
  onUpdate,
}) => {
  const { items: pricingItems, isLoading: catalogLoading } = usePricingCatalog();
  const { draft, setDraft } = useTrip();

  const getQuantityOptions = (min: number): number[] => {
    const max = Math.max(min, 10);
    return Array.from({ length: max }, (_, i) => i + 1);
  };

  return (
    <div className="border border-brand-olive/30 rounded-lg p-4 md:p-5 mb-3 bg-brand-olive/5">
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={18} className="text-brand-dark" />
        <h4 className="font-semibold text-brand-dark">
          Day {dayCard.dayNumber}
        </h4>
      </div>

      {/* Day Title (Optional) */}
      <Input
        label="Day Title (optional)"
        value={dayCard.title || ''}
        onChange={(value) => onUpdate({ title: value as string })}
        placeholder="e.g., Morning Safari, Gorilla Trekking"
      />

      {/* Activities for this day */}
      <PricingCatalogMultiSelect
        label="Activities"
        selectedIds={dayCard.activities}
        onChange={(pricingItemIds) => {
          onUpdate({ activities: pricingItemIds });
          setDraft((prev) => {
            if (!prev) return prev;
            const nextItemQuantities: Record<string, number> = {
              ...(prev.itemQuantities || {}),
            };

            const nextSources: Record<string, 'auto' | 'manual'> = {
              ...(prev.itemQuantitySources || {}),
            };

            for (const id of pricingItemIds || []) {
              if (nextItemQuantities[id] === undefined) {
                nextItemQuantities[id] = 1;
                nextSources[id] = nextSources[id] || 'auto';
              }
            }
            return {
              ...prev,
              itemQuantities: nextItemQuantities,
              itemQuantitySources: nextSources,
            };
          });
        }}
        category="Activities"
        parkId={parkId}
        items={pricingItems}
        isLoading={catalogLoading}
      />

      {(dayCard.activities || []).length > 0 && (
        <div className="mt-2 border border-brand-olive/20 rounded-md p-3 bg-white/60">
          <div className="text-sm font-semibold text-brand-dark mb-2">Activity Quantities</div>
          <div className="space-y-2">
            {(dayCard.activities || []).map((activityId) => {
              const item = pricingItems.find((i) => i.id === activityId);
              if (!item) return null;
              return (
                <div key={activityId} className="flex items-center justify-between gap-3">
                  <div className="text-sm text-gray-700">{item.itemName}</div>
                  <select
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                    value={draft?.itemQuantities?.[activityId] ?? 1}
                    onChange={(e) => {
                      const newQty = Number(e.target.value);
                      setDraft((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          itemQuantities: {
                            ...(prev.itemQuantities || {}),
                            [activityId]: newQty,
                          },
                          itemQuantitySources: {
                            ...(prev.itemQuantitySources || {}),
                            [activityId]: 'manual',
                          },
                        };
                      });
                    }}
                  >
                    {getQuantityOptions(1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Extras for this day */}
      <PricingCatalogMultiSelect
        label="Extras"
        selectedIds={dayCard.extras}
        onChange={(pricingItemIds) => onUpdate({ extras: pricingItemIds })}
        category="Extras"
        parkId={parkId}
        items={pricingItems}
        isLoading={catalogLoading}
      />

      {/* Departure to next park (only on last day) */}
      {isLastDay && (
        <PricingCatalogSelect
          label="Departure to Next Park"
          value={dayCard.departureToNextPark}
          onChange={(pricingItemId) => onUpdate({ departureToNextPark: pricingItemId })}
          category="Logistics"
          parkId={parkId}
          items={pricingItems}
          isLoading={catalogLoading}
        />
      )}

      {/* Notes */}
      <Input
        label="Notes (optional)"
        value={dayCard.notes || ''}
        onChange={(value) => onUpdate({ notes: value as string })}
        placeholder="e.g., Early morning start, Checkout at 11am"
      />
    </div>
  );
};

