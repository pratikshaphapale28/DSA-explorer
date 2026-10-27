import type { AlgorithmDefinition, Step } from '../../engine/types';

export type HashFunctionType = 'division' | 'multiplication' | 'string_poly';
export type CollisionStrategy = 'chaining' | 'linear_probing' | 'quadratic_probing';

export const TOMBSTONE = '__DELETED__';

export interface HashBucketItem {
  key: number | string;
  value?: string;
  isTombstone?: boolean;
}

export interface HashTableState {
  size: number; // m
  count: number; // n
  loadFactor: number; // alpha = n / m
  strategy: CollisionStrategy;
  hashFunction: HashFunctionType;
  // For chaining: array of arrays. For open addressing: array of items or null
  buckets: (HashBucketItem[] | HashBucketItem | null)[];
}

export interface HashAuxiliary {
  computedHash?: number;
  formulaString?: string;
  probeSequence?: number[];
  action?: 'insert' | 'search' | 'delete';
  targetKey?: number | string;
  foundIndex?: number | null;
  resizeWarning?: boolean;
}

// Prime number utilities for rehashing
export const isPrime = (n: number): boolean => {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
};

export const getNextPrime = (start: number): number => {
  let candidate = Math.max(2, Math.floor(start));
  while (!isPrime(candidate)) {
    candidate++;
  }
  return candidate;
};

// Hash functions
export const computeHash = (
  key: number | string,
  m: number,
  func: HashFunctionType
): { index: number; formula: string } => {
  const isNonNumericStr = typeof key === 'string' && isNaN(Number(key));

  if (func === 'string_poly' || isNonNumericStr) {
    let hash = 0;
    const str = String(key);
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % m;
    }
    const idx = ((hash % m) + m) % m;
    return {
      index: idx,
      formula: `polyHash("${key}") mod ${m} = ${idx}`,
    };
  }

  const numKey = Number(key);
  if (func === 'division') {
    const idx = ((numKey % m) + m) % m;
    return {
      index: idx,
      formula: `${numKey} mod ${m} = ${idx}`,
    };
  } else if (func === 'multiplication') {
    const A = 0.6180339887;
    let fractional = (numKey * A) % 1;
    if (fractional < 0) fractional += 1;
    const idx = Math.floor(m * fractional);
    return {
      index: idx,
      formula: `floor(${m} * (${numKey} * 0.61803 mod 1)) = ${idx}`,
    };
  }

  const fallbackIdx = ((numKey % m) + m) % m;
  return {
    index: fallbackIdx,
    formula: `${numKey} mod ${m} = ${fallbackIdx}`,
  };
};

/**
 * HashTable Operations Step Generator
 */
export const executeHashAction = (
  table: HashTableState,
  action: 'insert' | 'search' | 'delete',
  key: number | string
): { table: HashTableState; steps: Step<HashTableState, HashAuxiliary>[] } => {
  const steps: Step<HashTableState, HashAuxiliary>[] = [];
  const m = table.size;
  const strategy = table.strategy;

  // Deep clone buckets
  const buckets = table.buckets.map(b => {
    if (Array.isArray(b)) {
      return [...b];
    }
    return b ? { ...b } : null;
  });

  let count = table.count;
  const { index: baseIndex, formula } = computeHash(key, m, table.hashFunction);
  const probeSequence: number[] = [];

  let comparisons = 0;
  let arrayAccesses = 0;
  let iterations = 0;

  steps.push({
    id: 0,
    type: 'hash_calc',
    description: `Calculating hash for key "${key}": ${formula}. Base index = ${baseIndex}.`,
    pseudocodeLine: 1,
    state: { ...table, buckets },
    auxiliary: {
      computedHash: baseIndex,
      formulaString: formula,
      probeSequence: [],
      action,
      targetKey: key,
    },
    highlights: { indices: [baseIndex] },
    counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 1 },
  });

  // 1. CHAINING STRATEGY
  if (strategy === 'chaining') {
    const bucketList = (buckets[baseIndex] as HashBucketItem[]) || [];
    buckets[baseIndex] = bucketList;

    if (action === 'insert') {
      iterations++;
      comparisons++;
      arrayAccesses++;

      const existingIdx = bucketList.findIndex(item => item.key === key);
      if (existingIdx !== -1) {
        steps.push({
          id: steps.length,
          type: 'highlight',
          description: `Key "${key}" already exists in bucket [${baseIndex}] chain. Updating entry.`,
          pseudocodeLine: 3,
          state: { ...table, buckets, count, loadFactor: count / m },
          auxiliary: { computedHash: baseIndex, action: 'insert', targetKey: key },
          highlights: { indices: [baseIndex] },
          counters: { comparisons, swaps: 0, iterations, arrayAccesses },
        });
      } else {
        bucketList.push({ key });
        count++;
        const newAlpha = count / m;
        const resizeWarning = newAlpha >= 0.75;

        steps.push({
          id: steps.length,
          type: 'insert',
          description: `Inserted "${key}" into bucket [${baseIndex}] (chain length = ${bucketList.length}). New load factor α = ${count}/${m} = ${newAlpha.toFixed(2)}${resizeWarning ? ' [REHASH WARNING: α >= 0.75]' : ''}.`,
          pseudocodeLine: 4,
          state: { ...table, buckets, count, loadFactor: newAlpha },
          auxiliary: {
            computedHash: baseIndex,
            action: 'insert',
            targetKey: key,
            resizeWarning,
          },
          highlights: { indices: [baseIndex] },
          counters: { comparisons, swaps: 0, iterations, arrayAccesses },
        });
      }
    } else if (action === 'search') {
      let found = false;
      for (let i = 0; i < bucketList.length; i++) {
        iterations++;
        comparisons++;
        arrayAccesses++;
        if (bucketList[i].key === key) {
          found = true;
          steps.push({
            id: steps.length,
            type: 'found',
            description: `Key "${key}" FOUND in bucket [${baseIndex}] at chain position ${i}!`,
            pseudocodeLine: 5,
            state: { ...table, buckets },
            auxiliary: { computedHash: baseIndex, action: 'search', targetKey: key, foundIndex: baseIndex },
            highlights: { indices: [baseIndex] },
            counters: { comparisons, swaps: 0, iterations, arrayAccesses },
          });
          break;
        }
      }
      if (!found) {
        steps.push({
          id: steps.length,
          type: 'not_found',
          description: `Searched entire chain in bucket [${baseIndex}]. Key "${key}" was NOT FOUND in hash table.`,
          pseudocodeLine: 6,
          state: { ...table, buckets },
          auxiliary: { computedHash: baseIndex, action: 'search', targetKey: key, foundIndex: null },
          highlights: { indices: [baseIndex] },
          counters: { comparisons, swaps: 0, iterations, arrayAccesses },
        });
      }
    } else if (action === 'delete') {
      const idx = bucketList.findIndex(item => item.key === key);
      comparisons++;
      if (idx !== -1) {
        bucketList.splice(idx, 1);
        count--;
        steps.push({
          id: steps.length,
          type: 'delete',
          description: `DELETED key "${key}" from bucket [${baseIndex}] chain.`,
          pseudocodeLine: 7,
          state: { ...table, buckets, count, loadFactor: count / m },
          auxiliary: { computedHash: baseIndex, action: 'delete', targetKey: key },
          highlights: { indices: [baseIndex] },
          counters: { comparisons, swaps: 0, iterations, arrayAccesses },
        });
      } else {
        steps.push({
          id: steps.length,
          type: 'not_found',
          description: `Cannot delete "${key}": key not present in bucket [${baseIndex}].`,
          pseudocodeLine: 7,
          state: { ...table, buckets },
          auxiliary: { computedHash: baseIndex, action: 'delete', targetKey: key },
          highlights: { indices: [baseIndex] },
          counters: { comparisons, swaps: 0, iterations, arrayAccesses },
        });
      }
    }
  }

  // 2. OPEN ADDRESSING (Linear & Quadratic Probing)
  else {
    let i = 0;
    let placed = false;

    while (i < m) {
      iterations++;
      arrayAccesses++;
      // Rule 29: Quadratic Probing formula: index = (h + i*i) mod m
      const offset = strategy === 'linear_probing' ? i : i * i;
      const currIdx = (baseIndex + offset) % m;
      probeSequence.push(currIdx);

      const slot = buckets[currIdx] as HashBucketItem | null;

      steps.push({
        id: steps.length,
        type: 'probe',
        description: `Probing attempt ${i}: checking slot [${currIdx}] (offset ${offset}, formula: (${baseIndex} + ${offset}) mod ${m}). Slot contains: ${
          slot ? (slot.isTombstone ? '<DELETED tombstone>' : `"${slot.key}"`) : 'Empty (null)'
        }.`,
        pseudocodeLine: 2,
        state: { ...table, buckets },
        auxiliary: {
          computedHash: baseIndex,
          probeSequence: [...probeSequence],
          action,
          targetKey: key,
        },
        highlights: { indices: [currIdx] },
        counters: { comparisons, swaps: 0, iterations, arrayAccesses },
      });

      if (action === 'insert') {
        // Can insert if slot is empty or a tombstone
        if (!slot || slot.isTombstone || slot.key === key) {
          comparisons++;
          buckets[currIdx] = { key };
          if (!slot || slot.isTombstone) count++;
          placed = true;
          const newAlpha = count / m;
          const resizeWarning = newAlpha >= 0.75;

          steps.push({
            id: steps.length,
            type: 'insert',
            description: `Inserted key "${key}" into slot [${currIdx}]${
              slot?.isTombstone ? ' (reused DELETED tombstone)' : ''
            } after ${i} collision probe(s). Load factor α = ${count}/${m} = ${newAlpha.toFixed(2)}${
              resizeWarning ? ' [REHASH RECOMMENDED: α >= 0.75]' : ''
            }.`,
            pseudocodeLine: 4,
            state: { ...table, buckets, count, loadFactor: newAlpha },
            auxiliary: {
              computedHash: baseIndex,
              probeSequence: [...probeSequence],
              action: 'insert',
              targetKey: key,
              resizeWarning,
            },
            highlights: { indices: [currIdx] },
            counters: { comparisons, swaps: 0, iterations, arrayAccesses },
          });
          break;
        } else {
          comparisons++;
        }
      } else if (action === 'search') {
        if (!slot) {
          // Empty slot in open addressing terminates search early (key was never inserted)
          steps.push({
            id: steps.length,
            type: 'not_found',
            description: `Encountered empty slot [${currIdx}]. Search terminates: key "${key}" is NOT in table.`,
            pseudocodeLine: 6,
            state: { ...table, buckets },
            auxiliary: {
              computedHash: baseIndex,
              probeSequence: [...probeSequence],
              action: 'search',
              targetKey: key,
              foundIndex: null,
            },
            highlights: { indices: [currIdx] },
            counters: { comparisons, swaps: 0, iterations, arrayAccesses },
          });
          placed = true;
          break;
        } else if (!slot.isTombstone && slot.key === key) {
          steps.push({
            id: steps.length,
            type: 'found',
            description: `Key "${key}" FOUND at slot [${currIdx}] after ${i} probe(s)!`,
            pseudocodeLine: 5,
            state: { ...table, buckets },
            auxiliary: {
              computedHash: baseIndex,
              probeSequence: [...probeSequence],
              action: 'search',
              targetKey: key,
              foundIndex: currIdx,
            },
            highlights: { indices: [currIdx] },
            counters: { comparisons, swaps: 0, iterations, arrayAccesses },
          });
          placed = true;
          break;
        } else if (slot.isTombstone) {
          // Rule 28: Search must continue past tombstone
          steps.push({
            id: steps.length,
            type: 'probe',
            description: `Slot [${currIdx}] has DELETED marker (tombstone). Continuing search past tombstone...`,
            pseudocodeLine: 3,
            state: { ...table, buckets },
            auxiliary: {
              computedHash: baseIndex,
              probeSequence: [...probeSequence],
              action: 'search',
              targetKey: key,
            },
            highlights: { indices: [currIdx] },
            counters: { comparisons, swaps: 0, iterations, arrayAccesses },
          });
        }
      } else if (action === 'delete') {
        if (!slot) {
          steps.push({
            id: steps.length,
            type: 'not_found',
            description: `Hit empty slot [${currIdx}]. Cannot delete: key "${key}" not in table.`,
            pseudocodeLine: 7,
            state: { ...table, buckets },
            auxiliary: { computedHash: baseIndex, action: 'delete', targetKey: key },
            highlights: { indices: [currIdx] },
            counters: { comparisons, swaps: 0, iterations, arrayAccesses },
          });
          placed = true;
          break;
        } else if (!slot.isTombstone && slot.key === key) {
          // Rule 28: Mark with TOMBSTONE
          buckets[currIdx] = { key: TOMBSTONE, isTombstone: true };
          count--;
          steps.push({
            id: steps.length,
            type: 'delete',
            description: `DELETED key "${key}" at slot [${currIdx}]. Marked with DELETED tombstone so subsequent probe searches do not terminate prematurely!`,
            pseudocodeLine: 7,
            state: { ...table, buckets, count, loadFactor: count / m },
            auxiliary: {
              computedHash: baseIndex,
              probeSequence: [...probeSequence],
              action: 'delete',
              targetKey: key,
            },
            highlights: { indices: [currIdx] },
            counters: { comparisons, swaps: 0, iterations, arrayAccesses },
          });
          placed = true;
          break;
        } else if (slot.isTombstone) {
          // Rule 28: Delete continues searching past tombstones to find key
          steps.push({
            id: steps.length,
            type: 'probe',
            description: `Slot [${currIdx}] has DELETED tombstone. Continuing probe for key "${key}" to delete...`,
            pseudocodeLine: 3,
            state: { ...table, buckets },
            auxiliary: {
              computedHash: baseIndex,
              probeSequence: [...probeSequence],
              action: 'delete',
              targetKey: key,
            },
            highlights: { indices: [currIdx] },
            counters: { comparisons, swaps: 0, iterations, arrayAccesses },
          });
        }
      }

      i++;
    }

    // Rule 27: Insert into full table must stop with "Table full: rehash required". Search and delete must stop after m probes.
    if (!placed) {
      if (action === 'insert') {
        steps.push({
          id: steps.length,
          type: 'not_found',
          description: 'Table full: rehash required',
          pseudocodeLine: 4,
          state: { ...table, buckets, count, loadFactor: count / m },
          auxiliary: { computedHash: baseIndex, action: 'insert', targetKey: key, resizeWarning: true },
          highlights: {},
          counters: { comparisons, swaps: 0, iterations, arrayAccesses },
        });
      } else if (action === 'search') {
        steps.push({
          id: steps.length,
          type: 'not_found',
          description: `Search stopped after ${m} probes: key "${key}" not found in table.`,
          pseudocodeLine: 6,
          state: { ...table, buckets },
          auxiliary: { computedHash: baseIndex, probeSequence: [...probeSequence], action: 'search', targetKey: key, foundIndex: null },
          highlights: {},
          counters: { comparisons, swaps: 0, iterations, arrayAccesses },
        });
      } else if (action === 'delete') {
        steps.push({
          id: steps.length,
          type: 'not_found',
          description: `Delete stopped after ${m} probes: key "${key}" not found to delete.`,
          pseudocodeLine: 7,
          state: { ...table, buckets },
          auxiliary: { computedHash: baseIndex, action: 'delete', targetKey: key },
          highlights: {},
          counters: { comparisons, swaps: 0, iterations, arrayAccesses },
        });
      }
    }
  }

  const updatedTable: HashTableState = {
    ...table,
    buckets,
    count,
    loadFactor: count / m,
  };

  return { table: updatedTable, steps };
};

/**
 * Rule 26: Rehash table - doubles capacity to next prime and animates re-insertion of all keys
 */
export const generateRehashSteps = (
  table: HashTableState
): { table: HashTableState; steps: Step<HashTableState, HashAuxiliary>[] } => {
  const oldSize = table.size;
  const newSize = getNextPrime(oldSize * 2);
  const strategy = table.strategy;
  const hashFunction = table.hashFunction;

  // Extract all existing active non-tombstone keys
  const keysToRehash: (string | number)[] = [];
  if (strategy === 'chaining') {
    for (const bucket of table.buckets) {
      if (Array.isArray(bucket)) {
        for (const item of bucket) {
          keysToRehash.push(item.key);
        }
      }
    }
  } else {
    for (const slot of table.buckets) {
      if (slot && !Array.isArray(slot) && !slot.isTombstone) {
        keysToRehash.push(slot.key);
      }
    }
  }

  // Create new blank table
  let currentTable: HashTableState = {
    size: newSize,
    count: 0,
    loadFactor: 0,
    strategy,
    hashFunction,
    buckets: strategy === 'chaining'
      ? new Array(newSize).fill(null).map(() => [])
      : new Array(newSize).fill(null),
  };

  const steps: Step<HashTableState, HashAuxiliary>[] = [];

  steps.push({
    id: 0,
    type: 'start',
    description: `Rehashing: Doubling capacity from m=${oldSize} to next prime m=${newSize}. Initialized new empty table.`,
    pseudocodeLine: 5,
    state: { ...currentTable },
    auxiliary: { resizeWarning: false },
    highlights: {},
    counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: oldSize },
  });

  let totalComparisons = 0;
  let totalArrayAccesses = oldSize;
  let totalIterations = 0;

  for (const key of keysToRehash) {
    const { table: nextTable, steps: insertSteps } = executeHashAction(currentTable, 'insert', key);
    currentTable = nextTable;
    for (const s of insertSteps) {
      totalIterations++;
      steps.push({
        ...s,
        id: steps.length,
        description: `[Rehashing]: ${s.description}`,
        counters: {
          comparisons: totalComparisons + s.counters.comparisons,
          swaps: 0,
          iterations: totalIterations,
          arrayAccesses: totalArrayAccesses + s.counters.arrayAccesses,
        },
      });
    }
    totalComparisons += insertSteps[insertSteps.length - 1]?.counters.comparisons || 0;
    totalArrayAccesses += insertSteps[insertSteps.length - 1]?.counters.arrayAccesses || 0;
  }

  steps.push({
    id: steps.length,
    type: 'complete',
    description: `Rehash complete! Successfully re-inserted ${keysToRehash.length} keys into table of size m=${newSize}. New load factor α = ${(keysToRehash.length / newSize).toFixed(2)}.`,
    pseudocodeLine: 5,
    state: { ...currentTable },
    auxiliary: { resizeWarning: false },
    highlights: {},
    counters: { comparisons: totalComparisons, swaps: 0, iterations: totalIterations, arrayAccesses: totalArrayAccesses },
  });

  return { table: currentTable, steps };
};
