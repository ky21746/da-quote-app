/**
 * Update SKUs in Firestore
 * Reads sku_assignments.json and updates Firestore documents
 * Run with: node scripts/updateSKUs.mjs
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

/**
 * Update SKUs in Firestore
 */
async function updateSKUs() {
  console.log('📖 Reading SKU assignments...\n');
  
  try {
    // Read assignments file
    const assignmentsPath = path.join(__dirname, '..', 'sku_assignments.json');
    
    if (!fs.existsSync(assignmentsPath)) {
      throw new Error('sku_assignments.json not found. Run generateSKUs.mjs first.');
    }

    const data = JSON.parse(fs.readFileSync(assignmentsPath, 'utf8'));
    const assignments = data.assignments;
    const itemsToUpdate = assignments.filter(a => a.needsUpdate);

    console.log(`📊 Total Items: ${assignments.length}`);
    console.log(`🔄 Items to Update: ${itemsToUpdate.length}\n`);

    if (itemsToUpdate.length === 0) {
      console.log('✅ All items already have correct SKUs. Nothing to update.');
      process.exit(0);
    }

    // Confirm before updating
    console.log('⚠️  WARNING: This will update Firestore documents.');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('🚀 Starting updates...\n');

    // Update documents
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const item of itemsToUpdate) {
      try {
        await db.collection('pricingCatalog').doc(item.documentId).update({
          sku: item.generatedSKU
        });
        
        console.log(`✅ Updated: ${item.itemName} → ${item.generatedSKU}`);
        results.success++;
      } catch (error) {
        console.error(`❌ Failed: ${item.itemName} (${item.documentId})`);
        console.error(`   Error: ${error.message}`);
        results.failed++;
        results.errors.push({
          documentId: item.documentId,
          itemName: item.itemName,
          error: error.message
        });
      }
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('                UPDATE SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`✅ Successfully Updated:  ${results.success}`);
    console.log(`❌ Failed:                ${results.failed}`);
    console.log('');

    if (results.errors.length > 0) {
      console.log('❌ ERRORS:');
      results.errors.forEach(err => {
        console.log(`   - ${err.itemName}: ${err.error}`);
      });
      console.log('');
    }

    // Save results
    const resultsPath = path.join(__dirname, '..', 'sku_update_results.json');
    fs.writeFileSync(resultsPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalUpdated: results.success,
      totalFailed: results.failed,
      errors: results.errors
    }, null, 2));

    console.log(`📄 Results saved to: ${resultsPath}`);
    console.log('');
    console.log('✅ Update complete!');
    console.log('');
    console.log('📝 NEXT STEPS:');
    console.log('   1. Run: node scripts/auditCatalog.mjs (to verify all SKUs)');
    console.log('   2. Export catalog for Itinerary Builder integration');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
updateSKUs();
