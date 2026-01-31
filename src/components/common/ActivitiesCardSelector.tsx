import React, { useMemo, useState } from 'react';
import { PricingItem } from '../../types/ui';
import { getCatalogItemsForPark } from '../../utils/pricingCatalogHelpers';
import { formatCurrency } from '../../utils/currencyFormatter';
import { 
  Binoculars, 
  Car, 
  Ship, 
  Mountain, 
  Users, 
  Footprints,
  Moon,
  Bike,
  Eye,
  Plus,
  Minus,
  Check,
  Star
} from 'lucide-react';

interface ActivitiesCardSelectorProps {
  selectedIds: string[];
  onChange: (activityIds: string[]) => void;
  parkId?: string;
  items: PricingItem[];
  isLoading?: boolean;
  quantities?: Record<string, number>;
  onQuantityChange?: (activityId: string, quantity: number) => void;
  // Favorites support
  isActivityFavorite?: (parkId: string, activityId: string) => boolean;
  onToggleFavorite?: (parkId: string, activityId: string) => void;
}

type ActivityCategory = 'wildlife' | 'nature' | 'water' | 'adventure' | 'cultural' | 'other';

interface CategorizedActivity {
  id: string;
  name: string;
  price: number;
  costType: string;
  category: ActivityCategory;
  notes?: string;
}

export const ActivitiesCardSelector: React.FC<ActivitiesCardSelectorProps> = ({
  selectedIds,
  onChange,
  parkId,
  items,
  isLoading = false,
  quantities = {},
  onQuantityChange,
  isActivityFavorite,
  onToggleFavorite,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<ActivityCategory>>(new Set<ActivityCategory>(['wildlife', 'nature']));

  // Filter items for this park
  const filteredItems = useMemo(
    () => getCatalogItemsForPark(items, parkId, 'Activities'),
    [items, parkId]
  );

  // Categorize activities based on name keywords
  const categorizeActivity = (name: string): ActivityCategory => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('game drive') || lowerName.includes('lion') || lowerName.includes('gorilla') || lowerName.includes('monkey') || lowerName.includes('hippo') || lowerName.includes('tracking')) {
      return 'wildlife';
    }
    if (lowerName.includes('bird') || lowerName.includes('nature walk') || lowerName.includes('hiking')) {
      return 'nature';
    }
    if (lowerName.includes('boat') || lowerName.includes('cruise') || lowerName.includes('rafting')) {
      return 'water';
    }
    if (lowerName.includes('mountain') || lowerName.includes('cycling') || lowerName.includes('climb')) {
      return 'adventure';
    }
    if (lowerName.includes('cultural') || lowerName.includes('community') || lowerName.includes('batwa')) {
      return 'cultural';
    }
    return 'other';
  };

  // Group activities by category
  const categorizedActivities = useMemo(() => {
    const grouped: Record<ActivityCategory, CategorizedActivity[]> = {
      wildlife: [],
      nature: [],
      water: [],
      adventure: [],
      cultural: [],
      other: [],
    };

    filteredItems.forEach(item => {
      const category = categorizeActivity(item.itemName);
      grouped[category].push({
        id: item.id,
        name: item.itemName,
        price: item.basePrice,
        costType: item.costType,
        category,
        notes: item.notes,
      });
    });

    return grouped;
  }, [filteredItems]);

  // Category metadata
  const categoryMeta: Record<ActivityCategory, { label: string; icon: React.ReactNode; color: string }> = {
    wildlife: {
      label: 'Wildlife Experiences',
      icon: <Binoculars className="w-5 h-5" />,
      color: 'text-green-600',
    },
    nature: {
      label: 'Nature & Hiking',
      icon: <Footprints className="w-5 h-5" />,
      color: 'text-emerald-600',
    },
    water: {
      label: 'Water Activities',
      icon: <Ship className="w-5 h-5" />,
      color: 'text-blue-600',
    },
    adventure: {
      label: 'Adventure & Sports',
      icon: <Mountain className="w-5 h-5" />,
      color: 'text-orange-600',
    },
    cultural: {
      label: 'Cultural Experiences',
      icon: <Users className="w-5 h-5" />,
      color: 'text-purple-600',
    },
    other: {
      label: 'Other Activities',
      icon: <Eye className="w-5 h-5" />,
      color: 'text-gray-600',
    },
  };

  const toggleCategory = (category: ActivityCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleToggle = (activityId: string) => {
    if (selectedIds.includes(activityId)) {
      onChange(selectedIds.filter(id => id !== activityId));
    } else {
      onChange([...selectedIds, activityId]);
    }
  };

  const handleQuantityChange = (activityId: string, delta: number) => {
    const currentQty = quantities[activityId] || 1;
    const newQty = Math.max(1, Math.min(20, currentQty + delta));
    onQuantityChange?.(activityId, newQty);
  };

  const getActivityIcon = (category: ActivityCategory, name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('night')) return <Moon className="w-4 h-4" />;
    if (lowerName.includes('cycling') || lowerName.includes('bike')) return <Bike className="w-4 h-4" />;
    if (lowerName.includes('drive')) return <Car className="w-4 h-4" />;
    if (lowerName.includes('boat') || lowerName.includes('cruise')) return <Ship className="w-4 h-4" />;
    if (lowerName.includes('hiking') || lowerName.includes('mountain')) return <Mountain className="w-4 h-4" />;
    return categoryMeta[category].icon;
  };

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading activities...</div>;
  }

  if (filteredItems.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
        No activities available for this park
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(Object.keys(categoryMeta) as ActivityCategory[]).map(category => {
        const activities = categorizedActivities[category];
        if (activities.length === 0) return null;

        const meta = categoryMeta[category];
        const isExpanded = expandedCategories.has(category);

        return (
          <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className={meta.color}>{meta.icon}</div>
                <span className="font-semibold text-gray-900">{meta.label}</span>
                <span className="text-xs text-gray-500">({activities.length})</span>
              </div>
              <div className="text-gray-400">
                {isExpanded ? '−' : '+'}
              </div>
            </button>

            {/* Activities Grid */}
            {isExpanded && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activities.map(activity => {
                  const isSelected = selectedIds.includes(activity.id);
                  const quantity = quantities[activity.id] || 1;

                  return (
                    <div
                      key={activity.id}
                      className={`relative border-2 rounded-lg p-3 transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <button
                        onClick={() => handleToggle(activity.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                        style={{
                          borderColor: isSelected ? '#10b981' : '#d1d5db',
                          backgroundColor: isSelected ? '#10b981' : 'white',
                        }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </button>

                      {/* Favorite Star */}
                      {parkId && isActivityFavorite && onToggleFavorite && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(parkId, activity.id);
                          }}
                          className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isActivityFavorite(parkId, activity.id)
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          title={isActivityFavorite(parkId, activity.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star className={`w-4 h-4 ${isActivityFavorite(parkId, activity.id) ? 'fill-current' : ''}`} />
                        </button>
                      )}

                      {/* Activity Icon */}
                      <div className={`mb-2 ${meta.color}`}>
                        {getActivityIcon(category, activity.name)}
                      </div>

                      {/* Activity Name */}
                      <h4 className="text-sm font-semibold text-gray-900 mb-1 pr-8">
                        {activity.name}
                      </h4>

                      {/* Price */}
                      <div className="text-lg font-bold text-blue-600 mb-2">
                        {formatCurrency(activity.price)}
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        {activity.costType.replace(/_/g, ' ')}
                      </div>

                      {/* Quantity Controls */}
                      {isSelected && onQuantityChange && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                          <span className="text-xs text-gray-600 flex-1">Quantity:</span>
                          <button
                            onClick={() => handleQuantityChange(activity.id, -1)}
                            disabled={quantity <= 1}
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-semibold w-8 text-center">{quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(activity.id, 1)}
                            disabled={quantity >= 20}
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Notes */}
                      {activity.notes && (
                        <div className="text-xs text-gray-500 mt-2 italic">
                          {activity.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
