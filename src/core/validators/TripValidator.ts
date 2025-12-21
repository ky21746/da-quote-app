import { Trip } from '../domain/entities';
import { ValidationResult, ValidationError, ValidationWarning } from './types';

export class TripValidator {
  validateCompleteness(trip: Trip): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!trip.destination || trip.destination.trim() === '') {
      errors.push({
        field: 'destination',
        message: 'Trip destination is required',
      });
    }

    if (trip.travelers < 1) {
      errors.push({
        field: 'travelers',
        message: 'Number of travelers must be at least 1',
      });
    }

    if (trip.days.length === 0) {
      errors.push({
        field: 'days',
        message: 'Trip must have at least one day',
      });
    }

    if (trip.days.length !== trip.dateRange.getDays()) {
      warnings.push({
        field: 'days',
        message: `Number of days (${trip.days.length}) does not match date range (${trip.dateRange.getDays()} days)`,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  validateDaySelections(trip: Trip): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const sortedDays = [...trip.days].sort((a, b) => a.date.getTime() - b.date.getTime());

    for (let i = 0; i < sortedDays.length; i++) {
      const day = sortedDays[i];

      if (!trip.dateRange.includes(day.date)) {
        errors.push({
          field: `days[${i}].date`,
          message: `Day date ${day.date.toISOString()} is outside trip date range`,
        });
      }

      if (i > 0) {
        const prevDay = sortedDays[i - 1];
        const dayDiff = Math.ceil(
          (day.date.getTime() - prevDay.date.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (dayDiff > 1) {
          warnings.push({
            field: `days[${i}].date`,
            message: `Gap of ${dayDiff} days detected between days`,
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  validateAll(trip: Trip): ValidationResult {
    const completeness = this.validateCompleteness(trip);
    const daySelections = this.validateDaySelections(trip);

    return {
      isValid: completeness.isValid && daySelections.isValid,
      errors: [...completeness.errors, ...daySelections.errors],
      warnings: [...completeness.warnings, ...daySelections.warnings],
    };
  }
}






