# DSA Explorer — Interactive Algorithm Learning Platform

> A visual algorithm learning platform built for computer science students to explore, manipulate, and master data structures and algorithms with guaranteed mathematical and algorithmic correctness.

---

## 🌟 Key Features

1. **Pure Precomputed Step Engine & Full Time Travel**:
   - Algorithms are decoupled pure functions returning ordered arrays of immutable snapshot `Step` objects.
   - Replay engine supports Play, Pause, Next, Previous, Scrubber timeline jumps, and Speed control ($0.25\times$ to $4\times$).
   - Step backward always restores exact historical state without side effects.

2. **Interactive Data Structure Modules**:
   - **Graphs**: Interactive SVG editor. Click canvas to add nodes, drag to move, drag from node to node to draw edges, inline edge weights. Visualizes **BFS** (Queue), **DFS** (Stack), and **Dijkstra's Shortest Path** (live distance table, priority queue, edge relaxation, and negative weight rejection).
   - **Trees**: Interactive **BST** and self-balancing **AVL Trees**. Balance factor annotations on every node, automatic detection and animated rotations for **LL**, **RR**, **LR**, and **RL** cases. Real-time traversal output ribbon for Inorder, Preorder, Postorder, and Level-order.
   - **Sorting**: **Merge Sort** (recursion split/merge bounds and temp array buffer), **Quick Sort** (Lomuto partition scheme with pivot and pointer indicators), **Heap Sort** (dual view of array and binary heap tree), plus **Bubble**, **Insertion**, and **Selection Sort**. Includes side-by-side comparative benchmarks on identical inputs.
   - **Stack & Queue**: Push/pop/peek, enqueue/dequeue/front with overflow and underflow boundary guards. Includes **Circular Ring Buffer** with modulo indexing and a **Balanced Bracket Syntax Validator** demo.
   - **Searching**: **Linear Search** and **Binary Search** with low/mid/high pointers, eliminated grayed-out intervals, and unsorted warnings.
   - **Hashing**: Selectable hash functions (Division, Multiplication, Polynomial string) and collision schemes (**Separate Chaining**, **Linear Probing**, **Quadratic Probing**) with `<TOMBSTONE>` markers and dynamic load factor ($\alpha$) warnings.

3. **Live Insight Panel (Every Module)**:
   - Plain-English beginner narration of current algorithmic decisions.
   - Line-by-line syntax-highlighted pseudocode with dynamic line indicator.
   - Live execution telemetry: comparisons, swaps/assignments, passes, and array accesses.
   - Theoretical Big-O complexity card (Best, Average, Worst, Space) accompanied by real-world intuitive analogies.

4. **Student & Classroom UX**:
   - Light and Dark mode.
   - Beginner Mode (elaborate step explanations) vs. Advanced Mode (compact telemetry).
   - 4-step guided introductory tour.
   - "Predict the Next Step" interactive quiz for testing comprehension.
   - Comprehensive Big-O Complexity Cheat Sheet with search and category filtering.
   - Global keyboard shortcuts: `Space` (Play/Pause), `→` (Next), `←` (Prev), `R` (Reset).

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             UI Presentation Layer                           │
│  [TopBar] · [LandingPage] · [CheatSheetPage] · [Modals: Guide / Tour / Quiz]│
├───────────────────────────────────┬─────────────────────────────────────────┤
│    Module Stages (Renderers)      │           Right Insight Panel           │
│  - GraphStage (SVG Canvas)        │  - Live Narration Card                  │
│  - TreeStage (SVG Binary Tree)    │  - Execution Telemetry (Comparisons/Ops)│
│  - SortingStage (Bar Heights)     │  - Synchronized Pseudocode Highlighter  │
│  - StackQueueStage (LIFO/FIFO)    │  - Complexity & Real-World Analogy Card │
│  - HashingStage (Buckets/Probing) ├─────────────────────────────────────────┤
│  - SearchingStage (Pointers)      │          Bottom Playback Bar            │
│                                   │  [Reset] [Prev] [Play/Pause] [Next]     │
│                                   │  Timeline Scrubber | Speed: 0.25x - 4x  │
├───────────────────────────────────┴─────────────────────────────────────────┤
│                         Player Engine (React Context)                       │
│  - Replay State: steps[], currentStepIndex, isPlaying, speed                │
│  - Deterministic time-travel: jump via slider, step-back snapshot lookup    │
├─────────────────────────────────────────────────────────────────────────────┤
│                    Pure Algorithm Step Generators                           │
│  Input Data -> Pure Function -> Immutable Array of Step<TState, TAux>[]     │
│  No DOM dependencies · No async sleep races · 100% Deterministic & Testable │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (version 20 or higher recommended)
- npm or yarn

### Installation & Development
```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test # or: npx tsx --test src/tests/*.test.ts

# 3. Start development server
npm run dev

# 4. Build production bundle
npm run build
```

---

## 🧪 Automated Test Suite

All algorithms are rigorously tested using Node's native test runner (`node:test`) and `tsx`:

```bash
npx --yes tsx --test src/tests/sorting.test.ts
npx --yes tsx --test src/tests/searching.test.ts
npx --yes tsx --test src/tests/stackQueue.test.ts
npx --yes tsx --test src/tests/trees.test.ts
npx --yes tsx --test src/tests/graphs.test.ts
npx --yes tsx --test src/tests/hashing.test.ts
```

### Verified Test Invariants:
- **Sorting**: Matches `Array.sort` on 220+ randomized arrays including empty, single-element, duplicates, sorted, reversed, and negative inputs across all 6 sorting algorithms. Replaying steps forward and backward verifies full state immutability.
- **Searching**: Correct boundary lookups and -1 returns on empty/absent cases for Linear and Binary search.
- **Trees**: BST Inorder traversal is guaranteed strictly sorted. AVL trees strictly maintain $|balanceFactor| \le 1$ after arbitrary sequential and random insertions, triggering and verifying all 4 rotation cases (LL, RR, LR, RL).
- **Graphs**: BFS and DFS traversal sequences verify level and stack invariants. Dijkstra shortest path distances are verified against an independent Bellman-Ford reference on connected and disconnected graphs, and negative edge weights are cleanly rejected.
- **Hashing**: Collision resolution verified for chaining, linear probing, and quadratic probing. Deleting keys leaves tombstones that subsequent search probes successfully bypass.

---

## 📋 Manual Browser Test Checklist

1. **Navigation & Landing**:
   - Open root URL; observe landing hero, feature badges, and 6 module cards.
   - Click "Start with a Demo (Quick Sort)" -> opens Sorting module and begins playback.
   - Click "Cheat Sheet" -> verifies Big-O table, filters by "Sorting" and search bar.
2. **Sorting Module**:
   - Select "Merge Sort" -> verify recursion split and auxiliary temp buffer view.
   - Select "Quick Sort" -> observe Lomuto pivot in purple and $i, j$ pointers.
   - Select "Heap Sort" -> observe dual array and SVG binary heap tree rendering.
   - Click "Compare" -> verify side-by-side comparison with another sorting algorithm.
3. **Searching Module**:
   - Select "Binary Search" on an unsorted custom array -> verify "Sort Array First" warning banner.
   - Click "Sort Array First" -> array sorts and search proceeds with low, mid, high pointers and grayed-out eliminated range.
4. **Stack & Queue**:
   - Push until capacity (e.g. 6) -> verify Stack Overflow warning toast.
   - Switch to "Bracket Validator Demo" -> click `{ [ ( ) ] }` and run -> verify bracket stack operations and celebration on success.
5. **Trees Module**:
   - Click "Insert" 3 times with sequential ascending values in AVL mode -> verify automatic LL/RR rotation with purple explanation banner and balance factor badges.
   - Run Inorder Traversal -> verify live traversal ribbon builds up sorted sequence.
6. **Graphs Module**:
   - Switch to "Add Node" mode and click on canvas -> adds new node.
   - Switch to "Connect Edge" mode and click two nodes -> creates weighted edge.
   - Click edge weight to edit inline.
   - Select "Dijkstra" with Start "A" and Target "F" -> click "Run" -> watch tentative distances update and final green shortest path illuminate.
7. **Hashing Module**:
   - Select "Linear Probing", insert 14 and 21 into table size $m=7$ (both collide at index 0).
   - Delete 14 -> leaves a `<TOMBSTONE>`.
   - Search 21 -> verify probe skips over tombstone and finds 21.
8. **Accessibility & Controls**:
   - Press `Space` -> toggles Play/Pause.
   - Press `→` and `←` -> steps forward and backward.
   - Toggle "Beginner" to "Advanced" in header -> narration switches between educational analogies and concise technical metrics.
   - Toggle Sun/Moon -> switches between Dark and Light themes.
