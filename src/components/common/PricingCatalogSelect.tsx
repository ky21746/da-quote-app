import React, { useMemo } from 'react';
import { PricingItem, PricingCategory } from '../../types/ui';
import { getCatalogItemsForPark, getPricingItemById } from '../../utils/pricingCatalogHelpers';
import { assertValidParkId } from '../../utils/parks';
import { formatCurrency } from '../../utils/currencyFormatter';
import { getCategoryIcon } from '../../utils/iconHelpers';

interface PricingCatalogSelectProps {
  label: string;
  value: string | undefined; // pricingItemId
  onChange: (pricingItemId: string | undefined) => void;
  category: PricingCategory;
  parkId?: string; // Park ID string (must match park.id from Trip Builder)
  items: PricingItem[];
  isLoading?: boolean;
  disabled?: boolean;
}

export const PricingCatalogSelect: React.FC<PricingCatalogSelectProps> = ({
  label,
  value,
  onChange,
  category,
  parkId,
  items,
  isLoading = false,
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
  const filteredItems = useMemo(() => getCatalogItemsForPark(items, parkId, category), [items, parkId, category]);

  // Get currently selected item (even if inactive/filtered out)
  const selectedItem = value ? getPricingItemById(items, value) : null;

  // Build options - ALWAYS include current selection
  const options = useMemo(() => {
    const optionMap = new Map<string, { value: string; label: string }>();

    // Show loading state if catalog is loading
    if (isLoading) {
      optionMap.set('', { value: '', label: 'Loading...' });
      return Array.from(optionMap.values());
    }

    // First option: Clear/Not selected
    optionMap.set('', { value: '', label: 'Not selected' });

    // Add all filtered items
    filteredItems.forEach((item) => {
      optionMap.set(item.id, {
        value: item.id,
        label: `${item.itemName} - ${formatCurrency(item.basePrice)} (${item.costType.replace(/_/g, ' ')})`,
      });
    });

    // CRITICAL: If current selection exists but is not in filteredItems, inject it
    if (value && selectedItem && !optionMap.has(value)) {
      optionMap.set(value, {
        value: selectedItem.id,
        label: `(Selected) ${selectedItem.itemName} - ${formatCurrency(selectedItem.basePrice)} (${selectedItem.costType.replace(/_/g, ' ')})${!selectedItem.active ? ' [Inactive]' : ''}`,
      });
    }

    return Array.from(optionMap.values());
  }, [filteredItems, value, selectedItem, isLoading]);

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
        <label className="flex items-center gap-2 text-sm font-medium text-brand-dark mb-1">
          {getCategoryIcon(category)}
          {label}
        </label>
      )}
      
      {/* Native select - simple and reliable */}
      <select
        value={value || ''}
        onChange={handleChange}
        disabled={isDisabled || isLoading}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          isDisabled || isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'
        }`}
        style={{
          pointerEvents: isDisabled || isLoading ? 'none' : 'auto',
        }}
      >
        {isLoading ? (
          <option value="">Loading...</option>
        ) : (
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        )}
      </select>

      {/* Helper text when no options (only if not loading) */}
      {!isLoading && options.length === 0 && parkId && (
        <p className="mt-1 text-xs text-gray-500">
          No active {category.toLowerCase()} items available for this park
        </p>
      )}
    </div>
  );
};
