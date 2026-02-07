import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, deleteField } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PricingItem } from '../types/ui';

interface PricingCatalogContextType {
  items: PricingItem[];
  isLoading: boolean;
  addItem: (item: Omit<PricingItem, 'id'>) => Promise<any>;
  updateItem: (id: string, updates: Partial<PricingItem>) => void;
  deleteItem: (id: string) => void;
}

const PricingCatalogContext = createContext<PricingCatalogContextType | undefined>(undefined);

export const PricingCatalogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to Firestore collection on mount - SNAPSHOT ONLY
  useEffect(() => {
    const q = collection(db, 'pricingCatalog');

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: PricingItem[] = snapshot.docs
          .map((d) => {
            const docData = d.data();

            // STRICT VALIDATION - ensure all required fields exist
            const item: PricingItem = {
              id: d.id,
              parkId: docData.parkId ?? null,
              category: docData.category || 'Aviation',
              itemName: docData.itemName || '',
              basePrice: typeof docData.basePrice === 'number' ? docData.basePrice : 0,
              costType: docData.costType || 'fixed_group',
              capacity: typeof docData.capacity === 'number' ? docData.capacity : undefined,
              quantity: typeof docData.quantity === 'number' ? docData.quantity : 1,
              appliesTo: docData.appliesTo || 'Global',
              active: docData.active !== undefined ? docData.active : true,
              notes: docData.notes ?? null,
              sku: docData.sku || undefined,
              metadata: docData.metadata || undefined,
            };

            // Validate required fields
            if (!item.itemName || !item.category) {
              console.warn('⚠️ Invalid item skipped:', d.id, item);
              return null;
            }

            return item;
          })
          .filter((item): item is PricingItem => item !== null);

        setItems(data);
        setIsLoading(false);
      },
      (error) => {
        console.error('❌ Firestore snapshot error:', error);
        setIsLoading(false);
        setItems([]);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const addItem = async (itemData: Omit<PricingItem, 'id'>) => {

    // Validation: Check for missing parkId in park-specific items
    if (itemData.appliesTo === 'Park' && !itemData.parkId) {
      throw new Error('Missing parkId for park-specific item');
    }

    // Write directly to Firestore
    const payload: Record<string, any> = {
      parkId: itemData.parkId ?? null,
      category: itemData.category,
      itemName: itemData.itemName,
      basePrice: itemData.basePrice,
      costType: itemData.costType,
      quantity: typeof itemData.quantity === 'number' ? itemData.quantity : 1,
      appliesTo: itemData.appliesTo,
      notes: itemData.notes ?? null,
      active: itemData.active ?? true,
      sku: itemData.sku || null,
    };

    if (typeof itemData.capacity === 'number' && Number.isFinite(itemData.capacity)) {
      payload.capacity = itemData.capacity;
    }

    try {
      const docRef = await addDoc(collection(db, 'pricingCatalog'), payload);
      return docRef;
    } catch (error) {
      console.error('❌ FIRESTORE WRITE FAILED:', error);
      throw error;
    }
  };

  const updateItem = async (id: string, updates: Partial<PricingItem>) => {
    const docRef = doc(db, 'pricingCatalog', id);

    const payload: Record<string, any> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        payload[key] = deleteField();
        continue;
      }
      payload[key] = value;
    }

    if ('capacity' in updates) {
      const cap = (updates as any).capacity;
      if (typeof cap === 'number' && Number.isFinite(cap)) {
        payload.capacity = cap;
      } else {
        payload.capacity = deleteField();
      }
    }

    if ('sku' in updates) {
      const sku = (updates as any).sku;
      if (typeof sku === 'string' && sku.trim()) {
        payload.sku = sku.trim();
      } else {
        payload.sku = deleteField();
      }
    }

    if ('notes' in updates) {
      const notes = (updates as any).notes;
      if (typeof notes === 'string' && notes.trim()) {
        payload.notes = notes.trim();
      } else {
        payload.notes = deleteField();
      }
    }

    await updateDoc(docRef, payload as any);
  };

  const deleteItem = async (id: string) => {
    const docRef = doc(db, 'pricingCatalog', id);
    await deleteDoc(docRef);
  };

  return (
    <PricingCatalogContext.Provider
      value={{
        items,
        isLoading,
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
