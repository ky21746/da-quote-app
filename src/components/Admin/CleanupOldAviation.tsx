import React, { useState } from 'react';
import { Button } from '../common';
import { cleanupOldAviation } from '../../data/seed/cleanupOldAviation';

export const CleanupOldAviation: React.FC = () => {
  const [isCleaning, setIsCleaning] = useState(false);
  const [result, setResult] = useState<{ deleted: number; errors: number } | null>(null);

  const handleCleanup = async () => {
    if (!window.confirm('Are you sure you want to delete all Aviation items? This will remove all test items from the Aviation category.')) {
      return;
    }

    setIsCleaning(true);
    setResult(null);

    try {
      const cleanupResult = await cleanupOldAviation();
      setResult({
        deleted: cleanupResult.deleted,
        errors: cleanupResult.errors.length,
      });
    } catch (error) {
      console.error('Cleanup failed:', error);
      setResult({ deleted: 0, errors: 1 });
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow mb-4 border-2 border-red-500">
      <h2 className="text-2xl font-bold mb-4 text-red-800">⚠️ Cleanup Old Aviation Items</h2>
      <p className="text-gray-600 mb-4">
        This will delete all items in the <strong>Aviation</strong> category that are Global.
        <br />
        <strong>Use this to remove old test items (TEST_ITEM_DELETE_ME, Auto QA Aviation, etc.)</strong>
        <br />
        <span className="text-sm text-gray-500">
          The new flight items are in the <strong>Logistics</strong> category and will remain.
        </span>
      </p>
      <div className="mb-4">
        <Button onClick={handleCleanup} disabled={isCleaning}>
          {isCleaning ? 'Deleting...' : 'Delete All Aviation Items'}
        </Button>
      </div>
      {result && (
        <div className={`p-4 rounded ${result.errors > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
          <p className="font-semibold">
            {result.errors > 0 ? '⚠️ Cleanup completed with errors' : '✅ Cleanup completed'}
          </p>
          <p>Deleted: {result.deleted} items</p>
          {result.errors > 0 && <p className="text-red-600">Errors: {result.errors}</p>}
        </div>
      )}
      <p className="text-xs text-gray-500 mt-4">
        ⚠️ This action cannot be undone. Make sure you want to delete these items before proceeding.
      </p>
    </div>
  );
};


