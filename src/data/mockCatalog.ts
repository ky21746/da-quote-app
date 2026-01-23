import { CatalogOption } from '../types/ui';

// Mock Parks
export const MOCK_PARKS: CatalogOption[] = [
  { id: 'park_1', sku: 'LOC-BWI-MAIN', name: 'Bwindi Impenetrable National Park', parkId: 'park_1' },
  { id: 'park_2', sku: 'LOC-QEN-MAIN', name: 'Queen Elizabeth National Park', parkId: 'park_2' },
  { id: 'park_3', sku: 'LOC-MUR-MAIN', name: 'Murchison Falls National Park', parkId: 'park_3' },
  { id: 'park_4', sku: 'LOC-KID-MAIN', name: 'Kidepo Valley National Park', parkId: 'park_4' },
];

// Mock Arrival/Aviation options (filtered by parkId)
export const MOCK_ARRIVAL: CatalogOption[] = [
  { id: 'arr_1', sku: 'ARR-BWI-CAR', name: 'Car Transfer', price: 'USD 150', basePrice: 150, pricingModel: 'per_person', parkId: 'park_1' },
  { id: 'arr_2', sku: 'ARR-BWI-FLT', name: 'Domestic Flight', price: 'USD 450', basePrice: 450, pricingModel: 'per_person', parkId: 'park_1' },
  { id: 'arr_3', sku: 'ARR-BWI-HEL', name: 'Helicopter', price: 'USD 1,200', basePrice: 1200, pricingModel: 'fixed', splitAcrossTravelers: true, capacity: 13, parkId: 'park_1' },
  { id: 'arr_4', sku: 'ARR-QEN-CAR', name: 'Car Transfer', price: 'USD 180', basePrice: 180, pricingModel: 'per_person', parkId: 'park_2' },
  { id: 'arr_5', sku: 'ARR-QEN-FLT', name: 'Domestic Flight', price: 'USD 380', basePrice: 380, pricingModel: 'per_person', parkId: 'park_2' },
  { id: 'arr_6', sku: 'ARR-MUR-CAR', name: 'Car Transfer', price: 'USD 200', basePrice: 200, pricingModel: 'per_person', parkId: 'park_3' },
  { id: 'arr_7', sku: 'ARR-MUR-FLT', name: 'Domestic Flight', price: 'USD 500', basePrice: 500, pricingModel: 'per_person', parkId: 'park_3' },
  { id: 'arr_8', sku: 'ARR-KID-CAR', name: 'Car Transfer', price: 'USD 250', basePrice: 250, pricingModel: 'per_person', parkId: 'park_4' },
  { id: 'arr_9', sku: 'ARR-KID-FLT', name: 'Domestic Flight', price: 'USD 600', basePrice: 600, pricingModel: 'per_person', parkId: 'park_4' },
];

// Mock Lodging options (filtered by parkId)
// SKUs built as: ACC-[REGION]-[FIRST_LETTERS_OF_HOTEL]
export const MOCK_LODGING: CatalogOption[] = [
  { id: 'lodg_1', sku: 'ACC-BWI-BWL', name: 'Bwindi Lodge', tier: 'budget', price: 'USD 200/night', basePrice: 200, pricingModel: 'per_night_per_person', parkId: 'park_1' },
  { id: 'lodg_2', sku: 'ACC-BWI-GFC', name: 'Gorilla Forest Camp', tier: 'standard', price: 'USD 350/night', basePrice: 350, pricingModel: 'per_night_per_person', parkId: 'park_1' },
  { id: 'lodg_3', sku: 'ACC-BWI-CML', name: 'Clouds Mountain Lodge', tier: 'luxury', price: 'USD 600/night', basePrice: 600, pricingModel: 'per_night_per_person', parkId: 'park_1' },
  { id: 'lodg_4', sku: 'ACC-QEN-MSL', name: 'Mweya Safari Lodge', tier: 'budget', price: 'USD 180/night', basePrice: 180, pricingModel: 'per_night_per_person', parkId: 'park_2' },
  { id: 'lodg_5', sku: 'ACC-QEN-KGL', name: 'Kyambura Gorge Lodge', tier: 'standard', price: 'USD 320/night', basePrice: 320, pricingModel: 'per_night_per_person', parkId: 'park_2' },
  { id: 'lodg_6', sku: 'ACC-QEN-IWC', name: 'Ishasha Wilderness Camp', tier: 'luxury', price: 'USD 550/night', basePrice: 550, pricingModel: 'per_night_per_person', parkId: 'park_2' },
  { id: 'lodg_7', sku: 'ACC-MUR-PSL', name: 'Paraa Safari Lodge', tier: 'budget', price: 'USD 190/night', basePrice: 190, pricingModel: 'per_night_per_person', parkId: 'park_3' },
  { id: 'lodg_8', sku: 'ACC-MUR-CSL', name: 'Chobe Safari Lodge', tier: 'standard', price: 'USD 340/night', basePrice: 340, pricingModel: 'per_night_per_person', parkId: 'park_3' },
  { id: 'lodg_9', sku: 'ACC-MUR-BKL', name: 'Baker\'s Lodge', tier: 'luxury', price: 'USD 580/night', basePrice: 580, pricingModel: 'per_night_per_person', parkId: 'park_3' },
  { id: 'lodg_10', sku: 'ACC-KID-KSL', name: 'Kidepo Savannah Lodge', tier: 'budget', price: 'USD 170/night', basePrice: 170, pricingModel: 'per_night_per_person', parkId: 'park_4' },
  { id: 'lodg_11', sku: 'ACC-KID-APL', name: 'Apoka Safari Lodge', tier: 'standard', price: 'USD 360/night', basePrice: 360, pricingModel: 'per_night_per_person', parkId: 'park_4' },
];

// Mock Local Transportation options (filtered by parkId)
export const MOCK_TRANSPORT: CatalogOption[] = [
  { id: 'trans_1', sku: 'TRN-BWI-4X4', name: 'Safari Vehicle (4x4)', price: 'USD 120/day', basePrice: 120, pricingModel: 'per_day_fixed', parkId: 'park_1' },
  { id: 'trans_2', sku: 'TRN-BWI-DRV', name: 'Driver', price: 'USD 80/day', basePrice: 80, pricingModel: 'per_day_fixed', parkId: 'park_1' },
  { id: 'trans_3', sku: 'TRN-QEN-4X4', name: 'Safari Vehicle (4x4)', price: 'USD 130/day', basePrice: 130, pricingModel: 'per_day_fixed', parkId: 'park_2' },
  { id: 'trans_4', sku: 'TRN-QEN-DRV', name: 'Driver', price: 'USD 85/day', basePrice: 85, pricingModel: 'per_day_fixed', parkId: 'park_2' },
  { id: 'trans_5', sku: 'TRN-MUR-4X4', name: 'Safari Vehicle (4x4)', price: 'USD 125/day', basePrice: 125, pricingModel: 'per_day_fixed', parkId: 'park_3' },
  { id: 'trans_6', sku: 'TRN-MUR-DRV', name: 'Driver', price: 'USD 80/day', basePrice: 80, pricingModel: 'per_day_fixed', parkId: 'park_3' },
  { id: 'trans_7', sku: 'TRN-KID-4X4', name: 'Safari Vehicle (4x4)', price: 'USD 140/day', basePrice: 140, pricingModel: 'per_day_fixed', parkId: 'park_4' },
  { id: 'trans_8', sku: 'TRN-KID-DRV', name: 'Driver', price: 'USD 90/day', basePrice: 90, pricingModel: 'per_day_fixed', parkId: 'park_4' },
];

// Mock Activities (multi-select, filtered by parkId)
export const MOCK_ACTIVITIES: CatalogOption[] = [
  { id: 'act_1', sku: 'ACT-BWI-GOR', name: 'Gorilla Trekking', price: 'USD 700', basePrice: 700, pricingModel: 'per_person', parkId: 'park_1' },
  { id: 'act_2', sku: 'ACT-BWI-BRD', name: 'Bird Watching', price: 'USD 50', basePrice: 50, pricingModel: 'per_person', parkId: 'park_1' },
  { id: 'act_3', sku: 'ACT-BWI-WLK', name: 'Nature Walk', price: 'USD 40', basePrice: 40, pricingModel: 'per_person', parkId: 'park_1' },
  { id: 'act_4', sku: 'ACT-QEN-BOT', name: 'Boat Safari', price: 'USD 60', basePrice: 60, pricingModel: 'per_person', parkId: 'park_2' },
  { id: 'act_5', sku: 'ACT-QEN-DRV', name: 'Game Drive', price: 'USD 80', basePrice: 80, pricingModel: 'per_person', parkId: 'park_2' },
  { id: 'act_6', sku: 'ACT-QEN-CHM', name: 'Chimpanzee Tracking', price: 'USD 200', basePrice: 200, pricingModel: 'per_person', parkId: 'park_2' },
  { id: 'act_7', sku: 'ACT-MUR-HIK', name: 'Murchison Falls Hike', price: 'USD 45', basePrice: 45, pricingModel: 'per_person', parkId: 'park_3' },
  { id: 'act_8', sku: 'ACT-MUR-DRV', name: 'Game Drive', price: 'USD 75', basePrice: 75, pricingModel: 'per_person', parkId: 'park_3' },
  { id: 'act_9', sku: 'ACT-MUR-BOT', name: 'Boat Cruise', price: 'USD 55', basePrice: 55, pricingModel: 'per_person', parkId: 'park_3' },
  { id: 'act_10', sku: 'ACT-KID-DRV', name: 'Game Drive', price: 'USD 85', basePrice: 85, pricingModel: 'per_person', parkId: 'park_4' },
  { id: 'act_11', sku: 'ACT-KID-CUL', name: 'Cultural Visit', price: 'USD 30', basePrice: 30, pricingModel: 'per_person', parkId: 'park_4' },
  { id: 'act_12', sku: 'ACT-KID-BRD', name: 'Bird Watching', price: 'USD 50', basePrice: 50, pricingModel: 'per_person', parkId: 'park_4' },
];

// Mock Extras (multi-select, filtered by parkId)
export const MOCK_EXTRAS: CatalogOption[] = [
  { id: 'extra_1', sku: 'EXT-BWI-GDE', name: 'Park Guide', price: 'USD 100/day', basePrice: 100, pricingModel: 'per_day_fixed', parkId: 'park_1' },
  { id: 'extra_2', sku: 'EXT-BWI-PHO', name: 'Photography Permit', price: 'USD 50', basePrice: 50, pricingModel: 'fixed', parkId: 'park_1' },
  { id: 'extra_3', sku: 'EXT-QEN-GDE', name: 'Park Guide', price: 'USD 100/day', basePrice: 100, pricingModel: 'per_day_fixed', parkId: 'park_2' },
  { id: 'extra_4', sku: 'EXT-MUR-GDE', name: 'Park Guide', price: 'USD 100/day', basePrice: 100, pricingModel: 'per_day_fixed', parkId: 'park_3' },
  { id: 'extra_5', sku: 'EXT-MUR-FSH', name: 'Fishing Permit', price: 'USD 40', basePrice: 40, pricingModel: 'fixed', parkId: 'park_3' },
  { id: 'extra_6', sku: 'EXT-KID-GDE', name: 'Park Guide', price: 'USD 100/day', basePrice: 100, pricingModel: 'per_day_fixed', parkId: 'park_4' },
];

// Mock Logistics - Arrival/Movement Between Parks (filtered by parkId)
export const MOCK_LOGISTICS_ARRIVAL: CatalogOption[] = [
  { id: 'log_arr_1', sku: 'LOG-BWI-FLT', name: 'Internal Flight', price: 'USD 450 (per person)', basePrice: 450, pricingModel: 'per_person', parkId: 'park_1' },
  { id: 'log_arr_2', sku: 'LOG-BWI-HEL', name: 'Helicopter', price: 'USD 1,200 (fixed)', basePrice: 1200, pricingModel: 'fixed', splitAcrossTravelers: true, capacity: 13, parkId: 'park_1' },
  { id: 'log_arr_3', sku: 'LOG-BWI-OVR', name: 'Overland Transfer', price: 'USD 150 (per person)', basePrice: 150, pricingModel: 'per_person', parkId: 'park_1' },
  { id: 'log_arr_4', sku: 'LOG-QEN-FLT', name: 'Internal Flight', price: 'USD 380 (per person)', basePrice: 380, pricingModel: 'per_person', parkId: 'park_2' },
  { id: 'log_arr_5', sku: 'LOG-QEN-HEL', name: 'Helicopter', price: 'USD 1,100 (fixed)', basePrice: 1100, pricingModel: 'fixed', splitAcrossTravelers: true, capacity: 13, parkId: 'park_2' },
  { id: 'log_arr_6', sku: 'LOG-QEN-OVR', name: 'Overland Transfer', price: 'USD 180 (per person)', basePrice: 180, pricingModel: 'per_person', parkId: 'park_2' },
  { id: 'log_arr_7', sku: 'LOG-MUR-FLT', name: 'Internal Flight', price: 'USD 500 (per person)', basePrice: 500, pricingModel: 'per_person', parkId: 'park_3' },
  { id: 'log_arr_8', sku: 'LOG-MUR-HEL', name: 'Helicopter', price: 'USD 1,300 (fixed)', basePrice: 1300, pricingModel: 'fixed', splitAcrossTravelers: true, capacity: 13, parkId: 'park_3' },
  { id: 'log_arr_9', sku: 'LOG-MUR-OVR', name: 'Overland Transfer', price: 'USD 200 (per person)', basePrice: 200, pricingModel: 'per_person', parkId: 'park_3' },
  { id: 'log_arr_10', sku: 'LOG-KID-FLT', name: 'Internal Flight', price: 'USD 600 (per person)', basePrice: 600, pricingModel: 'per_person', parkId: 'park_4' },
  { id: 'log_arr_11', sku: 'LOG-KID-HEL', name: 'Helicopter', price: 'USD 1,400 (fixed)', basePrice: 1400, pricingModel: 'fixed', splitAcrossTravelers: true, capacity: 13, parkId: 'park_4' },
  { id: 'log_arr_12', sku: 'LOG-KID-OVR', name: 'Overland Transfer', price: 'USD 250 (per person)', basePrice: 250, pricingModel: 'per_person', parkId: 'park_4' },
];

// Mock Logistics - Vehicle & Driver (filtered by parkId)
export const MOCK_LOGISTICS_VEHICLE: CatalogOption[] = [
  { id: 'log_veh_1', sku: 'LOG-BWI-4X4', name: 'Safari Vehicle (4x4)', price: 'USD 120/day (fixed)', basePrice: 120, pricingModel: 'per_day_fixed', parkId: 'park_1' },
  { id: 'log_veh_2', sku: 'LOG-BWI-VAN', name: 'Luxury Van', price: 'USD 150/day (fixed)', basePrice: 150, pricingModel: 'per_day_fixed', parkId: 'park_1' },
  { id: 'log_veh_3', sku: 'LOG-BWI-NOV', name: 'No Vehicle', price: 'USD 0', basePrice: 0, pricingModel: 'fixed', parkId: 'park_1' },
  { id: 'log_veh_4', sku: 'LOG-QEN-4X4', name: 'Safari Vehicle (4x4)', price: 'USD 130/day (fixed)', basePrice: 130, pricingModel: 'per_day_fixed', parkId: 'park_2' },
  { id: 'log_veh_5', sku: 'LOG-QEN-VAN', name: 'Luxury Van', price: 'USD 160/day (fixed)', basePrice: 160, pricingModel: 'per_day_fixed', parkId: 'park_2' },
  { id: 'log_veh_6', sku: 'LOG-QEN-NOV', name: 'No Vehicle', price: 'USD 0', basePrice: 0, pricingModel: 'fixed', parkId: 'park_2' },
  { id: 'log_veh_7', sku: 'LOG-MUR-4X4', name: 'Safari Vehicle (4x4)', price: 'USD 125/day (fixed)', basePrice: 125, pricingModel: 'per_day_fixed', parkId: 'park_3' },
  { id: 'log_veh_8', sku: 'LOG-MUR-VAN', name: 'Luxury Van', price: 'USD 155/day (fixed)', basePrice: 155, pricingModel: 'per_day_fixed', parkId: 'park_3' },
  { id: 'log_veh_9', sku: 'LOG-MUR-NOV', name: 'No Vehicle', price: 'USD 0', basePrice: 0, pricingModel: 'fixed', parkId: 'park_3' },
  { id: 'log_veh_10', sku: 'LOG-KID-4X4', name: 'Safari Vehicle (4x4)', price: 'USD 140/day (fixed)', basePrice: 140, pricingModel: 'per_day_fixed', parkId: 'park_4' },
  { id: 'log_veh_11', sku: 'LOG-KID-VAN', name: 'Luxury Van', price: 'USD 170/day (fixed)', basePrice: 170, pricingModel: 'per_day_fixed', parkId: 'park_4' },
  { id: 'log_veh_12', sku: 'LOG-KID-NOV', name: 'No Vehicle', price: 'USD 0', basePrice: 0, pricingModel: 'fixed', parkId: 'park_4' },
];

// Mock Logistics - Internal Movements (multi-select, filtered by parkId)
export const MOCK_LOGISTICS_INTERNAL: CatalogOption[] = [
  { id: 'log_int_1', sku: 'LOG-BWI-IDR', name: 'Game Drive', price: 'USD 80', basePrice: 80, pricingModel: 'per_person', parkId: 'park_1' },
  { id: 'log_int_2', sku: 'LOG-BWI-IBT', name: 'Boat Transfer', price: 'USD 60', basePrice: 60, pricingModel: 'per_person', parkId: 'park_1' },
  { id: 'log_int_3', sku: 'LOG-QEN-IDR', name: 'Game Drive', price: 'USD 75', basePrice: 75, pricingModel: 'per_person', parkId: 'park_2' },
  { id: 'log_int_4', sku: 'LOG-QEN-IBT', name: 'Boat Transfer', price: 'USD 55', basePrice: 55, pricingModel: 'per_person', parkId: 'park_2' },
  { id: 'log_int_5', sku: 'LOG-MUR-IDR', name: 'Game Drive', price: 'USD 80', basePrice: 80, pricingModel: 'per_person', parkId: 'park_3' },
  { id: 'log_int_6', sku: 'LOG-MUR-IBT', name: 'Boat Transfer', price: 'USD 60', basePrice: 60, pricingModel: 'per_person', parkId: 'park_3' },
  { id: 'log_int_7', sku: 'LOG-KID-IDR', name: 'Game Drive', price: 'USD 85', basePrice: 85, pricingModel: 'per_person', parkId: 'park_4' },
  { id: 'log_int_8', sku: 'LOG-KID-IBT', name: 'Boat Transfer', price: 'USD 65', basePrice: 65, pricingModel: 'per_person', parkId: 'park_4' },
];

// Helper function to filter options by parkId
export const getFilteredOptions = (
  options: CatalogOption[],
  parkId?: string
): CatalogOption[] => {
  if (!parkId) return [];
  return options.filter((opt) => opt.parkId === parkId);
};
