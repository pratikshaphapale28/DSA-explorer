import type { AlgorithmDefinition, Step } from '../../engine/types';

export interface StackQueueState {
  items: (number | string)[];
  capacity: number;
  frontIndex?: number;
  rearIndex?: number;
  isFull?: boolean;
  isEmpty?: boolean;
  message?: string;
  peekValue?: number | string | null;
}

export interface ParenthesesAuxiliary {
  expression: string;
  currentIndex: number;
  currentChar: string;
  stack: string[];
  isBalanced: boolean | null;
  error?: string;
}

/**
 * Stack Step Generator
 */
export const generateStackSteps = (
  initialItems: (number | string)[],
  capacity: number,
  action: { type: 'push' | 'pop' | 'peek'; value?: number | string }
): Step<StackQueueState, { action: string }>[] => {
  const steps: Step<StackQueueState, { action: string }>[] = [];
  const items = [...initialItems];

  const baseCounters = {
    comparisons: 0,
    swaps: 0,
    iterations: 0,
    arrayAccesses: items.length,
  };

  if (action.type === 'push') {
    if (items.length >= capacity) {
      steps.push({
        id: 0,
        type: 'highlight',
        description: `STACK OVERFLOW! Cannot push ${action.value}. Current size ${items.length} equals maximum capacity ${capacity}.`,
        pseudocodeLine: 2,
        state: { items: [...items], capacity, isFull: true, message: 'Stack Overflow' },
        auxiliary: { action: 'overflow' },
        highlights: {},
        counters: { ...baseCounters, comparisons: 1 },
      });
      return steps;
    }

    const val = action.value!;
    items.push(val);
    steps.push({
      id: 0,
      type: 'push',
      description: `PUSH: Added element "${val}" to top of stack (Index ${items.length - 1}).`,
      pseudocodeLine: 3,
      state: { items: [...items], capacity, isFull: items.length === capacity },
      auxiliary: { action: 'push' },
      highlights: { indices: [items.length - 1] },
      counters: { ...baseCounters, arrayAccesses: baseCounters.arrayAccesses + 1 },
    });
  } else if (action.type === 'pop') {
    if (items.length === 0) {
      steps.push({
        id: 0,
        type: 'highlight',
        description: `STACK UNDERFLOW! Cannot pop from an empty stack.`,
        pseudocodeLine: 5,
        state: { items: [], capacity, isEmpty: true, message: 'Stack Underflow' },
        auxiliary: { action: 'underflow' },
        highlights: {},
        counters: { ...baseCounters, comparisons: 1 },
      });
      return steps;
    }

    const popped = items.pop()!;
    const nextTop = items.length > 0 ? items[items.length - 1] : null;
    const nextTopMsg = nextTop !== null ? `Next top is ${nextTop}` : 'Stack is empty';
    steps.push({
      id: 0,
      type: 'pop',
      description: `POP: Removed element "${popped}" from top of stack. ${nextTopMsg}.`,
      pseudocodeLine: 6,
      state: { items: [...items], capacity, isEmpty: items.length === 0 },
      auxiliary: { action: 'pop' },
      highlights: {},
      counters: { ...baseCounters, arrayAccesses: baseCounters.arrayAccesses + 1 },
    });
  } else if (action.type === 'peek') {
    if (items.length === 0) {
      steps.push({
        id: 0,
        type: 'peek',
        description: `PEEK: Stack is empty. Top is null.`,
        pseudocodeLine: 7,
        state: { items: [], capacity, isEmpty: true, peekValue: null },
        auxiliary: { action: 'peek' },
        highlights: {},
        counters: baseCounters,
      });
    } else {
      const topVal = items[items.length - 1];
      steps.push({
        id: 0,
        type: 'peek',
        description: `PEEK: Top element is "${topVal}" at index ${items.length - 1}.`,
        pseudocodeLine: 8,
        state: { items: [...items], capacity, peekValue: topVal },
        auxiliary: { action: 'peek' },
        highlights: { indices: [items.length - 1] },
        counters: { ...baseCounters, arrayAccesses: baseCounters.arrayAccesses + 1 },
      });
    }
  }

  return steps;
};

/**
 * Linear Queue Step Generator
 */
export const generateQueueSteps = (
  initialItems: (number | string)[],
  capacity: number,
  action: { type: 'enqueue' | 'dequeue' | 'front'; value?: number | string }
): Step<StackQueueState, { action: string }>[] => {
  const steps: Step<StackQueueState, { action: string }>[] = [];
  const items = [...initialItems];

  const baseCounters = {
    comparisons: 0,
    swaps: 0,
    iterations: 0,
    arrayAccesses: items.length,
  };

  if (action.type === 'enqueue') {
    if (items.length >= capacity) {
      steps.push({
        id: 0,
        type: 'highlight',
        description: `QUEUE OVERFLOW! Cannot enqueue ${action.value}. Queue is full (${items.length}/${capacity}).`,
        pseudocodeLine: 2,
        state: { items: [...items], capacity, isFull: true, message: 'Queue Overflow' },
        auxiliary: { action: 'overflow' },
        highlights: {},
        counters: { ...baseCounters, comparisons: 1 },
      });
      return steps;
    }

    const val = action.value!;
    items.push(val);
    steps.push({
      id: 0,
      type: 'enqueue',
      description: `ENQUEUE: Added element "${val}" at rear of queue (index ${items.length - 1}).`,
      pseudocodeLine: 3,
      state: { items: [...items], capacity, isFull: items.length === capacity },
      auxiliary: { action: 'enqueue' },
      highlights: { indices: [items.length - 1] },
      counters: { ...baseCounters, arrayAccesses: baseCounters.arrayAccesses + 1 },
    });
  } else if (action.type === 'dequeue') {
    if (items.length === 0) {
      steps.push({
        id: 0,
        type: 'highlight',
        description: `QUEUE UNDERFLOW! Cannot dequeue from an empty queue.`,
        pseudocodeLine: 5,
        state: { items: [], capacity, isEmpty: true, message: 'Queue Underflow' },
        auxiliary: { action: 'underflow' },
        highlights: {},
        counters: { ...baseCounters, comparisons: 1 },
      });
      return steps;
    }

    const dequeued = items.shift()!;
    steps.push({
      id: 0,
      type: 'dequeue',
      description: `DEQUEUE: Removed front element "${dequeued}" (FIFO). New front is "${items[0] ?? 'Empty'}".`,
      pseudocodeLine: 6,
      state: { items: [...items], capacity, isEmpty: items.length === 0 },
      auxiliary: { action: 'dequeue' },
      highlights: {},
      counters: { ...baseCounters, arrayAccesses: baseCounters.arrayAccesses + 1 },
    });
  } else if (action.type === 'front') {
    if (items.length === 0) {
      steps.push({
        id: 0,
        type: 'peek',
        description: `FRONT: Queue is empty. Front is null.`,
        pseudocodeLine: 7,
        state: { items: [], capacity, isEmpty: true, peekValue: null },
        auxiliary: { action: 'front' },
        highlights: {},
        counters: baseCounters,
      });
    } else {
      const frontVal = items[0];
      steps.push({
        id: 0,
        type: 'peek',
        description: `FRONT: Front element is "${frontVal}" (next to be dequeued).`,
        pseudocodeLine: 8,
        state: { items: [...items], capacity, peekValue: frontVal },
        auxiliary: { action: 'front' },
        highlights: { indices: [0] },
        counters: { ...baseCounters, arrayAccesses: baseCounters.arrayAccesses + 1 },
      });
    }
  }

  return steps;
};

/**
 * Circular Queue Step Generator
 */
export interface CircularQueueState {
  buffer: (number | string | null)[];
  capacity: number;
  front: number;
  rear: number;
  count: number;
  message?: string;
}

export const generateCircularQueueSteps = (
  current: CircularQueueState,
  action: { type: 'enqueue' | 'dequeue'; value?: number | string }
): Step<CircularQueueState, { action: string }>[] => {
  const steps: Step<CircularQueueState, { action: string }>[] = [];
  const buffer = [...current.buffer];
  const cap = current.capacity;
  let front = current.front;
  let rear = current.rear;
  let count = current.count;

  if (action.type === 'enqueue') {
    if (count >= cap) {
      steps.push({
        id: 0,
        type: 'highlight',
        description: `CIRCULAR QUEUE FULL! Front=${front}, Rear=${rear}, Count=${count}/${cap}. (rear + 1) % cap would overwrite unread front!`,
        pseudocodeLine: 2,
        state: { buffer, capacity: cap, front, rear, count, message: 'Circular Queue Full' },
        auxiliary: { action: 'overflow' },
        highlights: { indices: [rear] },
        counters: { comparisons: 1, swaps: 0, iterations: 0, arrayAccesses: count },
      });
      return steps;
    }

    // Advance rear modulo cap
    rear = (rear + 1) % cap;
    buffer[rear] = action.value!;
    count++;

    if (front === -1) front = rear;

    steps.push({
      id: 0,
      type: 'enqueue',
      description: `ENQUEUE: Inserted "${action.value}" at rear index (${rear}). Formula: rear = (${current.rear} + 1) % ${cap} = ${rear}. Count is now ${count}/${cap}.`,
      pseudocodeLine: 3,
      state: { buffer, capacity: cap, front, rear, count },
      auxiliary: { action: 'enqueue' },
      highlights: { indices: [rear] },
      counters: { comparisons: 1, swaps: 0, iterations: 1, arrayAccesses: count },
    });
  } else if (action.type === 'dequeue') {
    if (count === 0) {
      steps.push({
        id: 0,
        type: 'highlight',
        description: `CIRCULAR QUEUE EMPTY! Front=${front}, Rear=${rear}. Nothing to dequeue.`,
        pseudocodeLine: 5,
        state: { buffer, capacity: cap, front, rear, count: 0, message: 'Circular Queue Empty' },
        auxiliary: { action: 'underflow' },
        highlights: {},
        counters: { comparisons: 1, swaps: 0, iterations: 0, arrayAccesses: 0 },
      });
      return steps;
    }

    const dequeued = buffer[front];
    buffer[front] = null;
    count--;

    const oldFront = front;
    if (count === 0) {
      front = -1;
      rear = -1;
    } else {
      front = (front + 1) % cap;
    }

    steps.push({
      id: 0,
      type: 'dequeue',
      description: `DEQUEUE: Removed element "${dequeued}" from front index ${oldFront}. New front index is ${front}. Count is now ${count}/${cap}.`,
      pseudocodeLine: 6,
      state: { buffer, capacity: cap, front, rear, count },
      auxiliary: { action: 'dequeue' },
      highlights: { indices: oldFront >= 0 ? [oldFront] : [] },
      counters: { comparisons: 1, swaps: 0, iterations: 1, arrayAccesses: count },
    });
  }

  return steps;
};

/**
 * Balanced Parentheses Demo Step Generator
 */
export const parenthesesCheckerAlgorithm: AlgorithmDefinition<
  string,
  string[],
  ParenthesesAuxiliary
> = {
  id: 'parentheses_check',
  name: 'Balanced Parentheses Checker (Stack Demo)',
  category: 'stackQueue',
  categoryLabel: 'Stack & Queue',
  summary: 'Uses a LIFO Stack to determine whether brackets in an expression are properly nested and balanced.',
  complexity: {
    best: 'O(1)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(n)',
    explanation: 'Scans each character once in O(n) time. Uses up to O(n) auxiliary stack space for opening brackets.',
    realWorldAnalogy: 'Compiler syntax checking: every opened tag, brace or quotation mark must be closed in reverse order of opening.',
  },
  pseudocode: [
    'procedure isBalanced(expr):',
    '  stack = new Stack()',
    '  for each char in expr:',
    '    if char in "([{": stack.push(char)',
    '    else if char in ")]}":',
    '      if stack.isEmpty(): return false',
    '      top = stack.pop()',
    '      if not match(top, char): return false',
    '  return stack.isEmpty()',
  ],
  defaultInput: '{ [ ( ) ] }',
  generateSteps: (expr: string): Step<string[], ParenthesesAuxiliary>[] => {
    const steps: Step<string[], ParenthesesAuxiliary>[] = [];
    const stack: string[] = [];
    const chars = expr.replace(/\s+/g, '').split('');
    const n = chars.length;

    let comparisons = 0;
    let iterations = 0;
    let arrayAccesses = 0;

    steps.push({
      id: 0,
      type: 'start',
      description: `Starting Balanced Parentheses check on expression "${chars.join('')}". Initialized empty Stack.`,
      pseudocodeLine: 2,
      state: [],
      auxiliary: {
        expression: chars.join(''),
        currentIndex: -1,
        currentChar: '',
        stack: [],
        isBalanced: null,
      },
      highlights: {},
      counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
    });

    const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
    let balanced = true;
    let failureReason = '';

    for (let i = 0; i < n; i++) {
      iterations++;
      arrayAccesses++;
      const ch = chars[i];

      if (ch === '(' || ch === '[' || ch === '{') {
        stack.push(ch);
        steps.push({
          id: steps.length,
          type: 'push',
          description: `Character "${ch}" at index ${i} is an opening bracket. PUSHing onto stack. Current stack height: ${stack.length}.`,
          pseudocodeLine: 4,
          state: [...stack],
          auxiliary: {
            expression: chars.join(''),
            currentIndex: i,
            currentChar: ch,
            stack: [...stack],
            isBalanced: null,
          },
          highlights: { indices: [stack.length - 1] },
          counters: { comparisons, swaps: 0, iterations, arrayAccesses },
        });
      } else if (ch === ')' || ch === ']' || ch === '}') {
        comparisons++;
        if (stack.length === 0) {
          balanced = false;
          failureReason = `Closing bracket "${ch}" found at index ${i}, but the stack is empty! No matching opening bracket.`;
          steps.push({
            id: steps.length,
            type: 'not_found',
            description: failureReason,
            pseudocodeLine: 6,
            state: [],
            auxiliary: {
              expression: chars.join(''),
              currentIndex: i,
              currentChar: ch,
              stack: [],
              isBalanced: false,
              error: failureReason,
            },
            highlights: {},
            counters: { comparisons, swaps: 0, iterations, arrayAccesses },
          });
          break;
        }

        const top = stack.pop()!;
        comparisons++;
        const expectedOpening = pairs[ch];

        if (top !== expectedOpening) {
          balanced = false;
          failureReason = `Mismatched brackets! Encountered "${ch}" at index ${i}, but top of stack was "${top}" (expected "${expectedOpening}").`;
          steps.push({
            id: steps.length,
            type: 'not_found',
            description: failureReason,
            pseudocodeLine: 8,
            state: [...stack],
            auxiliary: {
              expression: chars.join(''),
              currentIndex: i,
              currentChar: ch,
              stack: [...stack],
              isBalanced: false,
              error: failureReason,
            },
            highlights: {},
            counters: { comparisons, swaps: 0, iterations, arrayAccesses },
          });
          break;
        } else {
          steps.push({
            id: steps.length,
            type: 'pop',
            description: `Closing bracket "${ch}" correctly matches top of stack "${top}". POPped "${top}".`,
            pseudocodeLine: 7,
            state: [...stack],
            auxiliary: {
              expression: chars.join(''),
              currentIndex: i,
              currentChar: ch,
              stack: [...stack],
              isBalanced: null,
            },
            highlights: {},
            counters: { comparisons, swaps: 0, iterations, arrayAccesses },
          });
        }
      }
    }

    if (balanced && stack.length > 0) {
      balanced = false;
      failureReason = `Reached end of expression, but ${stack.length} opening bracket(s) remain unclosed on the stack: [${stack.join(', ')}].`;
      steps.push({
        id: steps.length,
        type: 'not_found',
        description: failureReason,
        pseudocodeLine: 9,
        state: [...stack],
        auxiliary: {
          expression: chars.join(''),
          currentIndex: n,
          currentChar: '',
          stack: [...stack],
          isBalanced: false,
          error: failureReason,
        },
        highlights: {},
        counters: { comparisons, swaps: 0, iterations, arrayAccesses },
      });
    }

    steps.push({
      id: steps.length,
      type: balanced ? 'found' : 'complete',
      description: balanced
        ? `Verification SUCCESS: Expression "${chars.join('')}" is fully balanced! All brackets matched correctly.`
        : `Verification FAILED: Expression is NOT balanced. ${failureReason}`,
      pseudocodeLine: 9,
      state: [...stack],
      auxiliary: {
        expression: chars.join(''),
        currentIndex: n,
        currentChar: '',
        stack: [...stack],
        isBalanced: balanced,
      },
      highlights: {},
      counters: { comparisons, swaps: 0, iterations, arrayAccesses },
    });

    return steps;
  },
};
