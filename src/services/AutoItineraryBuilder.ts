import { TripDraft, TripDay, TripTier } from '../types/ui';

/**
 * AutoItineraryBuilder - Headless Service for AI Agents
 * 
 * This service generates complete trip itineraries programmatically based on
 * high-level user requirements. Designed for AI agent integration.
 */

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface AutoTripRequest {
  travelers: {
    adults: number;
    children: number[]; // Array of children ages
  };
  durationDays: number;
  budgetTier: 'Luxury' | 'Mid-Range' | 'Budget';
  focus: 'Gorillas' | 'Chimps' | 'General';
}

// ============================================================================
// ITINERARY RULES - Hardcoded Logic Map
// ============================================================================

interface LodgingRule {
  itemId: string;
  itemName: string;
  cost: number;
  parkId: string;
}

interface ActivityRule {
  itemId: string;
  itemName: string;
  cost: number;
  parkId: string;
  minAge?: number; // Minimum age requirement
}

interface TransferRule {
  itemId: string;
  itemName: string;
  cost: number;
}

const ITINERARY_RULES = {
  // Day 1 is always arrival
  arrival: {
    transfer: {
      itemId: 'transfer_entebbe_001',
      itemName: 'Entebbe Airport Transfer',
      cost: 50,
    } as TransferRule,
  },

  // Lodging rules by budget tier and park
  lodging: {
    Luxury: {
      bwindi: {
        itemId: 'lodge_clouds_001',
        itemName: 'Clouds Mountain Gorilla Lodge',
        cost: 1200,
        parkId: 'park_1', // Bwindi
      } as LodgingRule,
      kibale: {
        itemId: 'lodge_primate_001',
        itemName: 'Primate Lodge Kibale',
        cost: 800,
        parkId: 'park_2', // Kibale
      } as LodgingRule,
      queenElizabeth: {
        itemId: 'lodge_mweya_001',
        itemName: 'Mweya Safari Lodge',
        cost: 900,
        parkId: 'park_3', // Queen Elizabeth
      } as LodgingRule,
    },
    'Mid-Range': {
      bwindi: {
        itemId: 'lodge_mahogany_001',
        itemName: 'Mahogany Springs',
        cost: 600,
        parkId: 'park_1',
      } as LodgingRule,
      kibale: {
        itemId: 'lodge_kibale_forest_001',
        itemName: 'Kibale Forest Camp',
        cost: 400,
        parkId: 'park_2',
      } as LodgingRule,
      queenElizabeth: {
        itemId: 'lodge_bush_001',
        itemName: 'Bush Lodge',
        cost: 450,
        parkId: 'park_3',
      } as LodgingRule,
    },
    Budget: {
      bwindi: {
        itemId: 'lodge_buhoma_001',
        itemName: 'Buhoma Community Rest Camp',
        cost: 300,
        parkId: 'park_1',
      } as LodgingRule,
      kibale: {
        itemId: 'lodge_kibale_budget_001',
        itemName: 'Kibale Budget Camp',
        cost: 200,
        parkId: 'park_2',
      } as LodgingRule,
      queenElizabeth: {
        itemId: 'lodge_simba_001',
        itemName: 'Simba Safari Camp',
        cost: 250,
        parkId: 'park_3',
      } as LodgingRule,
    },
  },

  // Activity rules by focus
  activities: {
    Gorillas: [
      {
        itemId: 'activity_gorilla_trek_001',
        itemName: 'Gorilla Trekking Permit',
        cost: 700,
        parkId: 'park_1',
        minAge: 15,
      } as ActivityRule,
      {
        itemId: 'activity_batwa_001',
        itemName: 'Batwa Cultural Experience',
        cost: 50,
        parkId: 'park_1',
      } as ActivityRule,
    ],
    Chimps: [
      {
        itemId: 'activity_chimp_trek_001',
        itemName: 'Chimpanzee Tracking',
        cost: 200,
        parkId: 'park_2',
        minAge: 12,
      } as ActivityRule,
      {
        itemId: 'activity_bigodi_001',
        itemName: 'Bigodi Wetland Sanctuary',
        cost: 30,
        parkId: 'park_2',
      } as ActivityRule,
    ],
    General: [
      {
        itemId: 'activity_game_drive_001',
        itemName: 'Game Drive',
        cost: 100,
        parkId: 'park_3',
      } as ActivityRule,
      {
        itemId: 'activity_boat_safari_001',
        itemName: 'Boat Safari on Kazinga Channel',
        cost: 80,
        parkId: 'park_3',
      } as ActivityRule,
    ],
  },

  // Park mappings
  parks: {
    bwindi: {
      id: 'park_1',
      name: 'Bwindi Impenetrable National Park',
    },
    kibale: {
      id: 'park_2',
      name: 'Kibale National Park',
    },
    queenElizabeth: {
      id: 'park_3',
      name: 'Queen Elizabeth National Park',
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert budget tier to internal TripTier format
 */
function mapBudgetTierToTripTier(budgetTier: AutoTripRequest['budgetTier']): TripTier {
  const mapping: Record<AutoTripRequest['budgetTier'], TripTier> = {
    'Luxury': 'luxury',
    'Mid-Range': 'standard',
    'Budget': 'budget',
  };
  return mapping[budgetTier];
}

/**
 * Calculate total travelers from request
 */
function getTotalTravelers(travelers: AutoTripRequest['travelers']): number {
  return travelers.adults + travelers.children.length;
}

/**
 * Get all traveler ages
 */
function getTravelerAges(travelers: AutoTripRequest['travelers']): number[] {
  const adultAges = Array(travelers.adults).fill(30); // Default adult age
  return [...adultAges, ...travelers.children];
}

/**
 * Check if any traveler is under minimum age for an activity
 */
function hasUnderageForActivity(ages: number[], minAge?: number): boolean {
  if (!minAge) return false;
  return ages.some(age => age < minAge);
}

/**
 * Generate a unique ID for auto-generated items
 */
function generateAutoId(prefix: string, index: number): string {
  return `auto_generated_${prefix}_${index}_${Date.now()}`;
}

// ============================================================================
// MAIN GENERATOR FUNCTION
// ============================================================================

/**
 * Generate a complete trip itinerary based on high-level requirements
 * 
 * @param request - User requirements (travelers, duration, budget, focus)
 * @returns Complete TripDraft object ready for pricing calculation
 * 
 * @example
 * ```typescript
 * const trip = generateAutoTrip({
 *   travelers: { adults: 2, children: [8, 12] },
 *   durationDays: 5,
 *   budgetTier: 'Luxury',
 *   focus: 'Gorillas'
 * });
 * console.log(JSON.stringify(trip, null, 2));
 * ```
 */
export function generateAutoTrip(request: AutoTripRequest): TripDraft {
  const totalTravelers = getTotalTravelers(request.travelers);
  const ages = getTravelerAges(request.travelers);
  const tier = mapBudgetTierToTripTier(request.budgetTier);

  // Initialize empty TripDraft
  const tripDraft: TripDraft = {
    name: `${request.focus} Safari - ${request.durationDays} Days`,
    travelers: totalTravelers,
    ages: ages,
    days: request.durationDays,
    travelMonth: new Date().getMonth() + 1, // Current month
    tier: tier,
    tripDays: [],
  };

  // Generate trip days
  const tripDays: TripDay[] = [];

  for (let dayNum = 1; dayNum <= request.durationDays; dayNum++) {
    const day: TripDay = {
      dayNumber: dayNum,
      activities: [],
      extras: [],
      parkFees: [],
      logistics: {
        internalMovements: [],
      },
    };

    // ========================================================================
    // DAY 1: ARRIVAL
    // ========================================================================
    if (dayNum === 1) {
      day.parkId = undefined; // No park on arrival day
      day.arrival = ITINERARY_RULES.arrival.transfer.itemId;
      
      // No lodging on Day 1 (arrival day)
      // Travelers typically arrive and transfer to hotel near airport
    }

    // ========================================================================
    // DAY 2: TRANSFER TO MAIN DESTINATION
    // ========================================================================
    else if (dayNum === 2) {
      // Day 2 is typically a travel day to the main park
      if (request.focus === 'Gorillas') {
        day.parkId = ITINERARY_RULES.parks.bwindi.id;
        day.lodging = ITINERARY_RULES.lodging[request.budgetTier].bwindi.itemId;
      } else if (request.focus === 'Chimps') {
        day.parkId = ITINERARY_RULES.parks.kibale.id;
        day.lodging = ITINERARY_RULES.lodging[request.budgetTier].kibale.itemId;
      } else {
        day.parkId = ITINERARY_RULES.parks.queenElizabeth.id;
        day.lodging = ITINERARY_RULES.lodging[request.budgetTier].queenElizabeth.itemId;
      }
    }

    // ========================================================================
    // DAY 3: MAIN ACTIVITY DAY
    // ========================================================================
    else if (dayNum === 3) {
      if (request.focus === 'Gorillas') {
        day.parkId = ITINERARY_RULES.parks.bwindi.id;
        day.lodging = ITINERARY_RULES.lodging[request.budgetTier].bwindi.itemId;
        
        // Add gorilla trekking activity
        const gorillaActivity = ITINERARY_RULES.activities.Gorillas[0];
        
        // Check age restrictions
        if (!hasUnderageForActivity(ages, gorillaActivity.minAge)) {
          day.activities.push(gorillaActivity.itemId);
        }
        
        // Add cultural experience (no age restriction)
        day.activities.push(ITINERARY_RULES.activities.Gorillas[1].itemId);
        
      } else if (request.focus === 'Chimps') {
        day.parkId = ITINERARY_RULES.parks.kibale.id;
        day.lodging = ITINERARY_RULES.lodging[request.budgetTier].kibale.itemId;
        
        // Add chimp tracking
        const chimpActivity = ITINERARY_RULES.activities.Chimps[0];
        if (!hasUnderageForActivity(ages, chimpActivity.minAge)) {
          day.activities.push(chimpActivity.itemId);
        }
        
        // Add wetland sanctuary
        day.activities.push(ITINERARY_RULES.activities.Chimps[1].itemId);
        
      } else {
        day.parkId = ITINERARY_RULES.parks.queenElizabeth.id;
        day.lodging = ITINERARY_RULES.lodging[request.budgetTier].queenElizabeth.itemId;
        
        // Add general activities (no age restrictions)
        day.activities.push(ITINERARY_RULES.activities.General[0].itemId);
        day.activities.push(ITINERARY_RULES.activities.General[1].itemId);
      }
    }

    // ========================================================================
    // REMAINING DAYS: CONTINUE AT SAME PARK
    // ========================================================================
    else if (dayNum > 3 && dayNum < request.durationDays) {
      // Copy park and lodging from Day 3
      if (tripDays[2]) {
        day.parkId = tripDays[2].parkId;
        day.lodging = tripDays[2].lodging;
      }
    }

    // ========================================================================
    // LAST DAY: DEPARTURE
    // ========================================================================
    else if (dayNum === request.durationDays) {
      // Last day is departure - no lodging needed
      day.parkId = undefined;
      day.arrival = ITINERARY_RULES.arrival.transfer.itemId; // Return transfer
    }

    tripDays.push(day);
  }

  tripDraft.tripDays = tripDays;

  return tripDraft;
}

// ============================================================================
// VALIDATION & WARNINGS
// ============================================================================

/**
 * Validate the generated trip and return warnings
 */
export function validateAutoTrip(trip: TripDraft): string[] {
  const warnings: string[] = [];

  if (!trip.ages || trip.ages.length === 0) {
    warnings.push('No traveler ages provided');
    return warnings;
  }

  // Check for gorilla trekking age restrictions
  const hasGorillaTrekking = trip.tripDays?.some(day => 
    day.activities.includes('activity_gorilla_trek_001')
  );

  if (hasGorillaTrekking) {
    const underageCount = trip.ages.filter(age => age < 15).length;
    if (underageCount > 0) {
      warnings.push(
        `${underageCount} traveler(s) under age 15 cannot participate in gorilla trekking. ` +
        `Consider alternative activities or different focus.`
      );
    }
  }

  // Check for chimp tracking age restrictions
  const hasChimpTracking = trip.tripDays?.some(day => 
    day.activities.includes('activity_chimp_trek_001')
  );

  if (hasChimpTracking) {
    const underageCount = trip.ages.filter(age => age < 12).length;
    if (underageCount > 0) {
      warnings.push(
        `${underageCount} traveler(s) under age 12 cannot participate in chimpanzee tracking.`
      );
    }
  }

  return warnings;
}

// ============================================================================
// COST ESTIMATION
// ============================================================================

/**
 * Estimate total cost for the generated trip (rough calculation)
 */
export function estimateTripCost(trip: TripDraft): {
  estimatedTotal: number;
  breakdown: { category: string; amount: number }[];
} {
  let lodgingTotal = 0;
  let activitiesTotal = 0;
  let transfersTotal = 0;

  // This is a simplified estimation - actual pricing uses the catalogPricingEngine
  trip.tripDays?.forEach(day => {
    // Count lodging nights
    if (day.lodging) {
      // Rough estimate based on budget tier
      const lodgingCost = trip.tier === 'luxury' ? 1200 : trip.tier === 'standard' ? 600 : 300;
      lodgingTotal += lodgingCost * trip.travelers;
    }

    // Count activities
    day.activities.forEach(() => {
      activitiesTotal += 200 * trip.travelers; // Rough average
    });

    // Count transfers
    if (day.arrival) {
      transfersTotal += 50;
    }
  });

  return {
    estimatedTotal: lodgingTotal + activitiesTotal + transfersTotal,
    breakdown: [
      { category: 'Lodging', amount: lodgingTotal },
      { category: 'Activities', amount: activitiesTotal },
      { category: 'Transfers', amount: transfersTotal },
    ],
  };
}
