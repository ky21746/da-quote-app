/**
 * Cleanup old lodging items that don't follow the new naming convention
 */

import React, { useState } from 'react';
import { Button } from '../common';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const CleanupOldLodging: React.FC = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState<{
    deleted: number;
    items: string[];
  } | null>(null);

  const handleCleanup = async () => {
    if (!window.confirm('This will delete old lodging items that don\'t have hotel names. Continue?')) {
      return;
    }

    setIsDeleting(true);
    setResult(null);

    try {
      const pricingCatalogRef = collection(db, 'pricingCatalog');
      const q = query(
        pricingCatalogRef,
        where('category', '==', 'Lodging')
      );
      
      const snapshot = await getDocs(q);
      let deleted = 0;
      const deletedItems: string[] = [];

      for (const docSnap of snapshot.docs) {
        const item = docSnap.data();
        const itemName = item.itemName || '';
        
        // Delete items that don't have " – " separator (old format)
        // or items that start with just room type without hotel name
        const hasProperFormat = itemName.includes('–') && 
                               (itemName.includes('Lodge') || itemName.includes('Hotel') || itemName.includes('Camp'));
        
        if (!hasProperFormat && itemName.length > 0) {
          await deleteDoc(doc(db, 'pricingCatalog', docSnap.id));
          console.log(`✅ Deleted old format: ${itemName}`);
          deletedItems.push(itemName);
          deleted++;
        }
      }

      setResult({ deleted, items: deletedItems });
      console.log(`\n📊 Cleanup Summary: ${deleted} old items deleted`);
    } catch (error) {
      console.error('Cleanup failed:', error);
      setResult({ deleted: 0, items: [] });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-yellow-800">Cleanup Old Lodging Items</h2>
      <p className="text-gray-700 mb-4">
        This will delete lodging items that don't follow the new naming convention (Hotel Name – Room Type – Season).
      </p>
      
      <div className="mb-4">
        <Button
          onClick={handleCleanup}
          disabled={isDeleting}
          variant="secondary"
        >
          {isDeleting ? 'Cleaning up...' : 'Cleanup Old Items'}
        </Button>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-white rounded">
          <p className="text-sm font-semibold">
            Cleanup completed: {result.deleted} items deleted
          </p>
          {result.items.length > 0 && (
            <ul className="mt-2 text-xs text-gray-600 list-disc list-inside">
              {result.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
