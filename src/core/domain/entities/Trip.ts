import { TripStatus } from '../enums';
import { DateRange } from '../valueObjects';
import { Day } from './Day';

export interface Trip {
  id: string;
  userId: string;
  status: TripStatus;
  destination: string;
  dateRange: DateRange;
  travelers: number;
  days: Day[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}



