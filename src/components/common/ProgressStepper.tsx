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
      <div className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isDisabled = stepNumber > currentStep;

          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center w-full relative">
                {/* Circle */}
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium relative z-10 ${
                    isActive
                      ? 'bg-brand-gold text-white'
                      : isCompleted
                      ? 'bg-brand-olive text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? '✓' : stepNumber}
                </div>

                {/* Label - Hidden on mobile (<=768px), visible on desktop/tablet (>768px) */}
                <span
                  className={`hidden md:inline-block mt-2 text-sm text-center leading-tight whitespace-nowrap min-h-[1.25rem] ${
                    isActive
                      ? 'font-semibold text-brand-gold'
                      : isDisabled
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}
                >
                  {step}
                </span>

                {/* Connector - centered on circle, spans to next circle */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 h-0.5 ${
                      isCompleted ? 'bg-brand-olive' : 'bg-gray-200'
                    }`}
                    style={{ 
                      width: 'calc(100% - 1rem)',
                      marginLeft: '0.5rem',
                      zIndex: 0
                    }}
                  />
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

