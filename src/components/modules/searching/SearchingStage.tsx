import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../../engine/PlayerContext';
import { linearSearchAlgorithm, type SearchAuxiliary } from '../../../algorithms/searching/linearSearch';
import { binarySearchAlgorithm } from '../../../algorithms/searching/binarySearch';
import { Shuffle, ArrowUpDown, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SearchingStageProps {
  algorithmId: 'linear_search' | 'binary_search';
  onAlgorithmChange: (id: 'linear_search' | 'binary_search') => void;
}

export const SearchingStage: React.FC<SearchingStageProps> = ({
  algorithmId,
  onAlgorithmChange,
}) => {
  const { currentStep, loadSteps } = usePlayer();

  // Initial state values
  const [array, setArray] = useState<number[]>([14, 29, 8, 42, 63, 19, 51, 35]);
  const [target, setTarget] = useState<number>(42);
  const [customArrayText, setCustomArrayText] = useState<string>('14, 29, 8, 42, 63, 19, 51, 35');
  const [isSortedWarning, setIsSortedWarning] = useState<boolean>(false);

  // Check if current array is sorted
  const checkIfSorted = (arr: number[]) => {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) return false;
    }
    return true;
  };

  // Re-generate steps whenever inputs change
  const recomputeSteps = (arr: number[], tgt: number, algoId: string) => {
    const isSorted = checkIfSorted(arr);
    setIsSortedWarning(algoId === 'binary_search' && !isSorted);

    if (algoId === 'binary_search') {
      const steps = binarySearchAlgorithm.generateSteps({ array: arr, target: tgt });
      loadSteps(steps, false);
    } else {
      const steps = linearSearchAlgorithm.generateSteps({ array: arr, target: tgt });
      loadSteps(steps, false);
    }
  };

  useEffect(() => {
    recomputeSteps(array, target, algorithmId);
  }, [algorithmId]);

  const handleRandomize = () => {
    const count = 8;
    const newArr = Array.from({ length: count }, () => Math.floor(Math.random() * 90) + 10);
    if (algorithmId === 'binary_search') {
      newArr.sort((a, b) => a - b);
    }
    const randomTarget = newArr[Math.floor(Math.random() * newArr.length)];
    setArray(newArr);
    setTarget(randomTarget);
    setCustomArrayText(newArr.join(', '));
    recomputeSteps(newArr, randomTarget, algorithmId);
  };

  const handleSortFirst = () => {
    const sorted = [...array].sort((a, b) => a - b);
    setArray(sorted);
    setCustomArrayText(sorted.join(', '));
    recomputeSteps(sorted, target, algorithmId);
  };

  const handleApplyCustomArray = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = customArrayText
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));
    if (parsed.length > 0) {
      setArray(parsed);
      recomputeSteps(parsed, target, algorithmId);
    }
  };

  const handleTargetChange = (newTarget: number) => {
    setTarget(newTarget);
    recomputeSteps(array, newTarget, algorithmId);
  };

  // Extract snapshot details from currentStep with array guard
  const stepState = Array.isArray(currentStep?.state) ? currentStep.state : array;
  const aux = (currentStep?.auxiliary as SearchAuxiliary) || {};
  const highlightedIndices = currentStep?.highlights?.indices || [];
  const maxVal = Math.max(...stepState, target, 50);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
      {/* Stage Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 mb-6 shadow-sm">
        {/* Algorithm Segmented Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => onAlgorithmChange('linear_search')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              algorithmId === 'linear_search'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Linear Search
          </button>
          <button
            onClick={() => onAlgorithmChange('binary_search')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              algorithmId === 'binary_search'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Binary Search
          </button>
        </div>

        {/* Target input & Randomize */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target:</span>
            <input
              type="number"
              value={target}
              onChange={e => handleTargetChange(parseInt(e.target.value, 10) || 0)}
              aria-label="Target search value"
              className="w-16 px-2 py-1 text-xs font-mono bg-slate-950 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </label>

          <button
            onClick={handleRandomize}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Randomize</span>
          </button>
        </div>
      </div>

      {/* Reserved slot for Unsorted warning so the layout does NOT jump */}
      <div className="min-h-[50px] mb-4 flex items-center shrink-0">
        {isSortedWarning && (
          <div className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-950/50 border border-amber-800 text-amber-300 text-xs shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Warning:</strong> Array is unsorted! Binary Search requires a sorted array and the result may be wrong.
              </span>
            </div>
            <button
              onClick={handleSortFirst}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors shadow-xs"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort Array First</span>
            </button>
          </div>
        )}
      </div>

      {/* Array Visualization Arena: Top-anchored, zero wasted space */}
      <div className="min-h-[280px] flex flex-col justify-start pt-3 pb-4 px-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 relative overflow-hidden">
        {/* Subtle background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Outcome banner if terminal step */}
        {currentStep?.type === 'found' && (
          <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-semibold shadow-md animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>Target {target} Found at Index {aux.foundIndex}!</span>
          </div>
        )}
        {currentStep?.type === 'not_found' && (
          <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-semibold shadow-md animate-in fade-in shrink-0">
            <AlertCircle className="w-4 h-4" />
            <span>Target {target} Not Found in Array (-1)</span>
          </div>
        )}

        {/* Array Bars Container: Top-anchored and centered */}
        <div className="relative z-10 flex items-end justify-center gap-3 md:gap-5 w-full h-44 my-2">
          {stepState.map((val, idx) => {
            const isHighlighted = highlightedIndices.includes(idx);
            const isFound = aux.foundIndex === idx;
            const isLow = aux.low === idx;
            const isMid = aux.mid === idx;
            const isHigh = aux.high === idx;

            // Check if within eliminated range
            const isEliminated =
              aux.eliminatedRange &&
              idx >= aux.eliminatedRange[0] &&
              idx <= aux.eliminatedRange[1];

            const heightPct = Math.max(16, (val / maxVal) * 85);

            let barBg = 'bg-slate-800 hover:bg-slate-700';
            let barBorder = 'border-slate-700';

            if (isFound) {
              barBg = 'bg-gradient-to-t from-emerald-600 to-emerald-400';
              barBorder = 'border-emerald-300 ring-2 ring-emerald-400/60 shadow-lg';
            } else if (isHighlighted) {
              barBg = 'bg-gradient-to-t from-amber-600 to-amber-400';
              barBorder = 'border-amber-300 ring-2 ring-amber-400/60 shadow-md';
            } else if (isMid) {
              barBg = 'bg-gradient-to-t from-indigo-600 to-indigo-400';
              barBorder = 'border-indigo-300 ring-2 ring-indigo-400/60 shadow-md';
            } else if (isEliminated) {
              barBg = 'bg-slate-900/60 opacity-30';
              barBorder = 'border-slate-800';
            }

            return (
              <div
                key={idx}
                className="flex-1 max-w-[64px] flex flex-col items-center justify-end h-full transition-all duration-200"
              >
                {/* Pointer indicators: Larger, bolder badges (L, mid, R) */}
                <div className="h-6 flex items-center justify-center gap-1 mb-1 font-mono">
                  {isLow && (
                    <span className="px-1.5 py-0.5 rounded bg-sky-500 text-slate-950 font-black text-xs shadow-xs" title="Low pointer (L)">
                      L
                    </span>
                  )}
                  {isMid && (
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500 text-white font-black text-xs shadow-xs" title="Midpoint (mid)">
                      mid
                    </span>
                  )}
                  {isHigh && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-500 text-white font-black text-xs shadow-xs" title="High pointer (R)">
                      R
                    </span>
                  )}
                </div>

                {/* The Bar */}
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-lg border-t border-x ${barBg} ${barBorder} flex items-center justify-center transition-all duration-300 relative group`}
                >
                  <span className="text-xs md:text-sm font-bold font-mono text-white drop-shadow-md">
                    {val}
                  </span>
                </div>

                {/* Index tag */}
                <div className="mt-2 text-center">
                  <span className="text-[11px] font-mono text-slate-500">[{idx}]</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom input bar at bottom */}
      <form
        onSubmit={handleApplyCustomArray}
        className="mt-4 flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs"
      >
        <span className="text-slate-400 font-medium">Custom Array:</span>
        <input
          type="text"
          value={customArrayText}
          onChange={e => setCustomArrayText(e.target.value)}
          placeholder="e.g. 10, 25, 30, 45, 60"
          className="flex-1 min-w-[200px] px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
        >
          Set Array
        </button>
      </form>
    </div>
  );
};
