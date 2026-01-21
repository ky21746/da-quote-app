/**
 * Import script for Aviation Logistics (Helicopter & Fixed Wing Charters)
 * 
 * This script imports aviation logistics pricing data into Firestore.
 * All items are Global (applies to all parks).
 */

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PricingItem } from '../../types/ui';

// Aviation Logistics data - All Global items (parkId: null)
// NOTE: These are Aviation items, not Logistics
const aviationLogisticsData = [
  // Helicopter Charters - Bell 412
  {
    parkId: null,
    category: 'Aviation',
    itemName: 'Helicopter Charter – Bell 412 – EBB to Buhoma Community School',
    basePrice: 9416,
    costType: 'fixed_group',
    appliesTo: 'Global',
    active: true,
    notes: 'One-way helicopter charter',
  },
  {
    parkId: null,
    category: 'Logistics',
    itemName: 'Helicopter Charter – Bell 412 – Buhoma to Nile Safari Lodge',
    basePrice: 8360,
    costType: 'fixed_group',
    appliesTo: 'Global',
    active: true,
    notes: 'One-way helicopter charter',
  },
  {
    parkId: null,
    category: 'Logistics',
    itemName: 'Helicopter Charter – Bell 412 – Nile Safari Lodge to EBB',
    basePrice: 9416,
    costType: 'fixed_group',
    appliesTo: 'Global',
    active: true,
    notes: 'One-way helicopter charter',
  },
  // Fixed Wing Charters - D1900
  {
    parkId: null,
    category: 'Logistics',
    itemName: 'Fixed Wing Charter – D1900 – EBB to Kihihi',
    basePrice: 3987,
    costType: 'fixed_group',
    appliesTo: 'Global',
    active: true,
    notes: 'One-way aircraft charter',
  },
  {
    parkId: null,
    category: 'Logistics',
    itemName: 'Fixed Wing Charter – D1900 – Kihihi to Bubungu',
    basePrice: 4365,
    costType: 'fixed_group',
    appliesTo: 'Global',
    active: true,
    notes: 'One-way aircraft charter',
  },
  {
    parkId: null,
    category: 'Logistics',
    itemName: 'Fixed Wing Charter – D1900 – Bubungu to EBB',
    basePrice: 3825,
    costType: 'fixed_group',
    appliesTo: 'Global',
    active: true,
    notes: 'One-way aircraft charter',
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface AviationLogisticsData {
  parkId: string | null;
  category: string;
  itemName: string;
  basePrice: number;
  costType: string;
  appliesTo: string;
  active: boolean;
  notes: string;
}

/**
 * Import aviation logistics to Firestore
 * Checks for duplicates before adding
 */
export async function importAviationLogistics(): Promise<{
  success: number;
  skipped: number;
  errors: Array<{ itemName: string; error: string }>;
}> {
  const results = {
    success: 0,
    skipped: 0,
    errors: [] as Array<{ itemName: string; error: string }>,
  };

  const pricingCatalogRef = collection(db, 'pricingCatalog');

  for (const item of aviationLogisticsData) {
    try {
      // Check if item already exists (by category and itemName, since parkId is null for Global items)
      const existingQuery = query(
        pricingCatalogRef,
        where('category', '==', item.category),
        where('itemName', '==', item.itemName),
        where('appliesTo', '==', 'Global')
      );

      const existingDocs = await getDocs(existingQuery);

      if (!existingDocs.empty) {
        console.log(`⏭️  Skipping existing item: ${item.itemName}`);
        results.skipped++;
        continue;
      }

      // Validate required fields
      if (!item.category || !item.itemName || item.basePrice === undefined) {
        throw new Error('Missing required fields');
      }

      // Validate costType
      const validCostTypes = [
        'fixed_group',
        'fixed_per_day',
        'per_person',
        'per_person_per_day',
        'per_night',
        'per_night_per_person',
        'per_guide',
      ];
      if (!validCostTypes.includes(item.costType)) {
        throw new Error(`Invalid costType: ${item.costType}`);
      }

      // Add document to Firestore
      // Firestore doesn't accept undefined - use null or omit the field
      const docData: any = {
        parkId: item.parkId ?? null,
        category: item.category as PricingItem['category'],
        itemName: item.itemName,
        basePrice: item.basePrice,
        costType: item.costType as PricingItem['costType'],
        appliesTo: item.appliesTo as 'Global' | 'Park',
        active: item.active,
      };
      
      // Only include notes if it has a value (not empty string)
      if (item.notes && item.notes.trim() !== '') {
        docData.notes = item.notes;
      } else {
        docData.notes = null;
      }

      await addDoc(pricingCatalogRef, docData);
      console.log(`✅ Added: ${item.itemName}`);
      results.success++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Error adding ${item.itemName}:`, errorMessage);
      results.errors.push({
        itemName: item.itemName,
        error: errorMessage,
      });
    }
  }

  return results;
}

/**
 * React component wrapper for running the import
 */
export async function runImport(): Promise<void> {
  console.log('🚀 Starting aviation logistics import...');
  const results = await importAviationLogistics();
  
  console.log('\n📊 Import Summary:');
  console.log(`✅ Successfully added: ${results.success}`);
  console.log(`⏭️  Skipped (already exists): ${results.skipped}`);
  console.log(`❌ Errors: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach((err) => {
      console.log(`  - ${err.itemName}: ${err.error}`);
    });
  }
}

