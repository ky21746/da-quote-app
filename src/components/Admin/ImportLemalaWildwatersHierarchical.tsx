import React, { useState } from 'react';
import { Button } from '../common';
import { runImport } from '../../data/seed/importLemalaWildwatersHierarchical';

export const ImportLemalaWildwatersHierarchical: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleImport = async () => {
    if (!window.confirm('Import Lemala Wildwaters Lodge with hierarchical pricing structure?')) {
      return;
    }

    setIsImporting(true);
    setResult(null);

    try {
      await runImport();
      setResult('✅ Successfully imported Lemala Wildwaters Lodge (hierarchical)');
    } catch (error) {
      console.error('Import failed:', error);
      setResult('❌ Import failed - check console');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-6 bg-green-50 border border-green-200 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-green-800">Import Lemala Wildwaters Lodge (New Structure)</h2>
      <p className="text-gray-700 mb-4">
        This will import Lemala Wildwaters Lodge with the new hierarchical pricing structure.
        <br />
        <strong>One item</strong> with all rooms, seasons, and occupancy options in metadata.
      </p>
      
      <div className="mb-4">
        <Button
          onClick={handleImport}
          disabled={isImporting}
          variant="primary"
        >
          {isImporting ? 'Importing...' : 'Import Hierarchical Lemala Wildwaters Lodge'}
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
            <li>1 catalog item: "Lemala Wildwaters Lodge"</li>
            <li>Type: hierarchical_lodging</li>
            <li>2 Room Types: Standard Suite, Private Pool Suite</li>
            <li>3 Seasons: High, Mid, Low</li>
            <li>Multiple occupancy options (Single/Double/Triple/Suite)</li>
            <li><strong>Additional fee:</strong> $12 Community and Government Contribution (per booking)</li>
            <li><strong>Restrictions:</strong> No family room, max 3 people, no guests below 16 years</li>
            <li>All pricing stored in metadata (editable in catalog table)</li>
          </ul>
        </p>
      </div>
    </div>
  );
};
