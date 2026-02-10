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
  
  // Parse route - support both formats:
  // 1. "EBB to Kihihi" -> from: "EBB", to: "Kihihi"
  // 2. "Bubungu-Jinja-EBB" -> from: "Bubungu", stops: ["Jinja"], to: "EBB"
  let from = '';
  let to = '';
  let stops: string[] = [];
  
  if (lowerRouteName.includes(' to ')) {
    // Format: "A to B"
    const routeParts = lowerRouteName.split(' to ').map(p => p.trim());
    from = routeParts[0] || '';
    to = routeParts[1] || '';
  } else if (lowerRouteName.includes('-')) {
    // Format: "A-B-C" (multi-stop route)
    const routeParts = lowerRouteName.split('-').map(p => p.trim());
    if (routeParts.length >= 2) {
      from = routeParts[0];
      to = routeParts[routeParts.length - 1];
      stops = routeParts.slice(1, -1); // Middle stops
    }
  }
  
  // Check if any part of the route matches park's airports/keywords
  const checkMatch = (location: string) => {
    return mapping.airports.some(airport => location.includes(airport.toLowerCase())) ||
           mapping.keywords.some(keyword => location.includes(keyword.toLowerCase()));
  };
  
  const destinationMatches = checkMatch(to);
  const originMatches = checkMatch(from);
  const stopsMatch = stops.some(stop => checkMatch(stop));
  
  // Apply direction filtering if specified
  if (direction === 'arrival') {
    // For arrival: destination OR any stop must match park
    return destinationMatches || stopsMatch;
  } else if (direction === 'departure') {
    // For departure: origin OR any stop must match park
    return originMatches || stopsMatch;
  }
  
  // No direction specified: show if origin, destination, or any stop matches
  return destinationMatches || originMatches || stopsMatch;
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
