import React, { useState } from 'react';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../common';

export const DeleteCloudsMountainGorillaItems: React.FC = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete all Clouds Mountain Gorilla Lodge items?')) {
      return;
    }

    setIsDeleting(true);
    setResult(null);

    try {
      const pricingCatalogRef = collection(db, 'pricingCatalog');
      
      const q = query(
        pricingCatalogRef,
        where('parkId', '==', 'BWINDI'),
        where('category', '==', 'Lodging'),
        where('itemName', '==', 'Clouds Mountain Gorilla Lodge')
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setResult({
          success: false,
          message: 'No Clouds Mountain Gorilla Lodge items found'
        });
        setIsDeleting(false);
        return;
      }

      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      setResult({
        success: true,
        message: `Successfully deleted ${snapshot.size} Clouds Mountain Gorilla Lodge item(s)`
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
        Delete Clouds Mountain Gorilla Lodge
      </h3>
      <p className="text-sm text-red-700 mb-4">
        This will delete all existing Clouds Mountain Gorilla Lodge items from the pricing catalog.
      </p>
      <Button
        onClick={handleDelete}
        disabled={isDeleting}
        variant="secondary"
      >
        {isDeleting ? 'Deleting...' : 'Delete Clouds Mountain Gorilla Lodge'}
      </Button>
      
      {result && (
        <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <strong>{result.success ? 'Success!' : 'Error:'}</strong> {result.message}
        </div>
      )}
    </div>
  );
};
