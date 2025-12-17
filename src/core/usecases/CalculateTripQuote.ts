import { Trip, Pricebook, Calculation } from '../domain/entities';
import {
  TripRepository,
  PricebookRepository,
  CalculationRepository,
} from '../domain/repositories';
import { PricingEngine } from '../services';
import { TripValidator, PricingValidator } from '../validators';

export interface CalculateTripQuoteInput {
  tripId: string;
  userId: string;
}

export interface CalculateTripQuoteOutput {
  calculation: Calculation;
  validationWarnings: Array<{ field: string; message: string }>;
}

export class CalculateTripQuoteUseCase {
  constructor(
    private tripRepository: TripRepository,
    private pricebookRepository: PricebookRepository,
    private calculationRepository: CalculationRepository,
    private pricingEngine: PricingEngine,
    private tripValidator: TripValidator,
    private pricingValidator: PricingValidator
  ) {}

  async execute(input: CalculateTripQuoteInput): Promise<CalculateTripQuoteOutput> {
    // 1. Load Trip
    const trip = await this.tripRepository.getById(input.tripId, input.userId);
    if (!trip) {
      throw new Error(`Trip ${input.tripId} not found for user ${input.userId}`);
    }

    // 2. Validate Trip completeness
    const tripValidation = this.tripValidator.validateAll(trip);
    if (!tripValidation.isValid) {
      throw new Error(
        `Trip validation failed: ${tripValidation.errors.map((e) => e.message).join(', ')}`
      );
    }

    // 3. Load Pricebook version
    const pricebook = await this.pricebookRepository.getCurrent();
    if (!pricebook) {
      throw new Error('No current pricebook found');
    }

    // 4. Validate pricing consistency
    const pricingValidation = this.pricingValidator.validateConsistency(trip, pricebook);

    // 5. Run pricing engine
    const calculation = this.pricingEngine.calculate(trip, pricebook);

    // 6. Save calculation snapshot
    await this.calculationRepository.save(calculation);

    return {
      calculation,
      validationWarnings: [
        ...tripValidation.warnings,
        ...pricingValidation.warnings,
      ],
    };
  }
}

