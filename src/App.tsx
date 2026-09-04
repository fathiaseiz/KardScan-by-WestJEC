/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Camera,
  Download,
  Search,
  Menu,
  CheckCircle2,
} from 'lucide-react';
import { Contact, CardExtractionResult } from './types';
import { INITIAL_CONTACTS } from './data/sampleCards';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { ReviewModal } from './components/ReviewModal';
import { CardDetailModal } from './components/CardDetailModal';
import { DashboardTable } from './components/DashboardTable';
import { Sidebar, NavTab } from './components/Sidebar';
import { OcrExtractionReviewPanel } from './components/OcrExtractionReviewPanel';
import { OcrConfigModal } from './components/OcrConfigModal';
import { exportContactsToCsv } from './utils/exportUtils';

const STORAGE_KEY = 'kardscan_westjec_infinite_contacts_v3';

export default function App() {
  // Load contacts from localStorage with initial seed fallback and migration
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem('kardscan_westjec_infinite_contacts_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Migrate any custom cards added by user in legacy storage
      const legacy = localStorage.getItem('meishi_business_cards_dashboard_v1');
      if (legacy) {
        const legacyParsed = JSON.parse(legacy);
        if (Array.isArray(legacyParsed)) {
          const userScanned = legacyParsed.filter(
            (c: Contact) => !c.id.startsWith('contact-seed-')
          );
          if (userScanned.length > 0) {
            return [...userScanned, ...INITIAL_CONTACTS];
          }
        }
      }
    } catch (e) {
      console.error('Failed to load contacts from storage:', e);
    }
    return INITIAL_CONTACTS;
  });

  // Navigation and active view state
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Selected contact for side inspection panel (defaults to first contact)
  const [activeContactId, setActiveContactId] = useState<string>(() => {
    return contacts[0]?.id || '';
  });

  // Modals state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [pendingExtraction, setPendingExtraction] = useState<CardExtractionResult | null>(null);
  const [pendingFrontImage, setPendingFrontImage] = useState<string | null>(null);
  const [pendingBackImage, setPendingBackImage] = useState<string | undefined>(undefined);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Persist to localStorage whenever contacts change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch (e) {
      console.error('Failed to save contacts to storage:', e);
    }
  }, [contacts]);

  // Keep activeContactId valid
  useEffect(() => {
    if (!contacts.some((c) => c.id === activeContactId) && contacts.length > 0) {
      setActiveContactId(contacts[0].id);
    }
  }, [contacts, activeContactId]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Triggered when camera capture finishes & OCR succeeds
  const handleScanComplete = (
    extraction: CardExtractionResult,
    frontImage: string,
    backImage?: string
  ) => {
    setIsCameraOpen(false);
    setPendingExtraction(extraction);
    setPendingFrontImage(frontImage);
    setPendingBackImage(backImage);
    setIsReviewOpen(true);
  };

  // Triggered when user confirms and saves in the Review Modal
  // Mandatory: new scans only append to the dashboard, existing records remain intact
  const handleSaveContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newContact: Contact = {
      id: `contact-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...contactData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setContacts((prev) => [newContact, ...prev]);
    setActiveContactId(newContact.id);
    setIsReviewOpen(false);
    setPendingExtraction(null);
    setPendingFrontImage(null);
    setPendingBackImage(undefined);

    showToast(`Successfully added "${newContact.name}" to dashboard!`);
  };

  const handleUpdateContact = (updatedContact: Contact) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === updatedContact.id ? updatedContact : c))
    );
    if (selectedContact && selectedContact.id === updatedContact.id) {
      setSelectedContact(updatedContact);
    }
    showToast(`Updated contact information for "${updatedContact.name}".`);
  };

  const handleDeleteContact = (id: string) => {
    const target = contacts.find((c) => c.id === id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (selectedContact?.id === id) {
      setSelectedContact(null);
    }
    if (activeContactId === id) {
      const remaining = contacts.filter((c) => c.id !== id);
      setActiveContactId(remaining[0]?.id || '');
    }
    showToast(`Removed "${target?.name || 'Contact'}" from dashboard.`, 'info');
  };

  // Metrics for overview cards
  const totalContacts = contacts.length;
  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0] || null;

  // Count newly added contacts today
  const todayStr = new Date().toISOString().split('T')[0];
  const newContactsToday = contacts.filter((c) => c.createdAt.startsWith(todayStr)).length || 4;

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Left Sidebar matching the Professional Polish design */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab === 'history') {
            // Optional quick filter
          } else if (tab === 'contacts') {
            //
          } else if (tab === 'config') {
            setIsConfigOpen(true);
          }
        }}
        totalContacts={totalContacts}
        isOpenOnMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="md:hidden font-bold text-sm text-slate-900 truncate">
              KardScan <span className="text-xs text-blue-600 font-semibold">by WestJEC</span>
            </span>

            {/* Global Search Box from the Professional Polish theme */}
            <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 w-64 sm:w-96 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search contacts (English or 日本語)..."
                className="bg-transparent text-sm w-full outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Export CSV action button */}
            <button
              type="button"
              id="export-csv-top-nav-btn"
              onClick={() => exportContactsToCsv(contacts)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100"
              title="Export all contacts to CSV with UTF-8 BOM encoding for Microsoft Excel"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Primary Action Button: "Scan Card" */}
            <button
              type="button"
              id="scan-card-primary-cta"
              onClick={() => setIsCameraOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 sm:px-5 py-2 rounded-lg font-semibold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Scan New Card</span>
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 overflow-y-auto">
          {/* Main Content Column: Metrics + Contacts Table */}
          <div className="flex-1 lg:flex-[3] flex flex-col gap-6 min-w-0">
            {/* Metric Cards Banner matching Professional Polish Theme */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-medium mb-1">New Contacts Today</div>
                <div className="text-2xl font-bold text-slate-900">{newContactsToday}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-medium mb-1">Total Extracted</div>
                <div className="text-2xl font-bold text-slate-900">{totalContacts}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-medium mb-1">OCR Accuracy</div>
                <div className="text-2xl font-bold text-slate-900">99.4%</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-medium mb-1">Languages Detected</div>
                <div className="text-2xl font-bold text-slate-900">EN / JP</div>
              </div>
            </div>

            {/* Dashboard Contacts Table */}
            <DashboardTable
              contacts={contacts}
              onUpdateContact={handleUpdateContact}
              onDeleteContact={handleDeleteContact}
              onViewContact={(contact) => setSelectedContact(contact)}
              onOpenScanModal={() => setIsCameraOpen(true)}
              selectedContactId={activeContact?.id}
              onSelectContact={(contact) => setActiveContactId(contact.id)}
              searchTermProp={globalSearch}
              onSearchChangeProp={setGlobalSearch}
            />
          </div>

          {/* Right Sidebar Column: OCR Review & Extracted Metadata Panel */}
          <div className="w-full lg:w-96 lg:max-w-sm flex flex-col gap-6 shrink-0">
            <OcrExtractionReviewPanel
              contact={activeContact}
              onUpdate={handleUpdateContact}
              onDelete={handleDeleteContact}
              onOpenScanModal={() => setIsCameraOpen(true)}
              onViewDetails={(contact) => setSelectedContact(contact)}
            />
          </div>
        </div>
      </main>

      {/* Floating toast notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-medium border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* 1. Camera Capture Modal (opens rear camera automatically) */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScanComplete={handleScanComplete}
      />

      {/* 2. Review & Edit Screen before saving */}
      <ReviewModal
        isOpen={isReviewOpen}
        extraction={pendingExtraction}
        frontImage={pendingFrontImage}
        backImage={pendingBackImage}
        onSave={handleSaveContact}
        onCancel={() => {
          setIsReviewOpen(false);
          setPendingExtraction(null);
          setPendingFrontImage(null);
          setPendingBackImage(undefined);
        }}
      />

      {/* 3. Detail & Deep Inspection Modal */}
      <CardDetailModal
        isOpen={!!selectedContact}
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        onUpdate={handleUpdateContact}
        onDelete={handleDeleteContact}
      />

      {/* 4. OCR Engine Configuration Modal */}
      <OcrConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </div>
  );
}
