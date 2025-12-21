import { calculateTripQuoteUseCase } from '../../app/config/dependencies';
import { CalculateTripQuoteInput, CalculateTripQuoteOutput } from './CalculateTripQuote';

/**
 * Main entry point for pricing calculation
 * This is the single entry point for all pricing operations
 *
 * @param tripId - The ID of the trip to calculate pricing for
 * @param userId - The ID of the authenticated user
 * @returns Calculation result with validation warnings
 */
export async function runPricingUsecase(
  tripId: string,
  userId: string
): Promise<CalculateTripQuoteOutput> {
  const input: CalculateTripQuoteInput = { tripId, userId };
  return calculateTripQuoteUseCase.execute(input);
}






