/**
 * Import ALL original lodging data - restore deleted items
 */

import React, { useState } from 'react';
import { Button } from '../common';
import { runImport } from '../../data/seed/importLodging';

export const ImportAllLodging: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    skipped: number;
    errors: number;
  } | null>(null);

  const handleImport = async () => {
    if (!window.confirm('This will restore ALL original lodging items (Entikko, Para Safari, Nile Safari, Ishasha, Mweya, Silverback, Clouds, Nkuringo, Buhoma, Gorilla Forest, Extreme Adventure, Mirembe Villas). Continue?')) {
      return;
    }

    setIsImporting(true);
    setResult(null);

    try {
      await runImport();
      
      setResult({
        success: 12,
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
    <div className="p-6 bg-green-50 border border-green-200 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-green-800">Restore ALL Original Lodging Items</h2>
      <p className="text-gray-700 mb-4">
        This will restore all 12 original lodging items that were in the system before the cleanup.
        Check the browser console for detailed results.
      </p>
      
      <div className="mb-4">
        <Button
          onClick={handleImport}
          disabled={isImporting}
          variant="primary"
        >
          {isImporting ? 'Restoring...' : 'Restore All Original Lodging'}
        </Button>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-white rounded">
          <p className="text-sm">
            <strong>Restore completed.</strong> Check the browser console for detailed results.
          </p>
          <p className="text-sm mt-2">
            Expected: 12 original items (Entikko, Para Safari, Nile Safari, Ishasha, Mweya, Silverback, Clouds, Nkuringo, Buhoma, Gorilla Forest, Extreme Adventure, Mirembe Villas)
          </p>
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Items to be restored:</strong>
          <ul className="list-disc list-inside mt-2 text-xs">
            <li>Entikko Lodge – Full Board ($529)</li>
            <li>Para Safari Lodge – Full Board ($319)</li>
            <li>Nile Safari Lodge – Full Board ($1265)</li>
            <li>Ishasha Wilderness Camp – Full Board ($635)</li>
            <li>Mweya Lodge – Full Board ($467)</li>
            <li>Silverback Lodge – Full Board ($1670)</li>
            <li>Clouds Gorilla Lodge – Full Board ($1860)</li>
            <li>Nkuringo Bwindi Gorilla Lodge – Full Board ($1215)</li>
            <li>Buhoma Lodge – Full Board ($705)</li>
            <li>Gorilla Forest Lodge (A&K Sanctuary) – Full Board ($1500)</li>
            <li>Extreme Adventure Park – Lodging ($160)</li>
            <li>Mirembe Villas – Full Board ($100)</li>
          </ul>
        </p>
      </div>
    </div>
  );
};
