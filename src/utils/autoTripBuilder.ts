import { TripDraft, TripDay, TripTier, AgeRange } from '../types/ui';
import { PricingItem } from '../types/ui';

/**
 * Auto-Trip-Builder
 * 
 * Takes simple inputs (travelers, ageRanges, days, tier) and automatically generates
 * a complete trip with parks, lodging, and activities selected based on tier level.
 * 
 * This is designed for AI agent integration - the agent can call this with minimal input
 * and get a fully-priced trip ready for the customer.
 */

export interface AutoTripBuilderInput {
  travelers: number;
  ageRanges?: AgeRange[];
  days: number;
  tier: TripTier;
  tripName?: string;
}

export interface AutoTripBuilderOutput {
  draft: TripDraft;
  recommendedParks: string[];
  estimatedTotal?: number;
}

/**
 * Park recommendations based on trip duration
 */
const PARK_RECOMMENDATIONS: Record<number, string[]> = {
  // 3-4 days: Single park experience
  3: ['bwindi', 'queen-elizabeth', 'murchison-falls'],
  4: ['bwindi', 'queen-elizabeth', 'murchison-falls'],
  
  // 5-7 days: Two parks
  5: ['bwindi', 'queen-elizabeth'],
  6: ['bwindi', 'queen-elizabeth'],
  7: ['murchison-falls', 'queen-elizabeth'],
  
  // 8-10 days: Three parks
  8: ['bwindi', 'queen-elizabeth', 'murchison-falls'],
  9: ['bwindi', 'queen-elizabeth', 'murchison-falls'],
  10: ['bwindi', 'queen-elizabeth', 'murchison-falls'],
  
  // 11+ days: Extended safari
  11: ['bwindi', 'queen-elizabeth', 'murchison-falls', 'kibale'],
  12: ['bwindi', 'queen-elizabeth', 'murchison-falls', 'kibale'],
};

/**
 * Get recommended parks based on trip duration
 */
function getRecommendedParks(days: number): string[] {
  if (days <= 2) return ['queen-elizabeth']; // Short trip - closest park
  if (days >= 12) return PARK_RECOMMENDATIONS[12];
  return PARK_RECOMMENDATIONS[days] || PARK_RECOMMENDATIONS[7]; // Default to 7-day plan
}

/**
 * Distribute days across parks
 */
function distributeDaysAcrossParks(totalDays: number, parks: string[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  const daysPerPark = Math.floor(totalDays / parks.length);
  const remainder = totalDays % parks.length;
  
  parks.forEach((park, index) => {
    distribution[park] = daysPerPark + (index < remainder ? 1 : 0);
  });
  
  return distribution;
}

/**
 * Select lodging based on tier and park
 * This is a simplified version - in production, you'd query the pricing catalog
 */
function selectLodging(parkId: string, tier: TripTier, pricingItems: PricingItem[]): string | undefined {
  const lodgingItems = pricingItems.filter(
    item => item.category === 'Lodging' && 
            item.parkId === parkId && 
            item.active === true
  );
  
  if (lodgingItems.length === 0) return undefined;
  
  // Sort by price
  const sorted = lodgingItems.sort((a, b) => b.basePrice - a.basePrice);
  
  // Select based on tier
  switch (tier) {
    case 'budget':
      return sorted[sorted.length - 1]?.id; // Cheapest
    case 'standard':
      return sorted[Math.floor(sorted.length / 2)]?.id; // Middle
    case 'luxury':
      return sorted[Math.floor(sorted.length / 4)]?.id; // Upper tier
    case 'ultra-luxury':
      return sorted[0]?.id; // Most expensive
    default:
      return sorted[Math.floor(sorted.length / 2)]?.id;
  }
}

/**
 * Select recommended activities based on park and tier
 */
function selectActivities(parkId: string, tier: TripTier, pricingItems: PricingItem[]): string[] {
  const activities = pricingItems.filter(
    item => item.category === 'Activities' && 
            item.parkId === parkId && 
            item.active === true
  );
  
  if (activities.length === 0) return [];
  
  // Sort by price
  const sorted = activities.sort((a, b) => b.basePrice - a.basePrice);
  
  // Select number of activities based on tier
  let count: number;
  switch (tier) {
    case 'budget':
      count = Math.min(2, sorted.length);
      break;
    case 'standard':
      count = Math.min(3, sorted.length);
      break;
    case 'luxury':
      count = Math.min(4, sorted.length);
      break;
    case 'ultra-luxury':
      count = Math.min(5, sorted.length);
      break;
    default:
      count = Math.min(3, sorted.length);
  }
  
  // Mix of high and mid-tier activities
  const selected: string[] = [];
  for (let i = 0; i < count && i < sorted.length; i++) {
    selected.push(sorted[i].id);
  }
  
  return selected;
}

/**
 * Main auto-trip-builder function
 */
export async function buildAutoTrip(
  input: AutoTripBuilderInput,
  pricingItems: PricingItem[]
): Promise<AutoTripBuilderOutput> {
  const { travelers, ageRanges, days, tier, tripName } = input;
  
  // Get recommended parks
  const recommendedParks = getRecommendedParks(days);
  
  // Distribute days across parks
  const parkDayDistribution = distributeDaysAcrossParks(days, recommendedParks);
  
  // Build trip days
  const tripDays: TripDay[] = [];
  let currentDay = 1;
  
  for (const parkId of recommendedParks) {
    const daysInPark = parkDayDistribution[parkId];
    
    // Select lodging and activities for this park
    const lodging = selectLodging(parkId, tier, pricingItems);
    const activities = selectActivities(parkId, tier, pricingItems);
    
    // Create days for this park
    for (let i = 0; i < daysInPark; i++) {
      tripDays.push({
        dayNumber: currentDay++,
        parkId,
        lodging,
        activities,
        parkFees: [], // Will be auto-populated by the system
      });
    }
  }
  
  // Create the draft
  const draft: TripDraft = {
    name: tripName || `${days}-Day Safari (${tier})`,
    travelers,
    ageRanges: ageRanges || Array(travelers).fill('adult'),
    days,
    tier,
    tripDays,
  };
  
  return {
    draft,
    recommendedParks,
  };
}

/**
 * Simplified version for AI agent - doesn't need pricing catalog
 * Just returns the structure, pricing will be calculated when saved
 */
export function buildAutoTripSimple(input: AutoTripBuilderInput): AutoTripBuilderOutput {
  const { travelers, ageRanges, days, tier, tripName } = input;
  
  // Get recommended parks
  const recommendedParks = getRecommendedParks(days);
  
  // Distribute days across parks
  const parkDayDistribution = distributeDaysAcrossParks(days, recommendedParks);
  
  // Build trip days (without specific lodging/activities - will be selected manually)
  const tripDays: TripDay[] = [];
  let currentDay = 1;
  
  for (const parkId of recommendedParks) {
    const daysInPark = parkDayDistribution[parkId];
    
    for (let i = 0; i < daysInPark; i++) {
      tripDays.push({
        dayNumber: currentDay++,
        parkId,
        activities: [],
        parkFees: [],
      });
    }
  }
  
  // Create the draft
  const draft: TripDraft = {
    name: tripName || `${days}-Day Safari (${tier})`,
    travelers,
    ageRanges: ageRanges || Array(travelers).fill('adult'),
    days,
    tier,
    tripDays,
  };
  
  return {
    draft,
    recommendedParks,
  };
}
