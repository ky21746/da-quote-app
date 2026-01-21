/**
 * Import Lemala Wildwaters Lodge Fees
 * Room Levy ($2) + Community Fee ($10) = $12 per room per day
 */

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const lemalaWildwatersFees = {
  parkId: 'JINJA',
  category: 'Extras',
  itemName: 'Lemala Wildwaters Lodge - Room Fees',
  basePrice: 12,
  costType: 'per_room_per_night',
  appliesTo: 'Park',
  active: true,
  sku: 'LWL-FEES',
  notes: 'Mandatory fees per room per night: Room Levy ($2) + Community Contribution Fee ($10) = $12 total. Add this for each room booked at Lemala Wildwaters Lodge.',
};

export async function importLemalaWildwatersFees(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const pricingCatalogRef = collection(db, 'pricingCatalog');
    
    const existingQuery = query(
      pricingCatalogRef,
      where('parkId', '==', 'JINJA'),
      where('category', '==', 'Extras'),
      where('itemName', '==', 'Lemala Wildwaters Lodge - Room Fees')
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      console.log('⏭️  Lemala Wildwaters Lodge Fees already exist');
      return {
        success: false,
        message: 'Item already exists'
      };
    }
    
    await addDoc(pricingCatalogRef, lemalaWildwatersFees);
    console.log('✅ Added Lemala Wildwaters Lodge Fees');
    
    return {
      success: true,
      message: 'Successfully imported Lemala Wildwaters Lodge Fees ($12/room/night)'
    };
  } catch (error) {
    console.error('❌ Error importing Lemala Wildwaters Fees:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function runImport(): Promise<void> {
  console.log('🚀 Starting Lemala Wildwaters Fees import...');
  const result = await importLemalaWildwatersFees();
  console.log(result.message);
}
