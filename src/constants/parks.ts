import { ParkId } from '../types/parks';

export interface Park {
  id: ParkId;
  label: string;
}

/**
 * Unified Parks constant - Single Source of Truth for park labels
 */
export const PARKS: Park[] = [
  { id: 'MURCHISON', label: 'Murchison Falls National Park' },
  { id: 'BWINDI', label: 'Bwindi Impenetrable National Park' },
  { id: 'QUEEN_ELIZABETH', label: 'Queen Elizabeth National Park' },
  { id: 'KIBALE', label: 'Kibale Forest National Park' },
];

/**
 * Get park label by ParkId
 */
export function getParkLabel(parkId: ParkId): string {
  const park = PARKS.find((p) => p.id === parkId);
  return park?.label || 'Unknown Park';
}

/**
 * Get park by ParkId
 */
export function getParkById(parkId: ParkId): Park | undefined {
  return PARKS.find((p) => p.id === parkId);
}

