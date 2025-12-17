import React, { useMemo } from 'react';
import { PricingItem, PricingCategory } from '../../types/ui';
import { getCatalogItemsForPark, getPricingItemById } from '../../utils/pricingCatalogHelpers';
import { assertValidParkId } from '../../utils/parks';

interface PricingCatalogSelectProps {
  label: string;
  value: string | undefined; // pricingItemId
  onChange: (pricingItemId: string | undefined) => void;
  category: PricingCategory;
  parkId?: string; // Park ID string (must match park.id from Trip Builder)
  items: PricingItem[];
  disabled?: boolean;
}

export const PricingCatalogSelect: React.FC<PricingCatalogSelectProps> = ({
  label,
  value,
  onChange,
  category,
  parkId,
  items,
  disabled: propDisabled = false,
}) => {
  // HARD ASSERT: ParkId must not be lost when filtering
  if (parkId !== undefined && parkId !== null && parkId === '') {
    throw new Error("ParkId lost in Trip Builder flow");
  }
  
  // Type guard: Validate parkId before filtering
  if (parkId) {
    assertValidParkId(parkId);
  }
  
  // Get filtered items using CANONICAL function
  const filteredItems = useMemo(() => {
    const result = getCatalogItemsForPark(items, parkId, category);
    // DEBUG: Log filtering details
    console.log(`[PricingCatalogSelect] ${label}:`, {
      parkId,
      category,
      totalItems: items.length,
      filteredCount: result.length,
      filteredItems: result.map(i => ({ id: i.id, name: i.itemName, parkId: i.parkId, appliesTo: i.appliesTo, active: i.active })),
      allLodgingItems: items.filter(i => i.category === 'Lodging').map(i => ({ id: i.id, name: i.itemName, parkId: i.parkId, appliesTo: i.appliesTo, active: i.active }))
    });
    return result;
  }, [items, parkId, category, label]);

  // Get currently selected item (even if inactive/filtered out)
  const selectedItem = value ? getPricingItemById(items, value) : null;

  // Build options - ALWAYS include current selection
  const options = useMemo(() => {
    const optionMap = new Map<string, { value: string; label: string }>();

    // First option: Clear/Not selected
    optionMap.set('', { value: '', label: 'Not selected' });

    // Add all filtered items
    filteredItems.forEach((item) => {
      optionMap.set(item.id, {
        value: item.id,
        label: `${item.itemName} - USD ${item.basePrice.toFixed(2)} (${item.costType.replace(/_/g, ' ')})`,
      });
    });

    // CRITICAL: If current selection exists but is not in filteredItems, inject it
    if (value && selectedItem && !optionMap.has(value)) {
      optionMap.set(value, {
        value: selectedItem.id,
        label: `(Selected) ${selectedItem.itemName} - USD ${selectedItem.basePrice.toFixed(2)} (${selectedItem.costType.replace(/_/g, ' ')})${!selectedItem.active ? ' [Inactive]' : ''}`,
      });
    }

    return Array.from(optionMap.values());
  }, [filteredItems, value, selectedItem]);

  // Disable only if no options OR prop disabled
  const isDisabled = propDisabled || options.length === 0;

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    // Empty string means "Not selected" -> pass undefined
    onChange(newValue === '' ? undefined : newValue);
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      
      {/* Native select - simple and reliable */}
      <select
        value={value || ''}
        onChange={handleChange}
        disabled={isDisabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'
        }`}
        style={{
          pointerEvents: isDisabled ? 'none' : 'auto',
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Helper text when no options */}
      {options.length === 0 && parkId && (
        <p className="mt-1 text-xs text-gray-500">
          No active {category.toLowerCase()} items available for this park
        </p>
      )}
    </div>
  );
};
