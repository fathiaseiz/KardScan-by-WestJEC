import React from 'react';
import { X, Cpu, Check, ShieldCheck, Sparkles, Languages, Sliders } from 'lucide-react';

interface OcrConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OcrConfigModal: React.FC<OcrConfigModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="ocr-config-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">OCR &amp; AI Engine Settings</h2>
              <p className="text-xs text-slate-500">Gemini 3.8 Flash Vision &amp; Japanese Meishi Parser</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Model Pipeline</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold uppercase text-[10px]">
                gemini-3.8-flash
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Multimodal optical character recognition optimized for dense vertical and horizontal Japanese business card (名刺) layouts.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Recognition Capabilities
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-800">Kanji (漢字) Extraction</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-800">Kana (ひらがな/カタカナ)</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-800">Japan Phone Formatting</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-800">Bilingual Front/Back Merge</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 flex items-start gap-3 text-blue-900">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold block">Enterprise Data Privacy</span>
              Captured card scans are analyzed server-side and never shared with public repositories. Contact records persist exclusively within your private dashboard.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
