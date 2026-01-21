import React, { useState } from 'react';
import { Button } from '../common';
import { runImport } from '../../data/seed/importParaSafariHierarchical';

export const ImportParaSafariHierarchical: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleImport = async () => {
    if (!window.confirm('Import Para Safari Lodge with hierarchical pricing structure?')) {
      return;
    }

    setIsImporting(true);
    setResult(null);

    try {
      await runImport();
      setResult('✅ Successfully imported Para Safari Lodge (hierarchical)');
    } catch (error) {
      console.error('Import failed:', error);
      setResult('❌ Import failed - check console');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-6 bg-green-50 border border-green-200 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-green-800">Import Para Safari Lodge (New Structure)</h2>
      <p className="text-gray-700 mb-4">
        This will import Para Safari Lodge with the new hierarchical pricing structure.
        <br />
        <strong>One item</strong> with all rooms, seasons, and occupancy options in metadata.
      </p>
      
      <div className="mb-4">
        <Button
          onClick={handleImport}
          disabled={isImporting}
          variant="primary"
        >
          {isImporting ? 'Importing...' : 'Import Hierarchical Para Safari Lodge'}
        </Button>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-white rounded">
          <p className="text-sm">{result}</p>
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>What this creates:</strong>
          <ul className="list-disc list-inside mt-2 text-xs">
            <li>1 catalog item: "Para Safari Lodge"</li>
            <li>Type: hierarchical_lodging</li>
            <li>3 Room Types: Signature Cottage, Classic Room, Deluxe Family Room</li>
            <li>2 Seasons: High, Low</li>
            <li>All rooms are 4 pax</li>
            <li>All pricing stored in metadata (editable in catalog table)</li>
          </ul>
        </p>
      </div>
    </div>
  );
};
