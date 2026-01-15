import { matchPath, useLocation } from 'react-router-dom';
import { useTrip } from '../context/TripContext';

type ActiveStep = 'trip' | 'pricing' | 'summary' | 'proposal' | null;

export function useActiveTripContext(): {
  pathname: string;
  tripIdFromUrl: string | null;
  proposalIdFromUrl: string | null;
  activeTripId: string | null;
  activeStep: ActiveStep;
} {
  const location = useLocation();
  const { draftQuoteId } = useTrip();

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

  const activeStep: ActiveStep = isTripStep
    ? 'trip'
    : isPricingStep
      ? 'pricing'
      : isSummaryStep
        ? 'summary'
        : isProposalStep
          ? 'proposal'
          : null;

  return {
    pathname,
    tripIdFromUrl,
    proposalIdFromUrl,
    activeTripId,
    activeStep,
  };
}
