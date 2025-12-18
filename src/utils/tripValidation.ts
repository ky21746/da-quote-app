import { ParkCard } from '../types/ui';

export interface NightsValidationResult {
  valid: boolean;
  totalNights: number;
  message: string;
}

/**
 * Validate that total nights across all parks match trip days
 * Rule: N days trip = N-1 nights
 * Examples: 4 days = 3 nights, 5 days = 4 nights, 6 days = 5 nights, 7 days = 6 nights
 */
export function validateNights(
  totalDays: number,
  parks: ParkCard[]
): NightsValidationResult {
  const totalNights = parks.reduce((sum, park) => sum + (park.nights || 0), 0);
  
  // Expected nights = days - 1 (always: 4 days = 3 nights, 5 days = 4 nights, etc.)
  const expectedNights = totalDays - 1;
  
  if (parks.length === 0) {
    return { 
      valid: false, 
      totalNights: 0, 
      message: 'Please add at least one park' 
    };
  }
  
  // Check if any park is missing nights
  const parksWithoutNights = parks.filter(park => !park.nights || park.nights === 0);
  if (parksWithoutNights.length > 0) {
    return { 
      valid: false, 
      totalNights, 
      message: `Please set nights for each destination. Expected: ${expectedNights} nights for ${totalDays} days trip` 
    };
  }
  
  // Simple check: totalNights must equal expectedNights (no more, no less)
  if (totalNights !== expectedNights) {
    return { 
      valid: false, 
      totalNights, 
      message: `Incorrect nights allocation. Expected ${expectedNights} nights for ${totalDays} days trip, but got ${totalNights} nights` 
    };
  }
  
  return { 
    valid: true, 
    totalNights, 
    message: `All ${expectedNights} nights allocated correctly (${totalDays} days trip)` 
  };
}

