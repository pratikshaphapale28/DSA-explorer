import type { AlgorithmDefinition, Step } from '../../engine/types';
import type { SortingAuxiliary } from './bubbleSort';

export const mergeSortAlgorithm: AlgorithmDefinition<number[], number[], SortingAuxiliary> = {
  id: 'merge_sort',
  name: 'Merge Sort',
  category: 'sorting',
  categoryLabel: 'Sorting',
  summary: 'Divide-and-conquer algorithm that recursively divides the array into two halves until length 1, then merges the sorted halves back together.',
  complexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(n)',
    explanation: 'Guaranteed O(n log n) running time across all input configurations because it always splits evenly into halves.',
    realWorldAnalogy: 'Splitting a large deck of cards into two equal piles, having two friends sort each pile, then combining the two sorted decks by repeatedly picking the smaller top card.',
  },
  pseudocode: [
    'procedure mergeSort(A, left, right):',
    '  if left >= right: return',
    '  mid = floor((left + right) / 2)',
    '  mergeSort(A, left, mid)',
    '  mergeSort(A, mid + 1, right)',
    '  merge(A, left, mid, right)',
    '    copy to temp, compare elements, write back to A',
  ],
  defaultInput: [38, 27, 43, 3, 9, 82, 10],
  generateSteps: (input: number[]): Step<number[], SortingAuxiliary>[] => {
    const steps: Step<number[], SortingAuxiliary>[] = [];
    const arr = [...input];
    const n = arr.length;
    const sortedIndices: number[] = [];

    let comparisons = 0;
    let swaps = 0; // count writes to array
    let iterations = 0;
    let arrayAccesses = 0;

    steps.push({
      id: 0,
      type: 'start',
      description: `Starting Merge Sort on array of ${n} elements.`,
      pseudocodeLine: 1,
      state: [...arr],
      auxiliary: { sortedIndices: [], phase: 'split', tempArray: new Array(n).fill(null) },
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
        auxiliary: { sortedIndices: n === 1 ? [0] : [], tempArray: [] },
        highlights: { indices: n === 1 ? [0] : [] },
        counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
      });
      return steps;
    }

    const merge = (left: number, mid: number, right: number) => {
      iterations++;
      const leftPart = arr.slice(left, mid + 1);
      const rightPart = arr.slice(mid + 1, right + 1);
      const tempArray: (number | null)[] = new Array(n).fill(null);

      // Populate temp array representation for visual feedback
      for (let k = 0; k < leftPart.length; k++) {
        tempArray[left + k] = leftPart[k];
      }
      for (let k = 0; k < rightPart.length; k++) {
        tempArray[mid + 1 + k] = rightPart[k];
      }

      steps.push({
        id: steps.length,
        type: 'merge',
        description: `Merging sorted subarrays [${left}..${mid}] and [${mid + 1}..${right}] into temp buffer.`,
        pseudocodeLine: 6,
        state: [...arr],
        auxiliary: {
          sortedIndices: [...sortedIndices],
          phase: 'merge',
          tempArray: [...tempArray],
        },
        highlights: {
          activeRange: [left, right],
          indices: [left, right],
        },
        counters: { comparisons, swaps, iterations, arrayAccesses },
      });

      let i = 0;
      let j = 0;
      let k = left;

      while (i < leftPart.length && j < rightPart.length) {
        comparisons++;
        arrayAccesses += 2;

        steps.push({
          id: steps.length,
          type: 'compare',
          description: `Comparing left element ${leftPart[i]} with right element ${rightPart[j]}.`,
          pseudocodeLine: 7,
          state: [...arr],
          auxiliary: {
            sortedIndices: [...sortedIndices],
            phase: 'merge',
            tempArray: [...tempArray],
          },
          highlights: {
            activeRange: [left, right],
            indices: [k],
          },
          counters: { comparisons, swaps, iterations, arrayAccesses },
        });

        if (leftPart[i] <= rightPart[j]) {
          arr[k] = leftPart[i];
          swaps++;
          arrayAccesses++;
          tempArray[k] = null;
          i++;
        } else {
          arr[k] = rightPart[j];
          swaps++;
          arrayAccesses++;
          tempArray[k] = null;
          j++;
        }

        steps.push({
          id: steps.length,
          type: 'insert',
          description: `Placed ${arr[k]} into position [${k}].`,
          pseudocodeLine: 7,
          state: [...arr],
          auxiliary: {
            sortedIndices: [...sortedIndices],
            phase: 'merge',
            tempArray: [...tempArray],
          },
          highlights: {
            activeRange: [left, right],
            indices: [k],
          },
          counters: { comparisons, swaps, iterations, arrayAccesses },
        });

        k++;
      }

      while (i < leftPart.length) {
        arr[k] = leftPart[i];
        swaps++;
        arrayAccesses++;
        tempArray[k] = null;

        steps.push({
          id: steps.length,
          type: 'insert',
          description: `Copying remaining left element ${leftPart[i]} into position [${k}].`,
          pseudocodeLine: 7,
          state: [...arr],
          auxiliary: {
            sortedIndices: [...sortedIndices],
            phase: 'merge',
            tempArray: [...tempArray],
          },
          highlights: {
            activeRange: [left, right],
            indices: [k],
          },
          counters: { comparisons, swaps, iterations, arrayAccesses },
        });

        i++;
        k++;
      }

      while (j < rightPart.length) {
        arr[k] = rightPart[j];
        swaps++;
        arrayAccesses++;
        tempArray[k] = null;

        steps.push({
          id: steps.length,
          type: 'insert',
          description: `Copying remaining right element ${rightPart[j]} into position [${k}].`,
          pseudocodeLine: 7,
          state: [...arr],
          auxiliary: {
            sortedIndices: [...sortedIndices],
            phase: 'merge',
            tempArray: [...tempArray],
          },
          highlights: {
            activeRange: [left, right],
            indices: [k],
          },
          counters: { comparisons, swaps, iterations, arrayAccesses },
        });

        j++;
        k++;
      }
    };

    const divideAndConquer = (left: number, right: number) => {
      if (left >= right) return;

      const mid = Math.floor((left + right) / 2);

      steps.push({
        id: steps.length,
        type: 'split',
        description: `Dividing range [${left}..${right}] into [${left}..${mid}] and [${mid + 1}..${right}].`,
        pseudocodeLine: 3,
        state: [...arr],
        auxiliary: {
          sortedIndices: [...sortedIndices],
          phase: 'split',
        },
        highlights: {
          activeRange: [left, right],
          indices: [mid],
        },
        counters: { comparisons, swaps, iterations, arrayAccesses },
      });

      divideAndConquer(left, mid);
      divideAndConquer(mid + 1, right);
      merge(left, mid, right);
    };

    divideAndConquer(0, n - 1);

    steps.push({
      id: steps.length,
      type: 'complete',
      description: `Merge Sort completed. All subarrays merged into final sorted array.`,
      pseudocodeLine: 6,
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
