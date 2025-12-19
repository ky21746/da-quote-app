import React, { useState } from 'react';
import { Button } from '../common';
import { updateAviationCategory } from '../../data/seed/updateAviationCategory';

export const UpdateAviationCategory: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [result, setResult] = useState<{ updated: number; errors: number } | null>(null);

  const handleUpdate = async () => {
    if (!window.confirm(
      'This will update flight items (Helicopter/Fixed Wing Charters) from "Logistics" to "Aviation" category.\n\n' +
      'This will make them appear only in "Arrival to Park" field, not in "Vehicle & Driver".\n\n' +
      'Continue?'
    )) {
      return;
    }

    setIsUpdating(true);
    setResult(null);

    try {
      const updateResult = await updateAviationCategory();
      setResult({
        updated: updateResult.updated,
        errors: updateResult.errors.length,
      });
    } catch (error) {
      console.error('Update failed:', error);
      setResult({ updated: 0, errors: 1 });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow mb-4 border-2 border-blue-500">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">✈️ Update Aviation Category</h2>
      <p className="text-gray-600 mb-4">
        This will update flight items (Helicopter/Fixed Wing Charters) from <strong>"Logistics"</strong> to <strong>"Aviation"</strong> category.
        <br />
        <strong>Result:</strong>
        <ul className="list-disc list-inside mt-2 ml-4">
          <li>Flight items will appear in <strong>"Arrival to Park"</strong> field</li>
          <li>Flight items will <strong>NOT</strong> appear in "Vehicle & Driver" field</li>
          <li>Other Logistics items (Vehicle Entry, Boat Entry, etc.) remain in Logistics</li>
        </ul>
      </p>
      <div className="mb-4">
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update Flight Items to Aviation Category'}
        </Button>
      </div>
      {result && (
        <div className={`p-4 rounded ${result.errors > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
          <p className="font-semibold">
            {result.errors > 0 ? '⚠️ Update completed with errors' : '✅ Update completed'}
          </p>
          <p>Updated: {result.updated} items</p>
          {result.errors > 0 && <p className="text-red-600">Errors: {result.errors}</p>}
        </div>
      )}
    </div>
  );
};

