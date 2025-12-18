/**
 * Import script for Permits
 * 
 * This script imports permit pricing data into Firestore.
 */

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PricingItem } from '../../types/ui';

// Permits data
const permitsData = [
  {
    parkId: 'BWINDI',
    category: 'Permits',
    itemName: 'Gorilla Tracking Permit (FNR)',
    basePrice: 800,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Foreign Non-Resident – Israeli customers',
  },
  {
    parkId: 'BWINDI',
    category: 'Permits',
    itemName: 'Gorilla Habituation Permit (FNR)',
    basePrice: 1500,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Foreign Non-Resident – Israeli customers',
  },
  {
    parkId: 'KIBALE',
    category: 'Permits',
    itemName: 'Chimpanzee Tracking Permit (FNR)',
    basePrice: 250,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Foreign Non-Resident – Israeli customers',
  },
  {
    parkId: 'KIBALE',
    category: 'Permits',
    itemName: 'Chimpanzee Habituation Permit (FNR)',
    basePrice: 300,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Foreign Non-Resident – Israeli customers',
  },
  {
    parkId: 'QUEEN_ELIZABETH',
    category: 'Permits',
    itemName: 'Chimpanzee Tracking Permit – Kyambura Gorge (FNR)',
    basePrice: 100,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Foreign Non-Resident – Israeli customers',
  },
];

interface PermitData {
  parkId: string;
  category: string;
  itemName: string;
  basePrice: number;
  costType: string;
  appliesTo: string;
  active: boolean;
  notes: string;
}

/**
 * Import permits to Firestore
 * Checks for duplicates before adding
 */
export async function importPermits(): Promise<{
  success: number;
  skipped: number;
  errors: Array<{ parkId: string; error: string }>;
}> {
  const results = {
    success: 0,
    skipped: 0,
    errors: [] as Array<{ parkId: string; error: string }>,
  };

  const pricingCatalogRef = collection(db, 'pricingCatalog');

  for (const item of permitsData) {
    try {
      // Check if item already exists (by parkId, category, and itemName)
      const existingQuery = query(
        pricingCatalogRef,
        where('parkId', '==', item.parkId),
        where('category', '==', item.category),
        where('itemName', '==', item.itemName)
      );

      const existingDocs = await getDocs(existingQuery);

      if (!existingDocs.empty) {
        console.log(`⏭️  Skipping existing item: ${item.itemName} (${item.parkId})`);
        results.skipped++;
        continue;
      }

      // Validate required fields
      if (!item.parkId || !item.category || !item.itemName || item.basePrice === undefined) {
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
      ];
      if (!validCostTypes.includes(item.costType)) {
        throw new Error(`Invalid costType: ${item.costType}`);
      }

      // Add document to Firestore
      // Firestore doesn't accept undefined - use null or omit the field
      const docData: any = {
        parkId: item.parkId,
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
      console.log(`✅ Added: ${item.itemName} (${item.parkId})`);
      results.success++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Error adding ${item.itemName} (${item.parkId}):`, errorMessage);
      results.errors.push({
        parkId: item.parkId,
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
  console.log('🚀 Starting permits import...');
  const results = await importPermits();
  
  console.log('\n📊 Import Summary:');
  console.log(`✅ Successfully added: ${results.success}`);
  console.log(`⏭️  Skipped (already exists): ${results.skipped}`);
  console.log(`❌ Errors: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach((err) => {
      console.log(`  - ${err.parkId}: ${err.error}`);
    });
  }
}

