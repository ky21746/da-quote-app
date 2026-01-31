/**
 * Itinerary Button Component
 * Displays on Pricing page to generate/view itinerary
 */

import React from 'react';
import { FileText, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface ItineraryButtonProps {
  status: 'none' | 'processing' | 'completed' | 'failed' | 'outdated';
  isLoading?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const ItineraryButton: React.FC<ItineraryButtonProps> = ({
  status,
  isLoading = false,
  onClick,
  disabled = false,
}) => {
  // Determine button appearance based on status
  const getButtonConfig = () => {
    switch (status) {
      case 'none':
        return {
          icon: FileText,
          text: 'Generate Itinerary',
          className: 'bg-primary-600 hover:bg-primary-700 text-white',
          iconClassName: 'text-white',
        };
      case 'processing':
        return {
          icon: Loader2,
          text: 'Generating...',
          className: 'bg-gray-400 text-white cursor-wait',
          iconClassName: 'text-white animate-spin',
        };
      case 'completed':
        return {
          icon: CheckCircle,
          text: 'View Itinerary',
          className: 'bg-green-600 hover:bg-green-700 text-white',
          iconClassName: 'text-white',
        };
      case 'failed':
        return {
          icon: AlertCircle,
          text: 'Retry Generation',
          className: 'bg-red-600 hover:bg-red-700 text-white',
          iconClassName: 'text-white',
        };
      case 'outdated':
        return {
          icon: RefreshCw,
          text: 'Regenerate Itinerary',
          className: 'bg-orange-600 hover:bg-orange-700 text-white',
          iconClassName: 'text-white',
        };
      default:
        return {
          icon: FileText,
          text: 'Generate Itinerary',
          className: 'bg-primary-600 hover:bg-primary-700 text-white',
          iconClassName: 'text-white',
        };
    }
  };

  const config = getButtonConfig();
  const Icon = config.icon;
  const isDisabled = disabled || status === 'processing' || isLoading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        flex items-center gap-2 px-6 py-3 rounded-lg font-semibold
        transition-all duration-200 shadow-md hover:shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        ${config.className}
      `}
    >
      <Icon className={`w-5 h-5 ${config.iconClassName}`} />
      <span>{config.text}</span>
    </button>
  );
};
