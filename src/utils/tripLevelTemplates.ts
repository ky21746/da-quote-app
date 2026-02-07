/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Trip Level Templates - Auto-selection logic based on trip tier
 * Provides smart defaults for lodging, transport, and activities based on budget level
 */

import { TripTier, PricingItem } from '../types/ui';

export interface TripLevelPreferences {
  lodgingPriceRange: { min: number; max: number };
  transportTypes: ('vehicle' | 'fixed-wing' | 'helicopter')[];
  activityPriceRange: { min: number; max: number };
  includeExtras: boolean;
  preferredLodgingKeywords: string[];
  excludedLodgingKeywords: string[];
}

/**
 * Trip level template definitions
 * Each tier has different preferences for pricing and service levels
 */
export const TRIP_LEVEL_TEMPLATES: Record<TripTier, TripLevelPreferences> = {
  'budget': {
    lodgingPriceRange: { min: 0, max: 300 },
    transportTypes: ['vehicle'],
    activityPriceRange: { min: 0, max: 50 },
    includeExtras: false,
    preferredLodgingKeywords: ['budget', 'basic', 'standard'],
    excludedLodgingKeywords: ['luxury', 'premium', 'exclusive', 'sanctuary'],
  },
  'standard': {
    lodgingPriceRange: { min: 200, max: 800 },
    transportTypes: ['vehicle', 'fixed-wing'],
    activityPriceRange: { min: 0, max: 150 },
    includeExtras: true,
    preferredLodgingKeywords: ['lodge', 'camp', 'safari'],
    excludedLodgingKeywords: ['ultra', 'exclusive'],
  },
  'luxury': {
    lodgingPriceRange: { min: 500, max: 2000 },
    transportTypes: ['fixed-wing', 'helicopter'],
    activityPriceRange: { min: 0, max: 500 },
    includeExtras: true,
    preferredLodgingKeywords: ['luxury', 'premium', 'clouds', 'sanctuary'],
    excludedLodgingKeywords: ['budget', 'basic'],
  },
  'ultra-luxury': {
    lodgingPriceRange: { min: 1500, max: 10000 },
    transportTypes: ['helicopter'],
    activityPriceRange: { min: 0, max: 2000 },
    includeExtras: true,
    preferredLodgingKeywords: ['ultra', 'exclusive', 'sanctuary', 'premium', 'luxury'],
    excludedLodgingKeywords: ['budget', 'basic', 'standard'],
  },
};

/**
 * Score a lodging item based on how well it matches the trip tier
 * Higher score = better match
 */
export function scoreLodgingForTier(item: PricingItem, tier: TripTier): number {
  const prefs = TRIP_LEVEL_TEMPLATES[tier];
  let score = 0;

  // Price range match (0-50 points)
  const price = item.basePrice;
  if (price >= prefs.lodgingPriceRange.min && price <= prefs.lodgingPriceRange.max) {
    const rangeMid = (prefs.lodgingPriceRange.min + prefs.lodgingPriceRange.max) / 2;
    const distance = Math.abs(price - rangeMid);
    const maxDistance = (prefs.lodgingPriceRange.max - prefs.lodgingPriceRange.min) / 2;
    score += 50 * (1 - distance / maxDistance);
  } else if (price < prefs.lodgingPriceRange.min) {
    score -= 20;
  } else {
    score -= tier === 'budget' ? 30 : 10;
  }

  // Keyword match (0-30 points)
  const nameLower = item.itemName.toLowerCase();
  const notesLower = (item.notes || '').toLowerCase();
  const text = `${nameLower} ${notesLower}`;

  for (const keyword of prefs.preferredLodgingKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      score += 10;
    }
  }

  for (const keyword of prefs.excludedLodgingKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      score -= 15;
    }
  }

  return score;
}

/**
 * Get the best lodging option for a park based on trip tier
 */
export function getBestLodgingForTier(
  lodgingItems: PricingItem[],
  tier: TripTier
): PricingItem | null {
  if (lodgingItems.length === 0) return null;

  const scored = lodgingItems.map(item => ({
    item,
    score: scoreLodgingForTier(item, tier),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored[0].item;
}

/**
 * Check if an aircraft/transport matches the trip tier preferences
 */
export function isTransportSuitableForTier(
  transportName: string,
  tier: TripTier
): boolean {
  const prefs = TRIP_LEVEL_TEMPLATES[tier];
  const nameLower = transportName.toLowerCase();

  if (nameLower.includes('helicopter')) {
    return prefs.transportTypes.includes('helicopter');
  }
  if (nameLower.includes('fixed wing') || nameLower.includes('fixed-wing')) {
    return prefs.transportTypes.includes('fixed-wing');
  }
  if (nameLower.includes('vehicle') || nameLower.includes('car') || nameLower.includes('transfer')) {
    return prefs.transportTypes.includes('vehicle');
  }

  return tier !== 'budget';
}

/**
 * Get preferred transport items for a tier
 */
export function getPreferredTransportForTier(
  transportItems: PricingItem[],
  tier: TripTier
): PricingItem[] {
  const prefs = TRIP_LEVEL_TEMPLATES[tier];
  
  return transportItems.filter(item => {
    const nameLower = item.itemName.toLowerCase();
    
    if (nameLower.includes('helicopter')) {
      return prefs.transportTypes.includes('helicopter');
    }
    if (nameLower.includes('fixed wing') || nameLower.includes('fixed-wing')) {
      return prefs.transportTypes.includes('fixed-wing');
    }
    if (nameLower.includes('vehicle') || nameLower.includes('car')) {
      return prefs.transportTypes.includes('vehicle');
    }
    
    return false;
  });
}

/**
 * Check if an activity is suitable for the trip tier based on price
 */
export function isActivitySuitableForTier(
  item: PricingItem,
  tier: TripTier
): boolean {
  const prefs = TRIP_LEVEL_TEMPLATES[tier];
  const price = item.basePrice;

  if (price <= 50) return true;

  return price >= prefs.activityPriceRange.min && price <= prefs.activityPriceRange.max;
}

/**
 * Get recommended activities for a tier
 * Returns activities sorted by suitability
 */
export function getRecommendedActivitiesForTier(
  activities: PricingItem[],
  tier: TripTier
): PricingItem[] {
  const prefs = TRIP_LEVEL_TEMPLATES[tier];

  const scored = activities
    .filter(item => isActivitySuitableForTier(item, tier))
    .map(item => {
      let score = 0;
      const price = item.basePrice;
      const nameLower = item.itemName.toLowerCase();

      if (tier === 'luxury' || tier === 'ultra-luxury') {
        score += price / 10;
      } else if (tier === 'budget') {
        score += (100 - price) / 10;
      } else {
        score += 50;
      }

      if (nameLower.includes('gorilla') || nameLower.includes('lion tracking') || nameLower.includes('exclusive')) {
        score += tier === 'luxury' || tier === 'ultra-luxury' ? 30 : -10;
      }

      if (nameLower.includes('game drive') || nameLower.includes('boat')) {
        score += 20;
      }

      return { item, score };
    });

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.item);
}

/**
 * Get trip level display info
 */
export function getTripLevelInfo(tier: TripTier): {
  label: string;
  description: string;
  icon: string;
} {
  const info = {
    'budget': {
      label: 'Budget',
      description: 'Essential experiences with comfortable accommodations',
      icon: '💰',
    },
    'standard': {
      label: 'Standard',
      description: 'Balanced mix of comfort and adventure',
      icon: '⭐',
    },
    'luxury': {
      label: 'Luxury',
      description: 'Premium lodges and exclusive experiences',
      icon: '✨',
    },
    'ultra-luxury': {
      label: 'Ultra Luxury',
      description: 'The finest accommodations and private experiences',
      icon: '👑',
    },
  };

  return info[tier] || info['standard'];
}
