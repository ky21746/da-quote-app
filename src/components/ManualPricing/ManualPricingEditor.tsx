import React, { useState, useEffect } from 'react';
import { LineItemDraft, PricingMode } from '../../types/ui';
import { Input, Select, Button } from '../common';

interface ManualPricingEditorProps {
  lineItems: LineItemDraft[];
  participants: number;
  onChange: (items: LineItemDraft[]) => void;
}

const CATEGORIES = [
  'accommodation',
  'transportation',
  'activities',
  'meals',
  'permits',
  'guide',
  'other',
];

export const ManualPricingEditor: React.FC<ManualPricingEditorProps> = ({
  lineItems,
  participants,
  onChange,
}) => {
  const [localItems, setLocalItems] = useState<LineItemDraft[]>(lineItems);

  useEffect(() => {
    setLocalItems(lineItems);
  }, [lineItems]);

  const updateItem = (id: string, updates: Partial<LineItemDraft>) => {
    const updated = localItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setLocalItems(updated);
    onChange(updated);
  };

  const addLine = () => {
    const newItem: LineItemDraft = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category: '',
      description: '',
      pricingMode: 'PER_PERSON',
      unitPrice: 0,
      quantity: 1,
      participants,
    };
    const updated = [...localItems, newItem];
    setLocalItems(updated);
    onChange(updated);
  };

  const duplicateLine = (id: string) => {
    const item = localItems.find((i) => i.id === id);
    if (!item) return;

    const duplicated: LineItemDraft = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    const updated = [...localItems, duplicated];
    setLocalItems(updated);
    onChange(updated);
  };

  const removeLine = (id: string) => {
    const updated = localItems.filter((item) => item.id !== id);
    setLocalItems(updated);
    onChange(updated);
  };

  const calculateLineTotal = (item: LineItemDraft): number => {
    if (item.pricingMode === 'PER_PERSON') {
      return item.unitPrice * item.participants;
    } else {
      return item.unitPrice * item.quantity;
    }
  };

  const calculatePerPerson = (item: LineItemDraft): number => {
    const total = calculateLineTotal(item);
    return participants > 0 ? total / participants : 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Manual Pricing</h2>
        <Button onClick={addLine} variant="primary">
          Add Line Item
        </Button>
      </div>

      {localItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No line items yet. Click "Add Line Item" to start.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {localItems.map((item, index) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-600">
                  Line {index + 1}
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => duplicateLine(item.id)}
                    variant="secondary"
                    type="button"
                  >
                    Duplicate
                  </Button>
                  <Button
                    onClick={() => removeLine(item.id)}
                    variant="secondary"
                    type="button"
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Category"
                  value={item.category}
                  onChange={(value) => updateItem(item.id, { category: value })}
                  options={[
                    { value: '', label: 'Select category...' },
                    ...CATEGORIES.map((cat) => ({
                      value: cat,
                      label: cat.charAt(0).toUpperCase() + cat.slice(1),
                    })),
                  ]}
                  required
                />

                <Input
                  label="Description"
                  value={item.description}
                  onChange={(value) =>
                    updateItem(item.id, { description: value as string })
                  }
                  placeholder="Enter description"
                  required
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing Mode
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`pricing-${item.id}`}
                        value="PER_PERSON"
                        checked={item.pricingMode === 'PER_PERSON'}
                        onChange={(e) =>
                          updateItem(item.id, {
                            pricingMode: e.target.value as PricingMode,
                          })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Per Person</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`pricing-${item.id}`}
                        value="PER_UNIT"
                        checked={item.pricingMode === 'PER_UNIT'}
                        onChange={(e) =>
                          updateItem(item.id, {
                            pricingMode: e.target.value as PricingMode,
                          })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Fixed (Per Unit)</span>
                    </label>
                  </div>
                </div>

                <Input
                  label="Unit Price"
                  type="number"
                  value={item.unitPrice}
                  onChange={(value) =>
                    updateItem(item.id, { unitPrice: value as number })
                  }
                  min={0}
                  step="0.01"
                  required
                />

                {item.pricingMode === 'PER_UNIT' && (
                  <Input
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(value) =>
                      updateItem(item.id, { quantity: value as number })
                    }
                    min={1}
                    required
                  />
                )}

                {item.pricingMode === 'PER_PERSON' && (
                  <div className="flex items-end">
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Participants
                      </label>
                      <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                        {participants} (from trip)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600">Line Total: </span>
                  <span className="text-lg font-semibold text-gray-800">
                    ${calculateLineTotal(item).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Per Person: </span>
                  <span className="text-base font-medium text-gray-700">
                    ${calculatePerPerson(item).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

