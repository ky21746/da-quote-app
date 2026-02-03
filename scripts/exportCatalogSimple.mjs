/**
 * Simple export using Firebase Admin SDK
 * Run with: node scripts/exportCatalogSimple.mjs
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize with project ID only (uses Application Default Credentials)
admin.initializeApp({
  projectId: 'discover-africa-quotation-app'
});

const db = admin.firestore();

async function exportCatalog() {
  console.log('📦 Fetching pricing catalog from Firestore...');
  
  try {
    const snapshot = await db.collection('pricingCatalog').get();
    
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
    console.log('\n📄 File content preview (first 50 lines):');
    
    // Show preview
    const content = JSON.stringify(grouped, null, 2);
    const lines = content.split('\n').slice(0, 50);
    console.log(lines.join('\n'));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

exportCatalog();
