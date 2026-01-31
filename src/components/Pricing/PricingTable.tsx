import React, { useState } from 'react';
import { PricingLineItem } from '../../utils/catalogPricingEngine';
import { formatCurrency } from '../../utils/currencyFormatter';
import { MapPin, Bed, Car, Activity, Plane, FileText, Tag, ChevronDown, ChevronUp } from 'lucide-react';

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
  // Group lines by park
  const groupedByPark = lines.reduce((acc, line) => {
    if (!acc[line.park]) {
      acc[line.park] = [];
    }
    acc[line.park].push(line);
    return acc;
  }, {} as Record<string, PricingLineItem[]>);

  const parkNames = Object.keys(groupedByPark);
  
  // Track which parks are collapsed (default: all expanded)
  const [collapsedParks, setCollapsedParks] = useState<Set<string>>(new Set());
  
  const togglePark = (parkName: string) => {
    setCollapsedParks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parkName)) {
        newSet.delete(parkName);
      } else {
        newSet.add(parkName);
      }
      return newSet;
    });
  };

  if (lines.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 shadow-sm p-8 text-center text-gray-500">
        <div className="flex flex-col items-center gap-2">
          <FileText className="w-12 h-12 text-gray-300" />
          <span>No pricing items selected</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {parkNames.map((parkName, parkIndex) => {
        const parkLines = groupedByPark[parkName];
        const parkTotal = parkLines.reduce((sum, line) => sum + line.calculatedTotal, 0);
        
        return (
          <div key={parkName} className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Park Header */}
            <button
              onClick={() => togglePark(parkName)}
              className="w-full bg-primary-600 text-white px-6 py-4 hover:bg-primary-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">{parkName}</h3>
                  {collapsedParks.has(parkName) ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronUp className="w-5 h-5" />
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-90">Park Total</div>
                  <div className="text-xl font-bold">{formatCurrency(parkTotal)}</div>
                </div>
              </div>
            </button>

            {/* Items List - Only show if not collapsed */}
            {!collapsedParks.has(parkName) && (
              <div className="divide-y divide-gray-200">
              {parkLines.map((line, index) => (
                <div 
                  key={line.id}
                  className={`px-6 py-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-primary-50 transition-colors`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Icon + Item Details */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-1 flex-shrink-0">
                        {getCategoryIcon(line.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 mb-1">{line.itemName}</div>
                        <div className="text-xs text-gray-600">{line.calculationExplanation}</div>
                      </div>
                    </div>

                    {/* Right: Pricing */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(line.calculatedTotal)}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {formatCurrency(line.perPerson)} per person
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};


