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
  focus: 'Gorillas' | 'Chimps' | 'Safari';
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
    Safari: [
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

// ============================================================================
// MAIN GENERATOR FUNCTION
// ============================================================================

/**
 * Auto Itinerary Builder Service
 * 
 * Generates complete trip itineraries based on high-level user requirements.
 * This service bridges the gap between user intent and the detailed TripDraft structure.
 */

import type { TripDraft, DayDraft, TripTier, PricingItem } from '../types/ui';

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
        
        // Add safari activities (no age restrictions)
        day.activities.push(ITINERARY_RULES.activities.Safari[0].itemId);
        day.activities.push(ITINERARY_RULES.activities.Safari[1].itemId);
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
 * Checks ALL activities in the trip against age restrictions from ITINERARY_RULES
 */
export function validateAutoTrip(trip: TripDraft): string[] {
  const warnings: string[] = [];

  if (!trip.ages || trip.ages.length === 0) {
    warnings.push('No traveler ages provided');
    return warnings;
  }

  // Build a map of all activities with their age restrictions
  const activityAgeMap: Record<string, { name: string; minAge: number }> = {};
  
  // Add gorilla activities
  ITINERARY_RULES.activities.Gorillas.forEach(activity => {
    if (activity.minAge) {
      activityAgeMap[activity.itemId] = {
        name: activity.itemName,
        minAge: activity.minAge,
      };
    }
  });
  
  // Add chimp activities
  ITINERARY_RULES.activities.Chimps.forEach(activity => {
    if (activity.minAge) {
      activityAgeMap[activity.itemId] = {
        name: activity.itemName,
        minAge: activity.minAge,
      };
    }
  });

  // Check if trip name/focus suggests gorilla or chimp activities
  const tripNameLower = trip.name.toLowerCase();
  const isGorillaTrip = tripNameLower.includes('gorilla');
  const isChimpTrip = tripNameLower.includes('chimp');

  // Check for gorilla trekking age restrictions
  if (isGorillaTrip) {
    const gorillaMinAge = 15;
    const underageCount = trip.ages.filter(age => age < gorillaMinAge).length;
    const underageAges = trip.ages.filter(age => age < gorillaMinAge);
    
    if (underageCount > 0) {
      warnings.push(
        `⚠️ AGE RESTRICTION: ${underageCount} traveler(s) (ages: ${underageAges.join(', ')}) ` +
        `are under the minimum age of ${gorillaMinAge} for Gorilla Trekking. ` +
        `These travelers will NOT be able to participate in gorilla trekking activities. ` +
        `Consider alternative activities or a different trip focus.`
      );
    }
  }

  // Check for chimp tracking age restrictions
  if (isChimpTrip) {
    const chimpMinAge = 12;
    const underageCount = trip.ages.filter(age => age < chimpMinAge).length;
    const underageAges = trip.ages.filter(age => age < chimpMinAge);
    
    if (underageCount > 0) {
      warnings.push(
        `⚠️ AGE RESTRICTION: ${underageCount} traveler(s) (ages: ${underageAges.join(', ')}) ` +
        `are under the minimum age of ${chimpMinAge} for Chimpanzee Tracking. ` +
        `These travelers will NOT be able to participate in chimp tracking activities.`
      );
    }
  }

  // Iterate through all trip days and check each activity
  trip.tripDays?.forEach((day, dayIndex) => {
    day.activities.forEach(activityId => {
      const activityInfo = activityAgeMap[activityId];
      
      if (activityInfo) {
        // Check if any traveler is under the minimum age
        const underageCount = trip.ages!.filter(age => age < activityInfo.minAge).length;
        const underageAges = trip.ages!.filter(age => age < activityInfo.minAge);
        
        if (underageCount > 0) {
          warnings.push(
            `⚠️ Day ${day.dayNumber}: Activity "${activityInfo.name}" requires minimum age ${activityInfo.minAge}. ` +
            `${underageCount} traveler(s) (ages: ${underageAges.join(', ')}) cannot participate.`
          );
        }
      }
      
      // Additional check for any activity with "trek" or "tracking" in the ID
      if (activityId.toLowerCase().includes('trek') || activityId.toLowerCase().includes('track')) {
        // Assume minimum age of 12 for any trekking activity not explicitly defined
        const minAge = 12;
        const underageCount = trip.ages!.filter(age => age < minAge).length;
        
        if (underageCount > 0 && !activityInfo) {
          warnings.push(
            `⚠️ Day ${day.dayNumber}: Trekking activity (${activityId}) may have age restrictions. ` +
            `${underageCount} traveler(s) under age ${minAge} detected.`
          );
        }
      }
    });
  });

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
