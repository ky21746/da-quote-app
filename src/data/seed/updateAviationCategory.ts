/**
 * Script to update Aviation Logistics items category from "Logistics" to "Aviation"
 * 
 * This script finds all flight-related items (Helicopter/Fixed Wing Charters) 
 * in the "Logistics" category and updates them to "Aviation" category.
 */

import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

/**
 * List of flight-related item names to update
 */
const flightItemNames = [
  'Helicopter Charter – Bell 412 – EBB to Buhoma Community School',
  'Helicopter Charter – Bell 412 – Buhoma to Nile Safari Lodge',
  'Helicopter Charter – Bell 412 – Nile Safari Lodge to EBB',
  'Fixed Wing Charter – D1900 – EBB to Kihihi',
  'Fixed Wing Charter – D1900 – Kihihi to Bubungu',
  'Fixed Wing Charter – D1900 – Bubungu to EBB',
];

/**
 * Update flight items from Logistics to Aviation category
 */
export async function updateAviationCategory(): Promise<{
  updated: number;
  errors: Array<{ itemName: string; error: string }>;
}> {
  const results = {
    updated: 0,
    errors: [] as Array<{ itemName: string; error: string }>,
  };

  const pricingCatalogRef = collection(db, 'pricingCatalog');

  try {
    // Find all Logistics items that are Global
    const logisticsQuery = query(
      pricingCatalogRef,
      where('category', '==', 'Logistics'),
      where('appliesTo', '==', 'Global')
    );

    const snapshot = await getDocs(logisticsQuery);

    console.log(`Found ${snapshot.size} Logistics items to check`);

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const itemName = data.itemName || 'Unknown';

      // Check if this is a flight-related item (exact match or contains key words)
      const isFlightItem = 
        flightItemNames.includes(itemName) ||
        itemName.includes('Helicopter Charter') ||
        itemName.includes('Fixed Wing Charter');

      if (isFlightItem) {
        try {
          // Update category to Aviation
          await updateDoc(doc(db, 'pricingCatalog', docSnapshot.id), {
            category: 'Aviation',
          } as any);
          console.log(`✅ Updated: ${itemName} → Aviation`);
          results.updated++;
        } catch (error) {
          console.error(`❌ Error updating ${itemName}:`, error);
          results.errors.push({
            itemName,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    console.log(`✅ Update complete: ${results.updated} items updated, ${results.errors.length} errors`);
  } catch (error) {
    console.error('❌ Update failed:', error);
    results.errors.push({
      itemName: 'Query failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return results;
}

