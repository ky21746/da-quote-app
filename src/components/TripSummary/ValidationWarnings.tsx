import React from 'react';

interface ValidationWarningsProps {
  warnings: string[];
}

export const ValidationWarnings: React.FC<ValidationWarningsProps> = ({ warnings }) => {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="font-semibold text-yellow-700 mb-2">Validation Warnings</h3>
      <div className="space-y-2">
        {warnings.map((warning, idx) => (
          <div
            key={idx}
            className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded text-sm"
          >
            {warning}
          </div>
        ))}
      </div>
    </div>
  );
};



