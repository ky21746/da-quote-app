import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadService } from '../services/leadService';
import { Lead } from '../types/leads';
import { LeadStatusBadge } from '../components/Leads/LeadStatusBadge';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/i18n';
import { Button } from '../components/common';
import { Plus } from 'lucide-react';

export const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await leadService.getLeads();
      setLeads(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToPricing = async (lead: Lead) => {
    try {
      const { quoteId } = await leadService.createQuoteFromLead(lead);
      navigate(`/trip/${quoteId}/edit`);
    } catch (err: any) {
      alert(`Failed to create quote: ${err.message}`);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('leads.title', language)}</h1>
        <Button variant="primary" onClick={() => navigate('/leads/new')}>
          <Plus size={20} className="mr-2" />
          {t('leads.new', language)}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {leads.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">{language === 'he' ? 'אין לידים עדיין' : 'No leads yet'}</p>
          <Button variant="primary" onClick={() => navigate('/leads/new')}>
            {t('leads.createLead', language)}
          </Button>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('leads.name', language)}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('leads.status', language)}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('leads.contact', language)}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('leads.updated', language)}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('leads.actions', language)}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {lead.firstName} {lead.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <LeadStatusBadge status={lead.status} language={language} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.phone || '-'}</div>
                    <div className="text-sm text-gray-500">{lead.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lead.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/leads/${lead.id}`)}
                      >
                        {t('leads.open', language)}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSendToPricing(lead)}
                      >
                        {t('leads.sendToPricing', language)}
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
  );
};
