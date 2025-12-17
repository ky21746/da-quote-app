import React from 'react';
import { useCatalog } from '../../hooks/useCatalog';

interface ParksSelectorProps {
  selectedIds: string[];
  onChange: (parkIds: string[]) => void;
}

export const ParksSelector: React.FC<ParksSelectorProps> = ({ selectedIds, onChange }) => {
  const { items, loading } = useCatalog('park');

  if (loading) {
    return <div className="text-sm text-gray-500">Loading parks...</div>;
  }

  const handleToggle = (parkId: string) => {
    if (selectedIds.includes(parkId)) {
      onChange(selectedIds.filter((id) => id !== parkId));
    } else {
      onChange([...selectedIds, parkId]);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Parks & Permits</label>
      <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded p-2">
        {items.length === 0 ? (
          <div className="text-sm text-gray-500">No parks available</div>
        ) : (
          items.map((park) => (
            <label key={park.id} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedIds.includes(park.id)}
                onChange={() => handleToggle(park.id)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                {park.name}
                {'location' in park && park.location && (
                  <span className="text-gray-500"> ({park.location})</span>
                )}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  );
};

