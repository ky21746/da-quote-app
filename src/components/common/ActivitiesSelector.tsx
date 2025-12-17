import React from 'react';
import { useCatalog } from '../../hooks/useCatalog';

interface ActivitiesSelectorProps {
  selectedIds: string[];
  onChange: (activityIds: string[]) => void;
  location?: string;
}

export const ActivitiesSelector: React.FC<ActivitiesSelectorProps> = ({
  selectedIds,
  onChange,
  location,
}) => {
  const { items, loading } = useCatalog('activity');

  if (loading) {
    return <div className="text-sm text-gray-500">Loading activities...</div>;
  }

  const filteredItems = location
    ? items.filter((item) => !('location' in item) || ('location' in item && item.location === location))
    : items;

  const handleToggle = (activityId: string) => {
    if (selectedIds.includes(activityId)) {
      onChange(selectedIds.filter((id) => id !== activityId));
    } else {
      onChange([...selectedIds, activityId]);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Activities</label>
      <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded p-2">
        {filteredItems.length === 0 ? (
          <div className="text-sm text-gray-500">No activities available</div>
        ) : (
          filteredItems.map((activity) => (
            <label key={activity.id} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedIds.includes(activity.id)}
                onChange={() => handleToggle(activity.id)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                {activity.name}
                {'location' in activity && activity.location && (
                  <span className="text-gray-500"> ({activity.location})</span>
                )}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  );
};

