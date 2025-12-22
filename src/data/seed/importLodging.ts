/**
 * Import script for Lodging (Full Board)
 * 
 * This script imports lodging pricing data into Firestore.
 */

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PricingItem } from '../../types/ui';

// Lodging data (Full Board)
const lodgingData = [
  // MURCHISON
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Entikko Lodge – Full Board',
    basePrice: 529,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Price per person per night',
  },
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Para Safari Lodge – Full Board',
    basePrice: 319,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Price per person per night',
  },
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Full Board',
    basePrice: 1265,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Price per person per night',
  },
  // QUEEN_ELIZABETH
  {
    parkId: 'QUEEN_ELIZABETH',
    category: 'Lodging',
    itemName: 'Ishasha Wilderness Camp – Full Board',
    basePrice: 635,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Price per person per night',
  },
  {
    parkId: 'QUEEN_ELIZABETH',
    category: 'Lodging',
    itemName: 'Mweya Lodge – Full Board',
    basePrice: 467,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Price per person per night',
  },
  // BWINDI
  {
    parkId: 'BWINDI',
    category: 'Lodging',
    itemName: 'Silverback Lodge – Full Board',
    basePrice: 1670,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Price per person per night',
  },
  {
    parkId: 'BWINDI',
    category: 'Lodging',
    itemName: 'Clouds Gorilla Lodge – Full Board',
    basePrice: 1860,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Price per person per night',
  },
  {
    parkId: 'BWINDI',
    category: 'Lodging',
    itemName: 'Nkuringo Bwindi Gorilla Lodge – Full Board',
    basePrice: 1215,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Price per person per night',
  },
  {
    parkId: 'BWINDI',
    category: 'Lodging',
    itemName: 'Buhoma Lodge – Full Board',
    basePrice: 705,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Price per person per night',
  },
  {
    parkId: 'BWINDI',
    category: 'Lodging',
    itemName: 'Gorilla Forest Lodge (A&K Sanctuary) – Full Board',
    basePrice: 1500,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Price per person per night',
  },
  // BUSIKA
  {
    parkId: 'BUSIKA',
    category: 'Lodging',
    itemName: 'Extreme Adventure Park – Lodging (Full Board)',
    basePrice: 160,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'On-site accommodation',
  },
  // ENTEBBE
  {
    parkId: 'ENTEBBE',
    category: 'Lodging',
    itemName: 'Mirembe Villas – Full Board',
    basePrice: 100,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Kajjansi area',
  },
];

interface LodgingData {
  parkId: string;
  category: string;
  itemName: string;
  basePrice: number;
  costType: string;
  appliesTo: string;
  active: boolean;
  notes: string;
  sku?: string;
}

/**
 * Import lodging to Firestore
 * Checks for duplicates before adding
 */
export async function importLodging(): Promise<{
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

  for (const item of lodgingData) {
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
        'per_guide',
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
        sku: (item as any).sku || (item as any).SKU || null,
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
  console.log('🚀 Starting lodging import...');
  const results = await importLodging();

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

