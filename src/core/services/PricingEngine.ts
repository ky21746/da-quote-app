import { Trip, Pricebook, Calculation, CalculationLineItem } from '../domain/entities';
import { Money } from '../domain/valueObjects';
import { DayType } from '../domain/enums';

export class PricingEngine {
  calculate(trip: Trip, pricebook: Pricebook): Calculation {
    const lineItems: CalculationLineItem[] = [];
    const now = new Date();

    // Calculate per-day items
    const dayItems = this.calculateDayItems(trip, pricebook, now);
    lineItems.push(...dayItems);

    // Calculate per-person items
    const personItems = this.calculatePersonItems(trip, pricebook, now);
    lineItems.push(...personItems);

    // Calculate accommodation items
    const accommodationItems = this.calculateAccommodationItems(trip, pricebook, now);
    lineItems.push(...accommodationItems);

    // Calculate activity items
    const activityItems = this.calculateActivityItems(trip, pricebook, now);
    lineItems.push(...activityItems);

    // Calculate subtotal
    const subtotal = lineItems.reduce(
      (sum, item) => sum.add(item.total),
      new Money(0)
    );

    // Calculate taxes (10% for Uganda)
    const taxes = subtotal.multiply(0.1);

    // Calculate total
    const total = subtotal.add(taxes);

    return {
      id: this.generateCalculationId(),
      tripId: trip.id,
      pricebookVersion: pricebook.id,
      lineItems,
      subtotal,
      taxes,
      total,
      calculatedAt: now,
      metadata: {
        travelers: trip.travelers,
        days: trip.days.length,
        destination: trip.destination,
      },
    };
  }

  private calculateDayItems(
    trip: Trip,
    pricebook: Pricebook,
    now: Date
  ): CalculationLineItem[] {
    const items: CalculationLineItem[] = [];
    const applicableItems = pricebook.items.filter(
      (item) => item.perDay && this.isItemValid(item, now)
    );

    for (const pricebookItem of applicableItems) {
      if (pricebookItem.location) {
        const matchingDays = trip.days.filter(
          (day) => day.location === pricebookItem.location
        );
        if (matchingDays.length > 0) {
          items.push({
            id: this.generateLineItemId(),
            category: pricebookItem.category,
            description: `${pricebookItem.name} (${matchingDays.length} days)`,
            quantity: matchingDays.length,
            unitPrice: pricebookItem.basePrice,
            total: pricebookItem.basePrice.multiply(matchingDays.length),
          });
        }
      } else {
        items.push({
          id: this.generateLineItemId(),
          category: pricebookItem.category,
          description: `${pricebookItem.name} (${trip.days.length} days)`,
          quantity: trip.days.length,
          unitPrice: pricebookItem.basePrice,
          total: pricebookItem.basePrice.multiply(trip.days.length),
        });
      }
    }

    return items;
  }

  private calculatePersonItems(
    trip: Trip,
    pricebook: Pricebook,
    now: Date
  ): CalculationLineItem[] {
    const items: CalculationLineItem[] = [];
    const applicableItems = pricebook.items.filter(
      (item) => item.perPerson && !item.perDay && this.isItemValid(item, now)
    );

    for (const pricebookItem of applicableItems) {
      items.push({
        id: this.generateLineItemId(),
        category: pricebookItem.category,
        description: `${pricebookItem.name} (${trip.travelers} travelers)`,
        quantity: trip.travelers,
        unitPrice: pricebookItem.basePrice,
        total: pricebookItem.basePrice.multiply(trip.travelers),
      });
    }

    return items;
  }

  private calculateAccommodationItems(
    trip: Trip,
    pricebook: Pricebook,
    now: Date
  ): CalculationLineItem[] {
    const items: CalculationLineItem[] = [];
    const accommodationItems = pricebook.items.filter(
      (item) =>
        item.category === 'accommodation' &&
        this.isItemValid(item, now) &&
        (!item.location ||
          trip.days.some((day) => day.location === item.location))
    );

    for (const pricebookItem of accommodationItems) {
      const nights = trip.days.length - 1;
      if (nights > 0) {
        const quantity = pricebookItem.perPerson
          ? nights * trip.travelers
          : nights;

        items.push({
          id: this.generateLineItemId(),
          category: pricebookItem.category,
          description: `${pricebookItem.name} (${nights} nights)`,
          quantity,
          unitPrice: pricebookItem.basePrice,
          total: pricebookItem.basePrice.multiply(quantity),
        });
      }
    }

    return items;
  }

  private calculateActivityItems(
    trip: Trip,
    pricebook: Pricebook,
    now: Date
  ): CalculationLineItem[] {
    const items: CalculationLineItem[] = [];

    for (const day of trip.days) {
      if (day.type === DayType.ACTIVITY && day.activities.length > 0) {
        for (const activityName of day.activities) {
          const matchingItem = pricebook.items.find(
            (item) =>
              item.category === 'activity' &&
              item.name.toLowerCase() === activityName.toLowerCase() &&
              (!item.location || item.location === day.location) &&
              this.isItemValid(item, now)
          );

          if (matchingItem) {
            const quantity = matchingItem.perPerson ? trip.travelers : 1;
            items.push({
              id: this.generateLineItemId(),
              category: matchingItem.category,
              description: `${matchingItem.name} (${day.location})`,
              quantity,
              unitPrice: matchingItem.basePrice,
              total: matchingItem.basePrice.multiply(quantity),
            });
          }
        }
      }
    }

    return items;
  }

  private isItemValid(item: Pricebook['items'][0], now: Date): boolean {
    if (item.validFrom > now) return false;
    if (item.validTo && item.validTo < now) return false;
    return true;
  }

  private generateCalculationId(): string {
    return `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLineItemId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}


