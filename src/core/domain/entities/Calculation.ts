import { Money } from '../valueObjects';

export interface CalculationLineItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: Money;
  total: Money;
}

export interface Calculation {
  id: string;
  tripId: string;
  pricebookVersion: string;
  lineItems: CalculationLineItem[];
  subtotal: Money;
  taxes: Money;
  total: Money;
  calculatedAt: Date;
  metadata?: Record<string, unknown>;
}

