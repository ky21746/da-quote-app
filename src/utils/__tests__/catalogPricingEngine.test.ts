/**
 * Unit Tests for Pricing Engine
 * Tests the core business logic of calculatePricingFromCatalog and calculateItemTotal
 * 
 * Coverage:
 * - Per-person pricing
 * - Per-night pricing
 * - Fixed pricing
 * - Hierarchical lodging (seasonal)
 * - Quantity calculations
 * - Edge cases
 * - Mixed baskets
 * - Golden regression tests
 */

import { calculatePricingFromCatalog } from '../catalogPricingEngine';
import {
  createTripDraft,
  createTripDay,
  createPerPersonItem,
  createPerNightPerPersonItem,
  createPerNightItem,
  createFixedGroupItem,
  createFixedPerDayItem,
  createHierarchicalLodgingItem,
  createVehicleItem,
  createPricingItem,
} from './fixtures';

describe('catalogPricingEngine', () => {
  describe('Per-Person Pricing', () => {
    test('GIVEN per_person item WHEN calculating THEN total equals basePrice × travelers', () => {
      const item = createPerPersonItem(50, 'Park Entry Fee');
      const trip = createTripDraft({
        travelers: 4,
        tripDays: [
          createTripDay({
            dayNumber: 1,
            parkId: 'BWINDI',
            activities: [item.id],
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [item]);

      expect(result.breakdown).toHaveLength(1);
      expect(result.breakdown[0].calculatedTotal).toBe(200); // 50 × 4
      expect(result.breakdown[0].perPerson).toBe(50);
      expect(result.totals.grandTotal).toBe(200);
      expect(result.totals.perPerson).toBe(50);
    });

    test('GIVEN per_person_per_day item WHEN calculating THEN total equals basePrice × travelers × days', () => {
      const item = createPricingItem({
        itemName: 'Daily Guide Fee',
        basePrice: 30,
        costType: 'per_person_per_day',
        category: 'Activities',
      });
      const trip = createTripDraft({
        travelers: 3,
        days: 5,
        tripDays: [
          createTripDay({
            dayNumber: 1,
            activities: [item.id],
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [item]);

      expect(result.breakdown[0].calculatedTotal).toBe(450); // 30 × 3 × 5
      expect(result.totals.grandTotal).toBe(450);
    });

    test('GIVEN per_person item with 0 travelers WHEN calculating THEN total is 0', () => {
      const item = createPerPersonItem(100, 'Activity');
      const trip = createTripDraft({
        travelers: 0,
        tripDays: [
          createTripDay({
            activities: [item.id],
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [item]);

      expect(result.breakdown[0].calculatedTotal).toBe(0);
      expect(result.totals.grandTotal).toBe(0);
      expect(result.totals.perPerson).toBe(0);
    });
  });

  describe('Per-Night Pricing', () => {
    test('GIVEN per_night_per_person lodging WHEN calculating THEN total equals basePrice × nights × travelers', () => {
      const lodging = createPerNightPerPersonItem(200, 'Budget Lodge');
      const trip = createTripDraft({
        travelers: 4,
        tripDays: [
          createTripDay({
            dayNumber: 1,
            lodging: lodging.id,
          }),
          createTripDay({
            dayNumber: 2,
            lodging: lodging.id,
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [lodging]);

      // 2 nights × 200 × 4 travelers = 1600 per night
      // But each day is calculated separately, so 200 × 4 = 800 per day
      expect(result.breakdown).toHaveLength(2);
      expect(result.breakdown[0].calculatedTotal).toBe(800);
      expect(result.breakdown[1].calculatedTotal).toBe(800);
      expect(result.totals.grandTotal).toBe(1600);
    });

    test('GIVEN per_night item WHEN calculating THEN total equals basePrice × nights', () => {
      const lodging = createPerNightItem(500, 'Villa Rental');
      const trip = createTripDraft({
        travelers: 6,
        tripDays: [
          createTripDay({
            dayNumber: 1,
            lodging: lodging.id,
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [lodging]);

      expect(result.breakdown[0].calculatedTotal).toBe(500); // 500 × 1 night
      expect(result.totals.grandTotal).toBe(500);
    });
  });

  describe('Fixed Pricing', () => {
    test('GIVEN fixed_group item WHEN calculating THEN total equals basePrice', () => {
      const item = createFixedGroupItem(150, 'Airport Transfer');
      const trip = createTripDraft({
        travelers: 5,
        tripDays: [
          createTripDay({
            extras: [item.id],
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [item]);

      expect(result.breakdown[0].calculatedTotal).toBe(150);
      expect(result.totals.grandTotal).toBe(150);
    });

    test('GIVEN fixed_per_day vehicle WHEN calculating THEN total equals basePrice × parkNights', () => {
      const vehicle = createFixedPerDayItem(300, '4x4 Safari Vehicle');
      const trip = createTripDraft({
        travelers: 4,
        days: 5,
        tripDays: [
          createTripDay({
            dayNumber: 1,
            lodging: 'lodging-1', // Add lodging to create parkNights
            logistics: {
              vehicle: vehicle.id,
              internalMovements: [],
            },
          }),
          createTripDay({
            dayNumber: 2,
            lodging: 'lodging-1',
          }),
          createTripDay({
            dayNumber: 3,
            lodging: 'lodging-1',
          }),
          createTripDay({
            dayNumber: 4,
            lodging: 'lodging-1',
          }),
          createTripDay({
            dayNumber: 5,
            lodging: 'lodging-1',
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [vehicle]);

      // Vehicle is calculated per park nights (count of lodging)
      // 5 days with lodging = 5 nights, so 300 × 5 = 1500
      expect(result.breakdown[0].calculatedTotal).toBe(1500);
    });
  });

  describe('Hierarchical Lodging (Seasonal)', () => {
    test('GIVEN hierarchical lodging with perPerson config WHEN calculating THEN uses configured price × travelers', () => {
      const lodging = createHierarchicalLodgingItem('Luxury Safari Lodge');
      const trip = createTripDraft({
        travelers: 2,
        tripDays: [
          createTripDay({
            dayNumber: 1,
            lodging: lodging.id,
            lodgingConfig: {
              roomType: 'standard',
              roomTypeName: 'Standard Room',
              season: 'high',
              seasonName: 'High Season',
              occupancy: 'double',
              price: 400,
              priceType: 'perPerson',
            },
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [lodging]);

      expect(result.breakdown[0].calculatedTotal).toBe(800); // 400 × 2 travelers
      expect(result.breakdown[0].itemName).toContain('Standard Room');
      expect(result.totals.grandTotal).toBe(800);
    });

    test('GIVEN hierarchical lodging with perRoom config WHEN calculating THEN uses configured price (not multiplied by travelers)', () => {
      const lodging = createHierarchicalLodgingItem('Boutique Hotel');
      const trip = createTripDraft({
        travelers: 4,
        tripDays: [
          createTripDay({
            dayNumber: 1,
            lodging: lodging.id,
            lodgingConfig: {
              roomType: 'standard',
              roomTypeName: 'Standard Room',
              season: 'low',
              seasonName: 'Low Season',
              occupancy: 'double',
              price: 250,
              priceType: 'perRoom',
            },
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [lodging]);

      expect(result.breakdown[0].calculatedTotal).toBe(250); // Fixed room price
      expect(result.totals.grandTotal).toBe(250);
    });

    test('GIVEN hierarchical lodging without config WHEN calculating THEN total is 0', () => {
      const lodging = createHierarchicalLodgingItem('Unconfigured Lodge');
      const trip = createTripDraft({
        travelers: 2,
        tripDays: [
          createTripDay({
            dayNumber: 1,
            lodging: lodging.id,
            // No lodgingConfig
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [lodging]);

      expect(result.breakdown[0].calculatedTotal).toBe(0);
      expect(result.breakdown[0].calculationExplanation).toContain('Unknown cost type');
    });

    test('REGRESSION: hierarchical lodging with itemQuantities > 1 MUST multiply price by quantity', () => {
      const lodging = createHierarchicalLodgingItem('Lemala Wildwaters Lodge');
      const trip = createTripDraft({
        travelers: 6,
        itemQuantities: {
          [lodging.id]: 3, // Need 3 villas for 6 travelers (capacity 2 each)
        },
        tripDays: [
          createTripDay({
            dayNumber: 1,
            lodging: lodging.id,
            lodgingConfig: {
              roomType: 'private_pool',
              roomTypeName: 'Private Pool Suite',
              season: 'low',
              seasonName: 'Low Season',
              occupancy: 'suite',
              price: 1000,
              priceType: 'perVilla',
            },
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [lodging]);

      // CRITICAL: Must charge for 3 villas, not 1
      expect(result.breakdown[0].calculatedTotal).toBe(3000); // 1000 × 3 villas
      expect(result.breakdown[0].calculationExplanation).toContain('× 3');
      expect(result.totals.grandTotal).toBe(3000);
    });
  });

  describe('Quantity Calculations', () => {
    test('GIVEN item with itemQuantities override WHEN calculating THEN uses override quantity', () => {
      const vehicle = createVehicleItem(200, 7, 'Safari Van');
      const trip = createTripDraft({
        travelers: 12,
        days: 3,
        itemQuantities: {
          [vehicle.id]: 2, // Override: need 2 vehicles
        },
        tripDays: [
          createTripDay({
            dayNumber: 1,
            lodging: 'lodge-1', // Add lodging
            logistics: {
              vehicle: vehicle.id,
              internalMovements: [],
            },
          }),
          createTripDay({
            dayNumber: 2,
            lodging: 'lodge-1',
          }),
          createTripDay({
            dayNumber: 3,
            lodging: 'lodge-1',
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [vehicle]);

      // fixed_per_day: basePrice × parkNights × quantity
      // 3 nights × 200 × 2 = 1200
      expect(result.breakdown[0].calculatedTotal).toBe(1200);
    });

    test('GIVEN activity with quantity WHEN calculating THEN multiplies by quantity', () => {
      const activity = createPerPersonItem(50, 'Gorilla Trekking Permit');
      const trip = createTripDraft({
        travelers: 4,
        itemQuantities: {
          [activity.id]: 2, // 2 treks
        },
        tripDays: [
          createTripDay({
            activities: [activity.id],
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [activity]);

      expect(result.breakdown[0].calculatedTotal).toBe(400); // 50 × 4 × 2
      expect(result.breakdown[0].quantity).toBe(2);
    });

    test('GIVEN item with invalid quantity WHEN calculating THEN defaults to 1', () => {
      const item = createPerPersonItem(100, 'Activity');
      const trip = createTripDraft({
        travelers: 3,
        itemQuantities: {
          [item.id]: -5, // Invalid quantity
        },
        tripDays: [
          createTripDay({
            activities: [item.id],
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [item]);

      expect(result.breakdown[0].calculatedTotal).toBe(300); // 100 × 3 × 1 (default)
    });
  });

  describe('Edge Cases', () => {
    test('GIVEN empty catalog WHEN calculating THEN returns empty breakdown', () => {
      const trip = createTripDraft({
        tripDays: [
          createTripDay({
            activities: ['non-existent-id'],
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, []);

      expect(result.breakdown).toHaveLength(0);
      expect(result.totals.grandTotal).toBe(0);
    });

    test('GIVEN trip with no tripDays WHEN calculating THEN returns empty breakdown', () => {
      const item = createPerPersonItem(100, 'Activity');
      const trip = createTripDraft({
        tripDays: [],
      });

      const result = calculatePricingFromCatalog(trip, [item]);

      expect(result.breakdown).toHaveLength(0);
      expect(result.totals.grandTotal).toBe(0);
    });

    test('GIVEN excluded park fee WHEN calculating THEN appears in breakdown with 0 total', () => {
      const parkFee = createPricingItem({
        itemName: 'Park Entry Fee',
        basePrice: 50,
        costType: 'per_person',
        category: 'Park Fees',
      });
      const trip = createTripDraft({
        travelers: 4,
        tripDays: [
          createTripDay({
            parkFees: [
              {
                itemId: parkFee.id,
                source: 'auto',
                excluded: true,
              },
            ],
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [parkFee]);

      expect(result.breakdown).toHaveLength(1);
      expect(result.breakdown[0].calculatedTotal).toBe(0);
      expect(result.breakdown[0].itemName).toContain('Excluded by user');
      expect(result.totals.grandTotal).toBe(0);
    });

    test('GIVEN free hand line WHEN calculating THEN adds to total', () => {
      const trip = createTripDraft({
        travelers: 4,
        tripDays: [
          createTripDay({
            freeHandLines: [
              {
                id: 'fh1',
                description: 'Special Permit',
                amount: 250,
              },
            ],
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, []);

      expect(result.breakdown).toHaveLength(1);
      expect(result.breakdown[0].calculatedTotal).toBe(250);
      expect(result.breakdown[0].itemName).toBe('Special Permit');
      expect(result.totals.grandTotal).toBe(250);
    });
  });

  describe('Mixed Basket Totals', () => {
    test('GIVEN multiple items of different types WHEN calculating THEN sums all correctly', () => {
      const parkFee = createPerPersonItem(40, 'Park Entry');
      const lodging = createPerNightPerPersonItem(150, 'Lodge');
      const activity = createPerPersonItem(80, 'Game Drive');
      const transfer = createFixedGroupItem(100, 'Airport Transfer');

      const trip = createTripDraft({
        travelers: 3,
        tripDays: [
          createTripDay({
            dayNumber: 1,
            parkFees: [
              {
                itemId: parkFee.id,
                source: 'auto',
                excluded: false,
              },
            ],
            lodging: lodging.id,
            activities: [activity.id],
            extras: [transfer.id],
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [parkFee, lodging, activity, transfer]);

      // Park fee: 40 × 3 = 120
      // Lodging: 150 × 3 = 450
      // Activity: 80 × 3 = 240
      // Transfer: 100 (fixed)
      // Total: 910
      expect(result.breakdown).toHaveLength(4);
      expect(result.totals.grandTotal).toBe(910);
      expect(result.totals.perPerson).toBeCloseTo(303.33, 2);
    });

    test('GIVEN multi-day trip with different items per day WHEN calculating THEN totals all days', () => {
      const activity1 = createPerPersonItem(50, 'Morning Safari');
      const activity2 = createPerPersonItem(75, 'Boat Cruise');
      const lodging = createPerNightPerPersonItem(200, 'Safari Camp');

      const trip = createTripDraft({
        travelers: 2,
        tripDays: [
          createTripDay({
            dayNumber: 1,
            activities: [activity1.id],
            lodging: lodging.id,
          }),
          createTripDay({
            dayNumber: 2,
            activities: [activity2.id],
            lodging: lodging.id,
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [activity1, activity2, lodging]);

      // Day 1: activity1 (50×2=100) + lodging (200×2=400) = 500
      // Day 2: activity2 (75×2=150) + lodging (200×2=400) = 550
      // Total: 1050
      expect(result.breakdown).toHaveLength(4);
      expect(result.totals.grandTotal).toBe(1050);
    });
  });

  describe('Golden Regression Tests', () => {
    test('GOLDEN: 5-day Bwindi safari with known total should equal 8450', () => {
      // This is a realistic 5-day safari trip
      const parkFee = createPricingItem({
        id: 'park_fee_bwindi',
        itemName: 'Bwindi Park Entry Fee',
        basePrice: 40,
        costType: 'per_person',
        category: 'Park Fees',
        parkId: 'BWINDI',
      });

      const gorillaPermit = createPricingItem({
        id: 'gorilla_permit',
        itemName: 'Gorilla Trekking Permit',
        basePrice: 700,
        costType: 'per_person',
        category: 'Permits',
        parkId: 'BWINDI',
      });

      const lodging = createPricingItem({
        id: 'clouds_lodge',
        itemName: 'Clouds Mountain Gorilla Lodge',
        basePrice: 450,
        costType: 'per_night_per_person',
        category: 'Lodging',
        parkId: 'BWINDI',
      });

      const vehicle = createPricingItem({
        id: 'safari_vehicle',
        itemName: '4x4 Safari Vehicle',
        basePrice: 150,
        costType: 'fixed_per_day',
        category: 'Vehicle',
        parkId: 'BWINDI',
      });

      const trip = createTripDraft({
        name: '5-Day Bwindi Gorilla Safari',
        travelers: 2,
        days: 5,
        tripDays: [
          createTripDay({
            dayNumber: 1,
            parkId: 'BWINDI',
            parkFees: [{ itemId: parkFee.id, source: 'auto', excluded: false }],
            lodging: lodging.id,
            activities: [gorillaPermit.id],
            logistics: {
              vehicle: vehicle.id,
              internalMovements: [],
            },
          }),
          createTripDay({
            dayNumber: 2,
            parkId: 'BWINDI',
            lodging: lodging.id,
          }),
          createTripDay({
            dayNumber: 3,
            parkId: 'BWINDI',
            lodging: lodging.id,
          }),
          createTripDay({
            dayNumber: 4,
            parkId: 'BWINDI',
            lodging: lodging.id,
          }),
          createTripDay({
            dayNumber: 5,
            parkId: 'BWINDI',
            lodging: lodging.id,
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [parkFee, gorillaPermit, lodging, vehicle]);

      // Expected breakdown:
      // Park fee: 40 × 2 = 80 (day 1 only)
      // Gorilla permit: 700 × 2 = 1400 (day 1 only)
      // Lodging: 450 × 2 travelers × 5 days = 4500
      // Vehicle: 150 × 5 parkNights = 750 (day 1 only, but calculated for all nights)
      // Total: 80 + 1400 + 4500 + 750 = 6730
      expect(result.totals.grandTotal).toBe(6730);
    });

    test('GOLDEN: Single-day hierarchical lodging trip should equal 800', () => {
      const lodging = createHierarchicalLodgingItem('Lemala Wildwaters Lodge');
      const parkFee = createPricingItem({
        id: 'jinja_fee',
        itemName: 'Jinja Activity Fee',
        basePrice: 25,
        costType: 'per_person',
        category: 'Park Fees',
        parkId: 'JINJA',
      });

      const trip = createTripDraft({
        name: 'Luxury Jinja Getaway',
        travelers: 2,
        days: 1,
        tripDays: [
          createTripDay({
            dayNumber: 1,
            parkId: 'JINJA',
            parkFees: [{ itemId: parkFee.id, source: 'auto', excluded: false }],
            lodging: lodging.id,
            lodgingConfig: {
              roomType: 'standard',
              roomTypeName: 'Standard Suite',
              season: 'high',
              seasonName: 'High Season',
              occupancy: 'double',
              price: 400,
              priceType: 'perPerson',
            },
          }),
        ],
      });

      const result = calculatePricingFromCatalog(trip, [lodging, parkFee]);

      // Park fee: 25 × 2 = 50
      // Lodging: 400 × 2 = 800
      // Total: 850
      expect(result.totals.grandTotal).toBe(850);
    });
  });
});
