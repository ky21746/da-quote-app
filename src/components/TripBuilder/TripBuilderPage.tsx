import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { Input, Select, Button, ProgressStepper } from '../common';
import { TripDraft, TripTier } from '../../types/ui';
import { quoteService } from '../../services/quoteService';
import { AITripWizardModal } from './AITripWizardModal';

export const TripBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { setDraft, setDraftQuoteId, setSourceQuoteId, setReferenceNumber } = useTrip();
  const [isCreating, setIsCreating] = useState(false);
  const [showAIWizard, setShowAIWizard] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    travelers: number;
    days: number;
    travelMonth: number;
    tier: TripTier;
    ages: number[];
  }>({
    name: '',
    travelers: 2,
    days: 7,
    travelMonth: new Date().getMonth() + 1, // Current month (1-12)
    tier: 'standard',
    ages: [30, 30], // Default adult ages
  });

  const handleAITripGenerated = async (trip: TripDraft) => {
    // Save the AI-generated trip to context and navigate
    setDraftQuoteId(null);
    setSourceQuoteId(null);
    setReferenceNumber(null);
    setDraft(trip);

    setIsCreating(true);
    try {
      const id = await quoteService.saveDraft(trip);
      setDraftQuoteId(id);
      navigate(`/trip/${id}/edit`);
    } catch (error: any) {
      console.error('Failed to save AI-generated trip:', error);
      alert(`Failed to save trip: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

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
      ages: formData.ages,
      days: formData.days,
      travelMonth: formData.travelMonth,
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Trip Builder</h1>
          <button
            onClick={() => setShowAIWizard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Sparkles className="w-5 h-5" />
            AI Trip Wizard
          </button>
        </div>

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
              const currentAges = formData.ages;
              let newAges = [...currentAges];
              
              // Adjust ages array to match travelers count
              if (newTravelers > currentAges.length) {
                // Add more travelers (default age 30)
                const diff = newTravelers - currentAges.length;
                newAges = [...currentAges, ...Array(diff).fill(30)];
              } else if (newTravelers < currentAges.length) {
                // Remove excess travelers
                newAges = currentAges.slice(0, newTravelers);
              }
              
              setFormData({ ...formData, travelers: newTravelers, ages: newAges });
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

          <Select
            label="Travel Month (for seasonality)"
            value={String(formData.travelMonth)}
            onChange={(value) => setFormData({ ...formData, travelMonth: Number(value) })}
            options={[
              { value: '1', label: 'January' },
              { value: '2', label: 'February' },
              { value: '3', label: 'March' },
              { value: '4', label: 'April' },
              { value: '5', label: 'May' },
              { value: '6', label: 'June' },
              { value: '7', label: 'July' },
              { value: '8', label: 'August' },
              { value: '9', label: 'September' },
              { value: '10', label: 'October' },
              { value: '11', label: 'November' },
              { value: '12', label: 'December' },
            ]}
            required
          />

          {/* Ages */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ages (per traveler)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {formData.ages.map((age, index) => (
                <Input
                  key={index}
                  label={`Traveler ${index + 1}`}
                  type="number"
                  value={age}
                  onChange={(value) => {
                    const newAges = [...formData.ages];
                    newAges[index] = value as number;
                    setFormData({ ...formData, ages: newAges });
                  }}
                  min={0}
                  max={120}
                  required
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

      <AITripWizardModal
        isOpen={showAIWizard}
        onClose={() => setShowAIWizard(false)}
        onTripGenerated={handleAITripGenerated}
      />
    </div>
  );
};

