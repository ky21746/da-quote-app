import React from 'react';
import { useCatalog } from '../../hooks/useCatalog';
import { Select } from './Select';

interface DomesticFlightSelectorProps {
  value?: string;
  onChange: (routeId?: string) => void;
}

export const DomesticFlightSelector: React.FC<DomesticFlightSelectorProps> = ({
  value,
  onChange,
}) => {
  const { items, loading } = useCatalog('domestic-flight');

  if (loading) {
    return <div className="text-sm text-gray-500">Loading flight routes...</div>;
  }

  const options = [
    { value: '', label: 'None' },
    ...items.map((item) => ({
      value: item.id,
      label: item.name,
    })),
  ];

  return (
    <Select
      label="Domestic Flight"
      value={value || ''}
      onChange={(val) => onChange(val || undefined)}
      options={options}
    />
  );
};

