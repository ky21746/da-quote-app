/**
 * Delete ONLY Lemala Wildwaters Lodge lodging items
 */

import React, { useState } from 'react';
import { Button } from '../common';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const DeleteLemalaWildwatersItems: React.FC = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState<{
    deleted: number;
    items: string[];
  } | null>(null);

  const handleDelete = async () => {
    if (!window.confirm('This will delete ALL Lemala Wildwaters Lodge lodging items. Continue?')) {
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
        
        // Delete ONLY items that contain "Lemala Wildwaters"
        if (itemName.includes('Lemala Wildwaters') || itemName === 'Lemala Wildwaters Lodge') {
          await deleteDoc(doc(db, 'pricingCatalog', docSnap.id));
          console.log(`✅ Deleted: ${itemName}`);
          deletedItems.push(itemName);
          deleted++;
        }
      }

      setResult({ deleted, items: deletedItems });
      console.log(`\n📊 Deletion Summary: ${deleted} Lemala Wildwaters items deleted`);
    } catch (error) {
      console.error('Delete failed:', error);
      setResult({ deleted: 0, items: [] });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-red-800">Delete Lemala Wildwaters Lodge Items</h2>
      <p className="text-gray-700 mb-4">
        This will delete ALL lodging items that contain "Lemala Wildwaters" in the name.
        Check the browser console for detailed results.
      </p>
      
      <div className="mb-4">
        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          variant="secondary"
        >
          {isDeleting ? 'Deleting...' : 'Delete Lemala Wildwaters Items'}
        </Button>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-white rounded">
          <p className="text-sm font-semibold">
            Deleted {result.deleted} items
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

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>This will delete:</strong>
          <ul className="list-disc list-inside mt-2">
            <li>All items containing "Lemala Wildwaters"</li>
            <li>Both old and new format items</li>
            <li>All seasonal variations</li>
          </ul>
        </p>
      </div>
    </div>
  );
};
