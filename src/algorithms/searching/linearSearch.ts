import type { AlgorithmDefinition, Step } from '../../engine/types';

export interface SearchInput {
  array: number[];
  target: number;
}

export interface SearchAuxiliary {
  target: number;
  currentIndex: number | null;
  foundIndex: number | null;
  low?: number;
  mid?: number;
  high?: number;
  eliminatedRange?: [number, number];
}

export const linearSearchAlgorithm: AlgorithmDefinition<
  SearchInput,
  number[],
  SearchAuxiliary
> = {
  id: 'linear_search',
  name: 'Linear Search',
  category: 'searching',
  categoryLabel: 'Searching',
  summary: 'Sequentially checks each element in the array from left to right until the target is found or the end is reached.',
  complexity: {
    best: 'O(1)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(1)',
    explanation: 'Best case occurs when the target is at the very first index. Worst and average cases require scanning up to n elements.',
    realWorldAnalogy: 'Flipping through a stack of unsorted papers one by one until you find the invoice you are looking for.',
  },
  pseudocode: [
    'function linearSearch(array, target):',
    '  for index from 0 to length - 1:',
    '    if array[index] == target:',
    '      return index  // Found',
    '  return -1  // Not found',
  ],
  defaultInput: {
    array: [14, 29, 8, 42, 63, 19, 51, 35],
    target: 42,
  },
  generateSteps: ({ array, target }: SearchInput): Step<number[], SearchAuxiliary>[] => {
    const steps: Step<number[], SearchAuxiliary>[] = [];
    const n = array.length;
    let comparisons = 0;
    let arrayAccesses = 0;
    let iterations = 0;

    // Initial state step
    steps.push({
      id: 0,
      type: 'start',
      description: `Starting Linear Search for target ${target} across ${n} elements.`,
      pseudocodeLine: 1,
      state: [...array],
      auxiliary: {
        target,
        currentIndex: null,
        foundIndex: null,
      },
      highlights: {
        indices: [],
      },
      counters: {
        comparisons: 0,
        swaps: 0,
        iterations: 0,
        arrayAccesses: 0,
      },
    });

    if (n === 0) {
      steps.push({
        id: steps.length,
        type: 'not_found',
        description: `Array is empty. Target ${target} cannot be found. Returning -1.`,
        pseudocodeLine: 5,
        state: [],
        auxiliary: {
          target,
          currentIndex: null,
          foundIndex: null,
        },
        highlights: {},
        counters: {
          comparisons: 0,
          swaps: 0,
          iterations: 0,
          arrayAccesses: 0,
        },
      });
      return steps;
    }

    let found = false;
    let foundIdx = -1;

    for (let i = 0; i < n; i++) {
      iterations++;
      arrayAccesses++;
      comparisons++;

      const val = array[i];

      // Comparison step
      steps.push({
        id: steps.length,
        type: 'compare',
        description: `Checking index ${i}: element is ${val}. Comparing ${val} with target ${target}.`,
        pseudocodeLine: 3,
        state: [...array],
        auxiliary: {
          target,
          currentIndex: i,
          foundIndex: null,
        },
        highlights: {
          indices: [i],
          label: `array[${i}] = ${val}`,
        },
        counters: {
          comparisons,
          swaps: 0,
          iterations,
          arrayAccesses,
        },
      });

      if (val === target) {
        found = true;
        foundIdx = i;

        // Match found step
        steps.push({
          id: steps.length,
          type: 'found',
          description: `Target ${target} matches element at index ${i}! Search succeeds. Returning ${i}.`,
          pseudocodeLine: 4,
          state: [...array],
          auxiliary: {
            target,
            currentIndex: i,
            foundIndex: i,
          },
          highlights: {
            indices: [i],
            label: `Found at [${i}]`,
          },
          counters: {
            comparisons,
            swaps: 0,
            iterations,
            arrayAccesses,
          },
        });
        break;
      }
    }

    if (!found) {
      steps.push({
        id: steps.length,
        type: 'not_found',
        description: `Scanned all ${n} elements. Target ${target} was not found in the array. Returning -1.`,
        pseudocodeLine: 5,
        state: [...array],
        auxiliary: {
          target,
          currentIndex: null,
          foundIndex: null,
        },
        highlights: {},
        counters: {
          comparisons,
          swaps: 0,
          iterations,
          arrayAccesses,
        },
      });
    }

    // Completion terminal step
    steps.push({
      id: steps.length,
      type: 'complete',
      description: found
        ? `Linear search completed. Target ${target} located at index ${foundIdx} in ${iterations} operations.`
        : `Linear search completed. Target ${target} not found after ${iterations} iterations.`,
      pseudocodeLine: found ? 4 : 5,
      state: [...array],
      auxiliary: {
        target,
        currentIndex: foundIdx >= 0 ? foundIdx : null,
        foundIndex: foundIdx >= 0 ? foundIdx : null,
      },
      highlights: {
        indices: foundIdx >= 0 ? [foundIdx] : [],
      },
      counters: {
        comparisons,
        swaps: 0,
        iterations,
        arrayAccesses,
      },
    });

    return steps;
  },
};
