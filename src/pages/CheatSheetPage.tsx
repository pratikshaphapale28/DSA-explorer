import React, { useState } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';

interface CheatSheetItem {
  name: string;
  category: 'Sorting' | 'Searching' | 'Trees' | 'Graphs' | 'Hashing';
  best: string;
  average: string;
  worst: string;
  space: string;
  stability?: string;
  whenToUse: string;
}

export const CheatSheetPage: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const cheatSheetData: CheatSheetItem[] = [
    {
      name: 'Bubble Sort',
      category: 'Sorting',
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
      stability: 'Stable',
      whenToUse: 'Educational baseline. Can detect already sorted arrays in O(n) via early-exit flag.',
    },
    {
      name: 'Insertion Sort',
      category: 'Sorting',
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
      stability: 'Stable',
      whenToUse: 'Small arrays (N <= 20) or data streams that arrive nearly sorted in real time.',
    },
    {
      name: 'Selection Sort',
      category: 'Sorting',
      best: 'O(n²)',
      average: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
      stability: 'Unstable',
      whenToUse: 'Systems where writing to flash memory or disk is extremely costly (minimizes swaps to at most N-1).',
    },
    {
      name: 'Merge Sort',
      category: 'Sorting',
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
      space: 'O(n)',
      stability: 'Stable',
      whenToUse: 'Guaranteed O(n log n) performance regardless of input data; external sorting for huge datasets.',
    },
    {
      name: 'Quick Sort (Lomuto)',
      category: 'Sorting',
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n²)',
      space: 'O(log n)',
      stability: 'Unstable',
      whenToUse: 'General-purpose in-place sorting with minimal cache misses. Standard library sorting primitive.',
    },
    {
      name: 'Heap Sort',
      category: 'Sorting',
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
      space: 'O(1)',
      stability: 'Unstable',
      whenToUse: 'Embedded systems requiring guaranteed O(n log n) with zero auxiliary memory.',
    },
    {
      name: 'Linear Search',
      category: 'Searching',
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
      space: 'O(1)',
      whenToUse: 'Unsorted arrays, linked lists, or when only performing a single search.',
    },
    {
      name: 'Binary Search',
      category: 'Searching',
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
      space: 'O(1)',
      whenToUse: 'Searching repeated queries on pre-sorted arrays.',
    },
    {
      name: 'Binary Search Tree (BST)',
      category: 'Trees',
      best: 'O(log n)',
      average: 'O(log n)',
      worst: 'O(n)',
      space: 'O(n)',
      whenToUse: 'Dynamic set maintaining order with frequent inserts and lookups (average case).',
    },
    {
      name: 'AVL Tree',
      category: 'Trees',
      best: 'O(log n)',
      average: 'O(log n)',
      worst: 'O(log n)',
      space: 'O(n)',
      whenToUse: 'Lookup-intensive database indexes where strict height balance guarantees O(log n) worst case.',
    },
    {
      name: 'Breadth-First Search (BFS)',
      category: 'Graphs',
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
      space: 'O(V)',
      whenToUse: 'Finding unweighted shortest paths or peer-to-peer network discovery.',
    },
    {
      name: 'Depth-First Search (DFS)',
      category: 'Graphs',
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
      space: 'O(V)',
      whenToUse: 'Topological sorting, cycle detection in DAGs, and maze solving.',
    },
    {
      name: "Dijkstra's Algorithm",
      category: 'Graphs',
      best: 'O((V + E) log V)',
      average: 'O((V + E) log V)',
      worst: 'O((V + E) log V)',
      space: 'O(V)',
      whenToUse: 'Single-source shortest path in road networks with non-negative edge weights.',
    },
    {
      name: 'Hash Table (Chaining)',
      category: 'Hashing',
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(n)',
      space: 'O(m + n)',
      whenToUse: 'High collision resilience, handles high load factors without resizing failures.',
    },
    {
      name: 'Hash Table (Open Addressing)',
      category: 'Hashing',
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(n)',
      space: 'O(m)',
      whenToUse: 'Zero pointer overhead; highly memory cache efficient when load factor remains < 0.7.',
    },
  ];

  const categories = ['all', 'Sorting', 'Searching', 'Trees', 'Graphs', 'Hashing'];

  const filtered = cheatSheetData.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.whenToUse.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Big-O Reference Guide</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Algorithm Complexity Matrix</h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Comprehensive reference of time complexities, memory bounds, stability, and optimal real-world application criteria.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 rounded-xl bg-slate-900 border border-slate-800">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filterCategory === cat
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search algorithms..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Algorithm</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold text-emerald-400">Best Time</th>
                <th className="py-3.5 px-4 font-semibold text-sky-400">Average Time</th>
                <th className="py-3.5 px-4 font-semibold text-rose-400">Worst Time</th>
                <th className="py-3.5 px-4 font-semibold text-purple-400">Space</th>
                <th className="py-3.5 px-4 font-semibold">Ideal Real-World Use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {filtered.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-100 whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-medium">
                    {item.category}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                    {item.best}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-sky-400 whitespace-nowrap">
                    {item.average}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-rose-400 whitespace-nowrap">
                    {item.worst}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-purple-400 whitespace-nowrap">
                    {item.space}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-xs leading-relaxed">
                    {item.whenToUse}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
