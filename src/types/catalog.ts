export interface CatalogItem {
  id: string;
  name: string;
  category: string;
}

export interface LodgingOption extends CatalogItem {
  category: 'lodging';
  location?: string;
}

export interface VehicleOption extends CatalogItem {
  category: 'vehicle';
}

export interface FlightRoute extends CatalogItem {
  category: 'domestic-flight';
  from: string;
  to: string;
}

export interface ParkOption extends CatalogItem {
  category: 'park';
  location: string;
}

export interface ActivityOption extends CatalogItem {
  category: 'activity';
  location?: string;
}

export type CatalogOption =
  | LodgingOption
  | VehicleOption
  | FlightRoute
  | ParkOption
  | ActivityOption;


