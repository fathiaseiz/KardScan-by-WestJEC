import React, { useState } from 'react';
import {
  Check,
  X,
  Copy,
  AlertTriangle,
  Globe,
  User,
  Building,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  FileText,
  Languages,
} from 'lucide-react';
import { CardExtractionResult, Contact, ContactStatus, STATUS_OPTIONS } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  extraction: CardExtractionResult | null;
  frontImage: string | null;
  backImage?: string;
  onSave: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  extraction,
  frontImage,
  backImage,
  onSave,
  onCancel,
}) => {
  if (!isOpen || !extraction) return null;

  const [name, setName] = useState(extraction.name || '');
  const [nameJapanese, setNameJapanese] = useState(extraction.nameJapanese || '');
  const [nameEnglish, setNameEnglish] = useState(extraction.nameEnglish || '');
  const [company, setCompany] = useState(extraction.company || '');
  const [companyJapanese, setCompanyJapanese] = useState(extraction.companyJapanese || '');
  const [companyEnglish, setCompanyEnglish] = useState(extraction.companyEnglish || '');
  const [role, setRole] = useState(extraction.role || '');
  const [roleJapanese, setRoleJapanese] = useState(extraction.roleJapanese || '');
  const [roleEnglish, setRoleEnglish] = useState(extraction.roleEnglish || '');
  const [email, setEmail] = useState(extraction.email || '');
  const [phone, setPhone] = useState(extraction.phone || '');
  const [secondaryPhone, setSecondaryPhone] = useState(extraction.secondaryPhone || '');
  const [address, setAddress] = useState(extraction.address || '');
  const [website, setWebsite] = useState(extraction.website || '');
  const [status, setStatus] = useState<ContactStatus>('New');
  const [notes, setNotes] = useState('');
  const [showRawText, setShowRawText] = useState(true);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(extraction.rawExtractedText || '');
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleSaveContact = () => {
    onSave({
      name: name.trim() || 'Unknown Contact',
      nameJapanese: nameJapanese.trim() || undefined,
      nameEnglish: nameEnglish.trim() || undefined,
      company: company.trim() || 'Unknown Company',
      companyJapanese: companyJapanese.trim() || undefined,
      companyEnglish: companyEnglish.trim() || undefined,
      role: role.trim() || 'Contact',
      roleJapanese: roleJapanese.trim() || undefined,
      roleEnglish: roleEnglish.trim() || undefined,
      email: email.trim(),
      phone: phone.trim(),
      secondaryPhone: secondaryPhone.trim() || undefined,
      address: address.trim() || undefined,
      website: website.trim() || undefined,
      detectedScript: extraction.detectedScript || 'English',
      status,
      rawExtractedText: extraction.rawExtractedText || '',
      cardImageUrl: frontImage || undefined,
      backCardImageUrl: backImage || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const getScriptBadge = (script: string) => {
    if (script === 'Japanese') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <Languages className="w-3.5 h-3.5" />
          Japanese Script Detected (漢字・かな)
        </span>
      );
    }
    if (script === 'Bilingual (Japanese / English)') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Globe className="w-3.5 h-3.5" />
          Bilingual Card Detected (日本語 / English)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <Languages className="w-3.5 h-3.5" />
        English Script Detected
      </span>
    );
  };

  return (
    <div
      id="review-scan-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/75">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Review &amp; Confirm Contact
                </h2>
                {getScriptBadge(extraction.detectedScript)}
              </div>
              <p className="text-xs text-slate-500">
                Verify extracted contact information. All fields are editable before saving to the dashboard.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Visual comparison reminder banner */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">OCR Verification Notice:</span> Hiragana and Kanji characters with visual similarities (e.g., ろ/る, わ/ね/れ) can sometimes be mistaken in low-contrast photos. Please verify names and numbers against the card image or raw text below.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Scanned Card Image & Raw OCR Text (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Scanned Business Card
                </label>
                <div className="w-full aspect-[1.65] bg-slate-950 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center">
                  {frontImage && (
                    <img
                      src={frontImage}
                      alt="Scanned Card"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                {backImage && (
                  <div className="mt-2">
                    <span className="text-[11px] text-slate-500 font-medium block mb-1">
                      Reverse Side:
                    </span>
                    <div className="w-full aspect-[1.65] bg-slate-950 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center">
                      <img
                        src={backImage}
                        alt="Scanned Reverse"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Raw OCR Text Box */}
              <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-slate-100/75">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Raw Extracted OCR Text
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRaw}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedRaw ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>
                <div className="p-3">
                  <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {extraction.rawExtractedText || 'No raw text available.'}
                  </pre>
                </div>
              </div>
            </div>

            {/* Right: Editable Extracted Fields Form (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Primary Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Contact Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 山田 太郎 / Taro Yamada"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Japanese & English Name breakdown (if bilingual) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Japanese Name (漢字・かな)
                  </label>
                  <input
                    type="text"
                    value={nameJapanese}
                    onChange={(e) => setNameJapanese(e.target.value)}
                    placeholder="e.g. 山田 太郎"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    English / Romaji Name
                  </label>
                  <input
                    type="text"
                    value={nameEnglish}
                    onChange={(e) => setNameEnglish(e.target.value)}
                    placeholder="e.g. Taro Yamada"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Company & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    Company (会社名)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. 株式会社 大和ソリューションズ"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    Role / Job Title (役職)
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. 代表取締役社長 / CEO"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. t.yamada@yamato.co.jp"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 03-6250-8800 or 090-1234-5678"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Secondary Phone & Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Mobile / Second Phone
                  </label>
                  <input
                    type="text"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    placeholder="e.g. 090-XXXX-XXXX"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. https://company.co.jp"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Address (住所)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 〒100-0005 東京都千代田区丸の内1丁目8番1号"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ContactStatus)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.label} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Meeting Context / Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Scanned at Japan IT Week 2026, interested in cloud API"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500">
            This contact will be permanently appended to your dashboard list.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Discard
            </button>
            <button
              type="button"
              id="save-to-dashboard-btn"
              onClick={handleSaveContact}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
