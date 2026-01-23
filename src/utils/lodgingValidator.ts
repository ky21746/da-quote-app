/**
 * Lodging Validation Logic
 * 
 * Validates if a traveler group can stay at a specific lodge
 * based on the lodge's regulations and policies.
 */

import { EnhancedLodging, TravelerGroup, LodgingValidationResult } from '../types/lodging';

/**
 * Categorize travelers by age based on lodge regulations
 */
export function categorizeTravelers(
  ages: number[],
  regulations: EnhancedLodging['regulations']
): TravelerGroup {
  const infantMax = regulations.infantAgeRange?.max ?? 2;
  const childMax = regulations.childAgeRange?.max ?? 11;
  
  const infants = ages.filter(age => age <= infantMax).length;
  const children = ages.filter(age => age > infantMax && age <= childMax).length;
  const adults = ages.filter(age => age > childMax).length;
  
  return { adults, children, infants, ages };
}

/**
 * Calculate optimal room allocation for a traveler group
 */
export function calculateOptimalRooms(
  group: TravelerGroup,
  regulations: EnhancedLodging['regulations']
): {
  rooms: Array<{ type: string; adults: number; children: number; infants: number }>;
  totalRooms: number;
  warnings: string[];
} {
  const warnings: string[] = [];
  const rooms: Array<{ type: string; adults: number; children: number; infants: number }> = [];
  
  // Check minimum age requirement
  if (regulations.minimumAge && group.ages.some(age => age < regulations.minimumAge)) {
    warnings.push(`This lodge requires minimum age of ${regulations.minimumAge} years`);
  }
  
  // Check if adults-only
  if (regulations.adultsOnly && (group.children > 0 || group.infants > 0)) {
    warnings.push('This is an adults-only lodge');
    return { rooms: [], totalRooms: 0, warnings };
  }
  
  let remainingAdults = group.adults;
  let remainingChildren = group.children;
  let remainingInfants = group.infants;
  
  // Strategy 1: Try to fit families in family rooms
  if (group.children > 0 || group.infants > 0) {
    const familyRoomType = regulations.roomTypes.find(rt => rt.type === 'family');
    
    if (familyRoomType) {
      // Calculate how many family rooms we need
      while ((remainingAdults > 0 || remainingChildren > 0 || remainingInfants > 0)) {
        const adultsInRoom = Math.min(remainingAdults, familyRoomType.maxAdults);
        const childrenInRoom = Math.min(remainingChildren, familyRoomType.maxChildren);
        const infantsInRoom = regulations.infantsCountAsOccupancy 
          ? Math.min(remainingInfants, familyRoomType.maxOccupancy - adultsInRoom - childrenInRoom)
          : remainingInfants;
        
        if (adultsInRoom === 0 && childrenInRoom === 0 && infantsInRoom === 0) break;
        
        rooms.push({
          type: 'family',
          adults: adultsInRoom,
          children: childrenInRoom,
          infants: infantsInRoom,
        });
        
        remainingAdults -= adultsInRoom;
        remainingChildren -= childrenInRoom;
        remainingInfants -= infantsInRoom;
        
        // Safety check to prevent infinite loop
        if (rooms.length > 20) {
          warnings.push('Unable to allocate rooms - configuration too complex');
          break;
        }
      }
    } else {
      warnings.push('No family rooms available at this lodge');
    }
  }
  
  // Strategy 2: Allocate remaining adults to double/twin rooms
  if (remainingAdults > 0) {
    const doubleRoomType = regulations.roomTypes.find(rt => rt.type === 'double' || rt.type === 'twin');
    
    if (doubleRoomType) {
      while (remainingAdults > 0) {
        const adultsInRoom = Math.min(remainingAdults, doubleRoomType.maxAdults);
        
        rooms.push({
          type: doubleRoomType.type,
          adults: adultsInRoom,
          children: 0,
          infants: 0,
        });
        
        remainingAdults -= adultsInRoom;
      }
    }
  }
  
  return {
    rooms,
    totalRooms: rooms.length,
    warnings,
  };
}

/**
 * Calculate estimated cost for a traveler group at a lodge
 */
export function calculateLodgingCost(
  group: TravelerGroup,
  lodge: EnhancedLodging,
  nights: number,
  season: 'low' | 'high' | 'peak'
): number {
  const basePrice = lodge.seasonalPricing?.[season] ?? lodge.basePrice;
  
  if (lodge.pricingModel === 'per_night_per_person') {
    let total = 0;
    
    // Adults pay full price
    total += group.adults * basePrice * nights;
    
    // Children may have discount
    if (lodge.regulations.childDiscount && lodge.regulations.childDiscount.length > 0) {
      const childDiscountPercent = lodge.regulations.childDiscount[0].discountPercent;
      const childPrice = basePrice * (1 - childDiscountPercent / 100);
      total += group.children * childPrice * nights;
    } else {
      total += group.children * basePrice * nights;
    }
    
    // Infants may be free
    if (lodge.regulations.infantPolicy) {
      const freeAge = lodge.regulations.infantPolicy.freeUpToAge;
      const freeInfants = group.ages.filter(age => age <= freeAge).length;
      const payingInfants = group.infants - freeInfants;
      total += payingInfants * basePrice * nights;
    }
    
    return total;
  }
  
  if (lodge.pricingModel === 'per_night_per_room') {
    const roomAllocation = calculateOptimalRooms(group, lodge.regulations);
    return roomAllocation.totalRooms * basePrice * nights;
  }
  
  if (lodge.pricingModel === 'per_villa') {
    return basePrice * nights;
  }
  
  return 0;
}

/**
 * Main validation function
 */
export function validateLodgingForGroup(
  group: TravelerGroup,
  lodge: EnhancedLodging,
  nights: number,
  season: 'low' | 'high' | 'peak'
): LodgingValidationResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  // Check minimum age
  if (lodge.regulations.minimumAge) {
    const underageCount = group.ages.filter(age => age < lodge.regulations.minimumAge).length;
    if (underageCount > 0) {
      warnings.push(`${underageCount} traveler(s) below minimum age of ${lodge.regulations.minimumAge}`);
      return {
        canStay: false,
        roomsNeeded: 0,
        warnings,
        suggestions: ['Consider a different lodge that accepts younger travelers'],
      };
    }
  }
  
  // Check adults-only policy
  if (lodge.regulations.adultsOnly && (group.children > 0 || group.infants > 0)) {
    warnings.push('This is an adults-only lodge');
    return {
      canStay: false,
      roomsNeeded: 0,
      warnings,
      suggestions: ['Choose a family-friendly lodge instead'],
    };
  }
  
  // Calculate room allocation
  const roomAllocation = calculateOptimalRooms(group, lodge.regulations);
  warnings.push(...roomAllocation.warnings);
  
  if (roomAllocation.totalRooms === 0) {
    return {
      canStay: false,
      roomsNeeded: 0,
      warnings,
      suggestions: ['This lodge cannot accommodate your group configuration'],
    };
  }
  
  // Check seasonal rules
  if (lodge.regulations.seasonalRules) {
    const seasonalRule = lodge.regulations.seasonalRules.find(r => r.season === season);
    if (seasonalRule) {
      if (seasonalRule.minimumNights && nights < seasonalRule.minimumNights) {
        warnings.push(`Minimum ${seasonalRule.minimumNights} nights required in ${season} season`);
      }
      if (seasonalRule.advanceBookingRequired) {
        suggestions.push(`Book at least ${seasonalRule.advanceBookingRequired} days in advance for ${season} season`);
      }
    }
  }
  
  // Calculate estimated cost
  const estimatedCost = calculateLodgingCost(group, lodge, nights, season);
  
  // Add helpful suggestions
  if (lodge.regulations.childDiscount && group.children > 0) {
    const discount = lodge.regulations.childDiscount[0];
    suggestions.push(`Children (${discount.ageRange.min}-${discount.ageRange.max}) get ${discount.discountPercent}% discount`);
  }
  
  if (lodge.regulations.infantPolicy && group.infants > 0) {
    suggestions.push(`Infants under ${lodge.regulations.infantPolicy.freeUpToAge} stay free`);
  }
  
  return {
    canStay: true,
    roomsNeeded: roomAllocation.totalRooms,
    warnings,
    suggestions,
    estimatedCost,
  };
}

/**
 * Find best matching lodges for a traveler group
 */
export function findBestLodges(
  group: TravelerGroup,
  lodges: EnhancedLodging[],
  tier: 'budget' | 'standard' | 'luxury' | 'ultra-luxury',
  parkId: string,
  nights: number,
  season: 'low' | 'high' | 'peak'
): Array<{ lodge: EnhancedLodging; validation: LodgingValidationResult }> {
  return lodges
    .filter(lodge => 
      lodge.active &&
      lodge.location.parkId === parkId &&
      lodge.tier === tier
    )
    .map(lodge => ({
      lodge,
      validation: validateLodgingForGroup(group, lodge, nights, season),
    }))
    .filter(result => result.validation.canStay)
    .sort((a, b) => {
      // Sort by: fewer warnings, then by cost
      if (a.validation.warnings.length !== b.validation.warnings.length) {
        return a.validation.warnings.length - b.validation.warnings.length;
      }
      return (a.validation.estimatedCost || 0) - (b.validation.estimatedCost || 0);
    });
}
