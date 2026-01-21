/**
 * Import Entikko Lodge with Hierarchical Pricing Structure
 * This creates ONE item in the catalog with all pricing in metadata
 */

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const entikkoHierarchical = {
  parkId: 'MURCHISON',
  category: 'Lodging',
  itemName: 'Entikko Lodge',
  basePrice: 0,
  costType: 'hierarchical_lodging',
  appliesTo: 'Park',
  active: true,
  sku: 'ENT-HIER',
  notes: 'Hierarchical pricing - use Configure button to select season and occupancy. Full board included.',
  
  metadata: {
    type: 'hierarchical',
    rooms: [
      {
        id: 'standard-room',
        name: 'Standard Room',
        description: 'Full board included',
        maxOccupancy: 2,
        pricing: {
          high: {
            single: { perPerson: 529 },
            double: { perPerson: 529 }
          },
          low: {
            single: { perPerson: 429 },
            double: { perPerson: 429 }
          }
        }
      }
    ],
    seasons: {
      high: {
        name: 'High Season',
        description: 'Jan 1-28 Feb, Jun 1-30 Sep, Dec 15-31',
        periods: [
          { start: '01-01', end: '02-28' },
          { start: '06-01', end: '09-30' },
          { start: '12-15', end: '12-31' }
        ]
      },
      low: {
        name: 'Low Season',
        description: 'Mar 1-31 May, Oct 1-14 Dec',
        periods: [
          { start: '03-01', end: '05-31' },
          { start: '10-01', end: '12-14' }
        ]
      }
    }
  }
};

export async function importEntikkoHierarchical(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const pricingCatalogRef = collection(db, 'pricingCatalog');
    
    const existingQuery = query(
      pricingCatalogRef,
      where('parkId', '==', 'MURCHISON'),
      where('category', '==', 'Lodging'),
      where('itemName', '==', 'Entikko Lodge'),
      where('costType', '==', 'hierarchical_lodging')
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      console.log('⏭️  Entikko Lodge (hierarchical) already exists');
      return {
        success: false,
        message: 'Item already exists'
      };
    }
    
    await addDoc(pricingCatalogRef, entikkoHierarchical);
    console.log('✅ Added Entikko Lodge (hierarchical)');
    
    return {
      success: true,
      message: 'Successfully imported Entikko Lodge with hierarchical pricing'
    };
  } catch (error) {
    console.error('❌ Error importing Entikko Lodge:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function runImport(): Promise<void> {
  console.log('🚀 Starting Entikko Lodge (hierarchical) import...');
  const result = await importEntikkoHierarchical();
  console.log(result.message);
}
