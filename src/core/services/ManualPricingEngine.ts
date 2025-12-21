import { Calculation, CalculationLineItem } from '../domain/entities';
import { Money } from '../domain/valueObjects';
import { LineItemDraft } from '../../types/ui';

/**
 * Manual Pricing Engine - STRICT calculation only
 * NO assumptions, NO inference, NO automatic logic
 * ONLY sums what user explicitly defines
 */
export class ManualPricingEngine {
  /**
   * Calculate total from manual line items
   * Engine ONLY computes sums. Nothing else.
   */
  calculate(lineItems: LineItemDraft[]): Calculation {
    const calculationLineItems: CalculationLineItem[] = [];

    // Iterate LineItemDrafts - NO inference, NO assumptions
    for (const draft of lineItems) {
      let total: Money;

      if (draft.pricingMode === 'PER_PERSON') {
        // PER_PERSON: total = unitPrice * participants
        total = new Money(draft.unitPrice).multiply(draft.participants);
      } else if (draft.pricingMode === 'PER_UNIT') {
        // PER_UNIT: total = unitPrice * quantity
        total = new Money(draft.unitPrice).multiply(draft.quantity);
      } else {
        throw new Error(`Invalid pricing mode: ${draft.pricingMode}`);
      }

      const lineItem: CalculationLineItem = {
        id: draft.id,
        category: draft.category,
        description: draft.description,
        quantity: draft.pricingMode === 'PER_PERSON' ? draft.participants : draft.quantity,
        unitPrice: new Money(draft.unitPrice),
        total,
      };

      calculationLineItems.push(lineItem);
    }

    // Calculate subtotal - simple sum
    const subtotal = calculationLineItems.reduce(
      (sum, item) => sum.add(item.total),
      new Money(0)
    );

    // Calculate taxes (10% for Uganda) - can be made configurable later
    const taxes = subtotal.multiply(0.1);

    // Calculate total
    const total = subtotal.add(taxes);

    return {
      id: this.generateCalculationId(),
      tripId: '', // Will be set by use case
      pricebookVersion: 'manual',
      lineItems: calculationLineItems,
      subtotal,
      taxes,
      total,
      calculatedAt: new Date(),
      metadata: {
        manual: true,
        lineItemCount: lineItems.length,
      },
    };
  }

  private generateCalculationId(): string {
    return `calc_manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}




