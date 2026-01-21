import React, { useState } from 'react';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../common';

export const DeleteEntikkoItems: React.FC = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete all Entikko Lodge items?')) {
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
      
      // Filter items that start with "Entikko Lodge"
      const entikkoDocs = snapshot.docs.filter(doc => {
        const itemName = doc.data().itemName as string;
        return itemName && itemName.startsWith('Entikko Lodge');
      });
      
      if (entikkoDocs.length === 0) {
        setResult({
          success: false,
          message: 'No Entikko Lodge items found'
        });
        setIsDeleting(false);
        return;
      }

      const deletePromises = entikkoDocs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      setResult({
        success: true,
        message: `Successfully deleted ${entikkoDocs.length} Entikko Lodge item(s)`
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
        Delete Entikko Lodge Items
      </h3>
      <p className="text-sm text-red-700 mb-4">
        This will delete all existing Entikko Lodge items (both Low and High season entries) from the pricing catalog.
      </p>
      <Button
        onClick={handleDelete}
        disabled={isDeleting}
        variant="secondary"
      >
        {isDeleting ? 'Deleting...' : 'Delete Entikko Lodge Items'}
      </Button>
      
      {result && (
        <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <strong>{result.success ? 'Success!' : 'Error:'}</strong> {result.message}
        </div>
      )}
    </div>
  );
};
