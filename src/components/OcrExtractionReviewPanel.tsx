import React, { useState, useEffect } from 'react';
import {
  Eye,
  Camera,
  Check,
  Building,
  User,
  Phone,
  Mail,
  Briefcase,
  Download,
  Languages,
  RotateCw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Contact, ContactStatus, STATUS_OPTIONS } from '../types';
import { exportContactToVCard } from '../utils/exportUtils';

interface OcrExtractionReviewPanelProps {
  contact: Contact | null;
  onUpdate: (updated: Contact) => void;
  onDelete?: (id: string) => void;
  onOpenScanModal: () => void;
  onViewDetails: (contact: Contact) => void;
}

export const OcrExtractionReviewPanel: React.FC<OcrExtractionReviewPanelProps> = ({
  contact,
  onUpdate,
  onDelete,
  onOpenScanModal,
  onViewDetails,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: '',
    phone: '',
    email: '',
    status: 'New' as ContactStatus,
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        company: contact.company,
        role: contact.role,
        phone: contact.phone,
        email: contact.email,
        status: contact.status,
      });
      setSavedSuccess(false);
      setIsConfirmingDelete(false);
    }
  }, [contact]);

  if (!contact) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[420px]">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
          <Eye className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 mb-1">OCR Extraction Review</h3>
        <p className="text-xs text-slate-500 max-w-xs mb-5">
          Select any contact from the table to preview the business card and edit extracted fields.
        </p>
        <button
          onClick={onOpenScanModal}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
        >
          <Camera className="w-4 h-4" />
          <span>Scan New Card</span>
        </button>
      </div>
    );
  }

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdate({
      ...contact,
      name: formData.name.trim() || contact.name,
      company: formData.company.trim() || contact.company,
      role: formData.role.trim() || contact.role,
      phone: formData.phone.trim() || contact.phone,
      email: formData.email.trim() || contact.email,
      status: formData.status,
      updatedAt: new Date().toISOString(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2200);
  };

  const statusObj =
    STATUS_OPTIONS.find((s) => s.label === formData.status) || STATUS_OPTIONS[0];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-500" />
          <span>OCR Extraction Review</span>
        </h3>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusObj.bg} ${statusObj.color}`}
        >
          {formData.status}
        </span>
      </div>

      {/* Card Preview Area matching the Design HTML */}
      <div className="aspect-[3/2] bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center mb-6 overflow-hidden relative group shrink-0">
        <div className="absolute inset-0 bg-white/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            type="button"
            onClick={onOpenScanModal}
            className="bg-white text-xs px-3 py-1.5 rounded border border-slate-200 shadow-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            Retake / Scan Photo
          </button>
        </div>

        {contact.cardImageUrl ? (
          <div className="w-full h-full p-2 bg-slate-900 flex items-center justify-center">
            <img
              src={contact.cardImageUrl}
              alt="Physical Business Card"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          /* Realistic Simulated Japanese Meishi / Business Card from Design */
          <div className="w-full h-full p-4 flex flex-col justify-between border-8 border-slate-200 text-slate-800 font-serif shadow-lg bg-white transform rotate-1 transition-transform group-hover:rotate-0">
            <div className="flex justify-between items-start">
              <div className="text-[10px] font-sans font-medium text-slate-700 truncate max-w-[170px]">
                {contact.company || 'Business Card'}
              </div>
              <div className="w-5 h-5 bg-red-600 rounded-full shrink-0"></div>
            </div>
            <div className="text-center py-2">
              <div className="text-base font-bold text-slate-900 tracking-tight">
                {contact.nameJapanese || contact.name}
              </div>
              <div className="text-[8px] tracking-widest text-slate-400 font-sans uppercase mt-0.5">
                {contact.role || 'LEAD REPRESENTATIVE'}
              </div>
            </div>
            <div className="text-[7px] font-sans space-y-0.5 opacity-60">
              <div className="truncate">{contact.address || '〒158-0094 東京都世田谷区'}</div>
              <div className="truncate">{contact.email || 'contact@corporate.jp'}</div>
              <div>{contact.phone || '+81 03-1234-5678'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Form Fields matching the border-b signature design */}
      <form onSubmit={handleSave} className="flex-1 space-y-4 overflow-y-auto pr-1">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
            Full Name (JP/EN)
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full text-sm font-medium border-b border-slate-200 py-1 outline-none focus:border-blue-500 transition-colors bg-transparent text-slate-900"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
            Company
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full text-sm border-b border-slate-200 py-1 outline-none focus:border-blue-500 transition-colors bg-transparent text-slate-900"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
            Job Title
          </label>
          <input
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full text-sm border-b border-slate-200 py-1 outline-none focus:border-blue-500 transition-colors bg-transparent text-slate-900"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
            Phone (Japan Format)
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full text-sm font-mono border-b border-slate-200 py-1 outline-none focus:border-blue-500 transition-colors bg-transparent text-slate-900"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full text-sm border-b border-slate-200 py-1 outline-none focus:border-blue-500 transition-colors bg-transparent text-slate-900"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as ContactStatus })
            }
            className="w-full text-xs font-semibold py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-800"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.label}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2 space-y-2">
          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-sm font-bold py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Changes Saved!</span>
              </>
            ) : (
              <span>Confirm &amp; Save Changes</span>
            )}
          </button>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onViewDetails(contact)}
              className="flex-1 text-xs font-semibold py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors"
            >
              Full Details &amp; OCR
            </button>
            <button
              type="button"
              onClick={() => exportContactToVCard(contact)}
              title="Download vCard (.vcf)"
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {onDelete && (
            <div className="pt-1">
              {isConfirmingDelete ? (
                <div className="flex items-center justify-between gap-2 p-2 bg-rose-50 border border-rose-200 rounded-lg">
                  <span className="text-[11px] font-semibold text-rose-700">Delete this card?</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      id="confirm-panel-delete-btn"
                      onClick={() => {
                        onDelete(contact.id);
                        setIsConfirmingDelete(false);
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded shadow-xs transition-colors"
                    >
                      Yes, Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(false)}
                      className="px-2 py-1 bg-white border border-slate-300 text-slate-700 text-[11px] rounded hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  id="panel-delete-btn"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="w-full text-xs font-semibold py-1.5 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Card</span>
                </button>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
