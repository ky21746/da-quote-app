import { DayType } from '../enums';

export interface Day {
  id: string;
  date: Date;
  type: DayType;
  location: string;
  activities: string[];
  accommodation?: string;
  notes?: string;
}



