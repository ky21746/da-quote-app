/**
 * Import script for Park Entry Fees
 * 
 * This script imports park entry fee pricing data into Firestore.
 * 
 * Usage:
 * 1. Make sure Firebase is configured in .env.local
 * 2. Run this script via a temporary React component or Node.js script
 * 
 * Note: This is designed to run in the browser context (via React component)
 * or can be adapted to run as a Node.js script with Firebase Admin SDK.
 */

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PricingItem } from '../../types/ui';

// Park entry fees data
const parkEntryFeesData = [
  {
    parkId: 'MURCHISON',
    category: 'Park Fees',
    itemName: 'Murchison Park Entry Fee (FNR)',
    basePrice: 45,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Foreign Non-Resident – Israeli customers',
  },
  {
    parkId: 'QUEEN_ELIZABETH',
    category: 'Park Fees',
    itemName: 'Queen Elizabeth Park Entry Fee (FNR)',
    basePrice: 40,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Foreign Non-Resident – Israeli customers',
  },
  {
    parkId: 'BWINDI',
    category: 'Park Fees',
    itemName: 'Bwindi Park Entry Fee (FNR)',
    basePrice: 40,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Foreign Non-Resident – Israeli customers',
  },
  {
    parkId: 'MGAHINGA',
    category: 'Park Fees',
    itemName: 'Mgahinga Park Entry Fee (FNR)',
    basePrice: 40,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Foreign Non-Resident – Israeli customers',
  },
  {
    parkId: 'KIDEPO',
    category: 'Park Fees',
    itemName: 'Kidepo Park Entry Fee (FNR)',
    basePrice: 40,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Foreign Non-Resident – Israeli customers',
  },
  {
    parkId: 'KIBALE',
    category: 'Park Fees',
    itemName: 'Kibale Park Entry Fee (FNR)',
    basePrice: 40,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Foreign Non-Resident – Israeli customers',
  },
  {
    parkId: 'LAKE_MBURO',
    category: 'Park Fees',
    itemName: 'Lake Mburo Park Entry Fee (FNR)',
    basePrice: 40,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Foreign Non-Resident – Israeli customers',
  },
  {
    parkId: 'MT_ELGON',
    category: 'Park Fees',
    itemName: 'Mt Elgon Park Entry Fee (FNR)',
    basePrice: 35,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Foreign Non-Resident – Israeli customers',
  },
  {
    parkId: 'RWENZORI',
    category: 'Park Fees',
    itemName: 'Rwenzori Park Entry Fee (FNR)',
    basePrice: 35,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Foreign Non-Resident – Israeli customers',
  },
  {
    parkId: 'SEMULIKI',
    category: 'Park Fees',
    itemName: 'Semuliki Park Entry Fee (FNR)',
    basePrice: 35,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Foreign Non-Resident – Israeli customers',
  },
  {
    parkId: 'ZIWA',
    category: 'Park Fees',
    itemName: 'Ziwa Rhino Sanctuary Entry Fee (FNR)',
    basePrice: 20,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Foreign Non-Resident – Israeli customers',
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ParkEntryFeeData {
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
 * Import park entry fees to Firestore
 * Checks for duplicates before adding
 */
export async function importParkEntryFees(): Promise<{
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

  for (const item of parkEntryFeesData) {
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
 * Can be temporarily added to the app for one-time import
 */
export async function runImport(): Promise<void> {
  console.log('🚀 Starting park entry fees import...');
  const results = await importParkEntryFees();
  
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

