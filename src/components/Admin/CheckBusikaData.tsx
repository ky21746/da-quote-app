/**
 * Temporary component to check Busika data in Firestore
 */

import React, { useState, useEffect } from 'react';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { getCatalogItemsForPark } from '../../utils/pricingCatalogHelpers';
import { runImport as runBusikaImport } from '../../data/seed/importBusika';
import { runImport as runActivitiesImport } from '../../data/seed/importBusikaActivitiesOnly';
import { Button } from '../common';

export const CheckBusikaData: React.FC = () => {
  const { items, isLoading } = usePricingCatalog();
  const [isReimporting, setIsReimporting] = useState(false);
  const [busikaData, setBusikaData] = useState<{
    all: number;
    activities: number;
    parkFees: number;
    lodging: number;
    logistics: number;
    activitiesList: Array<{ id: string; name: string; active: boolean }>;
  } | null>(null);

  useEffect(() => {
    if (!isLoading && items.length > 0) {
      const busikaItems = items.filter((item) => item.parkId === 'BUSIKA');
      const activities = busikaItems.filter((item) => item.category === 'Activities');
      const parkFees = busikaItems.filter((item) => item.category === 'Park Fees');
      const lodging = busikaItems.filter((item) => item.category === 'Lodging');
      const logistics = busikaItems.filter((item) => item.category === 'Logistics');

      // Also check filtered items
      const filteredActivities = getCatalogItemsForPark(items, 'BUSIKA', 'Activities');

      setBusikaData({
        all: busikaItems.length,
        activities: activities.length,
        parkFees: parkFees.length,
        lodging: lodging.length,
        logistics: logistics.length,
        activitiesList: activities.map((item) => ({
          id: item.id,
          name: item.itemName,
          active: item.active,
        })),
      });

      // Log to console
      console.log('🔍 Busika Data Check:', {
        totalBusikaItems: busikaItems.length,
        activitiesCount: activities.length,
        parkFeesCount: parkFees.length,
        lodgingCount: lodging.length,
        logisticsCount: logistics.length,
        filteredActivitiesCount: filteredActivities.length,
        allBusikaItems: busikaItems.map((i) => ({
          id: i.id,
          category: i.category,
          name: i.itemName,
          parkId: i.parkId,
          active: i.active,
        })),
        filteredActivities: filteredActivities.map((i) => ({
          id: i.id,
          name: i.itemName,
          parkId: i.parkId,
          active: i.active,
        })),
      });
    }
  }, [items, isLoading]);

  if (isLoading) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-4">
      <h3 className="font-bold mb-2">Busika Data Check</h3>
      {busikaData ? (
        <div className="text-sm space-y-1">
          <p><strong>Total Busika items:</strong> {busikaData.all}</p>
          <p><strong>Activities:</strong> {busikaData.activities} (expected: 30)</p>
          <p><strong>Park Fees:</strong> {busikaData.parkFees} (expected: 2)</p>
          <p><strong>Lodging:</strong> {busikaData.lodging} (expected: 1)</p>
          <p><strong>Logistics:</strong> {busikaData.logistics} (expected: 1)</p>
          {busikaData.activitiesList.length > 0 && (
            <div className="mt-2">
              <p><strong>Activities found:</strong></p>
              <ul className="list-disc list-inside ml-2">
                {busikaData.activitiesList.slice(0, 10).map((act) => (
                  <li key={act.id} className="text-xs">
                    {act.name} {act.active ? '✅' : '❌'}
                  </li>
                ))}
                {busikaData.activitiesList.length > 10 && (
                  <li className="text-xs">... and {busikaData.activitiesList.length - 10} more</li>
                )}
              </ul>
            </div>
          )}
          {busikaData.activities === 0 && (
            <div className="mt-2">
              <p className="text-red-600 font-bold">⚠️ No Activities found! Check console for details.</p>
              <div className="mt-2 flex gap-2">
                <Button
                  onClick={async () => {
                    setIsReimporting(true);
                    try {
                      console.log('🔄 Re-importing Busika Activities ONLY...');
                      console.log('📋 Total items to import:', 30);
                      const result = await runActivitiesImport();
                      console.log('📊 Final result:', result);
                      alert(`Import completed!\nSuccess: ${result.success}\nSkipped: ${result.skipped}\nErrors: ${result.errors.length}\n\nCheck console for details.`);
                      // Reload page after import to refresh data
                      setTimeout(() => window.location.reload(), 2000);
                    } catch (error) {
                      console.error('❌ Re-import failed:', error);
                      alert(`Import failed! Check console for details.\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
                      setIsReimporting(false);
                    }
                  }}
                  disabled={isReimporting}
                >
                  {isReimporting ? 'Importing...' : 'Import Activities ONLY'}
                </Button>
                <Button
                  onClick={async () => {
                    setIsReimporting(true);
                    try {
                      console.log('🔄 Re-importing ALL Busika Data...');
                      await runBusikaImport();
                      // Reload page after import to refresh data
                      setTimeout(() => window.location.reload(), 2000);
                    } catch (error) {
                      console.error('Re-import failed:', error);
                      setIsReimporting(false);
                    }
                  }}
                  disabled={isReimporting}
                  variant="secondary"
                >
                  {isReimporting ? 'Importing...' : 'Re-import All Busika'}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm">No data loaded yet</p>
      )}
    </div>
  );
};

