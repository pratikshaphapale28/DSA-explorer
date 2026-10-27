/**
 * Core Data Models & Types for DSA Explorer
 */

export type StepType =
  | 'start'
  | 'compare'
  | 'swap'
  | 'visit'
  | 'enqueue'
  | 'dequeue'
  | 'push'
  | 'pop'
  | 'peek'
  | 'relax'
  | 'rotate'
  | 'insert'
  | 'delete'
  | 'probe'
  | 'hash_calc'
  | 'found'
  | 'not_found'
  | 'sorted'
  | 'partition'
  | 'highlight'
  | 'split'
  | 'merge'
  | 'heapify'
  | 'rehash'
  | 'complete';

export interface StepCounters {
  comparisons: number;
  swaps: number;
  iterations: number;
  arrayAccesses: number;
}

export interface StepHighlights {
  indices?: number[];
  secondaryIndices?: number[];
  nodeIds?: string[];
  edgeIds?: string[];
  activeRange?: [number, number];
  pointers?: Record<string, number | string>;
  label?: string;
}

export interface Step<TState = unknown, TAux = unknown> {
  id: number;
  type: StepType;
  description: string;           // Clear plain-English beginner narration
  pseudocodeLine: number;        // 1-based index in pseudocode array (0 = none)
  state: TState;                 // Snapshot of data structure state
  auxiliary?: TAux;              // Aux state (queue, stack, distance table, call stack, etc.)
  highlights: StepHighlights;
  counters: StepCounters;
}

export interface ComplexityInfo {
  best: string;
  average: string;
  worst: string;
  space: string;
  explanation: string;
  realWorldAnalogy: string;
}

export interface AlgorithmDefinition<TInput = unknown, TState = unknown, TAux = unknown> {
  id: string;
  name: string;
  category: 'sorting' | 'searching' | 'graphs' | 'trees' | 'stackQueue' | 'hashing';
  categoryLabel: string;
  summary: string;
  complexity: ComplexityInfo;
  pseudocode: string[];
  defaultInput: TInput;
  generateSteps: (input: TInput) => Step<TState, TAux>[];
}

export type ModuleCategory = 'graphs' | 'trees' | 'sorting' | 'stackQueue' | 'searching' | 'hashing';
