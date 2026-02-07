/**
 * SKU Generation Utility
 * Generates standardized SKUs for pricing catalog items
 * Format: [PARK]_[CATEGORY]_[SHORTNAME]
 */

import { PricingCategory } from '../types/ui';

// Category abbreviations
const CATEGORY_CODES: Record<PricingCategory, string> = {
  'Activities': 'ACT',
  'Aviation': 'AVN',
  'Lodging': 'LODGE',
  'Park Fees': 'FEE',
  'Permits': 'PERMIT',
  'Extras': 'EXT',
  'Logistics': 'LOG',
  'Vehicle': 'VEH'
};

// Park ID mappings (short forms)
const PARK_MAPPINGS: Record<string, string> = {
  'QUEEN_ELIZABETH': 'QE',
  'LAKE_MBURO': 'MBURO',
  'LAKE_BUNYONYI': 'BUNYONYI',
  'MT_ELGON': 'ELGON',
  'MURCHISON': 'MURCHISON',
  'BWINDI': 'BWINDI',
  'KIBALE': 'KIBALE',
  'KIDEPO': 'KIDEPO',
  'RWENZORI': 'RWENZORI',
  'SEMULIKI': 'SEMULIKI',
  'MGAHINGA': 'MGAHINGA',
  'ZIWA': 'ZIWA',
  'BUSIKA': 'BUSIKA',
  'JINJA': 'JINJA',
  'ENTEBBE': 'ENTEBBE',
  'Global': 'GLOBAL',
  'GLOBAL': 'GLOBAL'
};

/**
 * Normalize park ID to short form
 */
function normalizeParkId(parkId: string | null | undefined): string {
  if (!parkId || parkId === 'Global') return 'GLOBAL';
  return PARK_MAPPINGS[parkId] || parkId.toUpperCase();
}

/**
 * Generate short name from item name
 * Rules:
 * - Uppercase
 * - Replace spaces with underscores
 * - Remove common words (Full Board, with UWA Guide, FNR, etc.)
 * - Include duration if present (e.g., 20MIN, 1HR)
 * - Include age variant if present (e.g., ADULT, CHILD)
 * - Max 20 characters
 */
function generateShortName(itemName: string): string {
  let shortName = itemName
    .toUpperCase()
    .trim()
    // Remove common phrases
    .replace(/\(FNR\)/g, '')
    .replace(/FULL BOARD/g, '')
    .replace(/WITH UWA GUIDE/g, '')
    .replace(/\(FOREIGN REGISTERED\)/g, '')
    .replace(/FOREIGN REGISTERED/g, '')
    .replace(/A&K SANCTUARY/g, 'AK')
    // Replace special characters
    .replace(/–/g, '-')
    .replace(/\//g, '_')
    .replace(/&/g, '')
    // Clean up spaces
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  // Extract and format duration (e.g., "20 min" -> "20MIN")
  shortName = shortName
    .replace(/(\d+)\s*MIN(UTE)?S?/g, '$1MIN')
    .replace(/(\d+)\s*HOUR?S?/g, '$1HR')
    .replace(/(\d+)\s*ROUND?S?/g, '$1RND');

  // Limit to 20 characters
  if (shortName.length > 20) {
    shortName = shortName.substring(0, 20);
  }

  return shortName;
}

/**
 * Generate SKU for a pricing item
 */
export function generateSku(
  itemName: string,
  category: PricingCategory,
  parkId: string | null | undefined
): string {
  const park = normalizeParkId(parkId);
  const categoryCode = CATEGORY_CODES[category];
  const shortName = generateShortName(itemName);

  return `${park}_${categoryCode}_${shortName}`;
}

/**
 * Check if SKU already exists in a list of existing SKUs
 * If it exists, append a counter (_2, _3, etc.)
 */
export function ensureUniqueSku(
  proposedSku: string,
  existingSkus: string[]
): string {
  let uniqueSku = proposedSku;
  let counter = 2;

  while (existingSkus.includes(uniqueSku)) {
    uniqueSku = `${proposedSku}_${counter}`;
    counter++;
  }

  return uniqueSku;
}
