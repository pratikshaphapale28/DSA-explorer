import type { AlgorithmDefinition, Step } from '../../engine/types';
import type { SearchInput, SearchAuxiliary } from './linearSearch';

export const binarySearchAlgorithm: AlgorithmDefinition<
  SearchInput,
  number[],
  SearchAuxiliary
> = {
  id: 'binary_search',
  name: 'Binary Search',
  category: 'searching',
  categoryLabel: 'Searching',
  summary: 'Efficiently locates a target in a sorted array by repeatedly dividing the search interval in half.',
  complexity: {
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
    space: 'O(1)',
    explanation: 'Each comparison cuts the remaining search space in half, resulting in logarithmic time complexity.',
    realWorldAnalogy: 'Opening a dictionary right to the middle, checking if your word is earlier or later, and repeating with only that half.',
  },
  pseudocode: [
    'function binarySearch(array, target):',
    '  low = 0, high = length - 1',
    '  while low <= high:',
    '    mid = floor((low + high) / 2)',
    '    if array[mid] == target: return mid',
    '    else if array[mid] < target: low = mid + 1',
    '    else: high = mid - 1',
    '  return -1  // Not found',
  ],
  defaultInput: {
    array: [8, 14, 19, 29, 35, 42, 51, 63],
    target: 42,
  },
  generateSteps: ({ array, target }: SearchInput): Step<number[], SearchAuxiliary>[] => {
    const steps: Step<number[], SearchAuxiliary>[] = [];
    const n = array.length;
    let comparisons = 0;
    let arrayAccesses = 0;
    let iterations = 0;

    // Check if array is sorted
    const isSorted = array.every((v, i) => i === 0 || array[i - 1] <= v);

    // Start step
    steps.push({
      id: 0,
      type: 'start',
      description: isSorted
        ? `Starting Binary Search for target ${target} in sorted array of size ${n}.`
        : `WARNING: The input array is unsorted! Binary search assumes a sorted array and the result may be wrong. Proceeding with target ${target} in unsorted array of size ${n}.`,
      pseudocodeLine: 2,
      state: [...array],
      auxiliary: {
        target,
        currentIndex: null,
        foundIndex: null,
        low: 0,
        high: n - 1,
      },
      highlights: {
        activeRange: [0, n - 1],
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
        pseudocodeLine: 8,
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

    let low = 0;
    let high = n - 1;
    let found = false;
    let foundIdx = -1;

    while (low <= high) {
      iterations++;
      const mid = Math.floor((low + high) / 2);
      arrayAccesses++;
      comparisons++;

      const midVal = array[mid];

      // Inspection step at mid
      steps.push({
        id: steps.length,
        type: 'compare',
        description: `Window is [${low}..${high}]. Midpoint is index ${mid} (value ${midVal}). Comparing ${midVal} with target ${target}.`,
        pseudocodeLine: 4,
        state: [...array],
        auxiliary: {
          target,
          currentIndex: mid,
          foundIndex: null,
          low,
          mid,
          high,
        },
        highlights: {
          indices: [mid],
          activeRange: [low, high],
          label: `array[${mid}] = ${midVal}`,
        },
        counters: {
          comparisons,
          swaps: 0,
          iterations,
          arrayAccesses,
        },
      });

      if (midVal === target) {
        found = true;
        foundIdx = mid;

        steps.push({
          id: steps.length,
          type: 'found',
          description: `Target ${target} matches element at midpoint index ${mid}! Search succeeds. Returning ${mid}.`,
          pseudocodeLine: 5,
          state: [...array],
          auxiliary: {
            target,
            currentIndex: mid,
            foundIndex: mid,
            low,
            mid,
            high,
          },
          highlights: {
            indices: [mid],
            label: `Found at [${mid}]`,
          },
          counters: {
            comparisons,
            swaps: 0,
            iterations,
            arrayAccesses,
          },
        });
        break;
      } else if (midVal < target) {
        // Target is in right half, eliminate left half
        const prevLow = low;
        low = mid + 1;

        steps.push({
          id: steps.length,
          type: 'highlight',
          description: `Since ${midVal} < ${target}, target must be in the right half. Eliminating indices [${prevLow}..${mid}]. Updating low to ${low}.`,
          pseudocodeLine: 6,
          state: [...array],
          auxiliary: {
            target,
            currentIndex: null,
            foundIndex: null,
            low,
            mid,
            high,
            eliminatedRange: [prevLow, mid],
          },
          highlights: {
            activeRange: [low, high],
          },
          counters: {
            comparisons,
            swaps: 0,
            iterations,
            arrayAccesses,
          },
        });
      } else {
        // Target is in left half, eliminate right half
        const prevHigh = high;
        high = mid - 1;

        steps.push({
          id: steps.length,
          type: 'highlight',
          description: `Since ${midVal} > ${target}, target must be in the left half. Eliminating indices [${mid}..${prevHigh}]. Updating high to ${high}.`,
          pseudocodeLine: 7,
          state: [...array],
          auxiliary: {
            target,
            currentIndex: null,
            foundIndex: null,
            low,
            mid,
            high,
            eliminatedRange: [mid, prevHigh],
          },
          highlights: {
            activeRange: [low, high],
          },
          counters: {
            comparisons,
            swaps: 0,
            iterations,
            arrayAccesses,
          },
        });
      }
    }

    if (!found) {
      steps.push({
        id: steps.length,
        type: 'not_found',
        description: `Search interval exhausted (low ${low} > high ${high}). Target ${target} is not in the array. Returning -1.`,
        pseudocodeLine: 8,
        state: [...array],
        auxiliary: {
          target,
          currentIndex: null,
          foundIndex: null,
          low,
          high,
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

    // Terminal completion step
    steps.push({
      id: steps.length,
      type: 'complete',
      description: found
        ? `Binary search completed. Found target ${target} at index ${foundIdx} in ${iterations} iterations.`
        : `Binary search completed. Target ${target} not found after ${iterations} iterations.`,
      pseudocodeLine: found ? 5 : 8,
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
