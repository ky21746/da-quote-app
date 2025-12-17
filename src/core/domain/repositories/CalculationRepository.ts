import { Calculation } from '../entities';

export interface CalculationRepository {
  save(calculation: Calculation): Promise<Calculation>;
  getByTripId(tripId: string): Promise<Calculation | null>;
  getById(calculationId: string): Promise<Calculation | null>;
}

