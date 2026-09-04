import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  X,
  Trash2,
  Download,
  Eye,
  Mail,
  Phone,
  Building,
  Globe,
  Plus,
  Filter,
  Languages,
  MoreHorizontal,
} from 'lucide-react';
import { Contact, ContactStatus, STATUS_OPTIONS } from '../types';
import { exportContactsToCsv, exportContactToVCard } from '../utils/exportUtils';

interface DashboardTableProps {
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onViewContact: (contact: Contact) => void;
  onOpenScanModal: () => void;
  selectedContactId?: string;
  onSelectContact?: (contact: Contact) => void;
  searchTermProp?: string;
  onSearchChangeProp?: (val: string) => void;
  hideTopSearchBar?: boolean;
}

type SortField = 'name' | 'company' | 'role' | 'email' | 'status' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export const DashboardTable: React.FC<DashboardTableProps> = ({
  contacts,
  onUpdateContact,
  onDeleteContact,
  onViewContact,
  onOpenScanModal,
  selectedContactId,
  onSelectContact,
  searchTermProp,
  onSearchChangeProp,
  hideTopSearchBar = false,
}) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const searchTerm = searchTermProp !== undefined ? searchTermProp : internalSearchTerm;
  const setSearchTerm = onSearchChangeProp || setInternalSearchTerm;

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [scriptFilter, setScriptFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Delete confirmation modal state (iframe safe, no window.confirm)
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRowData, setEditRowData] = useState<Partial<Contact>>({});

  const startInlineEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setEditRowData({
      name: contact.name,
      company: contact.company,
      role: contact.role,
      email: contact.email,
      phone: contact.phone,
      status: contact.status,
    });
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditRowData({});
  };

  const saveInlineEdit = (original: Contact) => {
    onUpdateContact({
      ...original,
      name: editRowData.name?.trim() || original.name,
      company: editRowData.company?.trim() || original.company,
      role: editRowData.role?.trim() || original.role,
      email: editRowData.email?.trim() || original.email,
      phone: editRowData.phone?.trim() || original.phone,
      status: (editRowData.status as ContactStatus) || original.status,
      updatedAt: new Date().toISOString(),
    });
    setEditingId(null);
    setEditRowData({});
  };

  const handleStatusChange = (contact: Contact, newStatus: ContactStatus) => {
    onUpdateContact({
      ...contact,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtering and sorting with full Japanese character matching (Kanji, Katakana, Hiragana)
  const filteredAndSortedContacts = useMemo(() => {
    let result = [...contacts];

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Script filter
    if (scriptFilter !== 'ALL') {
      result = result.filter((c) => {
        if (scriptFilter === 'Japanese') return c.detectedScript === 'Japanese';
        if (scriptFilter === 'Bilingual') return c.detectedScript.includes('Bilingual');
        if (scriptFilter === 'English') return c.detectedScript === 'English';
        return true;
      });
    }

    // Search query matching (case-insensitive & supports Kanji/Kana)
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter((c) => {
        return (
          c.name.toLowerCase().includes(q) ||
          (c.nameJapanese && c.nameJapanese.toLowerCase().includes(q)) ||
          (c.nameEnglish && c.nameEnglish.toLowerCase().includes(q)) ||
          c.company.toLowerCase().includes(q) ||
          (c.companyJapanese && c.companyJapanese.toLowerCase().includes(q)) ||
          c.role.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.secondaryPhone && c.secondaryPhone.toLowerCase().includes(q)) ||
          (c.address && c.address.toLowerCase().includes(q)) ||
          (c.rawExtractedText && c.rawExtractedText.toLowerCase().includes(q))
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortField === 'name') {
        valA = a.name;
        valB = b.name;
      } else if (sortField === 'company') {
        valA = a.company;
        valB = b.company;
      } else if (sortField === 'role') {
        valA = a.role;
        valB = b.role;
      } else if (sortField === 'email') {
        valA = a.email;
        valB = b.email;
      } else if (sortField === 'status') {
        valA = a.status;
        valB = b.status;
      } else if (sortField === 'createdAt') {
        return sortOrder === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      const cmp = valA.localeCompare(valB, 'ja');
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [contacts, statusFilter, scriptFilter, searchTerm, sortField, sortOrder]);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar (shown if not hidden or for mobile/local search) */}
      {!hideTopSearchBar && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search input with Japanese character support */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="search-contacts-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contacts (English or 日本語)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons: Export CSV & Scan Card */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="export-csv-btn"
              onClick={() => exportContactsToCsv(filteredAndSortedContacts)}
              disabled={contacts.length === 0}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              title="Export CSV with UTF-8 BOM encoding for Excel compatibility"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              id="scan-card-header-btn"
              onClick={onOpenScanModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Scan New Card</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs: Status & Script Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Status:
          </span>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All ({contacts.length})
          </button>
          {STATUS_OPTIONS.map((status) => {
            const count = contacts.filter((c) => c.status === status.label).length;
            const isSelected = statusFilter === status.label;
            return (
              <button
                key={status.label}
                onClick={() => setStatusFilter(status.label)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                  isSelected
                    ? `${status.bg} ${status.color} ring-2 ring-blue-500`
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{status.label}</span>
                <span className="text-[10px] opacity-75 font-bold">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Script Filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Script:
          </span>
          <button
            onClick={() => setScriptFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              scriptFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setScriptFilter('Japanese')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              scriptFilter === 'Japanese'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Japanese
          </button>
          <button
            onClick={() => setScriptFilter('Bilingual')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              scriptFilter === 'Bilingual'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            Bilingual
          </button>
          <button
            onClick={() => setScriptFilter('English')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              scriptFilter === 'English'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Main Contacts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="contacts-dashboard-table">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
              <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Name (氏名)</span>
                    {renderSortIndicator('name')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('company')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Company (会社名)</span>
                    {renderSortIndicator('company')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('role')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Role (役職)</span>
                    {renderSortIndicator('role')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Email</span>
                    {renderSortIndicator('email')}
                  </div>
                </th>
                <th className="py-3.5 px-6">Phone</th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {renderSortIndicator('status')}
                  </div>
                </th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredAndSortedContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                        <Search className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1">
                        No contacts found
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">
                        {searchTerm || statusFilter !== 'ALL' || scriptFilter !== 'ALL'
                          ? 'Try adjusting your search terms or active filters.'
                          : 'No business cards scanned yet. Click below to start scanning!'}
                      </p>
                      <button
                        type="button"
                        onClick={onOpenScanModal}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        Scan Your First Business Card
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedContacts.map((contact) => {
                  const isEditing = editingId === contact.id;
                  const isSelected = contact.id === selectedContactId;
                  const statusObj =
                    STATUS_OPTIONS.find((s) => s.label === contact.status) || STATUS_OPTIONS[0];

                  return (
                    <tr
                      key={contact.id}
                      onClick={() => onSelectContact?.(contact)}
                      className={`hover:bg-blue-50/50 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-blue-50/30' : ''
                      } ${isEditing ? 'bg-blue-50/60' : ''}`}
                    >
                      {/* Column 1: Name */}
                      <td className="py-3.5 px-6 font-semibold text-slate-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editRowData.name || ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              setEditRowData({ ...editRowData, name: e.target.value })
                            }
                            className="w-full px-2 py-1 bg-white border border-blue-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="flex items-center gap-2.5">
                            {/* Thumbnail or Avatar initial */}
                            {contact.cardImageUrl ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewContact(contact);
                                }}
                                title="View Card Image"
                                className="w-9 h-6 rounded bg-slate-900 overflow-hidden border border-slate-200 shrink-0 hover:opacity-85 transition-opacity"
                              >
                                <img
                                  src={contact.cardImageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </button>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 border border-slate-200">
                                {contact.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}

                            <div>
                              <div className="font-semibold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                                <span>{contact.name}</span>
                                {contact.detectedScript === 'Japanese' && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                    JP
                                  </span>
                                )}
                                {contact.detectedScript.includes('Bilingual') && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                    BI
                                  </span>
                                )}
                              </div>
                              {contact.nameJapanese && contact.nameJapanese !== contact.name && (
                                <p className="text-[11px] text-slate-500 font-normal">
                                  {contact.nameJapanese}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Column 2: Company */}
                      <td className="py-3.5 px-6 text-slate-700">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editRowData.company || ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              setEditRowData({ ...editRowData, company: e.target.value })
                            }
                            className="w-full px-2 py-1 bg-white border border-blue-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-800">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[200px]" title={contact.company}>
                              {contact.company || '—'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Column 3: Role */}
                      <td className="py-3.5 px-6 text-slate-500">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editRowData.role || ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              setEditRowData({ ...editRowData, role: e.target.value })
                            }
                            className="w-full px-2 py-1 bg-white border border-blue-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-slate-600 truncate max-w-[180px] block" title={contact.role}>
                            {contact.role || '—'}
                          </span>
                        )}
                      </td>

                      {/* Column 4: Email */}
                      <td className="py-3.5 px-6 text-slate-500">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editRowData.email || ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              setEditRowData({ ...editRowData, email: e.target.value })
                            }
                            className="w-full px-2 py-1 bg-white border border-blue-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        ) : contact.email ? (
                          <a
                            href={`mailto:${contact.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 truncate max-w-[180px]"
                            title={contact.email}
                          >
                            <Mail className="w-3.5 h-3.5 shrink-0 opacity-70" />
                            <span className="truncate">{contact.email}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Column 5: Phone */}
                      <td className="py-3.5 px-6 text-slate-500">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editRowData.phone || ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              setEditRowData({ ...editRowData, phone: e.target.value })
                            }
                            className="w-full px-2 py-1 bg-white border border-blue-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        ) : contact.phone ? (
                          <a
                            href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-800 hover:text-blue-600 flex items-center gap-1 font-mono text-[11px]"
                          >
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{contact.phone}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Column 6: Status dropdown */}
                      <td className="py-3.5 px-6">
                        {isEditing ? (
                          <select
                            value={editRowData.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              setEditRowData({
                                ...editRowData,
                                status: e.target.value as ContactStatus,
                              })
                            }
                            className="px-2 py-1 bg-white border border-blue-300 rounded text-xs font-semibold focus:ring-1 focus:ring-blue-500"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.label} value={opt.label}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={contact.status}
                              onChange={(e) =>
                                handleStatusChange(contact, e.target.value as ContactStatus)
                              }
                              className={`text-[10px] font-bold uppercase px-2 py-1 rounded border cursor-pointer appearance-none pr-5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${statusObj.bg} ${statusObj.color} ${statusObj.border}`}
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.label} value={opt.label}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
                              <ArrowDown className="w-2.5 h-2.5 opacity-60" />
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Column 7: Actions */}
                      <td className="py-3.5 px-6 text-right">
                        {isEditing ? (
                          <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => saveInlineEdit(contact)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-xs"
                              title="Save Inline Edit"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelInlineEdit}
                              className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => onViewContact(contact)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View Details & Card Photo"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => startInlineEdit(contact)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                              title="Inline Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => exportContactToVCard(contact)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Download vCard (.vcf)"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setContactToDelete(contact)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer with stats */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{filteredAndSortedContacts.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{contacts.length}</span> contacts
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">
              Click row to inspect live, or double-click to edit
            </span>
          </div>
        </div>
      </div>

      {/* In-App Delete Confirmation Modal (100% iframe safe, no native window.confirm) */}
      {contactToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Contact</h3>
                <p className="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900 font-semibold">{contactToDelete.name}</strong>
              {contactToDelete.company ? ` (${contactToDelete.company})` : ''} from your dashboard?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setContactToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-contact-btn"
                onClick={() => {
                  onDeleteContact(contactToDelete.id);
                  setContactToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Contact</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
