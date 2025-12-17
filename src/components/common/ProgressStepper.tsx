import React from 'react';

interface ProgressStepperProps {
  currentStep: number;
  steps: string[];
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  currentStep,
  steps,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isDisabled = stepNumber > currentStep;

          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? '✓' : stepNumber}
                </div>
                <span
                  className={`mt-2 text-xs text-center ${
                    isActive
                      ? 'font-semibold text-blue-600'
                      : isDisabled
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

