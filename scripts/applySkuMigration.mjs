/**
 * Apply SKU Migration to Firestore
 * Reads sku_migration.json and updates Firestore using Firebase Client SDK
 * 
 * ⚠️  ONLY RUN AFTER REVIEWING sku_migration.json
 * Run with: node scripts/applySkuMigration.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase with Client SDK
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

/**
 * Apply migration
 */
async function applySkuMigration() {
  console.log('📖 Reading SKU migration plan...\n');
  
  try {
    const migrationPath = path.join(__dirname, '..', 'sku_migration.json');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error('sku_migration.json not found. Run generateSkuMigration.mjs first.');
    }

    const migration = JSON.parse(fs.readFileSync(migrationPath, 'utf8'));
    
    console.log(`📊 Found ${migration.length} items to update\n`);
    console.log('⚠️  WARNING: This will update Firestore documents.');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('🚀 Starting migration...\n');

    const results = {
      updated: 0,
      deleted: 0,
      failed: 0,
      errors: []
    };

    // Process each item
    for (const item of migration) {
      try {
        if (item.action === 'DELETE') {
          // Delete the document
          const docRef = doc(db, 'pricingCatalog', item.documentId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            await deleteDoc(docRef);
            console.log(`🗑️  Deleted "${item.documentId}"`);
            results.deleted++;
          } else {
            console.log(`⚠️  Document "${item.documentId}" not found (already deleted?)`);
          }
        } else if (item.action === 'UPDATE') {
          // Update the SKU
          const docRef = doc(db, 'pricingCatalog', item.documentId);
          await updateDoc(docRef, {
            sku: item.newSku
          });
          
          console.log(`✅ ${item.documentId} → ${item.newSku}`);
          results.updated++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`❌ Failed: ${item.documentId} - ${error.message}`);
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
    console.log('              MIGRATION COMPLETE');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`✅ Successfully Updated:  ${results.updated}`);
    console.log(`🗑️  Deleted:              ${results.deleted}`);
    console.log(`❌ Failed:                ${results.failed}`);
    console.log('');

    if (results.errors.length > 0) {
      console.log('❌ ERRORS:');
      results.errors.forEach(err => {
        console.log(`   - ${err.itemName} (${err.documentId}): ${err.error}`);
      });
      console.log('');
    }

    // Save results
    const resultsPath = path.join(__dirname, '..', 'sku_migration_results.json');
    fs.writeFileSync(resultsPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalUpdated: results.updated,
      totalDeleted: results.deleted,
      totalFailed: results.failed,
      errors: results.errors
    }, null, 2));

    console.log(`📄 Results saved to: ${resultsPath}`);
    console.log('');
    console.log('✅ Migration complete!');
    console.log('');
    console.log('📝 NEXT STEPS:');
    console.log('   1. Verify SKUs in Firebase Console');
    console.log('   2. Export catalog to confirm all items have SKUs');
    console.log('   3. Test integration with Itinerary Builder');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
applySkuMigration();
