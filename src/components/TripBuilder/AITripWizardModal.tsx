import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle } from 'lucide-react';
import { generateAutoTrip, validateAutoTrip, type AutoTripRequest } from '../../services/AutoItineraryBuilder';
import { TripDraft } from '../../types/ui';

interface AITripWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripGenerated: (trip: TripDraft) => void;
}

export const AITripWizardModal: React.FC<AITripWizardModalProps> = ({
  isOpen,
  onClose,
  onTripGenerated,
}) => {
  const [step, setStep] = useState<'form' | 'warnings' | 'generating'>('form');
  const [formData, setFormData] = useState({
    adults: 2,
    children: [] as number[],
    durationDays: 5,
    budgetTier: 'Mid-Range' as 'Luxury' | 'Mid-Range' | 'Budget',
    focus: 'Gorillas' as 'Gorillas' | 'Chimps' | 'General',
  });
  const [generatedTrip, setGeneratedTrip] = useState<TripDraft | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [childAges, setChildAges] = useState<string>('');

  if (!isOpen) return null;

  const handleGenerate = () => {
    // Parse child ages
    const childAgesArray = childAges
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n > 0);

    const request: AutoTripRequest = {
      travelers: {
        adults: formData.adults,
        children: childAgesArray,
      },
      durationDays: formData.durationDays,
      budgetTier: formData.budgetTier,
      focus: formData.focus,
    };

    setStep('generating');

    // Simulate brief loading
    setTimeout(() => {
      const trip = generateAutoTrip(request);
      const validationWarnings = validateAutoTrip(trip);

      setGeneratedTrip(trip);
      setWarnings(validationWarnings);

      if (validationWarnings.length > 0) {
        setStep('warnings');
      } else {
        // No warnings, proceed directly
        onTripGenerated(trip);
        handleClose();
      }
    }, 500);
  };

  const handleConfirm = () => {
    if (generatedTrip) {
      onTripGenerated(generatedTrip);
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('form');
    setWarnings([]);
    setGeneratedTrip(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">AI Trip Wizard</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' && (
            <div className="space-y-6">
              <p className="text-gray-600">
                Answer a few questions and let AI build your perfect Uganda safari itinerary.
              </p>

              {/* Question 1: Travelers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. How many travelers?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Adults</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.adults}
                      onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Children (ages, comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 8, 12"
                      value={childAges}
                      onChange={(e) => setChildAges(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Question 2: Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. How many days?
                </label>
                <input
                  type="number"
                  min="3"
                  max="21"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 3 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Question 3: Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3. What's your budget level?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Budget', 'Mid-Range', 'Luxury'] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setFormData({ ...formData, budgetTier: tier })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.budgetTier === tier
                          ? 'border-purple-600 bg-purple-50 text-purple-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 4: Focus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4. What's your main focus?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Gorillas', 'Chimps', 'General'] as const).map((focus) => (
                    <button
                      key={focus}
                      onClick={() => setFormData({ ...formData, focus })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.focus === focus
                          ? 'border-purple-600 bg-purple-50 text-purple-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {focus}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Trip
                </button>
              </div>
            </div>
          )}

          {step === 'generating' && (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
              <p className="text-gray-600">Generating your perfect itinerary...</p>
            </div>
          )}

          {step === 'warnings' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-900 mb-2">
                      Age Restrictions Detected
                    </h3>
                    <div className="space-y-2 text-sm text-yellow-800">
                      {warnings.map((warning, idx) => (
                        <p key={idx}>{warning}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-600">
                The trip has been generated, but some travelers may not be able to participate in certain activities due to age restrictions. Do you want to continue?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Continue Anyway
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
