import React from 'react';
import { PricingItem, PricingCategory } from '../../types/ui';
import { getCatalogItemsForPark } from '../../utils/pricingCatalogHelpers';

interface PricingCatalogMultiSelectProps {
  label: string;
  selectedIds: string[]; // pricingItemIds
  onChange: (pricingItemIds: string[]) => void;
  category: PricingCategory;
  parkId?: string; // Park ID string (must match park.id from Trip Builder)
  items: PricingItem[];
}

export const PricingCatalogMultiSelect: React.FC<PricingCatalogMultiSelectProps> = ({
  label,
  selectedIds,
  onChange,
  category,
  parkId,
  items,
}) => {
  // Use CANONICAL function - Single Source of Truth
  const filteredItems = getCatalogItemsForPark(items, parkId, category);

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
        {filteredItems.length === 0 ? (
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
                USD {item.basePrice.toFixed(2)} ({item.costType.replace(/_/g, ' ')})
              </div>
            </label>
          ))
        )}
      </div>
    </div>
  );
};

