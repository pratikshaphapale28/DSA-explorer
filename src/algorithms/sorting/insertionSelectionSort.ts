import type { AlgorithmDefinition, Step } from '../../engine/types';
import type { SortingAuxiliary } from './bubbleSort';

export const insertionSortAlgorithm: AlgorithmDefinition<number[], number[], SortingAuxiliary> = {
  id: 'insertion_sort',
  name: 'Insertion Sort',
  category: 'sorting',
  categoryLabel: 'Sorting',
  summary: 'Builds the sorted array one item at a time by repeatedly taking the next element and inserting it into its correct position among previously examined elements.',
  complexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    explanation: 'Best case O(n) occurs when the array is nearly or already sorted. Worst case occurs on reverse order.',
    realWorldAnalogy: 'Sorting playing cards in your hand: taking each new card and sliding it into the sorted fan of cards in your left hand.',
  },
  pseudocode: [
    'procedure insertionSort(A):',
    '  for i from 1 to n - 1:',
    '    key = A[i]',
    '    j = i - 1',
    '    while j >= 0 and A[j] > key:',
    '      A[j + 1] = A[j]',
    '      j = j - 1',
    '    A[j + 1] = key',
  ],
  defaultInput: [38, 27, 43, 3, 9, 82, 10],
  generateSteps: (input: number[]): Step<number[], SortingAuxiliary>[] => {
    const steps: Step<number[], SortingAuxiliary>[] = [];
    const arr = [...input];
    const n = arr.length;
    const sortedIndices: number[] = [0];

    let comparisons = 0;
    let swaps = 0;
    let iterations = 0;
    let arrayAccesses = 0;

    steps.push({
      id: 0,
      type: 'start',
      description: `Starting Insertion Sort. Subarray at [0] (${arr[0]}) is trivially sorted.`,
      pseudocodeLine: 1,
      state: [...arr],
      auxiliary: { sortedIndices: [0] },
      highlights: { indices: [0] },
      counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
    });

    for (let i = 1; i < n; i++) {
      iterations++;
      const key = arr[i];
      let j = i - 1;
      arrayAccesses++;

      steps.push({
        id: steps.length,
        type: 'highlight',
        description: `Selecting key = ${key} at index ${i} to insert into sorted prefix [0..${i - 1}].`,
        pseudocodeLine: 3,
        state: [...arr],
        auxiliary: { sortedIndices: [...sortedIndices] },
        highlights: { indices: [i], activeRange: [0, i] },
        counters: { comparisons, swaps, iterations, arrayAccesses },
      });

      while (j >= 0) {
        comparisons++;
        arrayAccesses++;

        steps.push({
          id: steps.length,
          type: 'compare',
          description: `Comparing sorted element A[${j}] (${arr[j]}) with key (${key}).`,
          pseudocodeLine: 5,
          state: [...arr],
          auxiliary: { sortedIndices: [...sortedIndices] },
          highlights: { indices: [j, j + 1] },
          counters: { comparisons, swaps, iterations, arrayAccesses },
        });

        if (arr[j] > key) {
          arr[j + 1] = arr[j];
          swaps++; // assignment/shift
          arrayAccesses++;

          steps.push({
            id: steps.length,
            type: 'swap',
            description: `${arr[j]} > ${key}. Shifting ${arr[j]} rightward to index ${j + 1}.`,
            pseudocodeLine: 6,
            state: [...arr],
            auxiliary: { sortedIndices: [...sortedIndices] },
            highlights: { indices: [j, j + 1] },
            counters: { comparisons, swaps, iterations, arrayAccesses },
          });

          j--;
        } else {
          break;
        }
      }

      arr[j + 1] = key;
      arrayAccesses++;
      if (!sortedIndices.includes(i)) sortedIndices.push(i);

      steps.push({
        id: steps.length,
        type: 'insert',
        description: `Inserted key ${key} into position [${j + 1}]. Sorted prefix is now [0..${i}].`,
        pseudocodeLine: 8,
        state: [...arr],
        auxiliary: { sortedIndices: Array.from({ length: i + 1 }, (_, k) => k) },
        highlights: { indices: [j + 1] },
        counters: { comparisons, swaps, iterations, arrayAccesses },
      });
    }

    steps.push({
      id: steps.length,
      type: 'complete',
      description: `Insertion Sort completed. All ${n} elements are sorted.`,
      pseudocodeLine: 8,
      state: [...arr],
      auxiliary: { sortedIndices: Array.from({ length: n }, (_, k) => k) },
      highlights: { indices: [] },
      counters: { comparisons, swaps, iterations, arrayAccesses },
    });

    return steps;
  },
};

export const selectionSortAlgorithm: AlgorithmDefinition<number[], number[], SortingAuxiliary> = {
  id: 'selection_sort',
  name: 'Selection Sort',
  category: 'sorting',
  categoryLabel: 'Sorting',
  summary: 'Divides the list into a sorted and unsorted region. Repeatedly finds the minimum element from the unsorted region and swaps it with the leftmost unsorted element.',
  complexity: {
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    explanation: 'Always performs n(n-1)/2 comparisons regardless of initial array ordering, but performs at most n-1 swaps.',
    realWorldAnalogy: 'Selecting the smallest rock from a pile, placing it in a neat line, and repeating for the next smallest.',
  },
  pseudocode: [
    'procedure selectionSort(A):',
    '  for i from 0 to n - 2:',
    '    minIdx = i',
    '    for j from i + 1 to n - 1:',
    '      if A[j] < A[minIdx]: minIdx = j',
    '    if minIdx != i:',
    '      swap(A[i], A[minIdx])',
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
      description: `Starting Selection Sort on ${n} elements.`,
      pseudocodeLine: 1,
      state: [...arr],
      auxiliary: { sortedIndices: [] },
      highlights: { indices: [] },
      counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
    });

    for (let i = 0; i < n - 1; i++) {
      iterations++;
      let minIdx = i;

      steps.push({
        id: steps.length,
        type: 'highlight',
        description: `Pass ${i + 1}: Searching for the minimum element in unsorted range [${i}..${n - 1}]. Initial candidate is at [${i}] (${arr[i]}).`,
        pseudocodeLine: 3,
        state: [...arr],
        auxiliary: { sortedIndices: [...sortedIndices] },
        highlights: { indices: [i], activeRange: [i, n - 1] },
        counters: { comparisons, swaps, iterations, arrayAccesses },
      });

      for (let j = i + 1; j < n; j++) {
        comparisons++;
        arrayAccesses += 2;

        steps.push({
          id: steps.length,
          type: 'compare',
          description: `Comparing candidate min (${arr[minIdx]} at [${minIdx}]) with A[${j}] (${arr[j]}).`,
          pseudocodeLine: 5,
          state: [...arr],
          auxiliary: { sortedIndices: [...sortedIndices] },
          highlights: { indices: [minIdx, j], activeRange: [i, n - 1] },
          counters: { comparisons, swaps, iterations, arrayAccesses },
        });

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          steps.push({
            id: steps.length,
            type: 'highlight',
            description: `New minimum found: ${arr[minIdx]} at index ${minIdx}.`,
            pseudocodeLine: 5,
            state: [...arr],
            auxiliary: { sortedIndices: [...sortedIndices] },
            highlights: { indices: [minIdx], activeRange: [i, n - 1] },
            counters: { comparisons, swaps, iterations, arrayAccesses },
          });
        }
      }

      if (minIdx !== i) {
        swaps++;
        arrayAccesses += 2;
        const temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;

        steps.push({
          id: steps.length,
          type: 'swap',
          description: `Swapping minimum element ${arr[i]} into sorted position [${i}] with ${temp} at [${minIdx}].`,
          pseudocodeLine: 7,
          state: [...arr],
          auxiliary: { sortedIndices: [...sortedIndices] },
          highlights: { indices: [i, minIdx] },
          counters: { comparisons, swaps, iterations, arrayAccesses },
        });
      }

      sortedIndices.push(i);
      steps.push({
        id: steps.length,
        type: 'sorted',
        description: `Index ${i} (${arr[i]}) is now permanently sorted.`,
        pseudocodeLine: 7,
        state: [...arr],
        auxiliary: { sortedIndices: [...sortedIndices] },
        highlights: { indices: [i] },
        counters: { comparisons, swaps, iterations, arrayAccesses },
      });
    }

    sortedIndices.push(n - 1);
    steps.push({
      id: steps.length,
      type: 'complete',
      description: `Selection Sort completed. All elements sorted with ${swaps} swaps.`,
      pseudocodeLine: 7,
      state: [...arr],
      auxiliary: { sortedIndices: Array.from({ length: n }, (_, k) => k) },
      highlights: { indices: [] },
      counters: { comparisons, swaps, iterations, arrayAccesses },
    });

    return steps;
  },
};
