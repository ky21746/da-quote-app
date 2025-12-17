# PROJECT SNAPSHOT

Generated: $(date)

## 1. File Tree (src/ directory)

```
src/
├── App.tsx
├── app/
│   ├── auth/
│   │   ├── AuthService.ts
│   │   └── index.ts
│   ├── config/
│   │   └── dependencies.ts
│   ├── index.ts
│   └── security/
│       └── index.ts
├── components/
│   ├── Admin/
│   │   ├── AddPricingItemModal.tsx
│   │   ├── PricingCatalogPage.tsx
│   │   └── index.ts
│   ├── Logistics/
│   │   ├── LogisticsPage.tsx
│   │   └── index.ts
│   ├── ManualPricing/
│   │   ├── ManualPricingEditor.tsx
│   │   ├── ManualPricingPage.tsx
│   │   ├── ManualPricingTable.tsx
│   │   └── index.ts
│   ├── Parks/
│   │   ├── ParkCard.tsx
│   │   ├── ParksSection.tsx
│   │   └── index.ts
│   ├── Pricing/
│   │   ├── PricingPage.tsx
│   │   ├── PricingTable.tsx
│   │   └── index.ts
│   ├── Review/
│   │   ├── ReviewPage.tsx
│   │   └── index.ts
│   ├── TripBuilder/
│   │   ├── TripBuilderPage.tsx
│   │   └── index.ts
│   ├── TripDays/
│   │   ├── TripDaysEditorPage.tsx
│   │   └── index.ts
│   ├── TripSummary/
│   │   ├── CostParetoPanel.tsx
│   │   ├── PricingScenarioComparison.tsx
│   │   ├── TripSummaryPage.tsx
│   │   ├── ValidationWarnings.tsx
│   │   └── index.ts
│   ├── common/
│   │   ├── ActivitiesSelector.tsx
│   │   ├── Button.tsx
│   │   ├── DomesticFlightSelector.tsx
│   │   ├── Input.tsx
│   │   ├── LodgingSelector.tsx
│   │   ├── MultiSelect.tsx
│   │   ├── ParksSelector.tsx
│   │   ├── PricingCatalogMultiSelect.tsx
│   │   ├── PricingCatalogSelect.tsx
│   │   ├── ProgressStepper.tsx
│   │   ├── Select.tsx
│   │   ├── VehicleSelector.tsx
│   │   └── index.ts
│   └── layout/
│       └── AppHeader.tsx
├── constants/
│   └── parks.ts
├── context/
│   ├── PricingCatalogContext.tsx
│   └── TripContext.tsx
├── core/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Calculation.ts
│   │   │   ├── Day.ts
│   │   │   ├── Pricebook.ts
│   │   │   ├── Trip.ts
│   │   │   └── index.ts
│   │   ├── enums/
│   │   │   ├── DayType.ts
│   │   │   ├── PricebookVersion.ts
│   │   │   ├── TripStatus.ts
│   │   │   └── index.ts
│   │   ├── repositories/
│   │   │   ├── CalculationRepository.ts
│   │   │   ├── PricebookRepository.ts
│   │   │   ├── TripRepository.ts
│   │   │   └── index.ts
│   │   └── valueObjects/
│   │       ├── DateRange.ts
│   │       ├── Money.ts
│   │       └── index.ts
│   ├── mappers/
│   │   ├── CalculationMapper.ts
│   │   ├── PricebookMapper.ts
│   │   ├── TripMapper.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── ManualPricingEngine.ts
│   │   ├── ParkCardPricingEngine.ts
│   │   ├── PricingEngine.ts
│   │   └── index.ts
│   ├── usecases/
│   │   ├── CalculateManualPricing.ts
│   │   ├── CalculateTripQuote.ts
│   │   ├── SaveCalculation.ts
│   │   ├── index.ts
│   │   └── runPricingUsecase.ts
│   └── validators/
│       ├── PricingValidator.ts
│       ├── TripValidator.ts
│       ├── index.ts
│       └── types.ts
├── data/
│   ├── catalogHelpers.ts
│   ├── firebase/
│   │   ├── CalculationRepository.ts
│   │   ├── PricebookRepository.ts
│   │   ├── TripRepository.ts
│   │   └── index.ts
│   └── mockCatalog.ts
├── debug/
│   └── FirestoreProbe.tsx
├── hooks/
│   ├── useCatalog.ts
│   ├── useManualPricing.ts
│   ├── usePricing.ts
│   ├── useScenarioComparison.ts
│   └── useTripCreation.ts
├── index.tsx
├── lib/
│   ├── firebase.ts
│   └── firebaseHealthcheck.ts
├── pages/
│   ├── LogisticsPage.tsx
│   ├── ManualPricingPage.tsx
│   ├── PricingCatalogPage.tsx
│   ├── PricingPage.tsx
│   ├── ReviewPage.tsx
│   ├── TripBuilderPage.tsx
│   ├── TripDaysEditorPage.tsx
│   └── TripSummaryPage.tsx
├── routes/
│   └── AppRoutes.tsx
├── types/
│   ├── catalog.ts
│   ├── parks.ts
│   └── ui.ts
└── utils/
    ├── catalogPricingEngine.ts
    ├── manualPricingHelpers.ts
    ├── parks.ts
    └── pricingCatalogHelpers.ts
```

## 2. Firebase Config

### File: `src/lib/firebase.ts`

```typescript
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Determine environment prefix based on build tool
// Vite uses VITE_, Create React App uses REACT_APP_
const getEnvVar = (name: string): string => {
  // Check for CRA prefix first (since this is a CRA project)
  // In CRA, process.env is available at build time and injected into the bundle
  const envKey = `REACT_APP_${name}`;
  const craValue = process.env[envKey];
  if (craValue) return craValue;
  
  // Fallback to Vite prefix (for Vite projects)
  // Note: This code path won't execute in CRA, but kept for compatibility
  // @ts-ignore - import.meta.env is available in Vite but not in CRA
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const viteEnv = (globalThis as any).import?.meta?.env;
    if (viteEnv) {
      const viteValue = viteEnv[`VITE_${name}`];
      if (viteValue) return viteValue;
    }
  } catch {
    // Ignore - we're in CRA, not Vite
  }
  
  throw new Error(
    `Missing required environment variable: ${name}. ` +
    `Please set REACT_APP_${name} (for CRA) or VITE_${name} (for Vite) in your .env.local file.`
  );
};

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: getEnvVar('FIREBASE_API_KEY'),
  authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('FIREBASE_APP_ID'),
};

// Initialize Firebase app (only if not already initialized)
let firebaseApp: FirebaseApp;
if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

// Initialize Firebase services
export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);
export const storage: FirebaseStorage = getStorage(firebaseApp);

// Export the app instance as well
export { firebaseApp };
```

## 3. PricingCatalogContext

### File: `src/context/PricingCatalogContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PricingItem } from '../types/ui';

interface PricingCatalogContextType {
  items: PricingItem[];
  isLoading: boolean;
  addItem: (item: Omit<PricingItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<PricingItem>) => void;
  deleteItem: (id: string) => void;
}

const PricingCatalogContext = createContext<PricingCatalogContextType | undefined>(undefined);

export const PricingCatalogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to Firestore collection on mount - SNAPSHOT ONLY
  useEffect(() => {
    console.log('🔌 Starting Firestore subscription to pricingCatalog collection');
    console.log('🔌 Firestore db instance:', db);
    console.log('🔌 Collection path: pricingCatalog');
    
    const q = collection(db, 'pricingCatalog');
    
    console.log('🔌 Collection reference created:', q);
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('📥 Firestore snapshot received:', snapshot.docs.length, 'documents');
        
        const data: PricingItem[] = snapshot.docs
          .map((d) => {
            const docData = d.data();
            console.log('📄 Document:', d.id, docData);
            
            // STRICT VALIDATION - ensure all required fields exist
            const item: PricingItem = {
              id: d.id,
              parkId: docData.parkId ?? null,
              category: docData.category || 'Aviation',
              itemName: docData.itemName || '',
              basePrice: typeof docData.basePrice === 'number' ? docData.basePrice : 0,
              costType: docData.costType || 'fixed_group',
              appliesTo: docData.appliesTo || 'Global',
              active: docData.active !== undefined ? docData.active : true,
              notes: docData.notes ?? null,
            };
            
            // Validate required fields
            if (!item.itemName || !item.category) {
              console.warn('⚠️ Invalid item skipped:', d.id, item);
              return null;
            }
            
            return item;
          })
          .filter((item): item is PricingItem => item !== null);
        
        console.log('✅ Setting items:', data.length, 'valid items');
        console.log('📋 Items data:', data);
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
      console.log('🔌 Unsubscribing from Firestore');
      unsubscribe();
    };
  }, []);

  const addItem = async (itemData: Omit<PricingItem, 'id'>) => {
    console.log('✍️ addItem called with:', itemData);
    
    // Validation: Check for missing parkId in park-specific items
    if (itemData.appliesTo === 'Park' && !itemData.parkId) {
      throw new Error('Missing parkId for park-specific item');
    }
    
    // Write directly to Firestore
    const payload = {
      parkId: itemData.parkId ?? null,
      category: itemData.category,
      itemName: itemData.itemName,
      basePrice: itemData.basePrice,
      costType: itemData.costType,
      appliesTo: itemData.appliesTo,
      notes: itemData.notes ?? null,
      active: itemData.active ?? true,
    };
    
    console.log('📤 Writing to Firestore:', payload);
    try {
      const docRef = await addDoc(collection(db, 'pricingCatalog'), payload);
      console.log('✅ FIRESTORE WRITE OK - Document ID:', docRef.id);
      return docRef;
    } catch (error) {
      console.error('❌ FIRESTORE WRITE FAILED:', error);
      throw error;
    }
  };

  const updateItem = async (id: string, updates: Partial<PricingItem>) => {
    const docRef = doc(db, 'pricingCatalog', id);
    await updateDoc(docRef, updates as any);
    console.log('FIRESTORE WRITE OK');
  };

  const deleteItem = async (id: string) => {
    const docRef = doc(db, 'pricingCatalog', id);
    await deleteDoc(docRef);
    console.log('FIRESTORE WRITE OK');
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
```

## 4. Admin Pricing Component

### File: `src/components/Admin/PricingCatalogPage.tsx`

```typescript
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { Button, Select } from '../common';
import { PricingItem, PricingCategory } from '../../types/ui';
import { AddPricingItemModal } from './AddPricingItemModal';
import { getParks } from '../../utils/parks';
import { getParkLabel } from '../../constants/parks';

export const PricingCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, addItem, updateItem, deleteItem, isLoading } = usePricingCatalog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PricingItem | null>(null);

  // Filters - default to 'all' to show all items including newly added ones
  const [parkFilter, setParkFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Park filter - handle null/undefined for Global items
      if (parkFilter !== 'all') {
        if (parkFilter === 'global') {
          // Show only Global items
          if (item.appliesTo !== 'Global') return false;
        } else {
          // Show only items for this specific park
          if (item.parkId !== parkFilter) return false;
        }
      }
      
      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      
      // Active filter
      if (activeFilter === 'active' && !item.active) return false;
      if (activeFilter === 'inactive' && item.active) return false;
      
      return true;
    });
  }, [items, parkFilter, categoryFilter, activeFilter]);

  const handleEdit = (item: PricingItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this pricing item?')) {
      deleteItem(id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleSave = async (itemData: Omit<PricingItem, 'id'>) => {
    console.log('💾 handleSave called with:', itemData);
    try {
      if (editingItem) {
        console.log('📝 Updating item:', editingItem.id);
        await updateItem(editingItem.id, itemData);
        console.log('✅ Item updated successfully');
      } else {
        console.log('➕ Adding new item');
        await addItem(itemData);
        console.log('✅ Item added successfully');
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('❌ Error saving item:', error);
      alert(`Error saving item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to trip builder if no history (direct access)
      navigate('/trip/new');
    }
  };

  const categoryOptions: Array<{ value: string; label: string }> = [
    { value: 'all', label: 'All Categories' },
    { value: 'Aviation', label: 'Aviation' },
    { value: 'Lodging', label: 'Lodging' },
    { value: 'Vehicle', label: 'Vehicle' },
    { value: 'Activities', label: 'Activities' },
    { value: 'Park Fees', label: 'Park Fees' },
    { value: 'Extras', label: 'Extras' },
  ];

  const parkOptions = [
    { value: 'all', label: 'All Parks' },
    { value: 'global', label: 'Global Items' },
    ...getParks().map((park) => ({ value: park.id, label: park.label })),
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="secondary">
              ← Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Admin → Pricing Catalog</h1>
          </div>
          <div className="flex gap-2 items-center">
            <Button onClick={handleAddClick} variant="primary">
              + Add Pricing Item
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <Select
            label="Park"
            value={parkFilter}
            onChange={(value) => setParkFilter(value)}
            options={parkOptions}
          />
          <Select
            label="Category"
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value)}
            options={categoryOptions}
          />
          <Select
            label="Status"
            value={activeFilter}
            onChange={(value) => setActiveFilter(value)}
            options={[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </div>

        {/* Pricing Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left">Park / Global</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Category</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Item Name</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Base Price</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Cost Type</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Active</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Notes</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border border-gray-300 px-3 py-4 text-center text-gray-500">
                    No pricing items found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2">
                      {item.appliesTo === 'Global' ? (
                        <span className="text-blue-600 font-medium">Global</span>
                      ) : (
                        <span className="text-gray-600">
                          {item.parkId ? (getParks().find((p) => p.id === item.parkId)?.label || item.parkId) : 'Unknown'}
                        </span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">{item.category}</td>
                    <td className="border border-gray-300 px-3 py-2 font-medium">
                      {item.itemName}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      USD {typeof item.basePrice === 'number' && !isNaN(item.basePrice) ? item.basePrice.toFixed(2) : '0.00'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {item.costType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.active}
                        onChange={(e) =>
                          updateItem(item.id, { active: e.target.checked })
                        }
                        className="h-4 w-4"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">
                      {item.notes || '-'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        <AddPricingItemModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleSave}
          editingItem={editingItem}
        />
      </div>
    </div>
  );
};
```

### File: `src/components/Admin/AddPricingItemModal.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { PricingItem, PricingCategory, ManualCostType } from '../../types/ui';
import { Button, Input, Select } from '../common';
import { getParks } from '../../utils/parks';

interface AddPricingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<PricingItem, 'id'>) => void;
  editingItem?: PricingItem | null;
}

export const AddPricingItemModal: React.FC<AddPricingItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  // Reset form when modal opens/closes or editingItem changes
  const getInitialFormData = (): Omit<PricingItem, 'id'> => {
    if (editingItem) {
      return {
        parkId: editingItem.parkId,
        category: editingItem.category,
        itemName: editingItem.itemName,
        basePrice: editingItem.basePrice,
        costType: editingItem.costType,
        appliesTo: editingItem.appliesTo,
        notes: editingItem.notes || '',
        active: editingItem.active,
      };
    }
    return {
      parkId: null,
      category: 'Aviation',
      itemName: '',
      basePrice: 0,
      costType: 'fixed_group',
      appliesTo: 'Global',
      notes: '',
      active: true,
    };
  };

  const [formData, setFormData] = useState<Omit<PricingItem, 'id'>>(getInitialFormData);
  const [appliesTo, setAppliesTo] = useState<'Global' | 'Park'>(
    editingItem?.appliesTo || 'Global'
  );

  // Reset form when modal opens/closes or editingItem changes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setFormData({
          parkId: editingItem.parkId || null,
          category: editingItem.category,
          itemName: editingItem.itemName,
          basePrice: editingItem.basePrice,
          costType: editingItem.costType,
          appliesTo: editingItem.appliesTo,
          notes: editingItem.notes || '',
          active: editingItem.active,
        });
        setAppliesTo(editingItem.appliesTo);
      } else {
        setFormData({
          parkId: null,
          category: 'Aviation',
          itemName: '',
          basePrice: 0,
          costType: 'fixed_group',
          appliesTo: 'Global',
          notes: '',
          active: true,
        });
        setAppliesTo('Global');
      }
    }
  }, [isOpen, editingItem]);

  const categoryOptions: Array<{ value: PricingCategory; label: string }> = [
    { value: 'Aviation', label: 'Aviation' },
    { value: 'Lodging', label: 'Lodging' },
    { value: 'Vehicle', label: 'Vehicle' },
    { value: 'Activities', label: 'Activities' },
    { value: 'Park Fees', label: 'Park Fees' },
    { value: 'Extras', label: 'Extras' },
    { value: 'Logistics', label: 'Logistics' },
  ];

  const costTypeOptions: Array<{ value: ManualCostType; label: string }> = [
    { value: 'fixed_group', label: 'Fixed – Group' },
    { value: 'fixed_per_day', label: 'Fixed – Per Day' },
    { value: 'per_person', label: 'Per Person' },
    { value: 'per_person_per_day', label: 'Per Person Per Day' },
    { value: 'per_night', label: 'Per Night' },
    { value: 'per_night_per_person', label: 'Per Night Per Person' },
  ];

  const parkOptions = [
    { value: '', label: 'Select park...' },
    ...getParks().map((park) => ({ value: park.id, label: park.label })),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Strict validation
    if (!formData.itemName.trim()) {
      alert('Item name is required');
      return;
    }
    if (formData.basePrice <= 0) {
      alert('Base price must be greater than 0');
      return;
    }
    if (!formData.costType) {
      alert('Cost type is required');
      return;
    }
    if (!formData.category) {
      alert('Category is required');
      return;
    }
    if (appliesTo === 'Park' && !formData.parkId) {
      alert('Park is required for Park items');
      return;
    }

    // Prepare item data
    const itemData: Omit<PricingItem, 'id'> = {
      parkId: appliesTo === 'Park' ? formData.parkId : null,
      category: formData.category,
      itemName: formData.itemName.trim(),
      basePrice: formData.basePrice,
      costType: formData.costType,
      appliesTo,
      notes: formData.notes?.trim() || undefined,
      active: formData.active,
    };

    // Save and close
    onSave(itemData);
    // Note: onSave is async, but we close modal immediately for UX
    // The actual save happens in PricingCatalogPage.handleSave
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {editingItem ? 'Edit Pricing Item' : 'Add New Pricing Item'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Select
                label="Applies To"
                value={appliesTo}
                onChange={(value) => {
                  setAppliesTo(value as 'Global' | 'Park');
                  if (value === 'Global') {
                    setFormData({ ...formData, parkId: null });
                  }
                }}
                options={[
                  { value: 'Global', label: 'Global' },
                  { value: 'Park', label: 'Park' },
                ]}
                required
              />

              {appliesTo === 'Park' && (
                <Select
                  label="Park"
                  value={formData.parkId || ''}
                  onChange={(value) => {
                    // CRITICAL: parkId must be string matching PARKS[].id
                    setFormData({ ...formData, parkId: value || null });
                  }}
                  options={parkOptions}
                  required
                />
              )}

              <Select
                label="Category"
                value={formData.category}
                onChange={(value) =>
                  setFormData({ ...formData, category: value as PricingCategory })
                }
                options={categoryOptions}
                required
              />

              <Input
                label="Item Name"
                type="text"
                value={formData.itemName}
                onChange={(value) =>
                  setFormData({ ...formData, itemName: value as string })
                }
                placeholder="Enter item name"
                required
              />

              <Input
                label="Base Price (USD)"
                type="number"
                value={formData.basePrice}
                onChange={(value) =>
                  setFormData({ ...formData, basePrice: value as number })
                }
                min={0}
                step="0.01"
                required
              />

              <Select
                label="Cost Type"
                value={formData.costType}
                onChange={(value) =>
                  setFormData({ ...formData, costType: value as ManualCostType })
                }
                options={costTypeOptions}
                required
              />

              <Input
                label="Notes (optional)"
                type="text"
                value={formData.notes || ''}
                onChange={(value) =>
                  setFormData({ ...formData, notes: value as string })
                }
                placeholder="Internal notes..."
              />

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button type="button" onClick={onClose} variant="secondary">
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingItem ? 'Update' : 'Add'} Item
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
```

## 5. Trip Builder Component

### File: `src/components/Parks/ParkCard.tsx`

```typescript
import React, { useState } from 'react';
import { ParkCard as ParkCardType } from '../../types/ui';
import { Select, Input, PricingCatalogSelect, PricingCatalogMultiSelect } from '../common';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { getParks, assertValidParkId } from '../../utils/parks';

interface ParkCardProps {
  card: ParkCardType;
  onUpdate: (updates: Partial<ParkCardType>) => void;
  onRemove: () => void;
}

export const ParkCard: React.FC<ParkCardProps> = ({ card, onUpdate, onRemove }) => {
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(false);
  const { items: pricingItems } = usePricingCatalog();
  
  const logistics = card.logistics || {
    internalMovements: [],
  };

  const parkOptions = [
    { value: '', label: 'Select a park...' },
    ...getParks().map((park) => ({ value: park.id, label: park.label })),
  ];

  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Park Card</h3>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Remove
        </button>
      </div>

      {/* Park Selector */}
      <Select
        label="Park"
        value={card.parkId || ''}
        onChange={(value) => {
          // When park changes, reset all dependent fields including logistics
          const selectedParkId = value || undefined;
          
          // HARD ASSERT: ParkId must not be lost
          if (selectedParkId === null || selectedParkId === '') {
            throw new Error("ParkId lost in Trip Builder flow");
          }
          
          // Type guard: Validate parkId before updating
          if (selectedParkId) {
            assertValidParkId(selectedParkId);
          }
          
          onUpdate({
            parkId: selectedParkId,
            arrival: undefined,
            lodging: undefined,
            transport: undefined,
            activities: [],
            extras: [],
            logistics: {
              internalMovements: [],
            },
          });
        }}
        options={parkOptions}
      />

      {/* Categories shown only after park selected */}
      {card.parkId && (() => {
        // HARD ASSERT: ParkId must not be lost
        if (!card.parkId || card.parkId === '') {
          throw new Error("ParkId lost in Trip Builder flow");
        }
        
        // Type guard: Validate parkId exists in parks list
        assertValidParkId(card.parkId);
        
        return (
        <div className="space-y-4 mt-4">
          {/* Arrival / Aviation */}
          <PricingCatalogSelect
            label="Arrival / Aviation"
            value={card.arrival}
            onChange={(pricingItemId) => onUpdate({ arrival: pricingItemId })}
            category="Aviation"
            parkId={card.parkId}
            items={pricingItems}
          />

          {/* Lodging */}
          <PricingCatalogSelect
            label="Lodging"
            value={card.lodging}
            onChange={(pricingItemId) => onUpdate({ lodging: pricingItemId })}
            category="Lodging"
            parkId={card.parkId}
            items={pricingItems}
          />

          {/* Local Transportation */}
          <PricingCatalogSelect
            label="Local Transportation"
            value={card.transport}
            onChange={(pricingItemId) => onUpdate({ transport: pricingItemId })}
            category="Vehicle"
            parkId={card.parkId}
            items={pricingItems}
          />

          {/* Activities (Multi-select) */}
          <PricingCatalogMultiSelect
            label="Activities"
            selectedIds={card.activities}
            onChange={(pricingItemIds) => onUpdate({ activities: pricingItemIds })}
            category="Activities"
            parkId={card.parkId}
            items={pricingItems}
          />

          {/* Extras (Multi-select) */}
          <PricingCatalogMultiSelect
            label="Extras"
            selectedIds={card.extras}
            onChange={(pricingItemIds) => onUpdate({ extras: pricingItemIds })}
            category="Extras"
            parkId={card.parkId}
            items={pricingItems}
          />

          {/* Logistics Section (Collapsible) */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <button
              onClick={() => setIsLogisticsOpen(!isLogisticsOpen)}
              className="w-full flex justify-between items-center text-left mb-2"
            >
              <h4 className="font-semibold text-gray-700">Logistics</h4>
              <span className="text-gray-500">
                {isLogisticsOpen ? '−' : '+'}
              </span>
            </button>

            {isLogisticsOpen && (
              <div className="space-y-4 mt-4 pl-2">
                {/* Arrival / Movement Between Parks */}
                <PricingCatalogSelect
                  label="Arrival / Movement Between Parks"
                  value={logistics.arrival}
                  onChange={(pricingItemId) =>
                    onUpdate({
                      logistics: {
                        ...logistics,
                        arrival: pricingItemId,
                      },
                    })
                  }
                  category="Logistics"
                  parkId={card.parkId}
                  items={pricingItems}
                />

                {/* Vehicle & Driver */}
                <PricingCatalogSelect
                  label="Vehicle & Driver"
                  value={logistics.vehicle}
                  onChange={(pricingItemId) =>
                    onUpdate({
                      logistics: {
                        ...logistics,
                        vehicle: pricingItemId,
                      },
                    })
                  }
                  category="Logistics"
                  parkId={card.parkId}
                  items={pricingItems}
                />

                {/* Internal Movements (Multi-select) */}
                <PricingCatalogMultiSelect
                  label="Internal Movements"
                  selectedIds={logistics.internalMovements}
                  onChange={(pricingItemIds) =>
                    onUpdate({
                      logistics: {
                        ...logistics,
                        internalMovements: pricingItemIds,
                      },
                    })
                  }
                  category="Logistics"
                  parkId={card.parkId}
                  items={pricingItems}
                />

                {/* Notes (Optional) */}
                <Input
                  label="Notes (optional)"
                  value={logistics.notes || ''}
                  onChange={(value) =>
                    onUpdate({
                      logistics: {
                        ...logistics,
                        notes: value as string,
                      },
                    })
                  }
                  placeholder="Operator / planner notes..."
                />
              </div>
            )}
          </div>
        </div>
        );
      })()}
    </div>
  );
};
```

## 6. Hooks and Services

### File: `src/hooks/useCatalog.ts`

```typescript
import { useState, useEffect } from 'react';
import { pricebookRepository } from '../app/config/dependencies';
import { CatalogOption } from '../types/catalog';
import { PricebookItem } from '../core/domain/entities';

export const useCatalog = (category: string) => {
  const [items, setItems] = useState<CatalogOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        const pricebook = await pricebookRepository.getCurrent();
        
        // Filter items by category and map to CatalogOption format
        const filteredItems = pricebook.items
          .filter((item) => item.category === category)
          .map((item): CatalogOption => {
            const base = {
              id: item.id,
              name: item.name,
              category: item.category as any,
            };

            // Add location-specific fields if available
            if (item.location) {
              return {
                ...base,
                location: item.location,
              } as CatalogOption;
            }

            return base;
          });

        setItems(filteredItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load catalog');
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, [category]);

  return { items, loading, error };
};
```

### File: `src/utils/pricingCatalogHelpers.ts`

```typescript
import { PricingItem, PricingCategory } from '../types/ui';
import { assertValidParkId } from './parks';

/**
 * Get pricing items for a specific park and category
 * Single Source of Truth - all filtering must use this function
 */
export function getCatalogItemsForPark(
  catalog: PricingItem[],
  parkId: string | undefined,
  category: PricingCategory
): PricingItem[] {
  // Type guard: Validate parkId before filtering
  if (parkId) {
    assertValidParkId(parkId);
  }

  return catalog.filter((item) => {
    // Must be active
    if (!item.active) return false;

    // Must match category
    if (item.category !== category) return false;

    // Must be Global OR match parkId
    if (item.appliesTo === 'Global') return true;
    if (item.appliesTo === 'Park' && item.parkId === parkId) return true;

    return false;
  });
}

/**
 * Get a pricing item by ID
 */
export function getPricingItemById(
  catalog: PricingItem[],
  id: string | undefined
): PricingItem | undefined {
  if (!id) return undefined;
  return catalog.find((item) => item.id === id);
}

/**
 * Get catalog items (legacy function - use getCatalogItemsForPark instead)
 */
export function getCatalogItems(
  catalog: PricingItem[],
  parkId: string | undefined,
  category: PricingCategory
): PricingItem[] {
  return getCatalogItemsForPark(catalog, parkId, category);
}
```

### File: `src/components/common/PricingCatalogSelect.tsx`

```typescript
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
  const filteredItems = useMemo(() => getCatalogItemsForPark(items, parkId, category), [items, parkId, category]);

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
    onChange(newValue === '' ? undefined : newValue);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value || ''}
        onChange={handleChange}
        disabled={isDisabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
```

### File: `src/components/common/PricingCatalogMultiSelect.tsx`

```typescript
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
```

## 7. package.json (Dependencies Only)

### File: `package.json`

```json
{
  "dependencies": {
    "ajv": "^8.17.1",
    "firebase": "^10.7.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "react-scripts": "5.0.1",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.3.0"
  }
}
```

