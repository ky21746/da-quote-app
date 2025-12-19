import { ManualPricingLineItem, TripDraft } from '../types/ui';
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
} from '../data/catalogHelpers';

/**
 * Generate initial manual pricing line items from trip draft
 * All prices start as null - user must enter manually
 */
export function generateManualPricingLines(trip: TripDraft): ManualPricingLineItem[] {
  const lines: ManualPricingLineItem[] = [];
  const parks = trip.parks || [];

  for (const card of parks) {
    const parkName = getParkName(card.parkId);

    // Arrival / Aviation
    if (card.arrival) {
      const option = getArrivalOption(card.arrival);
      if (option) {
        lines.push({
          id: `line_${card.id}_arrival`,
          park: parkName,
          category: 'Aviation',
          itemName: option.name,
          basePrice: null,
          costType: '',
          showTotal: true,
          showPerPerson: true,
          optedOut: false,
        });
      }
    }

    // Lodging
    if (card.lodging) {
      const option = getLodgingOption(card.lodging);
      if (option) {
        lines.push({
          id: `line_${card.id}_lodging`,
          park: parkName,
          category: 'Lodging',
          itemName: option.name,
          basePrice: null,
          costType: '',
          showTotal: true,
          showPerPerson: true,
          optedOut: false,
        });
      }
    }

    // Transportation
    if (card.transport) {
      const option = getTransportOption(card.transport);
      if (option) {
        lines.push({
          id: `line_${card.id}_transport`,
          park: parkName,
          category: 'Vehicle',
          itemName: option.name,
          basePrice: null,
          costType: '',
          showTotal: true,
          showPerPerson: true,
          optedOut: false,
        });
      }
    }

    // Activities
    const activities = getActivityOptions(card.activities);
    activities.forEach((activity, idx) => {
      lines.push({
        id: `line_${card.id}_activity_${idx}`,
        park: parkName,
        category: 'Activities',
        itemName: activity.name,
        basePrice: null,
        costType: '',
        showTotal: true,
        showPerPerson: true,
        optedOut: false,
      });
    });

    // Extras
    const extras = getExtraOptions(card.extras);
    extras.forEach((extra, idx) => {
      lines.push({
        id: `line_${card.id}_extra_${idx}`,
        park: parkName,
        category: 'Extras',
        itemName: extra.name,
        basePrice: null,
        costType: '',
        showTotal: true,
        showPerPerson: true,
        optedOut: false,
      });
    });

    // Logistics - Arrival Between Parks
    if (card.logistics?.arrival) {
      const option = getLogisticsArrivalOption(card.logistics.arrival);
      if (option) {
        lines.push({
          id: `line_${card.id}_log_arrival`,
          park: parkName,
          category: 'Aviation',
          itemName: option.name,
          basePrice: null,
          costType: '',
          showTotal: true,
          showPerPerson: true,
          optedOut: false,
        });
      }
    }

    // Logistics - Vehicle
    if (card.logistics?.vehicle) {
      const option = getLogisticsVehicleOption(card.logistics.vehicle);
      if (option) {
        lines.push({
          id: `line_${card.id}_log_vehicle`,
          park: parkName,
          category: 'Vehicle',
          itemName: option.name,
          basePrice: null,
          costType: '',
          showTotal: true,
          showPerPerson: true,
          optedOut: false,
        });
      }
    }

    // Logistics - Internal Movements
    const internalMovements = card.logistics
      ? getLogisticsInternalOptions(card.logistics.internalMovements)
      : [];
    internalMovements.forEach((movement, idx) => {
      lines.push({
        id: `line_${card.id}_log_internal_${idx}`,
        park: parkName,
        category: 'Parks',
        itemName: movement.name,
        basePrice: null,
        costType: '',
        showTotal: true,
        showPerPerson: true,
        optedOut: false,
      });
    });
  }

  return lines;
}

/**
 * Calculate line total based on cost type
 */
export function calculateLineTotal(
  line: ManualPricingLineItem,
  travelers: number,
  days: number,
  nights: number
): number {
  if (line.optedOut || line.basePrice === null || line.costType === '') {
    return 0;
  }

  const basePrice = line.basePrice;

  switch (line.costType) {
    case 'fixed_group':
      return basePrice;

    case 'fixed_per_day':
      return basePrice * days;

    case 'per_person':
      return basePrice * travelers;

    case 'per_person_per_day':
      return basePrice * travelers * days;

    case 'per_night':
      return basePrice * nights;

    case 'per_night_per_person':
      return basePrice * travelers * nights;

    case 'per_guide':
      return basePrice;

    default:
      return 0;
  }
}

/**
 * Calculate grand total from all lines
 */
export function calculateGrandTotal(
  lines: ManualPricingLineItem[],
  travelers: number,
  days: number,
  nights: number
): number {
  return lines.reduce((sum, line) => {
    return sum + calculateLineTotal(line, travelers, days, nights);
  }, 0);
}

