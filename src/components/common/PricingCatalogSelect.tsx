import React, { useMemo } from 'react';
import { PricingItem, PricingCategory } from '../../types/ui';
import { getCatalogItemsForPark, getPricingItemById } from '../../utils/pricingCatalogHelpers';
import { assertValidParkId } from '../../utils/parks';
import { formatCurrency } from '../../utils/currencyFormatter';
import { getCategoryIcon } from '../../utils/iconHelpers';
import { Helicopter, Plane, Car } from 'lucide-react';

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

  // Helper function to detect item type from name
  const getItemType = (itemName: string): 'helicopter' | 'fixed-wing' | 'vehicle' | 'other' => {
    const name = itemName.toLowerCase();
    if (name.includes('helicopter')) return 'helicopter';
    if (name.includes('fixed wing') || name.includes('fixed-wing')) return 'fixed-wing';
    if (name.includes('vehicle') || name.includes('car') || name.includes('4x4') || name.includes('saloon') || name.includes('overlander') || name.includes('bus')) return 'vehicle';
    return 'other';
  };

  // Group items by type (only for Aviation category)
  const groupedItems = useMemo(() => {
    if (category !== 'Aviation') {
      // For non-Aviation categories, return empty groups
      return {
        groups: [] as Array<{ label: string; icon: React.ReactNode; items: typeof filteredItems }>,
        ungrouped: filteredItems,
      };
    }

    const groups: Record<string, typeof filteredItems> = {
      helicopter: [],
      'fixed-wing': [],
      vehicle: [],
      other: [],
    };

    filteredItems.forEach((item) => {
      const type = getItemType(item.itemName);
      groups[type].push(item);
    });

    return {
      groups: [
        { label: 'Helicopter', icon: <Helicopter size={14} className="inline mr-1" />, items: groups.helicopter },
        { label: 'Fixed Wing Aircraft', icon: <Plane size={14} className="inline mr-1" />, items: groups['fixed-wing'] },
        { label: 'Vehicle', icon: <Car size={14} className="inline mr-1" />, items: groups.vehicle },
        { label: 'Other', icon: null, items: groups.other },
      ], // Always show all groups, even if empty
      ungrouped: [] as typeof filteredItems,
    };
  }, [filteredItems, category]);

  // Build options - ALWAYS include current selection (for non-Aviation or fallback)
  const options = useMemo(() => {
    const optionMap = new Map<string, { value: string; label: string }>();

    // Show loading state if catalog is loading
    if (isLoading) {
      optionMap.set('', { value: '', label: 'Loading...' });
      return Array.from(optionMap.values());
    }

    // First option: Clear/Not selected
    optionMap.set('', { value: '', label: 'Not selected' });

    // Add all filtered items (for non-Aviation categories)
    if (category !== 'Aviation') {
      filteredItems.forEach((item) => {
        optionMap.set(item.id, {
          value: item.id,
          label: `${item.itemName} - ${formatCurrency(item.basePrice)} (${item.costType.replace(/_/g, ' ')})`,
        });
      });
    }

    // CRITICAL: If current selection exists but is not in filteredItems, inject it
    if (value && selectedItem && !optionMap.has(value)) {
      optionMap.set(value, {
        value: selectedItem.id,
        label: `(Selected) ${selectedItem.itemName} - ${formatCurrency(selectedItem.basePrice)} (${selectedItem.costType.replace(/_/g, ' ')})${!selectedItem.active ? ' [Inactive]' : ''}`,
      });
    }

    return Array.from(optionMap.values());
  }, [filteredItems, value, selectedItem, isLoading, category]);

  // Disable only if explicitly requested by parent
  const isDisabled = propDisabled;

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

      {/* Native select with optgroups for Aviation */}
      <select
        value={value || ''}
        onChange={handleChange}
        disabled={isDisabled || isLoading}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDisabled || isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'
          }`}
        style={{
          pointerEvents: isDisabled || isLoading ? 'none' : 'auto',
        }}
      >
        {isLoading ? (
          <option value="">Loading...</option>
        ) : category === 'Aviation' ? (
          <>
            <option value="">Not selected</option>
            {groupedItems.groups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.items.length > 0 ? (
                  group.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemName} - {formatCurrency(item.basePrice)} ({item.costType.replace(/_/g, ' ')})
                    </option>
                  ))
                ) : (
                  <option disabled value="">No items available</option>
                )}
              </optgroup>
            ))}
            {/* Show selected item if not in any group */}
            {value && selectedItem && !groupedItems.groups.some(g => g.items.some(i => i.id === value)) && (
              <option value={selectedItem.id}>
                (Selected) {selectedItem.itemName} - {formatCurrency(selectedItem.basePrice)} ({selectedItem.costType.replace(/_/g, ' ')}){!selectedItem.active ? ' [Inactive]' : ''}
              </option>
            )}
          </>
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
