import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../../engine/PlayerContext';
import {
  generateStackSteps,
  generateQueueSteps,
  generateCircularQueueSteps,
  parenthesesCheckerAlgorithm,
  type StackQueueState,
  type CircularQueueState,
  type ParenthesesAuxiliary,
} from '../../../algorithms/stackQueue/stackQueueEngine';
import type { AlgorithmDefinition } from '../../../engine/types';
import { Layers, ArrowRightLeft, CircleDot, CheckCircle2, XCircle, AlertTriangle, Play, RotateCcw } from 'lucide-react';
import { ErrorBoundary } from '../../common/ErrorBoundary';

interface StackQueueStageProps {
  onAlgorithmChange: (algo: AlgorithmDefinition<any, any, any>) => void;
}

export const StackQueueStage: React.FC<StackQueueStageProps> = ({ onAlgorithmChange }) => {
  const { currentStep, loadSteps } = usePlayer();

  const [tab, setTab] = useState<'stack' | 'queue' | 'circular' | 'parentheses'>('stack');
  const [capacity, setCapacity] = useState<number>(6);

  // Stack & Linear Queue items
  const [stackItems, setStackItems] = useState<(number | string)[]>([10, 20, 30]);
  const [queueItems, setQueueItems] = useState<(number | string)[]>([15, 25, 35]);
  const [inputValue, setInputValue] = useState<string>('45');

  // Circular Queue
  const [circularState, setCircularState] = useState<CircularQueueState>({
    buffer: [null, 'A', 'B', 'C', null, null],
    capacity: 6,
    front: 1,
    rear: 3,
    count: 3,
  });

  // Bracket Validator Demo
  const [exprInput, setExprInput] = useState<string>('{ [ ( ) ] }');

  // Switch subtab and immediately reset step state, narration and algorithm metadata
  const handleTabChange = (newTab: 'stack' | 'queue' | 'circular' | 'parentheses') => {
    setTab(newTab);
  };

  useEffect(() => {
    if (tab === 'parentheses') {
      onAlgorithmChange(parenthesesCheckerAlgorithm);
      const steps = parenthesesCheckerAlgorithm.generateSteps(exprInput);
      loadSteps(steps, false);
    } else {
      const dummyAlgo: AlgorithmDefinition<any, any, any> = {
        id: tab,
        name:
          tab === 'stack'
            ? 'Stack Data Structure (LIFO)'
            : tab === 'queue'
            ? 'Queue Data Structure (FIFO)'
            : 'Circular Queue (Ring Buffer)',
        category: 'stackQueue',
        categoryLabel: 'Stack & Queue',
        summary:
          tab === 'stack'
            ? 'Last-In First-Out (LIFO) collection where elements are added and removed from the same end (the Top).'
            : tab === 'queue'
            ? 'First-In First-Out (FIFO) collection where elements are inserted at the Rear and removed from the Front.'
            : 'Fixed-size ring buffer where the rear and front pointers wrap around to 0 using modulo arithmetic: rear = (rear + 1) % capacity.',
        complexity: {
          best: 'O(1)',
          average: 'O(1)',
          worst: 'O(1)',
          space: `O(${capacity})`,
          explanation: 'All primary operations (push, pop, peek, enqueue, dequeue) execute in strict constant O(1) time.',
          realWorldAnalogy:
            tab === 'stack'
              ? 'A spring-loaded stack of cafeteria trays or browser history Back button.'
              : tab === 'queue'
              ? 'A checkout queue at a grocery store or print spooler.'
              : 'Circular audio buffer or ring-buffer packet router.',
        },
        pseudocode:
          tab === 'stack'
            ? [
                'procedure push(x): if size == capacity: overflow; top++; S[top] = x',
                'procedure pop(): if size == 0: underflow; x = S[top]; top--; return x',
                'procedure peek(): return S[top]',
              ]
            : tab === 'queue'
            ? [
                'procedure enqueue(x): if size == capacity: overflow; rear++; Q[rear] = x',
                'procedure dequeue(): if size == 0: underflow; x = Q[front]; front++; return x',
                'procedure front(): return Q[front]',
              ]
            : [
                'procedure enqueue(x): if isFull(): overflow; rear = (rear + 1) % cap; Q[rear] = x',
                'procedure dequeue(): if isEmpty(): underflow; x = Q[front]; front = (front + 1) % cap',
              ],
        defaultInput: null,
        generateSteps: () => [],
      };
      onAlgorithmChange(dummyAlgo);

      if (tab === 'stack') {
        const topVal = stackItems.length > 0 ? stackItems[stackItems.length - 1] : null;
        loadSteps(
          [
            {
              id: 0,
              type: 'start',
              description:
                stackItems.length > 0
                  ? `Stack initialized with ${stackItems.length} elements (Capacity: ${capacity}). Current Top is ${topVal} at index ${stackItems.length - 1}.`
                  : `Stack initialized (Capacity: ${capacity}). Stack is empty.`,
              pseudocodeLine: 1,
              state: {
                items: [...stackItems],
                capacity,
                isFull: stackItems.length >= capacity,
                isEmpty: stackItems.length === 0,
              },
              auxiliary: { action: 'init' },
              highlights: {},
              counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
            },
          ],
          false
        );
      } else if (tab === 'queue') {
        loadSteps(
          [
            {
              id: 0,
              type: 'start',
              description: `Queue initialized with ${queueItems.length} elements (Capacity: ${capacity}, Front at index 0, Rear at index ${Math.max(0, queueItems.length - 1)}).`,
              pseudocodeLine: 1,
              state: {
                items: [...queueItems],
                capacity,
                isFull: queueItems.length >= capacity,
                isEmpty: queueItems.length === 0,
              },
              auxiliary: { action: 'init' },
              highlights: {},
              counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
            },
          ],
          false
        );
      } else if (tab === 'circular') {
        loadSteps(
          [
            {
              id: 0,
              type: 'start',
              description: `Circular Queue (Ring Buffer) initialized with capacity ${circularState.capacity} (Front: ${circularState.front}, Rear: ${circularState.rear}, Count: ${circularState.count}).`,
              pseudocodeLine: 1,
              state: { ...circularState },
              auxiliary: { action: 'init' },
              highlights: {},
              counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
            },
          ],
          false
        );
      }
    }
  }, [tab, capacity]);

  // Handlers for Stack
  const handleStackPush = () => {
    const val = inputValue.trim() || String(Math.floor(Math.random() * 80) + 10);
    const steps = generateStackSteps(stackItems, capacity, { type: 'push', value: val });
    loadSteps(steps, false);
    if (!steps[0].state.isFull) {
      setStackItems(steps[0].state.items);
    }
  };

  const handleStackPop = () => {
    const steps = generateStackSteps(stackItems, capacity, { type: 'pop' });
    loadSteps(steps, false);
    if (!steps[0].state.isEmpty) {
      setStackItems(steps[0].state.items);
    }
  };

  const handleStackPeek = () => {
    const steps = generateStackSteps(stackItems, capacity, { type: 'peek' });
    loadSteps(steps, false);
  };

  // Handlers for Queue
  const handleQueueEnqueue = () => {
    const val = inputValue.trim() || String(Math.floor(Math.random() * 80) + 10);
    const steps = generateQueueSteps(queueItems, capacity, { type: 'enqueue', value: val });
    loadSteps(steps, false);
    if (!steps[0].state.isFull) {
      setQueueItems(steps[0].state.items);
    }
  };

  const handleQueueDequeue = () => {
    const steps = generateQueueSteps(queueItems, capacity, { type: 'dequeue' });
    loadSteps(steps, false);
    if (!steps[0].state.isEmpty) {
      setQueueItems(steps[0].state.items);
    }
  };

  const handleQueueFront = () => {
    const steps = generateQueueSteps(queueItems, capacity, { type: 'front' });
    loadSteps(steps, false);
  };

  // Handlers for Circular Queue
  const handleCircularEnqueue = () => {
    const val = inputValue.trim() || String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const steps = generateCircularQueueSteps(circularState, { type: 'enqueue', value: val });
    loadSteps(steps, false);
    if (steps[0].state.count <= circularState.capacity) {
      setCircularState(steps[0].state);
    }
  };

  const handleCircularDequeue = () => {
    const steps = generateCircularQueueSteps(circularState, { type: 'dequeue' });
    loadSteps(steps, false);
    setCircularState(steps[0].state);
  };

  // Handlers for Parentheses Demo
  const handleRunParentheses = (customString?: string) => {
    const targetExpr = customString !== undefined ? customString : exprInput;
    if (customString !== undefined) {
      setExprInput(customString);
    }
    const steps = parenthesesCheckerAlgorithm.generateSteps(targetExpr);
    loadSteps(steps, true);
  };

  // Step state interpretation with defensive checks
  const currentStateMsg = (currentStep?.state as any)?.message;

  // Render slots for Stack: render capacity slots from capacity - 1 down to 0
  const renderedStackItems =
    currentStep?.state && typeof currentStep.state === 'object' && Array.isArray((currentStep.state as any).items)
      ? (currentStep.state as any).items
      : stackItems;

  const stackCapacity = capacity;

  return (
    <ErrorBoundary fallbackTitle="Stack & Queue Visualizer Error">
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
        {/* Module Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 mb-4 shadow-sm shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => handleTabChange('stack')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                tab === 'stack'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Stack (LIFO)</span>
            </button>
            <button
              onClick={() => handleTabChange('queue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                tab === 'queue'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Queue (FIFO)</span>
            </button>
            <button
              onClick={() => handleTabChange('circular')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                tab === 'circular'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>Circular Queue (Ring)</span>
            </button>
            <button
              onClick={() => handleTabChange('parentheses')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                tab === 'parentheses'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Bracket Validator Demo</span>
            </button>
          </div>

          {/* Capacity Slider (for Stack, Queue, Circular) */}
          {tab !== 'parentheses' && (
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <span>Capacity:</span>
              <input
                type="range"
                min={4}
                max={8}
                value={capacity}
                onChange={e => setCapacity(parseInt(e.target.value, 10))}
                className="w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="font-mono font-bold text-indigo-400">{capacity}</span>
            </label>
          )}
        </div>

        {/* Overflow / Underflow Toast Banner */}
        {currentStateMsg && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold animate-in fade-in shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{currentStateMsg}: Operation blocked by boundary conditions!</span>
          </div>
        )}

        {/* Action Controls for Stack & Queue */}
        {tab !== 'parentheses' && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl mb-4 text-xs shrink-0">
            <span className="text-slate-400 font-medium">Value:</span>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Val"
            />

            {tab === 'stack' && (
              <>
                <button
                  onClick={handleStackPush}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
                >
                  Push(val)
                </button>
                <button
                  onClick={handleStackPop}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-semibold transition-colors"
                >
                  Pop()
                </button>
                <button
                  onClick={handleStackPeek}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
                >
                  Peek()
                </button>
              </>
            )}

            {tab === 'queue' && (
              <>
                <button
                  onClick={handleQueueEnqueue}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
                >
                  Enqueue(val)
                </button>
                <button
                  onClick={handleQueueDequeue}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-semibold transition-colors"
                >
                  Dequeue()
                </button>
                <button
                  onClick={handleQueueFront}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
                >
                  Front()
                </button>
              </>
            )}

            {tab === 'circular' && (
              <>
                <button
                  onClick={handleCircularEnqueue}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
                >
                  Enqueue(val)
                </button>
                <button
                  onClick={handleCircularDequeue}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-semibold transition-colors"
                >
                  Dequeue()
                </button>
              </>
            )}
          </div>
        )}

        {/* 1. Arena Display: STACK (Anchored to top, all 6 capacity slots clearly drawn, empty slots faded, TOP marked) */}
        {tab === 'stack' && (
          <div className="flex-1 min-h-[360px] flex flex-col items-center justify-start pt-3 pb-6 px-6 rounded-2xl bg-slate-950/70 border border-slate-800 relative">
            <div className="w-full max-w-sm flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">Stack Container (Top-Anchored)</span>
              <span>
                Occupied: <strong className="text-indigo-400">{renderedStackItems.length}</strong> / {stackCapacity} slots
              </span>
            </div>

            {/* Render all slots vertically from slot capacity - 1 down to slot 0 */}
            <div className="w-full max-w-sm flex flex-col gap-1.5 p-3 bg-slate-900/90 border-x-4 border-b-4 border-indigo-500/70 rounded-b-2xl shadow-inner">
              {Array.from({ length: stackCapacity }, (_, idx) => {
                const slotIndex = stackCapacity - 1 - idx;
                const isOccupied = slotIndex < renderedStackItems.length;
                const val = isOccupied ? renderedStackItems[slotIndex] : null;
                const isTop = slotIndex === renderedStackItems.length - 1;

                return (
                  <div
                    key={slotIndex}
                    className={`h-11 rounded-lg flex items-center justify-between px-3 font-mono transition-all duration-200 ${
                      isOccupied
                        ? isTop
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md ring-2 ring-indigo-400 font-bold'
                          : 'bg-slate-800 text-slate-100 border border-slate-700 font-semibold'
                        : 'border border-dashed border-slate-800 bg-slate-950/30 text-slate-600 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">[{slotIndex}]</span>
                      <span className="text-xs">
                        {isOccupied ? val : <span className="italic text-[11px] text-slate-600">Empty Slot</span>}
                      </span>
                    </div>

                    {isTop && (
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-xs animate-in zoom-in-50">
                        TOP POINTER
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="w-full max-w-sm mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>↑ Top of Stack (LIFO: Push & Pop here)</span>
              <span>Base [0]</span>
            </div>
          </div>
        )}

        {/* 2. Arena Display: QUEUE (Top-aligned, clear Front and Rear markers) */}
        {tab === 'queue' && (
          <div className="flex-1 min-h-[340px] flex flex-col items-center justify-start pt-4 pb-6 px-6 rounded-2xl bg-slate-950/70 border border-slate-800 relative">
            <div className="w-full max-w-xl flex items-center justify-between text-xs font-mono text-slate-400 mb-4">
              <span className="font-semibold text-slate-300">Linear Queue (FIFO: First-In First-Out)</span>
              <span>
                Length: <strong className="text-emerald-400">{queueItems.length}</strong> / {capacity}
              </span>
            </div>

            <div className="w-full max-w-2xl flex items-center gap-2.5 overflow-x-auto p-4 bg-slate-900/80 border-y-2 border-indigo-500/50 rounded-xl justify-center min-h-[110px]">
              {Array.from({ length: capacity }, (_, idx) => {
                const isOccupied = idx < queueItems.length;
                const val = isOccupied ? queueItems[idx] : null;
                const isFront = idx === 0 && isOccupied;
                const isRear = idx === queueItems.length - 1 && isOccupied;

                return (
                  <div key={idx} className="flex flex-col items-center shrink-0">
                    <div className="h-5 flex items-center justify-center text-[10px] font-mono font-black mb-1">
                      {isFront && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          FRONT
                        </span>
                      )}
                      {isRear && !isFront && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          REAR
                        </span>
                      )}
                    </div>

                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-md transition-all ${
                        isFront
                          ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white ring-2 ring-emerald-400'
                          : isRear
                          ? 'bg-gradient-to-br from-amber-600 to-amber-500 text-white ring-2 ring-amber-400'
                          : isOccupied
                          ? 'bg-slate-800 text-slate-100 border border-slate-700'
                          : 'border border-dashed border-slate-800 bg-slate-950/40 text-slate-600'
                      }`}
                    >
                      {val ?? '·'}
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 mt-1">[{idx}]</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between w-full max-w-2xl text-xs text-slate-400 font-mono px-2">
              <span>← Dequeue leaves from FRONT</span>
              <span>Enqueue enters at REAR ←</span>
            </div>
          </div>
        )}

        {/* 3. Arena Display: CIRCULAR QUEUE (Top-aligned, wrap-around modulo verification) */}
        {tab === 'circular' && (
          <div className="flex-1 min-h-[340px] flex flex-col items-center justify-start pt-4 pb-6 px-6 rounded-2xl bg-slate-950/70 border border-slate-800 relative">
            <div className="w-full max-w-md flex items-center justify-between text-xs font-mono text-slate-400 mb-3">
              <span className="font-semibold text-slate-300">Circular Queue (Ring Buffer)</span>
              <span className="text-indigo-400 font-bold">rear = (rear + 1) % capacity</span>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md w-full p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
              {circularState.buffer.map((val, idx) => {
                const isFront = circularState.front === idx;
                const isRear = circularState.rear === idx;

                return (
                  <div
                    key={idx}
                    className={`h-22 rounded-xl p-2.5 flex flex-col items-center justify-between border transition-all ${
                      val !== null
                        ? 'bg-slate-800/90 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20'
                        : 'bg-slate-950/40 border-slate-800 text-slate-600'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="font-bold">Slot {idx}</span>
                      <div className="flex gap-1">
                        {isFront && (
                          <span className="px-1 py-0.2 rounded bg-emerald-500 text-slate-950 font-black text-[9px]">
                            FRONT
                          </span>
                        )}
                        {isRear && (
                          <span className="px-1 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[9px]">
                            REAR
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="font-mono text-base font-bold text-white">
                      {val ?? '∅'}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {val !== null ? 'Occupied' : 'Empty'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-xs font-mono text-slate-300 flex items-center justify-around w-full max-w-md bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span>Front Index: <strong className="text-emerald-400">{circularState.front}</strong></span>
              <span>Rear Index: <strong className="text-amber-400">{circularState.rear}</strong></span>
              <span>Count: <strong className="text-indigo-400">{circularState.count}</strong> / {circularState.capacity}</span>
            </div>
          </div>
        )}

        {/* 4. Arena Display: BRACKET VALIDATOR DEMO (Fixed crash, custom text input, step through, valid/invalid conclusion) */}
        {tab === 'parentheses' && (
          <div className="flex-1 min-h-[340px] flex flex-col items-center justify-start pt-3 pb-6 px-4 md:px-6 rounded-2xl bg-slate-950/70 border border-slate-800 relative">
            {/* Custom Input & Validation Bar */}
            <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl mb-4">
              <span className="text-xs font-medium text-slate-300 whitespace-nowrap">Bracket String:</span>
              <input
                type="text"
                value={exprInput}
                onChange={e => setExprInput(e.target.value)}
                placeholder="e.g. { [ ( ) ] } or ( [ { } ] )"
                className="flex-1 w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={() => handleRunParentheses()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition-colors shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Validate</span>
              </button>
            </div>

            {/* Quick Sample Expressions */}
            <div className="w-full max-w-2xl flex flex-wrap items-center gap-2 mb-4 text-xs">
              <span className="text-slate-400 font-medium">Quick Presets:</span>
              {[
                '{ [ ( ) ] }',
                '( [ { } ] )',
                '{ [ ( ] ) }',
                '( ( ( )',
                '[ { ( ) } ]',
                '}{',
              ].map(sample => (
                <button
                  key={sample}
                  onClick={() => handleRunParentheses(sample)}
                  className="px-2.5 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>

            {/* Current Expression Stream Visualizer */}
            <div className="w-full max-w-2xl flex flex-col items-center p-4 bg-slate-900/60 rounded-xl border border-slate-800 mb-4">
              <div className="text-[11px] font-mono text-slate-400 mb-2">Scanning Expression Characters:</div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {exprInput.replace(/\s+/g, '').split('').map((char, i) => {
                  const aux =
                    currentStep?.auxiliary && typeof currentStep.auxiliary === 'object'
                      ? (currentStep.auxiliary as ParenthesesAuxiliary)
                      : null;
                  const isCurrent = aux?.currentIndex === i;

                  return (
                    <div
                      key={i}
                      className={`w-10 h-12 rounded-lg flex items-center justify-center font-mono text-base font-bold transition-all ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-md scale-110 font-black'
                          : 'bg-slate-800 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {char}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Real-time Stack Inspection & Status Conclusion */}
            <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
              <div className="flex flex-col items-start gap-1">
                <span className="text-xs font-semibold text-slate-400">Live Validator Stack (LIFO):</span>
                <div className="flex items-center gap-1.5 min-h-[36px]">
                  {Array.isArray(currentStep?.state) && currentStep.state.length > 0 ? (
                    (currentStep.state as string[]).map((b, idx) => (
                      <span
                        key={idx}
                        className="w-8 h-8 rounded bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-sm shadow-xs animate-in zoom-in-75"
                      >
                        {b}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">Empty Stack</span>
                  )}
                </div>
              </div>

              {/* Status Outcome Badge */}
              <div className="flex items-center gap-2">
                {currentStep?.auxiliary && (currentStep.auxiliary as any).isBalanced === true && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>VALID (Properly Balanced)</span>
                  </div>
                )}
                {currentStep?.auxiliary && (currentStep.auxiliary as any).isBalanced === false && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold shadow-sm">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>INVALID (Mismatched or Unclosed)</span>
                  </div>
                )}
                {(!currentStep?.auxiliary || (currentStep.auxiliary as any).isBalanced === null) && (
                  <span className="text-xs text-slate-400 font-mono">Status: In Progress</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};
