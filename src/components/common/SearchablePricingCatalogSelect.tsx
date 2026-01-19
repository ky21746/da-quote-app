import React, { useMemo, useState, useRef, useEffect } from 'react';
import { PricingItem, PricingCategory } from '../../types/ui';
import { getCatalogItemsForPark, getPricingItemById } from '../../utils/pricingCatalogHelpers';
import { assertValidParkId } from '../../utils/parks';
import { formatCurrency } from '../../utils/currencyFormatter';
import { getCategoryIcon } from '../../utils/iconHelpers';

interface SearchablePricingCatalogSelectProps {
  label: string;
  value: string | undefined;
  onChange: (pricingItemId: string | undefined) => void;
  category: PricingCategory;
  parkId?: string;
  items: PricingItem[];
  isLoading?: boolean;
  disabled?: boolean;
}

export const SearchablePricingCatalogSelect: React.FC<SearchablePricingCatalogSelectProps> = ({
  label,
  value,
  onChange,
  category,
  parkId,
  items,
  isLoading = false,
  disabled: propDisabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  if (parkId !== undefined && parkId !== null && parkId === '') {
    throw new Error("ParkId lost in Trip Builder flow");
  }

  if (parkId) {
    assertValidParkId(parkId);
  }

  const filteredItems = useMemo(() => getCatalogItemsForPark(items, parkId, category), [items, parkId, category]);
  const selectedItem = value ? getPricingItemById(items, value) : null;

  const searchFilteredItems = useMemo(() => {
    if (!searchTerm) return filteredItems;
    
    const term = searchTerm.toLowerCase();
    return filteredItems.filter(item => 
      item.itemName.toLowerCase().includes(term) ||
      item.notes?.toLowerCase().includes(term)
    );
  }, [filteredItems, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (itemId: string | undefined) => {
    onChange(itemId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const isDisabled = propDisabled || isLoading;

  const displayText = useMemo(() => {
    if (isLoading) return 'Loading...';
    if (!selectedItem) return 'Not selected';
    return `${selectedItem.itemName} - ${formatCurrency(selectedItem.basePrice)} (${selectedItem.costType.replace(/_/g, ' ')})`;
  }, [selectedItem, isLoading]);

  return (
    <div className="mb-4" ref={containerRef}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-medium text-brand-dark mb-1">
          {getCategoryIcon(category)}
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !isDisabled && setIsOpen(!isOpen)}
          disabled={isDisabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between ${
            isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'
          }`}
        >
          <span className={selectedItem ? 'text-gray-900' : 'text-gray-400'}>
            {displayText}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && !isDisabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 flex flex-col">
            <div className="p-2 border-b border-gray-200 bg-gray-50">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            
            <div className="overflow-y-auto max-h-80">
              <button
                type="button"
                onClick={() => handleSelect(undefined)}
                className={`w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 ${
                  !value ? 'bg-blue-100 font-medium' : ''
                }`}
              >
                <span className="text-gray-500 italic">Not selected</span>
              </button>

              {searchFilteredItems.length === 0 ? (
                <div className="px-3 py-4 text-gray-500 text-sm text-center">
                  No results found for "{searchTerm}"
                </div>
              ) : (
                searchFilteredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 ${
                      item.id === value ? 'bg-blue-100 font-medium' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm flex-1">{item.itemName}</span>
                      <span className="text-sm font-semibold text-brand-olive whitespace-nowrap">
                        {formatCurrency(item.basePrice)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.costType.replace(/_/g, ' ')}
                      {item.notes && (
                        <span className="ml-2 text-gray-400">• {item.notes.substring(0, 60)}{item.notes.length > 60 ? '...' : ''}</span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {searchFilteredItems.length > 0 && (
              <div className="p-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
                Showing {searchFilteredItems.length} of {filteredItems.length} items
              </div>
            )}
          </div>
        )}
      </div>

      {!isLoading && filteredItems.length === 0 && parkId && (
        <p className="mt-1 text-xs text-gray-500">
          No active {category.toLowerCase()} items available for this park
        </p>
      )}
    </div>
  );
};
