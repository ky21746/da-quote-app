/**
 * Import script for Busika Park
 * 
 * This script imports Busika pricing data into Firestore.
 */

import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PricingItem } from '../../types/ui';

// Busika data
const busikaData = [
  // Park Fees
  {
    parkId: 'BUSIKA',
    category: 'Park Fees',
    itemName: 'Busika Entrance Fee – Adult',
    basePrice: 2,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Weekend & Public Holidays',
  },
  {
    parkId: 'BUSIKA',
    category: 'Park Fees',
    itemName: 'Busika Entrance Fee – Child',
    basePrice: 1,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Weekend & Public Holidays',
  },
  // Activities
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'High Ropes & Zipline – Adult',
    basePrice: 20,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'High Ropes & Zipline – Child',
    basePrice: 17,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Paint Ball – Adult',
    basePrice: 12,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Paint Ball – Child',
    basePrice: 9,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Quad Biking – 20 min',
    basePrice: 23,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Quad Biking – 1 hour',
    basePrice: 54,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Quad Biking – 2 hours',
    basePrice: 73,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Go Karts – 10 min',
    basePrice: 17,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Go Karts – 30 min',
    basePrice: 43,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Independent Zipline – Adult',
    basePrice: 10,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Independent Zipline – Child',
    basePrice: 9,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Target Shooting',
    basePrice: 6,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Swimming – Adult',
    basePrice: 6,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Swimming – Child',
    basePrice: 5,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Archery (5 rounds)',
    basePrice: 9,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Bungee Trampoline – Adult',
    basePrice: 6,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Bungee Trampoline – Child',
    basePrice: 5,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Low Ropes',
    basePrice: 6,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Extreme Combat – 45 min',
    basePrice: 43,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Extreme Combat – 30 min',
    basePrice: 29,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Extreme Combat – 20 min',
    basePrice: 23,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Virtual Car Racing – 20 min',
    basePrice: 6,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Cornhole – 6 rounds',
    basePrice: 3,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Ludo – 1 hour',
    basePrice: 3,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Playing Cards – 1 hour',
    basePrice: 2,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Darts – 1 hour',
    basePrice: 3,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Omweso – 1 hour',
    basePrice: 3,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Electric Bikes – 20 min',
    basePrice: 23,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Electric Bikes – 1 hour',
    basePrice: 54,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  {
    parkId: 'BUSIKA',
    category: 'Activities',
    itemName: 'Electric Bikes – 2 hours',
    basePrice: 73,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: '',
  },
  // Logistics
  {
    parkId: 'BUSIKA',
    category: 'Logistics',
    itemName: 'Transportation from Kampala',
    basePrice: 225,
    costType: 'fixed_group',
    appliesTo: 'Park',
    active: true,
    notes: 'Optional add-on',
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface BusikaData {
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
 * Import Busika items to Firestore
 * Checks for duplicates before adding
 */
export async function importBusika(): Promise<{
  success: number;
  skipped: number;
  updated: number;
  errors: Array<{ itemName: string; error: string }>;
}> {
  const results = {
    success: 0,
    skipped: 0,
    updated: 0,
    errors: [] as Array<{ itemName: string; error: string }>,
  };

  const pricingCatalogRef = collection(db, 'pricingCatalog');

  for (const item of busikaData) {
    try {
      // Check if item already exists (by parkId, category, and itemName)
      const existingQuery = query(
        pricingCatalogRef,
        where('parkId', '==', item.parkId),
        where('category', '==', item.category),
        where('itemName', '==', item.itemName)
      );

      const existingDocs = await getDocs(existingQuery);

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
        sku: (item as any).sku || null,
      };

      // Only include notes if it has a value (not empty string)
      if (item.notes && item.notes.trim() !== '') {
        docData.notes = item.notes;
      } else {
        docData.notes = null;
      }

      if (!existingDocs.empty) {
        console.log(`🔄 Updating existing item: ${item.itemName} (${item.parkId})`);
        try {
          const docId = existingDocs.docs[0].id;
          const docRef = doc(db, 'pricingCatalog', docId);
          await updateDoc(docRef, docData as any);
          console.log(`✅ Successfully updated: ${item.itemName} (ID: ${docId})`);
          results.updated++;
          continue;
        } catch (updateError) {
          console.error(`❌ Error updating ${item.itemName}:`, updateError);
          throw updateError;
        }
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
  console.log('🚀 Starting Busika import...');
  const results = await importBusika();

  console.log('\n📊 Import Summary:');
  console.log(`✅ Successfully added: ${results.success}`);
  console.log(`🔄 Successfully updated: ${results.updated}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`❌ Errors: ${results.errors.length}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach((err) => {
      console.log(`  - ${err.itemName}: ${err.error}`);
    });
  }
}

