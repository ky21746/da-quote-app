import React from 'react';
import { DayCard as DayCardType } from '../../types/ui';
import { Input, PricingCatalogSelect, PricingCatalogMultiSelect } from '../common';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { Calendar } from 'lucide-react';

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
        onChange={(pricingItemIds) => onUpdate({ activities: pricingItemIds })}
        category="Activities"
        parkId={parkId}
        items={pricingItems}
        isLoading={catalogLoading}
      />

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

