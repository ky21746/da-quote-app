/**
 * Trip Validations and Smart Logic
 * 
 * Handles validation rules and smart calculations for trip planning:
 * - Age restrictions (e.g., gorilla trekking 15+)
 * - Room allocation based on traveler composition
 * - Activity eligibility
 */

export interface ValidationWarning {
  type: 'age_restriction' | 'room_allocation' | 'activity_restriction';
  severity: 'error' | 'warning' | 'info';
  message: string;
  affectedTravelers?: number[]; // Indexes of affected travelers
  suggestion?: string;
}

export interface RoomAllocation {
  totalRooms: number;
  breakdown: {
    adults: number;
    children: number;
    roomType: 'family' | 'double' | 'single';
  }[];
  explanation: string;
}

/**
 * Check if travelers can do gorilla trekking (15+ years old)
 */
export function validateGorillaTrekking(ages: number[]): ValidationWarning | null {
  const underageIndexes: number[] = [];
  
  ages.forEach((age, index) => {
    if (age < 15) {
      underageIndexes.push(index);
    }
  });
  
  if (underageIndexes.length === 0) {
    return null;
  }
  
  const travelerNumbers = underageIndexes.map(i => i + 1).join(', ');
  const plural = underageIndexes.length > 1;
  
  return {
    type: 'age_restriction',
    severity: 'warning',
    message: `Gorilla trekking requires minimum age of 15 years. Traveler${plural ? 's' : ''} ${travelerNumbers} ${plural ? 'are' : 'is'} under 15.`,
    affectedTravelers: underageIndexes,
    suggestion: 'Consider alternative activities for younger travelers, or choose a different park.',
  };
}

/**
 * Smart room allocation based on traveler ages
 * 
 * Logic:
 * - Family with children under 12: 1 room per family unit
 * - Adults only: 1 room per 2 adults (double occupancy)
 * - Single adult: 1 single room
 * - Teenagers (12-17): Can share with adults or get own room
 */
export function calculateRoomAllocation(ages: number[]): RoomAllocation {
  const adults = ages.filter(age => age >= 18);
  const teens = ages.filter(age => age >= 12 && age < 18);
  const children = ages.filter(age => age < 12);
  
  // Case 1: Family with young children (under 12)
  if (children.length > 0 && adults.length > 0) {
    // Family unit: all share rooms
    const familySize = adults.length + teens.length + children.length;
    
    if (familySize <= 4) {
      // Small family: 1 family room
      return {
        totalRooms: 1,
        breakdown: [{
          adults: adults.length,
          children: children.length + teens.length,
          roomType: 'family',
        }],
        explanation: `Family of ${familySize} (${adults.length} adult${adults.length > 1 ? 's' : ''}, ${children.length + teens.length} child${children.length + teens.length > 1 ? 'ren' : ''}) → 1 family room`,
      };
    } else {
      // Large family: 2 family rooms
      return {
        totalRooms: 2,
        breakdown: [
          {
            adults: Math.ceil(adults.length / 2),
            children: Math.ceil((children.length + teens.length) / 2),
            roomType: 'family',
          },
          {
            adults: Math.floor(adults.length / 2),
            children: Math.floor((children.length + teens.length) / 2),
            roomType: 'family',
          },
        ],
        explanation: `Large family of ${familySize} → 2 family rooms`,
      };
    }
  }
  
  // Case 2: Adults only (no children under 12)
  if (children.length === 0) {
    const totalAdults = adults.length + teens.length;
    const doubleRooms = Math.floor(totalAdults / 2);
    const singleRooms = totalAdults % 2;
    
    return {
      totalRooms: doubleRooms + singleRooms,
      breakdown: [
        ...(doubleRooms > 0 ? [{
          adults: 2,
          children: 0,
          roomType: 'double' as const,
        }] : []),
        ...(singleRooms > 0 ? [{
          adults: 1,
          children: 0,
          roomType: 'single' as const,
        }] : []),
      ],
      explanation: `${totalAdults} adult${totalAdults > 1 ? 's' : ''} → ${doubleRooms} double room${doubleRooms !== 1 ? 's' : ''}${singleRooms > 0 ? ` + ${singleRooms} single room` : ''}`,
    };
  }
  
  // Case 3: Children only (no adults) - shouldn't happen, but handle it
  return {
    totalRooms: 1,
    breakdown: [{
      adults: 0,
      children: children.length + teens.length,
      roomType: 'family',
    }],
    explanation: `${children.length + teens.length} children → 1 room (requires adult supervision)`,
  };
}

/**
 * Validate entire trip and return all warnings
 */
export function validateTrip(params: {
  ages: number[];
  parks: string[];
  travelMonth?: number;
}): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  
  // Check for Bwindi (gorilla trekking)
  const hasBwindi = params.parks.some(park => 
    park.toLowerCase().includes('bwindi') || park === 'park_1'
  );
  
  if (hasBwindi) {
    const gorillaWarning = validateGorillaTrekking(params.ages);
    if (gorillaWarning) {
      warnings.push(gorillaWarning);
    }
  }
  
  // Add room allocation info
  const roomAllocation = calculateRoomAllocation(params.ages);
  warnings.push({
    type: 'room_allocation',
    severity: 'info',
    message: `Room allocation: ${roomAllocation.explanation}`,
    suggestion: `Total rooms needed: ${roomAllocation.totalRooms}`,
  });
  
  return warnings;
}

/**
 * Get human-readable age category
 */
export function getAgeCategoryLabel(age: number): string {
  if (age < 3) return 'Infant (0-2)';
  if (age < 12) return 'Child (3-11)';
  if (age < 18) return 'Teen (12-17)';
  if (age < 65) return 'Adult (18-64)';
  return 'Senior (65+)';
}
