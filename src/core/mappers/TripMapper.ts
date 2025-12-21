import { Trip, Day } from '../domain/entities';
import { DateRange } from '../domain/valueObjects';
import { TripStatus } from '../domain/enums';

export class TripMapper {
  static toFirestore(trip: Trip): Record<string, unknown> {
    return {
      id: trip.id,
      userId: trip.userId,
      status: trip.status,
      destination: trip.destination,
      startDate: trip.dateRange.startDate.toISOString(),
      endDate: trip.dateRange.endDate.toISOString(),
      travelers: trip.travelers,
      days: trip.days.map((day) => ({
        id: day.id,
        date: day.date.toISOString(),
        type: day.type,
        location: day.location,
        activities: day.activities,
        accommodation: day.accommodation,
        notes: day.notes,
      })),
      createdAt: trip.createdAt.toISOString(),
      updatedAt: trip.updatedAt.toISOString(),
      metadata: trip.metadata || {},
    };
  }

  static fromFirestore(data: Record<string, unknown>): Trip {
    return {
      id: data.id as string,
      userId: data.userId as string,
      status: data.status as TripStatus,
      destination: data.destination as string,
      dateRange: new DateRange(
        new Date(data.startDate as string),
        new Date(data.endDate as string)
      ),
      travelers: data.travelers as number,
      days: (data.days as Array<Record<string, unknown>>).map(
        (dayData): Day => ({
          id: dayData.id as string,
          date: new Date(dayData.date as string),
          type: dayData.type as Day['type'],
          location: dayData.location as string,
          activities: dayData.activities as string[],
          accommodation: dayData.accommodation as string | undefined,
          notes: dayData.notes as string | undefined,
        })
      ),
      createdAt: new Date(data.createdAt as string),
      updatedAt: new Date(data.updatedAt as string),
      metadata: data.metadata as Record<string, unknown> | undefined,
    };
  }
}




