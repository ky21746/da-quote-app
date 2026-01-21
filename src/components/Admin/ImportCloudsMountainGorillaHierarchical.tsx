import React, { useState } from 'react';
import { Button } from '../common';
import { importCloudsMountainGorillaHierarchical } from '../../data/seed/importCloudsMountainGorilla';

export const ImportCloudsMountainGorillaHierarchical: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleImport = async () => {
    setIsImporting(true);
    setResult(null);

    try {
      const importResult = await importCloudsMountainGorillaHierarchical();
      setResult(importResult);
    } catch (error) {
      console.error('Import error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">
        Import Clouds Mountain Gorilla Lodge (Hierarchical)
      </h3>
      <p className="text-sm text-blue-700 mb-4">
        This will import Clouds Mountain Gorilla Lodge with hierarchical pricing structure (Stand Alone Cottages, Family Cottages, Children options).
      </p>
      <Button
        onClick={handleImport}
        disabled={isImporting}
        variant="primary"
      >
        {isImporting ? 'Importing...' : 'Import Clouds Mountain Gorilla Lodge'}
      </Button>
      
      {result && (
        <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <strong>{result.success ? 'Success!' : 'Error:'}</strong> {result.message}
        </div>
      )}
    </div>
  );
};
