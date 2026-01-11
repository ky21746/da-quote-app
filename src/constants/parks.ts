import { ParkId } from '../types/parks';

export interface Park {
  id: ParkId;
  label: string;
}

/**
 * Unified Parks constant - Single Source of Truth for park labels
 */
export const PARKS: Array<{ id: string; label: string }> = [
  { id: 'MURCHISON', label: 'Murchison Falls National Park' },
  { id: 'BWINDI', label: 'Bwindi Impenetrable National Park' },
  { id: 'QUEEN_ELIZABETH', label: 'Queen Elizabeth National Park' },
  { id: 'KIBALE', label: 'Kibale Forest National Park' },
  { id: 'MGAHINGA', label: 'Mgahinga Gorilla National Park' },
  { id: 'KIDEPO', label: 'Kidepo Valley National Park' },
  { id: 'LAKE_MBURO', label: 'Lake Mburo National Park' },
  { id: 'MT_ELGON', label: 'Mt Elgon National Park' },
  { id: 'RWENZORI', label: 'Rwenzori Mountains National Park' },
  { id: 'SEMULIKI', label: 'Semuliki National Park' },
  { id: 'ZIWA', label: 'Ziwa Rhino Sanctuary' },
  { id: 'BUSIKA', label: 'Busika' },
  { id: 'ENTEBBE', label: 'Entebbe' },
  { id: 'LAKE_BUNYONYI', label: 'Lake Bunyonyi' },
  { id: 'JINJA', label: 'Jinja' },
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
export function getParkById(parkId: ParkId): { id: string; label: string } | undefined {
  return PARKS.find((p) => p.id === parkId);
}

