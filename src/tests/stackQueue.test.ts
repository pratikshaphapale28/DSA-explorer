import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateStackSteps,
  generateQueueSteps,
  generateCircularQueueSteps,
  parenthesesCheckerAlgorithm,
  type CircularQueueState,
} from '../algorithms/stackQueue/stackQueueEngine';

test('Stack: LIFO ordering and overflow / underflow guards', () => {
  // Push up to capacity 3
  let items: (number | string)[] = [];
  let steps = generateStackSteps(items, 3, { type: 'push', value: 'A' });
  items = steps[0].state.items;
  assert.deepEqual(items, ['A']);

  steps = generateStackSteps(items, 3, { type: 'push', value: 'B' });
  items = steps[0].state.items;
  assert.deepEqual(items, ['A', 'B']);

  steps = generateStackSteps(items, 3, { type: 'push', value: 'C' });
  items = steps[0].state.items;
  assert.deepEqual(items, ['A', 'B', 'C']);

  // Push on full stack -> Overflow
  steps = generateStackSteps(items, 3, { type: 'push', value: 'D' });
  assert.equal(steps[0].state.isFull, true);
  assert.equal(steps[0].state.message, 'Stack Overflow');

  // Pop -> LIFO order ('C', then 'B', then 'A')
  steps = generateStackSteps(items, 3, { type: 'pop' });
  items = steps[0].state.items;
  assert.deepEqual(items, ['A', 'B']);
  assert.match(steps[0].description, /Next top is B/);

  steps = generateStackSteps(items, 3, { type: 'pop' });
  items = steps[0].state.items;
  assert.deepEqual(items, ['A']);
  assert.match(steps[0].description, /Next top is A/);

  steps = generateStackSteps(items, 3, { type: 'pop' });
  items = steps[0].state.items;
  assert.deepEqual(items, []);
  assert.match(steps[0].description, /Stack is empty/);

  // Exact user scenario: popping 45 from [10, 20, 30, 45] must say next top is 30
  const pop45Steps = generateStackSteps([10, 20, 30, 45], 6, { type: 'pop' });
  assert.equal(pop45Steps[0].description.includes('Next top is 30'), true);

  // Pop on empty stack -> Underflow
  steps = generateStackSteps(items, 3, { type: 'pop' });
  assert.equal(steps[0].state.isEmpty, true);
  assert.equal(steps[0].state.message, 'Stack Underflow');
});

test('Queue: FIFO ordering and overflow / underflow guards', () => {
  let items: (number | string)[] = [];
  // Enqueue 1, 2
  items = generateQueueSteps(items, 2, { type: 'enqueue', value: 10 })[0].state.items;
  items = generateQueueSteps(items, 2, { type: 'enqueue', value: 20 })[0].state.items;
  assert.deepEqual(items, [10, 20]);

  // Enqueue 3 on full queue -> Overflow
  const overflowSteps = generateQueueSteps(items, 2, { type: 'enqueue', value: 30 });
  assert.equal(overflowSteps[0].state.isFull, true);
  assert.equal(overflowSteps[0].state.message, 'Queue Overflow');

  // Dequeue -> 10 removed first (FIFO)
  items = generateQueueSteps(items, 2, { type: 'dequeue' })[0].state.items;
  assert.deepEqual(items, [20]);

  items = generateQueueSteps(items, 2, { type: 'dequeue' })[0].state.items;
  assert.deepEqual(items, []);

  // Dequeue on empty -> Underflow
  const underflowSteps = generateQueueSteps(items, 2, { type: 'dequeue' });
  assert.equal(underflowSteps[0].state.isEmpty, true);
  assert.equal(underflowSteps[0].state.message, 'Queue Underflow');
});

test('Circular Queue: ring modulo wrap-around logic', () => {
  let state: CircularQueueState = {
    buffer: [null, null, null],
    capacity: 3,
    front: -1,
    rear: -1,
    count: 0,
  };

  // Enqueue 3 items to fill ring
  state = generateCircularQueueSteps(state, { type: 'enqueue', value: 'X' })[0].state;
  state = generateCircularQueueSteps(state, { type: 'enqueue', value: 'Y' })[0].state;
  state = generateCircularQueueSteps(state, { type: 'enqueue', value: 'Z' })[0].state;
  assert.equal(state.count, 3);
  assert.equal(state.front, 0);
  assert.equal(state.rear, 2);

  // Dequeue 1 item (frees slot 0)
  state = generateCircularQueueSteps(state, { type: 'dequeue' })[0].state;
  assert.equal(state.count, 2);
  assert.equal(state.front, 1);
  assert.equal(state.buffer[0], null);

  // Enqueue wrapped around to slot 0 (modulo wrap-around: (2 + 1) % 3 = 0)
  state = generateCircularQueueSteps(state, { type: 'enqueue', value: 'W' })[0].state;
  assert.equal(state.count, 3);
  assert.equal(state.rear, 0);
  assert.equal(state.buffer[0], 'W');
});

test('Balanced Parentheses: correctly validates nested bracket expressions', () => {
  const validExpressions = [
    '{ [ ( ) ] }',
    '()[]{}',
    '({[]})',
    '((()))',
  ];

  for (const expr of validExpressions) {
    const steps = parenthesesCheckerAlgorithm.generateSteps(expr);
    const lastStep = steps[steps.length - 1];
    assert.equal(
      lastStep.auxiliary?.isBalanced,
      true,
      `Expected "${expr}" to be balanced`
    );
  }

  const invalidExpressions = [
    '{ [ ( ] ) }', // mismatched order
    '(((',         // unclosed
    ')))',         // early close
    '{ [ ( ) ] }}',// trailing close
  ];

  for (const expr of invalidExpressions) {
    const steps = parenthesesCheckerAlgorithm.generateSteps(expr);
    const lastStep = steps[steps.length - 1];
    assert.equal(
      lastStep.auxiliary?.isBalanced,
      false,
      `Expected "${expr}" to be unbalanced`
    );
  }
});
