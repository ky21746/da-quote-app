import React from 'react';
import { PricingLineItem } from '../../utils/catalogPricingEngine';

interface PricingTableProps {
  lines: PricingLineItem[];
}

export const PricingTable: React.FC<PricingTableProps> = ({ lines }) => {
  const formatCurrency = (amount: number): string => {
    return `USD ${amount.toFixed(2)}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2 text-left">Park</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Category</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Item Name</th>
            <th className="border border-gray-300 px-3 py-2 text-right">Base Price</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Cost Type</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Calculation</th>
            <th className="border border-gray-300 px-3 py-2 text-right">Total</th>
            <th className="border border-gray-300 px-3 py-2 text-right">Per Person</th>
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 ? (
            <tr>
              <td colSpan={8} className="border border-gray-300 px-3 py-4 text-center text-gray-500">
                No pricing items selected
              </td>
            </tr>
          ) : (
            lines.map((line) => (
              <tr key={line.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-3 py-2">{line.park}</td>
                <td className="border border-gray-300 px-3 py-2">{line.category}</td>
                <td className="border border-gray-300 px-3 py-2 font-medium">{line.itemName}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">
                  {formatCurrency(line.basePrice)}
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">
                    {line.costType.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="border border-gray-300 px-3 py-2 text-xs text-gray-600">
                  {line.calculationExplanation}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                  {formatCurrency(line.calculatedTotal)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right">
                  {formatCurrency(line.perPerson)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

