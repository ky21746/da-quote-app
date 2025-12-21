import { Pricebook } from '../entities';

export interface PricebookRepository {
  getCurrent(): Promise<Pricebook>;
  getById(id: string): Promise<Pricebook | null>;
  getByVersion(version: string): Promise<Pricebook | null>;
}






