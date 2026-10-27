import React from 'react';
import type { ModuleCategory } from '../engine/types';
import {
  ArrowUpDown,
  Search,
  Layers,
  GitBranch,
  Network,
  Hash,
  ArrowRight,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface LandingPageProps {
  onSelectModule: (module: ModuleCategory | 'cheatsheet') => void;
  onStartDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectModule,
  onStartDemo,
}) => {
  const modules: {
    id: ModuleCategory;
    title: string;
    description: string;
    algorithms: string[];
    icon: React.ReactNode;
  }[] = [
    {
      id: 'sorting',
      title: 'Sorting Algorithms',
      description: 'Step through comparisons, swaps, and partitioning with Merge, Quick, Heap, and elementary sorts.',
      algorithms: ['Quick Sort', 'Merge Sort', 'Heap Sort', 'Bubble', 'Insertion', 'Selection'],
      icon: <ArrowUpDown className="w-5 h-5 text-indigo-400" />,
    },
    {
      id: 'searching',
      title: 'Searching Algorithms',
      description: 'Explore linear search and logarithmic binary search with interval halving and pointer tracking.',
      algorithms: ['Linear Search', 'Binary Search', 'Window Halving'],
      icon: <Search className="w-5 h-5 text-sky-400" />,
    },
    {
      id: 'stackQueue',
      title: 'Stack & Queue Structures',
      description: 'Visualize LIFO stacks, FIFO queues, circular ring buffers, and balanced bracket verification.',
      algorithms: ['Stack (LIFO)', 'Queue (FIFO)', 'Circular Queue', 'Bracket Validator'],
      icon: <Layers className="w-5 h-5 text-purple-400" />,
    },
    {
      id: 'trees',
      title: 'Binary Trees & AVL',
      description: 'Insert, delete, and balance nodes. Watch AVL self-balancing rotations (LL, RR, LR, RL) in action.',
      algorithms: ['BST Operations', 'AVL Rotations', 'Inorder', 'Preorder', 'Postorder', 'BFS'],
      icon: <GitBranch className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'graphs',
      title: 'Graph Traversals & Dijkstra',
      description: 'Draw graphs interactively and watch Dijkstra shortest path, BFS queues, and DFS stacks unfold.',
      algorithms: ['Dijkstra Shortest Path', 'BFS Traversal', 'DFS Traversal', 'Canvas Editor'],
      icon: <Network className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'hashing',
      title: 'Hash Tables & Probing',
      description: 'Observe key hashing, separate chaining, linear & quadratic open addressing, and tombstone deletes.',
      algorithms: ['Separate Chaining', 'Linear Probing', 'Quadratic Probing', 'Load Factor Alert'],
      icon: <Hash className="w-5 h-5 text-rose-400" />,
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto w-full">
      {/* Clean Hero Header */}
      <div className="text-center max-w-3xl mx-auto mt-4 mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Interactive Algorithm & Data Structure Visualizer</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          DSA Explorer
        </h1>

        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          Interactive algorithm and data structure visualizer with step-by-step playback, real-time telemetry, and code synchronization.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onSelectModule('cheatsheet')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-800 text-xs font-semibold shadow-xs transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Big-O Complexity Cheat Sheet</span>
          </button>
        </div>
      </div>

      {/* Grid of Cards (One per module with short description and Open button) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-2">
        {modules.map(mod => (
          <div
            key={mod.id}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/60 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                  {mod.icon}
                </div>
              </div>

              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {mod.title}
              </h2>

              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-4">
                {mod.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {mod.algorithms.map((algo, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 font-mono text-[10px]"
                  >
                    {algo}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectModule(mod.id)}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-xs group cursor-pointer"
            >
              <span>Open Module</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
