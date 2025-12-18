import { Calculation } from '../domain/entities';
import { CalculationRepository } from '../domain/repositories';

export interface SaveCalculationInput {
  calculation: Calculation;
}

export interface SaveCalculationOutput {
  calculation: Calculation;
}

export class SaveCalculationUseCase {
  constructor(private calculationRepository: CalculationRepository) {}

  async execute(input: SaveCalculationInput): Promise<SaveCalculationOutput> {
    const saved = await this.calculationRepository.save(input.calculation);
    return { calculation: saved };
  }
}


