/**
 * Import script for Nile Safari Lodge - Detailed Pricing 2026
 * 
 * Based on seasonal pricing with LOW season as base price
 */

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PricingItem } from '../../types/ui';

const nileSafariLodgeData = [
  // DELUXE BANDA - LOW SEASON
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Deluxe Banda – Double – Low Season',
    basePrice: 779,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Adult double per room, Low season',
    sku: 'NSL-DBL-DAD'
  },
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Deluxe Banda – Single – Low Season',
    basePrice: 998,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Adult single per room, Low season',
    sku: 'NSL-DBL-SAD'
  },
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Deluxe Banda – Triple – Low Season',
    basePrice: 646,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Triple occupancy per room ($1937/room), Low season',
    sku: 'NSL-DBL-TRM'
  },
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Deluxe Banda – Child 5-15 – Low Season',
    basePrice: 160,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Child 5-15 sharing with adults, Low season',
    sku: 'NSL-DBL-RC5'
  },
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Deluxe Banda – Child 0-4 – Low Season',
    basePrice: 0,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Child 0-4 sharing with adults (FOC), Low season',
    sku: 'NSL-DBL-RC0'
  },
  
  // DELUXE BANDA - HIGH SEASON
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Deluxe Banda – Double – High Season',
    basePrice: 1291,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Adult double per room, High season',
    sku: 'NSL-DBH-DAD'
  },
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Deluxe Banda – Single – High Season',
    basePrice: 1684,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Adult single per room, High season',
    sku: 'NSL-DBH-SAD'
  },
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Deluxe Banda – Triple – High Season',
    basePrice: 1159,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Triple occupancy per room ($3477/room), High season',
    sku: 'NSL-DBH-TRM'
  },
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Deluxe Banda – Child 5-15 – High Season',
    basePrice: 246,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Child 5-15 sharing with adults, High season',
    sku: 'NSL-DBH-RC5'
  },
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Deluxe Banda – Child 0-4 – High Season',
    basePrice: 0,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Child 0-4 sharing with adults (FOC), High season',
    sku: 'NSL-DBH-RC0'
  },
  
  // EXCLUSIVE BANDA - LOW SEASON
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Exclusive Banda – Double – Low Season',
    basePrice: 972,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Adult double per room, Low season',
    sku: 'NSL-EBL-DAD'
  },
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Exclusive Banda – Single – Low Season',
    basePrice: 1265,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Adult single per room, Low season',
    sku: 'NSL-EBL-SAD'
  },
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Exclusive Banda – Triple – Low Season',
    basePrice: 732,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Triple occupancy per room ($2196/room), Low season',
    sku: 'NSL-EBL-TRM'
  },
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Exclusive Banda – Child 5-15 – Low Season',
    basePrice: 160,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Child 5-15 sharing with adults, Low season',
    sku: 'NSL-EBL-RC5'
  },
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Exclusive Banda – Child 0-4 – Low Season',
    basePrice: 0,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Child 0-4 sharing with adults (FOC), Low season',
    sku: 'NSL-EBL-RC0'
  },
  
  // EXCLUSIVE BANDA - HIGH SEASON
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Exclusive Banda – Double – High Season',
    basePrice: 1611,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Adult double per room, High season',
    sku: 'NSL-EBH-DAD'
  },
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Exclusive Banda – Single – High Season',
    basePrice: 2097,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Adult single per room, High season',
    sku: 'NSL-EBH-SAD'
  },
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Exclusive Banda – Triple – High Season',
    basePrice: 1317,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Triple occupancy per room ($3952/room), High season',
    sku: 'NSL-EBH-TRM'
  },
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Exclusive Banda – Child 5-15 – High Season',
    basePrice: 246,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Child 5-15 sharing with adults, High season',
    sku: 'NSL-EBH-RC5'
  },
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Exclusive Banda – Child 0-4 – High Season',
    basePrice: 0,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Child 0-4 sharing with adults (FOC), High season',
    sku: 'NSL-EBH-RC0'
  },
  
  // FAMILY VILLA - LOW SEASON
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Family Villa – Low Season',
    basePrice: 384,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Family Villa 1-8 guests (4 adults + 4 children 0-15), $3075/villa, Low season',
    sku: 'NSL-FVL-GVL'
  },
  
  // FAMILY VILLA - HIGH SEASON
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Nile Safari Lodge – Family Villa – High Season',
    basePrice: 551,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Family Villa 1-8 guests (4 adults + 4 children 0-15), $4406/villa, High season',
    sku: 'NSL-FVH-GVL'
  }
];

async function importNileSafariLodge() {
  const pricingCatalogRef = collection(db, 'pricingCatalog');
  
  const results = {
    success: 0,
    skipped: 0,
    errors: [] as Array<{ itemName: string; error: string }>,
  };

  for (const item of nileSafariLodgeData) {
    try {
      const q = query(
        pricingCatalogRef,
        where('category', '==', item.category),
        where('itemName', '==', item.itemName)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        console.log(`⏭️  Skipped (already exists): ${item.itemName}`);
        results.skipped++;
        continue;
      }

      const docData: any = {
        parkId: item.parkId,
        category: item.category as PricingItem['category'],
        itemName: item.itemName,
        basePrice: item.basePrice,
        costType: item.costType as PricingItem['costType'],
        appliesTo: item.appliesTo as 'Global' | 'Park',
        active: item.active,
        sku: item.sku || null,
      };

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

export async function runImport(): Promise<void> {
  console.log('🚀 Starting Nile Safari Lodge import...');
  const results = await importNileSafariLodge();

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
