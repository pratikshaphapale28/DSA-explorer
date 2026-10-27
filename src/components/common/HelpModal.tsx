import React from 'react';
import { X, Keyboard, Palette, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h2 id="help-modal-title" className="text-lg font-bold">DSA Explorer Guide & Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close help modal"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-6 text-sm">
          {/* Keyboard shortcuts */}
          <div>
            <div className="flex items-center gap-2 font-semibold text-slate-200 mb-2">
              <Keyboard className="w-4 h-4 text-sky-400" />
              <span>Keyboard Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400">Play / Pause</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 font-mono text-[11px]">Space</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400">Step Forward</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 font-mono text-[11px]">→</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400">Step Backward</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 font-mono text-[11px]">←</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400">Reset Algorithm</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 font-mono text-[11px]">R</kbd>
              </div>
            </div>
          </div>

          {/* Color Legend */}
          <div>
            <div className="flex items-center gap-2 font-semibold text-slate-200 mb-2">
              <Palette className="w-4 h-4 text-emerald-400" />
              <span>Color Legend</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40">
                <div className="w-3.5 h-3.5 rounded bg-amber-500 shrink-0" />
                <span className="text-slate-300">Comparing / Probing</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40">
                <div className="w-3.5 h-3.5 rounded bg-rose-500 shrink-0" />
                <span className="text-slate-300">Swapping / Unbalanced</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40">
                <div className="w-3.5 h-3.5 rounded bg-emerald-500 shrink-0" />
                <span className="text-slate-300">Sorted / Found / Relaxed</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40">
                <div className="w-3.5 h-3.5 rounded bg-indigo-500 shrink-0" />
                <span className="text-slate-300">Default / Active Item</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40">
                <div className="w-3.5 h-3.5 rounded bg-purple-500 shrink-0" />
                <span className="text-slate-300">Pivot / Subarray Bound</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40">
                <div className="w-3.5 h-3.5 rounded bg-slate-600 shrink-0" />
                <span className="text-slate-300">Eliminated / Inactive</span>
              </div>
            </div>
          </div>

          {/* Quick instructions */}
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/50 text-indigo-200/90 text-xs leading-relaxed">
            <span className="font-semibold text-indigo-300">Beginner Tip: </span>
            Every step is recorded as a complete snapshot. You can drag the timeline scrubber or use the Arrow keys to step backward and forward through time to inspect exactly what the algorithm was thinking at that moment!
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
          >
            Got it, let's explore
          </button>
        </div>
      </div>
    </div>
  );
};
