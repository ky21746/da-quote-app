import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { validateGorillaTrekking } from '../../utils/tripValidations';

interface TripValidationWarningsProps {
  ages?: number[];
  parkId?: string;
  arrival?: string;
  arrivalNA?: boolean;
  activities?: string[];
  activitiesNA?: boolean;
}

/**
 * Component to display validation warnings for trip planning
 * Shows age restrictions, activity limitations, etc.
 */
export const TripValidationWarnings: React.FC<TripValidationWarningsProps> = ({
  ages,
  parkId,
  arrival,
  arrivalNA,
  activities,
  activitiesNA,
}) => {
  const warnings: Array<{ type: 'warning' | 'info'; message: string; suggestion?: string }> = [];

  // Validate arrival - must either select OR mark as N/A
  if (parkId && !arrival && !arrivalNA) {
    warnings.push({
      type: 'warning',
      message: 'Arrival transport required',
      suggestion: 'Please select arrival transport or mark as N/A if not needed',
    });
  }

  // Validate activities - must either select OR mark as N/A
  if (parkId && (!activities || activities.length === 0) && !activitiesNA) {
    warnings.push({
      type: 'warning',
      message: 'Activities selection required',
      suggestion: 'Please select at least one activity or mark as N/A if no activities planned',
    });
  }

  // Check for Bwindi (gorilla trekking)
  if (ages && ages.length > 0) {
    const isBwindi = parkId?.toLowerCase().includes('bwindi') || parkId === 'park_1';
    
    if (isBwindi) {
      const gorillaWarning = validateGorillaTrekking(ages);
      if (gorillaWarning) {
        warnings.push({
          type: 'warning',
          message: gorillaWarning.message,
          suggestion: gorillaWarning.suggestion,
        });
      }
    }
  }

  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {warnings.map((warning, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${
            warning.type === 'warning'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-blue-50 border-blue-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {warning.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`font-semibold ${
                  warning.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'
                }`}
              >
                {warning.message}
              </p>
              {warning.suggestion && (
                <p
                  className={`text-sm mt-1 ${
                    warning.type === 'warning' ? 'text-yellow-700' : 'text-blue-700'
                  }`}
                >
                  💡 {warning.suggestion}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
