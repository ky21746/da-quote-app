/**
 * Export all pricingCatalog items from Firestore
 * Organized by category for Admin Panel setup
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase
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

async function exportPricingCatalog() {
  console.log('📦 Fetching all items from pricingCatalog...');
  
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
      sku: data.sku || null
    });
  });

  console.log(`✅ Found ${allItems.length} total items`);

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
    const entry = {
      id: item.id,
      name: item.name,
      category: item.category,
      parkId: item.parkId,
      appliesTo: item.appliesTo,
      active: item.active,
      sku: item.sku
    };

    switch (item.category) {
      case 'Parks':
        grouped.parks.push(entry);
        break;
      case 'Lodging':
        grouped.lodges.push(entry);
        break;
      case 'Activities':
        grouped.activities.push(entry);
        break;
      case 'Vehicle':
        grouped.vehicles.push(entry);
        break;
      case 'Aviation':
        grouped.aviation.push(entry);
        break;
      case 'Park Fees':
        grouped.parkFees.push(entry);
        break;
      case 'Permits':
        grouped.permits.push(entry);
        break;
      case 'Extras':
        grouped.extras.push(entry);
        break;
      default:
        grouped.other.push(entry);
    }
  });

  // Print summary
  console.log('\n📊 Summary by category:');
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

exportPricingCatalog().catch(error => {
  console.error('❌ Export failed:', error);
  process.exit(1);
});
