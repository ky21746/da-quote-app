import { Pricebook, PricebookItem } from '../domain/entities';
import { Money } from '../domain/valueObjects';
import { PricebookVersion } from '../domain/enums';

export class PricebookMapper {
  static toFirestore(pricebook: Pricebook): Record<string, unknown> {
    return {
      id: pricebook.id,
      version: pricebook.version,
      items: pricebook.items.map((item) => ({
        id: item.id,
        category: item.category,
        name: item.name,
        basePriceAmount: item.basePrice.amount,
        basePriceCurrency: item.basePrice.currency,
        perPerson: item.perPerson,
        perDay: item.perDay,
        location: item.location,
        validFrom: item.validFrom.toISOString(),
        validTo: item.validTo?.toISOString(),
      })),
      effectiveFrom: pricebook.effectiveFrom.toISOString(),
      effectiveTo: pricebook.effectiveTo?.toISOString(),
      createdAt: pricebook.createdAt.toISOString(),
      updatedAt: pricebook.updatedAt.toISOString(),
    };
  }

  static fromFirestore(data: Record<string, unknown>): Pricebook {
    return {
      id: data.id as string,
      version: data.version as PricebookVersion,
      items: (data.items as Array<Record<string, unknown>>).map(
        (itemData): PricebookItem => ({
          id: itemData.id as string,
          category: itemData.category as string,
          name: itemData.name as string,
          basePrice: new Money(
            itemData.basePriceAmount as number,
            itemData.basePriceCurrency as string
          ),
          perPerson: itemData.perPerson as boolean,
          perDay: itemData.perDay as boolean,
          location: itemData.location as string | undefined,
          validFrom: new Date(itemData.validFrom as string),
          validTo: itemData.validTo ? new Date(itemData.validTo as string) : undefined,
        })
      ),
      effectiveFrom: new Date(data.effectiveFrom as string),
      effectiveTo: data.effectiveTo ? new Date(data.effectiveTo as string) : undefined,
      createdAt: new Date(data.createdAt as string),
      updatedAt: new Date(data.updatedAt as string),
    };
  }
}



