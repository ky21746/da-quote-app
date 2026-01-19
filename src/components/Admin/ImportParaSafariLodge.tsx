/**
 * Import component for Para Safari Lodge 2026 pricing
 */

import React, { useState } from 'react';
import { Button } from '../common';
import { runImport } from '../../data/seed/importParaSafariLodge';

export const ImportParaSafariLodge: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    skipped: number;
    errors: number;
  } | null>(null);

  const handleImport = async () => {
    if (!window.confirm('Are you sure you want to import Para Safari Lodge pricing? This will add 6 new lodging items to Firestore (all season combinations).')) {
      return;
    }

    setIsImporting(true);
    setResult(null);

    try {
      await runImport();
      
      setResult({
        success: 6,
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
      <h2 className="text-2xl font-bold mb-4">Import Para Safari Lodge (2026)</h2>
      <p className="text-gray-600 mb-4">
        This will import Para Safari Lodge pricing with seasonal variations (LOW/HIGH season).
        Check the browser console for detailed results.
      </p>
      
      <div className="mb-4">
        <Button
          onClick={handleImport}
          disabled={isImporting}
        >
          {isImporting ? 'Importing...' : 'Import Para Safari Lodge'}
        </Button>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="text-sm">
            <strong>Import completed.</strong> Check the browser console for detailed results.
          </p>
          <p className="text-sm mt-2">
            Expected: 6 items (Signature Cottage: 2, Classic Room: 2, Deluxe Family Room: 2)
          </p>
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Pricing Notes:</strong>
          <ul className="list-disc list-inside mt-2">
            <li>Each season combination is a separate item</li>
            <li>Includes LOW and HIGH season pricing</li>
            <li>All prices per person per night (Full Board, 4 pax)</li>
          </ul>
        </p>
      </div>
    </div>
  );
};
