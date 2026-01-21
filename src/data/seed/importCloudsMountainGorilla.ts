/**
 * Import Clouds Mountain Gorilla Lodge with Hierarchical Pricing Structure
 * This creates ONE item in the catalog with all pricing in metadata
 */

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const cloudsMountainGorillaHierarchical = {
  parkId: 'BWINDI',
  category: 'Lodging',
  itemName: 'Clouds Mountain Gorilla Lodge',
  basePrice: 0,
  costType: 'hierarchical_lodging',
  appliesTo: 'Park',
  active: true,
  sku: 'CMGL-HIER',
  notes: 'Hierarchical pricing - use Configure button. Southwest of Bwindi Impenetrable Forest. Valid 1st July 2025 - 30th June 2026.',
  
  metadata: {
    type: 'hierarchical',
    rooms: [
      {
        id: 'stand-alone-cottage',
        name: 'Stand Alone Cottage',
        description: '6 cottages available',
        maxOccupancy: 2,
        pricing: {
          high: {
            single: { perPerson: 1860 },
            sharing: { perPerson: 1620 }
          },
          green: {
            single: { perPerson: 1115 },
            sharing: { perPerson: 970 }
          }
        }
      },
      {
        id: 'family-cottage',
        name: 'Family Cottage',
        description: '2 cottages available',
        maxOccupancy: 4,
        pricing: {
          high: {
            twoSingles: { perPerson: 1770 },
            threePax: { perPerson: 1615 },
            fourPax: { perPerson: 1535 }
          },
          green: {
            twoSingles: { perPerson: 1045 },
            threePax: { perPerson: 970 },
            fourPax: { perPerson: 880 }
          }
        }
      }
    ],
    seasons: {
      high: {
        name: 'High Season',
        description: 'Jan | Feb | Jun | Jul | Aug | Sep | Dec',
        periods: [
          { start: '01-01', end: '02-28' },
          { start: '06-01', end: '09-30' },
          { start: '12-01', end: '12-31' }
        ]
      },
      green: {
        name: 'Green Season (Low Season)',
        description: 'Mar | Apr | May | Oct | Nov',
        periods: [
          { start: '03-01', end: '05-31' },
          { start: '10-01', end: '11-30' }
        ]
      }
    }
  }
};

export async function importCloudsMountainGorillaHierarchical(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const pricingCatalogRef = collection(db, 'pricingCatalog');
    
    const existingQuery = query(
      pricingCatalogRef,
      where('parkId', '==', 'BWINDI'),
      where('category', '==', 'Lodging'),
      where('itemName', '==', 'Clouds Mountain Gorilla Lodge'),
      where('costType', '==', 'hierarchical_lodging')
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      console.log('⏭️  Clouds Mountain Gorilla Lodge (hierarchical) already exists');
      return {
        success: false,
        message: 'Item already exists'
      };
    }
    
    await addDoc(pricingCatalogRef, cloudsMountainGorillaHierarchical);
    console.log('✅ Added Clouds Mountain Gorilla Lodge (hierarchical)');
    
    return {
      success: true,
      message: 'Successfully imported Clouds Mountain Gorilla Lodge with hierarchical pricing'
    };
  } catch (error) {
    console.error('❌ Error importing Clouds Mountain Gorilla Lodge:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function runImport(): Promise<void> {
  console.log('🚀 Starting Clouds Mountain Gorilla Lodge (hierarchical) import...');
  const result = await importCloudsMountainGorillaHierarchical();
  console.log(result.message);
}
