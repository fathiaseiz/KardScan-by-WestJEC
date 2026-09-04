import React from 'react';
import {
  LayoutDashboard,
  History,
  Users,
  Settings,
  X,
  Languages,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'history' | 'contacts' | 'config';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  totalContacts: number;
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
  onOpenConfig: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  totalContacts,
  isOpenOnMobile,
  onCloseMobile,
  onOpenConfig,
}) => {
  const navContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-lg text-white shadow-xs">
            K
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white block leading-tight">
              KardScan
            </span>
            <span className="text-[11px] text-blue-400 font-semibold tracking-wide block">
              by WestJEC
            </span>
          </div>
        </div>
        {isOpenOnMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4">
        <div className="px-4 mb-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
          Main Menu
        </div>

        <button
          type="button"
          onClick={() => {
            onTabChange('dashboard');
            onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-6 py-3 text-left transition-colors text-sm font-medium ${
            currentTab === 'dashboard'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            onTabChange('history');
            onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-6 py-3 text-left transition-colors text-sm font-medium ${
            currentTab === 'history'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <History className="w-5 h-5" />
            <span>Scan History</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
            {totalContacts}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            onTabChange('contacts');
            onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-6 py-3 text-left transition-colors text-sm font-medium ${
            currentTab === 'contacts'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5" />
            <span>Contacts</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
            {totalContacts}
          </span>
        </button>

        <div className="px-4 mt-8 mb-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
          Settings
        </div>

        <button
          type="button"
          onClick={() => {
            onOpenConfig();
            onCloseMobile();
          }}
          className="w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-slate-800 text-slate-300 transition-colors text-sm font-medium"
        >
          <Settings className="w-5 h-5" />
          <span>OCR Config</span>
        </button>
      </nav>

      {/* Infinite Directory Capacity Status */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span className="text-blue-400 font-bold text-sm">∞</span>
            Infinite Directory
          </span>
          <span className="text-[11px] font-bold text-slate-300 px-2 py-0.5 rounded bg-slate-800">
            {totalContacts} Cards
          </span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          Unlimited card storage &amp; seamless cloud sync
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-col shrink-0 hidden md:flex h-full">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenOnMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="relative w-64 bg-slate-900 text-white flex flex-col h-full shadow-2xl z-10">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
