import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';
import { PricingItem } from '../types/ui';

interface PricingCatalogContextType {
  items: PricingItem[];
  addItem: (item: Omit<PricingItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<PricingItem>) => void;
  deleteItem: (id: string) => void;
  resetToSeed: () => void; // Optional: reset to initial seed
}

const PricingCatalogContext = createContext<PricingCatalogContextType | undefined>(undefined);

// Storage key for localStorage fallback
const STORAGE_KEY = 'da_pricing_catalog_v1';

// Firestore document reference
const PRICING_CATALOG_DOC = doc(db, COLLECTIONS.PRICING_CATALOG, 'main');

// Initial seed data - ONLY used if Firestore is empty AND localStorage is empty
const initialSeedItems: PricingItem[] = [
  {
    id: 'item_1',
    parkId: 'MURCHISON',
    category: 'Aviation',
    itemName: 'Helicopter Transfer',
    basePrice: 10000,
    costType: 'fixed_group',
    appliesTo: 'Park',
    active: true,
  },
  {
    id: 'item_2',
    parkId: null,
    category: 'Vehicle',
    itemName: 'Safari Vehicle (4x4)',
    basePrice: 300,
    costType: 'fixed_per_day',
    appliesTo: 'Global',
    active: true,
  },
  {
    id: 'item_3',
    parkId: null,
    category: 'Park Fees',
    itemName: 'Park Entry Fee',
    basePrice: 45,
    costType: 'per_person_per_day',
    appliesTo: 'Global',
    active: true,
  },
  {
    id: 'item_4',
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge',
    basePrice: 250,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
  },
  {
    id: 'item_5',
    parkId: null,
    category: 'Activities',
    itemName: 'Game Drive',
    basePrice: 150,
    costType: 'per_person',
    appliesTo: 'Global',
    active: true,
  },
  {
    id: 'item_6',
    parkId: 'MURCHISON',
    category: 'Activities',
    itemName: 'Boat Cruise',
    basePrice: 80,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
  },
  {
    id: 'item_7',
    parkId: null,
    category: 'Extras',
    itemName: 'Travel Insurance',
    basePrice: 50,
    costType: 'per_person',
    appliesTo: 'Global',
    active: true,
  },
  {
    id: 'item_8',
    parkId: 'MURCHISON',
    category: 'Extras',
    itemName: 'Photography Guide',
    basePrice: 200,
    costType: 'fixed_group',
    appliesTo: 'Park',
    active: true,
  },
  {
    id: 'item_9',
    parkId: null,
    category: 'Logistics',
    itemName: 'Airport Transfer',
    basePrice: 100,
    costType: 'fixed_group',
    appliesTo: 'Global',
    active: true,
  },
  {
    id: 'item_10',
    parkId: 'MURCHISON',
    category: 'Logistics',
    itemName: 'Park Entry Transfer',
    basePrice: 150,
    costType: 'fixed_group',
    appliesTo: 'Park',
    active: true,
  },
];

/**
 * Load items from Firestore (primary source)
 */
async function loadItemsFromFirestore(): Promise<PricingItem[]> {
  try {
    const docSnap = await getDoc(PRICING_CATALOG_DOC);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const items = data.items as PricingItem[];
      
      // Validation: If Firestore returns empty items array → throw explicit error
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Firestore returned empty items array');
      }
      
      // Validation: Check for missing parkId in park-specific items
      items.forEach((item) => {
        if (item.appliesTo === 'Park' && !item.parkId) {
          throw new Error(`Missing parkId for park-specific item: ${item.itemName} (id: ${item.id})`);
        }
      });
      
      // Save to localStorage as fallback
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      
      return items;
    }
    
    // Document does not exist - create it with seed data
    await setDoc(PRICING_CATALOG_DOC, {
      items: initialSeedItems,
      updatedAt: serverTimestamp(),
    });
    
      return initialSeedItems;
    } catch (error) {
      // Fallback to localStorage
      return loadItemsFromStorage();
    }
}

/**
 * Load items from localStorage (fallback only)
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
  } catch {
    return initialSeedItems;
  }
}

/**
 * Save items to Firestore (primary) and localStorage (fallback)
 */
async function saveItemsToFirestore(items: PricingItem[]): Promise<void> {
  try {
    await setDoc(PRICING_CATALOG_DOC, {
      items,
      updatedAt: serverTimestamp(),
    });
    
    // Also save to localStorage as fallback
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    // Fallback to localStorage only
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Silent fail
    }
  }
}

export const PricingCatalogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from Firestore on mount (primary source)
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        const loaded = await loadItemsFromFirestore();
        if (isMounted) {
          setItems(loaded);
          setIsLoading(false);
        }
      } catch (error) {
        // Fallback to localStorage
        const fallback = loadItemsFromStorage();
        if (isMounted) {
          setItems(fallback);
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Save to Firestore whenever items change (but not on initial load)
  useEffect(() => {
    if (!isLoading && items.length > 0) {
      saveItemsToFirestore(items);
    }
  }, [items, isLoading]);

  const addItem = (itemData: Omit<PricingItem, 'id'>) => {
    // Validation: Check for missing parkId in park-specific items
    if (itemData.appliesTo === 'Park' && !itemData.parkId) {
      throw new Error('Missing parkId for park-specific item');
    }
    
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
    
    // Add to state (will trigger Firestore save via useEffect)
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
    // Set items - useEffect will save to Firestore
    setItems(initialSeedItems);
  };

  // Show loading state while fetching from Firestore
  if (isLoading) {
    return <div className="p-4 text-center text-gray-600">Loading pricing catalog...</div>;
  }

  // Validation: If items array is empty after load → throw explicit error
  if (items.length === 0) {
    throw new Error('Pricing catalog items array is empty after load');
  }

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
