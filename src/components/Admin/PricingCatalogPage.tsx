import React, { useState, useMemo } from 'react';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { Button, Select } from '../common';
import { PricingItem, PricingCategory } from '../../types/ui';
import { AddPricingItemModal } from './AddPricingItemModal';
import { MOCK_PARKS } from '../../data/mockCatalog';

export const PricingCatalogPage: React.FC = () => {
  const { items, addItem, updateItem, deleteItem } = usePricingCatalog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PricingItem | null>(null);

  // Filters
  const [parkFilter, setParkFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('active');

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Park filter
      if (parkFilter !== 'all' && item.parkId !== parkFilter) return false;
      
      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      
      // Active filter
      if (activeFilter === 'active' && !item.active) return false;
      if (activeFilter === 'inactive' && item.active) return false;
      
      return true;
    });
  }, [items, parkFilter, categoryFilter, activeFilter]);

  const handleEdit = (item: PricingItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this pricing item?')) {
      deleteItem(id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = (itemData: Omit<PricingItem, 'id'>) => {
    if (editingItem) {
      updateItem(editingItem.id, itemData);
    } else {
      addItem(itemData);
    }
  };

  const categoryOptions: Array<{ value: string; label: string }> = [
    { value: 'all', label: 'All Categories' },
    { value: 'Aviation', label: 'Aviation' },
    { value: 'Lodging', label: 'Lodging' },
    { value: 'Vehicle', label: 'Vehicle' },
    { value: 'Activities', label: 'Activities' },
    { value: 'Park Fees', label: 'Park Fees' },
    { value: 'Extras', label: 'Extras' },
  ];

  const parkOptions = [
    { value: 'all', label: 'All Parks' },
    ...MOCK_PARKS.map((park) => ({ value: park.id, label: park.name })),
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin → Pricing Catalog</h1>
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            + Add Pricing Item
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <Select
            label="Park"
            value={parkFilter}
            onChange={(value) => setParkFilter(value)}
            options={parkOptions}
          />
          <Select
            label="Category"
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value)}
            options={categoryOptions}
          />
          <Select
            label="Status"
            value={activeFilter}
            onChange={(value) => setActiveFilter(value)}
            options={[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </div>

        {/* Pricing Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left">Park / Global</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Category</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Item Name</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Base Price</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Cost Type</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Active</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Notes</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border border-gray-300 px-3 py-4 text-center text-gray-500">
                    No pricing items found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2">
                      {item.appliesTo === 'Global' ? (
                        <span className="text-blue-600 font-medium">Global</span>
                      ) : (
                        <span className="text-gray-600">
                          {MOCK_PARKS.find((p) => p.id === item.parkId)?.name || 'Unknown'}
                        </span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">{item.category}</td>
                    <td className="border border-gray-300 px-3 py-2 font-medium">
                      {item.itemName}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      USD {item.basePrice.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {item.costType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.active}
                        onChange={(e) =>
                          updateItem(item.id, { active: e.target.checked })
                        }
                        className="h-4 w-4"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">
                      {item.notes || '-'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        <AddPricingItemModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleSave}
          editingItem={editingItem}
        />
      </div>
    </div>
  );
};

