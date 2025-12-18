import { Calculation } from '../domain/entities';
import { ManualPricingEngine } from '../services/ManualPricingEngine';
import { LineItemDraft } from '../../types/ui';

export interface CalculateManualPricingInput {
  lineItems: LineItemDraft[];
}

export interface CalculateManualPricingOutput {
  calculation: Calculation;
}

export class CalculateManualPricingUseCase {
  constructor(private manualPricingEngine: ManualPricingEngine) {}

  async execute(input: CalculateManualPricingInput): Promise<CalculateManualPricingOutput> {
    if (input.lineItems.length === 0) {
      throw new Error('At least one line item is required');
    }

    // Validate all line items have required fields
    for (const item of input.lineItems) {
      if (!item.category || !item.description) {
        throw new Error('All line items must have category and description');
      }
      if (item.unitPrice <= 0) {
        throw new Error('Unit price must be greater than 0');
      }
      if (item.pricingMode === 'PER_UNIT' && item.quantity <= 0) {
        throw new Error('Quantity must be greater than 0 for PER_UNIT items');
      }
      if (item.pricingMode === 'PER_PERSON' && item.participants <= 0) {
        throw new Error('Participants must be greater than 0 for PER_PERSON items');
      }
    }

    // Engine ONLY computes sums. Nothing else.
    const calculation = this.manualPricingEngine.calculate(input.lineItems);

    return { calculation };
  }
}



