import React, { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Download } from 'lucide-react';

export function ExportCatalogButton() {
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState('');

  const exportCatalog = async () => {
    setIsExporting(true);
    setStatus('Fetching items from Firestore...');

    try {
      const snapshot = await getDocs(collection(db, 'pricingCatalog'));
      
      const items: any[] = [];
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

      setStatus(`Found ${items.length} items. Generating files...`);

      // Sort items
      items.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        if ((a.parkId || '') !== (b.parkId || '')) {
          return (a.parkId || '').localeCompare(b.parkId || '');
        }
        return a.itemName.localeCompare(b.itemName);
      });

      // Group by category
      const byCategory: Record<string, any[]> = {};
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

      // Download JSON
      const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = `catalog_full_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(jsonLink);
      jsonLink.click();
      document.body.removeChild(jsonLink);
      URL.revokeObjectURL(jsonUrl);

      // Download CSV
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
      
      const csvBlob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
      const csvUrl = URL.createObjectURL(csvBlob);
      const csvLink = document.createElement('a');
      csvLink.href = csvUrl;
      csvLink.download = `catalog_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(csvLink);
      csvLink.click();
      document.body.removeChild(csvLink);
      URL.revokeObjectURL(csvUrl);

      setStatus(`✅ Exported ${items.length} items successfully!`);
      
      // Show summary in console
      console.log('═══════════════════════════════════════════════════════════');
      console.log('              CATALOG EXPORT SUMMARY');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`Total Items:              ${exportData.summary.totalItems}`);
      console.log(`Items with SKU:           ${exportData.summary.itemsWithSKU}`);
      console.log(`Items missing SKU:        ${exportData.summary.itemsMissingSKU}`);
      console.log(`Active Items:             ${exportData.summary.activeItems}`);
      console.log(`Inactive Items:           ${exportData.summary.inactiveItems}`);
      console.log('\nBY CATEGORY:');
      exportData.summary.byCategory.forEach(cat => {
        console.log(`${cat.category.padEnd(20)} Total: ${cat.count}  |  With SKU: ${cat.withSKU}  |  Missing: ${cat.missingSKU}`);
      });
      console.log('═══════════════════════════════════════════════════════════');

      setTimeout(() => {
        setStatus('');
        setIsExporting(false);
      }, 3000);

    } catch (error) {
      console.error('Export error:', error);
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Export Catalog</h3>
          <p className="text-sm text-gray-600 mt-1">
            Export all pricing catalog items to JSON and CSV files
          </p>
        </div>
        <button
          onClick={exportCatalog}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export Catalog'}
        </button>
      </div>
      
      {status && (
        <div className={`mt-4 p-3 rounded-lg ${
          status.includes('✅') ? 'bg-green-50 text-green-800' :
          status.includes('❌') ? 'bg-red-50 text-red-800' :
          'bg-blue-50 text-blue-800'
        }`}>
          {status}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium mb-2">Export includes:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Full JSON with metadata, summary, and all item details</li>
          <li>CSV file for Excel/Google Sheets</li>
          <li>Document IDs, names, categories, SKUs, prices, and more</li>
          <li>Summary statistics by category</li>
        </ul>
      </div>
    </div>
  );
}
