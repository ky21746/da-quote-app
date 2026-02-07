import React, { useState } from 'react';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../common';
import migrationDataJson from '../../sku_migration.json';

interface MigrationItem {
  documentId: string;
  itemName: string;
  category: string;
  parkId: string;
  oldSku: string | null;
  newSku: string;
  action: 'UPDATE' | 'DELETE';
}

const migrationData = migrationDataJson as MigrationItem[];

export const ApplySkuMigrationButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<{
    updated: number;
    deleted: number;
    failed: number;
    errors: Array<{ documentId: string; itemName: string; error: string }>;
  } | null>(null);

  const handleApplyMigration = async () => {
    setIsProcessing(true);
    setProgress({ current: 0, total: migrationData.length });
    
    const migrationResults = {
      updated: 0,
      deleted: 0,
      failed: 0,
      errors: [] as Array<{ documentId: string; itemName: string; error: string }>,
    };

    for (let i = 0; i < migrationData.length; i++) {
      const item = migrationData[i] as MigrationItem;
      setProgress({ current: i + 1, total: migrationData.length });

      try {
        if (item.action === 'DELETE') {
          const docRef = doc(db, 'pricingCatalog', item.documentId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            await deleteDoc(docRef);
            migrationResults.deleted++;
          }
        } else if (item.action === 'UPDATE') {
          const docRef = doc(db, 'pricingCatalog', item.documentId);
          await updateDoc(docRef, { sku: item.newSku });
          migrationResults.updated++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        migrationResults.failed++;
        migrationResults.errors.push({
          documentId: item.documentId,
          itemName: item.itemName,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    setResults(migrationResults);
    setIsProcessing(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setResults(null);
    setProgress({ current: 0, total: 0 });
  };

  if (!isOpen) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              SKU Migration Ready
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Apply standardized SKUs to all {migrationData.length} catalog items.</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>128 items will be updated with new SKUs</li>
                <li>1 invalid document will be deleted</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>
            <div className="mt-4">
              <Button
                onClick={() => setIsOpen(true)}
                variant="primary"
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Review & Apply Migration
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Apply SKU Migration
          </h2>

          {!results && !isProcessing && (
            <>
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  This will update <strong>{migrationData.length} items</strong> in your pricing catalog:
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Item Name</th>
                        <th className="px-3 py-2 text-left">Category</th>
                        <th className="px-3 py-2 text-left">Old SKU</th>
                        <th className="px-3 py-2 text-left">New SKU</th>
                        <th className="px-3 py-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {migrationData.slice(0, 10).map((item: MigrationItem, idx: number) => (
                        <tr key={idx} className="border-t border-gray-200">
                          <td className="px-3 py-2">{item.itemName || '(empty)'}</td>
                          <td className="px-3 py-2">{item.category || '-'}</td>
                          <td className="px-3 py-2 font-mono text-xs">{item.oldSku || '-'}</td>
                          <td className="px-3 py-2 font-mono text-xs text-green-600">{item.newSku}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              item.action === 'DELETE' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.action}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {migrationData.length > 10 && (
                    <p className="text-center text-gray-500 text-sm mt-4">
                      ... and {migrationData.length - 10} more items
                    </p>
                  )}
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">⚠️ Warning</p>
                  <p className="text-red-700 text-sm mt-1">
                    This action will permanently modify your Firestore database. Make sure you have a backup before proceeding.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleClose} variant="secondary">
                  Cancel
                </Button>
                <Button onClick={handleApplyMigration} variant="primary" className="bg-red-600 hover:bg-red-700">
                  Confirm & Apply Migration
                </Button>
              </div>
            </>
          )}

          {isProcessing && (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-lg font-medium text-gray-800 mb-2">
                Processing Migration...
              </p>
              <p className="text-gray-600">
                {progress.current} of {progress.total} items
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {results && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Migration Complete</h3>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">✅ Updated</p>
                    <p className="text-2xl font-bold text-green-600">{results.updated}</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">🗑️ Deleted</p>
                    <p className="text-2xl font-bold text-red-600">{results.deleted}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-800 font-medium">❌ Failed</p>
                    <p className="text-2xl font-bold text-gray-600">{results.failed}</p>
                  </div>
                </div>

                {results.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-800 font-medium mb-2">Errors:</p>
                    <div className="max-h-48 overflow-y-auto">
                      {results.errors.map((err, idx) => (
                        <p key={idx} className="text-sm text-red-700">
                          • {err.itemName} ({err.documentId}): {err.error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {results.failed === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800">
                      🎉 All items migrated successfully! Your catalog now has standardized SKUs.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleClose} variant="primary">
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
