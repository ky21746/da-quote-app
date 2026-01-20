/**
 * Import Nile Safari Lodge with Hierarchical Pricing Structure
 * This creates ONE item in the catalog with all pricing in metadata
 */

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const nileSafariHierarchical = {
  parkId: 'MURCHISON',
  category: 'Lodging',
  itemName: 'Nile Safari Lodge',
  basePrice: 0,
  costType: 'hierarchical_lodging',
  appliesTo: 'Park',
  active: true,
  sku: 'NSL-HIER',
  notes: 'Hierarchical pricing - use Configure button to select room, season, and occupancy',
  
  metadata: {
    type: 'hierarchical',
    rooms: [
      {
        id: 'deluxe-banda',
        name: 'Deluxe Banda',
        pricing: {
          high: {
            double: { perRoom: 2582, perPerson: 1291 },
            single: { perRoom: 1684, perPerson: 1684 },
            triple: { perRoom: 3477, perPerson: 1159 },
            child_5_15: 246,
            child_0_4: 0
          },
          low: {
            double: { perRoom: 1557, perPerson: 779 },
            single: { perRoom: 998, perPerson: 998 },
            triple: { perRoom: 1937, perPerson: 646 },
            child_5_15: 160,
            child_0_4: 0
          }
        }
      },
      {
        id: 'exclusive-banda',
        name: 'Exclusive Banda',
        pricing: {
          high: {
            double: { perRoom: 3221, perPerson: 1611 },
            single: { perRoom: 2097, perPerson: 2097 },
            triple: { perRoom: 3952, perPerson: 1317 },
            child_5_15: 246,
            child_0_4: 0
          },
          low: {
            double: { perRoom: 1944, perPerson: 972 },
            single: { perRoom: 1265, perPerson: 1265 },
            triple: { perRoom: 2196, perPerson: 732 },
            child_5_15: 160,
            child_0_4: 0
          }
        }
      },
      {
        id: 'family-villa',
        name: 'Family Villa',
        description: '1-8 Guests (4 Adults + 4 Children 0-15)',
        pricing: {
          high: {
            villa: { perVilla: 4406, perPerson: 551 }
          },
          low: {
            villa: { perVilla: 3075, perPerson: 384 }
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

export async function importNileSafariHierarchical(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const pricingCatalogRef = collection(db, 'pricingCatalog');
    
    const existingQuery = query(
      pricingCatalogRef,
      where('parkId', '==', 'MURCHISON'),
      where('category', '==', 'Lodging'),
      where('itemName', '==', 'Nile Safari Lodge'),
      where('costType', '==', 'hierarchical_lodging')
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      console.log('⏭️  Nile Safari Lodge (hierarchical) already exists');
      return {
        success: false,
        message: 'Item already exists'
      };
    }
    
    await addDoc(pricingCatalogRef, nileSafariHierarchical);
    console.log('✅ Added Nile Safari Lodge (hierarchical)');
    
    return {
      success: true,
      message: 'Successfully imported Nile Safari Lodge with hierarchical pricing'
    };
  } catch (error) {
    console.error('❌ Error importing Nile Safari Lodge:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function runImport(): Promise<void> {
  console.log('🚀 Starting Nile Safari Lodge (hierarchical) import...');
  const result = await importNileSafariHierarchical();
  console.log(result.message);
}
