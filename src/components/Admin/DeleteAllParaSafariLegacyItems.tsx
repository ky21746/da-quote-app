import React, { useState } from 'react';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../common';

export const DeleteAllParaSafariLegacyItems: React.FC = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete ALL Para Safari Lodge items (including legacy items)?')) {
      return;
    }

    setIsDeleting(true);
    setResult(null);

    try {
      const pricingCatalogRef = collection(db, 'pricingCatalog');
      
      // Get all lodging items from MURCHISON
      const q = query(
        pricingCatalogRef,
        where('parkId', '==', 'MURCHISON'),
        where('category', '==', 'Lodging')
      );
      
      const snapshot = await getDocs(q);
      
      // Filter items that start with "Para Safari Lodge"
      const paraSafariDocs = snapshot.docs.filter(doc => {
        const itemName = doc.data().itemName as string;
        return itemName && itemName.startsWith('Para Safari Lodge');
      });
      
      if (paraSafariDocs.length === 0) {
        setResult({
          success: false,
          message: 'No Para Safari Lodge items found'
        });
        setIsDeleting(false);
        return;
      }

      const deletePromises = paraSafariDocs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      setResult({
        success: true,
        message: `Successfully deleted ${paraSafariDocs.length} Para Safari Lodge item(s) (including legacy items)`
      });
    } catch (error) {
      console.error('Error deleting items:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Delete ALL Para Safari Lodge Items
      </h3>
      <p className="text-sm text-red-700 mb-4">
        This will delete ALL Para Safari Lodge items from the pricing catalog, including legacy items with names like "Para Safari Lodge – Signature Cottage – Low Season".
      </p>
      <Button
        onClick={handleDelete}
        disabled={isDeleting}
        variant="secondary"
      >
        {isDeleting ? 'Deleting...' : 'Delete ALL Para Safari Items'}
      </Button>
      
      {result && (
        <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <strong>{result.success ? 'Success!' : 'Error:'}</strong> {result.message}
        </div>
      )}
    </div>
  );
};
