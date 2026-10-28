import React, { useState } from 'react';
import { usePlayer } from '../../engine/PlayerContext';
import type { AlgorithmDefinition, Step } from '../../engine/types';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface StepCaptionCardProps {
  algorithm: AlgorithmDefinition<any, any, any>;
}

export const StepCaptionCard: React.FC<StepCaptionCardProps> = ({ algorithm }) => {
  const { currentStep, currentStepIndex, totalSteps } = usePlayer();
  const [showTechDetail, setShowTechDetail] = useState(false);
  const [isIntroDismissed, setIsIntroDismissed] = useState(false);

  // Reset intro dismissed when algorithm changes
  React.useEffect(() => {
    setIsIntroDismissed(false);
  }, [algorithm.id]);

  if (!currentStep) return null;

  const isAtStart = currentStepIndex === 0;
  const isAtEnd = currentStepIndex >= totalSteps - 1 && currentStep.type === 'complete';
  const isUnrun = Boolean(currentStep.auxiliary && (currentStep.auxiliary as any).isUnrun);

  // Live variable formatting
  const getLiveVariables = (step: Step): { label: string; value: string | number }[] => {
    const list: { label: string; value: string | number }[] = [];
    const aux: any = step.auxiliary || {};
    const highlights = step.highlights || {};

    if (highlights.pointers) {
      for (const [k, v] of Object.entries(highlights.pointers)) {
        list.push({ label: k, value: String(v) });
      }
    }

    if (aux.pivotValue !== undefined) list.push({ label: 'pivot', value: aux.pivotValue });
    if (aux.pivotIndex !== undefined) list.push({ label: 'pivotIdx', value: aux.pivotIndex });
    if (aux.i !== undefined) list.push({ label: 'i', value: aux.i });
    if (aux.j !== undefined) list.push({ label: 'j', value: aux.j });
    if (aux.mid !== undefined) list.push({ label: 'mid', value: aux.mid });
    if (aux.low !== undefined) list.push({ label: 'low', value: aux.low });
    if (aux.high !== undefined) list.push({ label: 'high', value: aux.high });
    if (aux.target !== undefined) list.push({ label: 'target', value: aux.target });
    if (aux.currentNodeId !== undefined) list.push({ label: 'node', value: aux.currentNodeId });
    if (aux.currentNodeKey !== undefined) list.push({ label: 'node', value: aux.currentNodeKey });
    if (aux.balanceFactor !== undefined) list.push({ label: 'balance', value: aux.balanceFactor });
    if (aux.targetKey !== undefined) list.push({ label: 'key', value: aux.targetKey });

    return list;
  };

  const liveVars = getLiveVariables(currentStep);

  // Action badge color mapping
  const getActionBadgeColor = (type: string) => {
    switch (type) {
      case 'compare':
        return 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30';
      case 'swap':
        return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40';
      case 'insert':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      case 'found':
      case 'complete':
        return 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border-emerald-500/40';
      case 'partition':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
      case 'visit':
      case 'push':
      case 'pop':
        return 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30';
      case 'probe':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30';
    }
  };

  const getIntroDetails = () => {
    switch (algorithm.id) {
      case 'quick_sort':
        return {
          does: 'Quick Sort chooses a pivot element and partitions the array into values smaller and larger than the pivot.',
          watchFor: 'Watch how items smaller than the pivot stay left, larger ones move right, and the pivot locks into place.'
        };
      case 'merge_sort':
        return {
          does: 'Merge Sort splits the array in halves recursively, then merges sorted subarrays back together.',
          watchFor: 'Watch subarrays divide down to single elements and stitch back together in sorted order.'
        };
      case 'heap_sort':
        return {
          does: 'Heap Sort builds a max-heap tree structure, then repeatedly extracts the root maximum to the end.',
          watchFor: 'Watch sift-down operations restore the heap property each time the top element is swapped.'
        };
      case 'binary_search':
        return {
          does: 'Binary Search finds a target in a sorted list by repeatedly inspecting the middle element.',
          watchFor: 'Watch the low and high pointers close in, cutting the search interval in half every comparison.'
        };
      case 'linear_search':
        return {
          does: 'Linear Search scans through elements one-by-one from index 0 until the target is found.',
          watchFor: 'Watch the scanning pointer check each slot in sequence without assuming any order.'
        };
      case 'bfs':
        return {
          does: 'Breadth-First Search (BFS) explores all immediate neighbor nodes before moving to the next distance horizon.',
          watchFor: 'Watch unvisited nodes enter the FIFO queue and get explored in concentric level waves.'
        };
      case 'dfs':
        return {
          does: 'Depth-First Search (DFS) dives as deep as possible down each path using a LIFO stack before backtracking.',
          watchFor: 'Watch nodes pushed onto the stack proceed down branches until hitting dead ends.'
        };
      case 'dijkstra':
        return {
          does: "Dijkstra's algorithm greedily finds the guaranteed shortest paths using non-negative edge weights.",
          watchFor: 'Watch the unvisited node with lowest tentative distance get settled, updating adjacent paths.'
        };
      case 'hashing':
        return {
          does: 'Hash tables map keys to indices using a hash function, resolving collisions via probing or chaining.',
          watchFor: 'Watch how collisions trigger probe sequences and tombstones preserve subsequent searches.'
        };
      default:
        return {
          does: algorithm.summary,
          watchFor: 'Watch the step-by-step state transitions, highlighted comparisons, and pointer movements.'
        };
    }
  };

  const intro = getIntroDetails();
  const showIntro = isAtStart && !isIntroDismissed && !isAtEnd;

  // 1. "About to happen" intro card: shown ONLY before first step (Step 0) in the exact 110px space
  if (showIntro) {
    return (
      <div className="w-full h-[110px] min-h-[110px] max-h-[110px] rounded-xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 p-2.5 shadow-xs flex flex-col justify-between overflow-hidden shrink-0 select-none">
        <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-300">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>About to happen: {algorithm.name}</span>
          </div>
          <button
            onClick={() => setIsIntroDismissed(true)}
            className="text-[10px] px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-semibold transition-colors"
            title="Dismiss intro and show step controls"
          >
            Dismiss ✕
          </button>
        </div>
        <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">
          <strong className="text-indigo-950 dark:text-indigo-200 font-semibold">Goal: </strong>
          {intro.does}
        </p>
        <p className="text-[11px] text-indigo-900/80 dark:text-indigo-300/80 line-clamp-1">
          <strong className="text-indigo-700 dark:text-indigo-400 font-semibold">Watch for: </strong>
          {intro.watchFor}
        </p>
      </div>
    );
  }

  // 2. Completion summary card: shown in the exact same 110px space after the last step
  if (isAtEnd) {
    return (
      <div className="w-full h-[110px] min-h-[110px] max-h-[110px] rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-2.5 shadow-xs flex flex-col justify-between overflow-hidden shrink-0 select-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Execution Completed!</span>
          </div>
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
            <span>Time: <strong className="text-emerald-600 dark:text-emerald-400">{algorithm.complexity.average}</strong></span>
            <span>Space: <strong className="text-purple-600 dark:text-purple-400">{algorithm.complexity.space}</strong></span>
          </div>
        </div>
        <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug line-clamp-2 font-medium">
          {currentStep.description}
        </p>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600 dark:text-slate-400 border-t border-emerald-200/60 dark:border-emerald-900/40 pt-1">
          <span>Comparisons: <strong className="text-slate-900 dark:text-white">{currentStep.counters.comparisons}</strong></span>
          <span>Swaps: <strong className="text-slate-900 dark:text-white">{currentStep.counters.swaps}</strong></span>
          <span>Total Ops: <strong className="text-indigo-600 dark:text-indigo-400">{currentStep.counters.comparisons + currentStep.counters.swaps + currentStep.counters.arrayAccesses}</strong></span>
        </div>
      </div>
    );
  }

  // 3. Normal Step Caption Card: fixed 110px height directly under playback bar
  return (
    <div className="w-full h-[110px] min-h-[110px] max-h-[110px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 shadow-xs flex flex-col justify-between overflow-hidden shrink-0 select-none">
      {/* Row 1: Step N of TOTAL + Action badge + Variables strip */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${getActionBadgeColor(
              currentStep.type
            )}`}
          >
            {currentStep.type.toUpperCase()}
          </span>
        </div>

        {/* Live Variables Strip */}
        {liveVars.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap overflow-hidden max-h-5">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 select-none">
              Vars:
            </span>
            {liveVars.slice(0, 4).map((v, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-semibold text-slate-800 dark:text-slate-200"
              >
                <span className="text-slate-500 dark:text-slate-400">{v.label}=</span>
                <span className="text-indigo-600 dark:text-indigo-400">{v.value}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Row 2: One-sentence plain-English explanation animating in with short fade */}
      <div key={currentStepIndex} className="animate-in fade-in duration-150 flex-1 flex items-center min-h-0 overflow-hidden">
        <p className="text-xs md:text-[13px] font-medium text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
          {currentStep.description}
        </p>
      </div>

      {/* Row 3: Collapsible Technical Detail line */}
      <div className="shrink-0 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-1">
        <button
          onClick={() => setShowTechDetail(prev => !prev)}
          className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          {showTechDetail ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          <span>{showTechDetail ? 'Hide Technical detail' : 'Technical detail'}</span>
        </button>
        {showTechDetail ? (
          <span className="truncate">
            Op: {currentStep.type.toUpperCase()} · Line: {currentStep.pseudocodeLine || 1} · Cmp: {currentStep.counters.comparisons} · Swp: {currentStep.counters.swaps}
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">
            Cmp: {currentStep.counters.comparisons} · Swp: {currentStep.counters.swaps}
          </span>
        )}
      </div>
    </div>
  );
};
