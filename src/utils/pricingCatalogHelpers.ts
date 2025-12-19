import { PricingItem, PricingCategory } from '../types/ui';
import { assertValidParkId } from './parks';

/**
 * CANONICAL function to get catalog items for a specific park and category
 * Single Source of Truth - NO deviations
 * 
 * @param catalog - All pricing items from PricingCatalogContext
 * @param parkId - Park ID string (must match park.id from Trip Builder)
 * @param category - PricingCategory to filter by
 * @returns Filtered active items matching parkId (or Global) and category
 * 
 * Special case: When category is 'Activities', also includes 'Permits' from the same park
 */
export function getCatalogItemsForPark(
  catalog: PricingItem[],
  parkId: string | undefined,
  category: PricingCategory
): PricingItem[] {
  // Type guard: Validate parkId before filtering
  if (parkId) {
    assertValidParkId(parkId);
  }
  
  if (!parkId) {
    // If no park selected, return only Global items
    return catalog.filter((item) => {
      return item.active && 
             item.category === category && 
             item.appliesTo === 'Global';
    });
  }

  // Return items that are:
  // 1. Active
  // 2. Match category (or Permits if category is Activities)
  // 3. AND (appliesTo === 'Global' OR parkId === parkId)
  return catalog.filter((item) => {
    if (!item.active) return false;
    
    // Special case: Include Permits when filtering for Activities
    const categoryMatch = item.category === category || 
                        (category === 'Activities' && item.category === 'Permits');
    if (!categoryMatch) return false;
    
    // Show Global items OR park-specific items matching this park
    const isGlobal = item.appliesTo === 'Global';
    const isParkMatch = item.parkId !== null && item.parkId !== undefined && item.parkId === parkId;
    return isGlobal || isParkMatch;
  });
}

/**
 * Legacy alias - uses canonical function
 */
export function getCatalogItems(
  catalog: PricingItem[],
  parkId: string | undefined,
  category: PricingCategory
): PricingItem[] {
  return getCatalogItemsForPark(catalog, parkId, category);
}

/**
 * Get pricing item by ID (includes inactive items - for display purposes)
 */
export function getPricingItemById(items: PricingItem[], id: string): PricingItem | undefined {
  return items.find((item) => item.id === id);
}

/**
 * Get pricing items by IDs
 */
export function getPricingItemsByIds(items: PricingItem[], ids: string[]): PricingItem[] {
  return ids
    .map((id) => getPricingItemById(items, id))
    .filter((item): item is PricingItem => !!item);
}
