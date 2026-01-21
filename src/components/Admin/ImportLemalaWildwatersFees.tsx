import React, { useState } from 'react';
import { Button } from '../common';
import { importLemalaWildwatersFees } from '../../data/seed/importLemalaWildwatersFees';

export const ImportLemalaWildwatersFees: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleImport = async () => {
    setIsImporting(true);
    setResult(null);

    try {
      const importResult = await importLemalaWildwatersFees();
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
        Import Lemala Wildwaters Room Fees
      </h3>
      <p className="text-sm text-green-700 mb-4">
        This will add the Room Fees ($12 per room per night) to the Extras category for Jinja. 
        Includes Room Levy ($2) + Community Contribution Fee ($10).
      </p>
      <Button
        onClick={handleImport}
        disabled={isImporting}
        variant="primary"
      >
        {isImporting ? 'Importing...' : 'Import Lemala Wildwaters Room Fees'}
      </Button>
      
      {result && (
        <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <strong>{result.success ? 'Success!' : 'Error:'}</strong> {result.message}
        </div>
      )}
    </div>
  );
};
