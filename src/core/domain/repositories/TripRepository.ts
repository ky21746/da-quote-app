import { Trip } from '../entities';

export interface TripRepository {
  getById(tripId: string, userId: string): Promise<Trip | null>;
  save(trip: Trip): Promise<Trip>;
  update(tripId: string, userId: string, updates: Partial<Trip>): Promise<Trip>;
  listByUser(userId: string): Promise<Trip[]>;
}






