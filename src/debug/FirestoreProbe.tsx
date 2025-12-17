import { useEffect, useState } from 'react';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { testFirestoreConnection } from './testFirestore';

export default function FirestoreProbe() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    console.log('🔍 PROBE: Starting Firestore subscription');
    console.log('🔍 PROBE: db instance:', db);
    
    const ref = collection(db, 'pricingCatalog');
    console.log('🔍 PROBE: Collection reference:', ref);
    
    const unsub = onSnapshot(
      ref,
      (snap) => {
        console.log('🔍 PROBE: Snapshot received:', snap.docs.length, 'documents');
        const data = snap.docs.map((d) => {
          console.log('🔍 PROBE: Document:', d.id, d.data());
          return { id: d.id, ...d.data() };
        });
        setItems(data);
        setLoading(false);
      },
      (error) => {
        console.error('🔍 PROBE: Snapshot error:', error);
        setLoading(false);
      }
    );
    
    return () => {
      console.log('🔍 PROBE: Unsubscribing');
      unsub();
    };
  }, []);

  const add = async () => {
    console.log('🔍 PROBE: Adding item...');
    try {
      const docRef = await addDoc(collection(db, 'pricingCatalog'), {
        itemName: 'PROBE ITEM',
        category: 'Lodging',
        basePrice: 123,
        costType: 'per_night',
        appliesTo: 'Global',
        active: true,
        parkId: null,
        notes: null,
      });
      console.log('🔍 PROBE: Item added with ID:', docRef.id);
    } catch (error) {
      console.error('🔍 PROBE: Add failed:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    console.log('🧪 Starting Firestore connection test...');
    const result = await testFirestoreConnection();
    setTestResult(result);
    setTesting(false);
  };

  const handleCleanup = async () => {
    if (!window.confirm('Delete all test items (TEST_ITEM_DELETE_ME and PROBE ITEM)?')) {
      return;
    }
    
    try {
      const testItems = items.filter(item => 
        item.itemName === 'TEST_ITEM_DELETE_ME' || item.itemName === 'PROBE ITEM'
      );
      
      for (const item of testItems) {
        await deleteDoc(doc(db, 'pricingCatalog', item.id));
        console.log('🗑️ Deleted test item:', item.id);
      }
      
      alert(`Deleted ${testItems.length} test item(s)`);
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h1>🔍 Firestore Probe (Emergency Test)</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={handleTestConnection}
          disabled={testing}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            backgroundColor: testing ? '#ccc' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: testing ? 'not-allowed' : 'pointer',
          }}
        >
          {testing ? 'Testing...' : '🧪 Test Connection'}
        </button>
        
        <button 
          onClick={add}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ADD PROBE ITEM
        </button>
        
        <button 
          onClick={handleCleanup}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          🗑️ Cleanup Test Items
        </button>
      </div>

      {testResult && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px'
        }}>
          <strong>Test Result:</strong>
          <pre style={{ marginTop: '10px', fontSize: '12px' }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Status:</strong> {loading ? 'Loading...' : `Found ${items.length} items`}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Items:</strong>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '400px'
        }}>
          {JSON.stringify(items, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', background: '#fff3cd', borderRadius: '4px' }}>
        <strong>Instructions:</strong>
        <ol>
          <li>Click "ADD PROBE ITEM"</li>
          <li>Item should appear immediately below</li>
          <li>Refresh the page</li>
          <li>Item should STILL appear after refresh</li>
          <li>Check Firebase Console → Firestore → pricingCatalog collection</li>
          <li>Document should exist there</li>
        </ol>
      </div>
    </div>
  );
}

