import { TripDraft, PricingItem, ManualCostType } from '../types/ui';
import { getPricingItemById, getPricingItemsByIds } from './pricingCatalogHelpers';
import { getParks } from './parks';

export interface PricingLineItem {
  id: string;
  park: string;
  category: string;
  itemName: string;
  basePrice: number;
  costType: ManualCostType;
  quantity?: number;
  calculatedTotal: number;
  perPerson: number;
  calculationExplanation: string;
}

export interface PricingResult {
  breakdown: PricingLineItem[];
  totals: {
    grandTotal: number;
    perPerson: number;
  };
}

/**
 * Calculate pricing from TripDraft using Pricing Catalog
 */
export function calculatePricingFromCatalog(
  trip: TripDraft,
  pricingItems: PricingItem[]
): PricingResult {
  const breakdown: PricingLineItem[] = [];
  const travelers = trip.travelers;
  const days = trip.days;
  const itemQuantities = trip.itemQuantities || {};

  // Use tripDays if available, otherwise fall back to parks (backward compatibility)
  const tripDays = trip.tripDays || [];
  const parks = trip.parks || [];

  // Calculate from tripDays (new structure)
  if (tripDays.length > 0) {
    // Count nights per park (lodging indicates a night)
    const parkNightsMap = new Map<string, number>();
    
    for (const day of tripDays) {
      if (day.parkId && day.lodging) {
        parkNightsMap.set(day.parkId, (parkNightsMap.get(day.parkId) || 0) + 1);
      }
    }

    for (const day of tripDays) {
      if (!day.parkId) continue;

      const parkName = getParks().find((p) => p.id === day.parkId)?.label || day.parkId;
      const parkNights = parkNightsMap.get(day.parkId) || 0;

      // Park Fees (auto-added, cancelable)
      if (day.parkFees && day.parkFees.length > 0) {
        for (const fee of day.parkFees) {
          const item = getPricingItemById(pricingItems, fee.itemId);
          if (!item) continue;
          if (fee.excluded === true) {
            breakdown.push({
              id: `line_day${day.dayNumber}_park_fee_${fee.itemId}`,
              park: parkName,
              category: item.category,
              itemName: `${item.itemName} — Excluded by user`,
              basePrice: item.basePrice,
              costType: item.costType,
              calculatedTotal: 0,
              perPerson: 0,
              calculationExplanation: 'Excluded by user',
            });
          } else {
            const { total, explanation } = calculateItemTotal(item, travelers, days, 1, itemQuantities);
            breakdown.push({
              id: `line_day${day.dayNumber}_park_fee_${fee.itemId}`,
              park: parkName,
              category: item.category,
              itemName: item.itemName,
              basePrice: item.basePrice,
              costType: item.costType,
              calculatedTotal: total,
              perPerson: travelers > 0 ? total / travelers : 0,
              calculationExplanation: explanation,
            });
          }
        }
      }

      // Arrival to Park
      if (day.arrival) {
        const item = getPricingItemById(pricingItems, day.arrival);
        if (item) {
          const { total, explanation } = calculateItemTotal(item, travelers, days, 1, itemQuantities);
          breakdown.push({
            id: `line_day${day.dayNumber}_arrival`,
            park: parkName,
            category: item.category,
            itemName: item.itemName,
            basePrice: item.basePrice,
            costType: item.costType,
            calculatedTotal: total,
            perPerson: travelers > 0 ? total / travelers : 0,
            calculationExplanation: explanation,
          });
        }
      }

      // Lodging
      if (day.lodging) {
        const item = getPricingItemById(pricingItems, day.lodging);
        if (item) {
          // Check if this is hierarchical lodging with config
          if (item.costType === 'hierarchical_lodging' && day.lodgingConfig) {
            const config = day.lodgingConfig;
            const configuredPrice = config.price;
            
            // Get quantity from itemQuantities or default to 1
            const rawQuantity = itemQuantities[item.id] ?? 1;
            const quantity = Number.isFinite(rawQuantity) && rawQuantity > 0 ? Math.floor(rawQuantity) : 1;
            
            // Calculate total based on price type
            let total = 0;
            let explanation = '';
            
            if (config.priceType === 'perRoom' || config.priceType === 'perVilla') {
              total = configuredPrice * quantity;
              explanation = quantity > 1
                ? `${config.roomTypeName}, ${config.seasonName}, ${config.occupancy.replace(/_/g, ' ')} - ${configuredPrice} ${config.priceType === 'perVilla' ? 'per villa' : 'per room'} × ${quantity}`
                : `${config.roomTypeName}, ${config.seasonName}, ${config.occupancy.replace(/_/g, ' ')} - ${configuredPrice} ${config.priceType === 'perVilla' ? 'per villa' : 'per room'}`;
            } else if (config.priceType === 'perPerson') {
              total = configuredPrice * travelers * quantity;
              explanation = quantity > 1
                ? `${config.roomTypeName}, ${config.seasonName}, ${config.occupancy.replace(/_/g, ' ')} - ${configuredPrice} × ${travelers} travelers × ${quantity}`
                : `${config.roomTypeName}, ${config.seasonName}, ${config.occupancy.replace(/_/g, ' ')} - ${configuredPrice} × ${travelers} travelers`;
            }
            
            breakdown.push({
              id: `line_day${day.dayNumber}_lodging`,
              park: parkName,
              category: item.category,
              itemName: `${item.itemName} (${config.roomTypeName})`,
              basePrice: configuredPrice,
              costType: item.costType,
              calculatedTotal: total,
              perPerson: travelers > 0 ? total / travelers : 0,
              calculationExplanation: explanation,
            });
          } else {
            // Regular lodging calculation
            const { total, explanation } = calculateItemTotal(item, travelers, days, 1, itemQuantities);
            breakdown.push({
              id: `line_day${day.dayNumber}_lodging`,
              park: parkName,
              category: item.category,
              itemName: item.itemName,
              basePrice: item.basePrice,
              costType: item.costType,
              calculatedTotal: total,
              perPerson: travelers > 0 ? total / travelers : 0,
              calculationExplanation: explanation,
            });
          }
        }
      }

      // Activities
      if (day.activities && day.activities.length > 0) {
        const activityItems = getPricingItemsByIds(pricingItems, day.activities);
        activityItems.forEach((item, idx) => {
          const { total, explanation, quantity } = calculateItemTotal(item, travelers, days, 1, itemQuantities);
          breakdown.push({
            id: `line_day${day.dayNumber}_activity_${idx}`,
            park: parkName,
            category: item.category,
            itemName: item.itemName,
            basePrice: item.basePrice,
            costType: item.costType,
            quantity: item.category === 'Activities' ? quantity : undefined,
            calculatedTotal: total,
            perPerson: travelers > 0 ? total / travelers : 0,
            calculationExplanation: explanation,
          });
        });
      }

      if (day.freeHandLines && Array.isArray(day.freeHandLines) && day.freeHandLines.length > 0) {
        day.freeHandLines.forEach((line, idx) => {
          const amount = typeof line.amount === 'number' && Number.isFinite(line.amount) ? line.amount : 0;
          const description = (line.description || '').trim();
          if (!description && amount === 0) return;
          breakdown.push({
            id: `line_day${day.dayNumber}_freehand_${idx}`,
            park: parkName,
            category: 'Extras',
            itemName: description || 'One-off expense',
            basePrice: amount,
            costType: 'fixed_group',
            calculatedTotal: amount,
            perPerson: travelers > 0 ? amount / travelers : 0,
            calculationExplanation: 'Free hand item',
          });
        });
      }

      // Extras
      if (day.extras && Array.isArray(day.extras) && day.extras.length > 0) {
        const extraItems = getPricingItemsByIds(pricingItems, day.extras);
        extraItems.forEach((item, idx) => {
          const { total, explanation } = calculateItemTotal(item, travelers, days, 1, itemQuantities);
          breakdown.push({
            id: `line_day${day.dayNumber}_extra_${idx}`,
            park: parkName,
            category: item.category,
            itemName: item.itemName,
            basePrice: item.basePrice,
            costType: item.costType,
            calculatedTotal: total,
            perPerson: travelers > 0 ? total / travelers : 0,
            calculationExplanation: explanation,
          });
        });
      }

      // Logistics - Vehicle
      if (day.logistics?.vehicle) {
        const item = getPricingItemById(pricingItems, day.logistics.vehicle);
        if (item) {
          const { total, explanation } = calculateItemTotal(item, travelers, days, parkNights, itemQuantities);
          breakdown.push({
            id: `line_day${day.dayNumber}_log_vehicle`,
            park: parkName,
            category: item.category,
            itemName: item.itemName,
            basePrice: item.basePrice,
            costType: item.costType,
            calculatedTotal: total,
            perPerson: travelers > 0 ? total / travelers : 0,
            calculationExplanation: explanation,
          });
        }
      }

      // Logistics - Internal Movements
      if (day.logistics?.internalMovements && day.logistics.internalMovements.length > 0) {
        const internalItems = getPricingItemsByIds(pricingItems, day.logistics.internalMovements);
        internalItems.forEach((item, idx) => {
          const { total, explanation } = calculateItemTotal(item, travelers, days, 1, itemQuantities);
          breakdown.push({
            id: `line_day${day.dayNumber}_log_internal_${idx}`,
            park: parkName,
            category: item.category,
            itemName: item.itemName,
            basePrice: item.basePrice,
            costType: item.costType,
            calculatedTotal: total,
            perPerson: travelers > 0 ? total / travelers : 0,
            calculationExplanation: explanation,
          });
        });
      }
    }
  } else {
    // Fallback to parks structure (backward compatibility)
    for (const card of parks) {
    // Get park name - card.parkId is string matching parks list
    const parkName = card.parkId
      ? (getParks().find((p) => p.id === card.parkId)?.label || card.parkId)
      : 'Unknown Park';
    
    // Use nights from this specific park card, fallback to 1 if not set
    const parkNights = card.nights || 1;

    // Arrival / Aviation
    if (card.arrival) {
      const item = getPricingItemById(pricingItems, card.arrival);
      if (item) {
        const { total, explanation } = calculateItemTotal(item, travelers, days, parkNights, itemQuantities);
        breakdown.push({
          id: `line_${card.id}_arrival`,
          park: parkName,
          category: item.category,
          itemName: item.itemName,
          basePrice: item.basePrice,
          costType: item.costType,
          calculatedTotal: total,
          perPerson: travelers > 0 ? total / travelers : 0,
          calculationExplanation: explanation,
        });
      }
    }

    // Lodging - uses park-specific nights
    if (card.lodging) {
      const item = getPricingItemById(pricingItems, card.lodging);
      if (item) {
        const { total, explanation } = calculateItemTotal(item, travelers, days, parkNights, itemQuantities);
        breakdown.push({
          id: `line_${card.id}_lodging`,
          park: parkName,
          category: item.category,
          itemName: item.itemName,
          basePrice: item.basePrice,
          costType: item.costType,
          calculatedTotal: total,
          perPerson: travelers > 0 ? total / travelers : 0,
          calculationExplanation: explanation,
        });
      }
    }

    // Transport
    if (card.transport) {
      const item = getPricingItemById(pricingItems, card.transport);
      if (item) {
        const { total, explanation } = calculateItemTotal(item, travelers, days, parkNights, itemQuantities);
        breakdown.push({
          id: `line_${card.id}_transport`,
          park: parkName,
          category: item.category,
          itemName: item.itemName,
          basePrice: item.basePrice,
          costType: item.costType,
          calculatedTotal: total,
          perPerson: travelers > 0 ? total / travelers : 0,
          calculationExplanation: explanation,
        });
      }
    }

    // Activities
    const activityItems = getPricingItemsByIds(pricingItems, card.activities);
    activityItems.forEach((item, idx) => {
      const { total, explanation, quantity } = calculateItemTotal(item, travelers, days, parkNights, itemQuantities);
      breakdown.push({
        id: `line_${card.id}_activity_${idx}`,
        park: parkName,
        category: item.category,
        itemName: item.itemName,
        basePrice: item.basePrice,
        costType: item.costType,
        quantity: item.category === 'Activities' ? quantity : undefined,
        calculatedTotal: total,
        perPerson: travelers > 0 ? total / travelers : 0,
        calculationExplanation: explanation,
      });
    });

    // Extras
    const extraItems = getPricingItemsByIds(pricingItems, card.extras);
    extraItems.forEach((item, idx) => {
      const { total, explanation } = calculateItemTotal(item, travelers, days, parkNights, itemQuantities);
      breakdown.push({
        id: `line_${card.id}_extra_${idx}`,
        park: parkName,
        category: item.category,
        itemName: item.itemName,
        basePrice: item.basePrice,
        costType: item.costType,
        calculatedTotal: total,
        perPerson: travelers > 0 ? total / travelers : 0,
        calculationExplanation: explanation,
      });
    });

    // Logistics
    if (card.logistics) {
      // Logistics - Arrival
      if (card.logistics.arrival) {
        const item = getPricingItemById(pricingItems, card.logistics.arrival);
        if (item) {
          const { total, explanation } = calculateItemTotal(item, travelers, days, parkNights, itemQuantities);
          breakdown.push({
            id: `line_${card.id}_log_arrival`,
            park: parkName,
            category: item.category,
            itemName: item.itemName,
            basePrice: item.basePrice,
            costType: item.costType,
            calculatedTotal: total,
            perPerson: travelers > 0 ? total / travelers : 0,
            calculationExplanation: explanation,
          });
        }
      }

      // Logistics - Vehicle
      if (card.logistics.vehicle) {
        const item = getPricingItemById(pricingItems, card.logistics.vehicle);
        if (item) {
          const { total, explanation } = calculateItemTotal(item, travelers, days, parkNights, itemQuantities);
          breakdown.push({
            id: `line_${card.id}_log_vehicle`,
            park: parkName,
            category: item.category,
            itemName: item.itemName,
            basePrice: item.basePrice,
            costType: item.costType,
            calculatedTotal: total,
            perPerson: travelers > 0 ? total / travelers : 0,
            calculationExplanation: explanation,
          });
        }
      }

      // Logistics - Internal Movements
      const internalItems = getPricingItemsByIds(pricingItems, card.logistics.internalMovements || []);
      internalItems.forEach((item, idx) => {
        const { total, explanation } = calculateItemTotal(item, travelers, days, parkNights, itemQuantities);
        breakdown.push({
          id: `line_${card.id}_log_internal_${idx}`,
          park: parkName,
          category: item.category,
          itemName: item.itemName,
          basePrice: item.basePrice,
          costType: item.costType,
          calculatedTotal: total,
          perPerson: travelers > 0 ? total / travelers : 0,
          calculationExplanation: explanation,
        });
      });
    }
    }
  }

  const grandTotal = breakdown.reduce((sum, item) => sum + item.calculatedTotal, 0);
  const perPerson = travelers > 0 ? grandTotal / travelers : 0;

  return {
    breakdown,
    totals: {
      grandTotal,
      perPerson,
    },
  };
}

/**
 * Calculate total for a single pricing item
 */
function calculateItemTotal(
  item: PricingItem,
  travelers: number,
  days: number,
  nights: number,
  itemQuantities: Record<string, number>
): { total: number; explanation: string; quantity: number } {
  let total = 0;
  let explanation = '';

  const rawQuantity = itemQuantities[item.id] ?? item.quantity ?? 1;
  const quantity = Number.isFinite(rawQuantity) && rawQuantity > 0 ? Math.floor(rawQuantity) : 1;

  const isActivity = item.category === 'Activities';

  switch (item.costType) {
    case 'fixed_group':
      total = item.basePrice * (isActivity ? 1 : quantity);
      explanation = isActivity
        ? `${item.basePrice} (fixed group)`
        : `${item.basePrice} × ${quantity} (fixed group)`;
      break;

    case 'fixed_per_day':
      total = item.basePrice * days * (isActivity ? 1 : quantity);
      explanation = isActivity
        ? `${item.basePrice} × ${days} days`
        : `${item.basePrice} × ${days} days × ${quantity}`;
      break;

    case 'per_person':
      total = item.basePrice * travelers;
      explanation = `${item.basePrice} × ${travelers} travelers`;
      break;

    case 'per_person_per_day':
      total = item.basePrice * travelers * days;
      explanation = `${item.basePrice} × ${travelers} travelers × ${days} days`;
      break;

    case 'per_night':
      total = item.basePrice * nights;
      explanation = `${item.basePrice} × ${nights} nights`;
      break;

    case 'per_night_per_person':
      total = item.basePrice * travelers * nights;
      explanation = `${item.basePrice} × ${nights} nights × ${travelers} travelers`;
      break;

    case 'per_guide':
      total = item.basePrice;
      explanation = `${item.basePrice} (per guide)`;
      break;

    case 'hierarchical_lodging':
      // Hierarchical lodging should be handled separately with lodgingConfig
      // If we reach here, config is missing
      total = 0;
      explanation = 'Unknown cost type (hierarchical lodging - use Configure button)';
      break;

    default:
      total = 0;
      explanation = 'Unknown cost type';
  }

  if (isActivity && quantity !== 1) {
    total = total * quantity;
    explanation = `${explanation} × ${quantity}`;
  }

  return { total, explanation, quantity };
}

