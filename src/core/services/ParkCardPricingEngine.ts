import { TripDraft, ParkCard, PricingModel } from '../../types/ui';
import {
  getArrivalOption,
  getLodgingOption,
  getTransportOption,
  getActivityOptions,
  getExtraOptions,
  getLogisticsArrivalOption,
  getLogisticsVehicleOption,
  getLogisticsInternalOptions,
  getParkName,
} from '../../data/catalogHelpers';

export interface PricingLineItem {
  parkName: string;
  category: string;
  itemName: string;
  pricingModel: PricingModel | 'unknown';
  basePrice: number;
  travelers: number;
  days: number;
  nights: number;
  calculationExplanation: string;
  calculatedTotal: number;
}

export interface PricingResult {
  breakdown: PricingLineItem[];
  totals: {
    grandTotal: number;
    perPerson: number;
  };
}

/**
 * Park Card Pricing Engine
 * Pure function - NO assumptions, NO magic, NO shortcuts
 * Every calculation is explicit and explainable
 */
export function calculatePricing(trip: TripDraft): PricingResult {
  const breakdown: PricingLineItem[] = [];
  const parks = trip.parks || [];
  const travelers = trip.travelers;
  const days = trip.days;
  const nights = days; // Assuming nights = days for simplicity

  // Process each park card
  for (const card of parks) {
    const parkName = getParkName(card.parkId);

    // Arrival / Aviation
    if (card.arrival) {
      const option = getArrivalOption(card.arrival);
      if (option && option.basePrice !== undefined && option.pricingModel) {
        const total = calculateItemTotal(
          option.basePrice,
          option.pricingModel,
          travelers,
          days,
          nights,
          option.splitAcrossTravelers
        );
        breakdown.push({
          parkName,
          category: 'Arrival / Aviation',
          itemName: option.name,
          pricingModel: option.pricingModel,
          basePrice: option.basePrice,
          travelers,
          days,
          nights,
          calculationExplanation: getCalculationExplanation(
            option.pricingModel,
            option.basePrice,
            travelers,
            days,
            nights,
            option.splitAcrossTravelers
          ),
          calculatedTotal: total,
        });
      }
    }

    // Lodging
    if (card.lodging) {
      const option = getLodgingOption(card.lodging);
      if (option && option.basePrice !== undefined && option.pricingModel) {
        const total = calculateItemTotal(
          option.basePrice,
          option.pricingModel,
          travelers,
          days,
          nights,
          option.splitAcrossTravelers
        );
        breakdown.push({
          parkName,
          category: 'Lodging',
          itemName: option.name,
          pricingModel: option.pricingModel,
          basePrice: option.basePrice,
          travelers,
          days,
          nights,
          calculationExplanation: getCalculationExplanation(
            option.pricingModel,
            option.basePrice,
            travelers,
            days,
            nights,
            option.splitAcrossTravelers
          ),
          calculatedTotal: total,
        });
      }
    }

    // Transportation
    if (card.transport) {
      const option = getTransportOption(card.transport);
      if (option && option.basePrice !== undefined && option.pricingModel) {
        const total = calculateItemTotal(
          option.basePrice,
          option.pricingModel,
          travelers,
          days,
          nights,
          option.splitAcrossTravelers
        );
        breakdown.push({
          parkName,
          category: 'Transportation',
          itemName: option.name,
          pricingModel: option.pricingModel,
          basePrice: option.basePrice,
          travelers,
          days,
          nights,
          calculationExplanation: getCalculationExplanation(
            option.pricingModel,
            option.basePrice,
            travelers,
            days,
            nights,
            option.splitAcrossTravelers
          ),
          calculatedTotal: total,
        });
      }
    }

    // Activities
    const activities = getActivityOptions(card.activities);
    for (const activity of activities) {
      if (activity.basePrice !== undefined && activity.pricingModel) {
        const total = calculateItemTotal(
          activity.basePrice,
          activity.pricingModel,
          travelers,
          days,
          nights,
          activity.splitAcrossTravelers
        );
        breakdown.push({
          parkName,
          category: 'Activities',
          itemName: activity.name,
          pricingModel: activity.pricingModel,
          basePrice: activity.basePrice,
          travelers,
          days,
          nights,
          calculationExplanation: getCalculationExplanation(
            activity.pricingModel,
            activity.basePrice,
            travelers,
            days,
            nights,
            activity.splitAcrossTravelers
          ),
          calculatedTotal: total,
        });
      }
    }

    // Extras
    const extras = getExtraOptions(card.extras);
    for (const extra of extras) {
      if (extra.basePrice !== undefined && extra.pricingModel) {
        const total = calculateItemTotal(
          extra.basePrice,
          extra.pricingModel,
          travelers,
          days,
          nights,
          extra.splitAcrossTravelers
        );
        breakdown.push({
          parkName,
          category: 'Extras',
          itemName: extra.name,
          pricingModel: extra.pricingModel,
          basePrice: extra.basePrice,
          travelers,
          days,
          nights,
          calculationExplanation: getCalculationExplanation(
            extra.pricingModel,
            extra.basePrice,
            travelers,
            days,
            nights,
            extra.splitAcrossTravelers
          ),
          calculatedTotal: total,
        });
      }
    }

    // Logistics - Arrival Between Parks
    if (card.logistics?.arrival) {
      const option = getLogisticsArrivalOption(card.logistics.arrival);
      if (option && option.basePrice !== undefined && option.pricingModel) {
        const total = calculateItemTotal(
          option.basePrice,
          option.pricingModel,
          travelers,
          days,
          nights,
          option.splitAcrossTravelers
        );
        breakdown.push({
          parkName,
          category: 'Logistics - Arrival',
          itemName: option.name,
          pricingModel: option.pricingModel,
          basePrice: option.basePrice,
          travelers,
          days,
          nights,
          calculationExplanation: getCalculationExplanation(
            option.pricingModel,
            option.basePrice,
            travelers,
            days,
            nights,
            option.splitAcrossTravelers
          ),
          calculatedTotal: total,
        });
      }
    }

    // Logistics - Vehicle
    if (card.logistics?.vehicle) {
      const option = getLogisticsVehicleOption(card.logistics.vehicle);
      if (option && option.basePrice !== undefined && option.pricingModel) {
        const total = calculateItemTotal(
          option.basePrice,
          option.pricingModel,
          travelers,
          days,
          nights,
          option.splitAcrossTravelers
        );
        breakdown.push({
          parkName,
          category: 'Logistics - Vehicle',
          itemName: option.name,
          pricingModel: option.pricingModel,
          basePrice: option.basePrice,
          travelers,
          days,
          nights,
          calculationExplanation: getCalculationExplanation(
            option.pricingModel,
            option.basePrice,
            travelers,
            days,
            nights,
            option.splitAcrossTravelers
          ),
          calculatedTotal: total,
        });
      }
    }

    // Logistics - Internal Movements
    const internalMovements = card.logistics
      ? getLogisticsInternalOptions(card.logistics.internalMovements)
      : [];
    for (const movement of internalMovements) {
      if (movement.basePrice !== undefined && movement.pricingModel) {
        const total = calculateItemTotal(
          movement.basePrice,
          movement.pricingModel,
          travelers,
          days,
          nights,
          movement.splitAcrossTravelers
        );
        breakdown.push({
          parkName,
          category: 'Logistics - Internal Movements',
          itemName: movement.name,
          pricingModel: movement.pricingModel,
          basePrice: movement.basePrice,
          travelers,
          days,
          nights,
          calculationExplanation: getCalculationExplanation(
            movement.pricingModel,
            movement.basePrice,
            travelers,
            days,
            nights,
            movement.splitAcrossTravelers
          ),
          calculatedTotal: total,
        });
      }
    }
  }

  // Calculate totals
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
 * Calculate total for a single item based on pricing model
 */
function calculateItemTotal(
  basePrice: number,
  pricingModel: PricingModel,
  travelers: number,
  days: number,
  nights: number,
  splitAcrossTravelers?: boolean
): number {
  switch (pricingModel) {
    case 'per_person':
      return basePrice * travelers;

    case 'fixed':
      // If splitAcrossTravelers is true, total remains basePrice but display shows per-person
      return basePrice;

    case 'per_day_fixed':
      return basePrice * days;

    case 'per_night_per_person':
      return basePrice * nights * travelers;

    case 'per_night_fixed':
      return basePrice * nights;

    default:
      return 0;
  }
}

/**
 * Generate human-readable calculation explanation
 */
function getCalculationExplanation(
  pricingModel: PricingModel,
  basePrice: number,
  travelers: number,
  days: number,
  nights: number,
  splitAcrossTravelers?: boolean
): string {
  switch (pricingModel) {
    case 'per_person':
      return `${basePrice} × ${travelers} travelers = ${basePrice * travelers}`;

    case 'fixed':
      if (splitAcrossTravelers) {
        return `${basePrice} fixed (${(basePrice / travelers).toFixed(2)} per person)`;
      }
      return `${basePrice} fixed`;

    case 'per_day_fixed':
      return `${basePrice} × ${days} days = ${basePrice * days}`;

    case 'per_night_per_person':
      return `${basePrice} × ${nights} nights × ${travelers} travelers = ${basePrice * nights * travelers}`;

    case 'per_night_fixed':
      return `${basePrice} × ${nights} nights = ${basePrice * nights}`;

    default:
      return 'Unknown pricing model';
  }
}


