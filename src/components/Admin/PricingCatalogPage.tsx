import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { Button, Select } from '../common';
import { PricingItem } from '../../types/ui';
import { AddPricingItemModal } from './AddPricingItemModal';
import { CleanupOldAviation } from './CleanupOldAviation';
import { UpdateAviationCategory } from './UpdateAviationCategory';
import { getParks } from '../../utils/parks';
import { formatCurrency } from '../../utils/currencyFormatter';

export const PricingCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, addItem, updateItem, deleteItem, isLoading } = usePricingCatalog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PricingItem | null>(null);

  // Filters - default to 'all' to show all items including newly added ones
  const [parkFilter, setParkFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Park filter - handle null/undefined for Global items
      if (parkFilter !== 'all') {
        if (parkFilter === 'global') {
          // Show only Global items
          if (item.appliesTo !== 'Global') return false;
        } else {
          // Show only items for this specific park
          if (item.parkId !== parkFilter) return false;
        }
      }
      
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

  const handleAddClick = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleSave = async (itemData: Omit<PricingItem, 'id'>) => {
    console.log('💾 handleSave called with:', itemData);
    try {
      if (editingItem) {
        console.log('📝 Updating item:', editingItem.id);
        await updateItem(editingItem.id, itemData);
        console.log('✅ Item updated successfully');
      } else {
        console.log('➕ Adding new item');
        await addItem(itemData);
        console.log('✅ Item added successfully');
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('❌ Error saving item:', error);
      alert(`Error saving item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to trip builder if no history (direct access)
      navigate('/trip/new');
    }
  };

  const categoryOptions: Array<{ value: string; label: string }> = [
    { value: 'all', label: 'All Categories' },
    { value: 'Aviation', label: 'Aviation' },
    { value: 'Lodging', label: 'Lodging' },
    { value: 'Vehicle', label: 'Vehicle' },
    { value: 'Activities', label: 'Activities' },
    { value: 'Park Fees', label: 'Park Fees' },
    { value: 'Permits', label: 'Permits' },
    { value: 'Extras', label: 'Extras' },
  ];

  const parkOptions = [
    { value: 'all', label: 'All Parks' },
    { value: 'global', label: 'Global Items' },
    ...getParks().map((park) => ({ value: park.id, label: park.label })),
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="secondary">
              ← Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Admin → Pricing Catalog</h1>
          </div>
          <div className="flex gap-2 items-center">
            <Button onClick={handleAddClick} variant="primary">
              + Add Pricing Item
            </Button>
          </div>
        </div>

        {/* Cleanup Old Aviation Items - Temporary */}
        <CleanupOldAviation />

        {/* Update Aviation Category - Temporary */}
        <UpdateAviationCategory />

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
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="border border-gray-300 px-3 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading pricing items...
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
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
                          {item.parkId ? (getParks().find((p) => p.id === item.parkId)?.label || item.parkId) : 'Unknown'}
                        </span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">{item.category}</td>
                    <td className="border border-gray-300 px-3 py-2 font-medium">
                      {item.itemName}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      {typeof item.basePrice === 'number' && !isNaN(item.basePrice) ? formatCurrency(item.basePrice) : 'USD 0.00'}
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

