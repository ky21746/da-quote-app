/**
 * Temporary component for importing aviation logistics (Helicopter & Fixed Wing Charters)
 * 
 * Usage:
 * 1. Add this component to a route or admin page
 * 2. Click the import button
 * 3. Check console for results
 * 4. Remove this component after import is complete
 */

import React, { useState } from 'react';
import { Button } from '../common';
import { runImport } from '../../data/seed/importAviationLogistics';

export const ImportAviationLogistics: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    skipped: number;
    errors: number;
  } | null>(null);

  const handleImport = async () => {
    if (!window.confirm('Are you sure you want to import aviation logistics? This will add items to Firestore.')) {
      return;
    }

    setIsImporting(true);
    setResult(null);

    try {
      // Import function will log results to console
      await runImport();
      
      // Note: The runImport function doesn't return results, so we show a success message
      setResult({
        success: 6, // Expected number of items
        skipped: 0,
        errors: 0,
      });
    } catch (error) {
      console.error('Import failed:', error);
      setResult({
        success: 0,
        skipped: 0,
        errors: 1,
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Import Aviation Logistics</h2>
      <p className="text-gray-600 mb-4">
        This will import aviation logistics pricing data (Helicopter & Fixed Wing Charters) from the seed file into Firestore.
        All items are Global (apply to all parks).
        Check the browser console for detailed results.
      </p>
      
      <div className="mb-4">
        <Button
          onClick={handleImport}
          disabled={isImporting}
        >
          {isImporting ? 'Importing...' : 'Import Aviation Logistics'}
        </Button>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="text-sm">
            <strong>Import completed.</strong> Check the browser console for detailed results.
          </p>
          <p className="text-sm mt-2">
            Expected: 6 items (3 Helicopter Charters, 3 Fixed Wing Charters) - All Global items
          </p>
        </div>
      )}

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This is a temporary component. Remove it after the import is complete.
        </p>
      </div>
    </div>
  );
};

