/**
 * Import script for Activities
 * 
 * This script imports activity pricing data into Firestore.
 */

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PricingItem } from '../../types/ui';

// Activities data
const activitiesData = [
  // MURCHISON
  {
    parkId: 'MURCHISON',
    category: 'Activities',
    itemName: 'Game Drive – Day (with UWA Guide)',
    basePrice: 25,
    costType: 'per_guide',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  {
    parkId: 'MURCHISON',
    category: 'Activities',
    itemName: 'Game Drive – Night',
    basePrice: 40,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  {
    parkId: 'MURCHISON',
    category: 'Activities',
    itemName: 'Boat Safari / Launch Cruise',
    basePrice: 30,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  {
    parkId: 'MURCHISON',
    category: 'Activities',
    itemName: 'Hiking to Top of the Falls',
    basePrice: 15,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  {
    parkId: 'MURCHISON',
    category: 'Activities',
    itemName: 'White Water Rafting',
    basePrice: 50,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  // QUEEN_ELIZABETH
  {
    parkId: 'QUEEN_ELIZABETH',
    category: 'Activities',
    itemName: 'Game Drive – Day (with UWA Guide)',
    basePrice: 25,
    costType: 'per_guide',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  {
    parkId: 'QUEEN_ELIZABETH',
    category: 'Activities',
    itemName: 'Boat Safari / Launch Cruise',
    basePrice: 30,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  {
    parkId: 'QUEEN_ELIZABETH',
    category: 'Activities',
    itemName: 'Lion Tracking Experience',
    basePrice: 200,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  {
    parkId: 'QUEEN_ELIZABETH',
    category: 'Activities',
    itemName: 'Hippo Census Experience',
    basePrice: 100,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  // KIBALE
  {
    parkId: 'KIBALE',
    category: 'Activities',
    itemName: 'Bird Watching & Nature Walk',
    basePrice: 40,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  // BWINDI
  {
    parkId: 'BWINDI',
    category: 'Activities',
    itemName: 'Bird Watching & Nature Walk',
    basePrice: 40,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  {
    parkId: 'BWINDI',
    category: 'Activities',
    itemName: 'Guided Long Walk – Rushaga to Nyabaremura',
    basePrice: 60,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  {
    parkId: 'BWINDI',
    category: 'Activities',
    itemName: 'Long Walk – Buhoma to Nkuringo',
    basePrice: 60,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  // KIDEPO
  {
    parkId: 'KIDEPO',
    category: 'Activities',
    itemName: 'Game Drive – Day (with UWA Guide)',
    basePrice: 20,
    costType: 'per_guide',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  {
    parkId: 'KIDEPO',
    category: 'Activities',
    itemName: 'Game Drive – Night',
    basePrice: 30,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  {
    parkId: 'KIDEPO',
    category: 'Activities',
    itemName: 'Bird Watching & Nature Walk',
    basePrice: 25,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  // LAKE_MBURO
  {
    parkId: 'LAKE_MBURO',
    category: 'Activities',
    itemName: 'Game Drive – Day',
    basePrice: 20,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  {
    parkId: 'LAKE_MBURO',
    category: 'Activities',
    itemName: 'Night Game Drive',
    basePrice: 30,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  {
    parkId: 'LAKE_MBURO',
    category: 'Activities',
    itemName: 'Boat Ride',
    basePrice: 30,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  {
    parkId: 'LAKE_MBURO',
    category: 'Activities',
    itemName: 'Cycling Activity',
    basePrice: 30,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  // MT_ELGON
  {
    parkId: 'MT_ELGON',
    category: 'Activities',
    itemName: 'Bird Watching & Nature Walk',
    basePrice: 40,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  {
    parkId: 'MT_ELGON',
    category: 'Activities',
    itemName: 'Mountain Hiking',
    basePrice: 50,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  // RWENZORI
  {
    parkId: 'RWENZORI',
    category: 'Activities',
    itemName: 'Mountain Hiking',
    basePrice: 50,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  {
    parkId: 'RWENZORI',
    category: 'Activities',
    itemName: 'Bird Watching & Nature Walk',
    basePrice: 40,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  // SEMULIKI
  {
    parkId: 'SEMULIKI',
    category: 'Activities',
    itemName: 'Bird Watching & Nature Walk',
    basePrice: 40,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
  {
    parkId: 'SEMULIKI',
    category: 'Activities',
    itemName: 'Shoebill Viewing by Boat',
    basePrice: 100,
    costType: 'per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'FNR rate',
  },
];

interface ActivityData {
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
 * Import activities to Firestore
 * Checks for duplicates before adding
 */
export async function importActivities(): Promise<{
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

  for (const item of activitiesData) {
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
  console.log('🚀 Starting activities import...');
  const results = await importActivities();
  
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

