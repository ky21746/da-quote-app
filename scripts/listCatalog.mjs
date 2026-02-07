import admin from 'firebase-admin';

admin.initializeApp({
  projectId: 'discover-africa-quotation-app'
});

const db = admin.firestore();

async function listCatalog() {
  const snapshot = await db.collection('pricingCatalog').get();
  
  console.log('\n📋 PRICING CATALOG ITEMS\n');
  console.log('─'.repeat(120));
  console.log('DOC ID'.padEnd(30) + 'ITEM NAME'.padEnd(40) + 'CATEGORY'.padEnd(20) + 'PARK ID'.padEnd(15) + 'SKU');
  console.log('─'.repeat(120));
  
  const items = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    items.push({
      id: doc.id,
      name: data.itemName || '',
      category: data.category || '',
      parkId: data.parkId || 'Global',
      sku: data.sku || '(none)'
    });
  });
  
  items.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  
  items.forEach(item => {
    const id = item.id.substring(0, 28).padEnd(30);
    const name = item.name.substring(0, 38).padEnd(40);
    const category = item.category.substring(0, 18).padEnd(20);
    const parkId = (item.parkId || 'Global').substring(0, 13).padEnd(15);
    const sku = item.sku;
    console.log(`${id}${name}${category}${parkId}${sku}`);
  });
  
  console.log('─'.repeat(120));
  console.log(`\nTotal: ${items.length} items\n`);
  
  process.exit(0);
}

listCatalog().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
