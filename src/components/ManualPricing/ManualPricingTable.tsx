import React from 'react';
import { ManualPricingLineItem, ManualCostType } from '../../types/ui';
import { calculateLineTotal } from '../../utils/manualPricingHelpers';

interface ManualPricingTableProps {
  lines: ManualPricingLineItem[];
  travelers: number;
  days: number;
  nights: number;
  onUpdateLine: (lineId: string, updates: Partial<ManualPricingLineItem>) => void;
}

export const ManualPricingTable: React.FC<ManualPricingTableProps> = ({
  lines,
  travelers,
  days,
  nights,
  onUpdateLine,
}) => {
  const costTypeOptions: Array<{ value: ManualCostType | ''; label: string }> = [
    { value: '', label: 'Select cost type...' },
    { value: 'fixed_group', label: 'Fixed – Group' },
    { value: 'fixed_per_day', label: 'Fixed – Per Day' },
    { value: 'per_person', label: 'Per Person' },
    { value: 'per_person_per_day', label: 'Per Person Per Day' },
    { value: 'per_night_per_person', label: 'Per Night Per Person' },
    { value: 'per_night_fixed', label: 'Per Night – Fixed' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2 text-left">Park</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Category</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Item Name</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Base Price (USD)</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Cost Type</th>
            <th className="border border-gray-300 px-3 py-2 text-center">Show Total</th>
            <th className="border border-gray-300 px-3 py-2 text-center">Show Per Person</th>
            <th className="border border-gray-300 px-3 py-2 text-center">Opt Out</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Notes</th>
            <th className="border border-gray-300 px-3 py-2 text-right">Total</th>
            <th className="border border-gray-300 px-3 py-2 text-right">Per Person</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            const lineTotal = calculateLineTotal(line, travelers, days, nights);
            const perPerson = travelers > 0 ? lineTotal / travelers : 0;

            return (
              <tr
                key={line.id}
                className={`hover:bg-gray-50 ${line.optedOut ? 'bg-gray-100 opacity-60' : ''}`}
              >
                {/* Read-only fields */}
                <td className="border border-gray-300 px-3 py-2">{line.park}</td>
                <td className="border border-gray-300 px-3 py-2">{line.category}</td>
                <td className="border border-gray-300 px-3 py-2 font-medium">
                  {line.itemName}
                  {line.optedOut && (
                    <span className="ml-2 text-xs text-red-600">(Opted out)</span>
                  )}
                </td>

                {/* Base Price */}
                <td className="border border-gray-300 px-3 py-2">
                  <input
                    type="number"
                    value={line.basePrice ?? ''}
                    onChange={(e) =>
                      onUpdateLine(line.id, {
                        basePrice: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </td>

                {/* Cost Type */}
                <td className="border border-gray-300 px-3 py-2">
                  <select
                    value={line.costType}
                    onChange={(e) =>
                      onUpdateLine(line.id, { costType: e.target.value as ManualCostType | '' })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {costTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Show Total */}
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={line.showTotal}
                    onChange={(e) =>
                      onUpdateLine(line.id, { showTotal: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                </td>

                {/* Show Per Person */}
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={line.showPerPerson}
                    onChange={(e) =>
                      onUpdateLine(line.id, { showPerPerson: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                </td>

                {/* Opt Out */}
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={line.optedOut}
                    onChange={(e) =>
                      onUpdateLine(line.id, { optedOut: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                </td>

                {/* Notes */}
                <td className="border border-gray-300 px-3 py-2">
                  <input
                    type="text"
                    value={line.notes || ''}
                    onChange={(e) =>
                      onUpdateLine(line.id, { notes: e.target.value })
                    }
                    placeholder="Internal notes..."
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </td>

                {/* Calculated Total */}
                <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                  {line.showTotal && !line.optedOut
                    ? `USD ${lineTotal.toFixed(2)}`
                    : '-'}
                </td>

                {/* Per Person */}
                <td className="border border-gray-300 px-3 py-2 text-right">
                  {line.showPerPerson && !line.optedOut
                    ? `USD ${perPerson.toFixed(2)}`
                    : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

