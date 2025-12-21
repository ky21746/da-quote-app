import { Pricebook, Trip } from '../domain/entities';
import { ValidationResult, ValidationError, ValidationWarning } from './types';

export class PricingValidator {
  validateConsistency(trip: Trip, pricebook: Pricebook): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const now = new Date();
    if (pricebook.effectiveTo && pricebook.effectiveTo < now) {
      warnings.push({
        field: 'pricebook',
        message: 'Pricebook has expired',
      });
    }

    if (pricebook.effectiveFrom > now) {
      warnings.push({
        field: 'pricebook',
        message: 'Pricebook is not yet effective',
      });
    }

    const tripLocations = new Set(trip.days.map((d) => d.location));
    const pricebookLocations = new Set(
      pricebook.items
        .map((item) => item.location)
        .filter((loc): loc is string => loc !== undefined)
    );

    const missingLocations = Array.from(tripLocations).filter(
      (loc) => !pricebookLocations.has(loc)
    );

    if (missingLocations.length > 0) {
      warnings.push({
        field: 'pricebook',
        message: `No pricing found for locations: ${missingLocations.join(', ')}`,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}






