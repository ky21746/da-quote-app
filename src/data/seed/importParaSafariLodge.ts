/**
 * Import script for Para Safari Lodge - Detailed Pricing 2026
 * 
 * Based on seasonal pricing with LOW season as base price
 */

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PricingItem } from '../../types/ui';

const paraSafariLodgeData = [
  // SIGNATURE COTTAGE - LOW SEASON
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Para Safari Lodge – Signature Cottage – Low Season',
    basePrice: 778,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Signature Cottage (4 pax), $3110/cottage, Low season',
    sku: 'PSL-SCL-4PPX'
  },
  
  // SIGNATURE COTTAGE - HIGH SEASON
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Para Safari Lodge – Signature Cottage – High Season',
    basePrice: 817,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Signature Cottage (4 pax), $3266/cottage, High season',
    sku: 'PSL-SCH-4PPX'
  },
  
  // CLASSIC ROOM - LOW SEASON
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Para Safari Lodge – Classic Room – Low Season',
    basePrice: 193,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Classic Room (4 pax), $770/room, Low season',
    sku: 'PSL-CRL-4PPX'
  },
  
  // CLASSIC ROOM - HIGH SEASON
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Para Safari Lodge – Classic Room – High Season',
    basePrice: 202,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Classic Room (4 pax), $809/room, High season',
    sku: 'PSL-CRH-4PPX'
  },
  
  // DELUXE FAMILY ROOM - LOW SEASON
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Para Safari Lodge – Deluxe Family Room – Low Season',
    basePrice: 215,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Deluxe Family Room (4 pax), $858/room, Low season',
    sku: 'PSL-DFL-4PPX'
  },
  
  // DELUXE FAMILY ROOM - HIGH SEASON
  {
    parkId: 'MURCHISON',
    category: 'Lodging',
    itemName: 'Para Safari Lodge – Deluxe Family Room – High Season',
    basePrice: 225,
    costType: 'per_night_per_person',
    appliesTo: 'Park',
    active: true,
    notes: 'Deluxe Family Room (4 pax), $901/room, High season',
    sku: 'PSL-DFH-4PPX'
  }
];

async function importParaSafariLodge() {
  const pricingCatalogRef = collection(db, 'pricingCatalog');
  
  const results = {
    success: 0,
    skipped: 0,
    errors: [] as Array<{ itemName: string; error: string }>,
  };

  for (const item of paraSafariLodgeData) {
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
  console.log('🚀 Starting Para Safari Lodge import...');
  const results = await importParaSafariLodge();

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
