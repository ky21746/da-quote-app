/**
 * Export Full Catalog to JSON
 * Exports all items from pricingCatalog with complete details
 * Run with: node scripts/exportFullCatalog.mjs
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
 * Export full catalog
 */
async function exportFullCatalog() {
  console.log('📦 Fetching all items from pricingCatalog...\n');
  
  try {
    const snapshot = await db.collection('pricingCatalog').get();
    console.log(`✅ Found ${snapshot.size} items\n`);

    // Collect all items with full details
    const items = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      items.push({
        documentId: doc.id,
        itemName: data.itemName || '',
        category: data.category || '',
        parkId: data.parkId || null,
        sku: data.sku || null,
        basePrice: data.basePrice || 0,
        costType: data.costType || '',
        appliesTo: data.appliesTo || '',
        active: data.active !== false,
        capacity: data.capacity || null,
        quantity: data.quantity || null,
        notes: data.notes || null,
        metadata: data.metadata || null
      });
    });

    // Sort by category, then park, then name
    items.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      if ((a.parkId || '') !== (b.parkId || '')) {
        return (a.parkId || '').localeCompare(b.parkId || '');
      }
      return a.itemName.localeCompare(b.itemName);
    });

    // Group by category for summary
    const byCategory = {};
    items.forEach(item => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = [];
      }
      byCategory[item.category].push(item);
    });

    // Create export object
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalItems: items.length,
        collection: 'pricingCatalog',
        project: 'discover-africa-quotation-app'
      },
      summary: {
        totalItems: items.length,
        itemsWithSKU: items.filter(i => i.sku).length,
        itemsMissingSKU: items.filter(i => !i.sku).length,
        activeItems: items.filter(i => i.active).length,
        inactiveItems: items.filter(i => !i.active).length,
        byCategory: Object.keys(byCategory).map(cat => ({
          category: cat,
          count: byCategory[cat].length,
          withSKU: byCategory[cat].filter(i => i.sku).length,
          missingSKU: byCategory[cat].filter(i => !i.sku).length
        }))
      },
      items: items
    };

    // Save to file
    const outputPath = path.join(__dirname, '..', 'catalog_full_export.json');
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

    // Print summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('              CATALOG EXPORT SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`Total Items:              ${exportData.summary.totalItems}`);
    console.log(`Items with SKU:           ${exportData.summary.itemsWithSKU}`);
    console.log(`Items missing SKU:        ${exportData.summary.itemsMissingSKU}`);
    console.log(`Active Items:             ${exportData.summary.activeItems}`);
    console.log(`Inactive Items:           ${exportData.summary.inactiveItems}`);
    console.log('');
    console.log('📊 BY CATEGORY:');
    console.log('─────────────────────────────────────────────────────────');
    
    exportData.summary.byCategory.forEach(cat => {
      const name = cat.category.padEnd(20);
      const count = String(cat.count).padStart(3);
      const withSKU = String(cat.withSKU).padStart(3);
      const missing = String(cat.missingSKU).padStart(3);
      console.log(`${name} Total: ${count}  |  With SKU: ${withSKU}  |  Missing: ${missing}`);
    });

    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log(`✅ Full catalog exported to: ${outputPath}`);
    console.log('');
    console.log('📄 File contains:');
    console.log('   - metadata: Export info and timestamps');
    console.log('   - summary: Statistics and category breakdown');
    console.log('   - items: Full array of all catalog items with all fields');
    console.log('');

    // Also create a simple CSV for Excel
    const csvPath = path.join(__dirname, '..', 'catalog_export.csv');
    const csvHeader = 'Document ID,Item Name,Category,Park ID,SKU,Base Price,Cost Type,Applies To,Active\n';
    const csvRows = items.map(item => {
      return [
        item.documentId,
        `"${item.itemName.replace(/"/g, '""')}"`,
        item.category,
        item.parkId || 'Global',
        item.sku || '(none)',
        item.basePrice,
        item.costType,
        item.appliesTo,
        item.active ? 'Yes' : 'No'
      ].join(',');
    }).join('\n');
    
    fs.writeFileSync(csvPath, csvHeader + csvRows);
    console.log(`📊 CSV export saved to: ${csvPath}`);
    console.log('   (Can be opened in Excel/Google Sheets)');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
exportFullCatalog();
