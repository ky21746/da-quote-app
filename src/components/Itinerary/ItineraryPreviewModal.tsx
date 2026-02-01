/**
 * Itinerary Preview Modal
 * Displays generated itinerary content in a modal
 */

import React, { useEffect, useState } from 'react';
import { X, Download, ExternalLink, Calendar, Users, MapPin, Loader2 } from 'lucide-react';
import { ItineraryContent, ItineraryDocument } from '../../types/itinerary';
import { getItineraryApiClient } from '../../services/itineraryApi';

interface ItineraryPreviewModalProps {
  itineraryId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ItineraryPreviewModal: React.FC<ItineraryPreviewModalProps> = ({
  itineraryId,
  isOpen,
  onClose,
}) => {
  const [content, setContent] = useState<ItineraryContent | null>(null);
  const [documents, setDocuments] = useState<ItineraryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && itineraryId) {
      loadItinerary();
    }
  }, [isOpen, itineraryId]);

  const loadItinerary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiClient = getItineraryApiClient();
      const response: any = await apiClient.getItinerary(itineraryId);

      console.log('Itinerary response:', response);

      // The API returns the itinerary data directly, not wrapped in content
      if (response.status === 'draft' || response.tripTitle) {
        // Convert API response to ItineraryContent format
        const adults = response.quoteData?.travelers?.adults || 0;
        const children = response.quoteData?.travelers?.children || 0;
        const totalTravelers = adults + children;
        const totalDays = response.days?.length || 0;
        const parkNames = (response.days || []).map((d: any) => d.park?.name).filter(Boolean);
        const parks = Array.from(new Set(parkNames));
        
        const itineraryContent: any = {
          title: response.tripTitle || response.coverPage?.title || 'Trip Itinerary',
          subtitle: response.coverPage?.subtitle || '',
          summary: {
            travelers: totalTravelers,
            days: totalDays,
            nights: Math.max(0, totalDays - 1),
            parks: parks,
            highlights: [],
          },
          tripDates: {
            start: new Date(response.tripDates?.start?._seconds * 1000 || Date.now()).toISOString(),
            end: new Date(response.tripDates?.end?._seconds * 1000 || Date.now()).toISOString(),
          },
          travelers: {
            adults: adults,
            children: children,
          },
          days: response.days || [],
          pricing: response.quoteData ? {
            totalPrice: response.quoteData.totalPrice,
            perPersonPrice: response.quoteData.perPersonPrice,
            currency: response.quoteData.currency || 'USD',
          } : undefined,
        };
        setContent(itineraryContent as ItineraryContent);
        setDocuments(response.exports ? [response.exports.pdf, response.exports.web].filter(Boolean) : []);
      } else if (response.status === 'failed') {
        setError('Failed to generate itinerary');
      } else if (response.status === 'processing') {
        setError('Itinerary is still being generated. Please wait...');
        setTimeout(loadItinerary, 3000);
      }
    } catch (err: any) {
      console.error('Failed to load itinerary:', err);
      setError(err.message || 'Failed to load itinerary');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-primary-600 text-white">
          <h2 className="text-2xl font-bold">Trip Itinerary</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading itinerary...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                <p className="text-red-800 font-semibold mb-2">Error</p>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={loadItinerary}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : content ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{content.title}</h1>
                {content.subtitle && (
                  <p className="text-lg text-gray-700 mb-4">{content.subtitle}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-600" />
                    <span className="font-medium">{content.summary.travelers} Travelers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    <span className="font-medium">{content.summary.days} Days / {content.summary.nights} Nights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <span className="font-medium">{content.summary.parks.join(', ')}</span>
                  </div>
                </div>

                {content.summary.highlights && content.summary.highlights.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Highlights:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {content.summary.highlights.map((highlight, idx) => (
                        <li key={idx} className="text-gray-700">{highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Days */}
              {content.days.map((day) => (
                <div key={day.dayNumber} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Day Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                      Day {day.dayNumber}: {day.title}
                    </h2>
                    {day.date && (
                      <p className="text-sm text-gray-600 mt-1">{day.date}</p>
                    )}
                  </div>

                  {/* Day Content */}
                  <div className="p-6 space-y-4">
                    <p className="text-gray-700">{day.description}</p>

                    {/* Timeline */}
                    {day.timeline && day.timeline.length > 0 && (
                      <div className="space-y-3">
                        {day.timeline.map((item, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="flex-shrink-0 w-16 text-sm font-medium text-gray-600">
                              {item.time || ''}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{item.activity}</h4>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Accommodation */}
                    {day.accommodation && (
                      <div className="bg-blue-50 rounded-lg p-4 mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Accommodation: {day.accommodation.name}
                        </h4>
                        <p className="text-sm text-gray-700">{day.accommodation.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Documents */}
              {documents.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Download className="w-5 h-5 text-primary-600" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{doc.title}</p>
                          <p className="text-xs text-gray-500">{doc.type.toUpperCase()}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
