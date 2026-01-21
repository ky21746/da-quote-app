/**
 * Import Lemala Wildwaters Lodge with Hierarchical Pricing Structure
 * This creates ONE item in the catalog with all pricing in metadata
 */

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const lemalaWildwatersHierarchical = {
  parkId: 'JINJA',
  category: 'Lodging',
  itemName: 'Lemala Wildwaters Lodge',
  basePrice: 0,
  costType: 'hierarchical_lodging',
  appliesTo: 'Park',
  active: true,
  sku: 'LWL-HIER',
  notes: 'Hierarchical pricing - use Configure button. NOTE: No family room available, maximum 3 people per room, no guests below 16 years. $12 community and government contribution per booking (separate charge).',
  
  metadata: {
    type: 'hierarchical',
    rooms: [
      {
        id: 'standard-suite',
        name: 'Standard Suite',
        description: 'Full board inclusive',
        maxOccupancy: 3,
        pricing: {
          high: {
            single: { perPerson: 714.29 },
            double: { perPerson: 500.00 },
            triple: { perPerson: 350.00 }
          },
          mid: {
            single: { perPerson: 410.00 },
            double: { perPerson: 410.00 },
            triple: { perPerson: 287.00 }
          },
          low: {
            single: { perPerson: 350.00 },
            double: { perPerson: 350.00 },
            triple: { perPerson: 245.00 }
          }
        }
      },
      {
        id: 'private-pool-suite',
        name: 'Private Pool Suite',
        description: 'Maximum occupancy 2 adults',
        maxOccupancy: 2,
        pricing: {
          high: {
            suite: { perRoom: 1300.00 }
          },
          mid: {
            suite: { perRoom: 1120.00 }
          },
          low: {
            suite: { perRoom: 1000.00 }
          }
        }
      }
    ],
    seasons: {
      high: {
        name: 'High Season',
        description: '1 July 25 - 30 Sept 25, 20 Dec 25 - 5 Jan 26',
        periods: [
          { start: '07-01', end: '09-30' },
          { start: '12-20', end: '01-05' }
        ]
      },
      mid: {
        name: 'Mid Season',
        description: '1 June 25 - 30 June 25, 1 Oct 25 - 31 Oct 25, 6 Jan 26 - 28 Feb 26',
        periods: [
          { start: '06-01', end: '06-30' },
          { start: '10-01', end: '10-31' },
          { start: '01-06', end: '02-28' }
        ]
      },
      low: {
        name: 'Low Season',
        description: '1 March 26 - 31 May 26, 1 Nov 25 - 19 Dec 25',
        periods: [
          { start: '03-01', end: '05-31' },
          { start: '11-01', end: '12-19' }
        ]
      }
    },
    additionalFees: {
      communityGovernmentFee: {
        amount: 12,
        unit: 'per booking',
        description: 'Community and Government Contribution',
        note: 'Separate charge - applies to every booking'
      }
    },
    restrictions: {
      noFamilyRoom: true,
      maxOccupancy: 3,
      minAge: 16,
      description: 'No family room available. Maximum 3 people per room. No guests below 16 years.'
    }
  }
};

export async function importLemalaWildwatersHierarchical(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const pricingCatalogRef = collection(db, 'pricingCatalog');
    
    const existingQuery = query(
      pricingCatalogRef,
      where('parkId', '==', 'JINJA'),
      where('category', '==', 'Lodging'),
      where('itemName', '==', 'Lemala Wildwaters Lodge'),
      where('costType', '==', 'hierarchical_lodging')
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      console.log('⏭️  Lemala Wildwaters Lodge (hierarchical) already exists');
      return {
        success: false,
        message: 'Item already exists'
      };
    }
    
    await addDoc(pricingCatalogRef, lemalaWildwatersHierarchical);
    console.log('✅ Added Lemala Wildwaters Lodge (hierarchical)');
    
    return {
      success: true,
      message: 'Successfully imported Lemala Wildwaters Lodge with hierarchical pricing'
    };
  } catch (error) {
    console.error('❌ Error importing Lemala Wildwaters Lodge:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function runImport(): Promise<void> {
  console.log('🚀 Starting Lemala Wildwaters Lodge (hierarchical) import...');
  const result = await importLemalaWildwatersHierarchical();
  console.log(result.message);
}
