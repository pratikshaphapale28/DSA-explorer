import React, { useState } from 'react';
import { PlayerProvider, usePlayer } from './engine/PlayerContext';
import { TopBar } from './components/layout/TopBar';
import { StepCaptionCard } from './components/common/StepCaptionCard';
import { ModulePlaybackControls } from './components/common/ModulePlaybackControls';
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
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 transition-colors duration-200">
      {/* 1. Header Bar */}
      <div className="shrink-0">
        <TopBar
          activeModule={activeModule}
          onSelectModule={handleSelectModule}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
      </div>

      {/* Sub-header helper actions bar when inside a module */}
      {isStageModule && (
        <div className="shrink-0 flex items-center justify-between px-4 md:px-6 py-2 bg-slate-200/80 dark:bg-slate-900/50 border-b border-slate-300 dark:border-slate-800 text-xs">
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

      {/* 2. Main Visual Workspace (Requirement 1 & 2: Two-column one-screen layout) */}
      <main className="flex-1 flex flex-col min-[1100px]:flex-row overflow-y-auto min-[1100px]:overflow-hidden min-h-0">
        {!isStageModule ? (
          /* Full-width scrollable container for Landing and CheatSheet pages */
          <div className="flex-1 min-h-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
            {activeModule === 'landing' && (
              <LandingPage
                onSelectModule={handleSelectModule}
                onStartDemo={handleStartDemo}
              />
            )}
            {activeModule === 'cheatsheet' && <CheatSheetPage />}
          </div>
        ) : (
          <>
            {/* LEFT column (about 60%): Canvas on top, directly under it Playback controls, then StepCaptionCard */}
            <div className="w-full min-[1100px]:w-[60%] min-[1100px]:h-full flex flex-col min-h-0 p-2 md:p-2.5 gap-2 bg-slate-50 dark:bg-slate-950 overflow-y-auto min-[1100px]:overflow-hidden">
              {/* Visual canvas stage */}
              <div className="flex-1 min-h-0 flex flex-col overflow-y-auto min-[1100px]:overflow-hidden">
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

              {/* c. PLAYBACK BAR: directly under canvas, always visible (Requirement 2c & 7) */}
              <div className="shrink-0 min-[1100px]:static sticky bottom-0 z-30 shadow-md min-[1100px]:shadow-none">
                <ModulePlaybackControls />
              </div>

              {/* d. Step Caption Card: directly under playback bar, fixed ~110px height (Requirement 2d) */}
              <div className="shrink-0">
                <StepCaptionCard algorithm={currentAlgo} />
              </div>
            </div>

            {/* RIGHT column (about 40%): Pseudocode panel and collapsible Telemetry */}
            <div className="w-full min-[1100px]:w-[40%] min-[1100px]:h-full flex flex-col min-h-0 border-t min-[1100px]:border-t-0 min-[1100px]:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto min-[1100px]:overflow-hidden">
              <InsightPanel algorithm={currentAlgo} />
            </div>
          </>
        )}
      </main>

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
