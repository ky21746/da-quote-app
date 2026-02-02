export type Language = 'he' | 'en';

export type TranslationKey =
  | 'leads.title'
  | 'leads.new'
  | 'leads.sendToPricing'
  | 'leads.createLead'
  | 'leads.viewLead'
  | 'leads.name'
  | 'leads.status'
  | 'leads.contact'
  | 'leads.updated'
  | 'leads.actions'
  | 'leads.open'
  | 'lead.firstName'
  | 'lead.lastName'
  | 'lead.phone'
  | 'lead.email'
  | 'lead.language'
  | 'lead.source'
  | 'lead.notes'
  | 'lead.save'
  | 'lead.cancel'
  | 'lead.edit'
  | 'lead.delete'
  | 'lead.details'
  | 'lead.activity'
  | 'lead.createdAt'
  | 'lead.updatedAt'
  | 'lead.status.NEW'
  | 'lead.status.CONTACTED'
  | 'lead.status.QUALIFIED'
  | 'lead.status.PROPOSAL_SENT'
  | 'lead.status.WON'
  | 'lead.status.LOST';

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    'leads.title': 'Leads',
    'leads.new': 'New Lead',
    'leads.sendToPricing': 'Send to Pricing',
    'leads.createLead': 'Create Lead',
    'leads.viewLead': 'View Lead',
    'leads.name': 'Name',
    'leads.status': 'Status',
    'leads.contact': 'Contact',
    'leads.updated': 'Updated',
    'leads.actions': 'Actions',
    'leads.open': 'Open',
    'lead.firstName': 'First Name',
    'lead.lastName': 'Last Name',
    'lead.phone': 'Phone',
    'lead.email': 'Email',
    'lead.language': 'Language',
    'lead.source': 'Source',
    'lead.notes': 'Notes',
    'lead.save': 'Save',
    'lead.cancel': 'Cancel',
    'lead.edit': 'Edit',
    'lead.delete': 'Delete',
    'lead.details': 'Lead Details',
    'lead.activity': 'Activity',
    'lead.createdAt': 'Created',
    'lead.updatedAt': 'Updated',
    'lead.status.NEW': 'New',
    'lead.status.CONTACTED': 'Contacted',
    'lead.status.QUALIFIED': 'Qualified',
    'lead.status.PROPOSAL_SENT': 'Proposal Sent',
    'lead.status.WON': 'Won',
    'lead.status.LOST': 'Lost',
  },
  he: {
    'leads.title': 'לידים',
    'leads.new': 'ליד חדש',
    'leads.sendToPricing': 'שלח למחירון',
    'leads.createLead': 'צור ליד',
    'leads.viewLead': 'צפה בליד',
    'leads.name': 'שם',
    'leads.status': 'סטטוס',
    'leads.contact': 'יצירת קשר',
    'leads.updated': 'עודכן',
    'leads.actions': 'פעולות',
    'leads.open': 'פתח',
    'lead.firstName': 'שם פרטי',
    'lead.lastName': 'שם משפחה',
    'lead.phone': 'טלפון',
    'lead.email': 'אימייל',
    'lead.language': 'שפה',
    'lead.source': 'מקור',
    'lead.notes': 'הערות',
    'lead.save': 'שמור',
    'lead.cancel': 'ביטול',
    'lead.edit': 'ערוך',
    'lead.delete': 'מחק',
    'lead.details': 'פרטי ליד',
    'lead.activity': 'פעילות',
    'lead.createdAt': 'נוצר',
    'lead.updatedAt': 'עודכן',
    'lead.status.NEW': 'חדש',
    'lead.status.CONTACTED': 'יצרנו קשר',
    'lead.status.QUALIFIED': 'מתאים',
    'lead.status.PROPOSAL_SENT': 'הצעה נשלחה',
    'lead.status.WON': 'נסגר',
    'lead.status.LOST': 'אבד',
  },
};

export const t = (key: TranslationKey, lang: Language = 'en'): string => {
  return translations[lang][key] || key;
};
