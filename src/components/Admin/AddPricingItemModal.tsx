import React, { useState } from 'react';
import { PricingItem, PricingCategory, ManualCostType } from '../../types/ui';
import { Button, Input, Select } from '../common';
import { MOCK_PARKS } from '../../data/mockCatalog';

interface AddPricingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<PricingItem, 'id'>) => void;
  editingItem?: PricingItem | null;
}

export const AddPricingItemModal: React.FC<AddPricingItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [formData, setFormData] = useState<Omit<PricingItem, 'id'>>({
    parkId: editingItem?.parkId,
    category: editingItem?.category || 'Aviation',
    itemName: editingItem?.itemName || '',
    basePrice: editingItem?.basePrice || 0,
    costType: editingItem?.costType || 'fixed_group',
    appliesTo: editingItem?.appliesTo || 'Global',
    notes: editingItem?.notes || '',
    active: editingItem?.active ?? true,
  });

  const [appliesTo, setAppliesTo] = useState<'Global' | 'Park-specific'>(
    editingItem?.appliesTo || 'Global'
  );

  const categoryOptions: Array<{ value: PricingCategory; label: string }> = [
    { value: 'Aviation', label: 'Aviation' },
    { value: 'Lodging', label: 'Lodging' },
    { value: 'Vehicle', label: 'Vehicle' },
    { value: 'Activities', label: 'Activities' },
    { value: 'Park Fees', label: 'Park Fees' },
    { value: 'Extras', label: 'Extras' },
  ];

  const costTypeOptions: Array<{ value: ManualCostType; label: string }> = [
    { value: 'fixed_group', label: 'Fixed – Group' },
    { value: 'fixed_per_day', label: 'Fixed – Per Day' },
    { value: 'per_person', label: 'Per Person' },
    { value: 'per_person_per_day', label: 'Per Person Per Day' },
    { value: 'per_night_per_person', label: 'Per Night Per Person' },
    { value: 'per_night_fixed', label: 'Per Night – Fixed' },
  ];

  const parkOptions = [
    { value: '', label: 'Select park...' },
    ...MOCK_PARKS.map((park) => ({ value: park.id, label: park.name })),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.itemName.trim()) {
      return;
    }
    if (formData.basePrice <= 0) {
      return;
    }
    if (appliesTo === 'Park-specific' && !formData.parkId) {
      return;
    }

    onSave({
      ...formData,
      appliesTo,
      parkId: appliesTo === 'Park-specific' ? formData.parkId : undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {editingItem ? 'Edit Pricing Item' : 'Add New Pricing Item'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Select
                label="Applies To"
                value={appliesTo}
                onChange={(value) => {
                  setAppliesTo(value as 'Global' | 'Park-specific');
                  if (value === 'Global') {
                    setFormData({ ...formData, parkId: undefined });
                  }
                }}
                options={[
                  { value: 'Global', label: 'Global' },
                  { value: 'Park-specific', label: 'Park-specific' },
                ]}
                required
              />

              {appliesTo === 'Park-specific' && (
                <Select
                  label="Park"
                  value={formData.parkId || ''}
                  onChange={(value) =>
                    setFormData({ ...formData, parkId: value || undefined })
                  }
                  options={parkOptions}
                  required
                />
              )}

              <Select
                label="Category"
                value={formData.category}
                onChange={(value) =>
                  setFormData({ ...formData, category: value as PricingCategory })
                }
                options={categoryOptions}
                required
              />

              <Input
                label="Item Name"
                type="text"
                value={formData.itemName}
                onChange={(value) =>
                  setFormData({ ...formData, itemName: value as string })
                }
                placeholder="Enter item name"
                required
              />

              <Input
                label="Base Price (USD)"
                type="number"
                value={formData.basePrice}
                onChange={(value) =>
                  setFormData({ ...formData, basePrice: value as number })
                }
                min={0}
                step="0.01"
                required
              />

              <Select
                label="Cost Type"
                value={formData.costType}
                onChange={(value) =>
                  setFormData({ ...formData, costType: value as ManualCostType })
                }
                options={costTypeOptions}
                required
              />

              <Input
                label="Notes (optional)"
                type="text"
                value={formData.notes || ''}
                onChange={(value) =>
                  setFormData({ ...formData, notes: value as string })
                }
                placeholder="Internal notes..."
              />

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button type="button" onClick={onClose} variant="secondary">
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingItem ? 'Update' : 'Add'} Item
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

