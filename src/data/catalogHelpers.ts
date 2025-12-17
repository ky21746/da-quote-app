import {
  MOCK_PARKS,
  MOCK_ARRIVAL,
  MOCK_LODGING,
  MOCK_TRANSPORT,
  MOCK_ACTIVITIES,
  MOCK_EXTRAS,
  MOCK_LOGISTICS_ARRIVAL,
  MOCK_LOGISTICS_VEHICLE,
  MOCK_LOGISTICS_INTERNAL,
} from './mockCatalog';
import { CatalogOption } from '../types/ui';

// Helper function to find option by ID
const findOption = (options: CatalogOption[], id: string): CatalogOption | undefined => {
  return options.find((opt) => opt.id === id);
};

export const getParkName = (parkId?: string): string => {
  if (!parkId) return 'Not selected';
  const park = findOption(MOCK_PARKS, parkId);
  return park?.name || 'Unknown Park';
};

export const getArrivalOption = (id?: string): CatalogOption | undefined => {
  if (!id) return undefined;
  return findOption(MOCK_ARRIVAL, id);
};

export const getLodgingOption = (id?: string): CatalogOption | undefined => {
  if (!id) return undefined;
  return findOption(MOCK_LODGING, id);
};

export const getTransportOption = (id?: string): CatalogOption | undefined => {
  if (!id) return undefined;
  return findOption(MOCK_TRANSPORT, id);
};

export const getActivityOptions = (ids: string[]): CatalogOption[] => {
  return ids.map((id) => findOption(MOCK_ACTIVITIES, id)).filter((opt): opt is CatalogOption => !!opt);
};

export const getExtraOptions = (ids: string[]): CatalogOption[] => {
  return ids.map((id) => findOption(MOCK_EXTRAS, id)).filter((opt): opt is CatalogOption => !!opt);
};

export const getLogisticsArrivalOption = (id?: string): CatalogOption | undefined => {
  if (!id) return undefined;
  return findOption(MOCK_LOGISTICS_ARRIVAL, id);
};

export const getLogisticsVehicleOption = (id?: string): CatalogOption | undefined => {
  if (!id) return undefined;
  return findOption(MOCK_LOGISTICS_VEHICLE, id);
};

export const getLogisticsInternalOptions = (ids: string[]): CatalogOption[] => {
  return ids.map((id) => findOption(MOCK_LOGISTICS_INTERNAL, id)).filter((opt): opt is CatalogOption => !!opt);
};

