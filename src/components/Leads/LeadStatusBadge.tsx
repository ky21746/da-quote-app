import React from 'react';
import { LeadStatus } from '../../types/leads';
import { t, Language } from '../../utils/i18n';

interface LeadStatusBadgeProps {
  status: LeadStatus;
  language: Language;
}

const statusColors: Record<LeadStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-green-100 text-green-800',
  PROPOSAL_SENT: 'bg-purple-100 text-purple-800',
  WON: 'bg-emerald-100 text-emerald-800',
  LOST: 'bg-gray-100 text-gray-800',
};

export const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({ status, language }) => {
  const colorClass = statusColors[status];
  const label = t(`lead.status.${status}` as any, language);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
};
