/**
 * SKU Migration Generator
 * Generates standardized SKUs for all pricingCatalog items
 * 
 * OUTPUT: sku_migration.json (for review before Firestore update)
 * Run with: node scripts/generateSkuMigration.mjs
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'discover-africa-quotation-app'
});

const db = admin.firestore();

// Category abbreviations
const CATEGORY_CODES = {
  'Activities': 'ACT',
  'Aviation': 'AVN',
  'Lodging': 'LODGE',
  'Park Fees': 'FEE',
  'Permits': 'PERMIT',
  'Extras': 'EXT',
  'Logistics': 'LOG',
  'Vehicle': 'VEH'
};

/**
 * Generate short name from item name
 * Max 20 chars, uppercase, underscores, no spaces
 */
function generateShortName(itemName, category) {
  let shortName = itemName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // For Aviation: try to extract airport codes (3-letter codes)
  if (category === 'Aviation') {
    const airportCodes = itemName.match(/\b[A-Z]{3}\b/g);
    if (airportCodes && airportCodes.length >= 2) {
      // Format: AIRCRAFT_ORIGIN_DEST
      const aircraft = itemName.includes('PC12') ? 'PC12' : 
                      itemName.includes('Caravan') ? 'CARAVAN' : 
                      itemName.includes('Helicopter') ? 'HELI' : 'FLT';
      shortName = `${aircraft}_${airportCodes[0]}_${airportCodes[1]}`;
    }
  }
  
  // Truncate to 20 chars
  if (shortName.length > 20) {
    shortName = shortName.substring(0, 20);
  }
  
  return shortName;
}

/**
 * Generate SKU for an item
 */
function generateSKU(item) {
  // Park code
  const parkCode = item.parkId && item.parkId !== 'Global' && item.parkId !== 'null' 
    ? item.parkId.toUpperCase() 
    : 'GLOBAL';
  
  // Category code
  const categoryCode = CATEGORY_CODES[item.category] || 'UNKN';
  
  // Short name
  const shortName = generateShortName(item.itemName, item.category);
  
  return `${parkCode}_${categoryCode}_${shortName}`;
}

/**
 * Main function
 */
async function generateSkuMigration() {
  console.log('📦 Fetching all items from pricingCatalog...\n');
  
  try {
    const snapshot = await db.collection('pricingCatalog').get();
    console.log(`✅ Found ${snapshot.size} documents\n`);

    const migration = [];
    const skuSet = new Set();
    const duplicates = [];
    let deletedMainDoc = false;

    snapshot.forEach(doc => {
      const docId = doc.id;
      
      // Rule 7: Delete "main" document
      if (docId === 'main') {
        console.log('⚠️  Found "main" document - marking for deletion');
        deletedMainDoc = true;
        return;
      }

      const data = doc.data();
      
      const item = {
        documentId: docId,
        itemName: data.itemName || 'Unnamed',
        category: data.category || 'Uncategorized',
        parkId: data.parkId || 'Global',
        oldSku: data.sku || null,
        newSku: ''
      };

      // Generate new SKU
      item.newSku = generateSKU(item);

      // Check for duplicates
      if (skuSet.has(item.newSku)) {
        duplicates.push(item.newSku);
        // Add suffix to make unique
        let counter = 2;
        let uniqueSku = `${item.newSku}_${counter}`;
        while (skuSet.has(uniqueSku)) {
          counter++;
          uniqueSku = `${item.newSku}_${counter}`;
        }
        item.newSku = uniqueSku;
      }

      skuSet.add(item.newSku);
      migration.push(item);
    });

    // Sort by park, then category, then name
    migration.sort((a, b) => {
      if (a.parkId !== b.parkId) {
        return a.parkId.localeCompare(b.parkId);
      }
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.itemName.localeCompare(b.itemName);
    });

    // Save to JSON
    const outputPath = path.join(__dirname, '..', 'sku_migration.json');
    fs.writeFileSync(outputPath, JSON.stringify(migration, null, 2));

    // Print summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('              SKU MIGRATION SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`Total Items:              ${migration.length}`);
    console.log(`SKUs Generated:           ${migration.length}`);
    console.log(`Items with Old SKU:       ${migration.filter(m => m.oldSku).length}`);
    console.log(`Items without Old SKU:    ${migration.filter(m => !m.oldSku).length}`);
    console.log(`Duplicate Conflicts:      ${duplicates.length}`);
    if (deletedMainDoc) {
      console.log(`"main" Document:          Found (will be deleted)`);
    }
    console.log('');

    // Category breakdown
    const byCategory = {};
    migration.forEach(item => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = 0;
      }
      byCategory[item.category]++;
    });

    console.log('📊 BY CATEGORY:');
    console.log('─────────────────────────────────────────────────────────');
    Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        const code = CATEGORY_CODES[cat] || 'UNKN';
        console.log(`${cat.padEnd(20)} (${code.padEnd(6)}) ${count} items`);
      });
    console.log('');

    // Show duplicates if any
    if (duplicates.length > 0) {
      console.log('⚠️  DUPLICATE SKUs FOUND (auto-numbered):');
      console.log('─────────────────────────────────────────────────────────');
      [...new Set(duplicates)].forEach(sku => {
        const items = migration.filter(m => m.newSku.startsWith(sku));
        console.log(`  ${sku}:`);
        items.forEach(item => {
          console.log(`    - ${item.newSku} → ${item.itemName}`);
        });
      });
      console.log('');
    }

    // Show sample SKUs
    console.log('📋 SAMPLE SKUs (first 20):');
    console.log('─────────────────────────────────────────────────────────');
    migration.slice(0, 20).forEach(item => {
      const oldSkuDisplay = item.oldSku ? item.oldSku.padEnd(30) : '(none)'.padEnd(30);
      console.log(`${oldSkuDisplay} → ${item.newSku}`);
      console.log(`   ${item.itemName} (${item.parkId})`);
    });
    
    if (migration.length > 20) {
      console.log(`\n... and ${migration.length - 20} more items`);
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log(`✅ Migration plan saved to: ${outputPath}`);
    console.log('');
    console.log('📝 NEXT STEPS:');
    console.log('   1. Review sku_migration.json');
    console.log('   2. Check for any naming issues or conflicts');
    console.log('   3. If approved, run: node scripts/applySkuMigration.mjs');
    console.log('');
    console.log('⚠️  DO NOT run applySkuMigration.mjs until you approve the SKUs!');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
generateSkuMigration();
