import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadService } from '../services/leadService';
import { Lead, LeadStatus } from '../types/leads';
import { LeadStatusBadge } from '../components/Leads/LeadStatusBadge';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/i18n';
import { Button } from '../components/common';
import { ArrowLeft } from 'lucide-react';

export const LeadDetailPage: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<LeadStatus>('NEW');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (leadId) {
      loadLead();
    }
  }, [leadId]);

  const loadLead = async () => {
    if (!leadId) return;
    
    try {
      setLoading(true);
      const data = await leadService.getLead(leadId);
      if (data) {
        setLead(data);
        setNotes(data.notes || '');
        setStatus(data.status);
      } else {
        setError('Lead not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load lead');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!leadId) return;
    
    try {
      setIsSaving(true);
      await leadService.updateLead(leadId, { notes });
      alert(language === 'he' ? 'הערות נשמרו' : 'Notes saved');
    } catch (err: any) {
      alert(`Failed to save notes: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!leadId) return;
    
    try {
      await leadService.updateLead(leadId, { status: newStatus });
      setStatus(newStatus);
      if (lead) {
        setLead({ ...lead, status: newStatus });
      }
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleSendToPricing = async () => {
    if (!lead) return;
    
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Lead not found'}
        </div>
        <Button variant="secondary" onClick={() => navigate('/leads')} className="mt-4">
          <ArrowLeft size={20} className="mr-2" />
          {language === 'he' ? 'חזור ללידים' : 'Back to Leads'}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button variant="secondary" onClick={() => navigate('/leads')} className="mb-4">
          <ArrowLeft size={20} className="mr-2" />
          {language === 'he' ? 'חזור ללידים' : 'Back to Leads'}
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {lead.firstName} {lead.lastName}
            </h1>
            <div className="mt-2">
              <LeadStatusBadge status={lead.status} language={language} />
            </div>
          </div>
          <Button variant="primary" onClick={handleSendToPricing}>
            {t('leads.sendToPricing', language)}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('leads.contact', language)}
          </h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">{t('lead.phone', language)}</div>
              <div className="text-sm font-medium text-gray-900">{lead.phone || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t('lead.email', language)}</div>
              <div className="text-sm font-medium text-gray-900">{lead.email || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t('lead.language', language)}</div>
              <div className="text-sm font-medium text-gray-900">
                {lead.language === 'he' ? 'עברית' : 'English'}
              </div>
            </div>
            {lead.source && (
              <div>
                <div className="text-sm text-gray-500">{t('lead.source', language)}</div>
                <div className="text-sm font-medium text-gray-900">{lead.source}</div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('lead.activity', language)}
          </h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">{t('lead.createdAt', language)}</div>
              <div className="text-sm font-medium text-gray-900">{formatDate(lead.createdAt)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t('lead.updatedAt', language)}</div>
              <div className="text-sm font-medium text-gray-900">{formatDate(lead.updatedAt)}</div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">{t('leads.status', language)}</label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-olive focus:border-transparent"
              >
                <option value="NEW">{t('lead.status.NEW', language)}</option>
                <option value="CONTACTED">{t('lead.status.CONTACTED', language)}</option>
                <option value="QUALIFIED">{t('lead.status.QUALIFIED', language)}</option>
                <option value="PROPOSAL_SENT">{t('lead.status.PROPOSAL_SENT', language)}</option>
                <option value="WON">{t('lead.status.WON', language)}</option>
                <option value="LOST">{t('lead.status.LOST', language)}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('lead.notes', language)}
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-olive focus:border-transparent"
          placeholder={language === 'he' ? 'הוסף הערות...' : 'Add notes...'}
        />
        <div className="mt-4 flex justify-end">
          <Button
            variant="primary"
            onClick={handleSaveNotes}
            disabled={isSaving}
          >
            {isSaving ? (language === 'he' ? 'שומר...' : 'Saving...') : t('lead.save', language)}
          </Button>
        </div>
      </div>
    </div>
  );
};
