import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadService } from '../services/leadService';
import { Lead, LeadStatus } from '../types/leads';
import { LeadStatusBadge } from '../components/Leads/LeadStatusBadge';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils/i18n';
import { Button } from '../components/common';
import { ArrowLeft, Plus } from 'lucide-react';

export const LeadDetailPage: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [status, setStatus] = useState<LeadStatus>('NEW');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (leadId) {
      loadLead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  const loadLead = async () => {
    if (!leadId) return;
    
    try {
      setLoading(true);
      const data = await leadService.getLead(leadId);
      if (data) {
        setLead(data);
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

  const handleAddNote = async () => {
    if (!leadId || !newNoteText.trim() || !user) return;
    
    try {
      setIsSaving(true);
      await leadService.addNote(leadId, newNoteText.trim());
      setNewNoteText('');
      await loadLead();
    } catch (err: any) {
      alert(`Failed to add note: ${err.message}`);
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

        {/* Add new note form */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              rows={3}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-olive focus:border-transparent"
              placeholder={language === 'he' ? 'הוסף הערה חדשה...' : 'Add new note...'}
            />
            <Button
              variant="primary"
              onClick={handleAddNote}
              disabled={isSaving || !newNoteText.trim()}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              {language === 'he' ? 'הוסף' : 'Add'}
            </Button>
          </div>
        </div>

        {/* Notes timeline */}
        <div className="space-y-4">
          {lead?.notes && lead.notes.length > 0 ? (
            [...lead.notes]
              .sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
                const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
                return dateB.getTime() - dateA.getTime();
              })
              .map((note) => {
                const noteDate = note.createdAt?.toDate?.() || new Date(note.createdAt);
                const userInitials = note.createdBy ? note.createdBy.substring(0, 2).toUpperCase() : '??';
                return (
                  <div key={note.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-12 h-12 bg-brand-olive/10 rounded-full flex items-center justify-center">
                      <span className="text-brand-olive font-semibold text-sm">
                        {userInitials}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">
                          {noteDate.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{note.text}</p>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="text-center py-8 text-gray-500">
              {language === 'he' ? 'אין הערות עדיין' : 'No notes yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
