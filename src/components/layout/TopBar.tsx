import React from 'react';
import { usePlayer } from '../../engine/PlayerContext';
import { HelpCircle, Sun, Moon, Sparkles, BookOpen } from 'lucide-react';
import type { ModuleCategory } from '../../engine/types';

interface TopBarProps {
  activeModule: ModuleCategory | 'landing' | 'cheatsheet';
  onSelectModule: (module: ModuleCategory | 'landing' | 'cheatsheet') => void;
  onOpenHelp: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeModule,
  onSelectModule,
  onOpenHelp,
}) => {
  const { theme, toggleTheme, mode, setMode } = usePlayer();

  const navLinks: { id: ModuleCategory | 'landing' | 'cheatsheet'; label: string }[] = [
    { id: 'landing', label: 'Overview' },
    { id: 'searching', label: 'Searching' },
    { id: 'sorting', label: 'Sorting' },
    { id: 'stackQueue', label: 'Stack & Queue' },
    { id: 'trees', label: 'Trees' },
    { id: 'graphs', label: 'Graphs' },
    { id: 'hashing', label: 'Hashing' },
    { id: 'cheatsheet', label: 'Cheat Sheet' },
  ];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 md:gap-6 px-4 md:px-6 py-2.5 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shrink-0 text-slate-900 dark:text-slate-100 shadow-xs">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onSelectModule('landing')}
          className="flex items-center gap-2 text-left group transition-transform active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              DSA Explorer
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono -mt-0.5">
              interactive visualizer
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: Navigation Links (Responsive: full buttons on desktop lg+, dropdown on tablet/mobile) */}
      <nav className="hidden lg:flex items-center gap-1 text-xs font-medium py-1">
        {navLinks.map(link => {
          const isActive = activeModule === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onSelectModule(link.id)}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Mobile/Tablet Module Selector (< lg) */}
      <div className="lg:hidden flex items-center">
        <select
          value={activeModule}
          onChange={e => onSelectModule(e.target.value as any)}
          aria-label="Select module"
          className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        >
          {navLinks.map(l => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Zone 3: Controls & Primary Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Beginner vs Advanced Mode Toggle */}
        <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/60 text-[11px] font-medium">
          <button
            onClick={() => setMode('beginner')}
            className={`px-2 py-1 rounded-md transition-all ${
              mode === 'beginner'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Beginner mode: detailed step narration and visual metaphors"
          >
            Beginner
          </button>
          <button
            onClick={() => setMode('advanced')}
            className={`px-2 py-1 rounded-md transition-all ${
              mode === 'advanced'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Advanced mode: compact code and metrics focus"
          >
            Advanced
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Help & Shortcuts */}
        <button
          onClick={onOpenHelp}
          aria-label="Open shortcuts and help guide"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span className="hidden sm:inline">Guide</span>
        </button>
      </div>
    </header>
  );
};
