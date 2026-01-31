/**
 * Mapping between parks and their relevant airports/destinations
 * Used to filter aircraft routes based on selected park
 */

export interface ParkAirportMapping {
  parkId: string;
  airports: string[]; // Airport codes or destination names
  keywords: string[]; // Keywords to match in route names
}

/**
 * Park to Airport/Destination mapping
 * This determines which aircraft routes are relevant for each park
 */
export const PARK_AIRPORT_MAPPINGS: ParkAirportMapping[] = [
  {
    parkId: 'BWINDI',
    airports: ['Kihihi', 'Buhoma'],
    keywords: ['kihihi', 'buhoma', 'bwindi'],
  },
  {
    parkId: 'MURCHISON',
    airports: ['Bubungu', 'Pakuba'],
    keywords: ['bubungu', 'pakuba', 'murchison', 'nile safari'],
  },
  {
    parkId: 'QUEEN_ELIZABETH',
    airports: ['Mweya', 'Kasese'],
    keywords: ['mweya', 'kasese', 'queen elizabeth'],
  },
  {
    parkId: 'KIBALE',
    airports: ['Kasese'],
    keywords: ['kasese', 'kibale'],
  },
  {
    parkId: 'KIDEPO',
    airports: ['Kidepo'],
    keywords: ['kidepo'],
  },
  {
    parkId: 'MGAHINGA',
    airports: ['Kisoro'],
    keywords: ['kisoro', 'mgahinga'],
  },
  {
    parkId: 'JINJA',
    airports: ['Jinja'],
    keywords: ['jinja'],
  },
];

/**
 * Check if a route is relevant for a given park with optional direction filtering
 * @param routeName - The full route name (e.g., "EBB to Kihihi")
 * @param parkId - The park ID to check against
 * @param direction - Optional: 'arrival' (to park) or 'departure' (from park)
 * @returns true if the route is relevant for the park
 */
export function isRouteRelevantForPark(
  routeName: string, 
  parkId: string,
  direction?: 'arrival' | 'departure'
): boolean {
  const mapping = PARK_AIRPORT_MAPPINGS.find(m => m.parkId === parkId);
  
  if (!mapping) {
    // If no mapping exists, show all routes (Global behavior)
    return true;
  }

  const lowerRouteName = routeName.toLowerCase();
  
  // Parse route: "EBB to Kihihi" -> from: "EBB", to: "Kihihi"
  const routeParts = lowerRouteName.split(' to ').map(p => p.trim());
  const from = routeParts[0] || '';
  const to = routeParts[1] || '';
  
  // Check if destination or origin matches park's airports/keywords
  const destinationMatches = mapping.airports.some(airport => to.includes(airport.toLowerCase())) ||
                            mapping.keywords.some(keyword => to.includes(keyword.toLowerCase()));
  
  const originMatches = mapping.airports.some(airport => from.includes(airport.toLowerCase())) ||
                       mapping.keywords.some(keyword => from.includes(keyword.toLowerCase()));
  
  // Apply direction filtering if specified
  if (direction === 'arrival') {
    // For arrival: destination must match park
    return destinationMatches;
  } else if (direction === 'departure') {
    // For departure: origin must match park
    return originMatches;
  }
  
  // No direction specified: show if either origin or destination matches
  return destinationMatches || originMatches;
}

/**
 * Get relevant airports for a park
 * @param parkId - The park ID
 * @returns Array of airport codes/names
 */
export function getAirportsForPark(parkId: string): string[] {
  const mapping = PARK_AIRPORT_MAPPINGS.find(m => m.parkId === parkId);
  return mapping?.airports || [];
}
