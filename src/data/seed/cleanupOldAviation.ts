/**
 * Cleanup script to remove old Aviation test items
 * 
 * This script removes old test items from the Aviation category
 * so that the new Logistics items (helicopter/fixed wing charters) are visible.
 */

import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

/**
 * Remove old Aviation test items from Firestore
 */
export async function cleanupOldAviation(): Promise<{
  deleted: number;
  errors: Array<{ itemName: string; error: string }>;
}> {
  const results = {
    deleted: 0,
    errors: [] as Array<{ itemName: string; error: string }>,
  };

  const pricingCatalogRef = collection(db, 'pricingCatalog');

  try {
    // Find all Aviation items that are Global
    const aviationQuery = query(
      pricingCatalogRef,
      where('category', '==', 'Aviation'),
      where('appliesTo', '==', 'Global')
    );

    const snapshot = await getDocs(aviationQuery);

    console.log(`Found ${snapshot.size} Aviation items to check`);

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const itemName = data.itemName || 'Unknown';

      try {
        // Delete the document
        await deleteDoc(doc(db, 'pricingCatalog', docSnapshot.id));
        console.log(`✅ Deleted: ${itemName} (${docSnapshot.id})`);
        results.deleted++;
      } catch (error) {
        console.error(`❌ Error deleting ${itemName}:`, error);
        results.errors.push({
          itemName,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`✅ Cleanup complete: ${results.deleted} items deleted, ${results.errors.length} errors`);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    results.errors.push({
      itemName: 'Query failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return results;
}

/**
 * Wrapper function to run cleanup (for direct script execution)
 * Note: Use CleanupOldAviation component for UI-based cleanup
 */
export async function runCleanup(): Promise<void> {
  const result = await cleanupOldAviation();
  
  console.log(`Cleanup completed: ${result.deleted} items deleted, ${result.errors.length} errors`);
  
  if (result.errors.length > 0) {
    console.error('Errors:', result.errors);
  }
}

