import React, { useState } from 'react';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { Button } from '../common';
import { Download } from 'lucide-react';

export const ExportPricingCatalog: React.FC = () => {
  const { items } = usePricingCatalog();
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);

    try {
      // Group items by category
      const grouped: Record<string, any[]> = {
        parks: [],
        lodges: [],
        activities: [],
        vehicles: [],
        aviation: [],
        parkFees: [],
        permits: [],
        extras: [],
        other: []
      };

      items.forEach(item => {
        const entry = {
          id: item.id,
          name: item.itemName,
          category: item.category,
          parkId: item.parkId,
          appliesTo: item.appliesTo,
          active: item.active,
          sku: item.sku || null
        };

        const category = item.category as string;
        switch (category) {
          case 'Parks':
            grouped.parks.push(entry);
            break;
          case 'Lodging':
            grouped.lodges.push(entry);
            break;
          case 'Activities':
            grouped.activities.push(entry);
            break;
          case 'Vehicle':
            grouped.vehicles.push(entry);
            break;
          case 'Aviation':
            grouped.aviation.push(entry);
            break;
          case 'Park Fees':
            grouped.parkFees.push(entry);
            break;
          case 'Permits':
            grouped.permits.push(entry);
            break;
          case 'Extras':
            grouped.extras.push(entry);
            break;
          default:
            grouped.other.push(entry);
        }
      });

      // Create JSON blob
      const json = JSON.stringify(grouped, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Download file
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pricing_catalog_ids.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show summary
      const summary = `
Exported ${items.length} total items:
- Parks: ${grouped.parks.length}
- Lodges: ${grouped.lodges.length}
- Activities: ${grouped.activities.length}
- Vehicles: ${grouped.vehicles.length}
- Aviation: ${grouped.aviation.length}
- Park Fees: ${grouped.parkFees.length}
- Permits: ${grouped.permits.length}
- Extras: ${grouped.extras.length}
- Other: ${grouped.other.length}
      `.trim();

      alert(summary);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Check console for details.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Export Pricing Catalog IDs</h2>
      <p className="text-gray-600 mb-4">
        Export all pricing catalog items organized by category for Admin Panel setup.
        This will download a JSON file with all item IDs, names, and categories.
      </p>
      <Button
        onClick={handleExport}
        disabled={exporting || items.length === 0}
        className="flex items-center gap-2"
      >
        <Download size={16} />
        {exporting ? 'Exporting...' : `Export ${items.length} Items`}
      </Button>
    </div>
  );
};
