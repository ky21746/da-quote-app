import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { Button, ProgressStepper } from '../common';
import { ParkCard } from '../../types/ui';
import {
  getParkName,
  getArrivalOption,
  getLodgingOption,
  getTransportOption,
  getActivityOptions,
  getExtraOptions,
  getLogisticsArrivalOption,
  getLogisticsVehicleOption,
  getLogisticsInternalOptions,
} from '../../data/catalogHelpers';

export const ReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { draft } = useTrip();

  const progressSteps = [
    'Basic Setup',
    'Attractions & Parks',
    'Logistics',
    'Review & Pricing',
  ];

  if (!draft) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Draft not loaded</p>
          <Button onClick={() => navigate('/trip/new')}>Start New Trip</Button>
        </div>
      </div>
    );
  }

  const parks = draft.parks || [];

  const renderParkReview = (card: ParkCard, index: number) => {
    const parkName = getParkName(card.parkId);
    const arrivalOption = getArrivalOption(card.arrival);
    const lodgingOption = getLodgingOption(card.lodging);
    const transportOption = getTransportOption(card.transport);
    const activityOptions = getActivityOptions(card.activities);
    const extraOptions = getExtraOptions(card.extras);
    const logistics = card.logistics;
    const logisticsArrival = logistics ? getLogisticsArrivalOption(logistics.arrival) : undefined;
    const logisticsVehicle = logistics ? getLogisticsVehicleOption(logistics.vehicle) : undefined;
    const logisticsInternal = logistics ? getLogisticsInternalOptions(logistics.internalMovements) : [];

    return (
      <div key={card.id} className="mb-6 p-4 border border-gray-300 rounded-lg bg-white">
        {/* Park Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{parkName}</h3>
          <Button
            onClick={() => navigate(`/trip/${id}/edit`)}
            variant="secondary"
            type="button"
          >
            Edit Park
          </Button>
        </div>

        {/* Selected Components */}
        <div className="space-y-4">
          {/* Arrival / Aviation */}
          {arrivalOption ? (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Arrival / Aviation:</span>{' '}
              <span className="text-gray-600">{arrivalOption.name}</span>
              {arrivalOption.price && (
                <span className="text-gray-500 ml-2">({arrivalOption.price})</span>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400">Arrival / Aviation: Not selected</div>
          )}

          {/* Lodging */}
          {lodgingOption ? (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Lodging:</span>{' '}
              <span className="text-gray-600">{lodgingOption.name}</span>
              {lodgingOption.tier && (
                <span className="text-gray-500 ml-2">({lodgingOption.tier})</span>
              )}
              {lodgingOption.price && (
                <span className="text-gray-500 ml-2">- {lodgingOption.price}</span>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400">Lodging: Not selected</div>
          )}

          {/* Transportation */}
          {transportOption ? (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Transportation:</span>{' '}
              <span className="text-gray-600">{transportOption.name}</span>
              {transportOption.price && (
                <span className="text-gray-500 ml-2">({transportOption.price})</span>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400">Transportation: Not selected</div>
          )}

          {/* Activities */}
          {activityOptions.length > 0 ? (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Activities:</span>
              <ul className="ml-4 mt-1 space-y-1">
                {activityOptions.map((activity) => (
                  <li key={activity.id} className="text-gray-600">
                    {activity.name}
                    {activity.price && (
                      <span className="text-gray-500 ml-2">({activity.price})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Activities: None selected</div>
          )}

          {/* Extras */}
          {extraOptions.length > 0 ? (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Extras:</span>
              <ul className="ml-4 mt-1 space-y-1">
                {extraOptions.map((extra) => (
                  <li key={extra.id} className="text-gray-600">
                    {extra.name}
                    {extra.price && (
                      <span className="text-gray-500 ml-2">({extra.price})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Extras: None selected</div>
          )}

          {/* Logistics */}
          {logistics && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Logistics</h4>
              <div className="space-y-2 text-sm">
                {logisticsArrival ? (
                  <div>
                    <span className="font-medium text-gray-700">Arrival Between Parks:</span>{' '}
                    <span className="text-gray-600">{logisticsArrival.name}</span>
                    {logisticsArrival.price && (
                      <span className="text-gray-500 ml-2">({logisticsArrival.price})</span>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400">Arrival Between Parks: Not selected</div>
                )}

                {logisticsVehicle ? (
                  <div>
                    <span className="font-medium text-gray-700">Vehicle & Driver:</span>{' '}
                    <span className="text-gray-600">{logisticsVehicle.name}</span>
                    {logisticsVehicle.price && (
                      <span className="text-gray-500 ml-2">({logisticsVehicle.price})</span>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400">Vehicle & Driver: Not selected</div>
                )}

                {logisticsInternal.length > 0 ? (
                  <div>
                    <span className="font-medium text-gray-700">Internal Movements:</span>
                    <ul className="ml-4 mt-1 space-y-1">
                      {logisticsInternal.map((movement) => (
                        <li key={movement.id} className="text-gray-600">
                          {movement.name}
                          {movement.price && (
                            <span className="text-gray-500 ml-2">({movement.price})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-gray-400">Internal Movements: None selected</div>
                )}

                {logistics.notes && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="font-medium text-gray-700">Notes:</span>{' '}
                    <span className="text-gray-600 italic">{logistics.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Review</h1>

        <ProgressStepper currentStep={4} steps={progressSteps} />

        {/* Trip Overview Card */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="font-semibold text-gray-700 mb-3">Trip Overview</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">Trip Name:</span> {draft.name}
            </div>
            <div>
              <span className="font-medium">Number of Travelers:</span> {draft.travelers}
            </div>
            <div>
              <span className="font-medium">Number of Days:</span> {draft.days}
            </div>
            <div>
              <span className="font-medium">Tier:</span> {draft.tier}
            </div>
          </div>
        </div>

        {/* Parks Review */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Parks Review</h2>
          {parks.length === 0 ? (
            <div className="p-4 border border-gray-200 rounded-lg text-center text-gray-500">
              No parks added yet
            </div>
          ) : (
            <div className="space-y-4">{parks.map((card, index) => renderParkReview(card, index))}</div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex gap-2">
          <Button onClick={() => navigate(-1)} variant="secondary">
            Back
          </Button>
          <Button
            onClick={() => navigate(`/trip/${id}/pricing`)}
            variant="primary"
          >
            Proceed to Pricing
          </Button>
        </div>
      </div>
    </div>
  );
};

