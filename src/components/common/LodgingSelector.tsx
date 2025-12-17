import React from 'react';
import { useCatalog } from '../../hooks/useCatalog';
import { Select } from './Select';

interface LodgingSelectorProps {
  value?: string;
  onChange: (lodgingId?: string) => void;
  location?: string;
}

export const LodgingSelector: React.FC<LodgingSelectorProps> = ({
  value,
  onChange,
  location,
}) => {
  const { items, loading } = useCatalog('accommodation');

  if (loading) {
    return <div className="text-sm text-gray-500">Loading lodging options...</div>;
  }

  const filteredItems = location
    ? items.filter((item) => 'location' in item && item.location === location)
    : items;

  const options = [
    { value: '', label: 'None' },
    ...filteredItems.map((item) => ({
      value: item.id,
      label: item.name + ('location' in item && item.location ? ` (${item.location})` : ''),
    })),
  ];

  return (
    <Select
      label="Lodging"
      value={value || ''}
      onChange={(val) => onChange(val || undefined)}
      options={options}
    />
  );
};

