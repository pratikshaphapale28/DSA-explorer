# DSA Explorer — Interactive Algorithm Learning Platform

DSA Explorer is a beginner-friendly visual algorithm learning platform built for college students to master Data Structures and Algorithms through interactive, step-by-step visual execution with guaranteed algorithmic correctness.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The platform follows a strict decoupling between algorithm computation and UI rendering. Every algorithm is a pure function emitting precomputed, immutable `Step` snapshots, enabling instant, bug-free bidirectional time travel (step back, scrubber jump, pause/play).

- **Pure Precomputed Step Snapshots**: Rather than asynchronous sleeps (`await delay()`) mutating live variables, algorithms emit snapshot records. This guarantees reversible playback, 0 race conditions, and instant timeline scrubbing.
- **Rendering Strategy**: SVG for Graphs and Trees (clean vector rendering, direct SVG pointer events for dragging nodes/edges, crisp zoom/pan); CSS/Flex div-based bars for Array sorting and searching; DOM grid/slots for Hashing, Stacks, and Queues.
- **Zero External Black-Box Libraries**: All algorithms (BFS, DFS, Dijkstra, BST, AVL rotations, Quick/Merge/Heap sort, Hashing collisions) are custom, verified pure TypeScript implementations.
- **Verification & Unit Tests**: Verified using Node's test runner (`tsx --test`) against 200+ random test cases, reference Bellman-Ford/Dijkstra, AVL balance factor invariants $[-1, 1]$, and forward-backward replay integrity.

---

## 1. Overview & Core Concept

- **What It Does**: Allows students to build or generate data structures (custom graphs, trees, arrays, hash tables, stacks/queues), select algorithms, and step through execution forward and backward with live narration, synchronized pseudocode highlighting, running operation counters, and complexity comparisons.
- **Target Audience**: Computer Science undergraduates, coding bootcamps, and software engineering interview candidates.
- **Key Value**: Demystifies abstract algorithmic concepts through visual intuition, step-by-step real-world explanations, and verified mathematical correctness.

---

## 2. User Experience & Visual Design

### Layout & Information Architecture
```
┌────────────────────────────────────────────────────────────────────────┐
│ Top Bar: Brand "DSA Explorer" · Module Tabs · Theme · Mode (Beg/Adv)   │
├───────────────┬──────────────────────────────────┬─────────────────────┤
│ Left Sidebar  │ Center Stage (Interactive Area)  │ Right Insight Panel │
│ - Data Input  │ - Graph SVG Canvas / Array Bars  │ - Step Narration    │
│ - Presets     │ - Visual Legend (Compare, Swap)  │ - Running Counters  │
│ - Operations  │ - Interactive Nodes / Drag Handles│ - Pseudocode Pointer│
│ - Algorithm   ├──────────────────────────────────┤ - Complexity Card   │
│   Selection   │ Bottom Playback Bar:             │ - Actual vs Big-O   │
│               │ [<<] [<] [Play/Pause] [>] [>>]   │                     │
│               │ Speed: 0.25x-4x | Timeline Scrub │                     │
└───────────────┴──────────────────────────────────┴─────────────────────┘
```

- **Top Bar Contract**: Single brand wordmark (`DSA Explorer`), module links (`Graphs`, `Trees`, `Sorting`, `Stack & Queue`, `Searching`, `Hashing`, `Cheat Sheet`), light/dark toggle, and Beginner/Advanced mode switcher.
- **Center Canvas**: Dedicated interactive visualization stage with custom SVG controls (zoom, reset view, drag nodes, draw edges) and real-time animation.
- **Right Insight Panel**:
  - *Narration Card*: Plain-English description of the current action (e.g. "Relaxing edge (A -> B): 7 < 10, updating distance to 7").
  - *Running Counters*: Tabular comparison counter, swaps/relaxations, iterations, and step $N$ of $Total$.
  - *Pseudocode Highlighter*: Syntax-highlighted code matching algorithm lines with an active execution arrow.
  - *Complexity & Real-World Analogy*: Big-O time and space benchmarks accompanied by relatable real-world metaphors (e.g., Dijkstra as GPS route re-routing).
- **Color Discipline (60-30-10)**:
  - Neutral canvas: Deep slate `#0B0F19` (dark) / Soft clean `#F8FAFC` (light).
  - Semantic highlight accents:
    - `Amber / Orange`: Comparison & Probing
    - `Rose / Red`: Swaps, Unbalanced AVL node, Deletions
    - `Emerald / Green`: Sorted elements, Found targets, Final shortest path
    - `Sky / Indigo`: Current traversal pointer, Queue/Stack elements
    - `Violet`: Pivot element / Partition bounds

---

## 3. Data Model & Architecture

### Core Data Models (`src/engine/types.ts`)

```typescript
export type StepType = 
  | 'compare' | 'swap' | 'visit' | 'enqueue' | 'dequeue' 
  | 'push' | 'pop' | 'relax' | 'rotate' | 'insert' 
  | 'probe' | 'found' | 'not_found' | 'sorted' | 'partition' 
  | 'highlight';

export interface Step<TState = unknown, TAux = unknown> {
  id: number;
  type: StepType;
  description: string;           // Plain English explanation for beginners
  pseudocodeLine: number;        // 1-based index in algorithm pseudocode
  state: TState;                 // Full snapshot copy of data structure state
  auxiliary?: TAux;              // Aux info: { queue, stack, distances, low, mid, high, tree, callStack }
  highlights: {
    indices?: number[];
    nodeIds?: string[];
    edgeIds?: string[];
    activeRange?: [number, number];
  };
  counters: {
    comparisons: number;
    swaps: number;
    iterations: number;
    arrayAccesses: number;
  };
}

export interface AlgorithmMetadata {
  id: string;
  name: string;
  category: 'graph' | 'tree' | 'sorting' | 'stack_queue' | 'searching' | 'hashing';
  timeComplexity: { best: string; average: string; worst: string };
  spaceComplexity: string;
  explanation: string;
  realWorldAnalogy: string;
  pseudocode: string[];
}
```

---

## 4. Planned Folder Structure

```
src/
├── algorithms/
│   ├── graphs/
│   │   ├── bfs.ts
│   │   ├── dfs.ts
│   │   └── dijkstra.ts
│   ├── trees/
│   │   ├── bst.ts
│   │   ├── avl.ts
│   │   └── traversals.ts
│   ├── sorting/
│   │   ├── bubbleSort.ts
│   │   ├── insertionSort.ts
│   │   ├── selectionSort.ts
│   │   ├── mergeSort.ts
│   │   ├── quickSort.ts
│   │   └── heapSort.ts
│   ├── searching/
│   │   ├── linearSearch.ts
│   │   └── binarySearch.ts
│   ├── stackQueue/
│   │   ├── stackOps.ts
│   │   ├── queueOps.ts
│   │   ├── circularQueue.ts
│   │   └── parenthesesDemo.ts
│   └── hashing/
│       ├── chaining.ts
│       ├── linearProbing.ts
│       └── quadraticProbing.ts
├── engine/
│   ├── types.ts                 // Step, AlgorithmMetadata, common interfaces
│   ├── PlayerContext.tsx        // State replay, scrub, speed, step-forward/backward
│   └── useAlgorithmRunner.ts    // Hook binding algorithm generator to playback
├── components/
│   ├── common/                  // Tooltips, Modals, Buttons, Sliders, Badges
│   ├── layout/                  // Header, Sidebar, Stage, InsightPanel, PlaybackBar
│   ├── insight/                 // LiveCounters, PseudocodePanel, ComplexityCard
│   └── modules/
│       ├── graphs/              // SVG Interactive Canvas, Edge/Node editor, Table
│       ├── trees/               // SVG Tree visualizer, Rotation animations
│       ├── sorting/             // Div bar visualizer, side-by-side mode, Heap tree
│       ├── stackQueue/          // Vertical Stack, Horizontal Queue, Circular Ring
│       ├── searching/           // Pointer bars, eliminated range overlays
│       └── hashing/             // Bucket grid, probe collision visualizer
├── pages/
│   ├── LandingPage.tsx          // Welcome hero, 6 module showcase cards, quickstart
│   ├── ModulePage.tsx           // Active algorithm workspace
│   └── CheatSheetPage.tsx       // Big-O summary matrix & interactive filter
├── tests/
│   ├── sorting.test.ts          // 200+ random arrays, edge cases, stability
│   ├── searching.test.ts        // Binary/Linear search correctness & bounds
│   ├── graphs.test.ts           // BFS/DFS & Dijkstra vs reference shortest-path
│   ├── trees.test.ts            // BST inorder sort & AVL balance factors [-1, 1]
│   ├── hashing.test.ts          // Collision resolution, delete tombstones, resizes
│   └── player.test.ts           // Forward/backward step replay fidelity
└── main.tsx
```

---

## 5. Execution Roadmap (8 Planned Phases)

- **Phase 1: Project Setup, Step/Player Engine, Layout Shell, Theme**
  - Initialize app theme, Tailwind CSS tokens, modular layout shell (Header, Sidebar, Stage, Insight Panel, Playback Bar).
  - Implement pure `Step` snapshot player engine with play, pause, next, prev, scrub slider, and speed control ($0.25\times$–$4\times$).
  - Build initial proof of concept with **Linear Search**. Run initial unit tests.
- **Phase 2: Sorting Module + Insight Panel + Full Test Suite**
  - Implement Bubble, Insertion, Selection, Merge, Quick, and Heap sort with recursion ranges, partition schemes, and Heap dual-view (array + binary tree).
  - Build Insight Panel (counters, English narration, line-by-line pseudocode, operations chart, side-by-side comparison).
  - Write and run sorting correctness unit tests on 200+ randomized inputs.
- **Phase 3: Stack, Queue, Searching Modules + Tests**
  - Implement Linear and Binary Search (low/mid/high pointers, eliminated grayed-out ranges, unsorted warnings).
  - Implement Stack, Linear Queue, Circular Queue, and Parentheses Validator with overflow/underflow state handling.
  - Test search and stack/queue edge conditions.
- **Phase 4: Trees Module (BST, AVL Rotations, Traversals) + Tests**
  - Implement BST insert, delete, and search with live search path traversal.
  - Implement AVL tree with real-time balance factor annotations and animated LL, RR, LR, RL rotations explaining balancing triggers.
  - Implement Inorder, Preorder, Postorder, and Level-order traversals with live accumulator ribbon.
  - Unit-test AVL height invariants and BST inorder sorted order.
- **Phase 5: Graphs Module (Interactive Editor, BFS, DFS, Dijkstra) + Tests**
  - Interactive SVG canvas: click to add node, drag node to move, drag handle to connect edges, edit weights inline, toggle directed/weighted.
  - BFS with Queue inspection, DFS with Stack inspection, Dijkstra with priority queue and live distance table relaxation.
  - Test graph algorithms against reference implementations on connected, disconnected, and random graphs.
- **Phase 6: Hashing Module + Tests**
  - Selectable hash functions (division, multiplication, string polynomial).
  - Chaining (linked buckets) vs Open Addressing (Linear and Quadratic probing with tombstones).
  - Load factor gauges and dynamic resize warnings. Test key integrity across operations.
- **Phase 7: Landing Page, Guided Tour, Help, Accessibility & Mobile Pass**
  - Engaging landing page with 6 feature cards and "Start with a demo" launcher.
  - 4-step guided introductory tour, keyboard shortcuts modal (`Space`, `Arrows`, `R`), "?" contextual help, and beginner vs advanced modes.
  - Full WCAG AA color-blind safe palettes, ARIA labels, and responsive tablet layout.
- **Phase 8: Final Polish, Complexity Cheat Sheet, Comprehensive Testing & Verification**
  - Comprehensive Big-O Complexity Cheat Sheet with filterable search and operations breakdown.
  - README documentation with architecture diagrams, usage instructions, and test checklist.
  - Run full test suite (`npx tsx --test`) and automated browser verification via Playwright CLI.
