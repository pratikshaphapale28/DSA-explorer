import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../../engine/PlayerContext';
import type { AlgorithmDefinition } from '../../engine/types';
import {
  Activity,
  Clock,
  Database,
  Lightbulb,
  Code2,
  ChevronDown,
  ChevronUp,
  PlaySquare,
} from 'lucide-react';

interface InsightPanelProps {
  algorithm: AlgorithmDefinition<any, any, any>;
  comparisonData?: { size: number; ops: number }[];
}

export const InsightPanel: React.FC<InsightPanelProps> = ({
  algorithm,
  comparisonData,
}) => {
  const { currentStep, currentStepIndex, steps, goToStep } = usePlayer();
  const [telemetryOpen, setTelemetryOpen] = useState(false); // Rule 30: Collapsed by default

  const activeLineRef = useRef<HTMLDivElement | null>(null);

  const activeLineNum = currentStep?.pseudocodeLine && currentStep.pseudocodeLine > 0
    ? currentStep.pseudocodeLine
    : 1;

  // Rule 31: Auto-scroll pseudocode panel so active line is always visible
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [activeLineNum, currentStepIndex]);

  // Rule 32: Clicking a line jumps to the nearest step that executes that line
  const handleLineClick = (lineNum: number) => {
    if (!steps || steps.length === 0) return;

    // Collect all matching step indices
    const matchingIndices: number[] = [];
    for (let i = 0; i < steps.length; i++) {
      if (steps[i].pseudocodeLine === lineNum) {
        matchingIndices.push(i);
      }
    }

    if (matchingIndices.length === 0) return;

    // Pick closest index, cycling forward if currently at this index
    let bestIdx = matchingIndices[0];
    let minDistance = Infinity;

    for (const idx of matchingIndices) {
      if (idx === currentStepIndex && matchingIndices.length > 1) continue;
      const dist = Math.abs(idx - currentStepIndex);
      if (dist < minDistance) {
        minDistance = dist;
        bestIdx = idx;
      }
    }

    goToStep(bestIdx);
  };

  const counters = currentStep?.counters || {
    comparisons: 0,
    swaps: 0,
    iterations: 0,
    arrayAccesses: 0,
  };

  const totalOps = counters.comparisons + counters.swaps + counters.arrayAccesses;

  return (
    <aside
      aria-label="Algorithm Pseudocode and Insights"
      className="w-full h-full flex flex-col gap-2.5 p-3 bg-slate-50 dark:bg-slate-950/60 backdrop-blur-sm overflow-hidden text-slate-900 dark:text-slate-100"
    >
      {/* 1. Algorithm Pseudocode Panel (Fills height with internal scroll) */}
      <div className="flex-1 min-h-0 rounded-xl p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Algorithm Pseudocode</span>
          </div>
          <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/40">
            Line {activeLineNum}
          </span>
        </div>

        {/* Pseudocode line list with high-contrast text and internal scroll */}
        <div className="flex-1 min-h-0 space-y-0.5 font-mono text-xs overflow-x-auto overflow-y-auto bg-slate-100 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800/80 scroll-smooth">
          {algorithm.pseudocode.map((line, idx) => {
            const lineNum = idx + 1;
            const isHighlighted = activeLineNum === lineNum;

            return (
              <div
                key={lineNum}
                ref={isHighlighted ? activeLineRef : null}
                onClick={() => handleLineClick(lineNum)}
                title={`Click to jump to line ${lineNum}`}
                className={`group flex items-start gap-2 px-2 py-1 rounded transition-all cursor-pointer ${
                  isHighlighted
                    ? 'bg-indigo-600/25 dark:bg-indigo-500/30 text-indigo-950 dark:text-indigo-100 font-bold border-l-3 border-indigo-600 dark:border-indigo-400 shadow-2xs'
                    : 'text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                {/* Arrow highlight indicator */}
                <span className="select-none text-[10px] w-3 text-center shrink-0 pt-0.5 text-indigo-600 dark:text-indigo-400 font-bold">
                  {isHighlighted ? '▶' : ''}
                </span>

                <span className="select-none text-[10px] text-slate-500 dark:text-slate-400 w-4 text-right tabular-nums shrink-0 pt-0.5 font-semibold">
                  {lineNum}
                </span>

                <span className="whitespace-pre-wrap break-words min-w-0 flex-1 leading-relaxed">
                  {line}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Collapsible "Telemetry & Complexity" Section (Collapsed by default) */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden shrink-0">
        <button
          onClick={() => setTelemetryOpen(prev => !prev)}
          className="w-full p-3 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            <span>Telemetry & Complexity</span>
            <span className="text-[10px] font-normal text-slate-400">
              ({totalOps} ops · {algorithm.complexity.average})
            </span>
          </div>
          {telemetryOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {telemetryOpen && (
          <div className="p-3 pt-0 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-3 animate-in fade-in duration-150">
            {/* Running Counters Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Comparisons</div>
                <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                  {counters.comparisons}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Swaps / Writes</div>
                <div className="text-base font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
                  {counters.swaps}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Passes / Loops</div>
                <div className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {counters.iterations}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Array Accesses</div>
                <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {counters.arrayAccesses}
                </div>
              </div>
            </div>

            {/* Big-O Grid */}
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Big-O Time Complexity</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div className="p-1.5 rounded bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">Best</div>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {algorithm.complexity.best}
                  </div>
                </div>
                <div className="p-1.5 rounded bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">Average</div>
                  <div className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {algorithm.complexity.average}
                  </div>
                </div>
                <div className="p-1.5 rounded bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">Worst</div>
                  <div className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {algorithm.complexity.worst}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                  <Database className="w-3 h-3" /> Space:
                </span>
                <span className="font-mono font-semibold text-purple-500 dark:text-purple-400 text-[11px]">
                  {algorithm.complexity.space}
                </span>
              </div>
            </div>

            {/* Analogy & Intuition */}
            {algorithm.complexity.realWorldAnalogy && (
              <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-amber-600 dark:text-amber-400">Analogy: </strong>
                {algorithm.complexity.realWorldAnalogy}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
