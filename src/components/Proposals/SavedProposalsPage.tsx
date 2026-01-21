import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quoteService, SavedQuote } from '../../services/quoteService';
import { Button } from '../common';

export const SavedProposalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/trip/new');
    }
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    quoteService
      .getFinalQuotes()
      .then((results) => {
        if (cancelled) return;
        setQuotes(results);
      })
      .catch((e: any) => {
        if (cancelled) return;
        setError(e?.message || 'Failed to load proposals');
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const formatReferenceNumber = (referenceNumber?: number) => {
    if (!referenceNumber) return '—';
    return `217-${String(referenceNumber - 217000).padStart(3, '0')}`;
  };

  const formatDateTime = (d?: Date) => {
    if (!d) return '—';
    const date = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString();
  };

  const sortedQuotes = [...quotes].sort((a, b) => {
    const at = a?.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a?.createdAt as any).getTime();
    const bt = b?.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b?.createdAt as any).getTime();
    return (Number.isFinite(bt) ? bt : 0) - (Number.isFinite(at) ? at : 0);
  });

  const handleDelete = async (q: SavedQuote) => {
    const id = q.id;
    if (!id) return;

    const first = window.confirm(`למחוק את ההצעה ${formatReferenceNumber(q.referenceNumber)}? לא ניתן לשחזר.`);
    if (!first) return;

    const second = window.prompt('כדי לאשר מחיקה, הקלד DELETE:');
    if (second !== 'DELETE') return;

    try {
      setDeletingId(id);
      await quoteService.deleteQuote(id);
      setQuotes((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      setError(e?.message || 'נכשלה מחיקת ההצעה');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8 lg:p-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Saved Proposals</h1>
          <div className="flex gap-2">
            <Button onClick={handleBack} variant="secondary">
              Back
            </Button>
            <Button onClick={() => navigate('/trip/new')} variant="secondary">
              New Trip
            </Button>
          </div>
        </div>

        {isLoading && <div className="text-sm text-gray-600">Loading...</div>}
        {error && <div className="text-sm text-red-700">{error}</div>}

        {!isLoading && !error && quotes.length === 0 && (
          <div className="text-sm text-gray-600">No saved proposals yet.</div>
        )}

        {!isLoading && !error && quotes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left">Proposal Ref</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Trip</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Created</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Updated</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Status</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Total</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2 font-semibold text-brand-dark">
                      {formatReferenceNumber(q.referenceNumber)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">{q.tripName}</td>
                    <td className="border border-gray-300 px-3 py-2">{formatDateTime(q.createdAt)}</td>
                    <td className="border border-gray-300 px-3 py-2">{formatDateTime(q.updatedAt)}</td>
                    <td className="border border-gray-300 px-3 py-2">{q.status}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      {typeof q.grandTotal === 'number' ? `USD ${q.grandTotal.toFixed(2)}` : '—'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => navigate(`/proposals/${q.id}`)}
                          disabled={!q.id || deletingId === q.id}
                        >
                          View
                        </Button>

                        <Button
                          variant="secondary"
                          onClick={() => handleDelete(q)}
                          disabled={!q.id || deletingId === q.id}
                        >
                          {deletingId === q.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
