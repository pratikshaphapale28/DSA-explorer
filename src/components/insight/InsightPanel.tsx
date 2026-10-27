import React from 'react';
import { usePlayer } from '../../engine/PlayerContext';
import type { AlgorithmDefinition } from '../../engine/types';
import { Activity, Clock, Database, Lightbulb, Code2 } from 'lucide-react';

interface InsightPanelProps {
  algorithm: AlgorithmDefinition<any, any, any>;
  comparisonData?: { size: number; ops: number }[];
}

export const InsightPanel: React.FC<InsightPanelProps> = ({
  algorithm,
  comparisonData,
}) => {
  const { currentStep, currentStepIndex, totalSteps, mode } = usePlayer();

  const counters = currentStep?.counters || {
    comparisons: 0,
    swaps: 0,
    iterations: 0,
    arrayAccesses: 0,
  };

  const totalOps = counters.comparisons + counters.swaps + counters.arrayAccesses;

  return (
    <aside
      aria-label="Algorithm Insights and Statistics"
      className="w-full lg:w-96 flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-950/60 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 overflow-y-auto text-slate-900 dark:text-slate-100 shrink-0"
    >
      {/* 1. Live Narration Card */}
      <div className="rounded-xl p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 shadow-xs">
        <div className="flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300 font-semibold mb-2">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span>Step Narration</span>
          </div>
          <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400/80 font-bold">
            {currentStep?.type.toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
          {currentStep?.description || 'Press Play or Step to begin visual execution.'}
        </p>
        {mode === 'beginner' && (
          <div className="mt-2.5 pt-2 border-t border-indigo-200 dark:border-indigo-900/30 text-xs text-indigo-800 dark:text-indigo-300/80">
            <span className="font-semibold text-indigo-900 dark:text-indigo-300">Why this matters: </span>
            {algorithm.summary}
          </div>
        )}
      </div>

      {/* 2. Running Counters */}
      <div className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
          <Activity className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          <span>Execution Telemetry</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Comparisons</div>
            <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
              {counters.comparisons}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Swaps / Writes</div>
            <div className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
              {counters.swaps}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Passes / Loops</div>
            <div className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
              {counters.iterations}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Array Accesses</div>
            <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {counters.arrayAccesses}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Actual Operations (Total):</span>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-200 tabular-nums">
            {totalOps} ops
          </span>
        </div>
      </div>

      {/* 3. Pseudocode Panel with Line Highlighting */}
      <div className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
          <div className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Algorithm Pseudocode</span>
          </div>
          <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
            Line {currentStep?.pseudocodeLine && currentStep.pseudocodeLine > 0 ? currentStep.pseudocodeLine : 1}
          </span>
        </div>
        <div className="space-y-1 font-mono text-xs overflow-x-auto max-h-80 overflow-y-auto min-h-[120px] bg-slate-100 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
          {algorithm.pseudocode.map((line, idx) => {
            const lineNum = idx + 1;
            const isHighlighted = currentStep?.pseudocodeLine === lineNum;
            return (
              <div
                key={lineNum}
                className={`flex items-start gap-2.5 px-2 py-0.5 rounded transition-colors ${
                  isHighlighted
                    ? 'bg-indigo-600/20 dark:bg-indigo-600/30 text-indigo-900 dark:text-indigo-200 font-bold border-l-2 border-indigo-500 dark:border-indigo-400 pl-1.5'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <span className="select-none text-[10px] text-slate-400 dark:text-slate-600 w-4 text-right tabular-nums shrink-0 pt-0.5">
                  {lineNum}
                </span>
                <span className="whitespace-pre-wrap break-words min-w-0 flex-1 leading-relaxed">{line}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Complexity & Real-World Analogy */}
      <div className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
          <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span>Complexity & Big-O</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-center mb-3">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Best</div>
            <div className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
              {algorithm.complexity.best}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Average</div>
            <div className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
              {algorithm.complexity.average}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Worst</div>
            <div className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
              {algorithm.complexity.worst}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 py-1 border-t border-slate-200 dark:border-slate-800">
          <span className="flex items-center gap-1 text-slate-400">
            <Database className="w-3.5 h-3.5" /> Auxiliary Space:
          </span>
          <span className="font-mono font-semibold text-purple-400">
            {algorithm.complexity.space}
          </span>
        </div>

        <div className="mt-3 text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-2.5">
          <span className="text-slate-300 font-medium">Intuition: </span>
          {algorithm.complexity.explanation}
        </div>

        {algorithm.complexity.realWorldAnalogy && (
          <div className="mt-2.5 p-2.5 rounded-lg bg-slate-800/40 text-xs text-slate-300 leading-relaxed">
            <span className="text-amber-400 font-semibold">Real-world analogy: </span>
            {algorithm.complexity.realWorldAnalogy}
          </div>
        )}

        {/* Small operations chart for sorting if provided */}
        {comparisonData && comparisonData.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <div className="text-[11px] font-semibold text-slate-300 mb-1.5">
              Operations vs Input Size (N)
            </div>
            <div className="h-16 flex items-end gap-1.5 pt-2 px-1 bg-slate-950 rounded-lg">
              {comparisonData.map((d, i) => {
                const maxOps = Math.max(...comparisonData.map(c => c.ops), 1);
                const heightPercent = Math.max(8, (d.ops / maxOps) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-indigo-500 rounded-t-xs group-hover:bg-indigo-400 transition-all"
                      title={`N=${d.size}: ${d.ops} ops`}
                    />
                    <span className="text-[9px] font-mono text-slate-500">{d.size}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
