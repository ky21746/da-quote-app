/**
 * Test Fixtures for Pricing Engine Unit Tests
 * These builders create realistic test data based on actual domain types
 */

import { TripDraft, PricingItem, TripDay } from '../../types/ui';

/**
 * Create a minimal valid TripDraft for testing
 */
export function createTripDraft(overrides?: Partial<TripDraft>): TripDraft {
  return {
    name: 'Test Safari Trip',
    travelers: 4,
    days: 5,
    tier: 'budget',
    tripDays: [],
    itemQuantities: {},
    ...overrides,
  };
}

/**
 * Create a TripDay with sensible defaults
 */
export function createTripDay(overrides?: Partial<TripDay>): TripDay {
  return {
    dayNumber: 1,
    parkId: 'BWINDI',
    activities: [],
    extras: [],
    parkFees: [],
    ...overrides,
  };
}

/**
 * Create a PricingItem with sensible defaults
 */
export function createPricingItem(overrides?: Partial<PricingItem>): PricingItem {
  return {
    id: `item_${Math.random().toString(36).substr(2, 9)}`,
    parkId: 'BWINDI',
    category: 'Activities',
    itemName: 'Test Activity',
    basePrice: 100,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    ...overrides,
  };
}

/**
 * Create a per-person pricing item (e.g., park fee, activity)
 */
export function createPerPersonItem(basePrice: number, itemName: string): PricingItem {
  return createPricingItem({
    itemName,
    basePrice,
    costType: 'per_person',
    category: 'Activities',
  });
}

/**
 * Create a per-night-per-person lodging item
 */
export function createPerNightPerPersonItem(basePrice: number, itemName: string): PricingItem {
  return createPricingItem({
    itemName,
    basePrice,
    costType: 'per_night_per_person',
    category: 'Lodging',
  });
}

/**
 * Create a per-night lodging item (fixed per night)
 */
export function createPerNightItem(basePrice: number, itemName: string): PricingItem {
  return createPricingItem({
    itemName,
    basePrice,
    costType: 'per_night',
    category: 'Lodging',
  });
}

/**
 * Create a fixed group pricing item
 */
export function createFixedGroupItem(basePrice: number, itemName: string): PricingItem {
  return createPricingItem({
    itemName,
    basePrice,
    costType: 'fixed_group',
    category: 'Extras',
  });
}

/**
 * Create a fixed per day pricing item
 */
export function createFixedPerDayItem(basePrice: number, itemName: string): PricingItem {
  return createPricingItem({
    itemName,
    basePrice,
    costType: 'fixed_per_day',
    category: 'Vehicle',
  });
}

/**
 * Create a hierarchical lodging item with metadata
 */
export function createHierarchicalLodgingItem(itemName: string): PricingItem {
  return createPricingItem({
    itemName,
    basePrice: 0,
    costType: 'hierarchical_lodging',
    category: 'Lodging',
    metadata: {
      type: 'hierarchical',
      rooms: [
        {
          id: 'standard',
          name: 'Standard Room',
          maxOccupancy: 2,
          pricing: {
            high: {
              single: { perPerson: 500 },
              double: { perPerson: 400 },
            },
            low: {
              single: { perPerson: 300 },
              double: { perPerson: 250 },
            },
          },
        },
      ],
      seasons: {
        high: { name: 'High Season' },
        low: { name: 'Low Season' },
      },
    },
  });
}

/**
 * Create a vehicle item with capacity
 */
export function createVehicleItem(basePrice: number, capacity: number, itemName: string): PricingItem {
  return createPricingItem({
    itemName,
    basePrice,
    costType: 'fixed_per_day',
    category: 'Vehicle',
    capacity,
  });
}
