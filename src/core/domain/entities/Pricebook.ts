import { PricebookVersion } from '../enums';
import { Money } from '../valueObjects';

export interface PricebookItem {
  id: string;
  category: string;
  name: string;
  basePrice: Money;
  perPerson: boolean;
  perDay: boolean;
  location?: string;
  validFrom: Date;
  validTo?: Date;
}

export interface Pricebook {
  id: string;
  version: PricebookVersion;
  items: PricebookItem[];
  effectiveFrom: Date;
  effectiveTo?: Date;
  createdAt: Date;
  updatedAt: Date;
}

