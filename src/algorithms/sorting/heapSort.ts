import type { AlgorithmDefinition, Step } from '../../engine/types';
import type { SortingAuxiliary } from './bubbleSort';

export const heapSortAlgorithm: AlgorithmDefinition<number[], number[], SortingAuxiliary> = {
  id: 'heap_sort',
  name: 'Heap Sort',
  category: 'sorting',
  categoryLabel: 'Sorting',
  summary: 'Converts the array into a Max-Heap data structure, repeatedly extracts the maximum root element to the end of the array, and restores the heap property (heapify).',
  complexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(1)',
    explanation: 'Build-heap takes O(n) time, and each of the n extract-max operations takes O(log n) time, giving guaranteed O(n log n) with zero auxiliary memory.',
    realWorldAnalogy: 'A tournament ladder where the strongest competitor is at the apex. After awarding 1st place, competitors re-battle to determine the next strongest.',
  },
  pseudocode: [
    'procedure heapSort(A):',
    '  // Phase 1: Build max heap',
    '  for i from floor(n/2) - 1 down to 0: heapify(A, n, i)',
    '  // Phase 2: Extract elements',
    '  for i from n - 1 down to 1:',
    '    swap(A[0], A[i])',
    '    heapify(A, i, 0) // reduce heap size',
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
      description: `Starting Heap Sort. Total elements: ${n}. Initializing Phase 1: Build Max-Heap.`,
      pseudocodeLine: 1,
      state: [...arr],
      auxiliary: { sortedIndices: [], phase: 'build_heap', heapSize: n },
      highlights: { indices: [] },
      counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
    });

    if (n <= 1) {
      steps.push({
        id: steps.length,
        type: 'complete',
        description: `Array of size ${n} is already sorted.`,
        pseudocodeLine: 7,
        state: [...arr],
        auxiliary: { sortedIndices: n === 1 ? [0] : [], heapSize: 0 },
        highlights: { indices: n === 1 ? [0] : [] },
        counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
      });
      return steps;
    }

    const heapify = (size: number, rootIdx: number, phaseName: string) => {
      let largest = rootIdx;
      const left = 2 * rootIdx + 1;
      const right = 2 * rootIdx + 2;

      steps.push({
        id: steps.length,
        type: 'heapify',
        description: `Heapify at node [${rootIdx}] (${arr[rootIdx]}). Left child is [${left}] (${left < size ? arr[left] : 'none'}), Right child is [${right}] (${right < size ? arr[right] : 'none'}).`,
        pseudocodeLine: 3,
        state: [...arr],
        auxiliary: {
          sortedIndices: [...sortedIndices],
          phase: phaseName,
          heapSize: size,
          pointers: { root: rootIdx },
        },
        highlights: {
          indices: [rootIdx],
          secondaryIndices: [left < size ? left : -1, right < size ? right : -1].filter(x => x >= 0),
        },
        counters: { comparisons, swaps, iterations, arrayAccesses },
      });

      if (left < size) {
        comparisons++;
        arrayAccesses += 2;
        if (arr[left] > arr[largest]) {
          largest = left;
        }
      }

      if (right < size) {
        comparisons++;
        arrayAccesses += 2;
        if (arr[right] > arr[largest]) {
          largest = right;
        }
      }

      if (largest !== rootIdx) {
        swaps++;
        arrayAccesses += 2;
        const temp = arr[rootIdx];
        arr[rootIdx] = arr[largest];
        arr[largest] = temp;

        steps.push({
          id: steps.length,
          type: 'swap',
          description: `Child [${largest}] (${arr[rootIdx]}) is larger than root [${rootIdx}] (${temp}). Swapping to maintain max-heap property.`,
          pseudocodeLine: 3,
          state: [...arr],
          auxiliary: {
            sortedIndices: [...sortedIndices],
            phase: phaseName,
            heapSize: size,
          },
          highlights: {
            indices: [rootIdx, largest],
          },
          counters: { comparisons, swaps, iterations, arrayAccesses },
        });

        heapify(size, largest, phaseName);
      }
    };

    // Phase 1: Build Max-Heap from bottom non-leaf nodes up
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      iterations++;
      heapify(n, i, 'build_heap');
    }

    steps.push({
      id: steps.length,
      type: 'highlight',
      description: `Max-Heap successfully built! The root element [0] (${arr[0]}) is guaranteed to be the largest element.`,
      pseudocodeLine: 3,
      state: [...arr],
      auxiliary: {
        sortedIndices: [],
        phase: 'extract',
        heapSize: n,
      },
      highlights: { indices: [0] },
      counters: { comparisons, swaps, iterations, arrayAccesses },
    });

    // Phase 2: Extract elements from max heap one by one
    for (let i = n - 1; i > 0; i--) {
      iterations++;
      // Move current root to end
      swaps++;
      arrayAccesses += 2;
      const maxVal = arr[0];
      arr[0] = arr[i];
      arr[i] = maxVal;
      sortedIndices.unshift(i);

      steps.push({
        id: steps.length,
        type: 'swap',
        description: `Extracting max element ${maxVal}: swapping root [0] with current end of heap [${i}]. Heap size reduced to ${i}.`,
        pseudocodeLine: 6,
        state: [...arr],
        auxiliary: {
          sortedIndices: [...sortedIndices],
          phase: 'extract',
          heapSize: i,
        },
        highlights: {
          indices: [0, i],
        },
        counters: { comparisons, swaps, iterations, arrayAccesses },
      });

      // Call heapify on the reduced heap
      heapify(i, 0, 'extract');
    }

    sortedIndices.unshift(0);

    steps.push({
      id: steps.length,
      type: 'complete',
      description: `Heap Sort completed. Entire array is sorted in ascending order.`,
      pseudocodeLine: 7,
      state: [...arr],
      auxiliary: {
        sortedIndices: Array.from({ length: n }, (_, k) => k),
        phase: 'complete',
        heapSize: 0,
      },
      highlights: { indices: [] },
      counters: { comparisons, swaps, iterations, arrayAccesses },
    });

    return steps;
  },
};
