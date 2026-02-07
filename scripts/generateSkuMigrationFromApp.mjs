/**
 * SKU Migration Generator (Browser-based)
 * Run this in the browser console while logged into the app
 * 
 * Instructions:
 * 1. Open your app in browser (npm start)
 * 2. Go to Admin > Pricing Catalog page
 * 3. Open browser console (F12)
 * 4. Copy and paste this entire script
 * 5. It will download sku_migration.json automatically
 */

(async function generateSkuMigration() {
  console.log('📦 Fetching all items from pricingCatalog...\n');
  
  try {
    // Import Firestore functions
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('../src/lib/firebase');
    
    const snapshot = await getDocs(collection(db, 'pricingCatalog'));
    console.log(`✅ Found ${snapshot.size} documents\n`);

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

    function generateShortName(itemName, category) {
      let shortName = itemName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      
      // For Aviation: try to extract airport codes
      if (category === 'Aviation') {
        const airportCodes = itemName.match(/\b[A-Z]{3}\b/g);
        if (airportCodes && airportCodes.length >= 2) {
          const aircraft = itemName.includes('PC12') ? 'PC12' : 
                          itemName.includes('Caravan') ? 'CARAVAN' : 
                          itemName.includes('Helicopter') ? 'HELI' : 'FLT';
          shortName = `${aircraft}_${airportCodes[0]}_${airportCodes[1]}`;
        }
      }
      
      if (shortName.length > 20) {
        shortName = shortName.substring(0, 20);
      }
      
      return shortName;
    }

    function generateSKU(item) {
      const parkCode = item.parkId && item.parkId !== 'Global' && item.parkId !== 'null' 
        ? item.parkId.toUpperCase() 
        : 'GLOBAL';
      
      const categoryCode = CATEGORY_CODES[item.category] || 'UNKN';
      const shortName = generateShortName(item.itemName, item.category);
      
      return `${parkCode}_${categoryCode}_${shortName}`;
    }

    const migration = [];
    const skuSet = new Set();
    const duplicates = [];

    snapshot.forEach(doc => {
      if (doc.id === 'main') {
        console.log('⚠️  Found "main" document - will be deleted');
        return;
      }

      const data = doc.data();
      
      const item = {
        documentId: doc.id,
        itemName: data.itemName || 'Unnamed',
        category: data.category || 'Uncategorized',
        parkId: data.parkId || 'Global',
        oldSku: data.sku || null,
        newSku: ''
      };

      item.newSku = generateSKU(item);

      if (skuSet.has(item.newSku)) {
        duplicates.push(item.newSku);
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

    migration.sort((a, b) => {
      if (a.parkId !== b.parkId) return a.parkId.localeCompare(b.parkId);
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.itemName.localeCompare(b.itemName);
    });

    // Download JSON
    const blob = new Blob([JSON.stringify(migration, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sku_migration.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('              SKU MIGRATION SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total Items:              ${migration.length}`);
    console.log(`SKUs Generated:           ${migration.length}`);
    console.log(`Items with Old SKU:       ${migration.filter(m => m.oldSku).length}`);
    console.log(`Items without Old SKU:    ${migration.filter(m => !m.oldSku).length}`);
    console.log(`Duplicate Conflicts:      ${duplicates.length}`);
    console.log('\n✅ sku_migration.json downloaded!');
    console.log('\nSample SKUs (first 10):');
    migration.slice(0, 10).forEach(item => {
      console.log(`${item.oldSku || '(none)'} → ${item.newSku}`);
      console.log(`  ${item.itemName} (${item.parkId})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
