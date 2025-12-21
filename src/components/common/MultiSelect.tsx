import React from 'react';
import { CatalogOption } from '../../types/ui';

interface MultiSelectProps {
  label: string;
  selectedIds: string[];
  options: CatalogOption[];
  onChange: (selectedIds: string[]) => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  selectedIds,
  options,
  onChange,
}) => {
  const handleToggle = (optionId: string) => {
    if (selectedIds.includes(optionId)) {
      onChange(selectedIds.filter((id) => id !== optionId));
    } else {
      onChange([...selectedIds, optionId]);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded p-2">
        {options.length === 0 ? (
          <div className="text-sm text-gray-500">No options available</div>
        ) : (
          options.map((option) => (
            <label key={option.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(option.id)}
                  onChange={() => handleToggle(option.id)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{option.name}</span>
              </div>
              {option.price && (
                <span className="text-xs text-gray-500 ml-2">{option.price}</span>
              )}
            </label>
          ))
        )}
      </div>
    </div>
  );
};






