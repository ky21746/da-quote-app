import React, { useState } from 'react';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../common';

export const DeleteBwindiServiceFee: React.FC = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete the Bwindi Service Fee?')) {
      return;
    }

    setIsDeleting(true);
    setResult(null);

    try {
      const pricingCatalogRef = collection(db, 'pricingCatalog');
      
      const q = query(
        pricingCatalogRef,
        where('parkId', '==', 'BWINDI'),
        where('category', '==', 'Extras'),
        where('itemName', '==', 'Gorilla Trekking Service/Handling Fee')
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setResult({
          success: false,
          message: 'No Bwindi Service Fee found'
        });
        setIsDeleting(false);
        return;
      }

      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      setResult({
        success: true,
        message: `Successfully deleted ${snapshot.size} item(s)`
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
        Delete Bwindi Service Fee
      </h3>
      <p className="text-sm text-red-700 mb-4">
        This will delete the Gorilla Trekking Service/Handling Fee ($25/person) from the pricing catalog.
      </p>
      <Button
        onClick={handleDelete}
        disabled={isDeleting}
        variant="secondary"
      >
        {isDeleting ? 'Deleting...' : 'Delete Bwindi Service Fee'}
      </Button>
      
      {result && (
        <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <strong>{result.success ? 'Success!' : 'Error:'}</strong> {result.message}
        </div>
      )}
    </div>
  );
};
