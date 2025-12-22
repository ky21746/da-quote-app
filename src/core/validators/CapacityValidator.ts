export type CapacityValidationAction =
  | {
      type: 'increase_quantity';
      itemId: string;
      requiredQuantity: number;
    }
  | {
      type: 'replace_item';
      itemId: string;
      alternatives: Array<{ itemId: string; capacity: number }>;
    };

export interface CapacityValidationIssue {
  field: string;
  message: string;
  itemId: string;
  travelers: number;
  capacity: number;
  quantity: number;
  actions: CapacityValidationAction[];
}

export interface CapacityConstrainedCatalogItem {
  id: string;
  category: string;
  costType: string;
  capacity?: number;
}

export interface CapacityValidationInput {
  travelers: number;
  selectedItemIds: string[];
  catalogItems: CapacityConstrainedCatalogItem[];
  quantitiesByItemId?: Record<string, number>;
  defaultQuantitiesByItemId?: Record<string, number>;
}

export interface CapacityValidationResult {
  isValid: boolean;
  issues: CapacityValidationIssue[];
}

const INSUFFICIENT_CAPACITY_MESSAGE =
  'The selected item capacity is insufficient for the number of travelers.';

function isCapacityConstrainedFixedItem(item: CapacityConstrainedCatalogItem): boolean {
  const fixedCostTypes = new Set(['fixed_group', 'fixed_per_day']);
  const physicalCategories = new Set(['Vehicle', 'Aviation', 'Logistics']);
  return (
    fixedCostTypes.has(item.costType) &&
    physicalCategories.has(item.category) &&
    typeof item.capacity === 'number' &&
    Number.isFinite(item.capacity)
  );
}

function getQuantity(
  itemId: string,
  quantitiesByItemId?: Record<string, number>,
  defaultQuantitiesByItemId?: Record<string, number>
): number {
  const q = quantitiesByItemId?.[itemId] ?? defaultQuantitiesByItemId?.[itemId] ?? 1;
  return Number.isFinite(q) && q > 0 ? Math.floor(q) : 1;
}

function getRequiredQuantity(travelers: number, capacity: number): number {
  if (capacity <= 0) return 1;
  return Math.ceil(travelers / capacity);
}

export function validateCapacity(input: CapacityValidationInput): CapacityValidationResult {
  const issues: CapacityValidationIssue[] = [];

  if (!Number.isFinite(input.travelers) || input.travelers < 1) {
    return { isValid: true, issues: [] };
  }

  const selectedUnique = Array.from(new Set(input.selectedItemIds.filter(Boolean)));
  const catalogMap = new Map(input.catalogItems.map((i) => [i.id, i]));

  for (const itemId of selectedUnique) {
    const item = catalogMap.get(itemId);
    if (!item) continue;
    if (!isCapacityConstrainedFixedItem(item)) continue;

    const capacityNum = typeof item.capacity === 'number' ? item.capacity : NaN;
    if (!Number.isFinite(capacityNum) || capacityNum <= 0) {
      issues.push({
        field: 'capacity',
        message: INSUFFICIENT_CAPACITY_MESSAGE,
        itemId,
        travelers: input.travelers,
        capacity: 0,
        quantity: getQuantity(itemId, input.quantitiesByItemId, input.defaultQuantitiesByItemId),
        actions: [],
      });
      continue;
    }

    const quantity = getQuantity(itemId, input.quantitiesByItemId, input.defaultQuantitiesByItemId);
    const totalCapacity = capacityNum * quantity;

    if (input.travelers > totalCapacity) {
      const requiredQuantity = getRequiredQuantity(input.travelers, capacityNum);

      const alternatives = input.catalogItems
        .filter(
          (alt) =>
            alt.id !== itemId &&
            alt.category === item.category &&
            alt.costType === item.costType &&
            Number.isFinite(alt.capacity) &&
            (alt.capacity as number) >= input.travelers
        )
        .map((alt) => ({ itemId: alt.id, capacity: alt.capacity as number }))
        .sort((a, b) => a.capacity - b.capacity);

      const actions: CapacityValidationAction[] = [
        {
          type: 'increase_quantity',
          itemId,
          requiredQuantity,
        },
        {
          type: 'replace_item',
          itemId,
          alternatives,
        },
      ];

      issues.push({
        field: 'capacity',
        message: INSUFFICIENT_CAPACITY_MESSAGE,
        itemId,
        travelers: input.travelers,
        capacity: capacityNum,
        quantity,
        actions,
      });
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
