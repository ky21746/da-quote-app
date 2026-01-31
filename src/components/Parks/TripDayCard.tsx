import React, { useState, useEffect, useRef } from 'react';
import { Select, Input, PricingCatalogSelect, SearchablePricingCatalogSelect, PricingCatalogMultiSelect, LodgingConfigModalNew, AircraftSelector, ActivitiesCardSelector } from '../common';
import { TripValidationWarnings } from './TripValidationWarnings';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { getParks, assertValidParkId } from '../../utils/parks';
import { Calendar, ChevronRight, Settings, MapPin, Bed, Car, Activity, Plane, CheckCircle, AlertCircle, Circle, Star } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import type { TripDayParkFee, FreeHandLine } from '../../types/ui';
import { getBestLodgingForTier, getPreferredTransportForTier, getRecommendedActivitiesForTier, getTripLevelInfo } from '../../utils/tripLevelTemplates';
import { useFavorites } from '../../hooks/useFavorites';

interface TripDayCardProps {
  dayNumber: number; // 1, 2, 3... (global trip day)
  parkId?: string;
  arrival?: string; // pricingItemId
  arrivalNA?: boolean;
  lodging?: string; // pricingItemId
  lodgingConfig?: {
    roomType: string;
    roomTypeName: string;
    season: string;
    seasonName: string;
    occupancy: string;
    price: number;
    priceType: 'perRoom' | 'perPerson' | 'perVilla';
    requiredQuantity?: number;
  };
  lodgingAllocations?: Array<{
    roomType: string;
    roomTypeName: string;
    season: string;
    seasonName: string;
    occupancy: string;
    price: number;
    priceType: 'perRoom' | 'perPerson' | 'perVilla';
    quantity: number;
    guests: number;
  }>;
  activities: string[]; // pricingItemIds
  activitiesNA?: boolean;
  extras?: string[]; // pricingItemIds
  extrasNA?: boolean;
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
    arrivalNA?: boolean;
    lodging?: string;
    lodgingConfig?: {
      roomType: string;
      roomTypeName: string;
      season: string;
      seasonName: string;
      occupancy: string;
      price: number;
      priceType: 'perRoom' | 'perPerson' | 'perVilla';
      requiredQuantity?: number;
    };
    lodgingAllocations?: Array<{
      roomType: string;
      roomTypeName: string;
      season: string;
      seasonName: string;
      occupancy: string;
      price: number;
      priceType: 'perRoom' | 'perPerson' | 'perVilla';
      quantity: number;
      guests: number;
    }>;
    activities?: string[];
    activitiesNA?: boolean;
    extras?: string[];
    extrasNA?: boolean;
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
  arrivalNA,
  lodging,
  lodgingConfig,
  lodgingAllocations,
  activities,
  activitiesNA,
  extras,
  extrasNA,
  freeHandLines,
  parkFees,
  logistics,
  onUpdate,
  onNextDay,
  isLastDay,
}) => {
  const { items: pricingItems, isLoading: catalogLoading } = usePricingCatalog();
  const { draft, setDraft } = useTrip();
  const { 
    isLodgingFavorite, 
    isActivityFavorite,
    isArrivalFavorite,
    toggleLodgingFavorite, 
    toggleActivityFavorite,
    toggleArrivalFavorite,
    getParkFavorites
  } = useFavorites();

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

  // Track if we've already auto-populated for this park to avoid loops
  const hasAutoPopulatedRef = useRef<string | null>(null);

  // Auto-populate from favorites when park is selected
  useEffect(() => {
    if (!parkId || hasAutoPopulatedRef.current === parkId) {
      return;
    }

    const parkFavorites = getParkFavorites(parkId);
    if (!parkFavorites) {
      return;
    }

    const updates: any = {};
    let hasUpdates = false;

    // Auto-populate arrival if empty and favorite exists
    if (!arrival && parkFavorites.arrival) {
      updates.arrival = parkFavorites.arrival;
      hasUpdates = true;
    }

    // Auto-populate lodging if empty and favorite exists
    if (!lodging && parkFavorites.lodging) {
      updates.lodging = parkFavorites.lodging;
      hasUpdates = true;
    }

    // Auto-populate activities if empty and favorites exist
    if ((!activities || activities.length === 0) && parkFavorites.activities && parkFavorites.activities.length > 0) {
      updates.activities = parkFavorites.activities;
      hasUpdates = true;

      // Also set default quantities for activities
      setDraft((prev) => {
        if (!prev) return prev;
        const nextItemQuantities: Record<string, number> = {
          ...(prev.itemQuantities || {}),
        };
        const nextSources: Record<string, 'auto' | 'manual'> = {
          ...(prev.itemQuantitySources || {}),
        };
        for (const activityId of parkFavorites.activities || []) {
          if (nextItemQuantities[activityId] === undefined) {
            nextItemQuantities[activityId] = 1;
            nextSources[activityId] = 'auto';
          }
        }
        return {
          ...prev,
          itemQuantities: nextItemQuantities,
          itemQuantitySources: nextSources,
        };
      });
    }

    if (hasUpdates) {
      onUpdate(updates);
      hasAutoPopulatedRef.current = parkId;
    }
  }, [parkId, arrival, lodging, activities, getParkFavorites, onUpdate, setDraft]);

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

  // Calculate completion status
  const isConfigured = Boolean(parkId && lodging && activities && activities.length > 0);
  const hasIssues = Boolean(parkId && (!lodging || !activities || activities.length === 0));
  
  const StatusBadge = () => {
    if (isConfigured) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <CheckCircle className="w-3.5 h-3.5" />
          Configured
        </span>
      );
    }
    if (hasIssues) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5" />
          Incomplete
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
        <Circle className="w-3.5 h-3.5" />
        Not Started
      </span>
    );
  };

  const tripTier = draft?.tier || 'standard';
  const tierInfo = getTripLevelInfo(tripTier);

  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 md:p-6 lg:p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">Day {dayNumber}</h3>
            {parkId && (
              <div className="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {getParks().find(p => p.id === parkId)?.label || parkId}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
            {tierInfo.icon} {tierInfo.label}
          </span>
          <StatusBadge />
        </div>
      </div>

      {/* Validation Warnings */}
      <TripValidationWarnings 
        ages={draft?.ages} 
        parkId={parkId}
        arrival={arrival}
        arrivalNA={arrivalNA}
        activities={activities}
        activitiesNA={activitiesNA}
      />

      <div className="space-y-4">
        {/* 1. Park Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            Park
          </label>
          <Select
            label=""
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
        </div>

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
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Plane className="w-4 h-4 text-gray-500" />
                Arrival to Park (Flight or Vehicle)
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                <input
                  type="checkbox"
                  checked={arrivalNA || false}
                  onChange={(e) => {
                    const isNA = e.target.checked;
                    onUpdate({ 
                      arrivalNA: isNA,
                      arrival: isNA ? undefined : arrival 
                    });
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="font-medium">N/A (Not Applicable)</span>
              </label>
            </div>
            {!arrivalNA && (
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <AircraftSelector
                    value={arrival}
                    parkId={parkId}
                    direction="arrival"
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
              items={pricingItems.filter(item => item.category === 'Aviation' && (item.appliesTo === 'Global' || item.parkId === parkId))}
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
                {arrival && parkId && !arrivalNA && (
                  <button
                    onClick={() => toggleArrivalFavorite(parkId, arrival)}
                    className={`p-2.5 rounded-lg transition-all ${
                      isArrivalFavorite(parkId, arrival)
                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                    }`}
                    title={isArrivalFavorite(parkId, arrival) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star className={`w-5 h-5 ${isArrivalFavorite(parkId, arrival) ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>
            )}
            {arrivalNA && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 italic">
                Arrival marked as N/A - no transport needed for this park
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
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Bed className="w-4 h-4 text-gray-500" />
                  Lodging
                </label>
                {!lodging && (
                  <button
                    onClick={() => {
                      const lodgingItems = pricingItems.filter(
                        item => item.category === 'Lodging' && 
                        item.parkId === parkId && 
                        item.active === true
                      );
                      const bestLodging = getBestLodgingForTier(lodgingItems, tripTier);
                      if (bestLodging) {
                        onUpdate({ lodging: bestLodging.id });
                      }
                    }}
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors font-medium"
                  >
                    ✨ Suggest for {tierInfo.label}
                  </button>
                )}
              </div>
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <SearchablePricingCatalogSelect
                    label=""
                    value={lodging}
                    onChange={(pricingItemId) => onUpdate({ lodging: pricingItemId })}
                    category="Lodging"
                    parkId={parkId}
                    items={pricingItems}
                    isLoading={catalogLoading}
                  />
                </div>
                {lodging && parkId && (
                  <button
                    onClick={() => toggleLodgingFavorite(parkId, lodging)}
                    className={`p-2.5 rounded-lg transition-all h-[42px] flex items-center justify-center ${
                      isLodgingFavorite(parkId, lodging)
                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                    }`}
                    title={isLodgingFavorite(parkId, lodging) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star className={`w-5 h-5 ${isLodgingFavorite(parkId, lodging) ? 'fill-current' : ''}`} />
                  </button>
                )}
                {isHierarchical && metadata && (
                  <button
                    onClick={() => setIsLodgingModalOpen(true)}
                    className="px-4 h-[42px] bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 font-medium shadow-sm"
                    title="Configure room, season, and occupancy"
                  >
                    <Settings className="w-4 h-4" />
                    Configure
                  </button>
                )}
              </div>

              {/* Display multiple allocations */}
              {isHierarchical && lodgingAllocations && lodgingAllocations.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-700">Room Allocations:</div>
                    <button
                      onClick={() => setIsLodgingModalOpen(true)}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      + Add Room
                    </button>
                  </div>
                  {lodgingAllocations.map((allocation, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 text-sm text-gray-700">
                          <div className="font-semibold text-blue-900">{allocation.roomTypeName}</div>
                          <div className="text-xs mt-1">
                            {allocation.seasonName} • {allocation.occupancy.replace(/_/g, ' ')} • 
                            ${allocation.price.toLocaleString()}/{allocation.priceType === 'perRoom' ? 'room' : allocation.priceType === 'perVilla' ? 'villa' : 'person'}
                          </div>
                          <div className="text-xs mt-1 font-medium">
                            {allocation.quantity} room{allocation.quantity > 1 ? 's' : ''} × {allocation.guests} guest{allocation.guests > 1 ? 's' : ''}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newAllocations = lodgingAllocations.filter((_, i) => i !== idx);
                            onUpdate({ lodgingAllocations: newAllocations.length > 0 ? newAllocations : undefined });
                          }}
                          className="ml-2 text-red-600 hover:text-red-800"
                          title="Remove this allocation"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Display selected config (backward compatibility) */}
              {isHierarchical && lodgingConfig && !lodgingAllocations && (
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
                <LodgingConfigModalNew
                  isOpen={isLodgingModalOpen}
                  onClose={() => setIsLodgingModalOpen(false)}
                  hotelName={selectedLodgingItem.itemName}
                  metadata={metadata}
                  travelers={travelers}
                  travelMonth={draft?.travelMonth}
                  existingAllocations={lodgingAllocations || []}
                  onConfirm={(config) => {
                    console.log('Lodging config selected:', config);
                    
                    const newAllocation = {
                      roomType: config.roomType,
                      roomTypeName: config.roomTypeName,
                      season: config.season,
                      seasonName: config.seasonName,
                      occupancy: config.occupancy,
                      price: config.price,
                      priceType: config.priceType,
                      quantity: config.quantity || 1,
                      guests: config.guests || 1,
                    };

                    const updatedAllocations = [...(lodgingAllocations || []), newAllocation];
                    
                    // Clear old lodgingConfig when using allocations
                    onUpdate({ 
                      lodgingAllocations: updatedAllocations,
                      lodgingConfig: undefined,
                    });
                    
                    setIsLodgingModalOpen(false);
                  }}
                />
              )}
            </div>
          );
        })()}

        {/* 4. Activities */}
        {parkId && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Activity className="w-4 h-4 text-gray-500" />
                Activities
              </label>
              <div className="flex items-center gap-3">
                {(!activities || activities.length === 0) && !activitiesNA && (
                  <button
                  onClick={() => {
                    const activityItems = pricingItems.filter(
                      item => item.category === 'Activities' && 
                      item.parkId === parkId && 
                      item.active === true
                    );
                    const recommended = getRecommendedActivitiesForTier(activityItems, tripTier);
                    const topActivities = recommended.slice(0, 3).map(a => a.id);
                    if (topActivities.length > 0) {
                      onUpdate({ activities: topActivities });
                      
                      setDraft((prev) => {
                        if (!prev) return prev;
                        const nextItemQuantities: Record<string, number> = {
                          ...(prev.itemQuantities || {}),
                        };
                        const nextSources: Record<string, 'auto' | 'manual'> = {
                          ...(prev.itemQuantitySources || {}),
                        };
                        for (const id of topActivities) {
                          if (nextItemQuantities[id] === undefined) {
                            nextItemQuantities[id] = 1;
                            nextSources[id] = 'auto';
                          }
                        }
                        return {
                          ...prev,
                          itemQuantities: nextItemQuantities,
                          itemQuantitySources: nextSources,
                        };
                      });
                    }
                  }}
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors font-medium"
                >
                  ✨ Suggest for {tierInfo.label}
                </button>
                )}
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                  <input
                    type="checkbox"
                    checked={activitiesNA || false}
                    onChange={(e) => {
                      const isNA = e.target.checked;
                      onUpdate({ 
                        activitiesNA: isNA,
                        activities: isNA ? [] : activities 
                      });
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="font-medium">N/A</span>
                </label>
              </div>
            </div>
            {!activitiesNA && (
              <ActivitiesCardSelector
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
              parkId={parkId}
              items={pricingItems}
              isLoading={catalogLoading}
              quantities={draft?.itemQuantities || {}}
              isActivityFavorite={isActivityFavorite}
              onToggleFavorite={toggleActivityFavorite}
              onQuantityChange={(activityId, quantity) => {
                setDraft((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    itemQuantities: {
                      ...(prev.itemQuantities || {}),
                      [activityId]: quantity,
                    },
                    itemQuantitySources: {
                      ...(prev.itemQuantitySources || {}),
                      [activityId]: 'manual',
                    },
                  };
                });
              }}
            />
            )}
            {activitiesNA && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 italic">
                Activities marked as N/A - no activities planned for this park
              </div>
            )}
          </div>
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
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Car className="w-4 h-4 text-gray-500" />
                Vehicle & Driver
              </label>
              <PricingCatalogSelect
                label=""
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
        <div className="mt-8 flex justify-end pt-6 border-t border-gray-200">
          <button
            onClick={onNextDay}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
          >
            Next Day
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
