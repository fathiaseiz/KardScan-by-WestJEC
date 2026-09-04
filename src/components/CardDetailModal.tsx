import React, { useState } from 'react';
import {
  X,
  User,
  Building,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Trash2,
  Edit2,
  Check,
  Download,
  Copy,
  Languages,
} from 'lucide-react';
import { Contact, ContactStatus, STATUS_OPTIONS } from '../types';
import { exportContactToVCard } from '../utils/exportUtils';

interface CardDetailModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: Contact) => void;
  onDelete: (id: string) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  contact,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  if (!isOpen || !contact) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [formData, setFormData] = useState<Contact>({ ...contact });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Sync state if contact changes
  React.useEffect(() => {
    if (contact) {
      setFormData({ ...contact });
      setIsEditing(false);
      setIsConfirmingDelete(false);
    }
  }, [contact]);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleSave = () => {
    onUpdate({
      ...formData,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const currentStatusObj =
    STATUS_OPTIONS.find((s) => s.label === formData.status) || STATUS_OPTIONS[0];

  return (
    <div
      id="contact-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shadow-xs">
              {formData.nameJapanese
                ? formData.nameJapanese.slice(0, 1)
                : formData.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {formData.name}
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${currentStatusObj.bg} ${currentStatusObj.color} ${currentStatusObj.border}`}
                >
                  {formData.status}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {formData.role} • {formData.company}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportContactToVCard(formData)}
              title="Download vCard for Apple/Google Contacts"
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">vCard</span>
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isEditing
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Edit2 className="w-4 h-4" />
              <span className="hidden sm:inline">{isEditing ? 'Cancel Edit' : 'Edit'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Card Images */}
          {formData.cardImageUrl && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Original Physical Business Card
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="aspect-[1.65] bg-slate-950 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center shadow-xs">
                  <img
                    src={formData.cardImageUrl}
                    alt="Card Front"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {formData.backCardImageUrl && (
                  <div className="aspect-[1.65] bg-slate-950 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center shadow-xs">
                    <img
                      src={formData.backCardImageUrl}
                      alt="Card Reverse"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Details / Edit Grid */}
          <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Contact Name (Primary Display)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                    <span>{formData.name}</span>
                    <button
                      onClick={() => handleCopy(formData.name, 'name')}
                      className="text-slate-400 hover:text-blue-600 p-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Contact Status
                </label>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as ContactStatus })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.label} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${currentStatusObj.bg} ${currentStatusObj.color} ${currentStatusObj.border}`}
                  >
                    {formData.status}
                  </span>
                )}
              </div>

              {/* Japanese Name & English Name */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Japanese Name (漢字・かな)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.nameJapanese || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, nameJapanese: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-xs text-slate-800">
                    {formData.nameJapanese || '—'}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  English / Romanized Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.nameEnglish || ''}
                    onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-xs text-slate-800">
                    {formData.nameEnglish || '—'}
                  </span>
                )}
              </div>

              {/* Company */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Company (会社名)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center justify-between text-xs font-medium text-slate-900">
                    <span>{formData.company}</span>
                    <button
                      onClick={() => handleCopy(formData.company, 'company')}
                      className="text-slate-400 hover:text-blue-600 p-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Role / Title (役職)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-xs text-slate-800">{formData.role}</span>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center justify-between text-xs text-slate-900">
                    {formData.email ? (
                      <a
                        href={`mailto:${formData.email}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {formData.email}
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                    {formData.email && (
                      <button
                        onClick={() => handleCopy(formData.email, 'email')}
                        className="text-slate-400 hover:text-blue-600 p-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Primary Phone
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center justify-between text-xs text-slate-900">
                    {formData.phone ? (
                      <a
                        href={`tel:${formData.phone.replace(/[^0-9+]/g, '')}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {formData.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                    {formData.phone && (
                      <button
                        onClick={() => handleCopy(formData.phone, 'phone')}
                        className="text-slate-400 hover:text-blue-600 p-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile / Secondary Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Mobile / Secondary Phone
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.secondaryPhone || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, secondaryPhone: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-xs text-slate-800">
                    {formData.secondaryPhone || '—'}
                  </span>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Website
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-xs text-slate-800">
                    {formData.website ? (
                      <a
                        href={formData.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {formData.website}
                      </a>
                    ) : (
                      '—'
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Address (住所)
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span className="text-xs text-slate-800">{formData.address || '—'}</span>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Meeting Context / Notes
              </label>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-xs text-slate-700 italic">
                  {formData.notes || 'No notes added.'}
                </p>
              )}
            </div>
          </div>

          {/* Raw Extracted OCR text inspect */}
          <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Raw OCR Text Transcript
              </span>
              <button
                type="button"
                onClick={() => handleCopy(formData.rawExtractedText, 'raw')}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                {copiedField === 'raw' ? 'Copied!' : 'Copy Raw Text'}
              </button>
            </div>
            <pre className="p-4 text-[11px] font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
              {formData.rawExtractedText || 'No raw OCR transcript available.'}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          {isConfirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-rose-600">Delete this record?</span>
              <button
                type="button"
                id="confirm-detail-delete-btn"
                onClick={() => {
                  onDelete(formData.id);
                  onClose();
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              id="detail-modal-delete-btn"
              onClick={() => setIsConfirmingDelete(true)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Delete Contact
            </button>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Close
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
