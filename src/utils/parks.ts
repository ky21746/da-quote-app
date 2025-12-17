import { PARKS } from '../constants/parks';

/**
 * Central access function for parks list
 * Single Source of Truth - all components must use this
 */
export const getParks = () => PARKS;

/**
 * Runtime assertion to validate parkId
 * Throws error if parkId is not found in parks list
 */
export function assertValidParkId(parkId: string): void {
  const validIds = PARKS.map((p) => p.id) as string[];
  if (!validIds.includes(parkId)) {
    throw new Error(`Invalid parkId: ${parkId}. Valid IDs are: ${validIds.join(', ')}`);
  }
}

