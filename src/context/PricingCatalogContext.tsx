import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PricingItem } from '../types/ui';

interface PricingCatalogContextType {
  items: PricingItem[];
  addItem: (item: Omit<PricingItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<PricingItem>) => void;
  deleteItem: (id: string) => void;
  resetToSeed: () => void; // Optional: reset to initial seed
}

const PricingCatalogContext = createContext<PricingCatalogContextType | undefined>(undefined);

// Storage key
const STORAGE_KEY = 'da_pricing_catalog_v1';

// Initial mock seed data - fallback if localStorage is empty
const initialSeedItems: PricingItem[] = [
  {
    id: 'item_1',
    parkId: 'MURCHISON', // Must match PARKS[0].id
    category: 'Aviation',
    itemName: 'Helicopter Transfer',
    basePrice: 10000,
    costType: 'fixed_group',
    appliesTo: 'Park',
    active: true,
  },
  {
    id: 'item_2',
    parkId: null, // Global item
    category: 'Vehicle',
    itemName: 'Safari Vehicle (4x4)',
    basePrice: 300,
    costType: 'fixed_per_day',
    appliesTo: 'Global',
    active: true,
  },
  {
    id: 'item_3',
    parkId: null, // Global item
    category: 'Park Fees',
    itemName: 'Park Entry Fee',
    basePrice: 45,
    costType: 'per_person_per_day',
    appliesTo: 'Global',
    active: true,
  },
  {
    id: 'item_4',
    parkId: 'MURCHISON', // Must match PARKS[0].id
    category: 'Lodging',
    itemName: 'Nile Safari Lodge',
    basePrice: 250,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
  },
];

/**
 * Load items from localStorage
 */
function loadItemsFromStorage(): PricingItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialSeedItems;
    
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    
    return initialSeedItems;
  } catch (error) {
    console.error('Failed to load pricing catalog from localStorage:', error);
    return initialSeedItems;
  }
}

/**
 * Save items to localStorage
 */
function saveItemsToStorage(items: PricingItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save pricing catalog to localStorage:', error);
  }
}

export const PricingCatalogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from localStorage on mount
  const [items, setItems] = useState<PricingItem[]>(() => loadItemsFromStorage());

  // Save to localStorage whenever items change
  // CRITICAL: This ensures persistence on every state change
  useEffect(() => {
    saveItemsToStorage(items);
  }, [items]);

  const addItem = (itemData: Omit<PricingItem, 'id'>) => {
    // Generate unique ID
    const newId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create new item with all required fields
    const newItem: PricingItem = {
      id: newId,
      parkId: itemData.parkId ?? null,
      category: itemData.category,
      itemName: itemData.itemName,
      basePrice: itemData.basePrice,
      costType: itemData.costType,
      appliesTo: itemData.appliesTo,
      notes: itemData.notes,
      active: itemData.active ?? true,
    };
    
    // Add to state (will trigger localStorage save via useEffect)
    setItems((prev) => {
      const updated = [...prev, newItem];
      return updated;
    });
  };

  const updateItem = (id: string, updates: Partial<PricingItem>) => {
    setItems((prev) => {
      const updated = prev.map((item) => 
        item.id === id ? { ...item, ...updates } : item
      );
      return updated;
    });
  };

  const deleteItem = (id: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      return updated;
    });
  };

  const resetToSeed = () => {
    // Clear localStorage and reset to seed
    localStorage.removeItem(STORAGE_KEY);
    // Set items - useEffect will save to localStorage
    setItems(initialSeedItems);
  };

  return (
    <PricingCatalogContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        deleteItem,
        resetToSeed,
      }}
    >
      {children}
    </PricingCatalogContext.Provider>
  );
};

export const usePricingCatalog = (): PricingCatalogContextType => {
  const context = useContext(PricingCatalogContext);
  if (!context) {
    throw new Error('usePricingCatalog must be used within PricingCatalogProvider');
  }
  return context;
};
