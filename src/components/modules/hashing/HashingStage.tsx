import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../../engine/PlayerContext';
import {
  executeHashAction,
  generateRehashSteps,
  type HashTableState,
  type HashAuxiliary,
  type HashFunctionType,
  type CollisionStrategy,
  type HashBucketItem,
} from '../../../algorithms/hashing/hashTable';
import type { AlgorithmDefinition } from '../../../engine/types';
import { Hash, Plus, Search, Trash2, RotateCcw, AlertTriangle, Calculator, Sparkles } from 'lucide-react';

interface HashingStageProps {
  onAlgorithmChange: (algo: AlgorithmDefinition<any, any, any>) => void;
}

export const HashingStage: React.FC<HashingStageProps> = ({ onAlgorithmChange }) => {
  const { currentStep, loadSteps } = usePlayer();

  const [tableSize, setTableSize] = useState<number>(7);
  const [strategy, setStrategy] = useState<CollisionStrategy>('linear_probing');
  const [hashFunction, setHashFunction] = useState<HashFunctionType>('division');
  const [keyInput, setKeyInput] = useState<string>('24');

  // Canonical Table State
  const [table, setTable] = useState<HashTableState>(() => ({
    size: 7,
    count: 3,
    loadFactor: 3 / 7,
    strategy: 'linear_probing',
    hashFunction: 'division',
    buckets: [
      { key: 14 },
      { key: 21 },
      null,
      { key: 10 },
      null,
      null,
      null,
    ],
  }));

  const resetTable = (size: number, strat: CollisionStrategy, func: HashFunctionType) => {
    const newTable: HashTableState = {
      size,
      count: 0,
      loadFactor: 0,
      strategy: strat,
      hashFunction: func,
      buckets: strat === 'chaining'
        ? new Array(size).fill(null).map(() => [])
        : new Array(size).fill(null),
    };
    setTable(newTable);
    emitMetadata(strat);
    loadSteps([
      {
        id: 0,
        type: 'start',
        description: `Initialized empty Hash Table of size m=${size} using ${strat.replace('_', ' ')}.`,
        pseudocodeLine: 1,
        state: newTable,
        auxiliary: {},
        highlights: {},
        counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
      },
    ]);
  };

  useEffect(() => {
    resetTable(tableSize, strategy, hashFunction);
  }, [tableSize, strategy, hashFunction]);

  const emitMetadata = (strat: CollisionStrategy) => {
    const meta: AlgorithmDefinition<any, any, any> = {
      id: 'hashing',
      name: `Hash Table (${strat.replace('_', ' ').toUpperCase()})`,
      category: 'hashing',
      categoryLabel: 'Hashing',
      summary: 'Data structure that implements an associative array abstract data type, mapping keys to values using a hash function to compute a bucket index.',
      complexity: {
        best: 'O(1)',
        average: 'O(1)',
        worst: 'O(n)',
        space: 'O(m)',
        explanation: 'Average O(1) constant time lookups assuming uniform hashing distribution. Degrades to O(n) in worst case if all keys collide into the same bucket.',
        realWorldAnalogy: 'A library card catalog or coat-check room: each ticket number directly leads to a numbered hanger where your coat is hung.',
      },
      pseudocode: [
        'index = hash(key) mod tableSize',
        'while slot is occupied and slot.key != key:',
        '  calculate next probe offset: i = (i + 1) mod tableSize',
        'insert or retrieve item at final slot',
        'if loadFactor (n/m) >= 0.75: trigger rehash & resize',
      ],
      defaultInput: null,
      generateSteps: () => [],
    };
    onAlgorithmChange(meta);
  };

  const handleInsert = () => {
    const key = isNaN(Number(keyInput)) ? keyInput.trim() : Number(keyInput);
    if (!key && key !== 0) return;
    const { table: updated, steps } = executeHashAction(table, 'insert', key);
    setTable(updated);
    loadSteps(steps, true);
    setKeyInput(String(Math.floor(Math.random() * 80) + 5));
  };

  const handleSearch = () => {
    const key = isNaN(Number(keyInput)) ? keyInput.trim() : Number(keyInput);
    if (!key && key !== 0) return;
    const { steps } = executeHashAction(table, 'search', key);
    loadSteps(steps, true);
  };

  const handleDelete = () => {
    const key = isNaN(Number(keyInput)) ? keyInput.trim() : Number(keyInput);
    if (!key && key !== 0) return;
    const { table: updated, steps } = executeHashAction(table, 'delete', key);
    setTable(updated);
    loadSteps(steps, true);
  };

  // Rule 26: Rehash table when load factor >= 0.75 or requested
  const handleRehash = () => {
    const { table: updated, steps } = generateRehashSteps(currentTableState);
    setTable(updated);
    setTableSize(updated.size);
    loadSteps(steps, true);
  };

  // Quick collision test loader (7, 14, 21, 28 all hash to 0 mod 7)
  const handleLoadCollisionSample = () => {
    const keys = [7, 14, 21, 28];
    let curr = {
      size: 7,
      count: 0,
      loadFactor: 0,
      strategy,
      hashFunction: 'division' as HashFunctionType,
      buckets: strategy === 'chaining'
        ? new Array(7).fill(null).map(() => [])
        : new Array(7).fill(null),
    };
    const allSteps: any[] = [];
    for (const k of keys) {
      const res = executeHashAction(curr, 'insert', k);
      curr = res.table;
      allSteps.push(...res.steps);
    }
    setTableSize(7);
    setHashFunction('division');
    setTable(curr);
    loadSteps(allSteps, true);
  };

  // Type guard to ensure currentStep.state is actually a HashTableState and not a stale state from another module
  const isHashTableState = (s: any): s is HashTableState =>
    Boolean(s && typeof s === 'object' && Array.isArray(s.buckets) && typeof s.size === 'number');

  // Current visual snapshot state with defensive fallbacks
  const currentTableState = isHashTableState(currentStep?.state) ? currentStep.state : table;
  const aux = (currentStep?.auxiliary as HashAuxiliary) || {};
  const highlightedIdxs = currentStep?.highlights?.indices || [];

  const safeCount = currentTableState?.count ?? 0;
  const safeSize = currentTableState?.size ?? tableSize;
  const safeLoadFactor = typeof currentTableState?.loadFactor === 'number'
    ? currentTableState.loadFactor
    : safeSize > 0 ? safeCount / safeSize : 0;

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 mb-4 shadow-sm">
        {/* Strategy Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setStrategy('linear_probing')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              strategy === 'linear_probing'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Linear Probing
          </button>
          <button
            onClick={() => setStrategy('quadratic_probing')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              strategy === 'quadratic_probing'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quadratic Probing
          </button>
          <button
            onClick={() => setStrategy('chaining')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              strategy === 'chaining'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chaining (Separate)
          </button>
        </div>

        {/* Hash function & Table size controls */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <label className="flex items-center gap-1 text-slate-300">
            <span>Hash Function:</span>
            <select
              value={hashFunction}
              onChange={e => setHashFunction(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
            >
              <option value="division">Division (key mod m)</option>
              <option value="multiplication">Multiplication (Knuth A)</option>
              <option value="string_poly">Polynomial String Hash</option>
            </select>
          </label>

          <label className="flex items-center gap-1 text-slate-300">
            <span>Size (m):</span>
            <select
              value={tableSize}
              onChange={e => setTableSize(parseInt(e.target.value, 10))}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
            >
              <option value={5}>m = 5</option>
              <option value={7}>m = 7 (Prime)</option>
              <option value={11}>m = 11 (Prime)</option>
              <option value={13}>m = 13 (Prime)</option>
            </select>
          </label>
        </div>
      </div>

      {/* Action Input Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl mb-4 text-xs">
        <span className="text-slate-400 font-medium">Key:</span>
        <input
          type="text"
          value={keyInput}
          onChange={e => setKeyInput(e.target.value)}
          className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="e.g. 42"
        />

        <button
          onClick={handleInsert}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Insert(key)</span>
        </button>

        <button
          onClick={handleSearch}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search(key)</span>
        </button>

        <button
          onClick={handleDelete}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-semibold transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete(key)</span>
        </button>

        <button
          onClick={handleLoadCollisionSample}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/60 font-medium transition-colors"
          title="Insert keys 7, 14, 21, 28 to demonstrate collisions"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Demo Collisions [7, 14, 21, 28]</span>
        </button>

        <button
          onClick={() => resetTable(tableSize, strategy, hashFunction)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 ml-auto"
          title="Clear Table"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Hash Math & Rehash Alert Banner */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-slate-300 font-mono">
            {aux.formulaString || `Formula: h(k) = k mod ${tableSize}`}
          </span>
        </div>

        {/* Load Factor Meter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Load Factor (α):</span>
            <span className={`font-mono font-bold ${safeLoadFactor >= 0.75 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {safeLoadFactor.toFixed(2)} ({safeCount}/{safeSize})
            </span>
          </div>

          {/* Rule 26: Rehash (double size to next prime) button when alpha >= 0.75 */}
          {safeLoadFactor >= 0.75 && (
            <button
              onClick={handleRehash}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm animate-pulse"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rehash (double size to next prime)</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Slots Visualization Arena */}
      <div className="min-h-[200px] flex flex-col justify-center p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 relative overflow-x-auto">
        {/* Probe sequence ribbon if searching/inserting */}
        {aux.probeSequence && aux.probeSequence.length > 0 && (
          <div className="mb-3 flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Probe Sequence:</span>
            <div className="flex items-center gap-1">
              {aux.probeSequence.map((idx, step) => (
                <span
                  key={step}
                  className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                >
                  [{idx}]
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bucket slots container */}
        <div className="flex items-start justify-center gap-3 min-w-[500px]">
          {(currentTableState?.buckets || []).map((slot, idx) => {
            const isHighlighted = highlightedIdxs.includes(idx);

            if (strategy === 'chaining') {
              const chain = (slot as HashBucketItem[]) || [];
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 max-w-[80px]">
                  <div className="text-[11px] font-mono text-slate-500 font-bold">[{idx}]</div>
                  <div
                    className={`w-full min-h-[50px] p-2 rounded-xl flex flex-col items-center gap-1 border transition-all ${
                      isHighlighted
                        ? 'bg-amber-950/50 border-amber-400 ring-2 ring-amber-400/50'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {chain.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="w-full py-1 rounded bg-indigo-600 text-white font-mono font-bold text-center text-xs shadow-xs"
                      >
                        {item.key}
                      </div>
                    ))}
                    {chain.length === 0 && (
                      <span className="text-slate-600 text-[10px] italic py-2">null</span>
                    )}
                  </div>
                </div>
              );
            }

            // Open Addressing Slot
            const item = slot as HashBucketItem | null;
            const isTombstone = item?.isTombstone;

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 max-w-[70px]">
                <div className="text-[11px] font-mono text-slate-500 font-bold">[{idx}]</div>
                <div
                  className={`w-full h-16 rounded-xl flex flex-col items-center justify-center p-2 border transition-all ${
                    isHighlighted
                      ? 'bg-gradient-to-t from-amber-600 to-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400 font-bold'
                      : isTombstone
                      ? 'bg-rose-950/40 border-rose-800 text-rose-300 border-dashed'
                      : item
                      ? 'bg-slate-800 border-indigo-500/50 text-white font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-600'
                  }`}
                >
                  {/* Rule 28: Show DELETED marker */}
                  <span className={`font-mono ${isTombstone ? 'text-rose-400 text-xs font-black' : 'text-sm font-bold'}`}>
                    {isTombstone ? 'DELETED' : item ? item.key : '∅'}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {isTombstone ? 'tombstone' : item ? 'occupied' : 'empty'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
