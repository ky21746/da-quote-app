import React from 'react';
import { PricingLineItem } from '../../utils/catalogPricingEngine';
import { formatCurrency } from '../../utils/currencyFormatter';
import { MapPin, Bed, Car, Activity, Plane, FileText, Tag } from 'lucide-react';

interface PricingTableProps {
  lines: PricingLineItem[];
}

// Map categories to professional icons
const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('lodging')) return <Bed className="w-4 h-4 text-gray-600" />;
  if (cat.includes('vehicle') || cat.includes('logistics')) return <Car className="w-4 h-4 text-gray-600" />;
  if (cat.includes('activities') || cat.includes('activity')) return <Activity className="w-4 h-4 text-gray-600" />;
  if (cat.includes('flight') || cat.includes('aviation')) return <Plane className="w-4 h-4 text-gray-600" />;
  if (cat.includes('park') || cat.includes('permit')) return <Tag className="w-4 h-4 text-gray-600" />;
  return <FileText className="w-4 h-4 text-gray-600" />;
};

export const PricingTable: React.FC<PricingTableProps> = ({ lines }) => {

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-primary-50 border-b-2 border-primary-200">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-600" />
                Park
              </div>
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Item Name</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Base Price</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Cost Type</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Calculation</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Total</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Per Person</th>
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="w-12 h-12 text-gray-300" />
                  <span>No pricing items selected</span>
                </div>
              </td>
            </tr>
          ) : (
            lines.map((line, index) => (
              <tr 
                key={line.id} 
                className={`
                  border-b border-gray-200 
                  transition-colors duration-150
                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  hover:bg-primary-50
                `}
              >
                <td className="px-4 py-3 text-gray-700">{line.park}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(line.category)}
                    <span className="text-gray-700">{line.category}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{line.itemName}</td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatCurrency(line.basePrice)}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200">
                    {line.costType.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {line.calculationExplanation}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {formatCurrency(line.calculatedTotal)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
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


