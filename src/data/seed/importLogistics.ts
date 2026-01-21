/**
 * Import script for Logistics
 * 
 * This script imports logistics pricing data into Firestore.
 * All items are Global (applies to all parks).
 */

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PricingItem } from '../../types/ui';

// Logistics data - All Global items (parkId: null)
const logisticsData = [
  // Vehicle Entry
  {
    parkId: null,
    category: 'Logistics',
    itemName: 'Vehicle Entry – Saloon Car (Foreign Registered)',
    basePrice: 40,
    costType: 'fixed_group',
    appliesTo: 'Global',
    active: true,
    notes: 'FNR rate – per vehicle per 24h',
  },
  {
    parkId: null,
    category: 'Logistics',
    itemName: 'Vehicle Entry – 4x4 / Tour Vehicle (Foreign Registered)',
    basePrice: 150,
    costType: 'fixed_group',
    appliesTo: 'Global',
    active: true,
    notes: 'FNR rate – per vehicle per 24h',
  },
  {
    parkId: null,
    category: 'Logistics',
    itemName: 'Vehicle Entry – Overlander / Bus',
    basePrice: 200,
    costType: 'fixed_group',
    appliesTo: 'Global',
    active: true,
    notes: 'FNR rate – per vehicle per 24h',
  },
  // Boat Entry
  {
    parkId: null,
    category: 'Logistics',
    itemName: 'Boat Entry – Up to 15 Seats',
    basePrice: 100,
    costType: 'fixed_group',
    appliesTo: 'Global',
    active: true,
    notes: 'FNR rate – per boat per 24h',
  },
  {
    parkId: null,
    category: 'Logistics',
    itemName: 'Boat Entry – Over 15 Seats',
    basePrice: 200,
    costType: 'fixed_group',
    appliesTo: 'Global',
    active: true,
    notes: 'FNR rate – per boat per 24h',
  },
  // Aircraft Landing Fee
  {
    parkId: null,
    category: 'Logistics',
    itemName: 'Aircraft Landing Fee',
    basePrice: 100,
    costType: 'fixed_group',
    appliesTo: 'Global',
    active: true,
    notes: 'FNR rate – per landing (helicopter or fixed-wing)',
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface LogisticsData {
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
 * Import logistics to Firestore
 * Checks for duplicates before adding
 */
export async function importLogistics(): Promise<{
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

  for (const item of logisticsData) {
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
  console.log('🚀 Starting logistics import...');
  const results = await importLogistics();
  
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

