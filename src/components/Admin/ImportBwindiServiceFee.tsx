import React, { useState } from 'react';
import { Button } from '../common';
import { importBwindiServiceFee } from '../../data/seed/importBwindiServiceFee';

export const ImportBwindiServiceFee: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleImport = async () => {
    setIsImporting(true);
    setResult(null);

    try {
      const importResult = await importBwindiServiceFee();
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
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-lg font-semibold text-green-900 mb-2">
        Import Bwindi Service Fee
      </h3>
      <p className="text-sm text-green-700 mb-4">
        This will add the Gorilla Trekking Service/Handling Fee ($25 per person) to the Extras category for Bwindi. 
        This is a standard industry fee for guide services and trek logistics.
      </p>
      <Button
        onClick={handleImport}
        disabled={isImporting}
        variant="primary"
      >
        {isImporting ? 'Importing...' : 'Import Bwindi Service Fee'}
      </Button>
      
      {result && (
        <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <strong>{result.success ? 'Success!' : 'Error:'}</strong> {result.message}
        </div>
      )}
    </div>
  );
};
