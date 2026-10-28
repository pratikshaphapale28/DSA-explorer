import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../../engine/PlayerContext';
import {
  bubbleSortAlgorithm,
  insertionSortAlgorithm,
  selectionSortAlgorithm,
  mergeSortAlgorithm,
  quickSortAlgorithm,
  heapSortAlgorithm,
  type SortingAuxiliary,
} from '../../../algorithms/sorting';
import type { AlgorithmDefinition } from '../../../engine/types';
import { Shuffle, ArrowUpDown, Sliders, Columns, GitCompare } from 'lucide-react';

interface SortingStageProps {
  activeAlgorithm: AlgorithmDefinition<number[], number[], SortingAuxiliary>;
  onSelectAlgorithm: (algo: AlgorithmDefinition<number[], number[], SortingAuxiliary>) => void;
}

export const SortingStage: React.FC<SortingStageProps> = ({
  activeAlgorithm,
  onSelectAlgorithm,
}) => {
  const { currentStep, loadSteps } = usePlayer();

  // Input states
  const [size, setSize] = useState<number>(10);
  const [array, setArray] = useState<number[]>([38, 27, 43, 3, 9, 82, 10, 55, 14, 67]);
  const [customInputText, setCustomInputText] = useState<string>('38, 27, 43, 3, 9, 82, 10, 55, 14, 67');
  const [sideBySide, setSideBySide] = useState<boolean>(false);
  const [compareAlgoId, setCompareAlgoId] = useState<string>('quick_sort');

  const allAlgorithms = [
    bubbleSortAlgorithm,
    insertionSortAlgorithm,
    selectionSortAlgorithm,
    mergeSortAlgorithm,
    quickSortAlgorithm,
    heapSortAlgorithm,
  ];

  const compareAlgo = allAlgorithms.find(a => a.id === compareAlgoId) || quickSortAlgorithm;

  // Re-generate steps on input or algorithm change
  const reload = (newArr: number[], algo: AlgorithmDefinition<number[], number[], SortingAuxiliary>) => {
    const steps = algo.generateSteps(newArr);
    loadSteps(steps, false);
  };

  useEffect(() => {
    reload(array, activeAlgorithm);
  }, [activeAlgorithm]);

  // Presets
  const generateRandom = (count: number) => {
    const arr = Array.from({ length: count }, () => Math.floor(Math.random() * 85) + 10);
    setArray(arr);
    setCustomInputText(arr.join(', '));
    reload(arr, activeAlgorithm);
  };

  const generateNearlySorted = (count: number) => {
    const arr = Array.from({ length: count }, (_, i) => (i + 1) * 8 + 5);
    // Swap 2 random adjacent pairs
    if (count > 3) {
      const idx1 = 1;
      const t1 = arr[idx1];
      arr[idx1] = arr[idx1 + 1];
      arr[idx1 + 1] = t1;
    }
    setArray(arr);
    setCustomInputText(arr.join(', '));
    reload(arr, activeAlgorithm);
  };

  const generateReversed = (count: number) => {
    const arr = Array.from({ length: count }, (_, i) => (count - i) * 8 + 5);
    setArray(arr);
    setCustomInputText(arr.join(', '));
    reload(arr, activeAlgorithm);
  };

  const generateFewUnique = (count: number) => {
    const values = [20, 50, 80];
    const arr = Array.from({ length: count }, () => values[Math.floor(Math.random() * values.length)]);
    setArray(arr);
    setCustomInputText(arr.join(', '));
    reload(arr, activeAlgorithm);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = customInputText
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));
    if (parsed.length > 0) {
      setArray(parsed);
      setSize(parsed.length);
      reload(parsed, activeAlgorithm);
    }
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    generateRandom(newSize);
  };

  // Current visual snapshot state with defensive array check
  const stepState = Array.isArray(currentStep?.state) ? currentStep.state : array;
  const aux = (currentStep?.auxiliary as SortingAuxiliary) || { sortedIndices: [] };
  const highlighted = currentStep?.highlights?.indices || [];
  const secondary = currentStep?.highlights?.secondaryIndices || [];
  const activeRange = currentStep?.highlights?.activeRange;
  const maxVal = Math.max(...stepState, 100);

  // Compute stats comparison for Side-by-Side preview
  const activeAlgoSteps = activeAlgorithm.generateSteps(array);
  const compareAlgoSteps = compareAlgo.generateSteps(array);
  const activeFinal = activeAlgoSteps[activeAlgoSteps.length - 1]?.counters;
  const compareFinal = compareAlgoSteps[compareAlgoSteps.length - 1]?.counters;

  const isHeapSort = activeAlgorithm.id === 'heap_sort';

  // Heap Tree calculations: up to 4 levels, dynamically spaced for all elements (55, 14, 67 etc.)
  const heapTotalNodes = stepState.length;
  const heapNumLevels = Math.floor(Math.log2(Math.max(1, heapTotalNodes))) + 1;
  const heapSvgWidth = 560;
  const heapLevelHeight = heapNumLevels > 3 ? 34 : 40;
  const heapStartY = 16;
  const heapNodeRadius = 12.5;

  const heapNodeCoords = stepState.map((_, i) => {
    const level = Math.floor(Math.log2(i + 1));
    const offset = i - (Math.pow(2, level) - 1);
    const nodesInLevel = Math.pow(2, level);
    const step = heapSvgWidth / nodesInLevel;
    const x = step * (offset + 0.5);
    const y = heapStartY + level * heapLevelHeight;
    return { x, y, level };
  });

  const heapSvgHeight = heapStartY + (heapNumLevels - 1) * heapLevelHeight + 28;

  // Shorten each edge so it stops at the circle's border (offset by radius)
  const heapEdges: {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    isActive: boolean;
  }[] = [];

  for (let i = 1; i < stepState.length; i++) {
    const parentIdx = Math.floor((i - 1) / 2);
    const pPos = heapNodeCoords[parentIdx];
    const cPos = heapNodeCoords[i];
    if (!pPos || !cPos) continue;

    const dx = cPos.x - pPos.x;
    const dy = cPos.y - pPos.y;
    const dist = Math.hypot(dx, dy) || 1;

    const x1 = pPos.x + (dx / dist) * heapNodeRadius;
    const y1 = pPos.y + (dy / dist) * heapNodeRadius;
    const x2 = cPos.x - (dx / dist) * heapNodeRadius;
    const y2 = cPos.y - (dy / dist) * heapNodeRadius;

    const isEdgeActive = highlighted.includes(i) && highlighted.includes(parentIdx);

    heapEdges.push({
      id: `heap-edge-${parentIdx}-${i}`,
      x1,
      y1,
      x2,
      y2,
      isActive: isEdgeActive,
    });
  }

  const renderArrayBars = (containerHeightClass: string) => (
    <div className={`flex items-end justify-center gap-1.5 md:gap-2.5 w-full ${containerHeightClass} my-2`}>
      {stepState.map((val, idx) => {
        const isComparing = currentStep?.type === 'compare' && highlighted.includes(idx);
        const isSwapping = currentStep?.type === 'swap' && highlighted.includes(idx);
        const isPivot = aux.pivotIndex === idx;
        const isSorted = aux.sortedIndices?.includes(idx);
        const isInActiveRange =
          activeRange && idx >= activeRange[0] && idx <= activeRange[1];

        const heightPct = Math.max(14, (val / maxVal) * 90);

        let barBg = 'bg-slate-600';
        let barBorder = 'border-slate-500';

        if (isSwapping) {
          barBg = 'bg-gradient-to-t from-rose-600 to-rose-400';
          barBorder = 'border-rose-300 ring-2 ring-rose-400/60 shadow-lg';
        } else if (isPivot) {
          barBg = 'bg-gradient-to-t from-purple-600 to-purple-400';
          barBorder = isComparing
            ? 'border-purple-300 ring-2 ring-purple-400 shadow-md'
            : 'border-purple-300 ring-1 ring-purple-400/50';
        } else if (isComparing) {
          barBg = 'bg-gradient-to-t from-amber-600 to-amber-400';
          barBorder = 'border-amber-300 ring-2 ring-amber-400/60 shadow-md';
        } else if (isSorted) {
          barBg = 'bg-gradient-to-t from-emerald-600 to-emerald-400';
          barBorder = 'border-emerald-300';
        } else if (isInActiveRange) {
          barBg = 'bg-slate-500';
          barBorder = 'border-slate-400';
        }

        return (
          <div
            key={idx}
            className="flex-1 max-w-[48px] flex flex-col items-center justify-end h-full transition-all duration-200"
          >
            <div className="h-6 flex items-center justify-center gap-1 mb-1 font-mono">
              {isPivot && (
                <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white font-black text-xs shadow-xs" title="Pivot">
                  P
                </span>
              )}
              {aux.pointers?.i === idx && (
                <span className="px-1.5 py-0.5 rounded bg-sky-500 text-slate-950 font-black text-xs shadow-xs" title="Pointer i">
                  i
                </span>
              )}
              {aux.pointers?.j === idx && (
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-xs shadow-xs" title="Pointer j">
                  j
                </span>
              )}
            </div>

            <div
              style={{ height: `${heightPct}%` }}
              className={`w-full rounded-t-md border-t border-x ${barBg} ${barBorder} flex items-center justify-center transition-all duration-200 relative`}
            >
              <span className="text-[11px] md:text-xs font-bold font-mono text-white drop-shadow-sm select-none">
                {val}
              </span>
            </div>

            <div className="mt-1 text-center">
              <span className="text-[10px] font-mono text-slate-500">[{idx}]</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderHeapTree = () => (
    <div className="w-full flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
      <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1 px-1">
        <span className="font-semibold text-slate-300">Binary Max-Heap Tree ({heapTotalNodes} nodes)</span>
        <span className="text-[10px] text-indigo-400">Parent: ⌊(i-1)/2⌋ · Left: 2i+1 · Right: 2i+2</span>
      </div>
      <div className="w-full h-36 min-[1100px]:h-44 flex items-center justify-center overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${heapSvgWidth} ${heapSvgHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* LAYER 1: First all edges (lines) */}
          <g className="heap-edges">
            {heapEdges.map(edge => (
              <line
                key={edge.id}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke={edge.isActive ? '#f59e0b' : '#475569'}
                strokeWidth={edge.isActive ? '2.5' : '1.75'}
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* LAYER 2: Then all node circles with solid fill (never transparent!) */}
          <g className="heap-circles">
            {stepState.map((val, i) => {
              const pos = heapNodeCoords[i];
              if (!pos) return null;

              const isComparing = currentStep?.type === 'compare' && highlighted.includes(i);
              const isSwapping = currentStep?.type === 'swap' && highlighted.includes(i);
              const isSorted = aux.sortedIndices?.includes(i);
              const isInHeap = (aux.heapSize ?? stepState.length) > i;

              let fill = '#1e293b';
              let stroke = '#6366f1';

              if (isSwapping) {
                fill = '#e11d48';
                stroke = '#fda4af';
              } else if (isComparing) {
                fill = '#d97706';
                stroke = '#fcd34d';
              } else if (isSorted || !isInHeap) {
                fill = '#059669';
                stroke = '#6ee7b7';
              } else {
                fill = '#1e293b';
                stroke = '#6366f1';
              }

              return (
                <circle
                  key={`heap-node-${i}`}
                  cx={pos.x}
                  cy={pos.y}
                  r={heapNodeRadius}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="2"
                  className="filter drop-shadow-sm transition-all duration-200"
                />
              );
            })}
          </g>

          {/* LAYER 3: All node labels (numbers) on top - bold, white, centered, pointer-events: none */}
          <g className="heap-labels" pointerEvents="none">
            {stepState.map((val, i) => {
              const pos = heapNodeCoords[i];
              if (!pos) return null;

              return (
                <g key={`heap-label-${i}`}>
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="select-none"
                  >
                    {val}
                  </text>

                  <text
                    x={pos.x}
                    y={pos.y + heapNodeRadius + 9}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="600"
                    className="select-none"
                  >
                    [{i}]
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col p-2 md:p-3 overflow-y-auto min-[1100px]:overflow-hidden">
      {/* Top Controls Toolbar: At most 2 tight rows (Requirement 2a) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 mb-2 shadow-xs shrink-0">
        {/* Algorithm Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-medium">
          {allAlgorithms.map(algo => (
            <button
              key={algo.id}
              onClick={() => onSelectAlgorithm(algo)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-all ${
                activeAlgorithm.id === algo.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {algo.name.split(' (')[0]}
            </button>
          ))}
        </div>

        {/* Input preset buttons & side-by-side toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700/60 text-xs">
            <button
              onClick={() => generateRandom(size)}
              className="px-2 py-0.5 text-slate-300 hover:text-white rounded transition-colors"
            >
              Random
            </button>
            <button
              onClick={() => generateNearlySorted(size)}
              className="px-2 py-0.5 text-slate-300 hover:text-white rounded transition-colors"
            >
              Nearly Sorted
            </button>
            <button
              onClick={() => generateReversed(size)}
              className="px-2 py-0.5 text-slate-300 hover:text-white rounded transition-colors"
            >
              Reversed
            </button>
            <button
              onClick={() => generateFewUnique(size)}
              className="px-2 py-0.5 text-slate-300 hover:text-white rounded transition-colors"
            >
              Few Unique
            </button>
          </div>

          {/* Side by side button */}
          <button
            onClick={() => setSideBySide(!sideBySide)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              sideBySide
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Compare</span>
          </button>
        </div>
      </div>

      {/* Row 2: Size slider & custom array */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs shrink-0">
        <label className="flex items-center gap-2 text-slate-300">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Size: {size} elements</span>
          <input
            type="range"
            min={5}
            max={24}
            value={size}
            onChange={e => handleSizeChange(parseInt(e.target.value, 10))}
            className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </label>

        <form onSubmit={handleApplyCustom} className="flex items-center gap-2">
          <span className="text-slate-400">Custom:</span>
          <input
            type="text"
            value={customInputText}
            onChange={e => setCustomInputText(e.target.value)}
            className="w-40 sm:w-56 px-2 py-0.5 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono text-[11px]"
          />
          <button
            type="submit"
            className="px-2.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-medium"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Main Bar Visualization Arena: Flex-1 takes all flexible height (Requirement 2b) */}
      <div className="flex-1 min-h-0 flex flex-col justify-start p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 relative overflow-hidden">
        {/* Visual Legend Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] mb-2 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-500" />
              <span className="text-slate-400">Default</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
              <span className="text-slate-400">Comparing</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
              <span className="text-slate-400">Swapping</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-purple-500" />
              <span className="text-slate-400">Pivot</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
              <span className="text-slate-400">Sorted</span>
            </span>
          </div>

          {activeAlgorithm.id === 'quick_sort' && (
            <span className="px-2 py-0.5 rounded bg-purple-950/50 border border-purple-800 text-purple-300 font-mono text-[10px]">
              Lomuto Partition Scheme
            </span>
          )}
          {activeAlgorithm.id === 'heap_sort' && (
            <span className="px-2 py-0.5 rounded bg-indigo-950/50 border border-indigo-800 text-indigo-300 font-mono text-[10px]">
              Phase: {aux.phase === 'build_heap' ? 'Build Max-Heap' : 'Extract Max'} (Heap Size: {aux.heapSize ?? 0})
            </span>
          )}
        </div>

        {/* Array Bars and/or Heap Tree Layout */}
        {isHeapSort ? (
          <div className="flex flex-col min-[1100px]:flex-row min-[1100px]:items-center min-[1100px]:justify-between gap-3 w-full my-1">
            <div className="w-full min-[1100px]:w-[48%] flex flex-col justify-start">
              <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                <span>Array Bars:</span>
                <span className="text-[10px] text-slate-500 font-mono">Heap Size: {aux.heapSize ?? stepState.length}</span>
              </div>
              {renderArrayBars('h-28 min-[1100px]:h-36')}
            </div>
            <div className="w-full min-[1100px]:w-[52%] flex flex-col justify-start">
              {renderHeapTree()}
            </div>
          </div>
        ) : (
          renderArrayBars('h-44')
        )}

        {/* Merge Sort Temp Buffer Display */}
        {activeAlgorithm.id === 'merge_sort' && aux.tempArray && (
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 mb-2">
              Merge Auxiliary Temp Buffer:
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
              {aux.tempArray.map((tempVal, k) => (
                <div
                  key={k}
                  className={`flex-1 max-w-[48px] h-8 rounded border flex items-center justify-center font-mono text-xs ${
                    tempVal !== null
                      ? 'bg-indigo-900/60 border-indigo-600 text-indigo-200 font-bold'
                      : 'bg-slate-900/40 border-slate-800 text-slate-600'
                  }`}
                >
                  {tempVal ?? '·'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison Panel */}
      {sideBySide && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-indigo-900/50 animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-semibold text-xs text-indigo-300">
              <GitCompare className="w-4 h-4 text-indigo-400" />
              <span>Side-by-Side Algorithm Comparison on Current Input</span>
            </div>
            <select
              value={compareAlgoId}
              onChange={e => setCompareAlgoId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
            >
              {allAlgorithms.map(a => (
                <option key={a.id} value={a.id}>
                  Compare with: {a.name.split(' (')[0]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Algorithm 1 */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="font-bold text-slate-200 mb-2">{activeAlgorithm.name.split(' (')[0]}</div>
              <div className="space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Comparisons:</span>
                  <span className="font-mono text-amber-400 font-bold">{activeFinal?.comparisons ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Swaps / Writes:</span>
                  <span className="font-mono text-rose-400 font-bold">{activeFinal?.swaps ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Steps:</span>
                  <span className="font-mono text-indigo-400 font-bold">{activeAlgoSteps.length}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span>Worst Time:</span>
                  <span className="font-mono text-slate-200">{activeAlgorithm.complexity.worst}</span>
                </div>
              </div>
            </div>

            {/* Algorithm 2 */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="font-bold text-slate-200 mb-2">{compareAlgo.name.split(' (')[0]}</div>
              <div className="space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Comparisons:</span>
                  <span className="font-mono text-amber-400 font-bold">{compareFinal?.comparisons ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Swaps / Writes:</span>
                  <span className="font-mono text-rose-400 font-bold">{compareFinal?.swaps ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Steps:</span>
                  <span className="font-mono text-indigo-400 font-bold">{compareAlgoSteps.length}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span>Worst Time:</span>
                  <span className="font-mono text-slate-200">{compareAlgo.complexity.worst}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
