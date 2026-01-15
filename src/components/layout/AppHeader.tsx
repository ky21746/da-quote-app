import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { Settings, FileText } from 'lucide-react';
import { useTrip } from '../../context/TripContext';

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { referenceNumber, draft, draftQuoteId, calculationResult, setTravelers } = useTrip();

  const pathname = location.pathname;

  const tripMatch = matchPath({ path: '/trip/:id/*', end: false }, pathname);
  const tripIdFromUrl = tripMatch?.params?.id ?? null;
  const proposalMatch = matchPath({ path: '/proposals/:id', end: false }, pathname);
  const proposalIdFromUrl = proposalMatch?.params?.id ?? null;
  const activeTripId = tripIdFromUrl ?? proposalIdFromUrl ?? draftQuoteId;

  const isTripStep =
    pathname === '/trip/new' ||
    !!matchPath({ path: '/trip/:id/edit', end: false }, pathname) ||
    !!matchPath({ path: '/trip/:id/logistics', end: false }, pathname) ||
    !!matchPath({ path: '/trip/:id/review', end: false }, pathname);

  const isPricingStep =
    !!matchPath({ path: '/trip/:id/pricing', end: false }, pathname) ||
    !!matchPath({ path: '/trip/:id/pricing/manual', end: false }, pathname);

  const isSummaryStep = !!matchPath({ path: '/trip/:id/summary', end: false }, pathname);

  const isProposalStep =
    pathname === '/proposals' || !!matchPath({ path: '/proposals/:id', end: false }, pathname);

  const activeStep: 'trip' | 'pricing' | 'summary' | 'proposal' | null = isTripStep
    ? 'trip'
    : isPricingStep
      ? 'pricing'
      : isSummaryStep
        ? 'summary'
        : isProposalStep
          ? 'proposal'
          : null;

  const getStepButtonClassName = (step: typeof activeStep) => {
    const isActive = step !== null && step === activeStep;
    return [
      'px-3 py-1.5 rounded text-sm font-medium transition-colors',
      isActive ? 'bg-brand-olive/15 text-brand-dark' : 'text-gray-600 hover:bg-gray-100',
    ].join(' ');
  };

  const tripIsReady = Boolean(
    draft &&
      typeof draft.travelers === 'number' &&
      draft.travelers > 0 &&
      typeof draft.name === 'string' &&
      draft.name.trim().length > 0
  );

  const pricingIsReady = Boolean(calculationResult);
  const summaryIsReady = Boolean(calculationResult);
  const proposalIsReady = Boolean(draftQuoteId || proposalIdFromUrl);

  const getStepStatusClassName = (isReady: boolean) => {
    return [
      'inline-block h-2 w-2 rounded-full',
      isReady ? 'bg-green-500' : 'bg-yellow-400',
    ].join(' ');
  };

  const goTrip = () => {
    if (!activeTripId) {
      navigate('/trip/new');
      return;
    }
    navigate(`/trip/${activeTripId}/edit`);
  };

  const goPricing = () => {
    if (!activeTripId) {
      navigate('/trip/new');
      return;
    }
    navigate(`/trip/${activeTripId}/pricing`);
  };

  const goSummary = () => {
    if (!activeTripId) {
      navigate('/trip/new');
      return;
    }
    navigate(`/trip/${activeTripId}/summary`);
  };

  const goProposal = () => {
    if (draftQuoteId) {
      navigate(`/proposals/${draftQuoteId}`);
      return;
    }
    navigate('/proposals');
  };

  const formatReferenceNumber = (n: number) => {
    return `217-${String(n - 217000).padStart(3, '0')}`;
  };

  return (
    <header className="w-full h-16 md:h-20 flex items-center justify-between px-4 md:px-6 lg:px-8 border-b border-brand-olive/20 bg-white">
      <div className="flex items-center gap-3">
        {/* לוגו - שים את הקובץ ב-public/logo.png או public/assets/logo.svg */}
        <img 
          src="/logo.png" 
          alt="Discover Africa"
          className="h-10 w-auto"
          onError={(e) => {
            // אם אין לוגו, הסתר את התמונה
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="font-bold text-lg text-brand-dark">
          Discover Africa
        </div>

        {typeof referenceNumber === 'number' && (
          <div className="ml-2 px-3 py-1 rounded border border-brand-olive/20 bg-brand-olive/5">
            <div className="text-[10px] font-semibold text-brand-olive/80 uppercase tracking-wide">
              Proposal Ref
            </div>
            <div className="text-sm font-bold text-brand-dark">
              {formatReferenceNumber(referenceNumber)}
            </div>
          </div>
        )}
      </div>

      <nav className="hidden md:flex flex-1 justify-center">
        <div className="flex items-center gap-1 rounded-lg border border-brand-olive/20 bg-white px-1 py-1">
          <button type="button" className={getStepButtonClassName('trip')} onClick={goTrip}>
            <span className={getStepStatusClassName(tripIsReady)} title={tripIsReady ? 'Ready' : 'Needs attention'} />
            <span className="ml-2">Trip</span>
          </button>
          <button type="button" className={getStepButtonClassName('pricing')} onClick={goPricing}>
            <span className={getStepStatusClassName(pricingIsReady)} title={pricingIsReady ? 'Ready' : 'Needs attention'} />
            <span className="ml-2">Pricing</span>
          </button>
          <button type="button" className={getStepButtonClassName('summary')} onClick={goSummary}>
            <span className={getStepStatusClassName(summaryIsReady)} title={summaryIsReady ? 'Ready' : 'Needs attention'} />
            <span className="ml-2">Summary</span>
          </button>
          <button type="button" className={getStepButtonClassName('proposal')} onClick={goProposal}>
            <span className={getStepStatusClassName(proposalIsReady)} title={proposalIsReady ? 'Ready' : 'Needs attention'} />
            <span className="ml-2">Proposal</span>
          </button>
        </div>
      </nav>

      <div className="flex items-center gap-2">
        {draft && (
          <div className="flex items-center gap-2 mr-2">
            <div className="flex flex-col">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                People
              </div>
              <input
                type="number"
                min={1}
                value={draft.travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/proposals')}
          className="p-2 rounded hover:bg-brand-olive/10 text-brand-dark transition-colors"
          aria-label="Saved Proposals"
          title="Saved Proposals"
        >
          <FileText size={20} strokeWidth={1.5} className="text-brand-dark" />
        </button>

        <button
          onClick={() => navigate('/admin/pricing-catalog')}
          className="p-2 rounded hover:bg-brand-olive/10 text-brand-dark transition-colors"
          aria-label="Settings"
          title="Pricing Catalog"
        >
          <Settings size={20} strokeWidth={1.5} className="text-brand-dark" />
        </button>
      </div>
    </header>
  );
}



