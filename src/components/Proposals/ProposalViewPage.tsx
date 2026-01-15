import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quoteService, SavedQuote } from '../../services/quoteService';
import { Button } from '../common';
import { useTrip } from '../../context/TripContext';

export const ProposalViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setDraft, setCalculationResult, setDraftQuoteId, setSourceQuoteId, setReferenceNumber } = useTrip();

  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<SavedQuote | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    quoteService
      .getQuote(id)
      .then((q) => {
        if (cancelled) return;
        setQuote(q);
      })
      .catch((e: any) => {
        if (cancelled) return;
        setError(e?.message || 'Failed to load proposal');
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const formatReferenceNumber = (referenceNumber?: number) => {
    if (!referenceNumber) return '—';
    return `217-${String(referenceNumber - 217000).padStart(3, '0')}`;
  };

  const handleEdit = () => {
    if (!quote?.id) return;
    if (!quote.draft) return;

    setDraft(quote.draft);
    setCalculationResult(null);
    setDraftQuoteId(null);
    setSourceQuoteId(quote.id);
    setReferenceNumber(typeof quote.referenceNumber === 'number' ? quote.referenceNumber : null);

    navigate(`/trip/${quote.id}/edit`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8 lg:p-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Proposal</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/proposals')}>Back to List</Button>
            <Button variant="secondary" onClick={() => navigate('/trip/new')}>New Trip</Button>
          </div>
        </div>

        {isLoading && <div className="text-sm text-gray-600">Loading...</div>}
        {error && <div className="text-sm text-red-700">{error}</div>}

        {!isLoading && !error && !quote && (
          <div className="text-sm text-gray-600">Not found.</div>
        )}

        {!isLoading && !error && quote && (
          <>
            <div className="mb-6 p-4 bg-brand-olive/5 border border-brand-olive/20 rounded">
              <div className="text-xs font-semibold text-brand-olive/80 uppercase tracking-wide">Proposal Ref</div>
              <div className="text-xl font-bold text-brand-dark">
                {formatReferenceNumber(quote.referenceNumber)}
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded">
              <div className="font-semibold text-gray-700 mb-1">{quote.tripName}</div>
              <div className="text-sm text-gray-600">
                {quote.travelers} travelers • {quote.days} days • {quote.tier}
              </div>
              {typeof quote.grandTotal === 'number' && (
                <div className="text-sm text-gray-700 mt-2">
                  Total: <span className="font-semibold">USD {quote.grandTotal.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button variant="primary" onClick={handleEdit}>Edit (New Version)</Button>
              <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
