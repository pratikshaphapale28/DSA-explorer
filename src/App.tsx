import React, { useState } from 'react';
import { PlayerProvider, usePlayer } from './engine/PlayerContext';
import { TopBar } from './components/layout/TopBar';
import { PlaybackBar } from './components/layout/PlaybackBar';
import { InsightPanel } from './components/insight/InsightPanel';
import { HelpModal } from './components/common/HelpModal';
import { GuidedTourModal } from './components/common/GuidedTourModal';
import { AlgorithmQuizModal } from './components/common/AlgorithmQuizModal';
import { LandingPage } from './pages/LandingPage';
import { CheatSheetPage } from './pages/CheatSheetPage';

// Modules
import { SearchingStage } from './components/modules/searching/SearchingStage';
import { SortingStage } from './components/modules/sorting/SortingStage';
import { StackQueueStage } from './components/modules/stackQueue/StackQueueStage';
import { TreeStage } from './components/modules/trees/TreeStage';
import { GraphStage } from './components/modules/graphs/GraphStage';
import { HashingStage } from './components/modules/hashing/HashingStage';

// Algorithms
import { linearSearchAlgorithm } from './algorithms/searching/linearSearch';
import { binarySearchAlgorithm } from './algorithms/searching/binarySearch';
import { quickSortAlgorithm } from './algorithms/sorting/quickSort';
import { dijkstraAlgorithm } from './algorithms/graphs/graphAlgorithms';
import type { ModuleCategory, AlgorithmDefinition } from './engine/types';
import { Award, Compass } from 'lucide-react';

export function DSAExplorerInner() {
  const { clearConfetti } = usePlayer();
  const [activeModule, setActiveModule] = useState<ModuleCategory | 'landing' | 'cheatsheet'>('landing');

  // Currently inspected algorithm for InsightPanel
  const [currentAlgo, setCurrentAlgo] = useState<AlgorithmDefinition<any, any, any>>(quickSortAlgorithm);

  // Searching specific state
  const [searchAlgoId, setSearchAlgoId] = useState<'linear_search' | 'binary_search'>('binary_search');

  // Modals
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const handleStartDemo = () => {
    clearConfetti();
    setActiveModule('sorting');
    setCurrentAlgo(quickSortAlgorithm);
  };

  const handleSearchAlgoChange = (id: 'linear_search' | 'binary_search') => {
    clearConfetti();
    setSearchAlgoId(id);
    setCurrentAlgo(id === 'binary_search' ? binarySearchAlgorithm : linearSearchAlgorithm);
  };

  const handleSelectModule = (mod: ModuleCategory | 'landing' | 'cheatsheet') => {
    clearConfetti();
    setActiveModule(mod);
    if (mod === 'graphs') setCurrentAlgo(dijkstraAlgorithm);
    else if (mod === 'sorting') setCurrentAlgo(quickSortAlgorithm);
    else if (mod === 'searching') setCurrentAlgo(binarySearchAlgorithm);
  };

  const isStageModule =
    activeModule !== 'landing' && activeModule !== 'cheatsheet';

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 transition-colors duration-200">
      {/* 1. Header Bar */}
      <TopBar
        activeModule={activeModule}
        onSelectModule={handleSelectModule}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Sub-header helper actions bar when inside a module */}
      {isStageModule && (
        <div className="flex items-center justify-between px-4 md:px-6 py-2 bg-slate-200/80 dark:bg-slate-900/50 border-b border-slate-300 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-300 capitalize">{activeModule}</span>
            <span>·</span>
            <span>{currentAlgo.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQuizOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-600/10 dark:bg-indigo-600/20 hover:bg-indigo-600/20 dark:hover:bg-indigo-600/40 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-medium transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Quiz Me</span>
            </button>
            <button
              onClick={() => setIsTourOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors shadow-xs"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Take Tour</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Visual Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Center Stage / Page */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
          {activeModule === 'landing' && (
            <LandingPage
              onSelectModule={handleSelectModule}
              onStartDemo={handleStartDemo}
            />
          )}

          {activeModule === 'cheatsheet' && <CheatSheetPage />}

          {activeModule === 'searching' && (
            <SearchingStage
              algorithmId={searchAlgoId}
              onAlgorithmChange={handleSearchAlgoChange}
            />
          )}

          {activeModule === 'sorting' && (
            <SortingStage
              activeAlgorithm={currentAlgo}
              onSelectAlgorithm={algo => setCurrentAlgo(algo)}
            />
          )}

          {activeModule === 'stackQueue' && (
            <StackQueueStage onAlgorithmChange={algo => setCurrentAlgo(algo)} />
          )}

          {activeModule === 'trees' && (
            <TreeStage onAlgorithmChange={algo => setCurrentAlgo(algo)} />
          )}

          {activeModule === 'graphs' && (
            <GraphStage onAlgorithmChange={algo => setCurrentAlgo(algo)} />
          )}

          {activeModule === 'hashing' && (
            <HashingStage onAlgorithmChange={algo => setCurrentAlgo(algo)} />
          )}
        </div>

        {/* Right Insight Panel (only visible when in an interactive module) */}
        {isStageModule && <InsightPanel algorithm={currentAlgo} />}
      </main>

      {/* 3. Bottom Playback Controls (only in interactive modules) */}
      {isStageModule && <PlaybackBar />}

      {/* 4. Global Modals */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <GuidedTourModal isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
      <AlgorithmQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        moduleCategory={activeModule}
      />
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <DSAExplorerInner />
    </PlayerProvider>
  );
}
