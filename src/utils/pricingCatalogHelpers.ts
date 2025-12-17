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
  // 2. Match category
  // 3. AND (appliesTo === 'Global' OR parkId === parkId)
  const result = catalog.filter((item) => {
    if (!item.active) return false;
    if (item.category !== category) return false;
    
    // Show Global items OR park-specific items matching this park
    // CRITICAL: Handle null/undefined parkId correctly
    const isGlobal = item.appliesTo === 'Global';
    const isParkMatch = item.parkId !== null && item.parkId !== undefined && item.parkId === parkId;
    const matches = isGlobal || isParkMatch;
    
    // DEBUG: Log detailed filtering
    if (category === 'Lodging') {
      console.log(`[getCatalogItemsForPark] Checking item:`, {
        itemName: item.itemName,
        itemParkId: item.parkId,
        itemAppliesTo: item.appliesTo,
        searchParkId: parkId,
        active: item.active,
        categoryMatch: item.category === category,
        isGlobal,
        isParkMatch,
        matches
      });
    }
    
    return matches;
  });
  
  // DEBUG: Log result
  if (category === 'Lodging') {
    console.log(`[getCatalogItemsForPark] Result for parkId=${parkId}, category=${category}:`, result.length, 'items');
    console.log(`[getCatalogItemsForPark] Result items:`, result.map(i => ({ name: i.itemName, parkId: i.parkId, appliesTo: i.appliesTo })));
  }
  
  return result;
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
