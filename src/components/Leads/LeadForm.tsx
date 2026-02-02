import React, { useState } from 'react';
import { Lead, LeadStatus } from '../../types/leads';
import { t, Language } from '../../utils/i18n';
import { Button } from '../common';

interface LeadFormProps {
  initialData?: Partial<Lead>;
  language: Language;
  onSubmit: (data: Omit<Lead, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({ initialData, language, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    language: initialData?.language || language,
    source: initialData?.source || '',
    status: initialData?.status || 'NEW' as LeadStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('lead.firstName', language)} *
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-olive focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('lead.lastName', language)} *
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-olive focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('lead.phone', language)}
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-olive focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('lead.email', language)}
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-olive focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('lead.language', language)}
          </label>
          <select
            value={formData.language}
            onChange={(e) => handleChange('language', e.target.value as 'he' | 'en')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-olive focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="he">עברית</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('lead.source', language)}
          </label>
          <input
            type="text"
            value={formData.source}
            onChange={(e) => handleChange('source', e.target.value)}
            placeholder="Website, WhatsApp, Referral..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-olive focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('leads.status', language)}
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as LeadStatus)}
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

      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onCancel} type="button">
          {t('lead.cancel', language)}
        </Button>
        <Button variant="primary" type="submit">
          {t('lead.save', language)}
        </Button>
      </div>
    </form>
  );
};
