/**
 * Direct export of pricing catalog from Firestore
 * Outputs complete JSON file
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

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
const auth = getAuth(app);

async function exportCatalog() {
  console.log('🔐 Authenticating...');
  
  // You need to provide admin credentials
  const email = process.argv[2];
  const password = process.argv[3];
  
  if (!email || !password) {
    console.error('❌ Usage: node exportCatalogDirect.js <email> <password>');
    process.exit(1);
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Authenticated');
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    process.exit(1);
  }

  console.log('📦 Fetching pricing catalog...');
  
  const pricingCatalogRef = collection(db, 'pricingCatalog');
  const snapshot = await getDocs(pricingCatalogRef);
  
  const allItems = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    allItems.push({
      id: doc.id,
      name: data.itemName || '',
      category: data.category || '',
      parkId: data.parkId || null,
      appliesTo: data.appliesTo || 'Global',
      active: data.active !== false,
      sku: data.sku || null,
      basePrice: data.basePrice || 0,
      costType: data.costType || ''
    });
  });

  console.log(`✅ Found ${allItems.length} items`);

  // Group by category
  const grouped = {
    parks: [],
    lodges: [],
    activities: [],
    vehicles: [],
    aviation: [],
    parkFees: [],
    permits: [],
    extras: [],
    other: []
  };

  allItems.forEach(item => {
    const category = item.category;
    switch (category) {
      case 'Parks':
        grouped.parks.push(item);
        break;
      case 'Lodging':
        grouped.lodges.push(item);
        break;
      case 'Activities':
        grouped.activities.push(item);
        break;
      case 'Vehicle':
        grouped.vehicles.push(item);
        break;
      case 'Aviation':
        grouped.aviation.push(item);
        break;
      case 'Park Fees':
        grouped.parkFees.push(item);
        break;
      case 'Permits':
        grouped.permits.push(item);
        break;
      case 'Extras':
        grouped.extras.push(item);
        break;
      default:
        grouped.other.push(item);
    }
  });

  // Print summary
  console.log('\n📊 Summary:');
  console.log(`  Parks: ${grouped.parks.length}`);
  console.log(`  Lodges: ${grouped.lodges.length}`);
  console.log(`  Activities: ${grouped.activities.length}`);
  console.log(`  Vehicles: ${grouped.vehicles.length}`);
  console.log(`  Aviation: ${grouped.aviation.length}`);
  console.log(`  Park Fees: ${grouped.parkFees.length}`);
  console.log(`  Permits: ${grouped.permits.length}`);
  console.log(`  Extras: ${grouped.extras.length}`);
  console.log(`  Other: ${grouped.other.length}`);

  // Save to file
  const outputPath = path.join(__dirname, '..', 'pricing_catalog_ids.json');
  fs.writeFileSync(outputPath, JSON.stringify(grouped, null, 2));
  
  console.log(`\n✅ Exported to: ${outputPath}`);
  
  process.exit(0);
}

exportCatalog().catch(error => {
  console.error('❌ Export failed:', error);
  process.exit(1);
});
