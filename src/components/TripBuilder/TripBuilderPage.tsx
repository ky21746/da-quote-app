import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { Input, Select, Button, ProgressStepper } from '../common';
import { TripDraft, TripTier } from '../../types/ui';

export const TripBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { setDraft } = useTrip();

  const [formData, setFormData] = useState<{
    name: string;
    travelers: number;
    days: number;
    tier: TripTier;
  }>({
    name: '',
    travelers: 2,
    days: 7,
    tier: 'base',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      return;
    }
    if (formData.travelers < 1) {
      return;
    }
    if (formData.days < 1) {
      return;
    }

    // Save draft to context (local state only, no Firebase in Phase 1)
    const draft: TripDraft = {
      name: formData.name,
      travelers: formData.travelers,
      days: formData.days,
      tier: formData.tier,
    };
    setDraft(draft);

    // Navigate to Phase 2: Parks
    // Use 'draft' as ID for local draft (no backend required)
    navigate('/trip/draft/edit');
  };

  const progressSteps = [
    'Setup',
    'Parks',
    'Logistics',
    'Pricing',
  ];

  const canContinue = Boolean(formData.name.trim());

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8 lg:p-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Trip Builder</h1>

        <ProgressStepper currentStep={1} steps={progressSteps} />

        <form onSubmit={handleSubmit}>
          <Input
            label="Trip Name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value as string })}
            placeholder="Enter trip name"
            required
          />

          <Input
            label="Number of Travelers"
            type="number"
            value={formData.travelers}
            onChange={(value) => setFormData({ ...formData, travelers: value as number })}
            min={1}
            required
          />

          <Input
            label="Number of Days"
            type="number"
            value={formData.days}
            onChange={(value) => setFormData({ ...formData, days: value as number })}
            min={1}
            required
          />

          <Select
            label="Tier"
            value={formData.tier}
            onChange={(value) => setFormData({ ...formData, tier: value as TripTier })}
            options={[
              { value: 'base', label: 'Base' },
              { value: 'quality', label: 'Quality' },
              { value: 'premium', label: 'Premium' },
            ]}
            required
          />

          {!canContinue && (
            <div className="mb-2 text-sm text-red-700">
              Cannot continue: Trip name missing
            </div>
          )}

          <Button type="submit" disabled={!canContinue}>
            Next: Build Trip
          </Button>
        </form>
      </div>
    </div>
  );
};

