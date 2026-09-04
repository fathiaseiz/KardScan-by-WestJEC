export type ContactStatus =
  | 'New'
  | 'Contacted'
  | 'Follow-up'
  | 'Negotiating'
  | 'Signed'
  | 'Not Interested';

export type DetectedScript = 'English' | 'Japanese' | 'Bilingual (Japanese / English)';

export interface Contact {
  id: string;
  name: string;
  nameJapanese?: string;
  nameEnglish?: string;
  company: string;
  companyJapanese?: string;
  companyEnglish?: string;
  role: string;
  roleJapanese?: string;
  roleEnglish?: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  address?: string;
  website?: string;
  detectedScript: DetectedScript;
  status: ContactStatus;
  rawExtractedText: string;
  cardImageUrl?: string;
  backCardImageUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardExtractionResult {
  name: string;
  nameJapanese?: string;
  nameEnglish?: string;
  company: string;
  companyJapanese?: string;
  companyEnglish?: string;
  role: string;
  roleJapanese?: string;
  roleEnglish?: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  address?: string;
  website?: string;
  detectedScript: DetectedScript;
  rawExtractedText: string;
  confidenceNotes?: string;
}

export const STATUS_OPTIONS: { label: ContactStatus; color: string; bg: string; border: string }[] = [
  { label: 'New', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200' },
  { label: 'Negotiating', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200' },
  { label: 'Follow-up', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200' },
  { label: 'Contacted', color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' },
  { label: 'Signed', color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200' },
  { label: 'Not Interested', color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-200' },
];
