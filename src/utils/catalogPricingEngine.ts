import { TripDraft, PricingItem, ManualCostType } from '../types/ui';
import { getPricingItemById, getPricingItemsByIds } from './pricingCatalogHelpers';
import { getParkLabel } from '../constants/parks';
import { getParks } from './parks';

export interface PricingLineItem {
  id: string;
  park: string;
  category: string;
  itemName: string;
  basePrice: number;
  costType: ManualCostType;
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
  const parks = trip.parks || [];
  const travelers = trip.travelers;
  const days = trip.days;

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
        const { total, explanation } = calculateItemTotal(item, travelers, days, parkNights);
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
        const { total, explanation } = calculateItemTotal(item, travelers, days, parkNights);
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
        const { total, explanation } = calculateItemTotal(item, travelers, days, parkNights);
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
      const { total, explanation } = calculateItemTotal(item, travelers, days, parkNights);
      breakdown.push({
        id: `line_${card.id}_activity_${idx}`,
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

    // Extras
    const extraItems = getPricingItemsByIds(pricingItems, card.extras);
    extraItems.forEach((item, idx) => {
      const { total, explanation } = calculateItemTotal(item, travelers, days, parkNights);
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
          const { total, explanation } = calculateItemTotal(item, travelers, days, parkNights);
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
          const { total, explanation } = calculateItemTotal(item, travelers, days, parkNights);
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
        const { total, explanation } = calculateItemTotal(item, travelers, days, parkNights);
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
  nights: number
): { total: number; explanation: string } {
  let total = 0;
  let explanation = '';

  switch (item.costType) {
    case 'fixed_group':
      total = item.basePrice;
      explanation = `${item.basePrice} (fixed group)`;
      break;

    case 'fixed_per_day':
      total = item.basePrice * days;
      explanation = `${item.basePrice} × ${days} days`;
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
      explanation = `${item.basePrice} × ${travelers} travelers × ${nights} nights`;
      break;

    default:
      total = 0;
      explanation = 'Unknown cost type';
  }

  return { total, explanation };
}

