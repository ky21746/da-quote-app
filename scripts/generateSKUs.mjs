/**
 * SKU Generation Script
 * Generates unique, human-readable SKUs for all items in pricingCatalog
 * Run with: node scripts/generateSKUs.mjs
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

// Park code mappings
const PARK_CODES = {
  'MURCHISON': 'MURCH',
  'BWINDI': 'BWIND',
  'QUEEN_ELIZABETH': 'QELIZ',
  'KIBALE': 'KIBAL',
  'MGAHINGA': 'MGAHI',
  'KIDEPO': 'KIDEP',
  'LAKE_MBURO': 'LMBUR',
  'MT_ELGON': 'MELGO',
  'RWENZORI': 'RWENZ',
  'SEMULIKI': 'SEMUL',
  'ZIWA': 'ZIWA',
  'BUSIKA': 'BUSIK',
  'ENTEBBE': 'ENTEB',
  'LAKE_BUNYONYI': 'LBUNY',
  'JINJA': 'JINJA',
  'null': 'GLOBL',
  'undefined': 'GLOBL'
};

// Category code mappings
const CATEGORY_CODES = {
  'Aviation': 'AVI',
  'Lodging': 'LODG',
  'Vehicle': 'VEH',
  'Activities': 'ACT',
  'Park Fees': 'PFEE',
  'Permits': 'PERM',
  'Extras': 'EXTR',
  'Logistics': 'LOG'
};

/**
 * Generate item code from item name
 * Takes first 8 characters, removes spaces and special characters
 */
function generateItemCode(itemName) {
  return itemName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8)
    .padEnd(8, 'X');
}

/**
 * Generate SKU for an item
 */
function generateSKU(parkId, category, itemName, sequence) {
  const parkCode = PARK_CODES[parkId] || PARK_CODES[String(parkId)] || 'GLOBL';
  const categoryCode = CATEGORY_CODES[category] || 'UNKN';
  const itemCode = generateItemCode(itemName);
  const seqNum = String(sequence).padStart(3, '0');
  
  return `${parkCode}_${categoryCode}_${itemCode}_${seqNum}`;
}

/**
 * Main function to generate SKUs
 */
async function generateSKUs() {
  console.log('🔍 Fetching all items from pricingCatalog...\n');
  
  try {
    const snapshot = await db.collection('pricingCatalog').get();
    console.log(`📦 Found ${snapshot.size} items\n`);

    // Collect all items
    const items = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      items.push({
        documentId: doc.id,
        parkId: data.parkId || null,
        category: data.category || 'Uncategorized',
        itemName: data.itemName || 'Unnamed',
        currentSKU: data.sku || null,
        basePrice: data.basePrice || 0,
        costType: data.costType || '',
        appliesTo: data.appliesTo || 'Unknown',
        active: data.active !== false
      });
    });

    // Group by park + category for sequence numbering
    const groups = {};
    items.forEach(item => {
      const key = `${item.parkId || 'null'}_${item.category}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    // Generate SKUs
    const assignments = [];
    const skuSet = new Set();
    let duplicateCount = 0;

    for (const [groupKey, groupItems] of Object.entries(groups)) {
      // Sort items by name for consistent ordering
      groupItems.sort((a, b) => a.itemName.localeCompare(b.itemName));

      groupItems.forEach((item, index) => {
        const sequence = index + 1;
        let sku = generateSKU(item.parkId, item.category, item.itemName, sequence);
        
        // Check for duplicates
        if (skuSet.has(sku)) {
          console.warn(`⚠️  Duplicate SKU detected: ${sku}`);
          duplicateCount++;
          // Add extra suffix for duplicate
          sku = `${sku}_DUP${duplicateCount}`;
        }
        
        skuSet.add(sku);
        
        assignments.push({
          documentId: item.documentId,
          itemName: item.itemName,
          parkId: item.parkId,
          category: item.category,
          currentSKU: item.currentSKU,
          generatedSKU: sku,
          needsUpdate: item.currentSKU !== sku
        });
      });
    }

    // Statistics
    const needsUpdate = assignments.filter(a => a.needsUpdate).length;
    const alreadyHasSKU = assignments.filter(a => a.currentSKU).length;

    // Save to file
    const outputPath = path.join(__dirname, '..', 'sku_assignments.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      metadata: {
        totalItems: assignments.length,
        itemsNeedingUpdate: needsUpdate,
        itemsWithExistingSKU: alreadyHasSKU,
        generatedAt: new Date().toISOString()
      },
      assignments: assignments
    }, null, 2));

    // Print summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('              SKU GENERATION SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`Total Items:              ${assignments.length}`);
    console.log(`Items Needing Update:     ${needsUpdate}`);
    console.log(`Items with Existing SKU:  ${alreadyHasSKU}`);
    console.log(`Duplicate SKUs Found:     ${duplicateCount}`);
    console.log('');

    // Show sample SKUs
    console.log('📋 SAMPLE GENERATED SKUs (first 20):');
    console.log('─────────────────────────────────────────────────────────');
    assignments.slice(0, 20).forEach(item => {
      const status = item.needsUpdate ? '🆕' : '✅';
      const park = (item.parkId || 'Global').padEnd(20);
      const category = item.category.padEnd(15);
      console.log(`${status} ${park} ${category} ${item.generatedSKU}`);
    });
    
    if (assignments.length > 20) {
      console.log(`\n... and ${assignments.length - 20} more items`);
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log(`✅ SKU assignments saved to: ${outputPath}`);
    console.log('');
    console.log('📝 NEXT STEPS:');
    console.log('   1. Review sku_assignments.json');
    console.log('   2. Check for any naming conflicts or duplicates');
    console.log('   3. Run: node scripts/updateSKUs.mjs (to update Firestore)');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
generateSKUs();
