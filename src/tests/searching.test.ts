import test from 'node:test';
import assert from 'node:assert/strict';
import { linearSearchAlgorithm } from '../algorithms/searching/linearSearch';

test('Linear Search: finds target in standard array', () => {
  const array = [10, 20, 30, 40, 50];
  const steps = linearSearchAlgorithm.generateSteps({ array, target: 30 });

  assert.ok(steps.length > 0, 'Steps should not be empty');
  const foundStep = steps.find(s => s.type === 'found');
  assert.ok(foundStep, 'Should have a found step');
  assert.equal(foundStep?.auxiliary?.foundIndex, 2);
  assert.equal(foundStep?.counters.comparisons, 3);
});

test('Linear Search: finds target at index 0 (best case O(1))', () => {
  const array = [99, 12, 34, 56];
  const steps = linearSearchAlgorithm.generateSteps({ array, target: 99 });
  const foundStep = steps.find(s => s.type === 'found');
  assert.ok(foundStep);
  assert.equal(foundStep?.auxiliary?.foundIndex, 0);
  assert.equal(foundStep?.counters.comparisons, 1);
});

test('Linear Search: handles target not found', () => {
  const array = [5, 10, 15];
  const steps = linearSearchAlgorithm.generateSteps({ array, target: 999 });
  const notFoundStep = steps.find(s => s.type === 'not_found');
  assert.ok(notFoundStep);
  assert.equal(notFoundStep?.auxiliary?.foundIndex, null);
  assert.equal(notFoundStep?.counters.comparisons, 3);
});

test('Linear Search: handles empty array safely', () => {
  const steps = linearSearchAlgorithm.generateSteps({ array: [], target: 42 });
  const notFoundStep = steps.find(s => s.type === 'not_found');
  assert.ok(notFoundStep);
  assert.equal(notFoundStep?.auxiliary?.foundIndex, null);
});

test('Linear Search: state immutability across steps', () => {
  const original = [7, 3, 9, 1];
  const copy = [...original];
  const steps = linearSearchAlgorithm.generateSteps({ array: copy, target: 9 });

  for (const step of steps) {
    assert.deepEqual(step.state, original, 'State snapshot must remain identical to original');
  }
});

import { binarySearchAlgorithm } from '../algorithms/searching/binarySearch';

test('Binary Search: finds target at mid, left half, right half', () => {
  const arr = [10, 20, 30, 40, 50, 60, 70];

  // Target at exact middle (40, idx 3)
  const stepsMid = binarySearchAlgorithm.generateSteps({ array: arr, target: 40 });
  const midFound = stepsMid.find(s => s.type === 'found');
  assert.ok(midFound);
  assert.equal(midFound?.auxiliary?.foundIndex, 3);
  assert.equal(midFound?.counters.comparisons, 1);

  // Target in left half (20, idx 1)
  const stepsLeft = binarySearchAlgorithm.generateSteps({ array: arr, target: 20 });
  const leftFound = stepsLeft.find(s => s.type === 'found');
  assert.ok(leftFound);
  assert.equal(leftFound?.auxiliary?.foundIndex, 1);

  // Target in right half (70, idx 6)
  const stepsRight = binarySearchAlgorithm.generateSteps({ array: arr, target: 70 });
  const rightFound = stepsRight.find(s => s.type === 'found');
  assert.ok(rightFound);
  assert.equal(rightFound?.auxiliary?.foundIndex, 6);
});

test('Binary Search: returns not_found for absent elements', () => {
  const arr = [2, 4, 6, 8, 10];
  const steps = binarySearchAlgorithm.generateSteps({ array: arr, target: 5 });
  const notFound = steps.find(s => s.type === 'not_found');
  assert.ok(notFound);
  assert.equal(notFound?.auxiliary?.foundIndex, null);
});

test('Binary Search: handles empty array', () => {
  const steps = binarySearchAlgorithm.generateSteps({ array: [], target: 100 });
  const notFound = steps.find(s => s.type === 'not_found');
  assert.ok(notFound);
});

test('Binary Search: 200+ randomized trials compared against Array.prototype.indexOf', () => {
  for (let trial = 0; trial < 220; trial++) {
    const size = Math.floor(Math.random() * 30) + 1;
    const raw = Array.from({ length: size }, () => Math.floor(Math.random() * 200) - 100);
    // Sort array so it's strictly ordered for binary search
    const sorted = [...raw].sort((a, b) => a - b);

    // Pick target: 50% chance in array, 50% chance random
    const target =
      trial % 2 === 0
        ? sorted[Math.floor(Math.random() * sorted.length)]
        : Math.floor(Math.random() * 300) - 150;

    const steps = binarySearchAlgorithm.generateSteps({ array: sorted, target });
    const lastStep = steps[steps.length - 1];
    const foundIdx = lastStep.auxiliary?.foundIndex;

    const expectedFound = sorted.includes(target);
    if (expectedFound) {
      assert.ok(foundIdx !== null && foundIdx !== undefined && foundIdx >= 0, `Target ${target} should be found`);
      assert.equal(sorted[foundIdx], target, `Element at index ${foundIdx} must equal ${target}`);
    } else {
      assert.equal(foundIdx, null, `Target ${target} should not be found`);
    }
  }
});

