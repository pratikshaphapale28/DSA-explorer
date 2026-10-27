import type { AlgorithmDefinition, Step } from '../../engine/types';
import type { SortingAuxiliary } from './bubbleSort';

export const quickSortAlgorithm: AlgorithmDefinition<number[], number[], SortingAuxiliary> = {
  id: 'quick_sort',
  name: 'Quick Sort (Lomuto Partition)',
  category: 'sorting',
  categoryLabel: 'Sorting',
  summary: 'Divide-and-conquer algorithm that selects a "pivot" element, partitions the array around it (elements smaller to the left, larger to the right), and recursively sorts the sub-arrays.',
  complexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n²)',
    space: 'O(log n)',
    explanation: 'Average O(n log n) with excellent cache locality. Worst case O(n²) occurs when the pivot consistently yields highly unbalanced partitions (e.g. sorted array with last element pivot).',
    realWorldAnalogy: 'Organizing students by height around a chosen student: everyone shorter goes to the left, everyone taller goes to the right, then repeat with each group.',
  },
  pseudocode: [
    'procedure quickSort(A, low, high):',
    '  if low < high:',
    '    pivotIndex = partition(A, low, high) // Lomuto scheme',
    '    quickSort(A, low, pivotIndex - 1)',
    '    quickSort(A, pivotIndex + 1, high)',
    'procedure partition(A, low, high):',
    '  pivot = A[high], i = low - 1',
    '  for j = low to high - 1:',
    '    if A[j] < pivot: i++, swap(A[i], A[j])',
    '  swap(A[i + 1], A[high]); return i + 1',
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
      description: `Starting Quick Sort (Lomuto Partition Scheme) on ${n} elements.`,
      pseudocodeLine: 1,
      state: [...arr],
      auxiliary: { sortedIndices: [], phase: 'partition' },
      highlights: { indices: [], activeRange: [0, n - 1] },
      counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
    });

    if (n <= 1) {
      steps.push({
        id: steps.length,
        type: 'complete',
        description: `Array of size ${n} is already sorted.`,
        pseudocodeLine: 2,
        state: [...arr],
        auxiliary: { sortedIndices: n === 1 ? [0] : [] },
        highlights: { indices: n === 1 ? [0] : [] },
        counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
      });
      return steps;
    }

    const partition = (low: number, high: number): number => {
      const pivot = arr[high];
      arrayAccesses++;
      let i = low - 1;

      steps.push({
        id: steps.length,
        type: 'highlight',
        description: `Lomuto Partition: Selected pivot = ${pivot} at index ${high} for subarray [${low}..${high}]. Pointer i initialized to ${i}.`,
        pseudocodeLine: 7,
        state: [...arr],
        auxiliary: {
          sortedIndices: [...sortedIndices],
          pivotIndex: high,
          phase: 'partition',
          pointers: { i, low, high },
        },
        highlights: {
          indices: [high],
          activeRange: [low, high],
        },
        counters: { comparisons, swaps, iterations, arrayAccesses },
      });

      for (let j = low; j < high; j++) {
        iterations++;
        comparisons++;
        arrayAccesses += 2;

        steps.push({
          id: steps.length,
          type: 'compare',
          description: `Scanning element at [${j}] (${arr[j]}). Comparing with pivot ${pivot}.`,
          pseudocodeLine: 9,
          state: [...arr],
          auxiliary: {
            sortedIndices: [...sortedIndices],
            pivotIndex: high,
            phase: 'partition',
            pointers: { i, j, low, high },
          },
          highlights: {
            indices: [j, high],
            secondaryIndices: i >= low ? [i] : [],
            activeRange: [low, high],
          },
          counters: { comparisons, swaps, iterations, arrayAccesses },
        });

        if (arr[j] < pivot) {
          i++;
          if (i !== j) {
            swaps++;
            arrayAccesses += 2;
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;

            steps.push({
              id: steps.length,
              type: 'swap',
              description: `${arr[i]} < ${pivot}. Incremented i to ${i} and swapped A[${i}] (${arr[i]}) with A[${j}] (${arr[j]}).`,
              pseudocodeLine: 9,
              state: [...arr],
              auxiliary: {
                sortedIndices: [...sortedIndices],
                pivotIndex: high,
                phase: 'partition',
                pointers: { i, j, low, high },
              },
              highlights: {
                indices: [i, j],
                activeRange: [low, high],
              },
              counters: { comparisons, swaps, iterations, arrayAccesses },
            });
          }
        }
      }

      // Final swap to place pivot in its correct position
      swaps++;
      arrayAccesses += 2;
      const pivotFinalIdx = i + 1;
      const temp = arr[pivotFinalIdx];
      arr[pivotFinalIdx] = arr[high];
      arr[high] = temp;

      if (!sortedIndices.includes(pivotFinalIdx)) {
        sortedIndices.push(pivotFinalIdx);
      }

      steps.push({
        id: steps.length,
        type: 'sorted',
        description: `Placed pivot ${arr[pivotFinalIdx]} into its final sorted position at index ${pivotFinalIdx}. Left values are <= ${arr[pivotFinalIdx]}, right values are >= ${arr[pivotFinalIdx]}.`,
        pseudocodeLine: 10,
        state: [...arr],
        auxiliary: {
          sortedIndices: [...sortedIndices],
          pivotIndex: pivotFinalIdx,
          phase: 'partition',
          pointers: { pivot: pivotFinalIdx },
        },
        highlights: {
          indices: [pivotFinalIdx],
          activeRange: [low, high],
        },
        counters: { comparisons, swaps, iterations, arrayAccesses },
      });

      return pivotFinalIdx;
    };

    const quick = (low: number, high: number) => {
      if (low < high) {
        const p = partition(low, high);
        quick(low, p - 1);
        quick(p + 1, high);
      } else if (low === high) {
        if (!sortedIndices.includes(low)) {
          sortedIndices.push(low);
          steps.push({
            id: steps.length,
            type: 'sorted',
            description: `Single-element partition [${low}] (${arr[low]}) is in its final sorted position. Marked sorted.`,
            pseudocodeLine: 2,
            state: [...arr],
            auxiliary: {
              sortedIndices: [...sortedIndices],
              phase: 'partition',
              pointers: {},
            },
            highlights: {
              indices: [low],
            },
            counters: { comparisons, swaps, iterations, arrayAccesses },
          });
        }
      }
    };

    quick(0, n - 1);

    steps.push({
      id: steps.length,
      type: 'complete',
      description: `Quick Sort completed. All subarrays partitioned and sorted.`,
      pseudocodeLine: 5,
      state: [...arr],
      auxiliary: {
        sortedIndices: Array.from({ length: n }, (_, k) => k),
        phase: 'complete',
      },
      highlights: { indices: [] },
      counters: { comparisons, swaps, iterations, arrayAccesses },
    });

    return steps;
  },
};
