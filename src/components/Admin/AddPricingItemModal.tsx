import React, { useState, useEffect } from 'react';
import { PricingItem, PricingCategory, ManualCostType } from '../../types/ui';
import { Button, Input, Select } from '../common';
import { getParks } from '../../utils/parks';

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
  // Reset form when modal opens/closes or editingItem changes
  const getInitialFormData = (): Omit<PricingItem, 'id'> => {
    if (editingItem) {
      return {
        parkId: editingItem.parkId,
        category: editingItem.category,
        itemName: editingItem.itemName,
        basePrice: editingItem.basePrice,
        costType: editingItem.costType,
        capacity: editingItem.capacity,
        appliesTo: editingItem.appliesTo,
        notes: editingItem.notes || '',
        active: editingItem.active,
        sku: editingItem.sku || '',
      };
    }
    return {
      parkId: null,
      category: 'Aviation',
      itemName: '',
      basePrice: 0,
      costType: 'fixed_group',
      capacity: undefined,
      appliesTo: 'Global',
      notes: '',
      active: true,
      sku: '',
    };
  };

  const [formData, setFormData] = useState<Omit<PricingItem, 'id'>>(getInitialFormData);
  const [appliesTo, setAppliesTo] = useState<'Global' | 'Park'>(
    editingItem?.appliesTo || 'Global'
  );

  // Reset form when modal opens/closes or editingItem changes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setFormData({
          parkId: editingItem.parkId || null,
          category: editingItem.category,
          itemName: editingItem.itemName,
          basePrice: editingItem.basePrice,
          costType: editingItem.costType,
          capacity: editingItem.capacity,
          appliesTo: editingItem.appliesTo,
          notes: editingItem.notes || '',
          active: editingItem.active,
          sku: editingItem.sku || '',
        });
        setAppliesTo(editingItem.appliesTo);
      } else {
        setFormData({
          parkId: null,
          category: 'Aviation',
          itemName: '',
          basePrice: 0,
          costType: 'fixed_group',
          capacity: undefined,
          appliesTo: 'Global',
          notes: '',
          active: true,
          sku: '',
        });
        setAppliesTo('Global');
      }
    }
  }, [isOpen, editingItem]);

  const categoryOptions: Array<{ value: PricingCategory; label: string }> = [
    { value: 'Aviation', label: 'Aviation' },
    { value: 'Lodging', label: 'Lodging' },
    { value: 'Vehicle', label: 'Vehicle' },
    { value: 'Activities', label: 'Activities' },
    { value: 'Park Fees', label: 'Park Fees' },
    { value: 'Permits', label: 'Permits' },
    { value: 'Extras', label: 'Extras' },
    { value: 'Logistics', label: 'Logistics' },
  ];

  const costTypeOptions: Array<{ value: ManualCostType; label: string }> = [
    { value: 'fixed_group', label: 'Fixed – Group' },
    { value: 'fixed_per_day', label: 'Fixed – Per Day' },
    { value: 'per_person', label: 'Per Person' },
    { value: 'per_person_per_day', label: 'Per Person Per Day' },
    { value: 'per_night', label: 'Per Night' },
    { value: 'per_night_per_person', label: 'Per Night Per Person' },
    { value: 'per_guide', label: 'Per Guide' },
  ];

  const parkOptions = [
    { value: '', label: 'Select park...' },
    ...getParks().map((park) => ({ value: park.id, label: park.label })),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Strict validation
    if (!formData.itemName.trim()) {
      alert('Item name is required');
      return;
    }
    if (formData.basePrice <= 0) {
      alert('Base price must be greater than 0');
      return;
    }
    if (!formData.costType) {
      alert('Cost type is required');
      return;
    }
    if (!formData.category) {
      alert('Category is required');
      return;
    }
    if (appliesTo === 'Park' && !formData.parkId) {
      alert('Park is required for Park items');
      return;
    }

    // Prepare item data
    const itemData: Omit<PricingItem, 'id'> = {
      parkId: appliesTo === 'Park' ? formData.parkId : null,
      category: formData.category,
      itemName: formData.itemName.trim(),
      basePrice: formData.basePrice,
      costType: formData.costType,
      capacity: Number.isFinite(Number(formData.capacity)) ? Number(formData.capacity) : undefined,
      appliesTo,
      notes: formData.notes?.trim() || undefined,
      active: formData.active,
      sku: formData.sku?.trim() || undefined,
    };

    // Save and close
    onSave(itemData);
    // Note: onSave is async, but we close modal immediately for UX
    // The actual save happens in PricingCatalogPage.handleSave
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
                  setAppliesTo(value as 'Global' | 'Park');
                  if (value === 'Global') {
                    setFormData({ ...formData, parkId: null });
                  }
                }}
                options={[
                  { value: 'Global', label: 'Global' },
                  { value: 'Park', label: 'Park' },
                ]}
                required
              />

              {appliesTo === 'Park' && (
                <Select
                  label="Park"
                  value={formData.parkId || ''}
                  onChange={(value) => {
                    // CRITICAL: parkId must be string matching PARKS[].id
                    setFormData({ ...formData, parkId: value || null });
                  }}
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
                label="SKU (Optional)"
                type="text"
                value={formData.sku || ''}
                onChange={(value) =>
                  setFormData({ ...formData, sku: value as string })
                }
                placeholder="Enter SKU"
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
                label="Capacity (optional)"
                type="number"
                value={typeof formData.capacity === 'number' ? formData.capacity : ''}
                onChange={(value) => {
                  const numValue = Number(value);
                  if (!Number.isFinite(numValue) || numValue <= 0) {
                    setFormData({ ...formData, capacity: undefined });
                    return;
                  }
                  setFormData({ ...formData, capacity: numValue });
                }}
                min={1}
                step="1"
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

