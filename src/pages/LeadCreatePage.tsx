import React from 'react';
import { useNavigate } from 'react-router-dom';
import { leadService } from '../services/leadService';
import { LeadForm } from '../components/Leads/LeadForm';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/i18n';

export const LeadCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleSubmit = async (data: any) => {
    try {
      const leadId = await leadService.createLead(data);
      navigate(`/leads/${leadId}`);
    } catch (err: any) {
      alert(`Failed to create lead: ${err.message}`);
    }
  };

  const handleCancel = () => {
    navigate('/leads');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('leads.new', language)}</h1>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <LeadForm
          language={language}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};
