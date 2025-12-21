// Test script - run this to verify Firestore connection
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function testFirestoreConnection() {
  console.log('🧪 Testing Firestore connection...');
  
  try {
    // Test write
    const testItem = {
      itemName: 'TEST_ITEM_DELETE_ME',
      category: 'Aviation',
      basePrice: 999,
      costType: 'fixed_group',
      appliesTo: 'Global',
      parkId: null,
      active: true,
      createdAt: new Date().toISOString()
    };
    
    console.log('📤 Writing test document...');
    const docRef = await addDoc(collection(db, 'pricingCatalog'), testItem);
    console.log('✅ Write successful! Document ID:', docRef.id);
    
    // Test read
    console.log('📥 Reading collection...');
    const snapshot = await getDocs(collection(db, 'pricingCatalog'));
    console.log('✅ Read successful! Documents found:', snapshot.size);
    
    snapshot.docs.forEach(doc => {
      console.log('  -', doc.id, doc.data().itemName);
    });
    
    return { success: true, docId: docRef.id, totalDocs: snapshot.size };
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    return { success: false, error };
  }
}






