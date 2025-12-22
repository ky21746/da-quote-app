import React from 'react';
import { Select, Input, PricingCatalogSelect, PricingCatalogMultiSelect } from '../common';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { getParks, assertValidParkId } from '../../utils/parks';
import { Calendar, ChevronRight } from 'lucide-react';
import { useTrip } from '../../context/TripContext';

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
  const { draft, setDraft } = useTrip();

  const travelers = draft?.travelers || 0;

  const getDefaultQuantity = (capacity: number): number => {
    if (!Number.isFinite(capacity) || capacity <= 0) return 1;
    if (travelers > capacity) return Math.ceil(travelers / capacity);
    return 1;
  };

  const getQuantityOptions = (min: number): number[] => {
    const max = Math.max(min, 10);
    return Array.from({ length: max }, (_, i) => i + 1);
  };

  const selectedArrivalItem = arrival
    ? pricingItems.find((i) => i.id === arrival) || null
    : null;
  const selectedVehicleItem = logistics?.vehicle
    ? pricingItems.find((i) => i.id === logistics.vehicle) || null
    : null;

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
          <div>
            <PricingCatalogSelect
              label="Arrival to Park (Flight or Vehicle)"
              value={arrival}
              onChange={(pricingItemId) => {
                onUpdate({ arrival: pricingItemId });

                setDraft((prev) => {
                  if (!prev) return prev;

                  const nextItemQuantities: Record<string, number> = {
                    ...(prev.itemQuantities || {}),
                  };

                  if (pricingItemId) {
                    const selected = pricingItems.find((i) => i.id === pricingItemId);
                    const capacity = selected?.capacity;
                    if (typeof capacity === 'number' && Number.isFinite(capacity)) {
                      if (nextItemQuantities[pricingItemId] === undefined) {
                        nextItemQuantities[pricingItemId] = getDefaultQuantity(capacity);
                      }
                    }
                  }

                  return {
                    ...prev,
                    itemQuantities: nextItemQuantities,
                  };
                });
              }}
              category="Aviation"
              parkId={parkId}
              items={pricingItems}
              isLoading={catalogLoading}
            />

            {arrival &&
              selectedArrivalItem &&
              typeof selectedArrivalItem.capacity === 'number' &&
              Number.isFinite(selectedArrivalItem.capacity) && (
                <div className="flex items-center gap-3 mt-2">
                  <label className="text-xs font-medium text-gray-700">Quantity</label>
                  <select
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                    value={
                      draft?.itemQuantities?.[arrival] ??
                      getDefaultQuantity(selectedArrivalItem.capacity)
                    }
                    onChange={(e) => {
                      const newQty = Number(e.target.value);
                      setDraft((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          itemQuantities: {
                            ...(prev.itemQuantities || {}),
                            [arrival]: newQty,
                          },
                        };
                      });
                    }}
                  >
                    {getQuantityOptions(getDefaultQuantity(selectedArrivalItem.capacity)).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-gray-500">
                    Capacity: {selectedArrivalItem.capacity}
                  </div>
                </div>
              )}
          </div>
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
            <div>
              <PricingCatalogSelect
                label="Vehicle & Driver"
                value={logistics?.vehicle}
                onChange={(pricingItemId) => {
                  onUpdate({
                    logistics: {
                      ...logistics,
                      vehicle: pricingItemId,
                      internalMovements: logistics?.internalMovements || [],
                    },
                  });

                  setDraft((prev) => {
                    if (!prev) return prev;

                    const nextItemQuantities: Record<string, number> = {
                      ...(prev.itemQuantities || {}),
                    };

                    if (pricingItemId) {
                      const selected = pricingItems.find((i) => i.id === pricingItemId);
                      const capacity = selected?.capacity;
                      if (typeof capacity === 'number' && Number.isFinite(capacity)) {
                        if (nextItemQuantities[pricingItemId] === undefined) {
                          nextItemQuantities[pricingItemId] = getDefaultQuantity(capacity);
                        }
                      }
                    }

                    return {
                      ...prev,
                      itemQuantities: nextItemQuantities,
                    };
                  });
                }}
                category="Vehicle"
                parkId={parkId}
                items={pricingItems}
                isLoading={catalogLoading}
              />

              {logistics?.vehicle &&
                selectedVehicleItem &&
                typeof selectedVehicleItem.capacity === 'number' &&
                Number.isFinite(selectedVehicleItem.capacity) && (
                  <div className="flex items-center gap-3 mt-2">
                    <label className="text-xs font-medium text-gray-700">Quantity</label>
                    <select
                      className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                      value={
                        draft?.itemQuantities?.[logistics.vehicle] ??
                        getDefaultQuantity(selectedVehicleItem.capacity)
                      }
                      onChange={(e) => {
                        const newQty = Number(e.target.value);
                        setDraft((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            itemQuantities: {
                              ...(prev.itemQuantities || {}),
                              [logistics.vehicle!]: newQty,
                            },
                          };
                        });
                      }}
                    >
                      {getQuantityOptions(getDefaultQuantity(selectedVehicleItem.capacity)).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <div className="text-xs text-gray-500">
                      Capacity: {selectedVehicleItem.capacity}
                    </div>
                  </div>
                )}
            </div>

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
