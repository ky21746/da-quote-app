/**
 * Import Bwindi Gorilla Trekking Service/Handling Fee
 * This is a standard fee charged per person for gorilla trekking logistics and guide services
 */

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const bwindiServiceFee = {
  parkId: 'BWINDI',
  category: 'Extras',
  itemName: 'Gorilla Trekking Service/Handling Fee',
  basePrice: 25,
  costType: 'per_person',
  appliesTo: 'Park',
  active: true,
  sku: 'BWINDI-SVC-FEE',
  notes: 'Service/Handling Fee per person for gorilla trekking. This covers guide services, logistics coordination, and trek support. Standard industry practice in Bwindi region, typically around 5% of permit cost or fixed amount per guide/crew. Add this for each person participating in gorilla trekking.',
};

export async function importBwindiServiceFee(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const pricingCatalogRef = collection(db, 'pricingCatalog');
    
    const existingQuery = query(
      pricingCatalogRef,
      where('parkId', '==', 'BWINDI'),
      where('category', '==', 'Extras'),
      where('itemName', '==', 'Gorilla Trekking Service/Handling Fee')
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      console.log('⏭️  Bwindi Service Fee already exists');
      return {
        success: false,
        message: 'Item already exists'
      };
    }
    
    await addDoc(pricingCatalogRef, bwindiServiceFee);
    console.log('✅ Added Bwindi Gorilla Trekking Service/Handling Fee');
    
    return {
      success: true,
      message: 'Successfully imported Bwindi Service Fee ($25/person)'
    };
  } catch (error) {
    console.error('❌ Error importing Bwindi Service Fee:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function runImport(): Promise<void> {
  console.log('🚀 Starting Bwindi Service Fee import...');
  const result = await importBwindiServiceFee();
  console.log(result.message);
}
