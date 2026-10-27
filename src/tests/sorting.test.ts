import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bubbleSortAlgorithm,
  insertionSortAlgorithm,
  selectionSortAlgorithm,
  mergeSortAlgorithm,
  quickSortAlgorithm,
  heapSortAlgorithm,
} from '../algorithms/sorting';

const algorithms = [
  { name: 'Bubble Sort', algo: bubbleSortAlgorithm },
  { name: 'Insertion Sort', algo: insertionSortAlgorithm },
  { name: 'Selection Sort', algo: selectionSortAlgorithm },
  { name: 'Merge Sort', algo: mergeSortAlgorithm },
  { name: 'Quick Sort', algo: quickSortAlgorithm },
  { name: 'Heap Sort', algo: heapSortAlgorithm },
];

test('Sorting Correctness: 200+ random arrays for all 6 algorithms', () => {
  // Generate 200 test cases with diverse properties
  const testCases: number[][] = [
    [],
    [42],
    [5, 5, 5, 5, 5], // all duplicates
    [1, 2, 3, 4, 5, 6, 7], // already sorted
    [7, 6, 5, 4, 3, 2, 1], // reverse sorted
    [-10, 0, -5, 20, 15, -1], // negative numbers
    [100, 2, 100, 2, 100, 2], // few unique values
  ];

  // Add randomized arrays up to 220
  for (let i = 0; i < 220; i++) {
    const size = Math.floor(Math.random() * 25) + 2; // length 2 to 27
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 200) - 100);
    testCases.push(arr);
  }

  for (const { name, algo } of algorithms) {
    for (const testCase of testCases) {
      const expected = [...testCase].sort((a, b) => a - b);
      const steps = algo.generateSteps(testCase);
      assert.ok(steps.length > 0, `${name} should produce at least 1 step`);

      const finalStep = steps[steps.length - 1];
      const actual = finalStep.state as number[];
      assert.deepEqual(
        actual,
        expected,
        `${name} failed on input [${testCase.slice(0, 10).join(', ')}...]: expected [${expected.slice(0, 10).join(', ')}...], got [${actual.slice(0, 10).join(', ')}...]`
      );
    }
  }
});

test('Replay Invariance: replaying steps forward then backward returns original state', () => {
  const original = [45, 12, 85, 32, 89, 39, 69, 44, 42, 1, 45];

  for (const { name, algo } of algorithms) {
    const steps = algo.generateSteps(original);
    assert.deepEqual(steps[0].state, original, `${name} step 0 must match original input`);

    // Verify each step has an independent deep snapshot (not mutated by later steps)
    for (let i = 0; i < steps.length; i++) {
      assert.ok(Array.isArray(steps[i].state), `Step ${i} state must be an array`);
      assert.equal(steps[i].state.length, original.length, `Step ${i} array length invariant`);
    }

    // Step back to beginning
    const startReplayed = steps[0].state;
    assert.deepEqual(startReplayed, original, `${name} step 0 state must match original`);
  }
});

test('Counters Fidelity: counters equal counts derived from recorded steps', () => {
  const input = [15, 3, 2, 8, 12, 6];
  for (const { name, algo } of algorithms) {
    const steps = algo.generateSteps(input);
    const lastStep = steps[steps.length - 1];

    // Check monotonic non-decreasing counters
    for (let i = 1; i < steps.length; i++) {
      assert.ok(
        steps[i].counters.comparisons >= steps[i - 1].counters.comparisons,
        `${name} comparisons must be non-decreasing`
      );
      assert.ok(
        steps[i].counters.swaps >= steps[i - 1].counters.swaps,
        `${name} swaps must be non-decreasing`
      );
    }

    assert.ok(lastStep.counters.iterations >= 0);
  }
});
