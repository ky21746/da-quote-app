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
  { id: 'arr_1', name: 'Car Transfer', price: 'USD 150', parkId: 'park_1' },
  { id: 'arr_2', name: 'Domestic Flight', price: 'USD 450', parkId: 'park_1' },
  { id: 'arr_3', name: 'Helicopter', price: 'USD 1,200', parkId: 'park_1' },
  { id: 'arr_4', name: 'Car Transfer', price: 'USD 180', parkId: 'park_2' },
  { id: 'arr_5', name: 'Domestic Flight', price: 'USD 380', parkId: 'park_2' },
  { id: 'arr_6', name: 'Car Transfer', price: 'USD 200', parkId: 'park_3' },
  { id: 'arr_7', name: 'Domestic Flight', price: 'USD 500', parkId: 'park_3' },
  { id: 'arr_8', name: 'Car Transfer', price: 'USD 250', parkId: 'park_4' },
  { id: 'arr_9', name: 'Domestic Flight', price: 'USD 600', parkId: 'park_4' },
];

// Mock Lodging options (filtered by parkId)
export const MOCK_LODGING: CatalogOption[] = [
  { id: 'lodg_1', name: 'Bwindi Lodge', tier: 'base', price: 'USD 200/night', parkId: 'park_1' },
  { id: 'lodg_2', name: 'Gorilla Forest Camp', tier: 'quality', price: 'USD 350/night', parkId: 'park_1' },
  { id: 'lodg_3', name: 'Clouds Mountain Lodge', tier: 'premium', price: 'USD 600/night', parkId: 'park_1' },
  { id: 'lodg_4', name: 'Mweya Safari Lodge', tier: 'base', price: 'USD 180/night', parkId: 'park_2' },
  { id: 'lodg_5', name: 'Kyambura Gorge Lodge', tier: 'quality', price: 'USD 320/night', parkId: 'park_2' },
  { id: 'lodg_6', name: 'Ishasha Wilderness Camp', tier: 'premium', price: 'USD 550/night', parkId: 'park_2' },
  { id: 'lodg_7', name: 'Paraa Safari Lodge', tier: 'base', price: 'USD 190/night', parkId: 'park_3' },
  { id: 'lodg_8', name: 'Chobe Safari Lodge', tier: 'quality', price: 'USD 340/night', parkId: 'park_3' },
  { id: 'lodg_9', name: 'Baker\'s Lodge', tier: 'premium', price: 'USD 580/night', parkId: 'park_3' },
  { id: 'lodg_10', name: 'Kidepo Savannah Lodge', tier: 'base', price: 'USD 170/night', parkId: 'park_4' },
  { id: 'lodg_11', name: 'Apoka Safari Lodge', tier: 'quality', price: 'USD 360/night', parkId: 'park_4' },
];

// Mock Local Transportation options (filtered by parkId)
export const MOCK_TRANSPORT: CatalogOption[] = [
  { id: 'trans_1', name: 'Safari Vehicle (4x4)', price: 'USD 120/day', parkId: 'park_1' },
  { id: 'trans_2', name: 'Driver', price: 'USD 80/day', parkId: 'park_1' },
  { id: 'trans_3', name: 'Safari Vehicle (4x4)', price: 'USD 130/day', parkId: 'park_2' },
  { id: 'trans_4', name: 'Driver', price: 'USD 85/day', parkId: 'park_2' },
  { id: 'trans_5', name: 'Safari Vehicle (4x4)', price: 'USD 125/day', parkId: 'park_3' },
  { id: 'trans_6', name: 'Driver', price: 'USD 80/day', parkId: 'park_3' },
  { id: 'trans_7', name: 'Safari Vehicle (4x4)', price: 'USD 140/day', parkId: 'park_4' },
  { id: 'trans_8', name: 'Driver', price: 'USD 90/day', parkId: 'park_4' },
];

// Mock Activities (multi-select, filtered by parkId)
export const MOCK_ACTIVITIES: CatalogOption[] = [
  { id: 'act_1', name: 'Gorilla Trekking', price: 'USD 700', parkId: 'park_1' },
  { id: 'act_2', name: 'Bird Watching', price: 'USD 50', parkId: 'park_1' },
  { id: 'act_3', name: 'Nature Walk', price: 'USD 40', parkId: 'park_1' },
  { id: 'act_4', name: 'Boat Safari', price: 'USD 60', parkId: 'park_2' },
  { id: 'act_5', name: 'Game Drive', price: 'USD 80', parkId: 'park_2' },
  { id: 'act_6', name: 'Chimpanzee Tracking', price: 'USD 200', parkId: 'park_2' },
  { id: 'act_7', name: 'Murchison Falls Hike', price: 'USD 45', parkId: 'park_3' },
  { id: 'act_8', name: 'Game Drive', price: 'USD 75', parkId: 'park_3' },
  { id: 'act_9', name: 'Boat Cruise', price: 'USD 55', parkId: 'park_3' },
  { id: 'act_10', name: 'Game Drive', price: 'USD 85', parkId: 'park_4' },
  { id: 'act_11', name: 'Cultural Visit', price: 'USD 30', parkId: 'park_4' },
  { id: 'act_12', name: 'Bird Watching', price: 'USD 50', parkId: 'park_4' },
];

// Mock Extras (multi-select, filtered by parkId)
export const MOCK_EXTRAS: CatalogOption[] = [
  { id: 'extra_1', name: 'Park Guide', price: 'USD 100/day', parkId: 'park_1' },
  { id: 'extra_2', name: 'Photography Permit', price: 'USD 50', parkId: 'park_1' },
  { id: 'extra_3', name: 'Park Guide', price: 'USD 100/day', parkId: 'park_2' },
  { id: 'extra_4', name: 'Park Guide', price: 'USD 100/day', parkId: 'park_3' },
  { id: 'extra_5', name: 'Fishing Permit', price: 'USD 40', parkId: 'park_3' },
  { id: 'extra_6', name: 'Park Guide', price: 'USD 100/day', parkId: 'park_4' },
];

// Helper function to filter options by parkId
export const getFilteredOptions = (
  options: CatalogOption[],
  parkId?: string
): CatalogOption[] => {
  if (!parkId) return [];
  return options.filter((opt) => opt.parkId === parkId);
};

