import React, { useState } from 'react';
import { Select, Input, PricingCatalogSelect, SearchablePricingCatalogSelect, PricingCatalogMultiSelect, LodgingConfigModal } from '../common';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { getParks, assertValidParkId } from '../../utils/parks';
import { Calendar, ChevronRight, Settings } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import type { TripDayParkFee, FreeHandLine } from '../../types/ui';

interface TripDayCardProps {
  dayNumber: number; // 1, 2, 3... (global trip day)
  parkId?: string;
  arrival?: string; // pricingItemId
  lodging?: string; // pricingItemId
  lodgingConfig?: {
    roomType: string;
    roomTypeName: string;
    season: string;
    seasonName: string;
    occupancy: string;
    price: number;
    priceType: 'perRoom' | 'perPerson' | 'perVilla';
  };
  activities: string[]; // pricingItemIds
  extras?: string[]; // pricingItemIds
  freeHandLines?: FreeHandLine[];
  parkFees: TripDayParkFee[];
  logistics?: {
    vehicle?: string; // pricingItemId
    internalMovements: string[]; // pricingItemIds
    notes?: string;
  };
  onUpdate: (updates: {
    parkId?: string;
    arrival?: string;
    lodging?: string;
    lodgingConfig?: {
      roomType: string;
      roomTypeName: string;
      season: string;
      seasonName: string;
      occupancy: string;
      price: number;
      priceType: 'perRoom' | 'perPerson' | 'perVilla';
    };
    activities?: string[];
    extras?: string[];
    freeHandLines?: FreeHandLine[];
    parkFees?: TripDayParkFee[];
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
  lodgingConfig,
  activities,
  extras,
  freeHandLines,
  parkFees,
  logistics,
  onUpdate,
  onNextDay,
  isLastDay,
}) => {
  const { items: pricingItems, isLoading: catalogLoading } = usePricingCatalog();
  const { draft, setDraft } = useTrip();

  const getInitialOpenSection = () => {
    if (!parkId) return null;
    if (!arrival) return 'arrival';
    if (!lodging) return 'lodging';
    if (!activities || activities.length === 0) return 'activities';
    return null;
  };

  const [openSection, setOpenSection] = useState<
    null | 'fees' | 'arrival' | 'lodging' | 'activities' | 'extras' | 'logistics' | 'one_off'
  >(() => getInitialOpenSection());
  
  const [isLodgingModalOpen, setIsLodgingModalOpen] = useState(false);

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

  const landingFeeItems = pricingItems.filter((i) => {
    const name = (i.itemName || '').toLowerCase();
    return name.includes('aircraft landing fee');
  });

  const isAirArrival = (() => {
    const name = (selectedArrivalItem?.itemName || '').toLowerCase();
    return name.includes('helicopter') || name.includes('fixed wing') || name.includes('fixed-wing');
  })();

  const isHelicopter = (() => {
    const name = (selectedArrivalItem?.itemName || '').toLowerCase();
    return name.includes('helicopter');
  })();

  const derivedLandingFeeItem = (() => {
    if (!isAirArrival) return null;
    if (isHelicopter) {
      return landingFeeItems.find((i) => (i.itemName || '').toLowerCase().includes('helicopter')) || null;
    }
    return landingFeeItems.find((i) => (i.itemName || '').toLowerCase().includes('fix wing') || (i.itemName || '').toLowerCase().includes('fixed wing')) || null;
  })();

  const safeFreeHandLines = Array.isArray(freeHandLines) ? freeHandLines : [];

  const addFreeHandLine = () => {
    const id = `fh_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    onUpdate({
      freeHandLines: [
        ...safeFreeHandLines,
        { id, description: '', amount: 0 },
      ],
    });
  };

  const updateFreeHandLine = (lineId: string, updates: Partial<FreeHandLine>) => {
    onUpdate({
      freeHandLines: safeFreeHandLines.map((l) => (l.id === lineId ? { ...l, ...updates } : l)),
    });
  };

  const removeFreeHandLine = (lineId: string) => {
    onUpdate({
      freeHandLines: safeFreeHandLines.filter((l) => l.id !== lineId),
    });
  };

  const parkOptions = [
    { value: '', label: 'Select a park...' },
    ...getParks().map((park) => ({ value: park.id, label: park.label })),
  ];

  const Section: React.FC<{
    id: NonNullable<typeof openSection>;
    title: string;
    summary?: string;
    children: React.ReactNode;
    disabled?: boolean;
  }> = ({ id, title, summary, children, disabled }) => {
    const isOpen = openSection === id;

    return (
      <div className="border border-gray-200 rounded-md">
        <button
          type="button"
          disabled={disabled}
          className={`w-full px-3 py-2 flex items-center justify-between gap-3 text-left ${disabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-50 hover:bg-gray-100'} rounded-md`}
          onClick={() => setOpenSection((prev) => (prev === id ? null : id))}
        >
          <div className="min-w-0">
            <div className="text-sm font-semibold text-brand-dark">{title}</div>
            {summary && <div className="text-xs text-gray-500 truncate">{summary}</div>}
          </div>
          <div className="text-xs font-medium text-gray-600">{isOpen ? 'Hide' : 'Edit'}</div>
        </button>
        {isOpen && <div className="p-3">{children}</div>}
      </div>
    );
  };

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

            const nextParkFees: TripDayParkFee[] = (parkFees || []).filter((f) => f.source !== 'auto');
            if (selectedParkId) {
              const activeParkFees = pricingItems.filter(
                (i) => i.category === 'Park Fees' && i.parkId === selectedParkId && i.active === true
              );

              for (const item of activeParkFees) {
                const existing = nextParkFees.find((f) => f.itemId === item.id);
                if (existing) {
                  // Never duplicate; if excluded===true we do NOT re-add (and we also don't flip it)
                  continue;
                }
                nextParkFees.push({
                  itemId: item.id,
                  source: 'auto',
                  excluded: false,
                });
              }
            }
            onUpdate({
              parkId: selectedParkId,
              arrival: undefined, // Reset arrival when park changes
              parkFees: nextParkFees,
            });

            setOpenSection(() => {
              if (!selectedParkId) return null;
              return 'arrival';
            });
          }}
          options={parkOptions}
        />

        <Section
          id="fees"
          title="Park Fees"
          summary={
            parkFees && parkFees.length > 0
              ? `${(parkFees || []).filter((f) => f.excluded !== true).length} selected`
              : 'None'
          }
          disabled={!parkId}
        >
          {parkFees && parkFees.length > 0 ? (
            <div className="space-y-2">
              {parkFees.map((fee) => {
                const item = pricingItems.find((i) => i.id === fee.itemId);
                if (!item) return null;
                const checked = fee.excluded !== true;
                return (
                  <label key={fee.itemId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const nextFees = (parkFees || []).map((f) =>
                            f.itemId === fee.itemId ? { ...f, excluded: checked } : f
                          );
                          onUpdate({ parkFees: nextFees });
                        }}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{item.itemName}</span>
                    </div>
                    <span className="text-xs text-gray-500">Auto-added</span>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No park fees for this day.</div>
          )}
        </Section>

        {/* 2. Arrival to Park (Flight or Vehicle) */}
        {parkId && (
          <div>
            <PricingCatalogSelect
              label="Arrival to Park (Flight or Vehicle)"
              value={arrival}
              onChange={(pricingItemId) => {
                const nextArrivalItem = pricingItemId
                  ? pricingItems.find((i) => i.id === pricingItemId) || null
                  : null;

                const isAirArrival = (() => {
                  const name = (nextArrivalItem?.itemName || '').toLowerCase();
                  return name.includes('helicopter') || name.includes('fixed wing') || name.includes('fixed-wing');
                })();

                const nextIsHelicopter = (() => {
                  const name = (nextArrivalItem?.itemName || '').toLowerCase();
                  return name.includes('helicopter');
                })();

                const nextLandingFeeItem = (() => {
                  if (!isAirArrival) return null;
                  if (nextIsHelicopter) {
                    return landingFeeItems.find((i) => (i.itemName || '').toLowerCase().includes('helicopter')) || null;
                  }
                  return landingFeeItems.find((i) => (i.itemName || '').toLowerCase().includes('fix wing') || (i.itemName || '').toLowerCase().includes('fixed wing')) || null;
                })();

                const autoLandingFeeId = nextLandingFeeItem ? nextLandingFeeItem.id : null;

                const isLandingFeeItemId = (itemId: string) =>
                  landingFeeItems.some((i) => i.id === itemId);

                const prevFees = Array.isArray(parkFees) ? parkFees : [];
                const withoutAutoLanding = prevFees.filter((f) => !isLandingFeeItemId(f.itemId));

                const nextFees = (() => {
                  if (!autoLandingFeeId) return withoutAutoLanding;
                  const existing = prevFees.find((f) => f.itemId === autoLandingFeeId);
                  if (existing) return withoutAutoLanding.concat(existing);
                  return withoutAutoLanding.concat({
                    itemId: autoLandingFeeId,
                    source: 'auto',
                    excluded: false,
                  });
                })();

                onUpdate({ arrival: pricingItemId, parkFees: nextFees });

                setDraft((prev) => {
                  if (!prev) return prev;

                  const nextItemQuantities: Record<string, number> = {
                    ...(prev.itemQuantities || {}),
                  };

                  const nextSources: Record<string, 'auto' | 'manual'> = {
                    ...(prev.itemQuantitySources || {}),
                  };

                  if (pricingItemId) {
                    const selected = pricingItems.find((i) => i.id === pricingItemId);
                    const capacity = selected?.capacity;
                    if (typeof capacity === 'number' && Number.isFinite(capacity)) {
                      if (nextItemQuantities[pricingItemId] === undefined) {
                        nextItemQuantities[pricingItemId] = getDefaultQuantity(capacity);
                        nextSources[pricingItemId] = nextSources[pricingItemId] || 'auto';
                      }
                    }
                  }

                  return {
                    ...prev,
                    itemQuantities: nextItemQuantities,
                    itemQuantitySources: nextSources,
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
                          itemQuantitySources: {
                            ...(prev.itemQuantitySources || {}),
                            [arrival]: 'manual',
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

            {/* Aircraft Landing Fee - inline control */}
            {isAirArrival && derivedLandingFeeItem && (
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <label className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(() => {
                        const fee = (parkFees || []).find((f) => f.itemId === derivedLandingFeeItem.id);
                        return fee ? fee.excluded !== true : false;
                      })()}
                      onChange={() => {
                        const prevFees = Array.isArray(parkFees) ? parkFees : [];
                        const existing = prevFees.find((f) => f.itemId === derivedLandingFeeItem.id);
                        
                        if (existing) {
                          const nextFees = prevFees.map((f) =>
                            f.itemId === derivedLandingFeeItem.id
                              ? { ...f, excluded: !f.excluded }
                              : f
                          );
                          onUpdate({ parkFees: nextFees });
                        } else {
                          onUpdate({
                            parkFees: [...prevFees, {
                              itemId: derivedLandingFeeItem.id,
                              source: 'auto',
                              excluded: false,
                            }],
                          });
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700">
                        {isHelicopter ? 'Helicopter landing fee' : 'Fixed-wing aircraft landing fee'}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${derivedLandingFeeItem.basePrice?.toFixed(2) || '0.00'} per landing
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 italic">Auto</span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* 3. Lodging */}
        {parkId && (() => {
          const selectedLodgingItem = lodging
            ? pricingItems.find((i) => i.id === lodging)
            : null;
          
          // Support both "hierarchical_lodging" and "hierarchical lodging"
          const costType = selectedLodgingItem?.costType || '';
          const isHierarchical = costType === 'hierarchical_lodging' || (costType as string) === 'hierarchical lodging';
          const metadata = selectedLodgingItem?.metadata as any;

          // Debug logging
          if (selectedLodgingItem) {
            console.log('🏨 Selected Lodging Item:', {
              name: selectedLodgingItem.itemName,
              costType: selectedLodgingItem.costType,
              isHierarchical,
              hasMetadata: !!metadata,
              metadata: metadata
            });
          }

          return (
            <div className="space-y-2">
              <div className="flex gap-2 items-end">
                <div className="flex-1 mb-[-1rem]">
                  <SearchablePricingCatalogSelect
                    label="Lodging"
                    value={lodging}
                    onChange={(pricingItemId) => onUpdate({ lodging: pricingItemId })}
                    category="Lodging"
                    parkId={parkId}
                    items={pricingItems}
                    isLoading={catalogLoading}
                  />
                </div>
                {isHierarchical && metadata && (
                  <button
                    onClick={() => setIsLodgingModalOpen(true)}
                    className="px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-brand-gold/90 transition-colors flex items-center gap-2 h-[42px]"
                    title="Configure room, season, and occupancy"
                  >
                    <Settings size={18} />
                    Configure
                  </button>
                )}
              </div>

              {/* Display selected config */}
              {isHierarchical && lodgingConfig && (
                <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-semibold text-green-800 mb-2">Selected Configuration:</div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div>
                      <span className="font-medium">Room:</span> {lodgingConfig.roomTypeName}
                    </div>
                    <div>
                      <span className="font-medium">Season:</span> {lodgingConfig.seasonName}
                    </div>
                    <div>
                      <span className="font-medium">Occupancy:</span> {lodgingConfig.occupancy.replace(/_/g, ' ')}
                    </div>
                    <div>
                      <span className="font-medium">Price:</span> ${lodgingConfig.price.toLocaleString()}/{lodgingConfig.priceType === 'perRoom' ? 'room' : lodgingConfig.priceType === 'perVilla' ? 'villa' : 'person'}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsLodgingModalOpen(true)}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Change Configuration
                  </button>
                </div>
              )}

              {isHierarchical && metadata && selectedLodgingItem && (
                <LodgingConfigModal
                  isOpen={isLodgingModalOpen}
                  onClose={() => setIsLodgingModalOpen(false)}
                  hotelName={selectedLodgingItem.itemName}
                  metadata={metadata}
                  travelers={travelers}
                  onConfirm={(config) => {
                    console.log('Lodging config selected:', config);
                    onUpdate({ lodgingConfig: config });
                    setIsLodgingModalOpen(false);
                  }}
                />
              )}
            </div>
          );
        })()}

        {/* 4. Activities */}
        {parkId && (
          <>
            <PricingCatalogMultiSelect
              label="Activities"
              selectedIds={activities || []}
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

            {(activities || []).length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-md p-3">
                <div className="text-sm font-semibold text-brand-dark mb-2">Activity Quantities</div>
                <div className="space-y-2">
                  {(activities || []).map((activityId) => {
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
          </>
        )}

        {/* 4b. Extras */}
        {parkId && (
          <PricingCatalogMultiSelect
            label="Extras"
            selectedIds={extras || []}
            onChange={(pricingItemIds) => onUpdate({ extras: pricingItemIds })}
            category="Extras"
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

                    const nextSources: Record<string, 'auto' | 'manual'> = {
                      ...(prev.itemQuantitySources || {}),
                    };

                    if (pricingItemId) {
                      const selected = pricingItems.find((i) => i.id === pricingItemId);
                      const capacity = selected?.capacity;
                      if (typeof capacity === 'number' && Number.isFinite(capacity)) {
                        if (nextItemQuantities[pricingItemId] === undefined) {
                          nextItemQuantities[pricingItemId] = getDefaultQuantity(capacity);
                          nextSources[pricingItemId] = nextSources[pricingItemId] || 'auto';
                        }
                      }
                    }

                    return {
                      ...prev,
                      itemQuantities: nextItemQuantities,
                      itemQuantitySources: nextSources,
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
                            itemQuantitySources: {
                              ...(prev.itemQuantitySources || {}),
                              [logistics.vehicle!]: 'manual',
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

        {/* Free Hand Lines */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-brand-dark">One-off Expenses</h4>
            <button
              type="button"
              onClick={addFreeHandLine}
              className="text-sm font-medium text-brand-olive hover:underline"
            >
              + Add
            </button>
          </div>

          {safeFreeHandLines.length === 0 ? (
            <div className="text-sm text-gray-500">No one-off expenses added.</div>
          ) : (
            <div className="space-y-2">
              {safeFreeHandLines.map((line) => (
                <div key={line.id} className="flex gap-2 items-center">
                  <Input
                    label="Description"
                    value={line.description}
                    onChange={(v) => updateFreeHandLine(line.id, { description: String(v) })}
                    placeholder="e.g., Park tip / Permit / Donation"
                  />
                  <Input
                    label="Price (USD)"
                    type="number"
                    value={line.amount}
                    onChange={(v) => {
                      const num = Number(v);
                      updateFreeHandLine(line.id, { amount: Number.isFinite(num) ? num : 0 });
                    }}
                    min={0}
                  />
                  <button
                    type="button"
                    onClick={() => removeFreeHandLine(line.id)}
                    className="mt-6 text-sm font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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
