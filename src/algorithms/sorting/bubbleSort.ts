import type { AlgorithmDefinition, Step } from '../../engine/types';

export interface SortingAuxiliary {
  sortedIndices: number[];
  phase?: string;
  pivotIndex?: number;
  tempArray?: (number | null)[];
  heapSize?: number;
  pointers?: Record<string, number>;
}

export const bubbleSortAlgorithm: AlgorithmDefinition<number[], number[], SortingAuxiliary> = {
  id: 'bubble_sort',
  name: 'Bubble Sort',
  category: 'sorting',
  categoryLabel: 'Sorting',
  summary: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
  complexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    explanation: 'Best case O(n) occurs when the array is already sorted (optimized with a swapped flag). Worst case O(n²) occurs on reversed input.',
    realWorldAnalogy: 'Bubbles of air rising in water: the largest values naturally float up to their correct final position at the end of each pass.',
  },
  pseudocode: [
    'procedure bubbleSort(A):',
    '  for i from 0 to n - 1:',
    '    swapped = false',
    '    for j from 0 to n - i - 2:',
    '      if A[j] > A[j + 1]:',
    '        swap(A[j], A[j + 1])',
    '        swapped = true',
    '    if not swapped: break',
  ],
  defaultInput: [38, 27, 43, 3, 9, 82, 10],
  generateSteps: (input: number[]): Step<number[], SortingAuxiliary>[] => {
    const steps: Step<number[], SortingAuxiliary>[] = [];
    const arr = [...input];
    const n = arr.length;
    const sortedIndices: number[] = [];

    let comparisons = 0;
    let swaps = 0;
    let iterations = 0;
    let arrayAccesses = 0;

    steps.push({
      id: 0,
      type: 'start',
      description: `Starting Bubble Sort on array of size ${n}.`,
      pseudocodeLine: 1,
      state: [...arr],
      auxiliary: { sortedIndices: [] },
      highlights: { indices: [] },
      counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
    });

    if (n <= 1) {
      steps.push({
        id: steps.length,
        type: 'complete',
        description: `Array of size ${n} is already sorted.`,
        pseudocodeLine: 8,
        state: [...arr],
        auxiliary: { sortedIndices: n === 1 ? [0] : [] },
        highlights: { indices: n === 1 ? [0] : [] },
        counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
      });
      return steps;
    }

    for (let i = 0; i < n; i++) {
      iterations++;
      let swapped = false;

      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;
        arrayAccesses += 2;

        steps.push({
          id: steps.length,
          type: 'compare',
          description: `Pass ${i + 1}: Comparing adjacent elements at [${j}] (${arr[j]}) and [${j + 1}] (${arr[j + 1]}).`,
          pseudocodeLine: 5,
          state: [...arr],
          auxiliary: { sortedIndices: [...sortedIndices] },
          highlights: {
            indices: [j, j + 1],
            activeRange: [0, n - i - 1],
          },
          counters: { comparisons, swaps, iterations, arrayAccesses },
        });

        if (arr[j] > arr[j + 1]) {
          swaps++;
          arrayAccesses += 2;
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          swapped = true;

          steps.push({
            id: steps.length,
            type: 'swap',
            description: `${temp} > ${arr[j]}, so swapping elements at [${j}] and [${j + 1}].`,
            pseudocodeLine: 6,
            state: [...arr],
            auxiliary: { sortedIndices: [...sortedIndices] },
            highlights: {
              indices: [j, j + 1],
              activeRange: [0, n - i - 1],
            },
            counters: { comparisons, swaps, iterations, arrayAccesses },
          });
        }
      }

      const lockedIdx = n - i - 1;
      sortedIndices.unshift(lockedIdx);

      steps.push({
        id: steps.length,
        type: 'sorted',
        description: `Element at index ${lockedIdx} (${arr[lockedIdx]}) has bubbled into its final sorted position.`,
        pseudocodeLine: 4,
        state: [...arr],
        auxiliary: { sortedIndices: [...sortedIndices] },
        highlights: { indices: [lockedIdx] },
        counters: { comparisons, swaps, iterations, arrayAccesses },
      });

      if (!swapped) {
        steps.push({
          id: steps.length,
          type: 'highlight',
          description: `No swaps occurred during pass ${i + 1}. Early termination optimization triggered: array is fully sorted!`,
          pseudocodeLine: 8,
          state: [...arr],
          auxiliary: { sortedIndices: Array.from({ length: n }, (_, k) => k) },
          highlights: { indices: [] },
          counters: { comparisons, swaps, iterations, arrayAccesses },
        });
        break;
      }
    }

    steps.push({
      id: steps.length,
      type: 'complete',
      description: `Bubble Sort finished. Total comparisons: ${comparisons}, swaps: ${swaps}.`,
      pseudocodeLine: 8,
      state: [...arr],
      auxiliary: { sortedIndices: Array.from({ length: n }, (_, k) => k) },
      highlights: { indices: [] },
      counters: { comparisons, swaps, iterations, arrayAccesses },
    });

    return steps;
  },
};
