import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { Input, Select, Button, ProgressStepper } from '../common';
import { TripDraft, TripTier, AgeRange } from '../../types/ui';
import { quoteService } from '../../services/quoteService';

export const TripBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { setDraft, setDraftQuoteId, setSourceQuoteId, setReferenceNumber } = useTrip();
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    travelers: number;
    days: number;
    tier: TripTier;
    ageRanges: AgeRange[];
  }>({
    name: '',
    travelers: 2,
    days: 7,
    tier: 'standard',
    ageRanges: ['adult', 'adult'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
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
      ageRanges: formData.ageRanges,
      days: formData.days,
      tier: formData.tier,
    };

    setDraftQuoteId(null);
    setSourceQuoteId(null);
    setReferenceNumber(null);
    setDraft(draft);

    setIsCreating(true);
    try {
      const id = await quoteService.saveDraft(draft);
      setDraftQuoteId(id);
      navigate(`/trip/${id}/edit`);
    } catch (error: any) {
      console.error('Failed to create trip draft:', error);
      alert(`Failed to create trip draft: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const progressSteps = [
    'Setup',
    'Parks',
    'Logistics',
    'Pricing',
  ];

  const canContinue = Boolean(formData.name.trim()) && !isCreating;

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
            onChange={(value) => {
              const newTravelers = value as number;
              const currentAgeRanges = formData.ageRanges;
              let newAgeRanges = [...currentAgeRanges];
              
              // Adjust ageRanges array to match travelers count
              if (newTravelers > currentAgeRanges.length) {
                // Add more travelers (default to adult)
                const diff = newTravelers - currentAgeRanges.length;
                newAgeRanges = [...currentAgeRanges, ...Array(diff).fill('adult')];
              } else if (newTravelers < currentAgeRanges.length) {
                // Remove excess travelers
                newAgeRanges = currentAgeRanges.slice(0, newTravelers);
              }
              
              setFormData({ ...formData, travelers: newTravelers, ageRanges: newAgeRanges });
            }}
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

          {/* Age Ranges */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age Ranges (per traveler)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {formData.ageRanges.map((ageRange, index) => (
                <Select
                  key={index}
                  label={`Traveler ${index + 1}`}
                  value={ageRange}
                  onChange={(value) => {
                    const newAgeRanges = [...formData.ageRanges];
                    newAgeRanges[index] = value as AgeRange;
                    setFormData({ ...formData, ageRanges: newAgeRanges });
                  }}
                  options={[
                    { value: 'infant', label: 'Infant (0-2)' },
                    { value: 'child', label: 'Child (3-12)' },
                    { value: 'adult', label: 'Adult (13-64)' },
                    { value: 'senior', label: 'Senior (65+)' },
                  ]}
                />
              ))}
            </div>
          </div>

          <Select
            label="Trip Level"
            value={formData.tier}
            onChange={(value) => setFormData({ ...formData, tier: value as TripTier })}
            options={[
              { value: 'budget', label: 'Budget' },
              { value: 'standard', label: 'Standard' },
              { value: 'luxury', label: 'Luxury' },
              { value: 'ultra-luxury', label: 'Ultra Luxury' },
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

