/**
 * Delete old Nile Safari Lodge and Para Safari Lodge items that conflict with new detailed pricing
 */

import React, { useState } from 'react';
import { Button } from '../common';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const DeleteOldLodgingItems: React.FC = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState<{
    deleted: number;
    errors: number;
  } | null>(null);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete old Nile Safari Lodge and Para Safari Lodge items? This will remove items without season/occupancy details.')) {
      return;
    }

    setIsDeleting(true);
    setResult(null);

    try {
      const pricingCatalogRef = collection(db, 'pricingCatalog');
      let deleted = 0;
      let errors = 0;

      // Items to delete (old generic items without season/occupancy)
      const itemsToDelete = [
        'Nile Safari Lodge – Full Board',
        'Para Safari Lodge – Signature Cottage – Full Board',
        'Para Safari Lodge – Classic Room – Full Board',
        'Para Safari Lodge – Deluxe Family Room – Full Board'
      ];

      for (const itemName of itemsToDelete) {
        try {
          const q = query(
            pricingCatalogRef,
            where('category', '==', 'Lodging'),
            where('itemName', '==', itemName)
          );
          
          const snapshot = await getDocs(q);
          
          for (const docSnap of snapshot.docs) {
            await deleteDoc(doc(db, 'pricingCatalog', docSnap.id));
            console.log(`✅ Deleted: ${itemName}`);
            deleted++;
          }
        } catch (error) {
          console.error(`❌ Error deleting ${itemName}:`, error);
          errors++;
        }
      }

      setResult({ deleted, errors });
      console.log(`\n📊 Deletion Summary: ${deleted} deleted, ${errors} errors`);
    } catch (error) {
      console.error('Delete failed:', error);
      setResult({ deleted: 0, errors: 1 });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-red-800">Delete Old Lodging Items</h2>
      <p className="text-gray-700 mb-4">
        This will delete old generic Nile Safari Lodge and Para Safari Lodge items that don't have season/occupancy details.
        Check the browser console for detailed results.
      </p>
      
      <div className="mb-4">
        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          variant="secondary"
        >
          {isDeleting ? 'Deleting...' : 'Delete Old Items'}
        </Button>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-white rounded">
          <p className="text-sm">
            <strong>Deletion completed.</strong>
          </p>
          <p className="text-sm mt-2">
            Deleted: {result.deleted} items | Errors: {result.errors}
          </p>
        </div>
      )}

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Items to be deleted:</strong>
          <ul className="list-disc list-inside mt-2">
            <li>Nile Safari Lodge – Full Board (old generic item)</li>
            <li>Para Safari Lodge – Signature Cottage – Full Board (old)</li>
            <li>Para Safari Lodge – Classic Room – Full Board (old)</li>
            <li>Para Safari Lodge – Deluxe Family Room – Full Board (old)</li>
          </ul>
        </p>
      </div>
    </div>
  );
};
