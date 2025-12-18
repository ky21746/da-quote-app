import React from 'react';
import { PricingItem, PricingCategory } from '../../types/ui';
import { getCatalogItemsForPark } from '../../utils/pricingCatalogHelpers';
import { formatCurrency } from '../../utils/currencyFormatter';

interface PricingCatalogMultiSelectProps {
  label: string;
  selectedIds: string[]; // pricingItemIds
  onChange: (pricingItemIds: string[]) => void;
  category: PricingCategory;
  parkId?: string; // Park ID string (must match park.id from Trip Builder)
  items: PricingItem[];
  isLoading?: boolean;
}

export const PricingCatalogMultiSelect: React.FC<PricingCatalogMultiSelectProps> = ({
  label,
  selectedIds,
  onChange,
  category,
  parkId,
  items,
  isLoading = false,
}) => {
  // Use CANONICAL function - Single Source of Truth
  const filteredItems = React.useMemo(() => getCatalogItemsForPark(items, parkId, category), [items, parkId, category]);

  const handleToggle = (itemId: string) => {
    if (selectedIds.includes(itemId)) {
      onChange(selectedIds.filter((id) => id !== itemId));
    } else {
      onChange([...selectedIds, itemId]);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded p-2">
        {isLoading ? (
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-sm text-gray-500">No active items available for this park</div>
        ) : (
          filteredItems.map((item) => (
            <label key={item.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => handleToggle(item.id)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{item.itemName}</span>
              </div>
              <div className="text-xs text-gray-500 ml-2">
                {formatCurrency(item.basePrice)} ({item.costType.replace(/_/g, ' ')})
              </div>
            </label>
          ))
        )}
      </div>
    </div>
  );
};

