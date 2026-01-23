import React from 'react';
import { Check, MapPin, Calendar, Plane, DollarSign, FileText } from 'lucide-react';

interface ProgressStepperProps {
  currentStep: number;
  steps: string[];
}

// Map step names to professional icons
const getStepIcon = (stepName: string, stepNumber: number) => {
  const name = stepName.toLowerCase();
  if (name.includes('park') || name.includes('destination')) return MapPin;
  if (name.includes('day') || name.includes('itinerary')) return Calendar;
  if (name.includes('logistic') || name.includes('transport')) return Plane;
  if (name.includes('pricing') || name.includes('price')) return DollarSign;
  if (name.includes('summary') || name.includes('review')) return FileText;
  return null;
};

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  currentStep,
  steps,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isDisabled = stepNumber > currentStep;
          const StepIcon = getStepIcon(step, stepNumber);

          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center w-full relative">
                {/* Circle with icon or number */}
                <div
                  className={`
                    w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold relative z-10
                    transition-all duration-300 ease-in-out
                    ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-lg scale-110 ring-4 ring-primary-100'
                        : isCompleted
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 animate-in fade-in zoom-in duration-300" />
                  ) : StepIcon && isActive ? (
                    <StepIcon className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Label with animation */}
                <span
                  className={`
                    hidden md:inline-block mt-2 text-xs text-center leading-tight whitespace-nowrap min-h-[1.25rem]
                    transition-all duration-300
                    ${
                      isActive
                        ? 'font-semibold text-primary-600 scale-105'
                        : isDisabled
                        ? 'text-gray-400'
                        : 'text-gray-600 font-medium'
                    }
                  `}
                >
                  {step}
                </span>

                {/* Animated connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-5 left-1/2 h-0.5 bg-gray-200" style={{ width: 'calc(100% - 1.25rem)', marginLeft: '0.625rem', zIndex: 0 }}>
                    <div
                      className={`h-full transition-all duration-500 ease-in-out ${
                        isCompleted ? 'bg-green-600' : 'bg-transparent'
                      }`}
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

