import { CatalogOption } from '../types/ui';

// Mock Parks
export const MOCK_PARKS: CatalogOption[] = [
  { id: 'park_1', name: 'Bwindi Impenetrable National Park', parkId: 'park_1' },
  { id: 'park_2', name: 'Queen Elizabeth National Park', parkId: 'park_2' },
  { id: 'park_3', name: 'Murchison Falls National Park', parkId: 'park_3' },
  { id: 'park_4', name: 'Kidepo Valley National Park', parkId: 'park_4' },
];

// Mock Arrival/Aviation options (filtered by parkId)
export const MOCK_ARRIVAL: CatalogOption[] = [
  { id: 'arr_1', name: 'Car Transfer', price: 'USD 150', basePrice: 150, pricingModel: 'per_person', parkId: 'park_1' },
  { id: 'arr_2', name: 'Domestic Flight', price: 'USD 450', basePrice: 450, pricingModel: 'per_person', parkId: 'park_1' },
  { id: 'arr_3', name: 'Helicopter', price: 'USD 1,200', basePrice: 1200, pricingModel: 'fixed', splitAcrossTravelers: true, capacity: 13, parkId: 'park_1' },
  { id: 'arr_4', name: 'Car Transfer', price: 'USD 180', basePrice: 180, pricingModel: 'per_person', parkId: 'park_2' },
  { id: 'arr_5', name: 'Domestic Flight', price: 'USD 380', basePrice: 380, pricingModel: 'per_person', parkId: 'park_2' },
  { id: 'arr_6', name: 'Car Transfer', price: 'USD 200', basePrice: 200, pricingModel: 'per_person', parkId: 'park_3' },
  { id: 'arr_7', name: 'Domestic Flight', price: 'USD 500', basePrice: 500, pricingModel: 'per_person', parkId: 'park_3' },
  { id: 'arr_8', name: 'Car Transfer', price: 'USD 250', basePrice: 250, pricingModel: 'per_person', parkId: 'park_4' },
  { id: 'arr_9', name: 'Domestic Flight', price: 'USD 600', basePrice: 600, pricingModel: 'per_person', parkId: 'park_4' },
];

// Mock Lodging options (filtered by parkId)
export const MOCK_LODGING: CatalogOption[] = [
  { id: 'lodg_1', name: 'Bwindi Lodge', tier: 'base', price: 'USD 200/night', basePrice: 200, pricingModel: 'per_night_per_person', parkId: 'park_1' },
  { id: 'lodg_2', name: 'Gorilla Forest Camp', tier: 'quality', price: 'USD 350/night', basePrice: 350, pricingModel: 'per_night_per_person', parkId: 'park_1' },
  { id: 'lodg_3', name: 'Clouds Mountain Lodge', tier: 'premium', price: 'USD 600/night', basePrice: 600, pricingModel: 'per_night_per_person', parkId: 'park_1' },
  { id: 'lodg_4', name: 'Mweya Safari Lodge', tier: 'base', price: 'USD 180/night', basePrice: 180, pricingModel: 'per_night_per_person', parkId: 'park_2' },
  { id: 'lodg_5', name: 'Kyambura Gorge Lodge', tier: 'quality', price: 'USD 320/night', basePrice: 320, pricingModel: 'per_night_per_person', parkId: 'park_2' },
  { id: 'lodg_6', name: 'Ishasha Wilderness Camp', tier: 'premium', price: 'USD 550/night', basePrice: 550, pricingModel: 'per_night_per_person', parkId: 'park_2' },
  { id: 'lodg_7', name: 'Paraa Safari Lodge', tier: 'base', price: 'USD 190/night', basePrice: 190, pricingModel: 'per_night_per_person', parkId: 'park_3' },
  { id: 'lodg_8', name: 'Chobe Safari Lodge', tier: 'quality', price: 'USD 340/night', basePrice: 340, pricingModel: 'per_night_per_person', parkId: 'park_3' },
  { id: 'lodg_9', name: 'Baker\'s Lodge', tier: 'premium', price: 'USD 580/night', basePrice: 580, pricingModel: 'per_night_per_person', parkId: 'park_3' },
  { id: 'lodg_10', name: 'Kidepo Savannah Lodge', tier: 'base', price: 'USD 170/night', basePrice: 170, pricingModel: 'per_night_per_person', parkId: 'park_4' },
  { id: 'lodg_11', name: 'Apoka Safari Lodge', tier: 'quality', price: 'USD 360/night', basePrice: 360, pricingModel: 'per_night_per_person', parkId: 'park_4' },
];

// Mock Local Transportation options (filtered by parkId)
export const MOCK_TRANSPORT: CatalogOption[] = [
  { id: 'trans_1', name: 'Safari Vehicle (4x4)', price: 'USD 120/day', basePrice: 120, pricingModel: 'per_day_fixed', parkId: 'park_1' },
  { id: 'trans_2', name: 'Driver', price: 'USD 80/day', basePrice: 80, pricingModel: 'per_day_fixed', parkId: 'park_1' },
  { id: 'trans_3', name: 'Safari Vehicle (4x4)', price: 'USD 130/day', basePrice: 130, pricingModel: 'per_day_fixed', parkId: 'park_2' },
  { id: 'trans_4', name: 'Driver', price: 'USD 85/day', basePrice: 85, pricingModel: 'per_day_fixed', parkId: 'park_2' },
  { id: 'trans_5', name: 'Safari Vehicle (4x4)', price: 'USD 125/day', basePrice: 125, pricingModel: 'per_day_fixed', parkId: 'park_3' },
  { id: 'trans_6', name: 'Driver', price: 'USD 80/day', basePrice: 80, pricingModel: 'per_day_fixed', parkId: 'park_3' },
  { id: 'trans_7', name: 'Safari Vehicle (4x4)', price: 'USD 140/day', basePrice: 140, pricingModel: 'per_day_fixed', parkId: 'park_4' },
  { id: 'trans_8', name: 'Driver', price: 'USD 90/day', basePrice: 90, pricingModel: 'per_day_fixed', parkId: 'park_4' },
];

// Mock Activities (multi-select, filtered by parkId)
export const MOCK_ACTIVITIES: CatalogOption[] = [
  { id: 'act_1', name: 'Gorilla Trekking', price: 'USD 700', basePrice: 700, pricingModel: 'per_person', parkId: 'park_1' },
  { id: 'act_2', name: 'Bird Watching', price: 'USD 50', basePrice: 50, pricingModel: 'per_person', parkId: 'park_1' },
  { id: 'act_3', name: 'Nature Walk', price: 'USD 40', basePrice: 40, pricingModel: 'per_person', parkId: 'park_1' },
  { id: 'act_4', name: 'Boat Safari', price: 'USD 60', basePrice: 60, pricingModel: 'per_person', parkId: 'park_2' },
  { id: 'act_5', name: 'Game Drive', price: 'USD 80', basePrice: 80, pricingModel: 'per_person', parkId: 'park_2' },
  { id: 'act_6', name: 'Chimpanzee Tracking', price: 'USD 200', basePrice: 200, pricingModel: 'per_person', parkId: 'park_2' },
  { id: 'act_7', name: 'Murchison Falls Hike', price: 'USD 45', basePrice: 45, pricingModel: 'per_person', parkId: 'park_3' },
  { id: 'act_8', name: 'Game Drive', price: 'USD 75', basePrice: 75, pricingModel: 'per_person', parkId: 'park_3' },
  { id: 'act_9', name: 'Boat Cruise', price: 'USD 55', basePrice: 55, pricingModel: 'per_person', parkId: 'park_3' },
  { id: 'act_10', name: 'Game Drive', price: 'USD 85', basePrice: 85, pricingModel: 'per_person', parkId: 'park_4' },
  { id: 'act_11', name: 'Cultural Visit', price: 'USD 30', basePrice: 30, pricingModel: 'per_person', parkId: 'park_4' },
  { id: 'act_12', name: 'Bird Watching', price: 'USD 50', basePrice: 50, pricingModel: 'per_person', parkId: 'park_4' },
];

// Mock Extras (multi-select, filtered by parkId)
export const MOCK_EXTRAS: CatalogOption[] = [
  { id: 'extra_1', name: 'Park Guide', price: 'USD 100/day', basePrice: 100, pricingModel: 'per_day_fixed', parkId: 'park_1' },
  { id: 'extra_2', name: 'Photography Permit', price: 'USD 50', basePrice: 50, pricingModel: 'fixed', parkId: 'park_1' },
  { id: 'extra_3', name: 'Park Guide', price: 'USD 100/day', basePrice: 100, pricingModel: 'per_day_fixed', parkId: 'park_2' },
  { id: 'extra_4', name: 'Park Guide', price: 'USD 100/day', basePrice: 100, pricingModel: 'per_day_fixed', parkId: 'park_3' },
  { id: 'extra_5', name: 'Fishing Permit', price: 'USD 40', basePrice: 40, pricingModel: 'fixed', parkId: 'park_3' },
  { id: 'extra_6', name: 'Park Guide', price: 'USD 100/day', basePrice: 100, pricingModel: 'per_day_fixed', parkId: 'park_4' },
];

// Mock Logistics - Arrival/Movement Between Parks (filtered by parkId)
export const MOCK_LOGISTICS_ARRIVAL: CatalogOption[] = [
  { id: 'log_arr_1', name: 'Internal Flight', price: 'USD 450 (per person)', basePrice: 450, pricingModel: 'per_person', parkId: 'park_1' },
  { id: 'log_arr_2', name: 'Helicopter', price: 'USD 1,200 (fixed)', basePrice: 1200, pricingModel: 'fixed', splitAcrossTravelers: true, capacity: 13, parkId: 'park_1' },
  { id: 'log_arr_3', name: 'Overland Transfer', price: 'USD 150 (per person)', basePrice: 150, pricingModel: 'per_person', parkId: 'park_1' },
  { id: 'log_arr_4', name: 'Internal Flight', price: 'USD 380 (per person)', basePrice: 380, pricingModel: 'per_person', parkId: 'park_2' },
  { id: 'log_arr_5', name: 'Helicopter', price: 'USD 1,100 (fixed)', basePrice: 1100, pricingModel: 'fixed', splitAcrossTravelers: true, capacity: 13, parkId: 'park_2' },
  { id: 'log_arr_6', name: 'Overland Transfer', price: 'USD 180 (per person)', basePrice: 180, pricingModel: 'per_person', parkId: 'park_2' },
  { id: 'log_arr_7', name: 'Internal Flight', price: 'USD 500 (per person)', basePrice: 500, pricingModel: 'per_person', parkId: 'park_3' },
  { id: 'log_arr_8', name: 'Helicopter', price: 'USD 1,300 (fixed)', basePrice: 1300, pricingModel: 'fixed', splitAcrossTravelers: true, capacity: 13, parkId: 'park_3' },
  { id: 'log_arr_9', name: 'Overland Transfer', price: 'USD 200 (per person)', basePrice: 200, pricingModel: 'per_person', parkId: 'park_3' },
  { id: 'log_arr_10', name: 'Internal Flight', price: 'USD 600 (per person)', basePrice: 600, pricingModel: 'per_person', parkId: 'park_4' },
  { id: 'log_arr_11', name: 'Helicopter', price: 'USD 1,400 (fixed)', basePrice: 1400, pricingModel: 'fixed', splitAcrossTravelers: true, capacity: 13, parkId: 'park_4' },
  { id: 'log_arr_12', name: 'Overland Transfer', price: 'USD 250 (per person)', basePrice: 250, pricingModel: 'per_person', parkId: 'park_4' },
];

// Mock Logistics - Vehicle & Driver (filtered by parkId)
export const MOCK_LOGISTICS_VEHICLE: CatalogOption[] = [
  { id: 'log_veh_1', name: 'Safari Vehicle (4x4)', price: 'USD 120/day (fixed)', basePrice: 120, pricingModel: 'per_day_fixed', parkId: 'park_1' },
  { id: 'log_veh_2', name: 'Luxury Van', price: 'USD 150/day (fixed)', basePrice: 150, pricingModel: 'per_day_fixed', parkId: 'park_1' },
  { id: 'log_veh_3', name: 'No Vehicle', price: 'USD 0', basePrice: 0, pricingModel: 'fixed', parkId: 'park_1' },
  { id: 'log_veh_4', name: 'Safari Vehicle (4x4)', price: 'USD 130/day (fixed)', basePrice: 130, pricingModel: 'per_day_fixed', parkId: 'park_2' },
  { id: 'log_veh_5', name: 'Luxury Van', price: 'USD 160/day (fixed)', basePrice: 160, pricingModel: 'per_day_fixed', parkId: 'park_2' },
  { id: 'log_veh_6', name: 'No Vehicle', price: 'USD 0', basePrice: 0, pricingModel: 'fixed', parkId: 'park_2' },
  { id: 'log_veh_7', name: 'Safari Vehicle (4x4)', price: 'USD 125/day (fixed)', basePrice: 125, pricingModel: 'per_day_fixed', parkId: 'park_3' },
  { id: 'log_veh_8', name: 'Luxury Van', price: 'USD 155/day (fixed)', basePrice: 155, pricingModel: 'per_day_fixed', parkId: 'park_3' },
  { id: 'log_veh_9', name: 'No Vehicle', price: 'USD 0', basePrice: 0, pricingModel: 'fixed', parkId: 'park_3' },
  { id: 'log_veh_10', name: 'Safari Vehicle (4x4)', price: 'USD 140/day (fixed)', basePrice: 140, pricingModel: 'per_day_fixed', parkId: 'park_4' },
  { id: 'log_veh_11', name: 'Luxury Van', price: 'USD 170/day (fixed)', basePrice: 170, pricingModel: 'per_day_fixed', parkId: 'park_4' },
  { id: 'log_veh_12', name: 'No Vehicle', price: 'USD 0', basePrice: 0, pricingModel: 'fixed', parkId: 'park_4' },
];

// Mock Logistics - Internal Movements (multi-select, filtered by parkId)
export const MOCK_LOGISTICS_INTERNAL: CatalogOption[] = [
  { id: 'log_int_1', name: 'Game Drive', price: 'USD 80', basePrice: 80, pricingModel: 'per_person', parkId: 'park_1' },
  { id: 'log_int_2', name: 'Boat Transfer', price: 'USD 60', basePrice: 60, pricingModel: 'per_person', parkId: 'park_1' },
  { id: 'log_int_3', name: 'Game Drive', price: 'USD 75', basePrice: 75, pricingModel: 'per_person', parkId: 'park_2' },
  { id: 'log_int_4', name: 'Boat Transfer', price: 'USD 55', basePrice: 55, pricingModel: 'per_person', parkId: 'park_2' },
  { id: 'log_int_5', name: 'Game Drive', price: 'USD 80', basePrice: 80, pricingModel: 'per_person', parkId: 'park_3' },
  { id: 'log_int_6', name: 'Boat Transfer', price: 'USD 60', basePrice: 60, pricingModel: 'per_person', parkId: 'park_3' },
  { id: 'log_int_7', name: 'Game Drive', price: 'USD 85', basePrice: 85, pricingModel: 'per_person', parkId: 'park_4' },
  { id: 'log_int_8', name: 'Boat Transfer', price: 'USD 65', basePrice: 65, pricingModel: 'per_person', parkId: 'park_4' },
];

// Helper function to filter options by parkId
export const getFilteredOptions = (
  options: CatalogOption[],
  parkId?: string
): CatalogOption[] => {
  if (!parkId) return [];
  return options.filter((opt) => opt.parkId === parkId);
};

