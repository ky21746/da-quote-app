import React from 'react';
import { Input } from './Input';

interface VehicleSelectorProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({ enabled, onChange }) => {
  return (
    <div className="mb-4">
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span className="text-sm font-medium text-gray-700">Vehicle Required</span>
      </label>
    </div>
  );
};



