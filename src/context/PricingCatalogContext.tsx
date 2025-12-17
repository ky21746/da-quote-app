import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PricingItem } from '../types/ui';

interface PricingCatalogContextType {
  items: PricingItem[];
  addItem: (item: Omit<PricingItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<PricingItem>) => void;
  deleteItem: (id: string) => void;
}

const PricingCatalogContext = createContext<PricingCatalogContextType | undefined>(undefined);

// Initial mock data - in production this would come from Firebase/backend
const initialItems: PricingItem[] = [
  {
    id: 'item_1',
    parkId: 'park_1',
    category: 'Aviation',
    itemName: 'Helicopter Transfer',
    basePrice: 10000,
    costType: 'fixed_group',
    appliesTo: 'Park-specific',
    active: true,
  },
  {
    id: 'item_2',
    category: 'Vehicle',
    itemName: 'Safari Vehicle (4x4)',
    basePrice: 300,
    costType: 'fixed_per_day',
    appliesTo: 'Global',
    active: true,
  },
  {
    id: 'item_3',
    category: 'Park Fees',
    itemName: 'Park Entry Fee',
    basePrice: 45,
    costType: 'per_person_per_day',
    appliesTo: 'Global',
    active: true,
  },
];

export const PricingCatalogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<PricingItem[]>(initialItems);

  const addItem = (itemData: Omit<PricingItem, 'id'>) => {
    const newItem: PricingItem = {
      ...itemData,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = (id: string, updates: Partial<PricingItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <PricingCatalogContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        deleteItem,
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

