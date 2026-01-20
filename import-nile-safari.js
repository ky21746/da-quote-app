// Quick script to import Nile Safari Lodge hierarchical item
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const nileSafariHierarchical = {
  parkId: 'MURCHISON',
  category: 'Lodging',
  itemName: 'Nile Safari Lodge',
  basePrice: 0,
  costType: 'hierarchical_lodging',
  appliesTo: 'Park',
  active: true,
  sku: 'NSL-HIER',
  notes: 'Hierarchical pricing - use Configure button',
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
          high: { villa: { perVilla: 4406, perPerson: 551 } },
          low: { villa: { perVilla: 3075, perPerson: 384 } }
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

async function importItem() {
  try {
    const docRef = await addDoc(collection(db, 'pricingCatalog'), nileSafariHierarchical);
    console.log('✅ Successfully added Nile Safari Lodge with ID:', docRef.id);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

importItem();
