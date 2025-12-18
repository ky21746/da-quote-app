import { PricingEngine } from '../../core/services';
import { TripValidator, PricingValidator } from '../../core/validators';
import {
  FirebasePricebookRepository,
  FirebaseTripRepository,
  FirebaseCalculationRepository,
} from '../../data/firebase';
import {
  CalculateTripQuoteUseCase,
  SaveCalculationUseCase,
} from '../../core/usecases';

// Initialize repositories
const pricebookRepository = new FirebasePricebookRepository();
const tripRepository = new FirebaseTripRepository();
const calculationRepository = new FirebaseCalculationRepository();

// Initialize services
const pricingEngine = new PricingEngine();

// Initialize validators
const tripValidator = new TripValidator();
const pricingValidator = new PricingValidator();

// Initialize use cases
export const calculateTripQuoteUseCase = new CalculateTripQuoteUseCase(
  tripRepository,
  pricebookRepository,
  calculationRepository,
  pricingEngine,
  tripValidator,
  pricingValidator
);

export const saveCalculationUseCase = new SaveCalculationUseCase(
  calculationRepository
);

// Export repositories for direct access if needed
export { pricebookRepository, tripRepository, calculationRepository };


