import { Calculation, CalculationLineItem } from '../domain/entities';
import { Money } from '../domain/valueObjects';

export class CalculationMapper {
  static toFirestore(calculation: Calculation): Record<string, unknown> {
    return {
      id: calculation.id,
      tripId: calculation.tripId,
      pricebookVersion: calculation.pricebookVersion,
      lineItems: calculation.lineItems.map((item) => ({
        id: item.id,
        category: item.category,
        description: item.description,
        quantity: item.quantity,
        unitPriceAmount: item.unitPrice.amount,
        unitPriceCurrency: item.unitPrice.currency,
        totalAmount: item.total.amount,
        totalCurrency: item.total.currency,
      })),
      subtotalAmount: calculation.subtotal.amount,
      subtotalCurrency: calculation.subtotal.currency,
      taxesAmount: calculation.taxes.amount,
      taxesCurrency: calculation.taxes.currency,
      totalAmount: calculation.total.amount,
      totalCurrency: calculation.total.currency,
      calculatedAt: calculation.calculatedAt.toISOString(),
      metadata: calculation.metadata || {},
    };
  }

  static fromFirestore(data: Record<string, unknown>): Calculation {
    return {
      id: data.id as string,
      tripId: data.tripId as string,
      pricebookVersion: data.pricebookVersion as string,
      lineItems: (data.lineItems as Array<Record<string, unknown>>).map(
        (itemData): CalculationLineItem => ({
          id: itemData.id as string,
          category: itemData.category as string,
          description: itemData.description as string,
          quantity: itemData.quantity as number,
          unitPrice: new Money(
            itemData.unitPriceAmount as number,
            itemData.unitPriceCurrency as string
          ),
          total: new Money(
            itemData.totalAmount as number,
            itemData.totalCurrency as string
          ),
        })
      ),
      subtotal: new Money(
        data.subtotalAmount as number,
        data.subtotalCurrency as string
      ),
      taxes: new Money(data.taxesAmount as number, data.taxesCurrency as string),
      total: new Money(data.totalAmount as number, data.totalCurrency as string),
      calculatedAt: new Date(data.calculatedAt as string),
      metadata: data.metadata as Record<string, unknown> | undefined,
    };
  }
}

