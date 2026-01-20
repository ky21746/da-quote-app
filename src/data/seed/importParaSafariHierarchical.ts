/**
 * Import Para Safari Lodge with Hierarchical Pricing Structure
 * This creates ONE item in the catalog with all pricing in metadata
 */

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const paraSafariHierarchical = {
  parkId: 'MURCHISON',
  category: 'Lodging',
  itemName: 'Para Safari Lodge',
  basePrice: 0,
  costType: 'hierarchical_lodging',
  appliesTo: 'Park',
  active: true,
  sku: 'PSL-HIER',
  notes: 'Hierarchical pricing - use Configure button to select room, season, and occupancy',
  
  metadata: {
    type: 'hierarchical',
    rooms: [
      {
        id: 'signature-cottage',
        name: 'Signature Cottage',
        description: '4 pax',
        pricing: {
          high: {
            fourPax: { perRoom: 3266, perPerson: 817 }
          },
          low: {
            fourPax: { perRoom: 3110, perPerson: 778 }
          }
        }
      },
      {
        id: 'classic-room',
        name: 'Classic Room',
        description: '4 pax',
        pricing: {
          high: {
            fourPax: { perRoom: 809, perPerson: 202 }
          },
          low: {
            fourPax: { perRoom: 770, perPerson: 193 }
          }
        }
      },
      {
        id: 'deluxe-family-room',
        name: 'Deluxe Family Room',
        description: '4 pax',
        pricing: {
          high: {
            fourPax: { perRoom: 901, perPerson: 225 }
          },
          low: {
            fourPax: { perRoom: 858, perPerson: 215 }
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

export async function importParaSafariHierarchical(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const pricingCatalogRef = collection(db, 'pricingCatalog');
    
    const existingQuery = query(
      pricingCatalogRef,
      where('parkId', '==', 'MURCHISON'),
      where('category', '==', 'Lodging'),
      where('itemName', '==', 'Para Safari Lodge'),
      where('costType', '==', 'hierarchical_lodging')
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      console.log('⏭️  Para Safari Lodge (hierarchical) already exists');
      return {
        success: false,
        message: 'Item already exists'
      };
    }
    
    await addDoc(pricingCatalogRef, paraSafariHierarchical);
    console.log('✅ Added Para Safari Lodge (hierarchical)');
    
    return {
      success: true,
      message: 'Successfully imported Para Safari Lodge with hierarchical pricing'
    };
  } catch (error) {
    console.error('❌ Error importing Para Safari Lodge:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function runImport(): Promise<void> {
  console.log('🚀 Starting Para Safari Lodge (hierarchical) import...');
  const result = await importParaSafariHierarchical();
  console.log(result.message);
}
