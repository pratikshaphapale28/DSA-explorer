import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../../engine/PlayerContext';
import {
  generateBSTInsertSteps,
  generateAVLInsertSteps,
  generateBSTDeleteSteps,
  generateAVLDeleteSteps,
  generateTreeSearchSteps,
  generateTraversalSteps,
  cloneTree,
  type TreeNode,
  type TreeAuxiliary,
} from '../../../algorithms/trees/treeAlgorithms';
import type { AlgorithmDefinition } from '../../../engine/types';
import { GitBranch, Search, Plus, Trash2, RotateCcw, Sparkles } from 'lucide-react';
import { ErrorBoundary } from '../../common/ErrorBoundary';

interface TreeStageProps {
  onAlgorithmChange: (algo: AlgorithmDefinition<any, any, any>) => void;
}

export const TreeStage: React.FC<TreeStageProps> = ({ onAlgorithmChange }) => {
  const { currentStep, currentStepIndex, loadSteps } = usePlayer();

  const [treeType, setTreeType] = useState<'bst' | 'avl'>('avl');
  const [inputValue, setInputValue] = useState<string>('25');
  const [traversalType, setTraversalType] = useState<'inorder' | 'preorder' | 'postorder' | 'levelorder'>('inorder');

  // Maintain canonical tree state
  const [canonicalRoot, setCanonicalRoot] = useState<TreeNode | null>(null);

  // Initialize with a balanced sample tree
  useEffect(() => {
    handleResetSampleTree();
  }, [treeType]);

  const handleResetSampleTree = () => {
    let root: TreeNode | null = null;
    const initialValues = treeType === 'avl' ? [30, 20, 40, 10, 25, 35, 50] : [30, 15, 45, 10, 20, 35, 50];

    for (const v of initialValues) {
      if (treeType === 'avl') {
        root = generateAVLInsertSteps(root, v).root;
      } else {
        root = generateBSTInsertSteps(root, v).root;
      }
    }

    setCanonicalRoot(root);
    emitMetadata(treeType);

    // Initial idle step
    loadSteps([
      {
        id: 0,
        type: 'start',
        description: `${treeType.toUpperCase()} initialized with sample values [${initialValues.join(', ')}].`,
        pseudocodeLine: 1,
        state: cloneTree(root),
        auxiliary: { action: 'init' },
        highlights: {},
        counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
      },
    ]);
  };

  const emitMetadata = (type: 'bst' | 'avl') => {
    const meta: AlgorithmDefinition<any, any, any> = {
      id: type,
      name: type === 'avl' ? 'AVL Tree (Self-Balancing)' : 'Binary Search Tree (BST)',
      category: 'trees',
      categoryLabel: 'Trees',
      summary:
        type === 'avl'
          ? 'A self-balancing binary search tree where the difference between heights of left and right subtrees (Balance Factor) cannot exceed 1. BF = height(left) - height(right).'
          : 'A node-based binary tree data structure where each node has at most two children, and all left values < root < all right values.',
      complexity: {
        best: 'O(log n)',
        average: 'O(log n)',
        worst: type === 'avl' ? 'O(log n)' : 'O(n)',
        space: 'O(n)',
        explanation:
          type === 'avl'
            ? 'Rotations prevent tree degeneration into a linked list, guaranteeing strict O(log n) height.'
            : 'Average operations take O(log n). If elements are inserted in sorted order, an un-balanced BST degenerates into a linked list O(n).',
        realWorldAnalogy:
          'A balanced mobile sculpture: adding weight to one side causes the arms to pivot and rebalance so it never tips over.',
      },
      pseudocode:
        type === 'avl'
          ? [
              'procedure insertAVL(node, val):',
              '  standard BST insert',
              '  update height & calculate balance factor = leftH - rightH',
              '  if balance > 1 and val < left.val: return rotateRight(node) // LL',
              '  if balance < -1 and val > right.val: return rotateLeft(node) // RR',
              '  if balance > 1 and val > left.val: left = rotateLeft(left); return rotateRight(node) // LR',
              '  if balance < -1 and val < right.val: right = rotateRight(right); return rotateLeft(node) // RL',
            ]
          : [
              'procedure insertBST(node, val):',
              '  if node is null: return new Node(val)',
              '  if val < node.val: node.left = insertBST(node.left, val)',
              '  else if val > node.val: node.right = insertBST(node.right, val)',
              '  return node',
            ],
      defaultInput: null,
      generateSteps: () => [],
    };
    onAlgorithmChange(meta);
  };

  const handleInsert = () => {
    const val = parseInt(inputValue.trim(), 10);
    if (isNaN(val)) return;

    emitMetadata(treeType);

    if (treeType === 'avl') {
      const { root: newRoot, steps } = generateAVLInsertSteps(canonicalRoot, val);
      setCanonicalRoot(newRoot);
      loadSteps(steps, true);
    } else {
      const { root: newRoot, steps } = generateBSTInsertSteps(canonicalRoot, val);
      setCanonicalRoot(newRoot);
      loadSteps(steps, true);
    }
    // Do NOT overwrite or randomize inputValue so the input box stays consistent with what was inserted
  };

  const handleDelete = () => {
    const val = parseInt(inputValue.trim(), 10);
    if (isNaN(val)) return;

    const deleteMeta: AlgorithmDefinition<any, any, any> = {
      id: `${treeType}_delete`,
      name: treeType === 'avl' ? 'AVL Deletion & Rebalancing' : 'BST Deletion',
      category: 'trees',
      categoryLabel: 'Trees',
      summary:
        treeType === 'avl'
          ? 'Deletes a node and rebalances ancestor nodes by checking balance factor and executing rotations.'
          : 'Deletes a node: leaf node is removed; 1-child node is replaced by its child; 2-children node is replaced by inorder successor.',
      complexity: {
        best: 'O(log n)',
        average: 'O(log n)',
        worst: treeType === 'avl' ? 'O(log n)' : 'O(n)',
        space: 'O(log n)',
        explanation: 'Searches for node to delete, replaces it, and propagates height updates up the call stack.',
        realWorldAnalogy: 'Removing a branch from a topiary tree: prune the limb and trim remaining twigs to keep the silhouette symmetrical.',
      },
      pseudocode:
        treeType === 'avl'
          ? [
              'procedure deleteAVL(node, val):',
              '  standard BST deletion (leaf, 1-child, or 2-children via successor)',
              '  update node height & calculate balance factor = leftH - rightH',
              '  if balance > 1 and left.BF >= 0: return rotateRight(node) // LL',
              '  if balance < -1 and right.BF <= 0: return rotateLeft(node) // RR',
              '  if balance > 1 and left.BF < 0: left = rotateLeft(left); return rotateRight(node) // LR',
              '  if balance < -1 and right.BF > 0: right = rotateRight(right); return rotateLeft(node) // RL',
            ]
          : [
              'procedure deleteBST(node, val):',
              '  if node is null: return null',
              '  if val < node.val: node.left = deleteBST(node.left, val)',
              '  else if val > node.val: node.right = deleteBST(node.right, val)',
              '  else:',
              '    if leaf: return null',
              '    if 1 child: return child',
              '    succ = min(node.right); node.val = succ.val; node.right = deleteBST(node.right, succ.val)',
            ],
      defaultInput: null,
      generateSteps: () => [],
    };
    onAlgorithmChange(deleteMeta);

    if (treeType === 'avl') {
      const { root: newRoot, steps } = generateAVLDeleteSteps(canonicalRoot, val);
      setCanonicalRoot(newRoot);
      loadSteps(steps, true);
    } else {
      const { root: newRoot, steps } = generateBSTDeleteSteps(canonicalRoot, val);
      setCanonicalRoot(newRoot);
      loadSteps(steps, true);
    }
  };

  const handleSearch = () => {
    const val = parseInt(inputValue.trim(), 10);
    if (isNaN(val)) return;

    const searchMeta: AlgorithmDefinition<any, any, any> = {
      id: `${treeType}_search`,
      name: `${treeType.toUpperCase()} Search`,
      category: 'trees',
      categoryLabel: 'Trees',
      summary: 'Compares target value against each node starting from root: goes left if smaller, right if larger.',
      complexity: {
        best: 'O(1)',
        average: 'O(log n)',
        worst: treeType === 'avl' ? 'O(log n)' : 'O(n)',
        space: 'O(1)',
        explanation: 'Each step cuts down exploration branch by following binary search tree invariant.',
        realWorldAnalogy: 'Navigating highway exits: reading mile markers to branch left or right until reaching destination.',
      },
      pseudocode: [
        'procedure search(node, target):',
        '  while node is not null:',
        '    if node.val == target: return FOUND',
        '    if target < node.val: node = node.left',
        '    else: node = node.right',
        '  return NOT_FOUND',
      ],
      defaultInput: null,
      generateSteps: () => [],
    };
    onAlgorithmChange(searchMeta);

    const steps = generateTreeSearchSteps(canonicalRoot, val);
    loadSteps(steps, true);
  };

  // Traversal execution with dedicated traversal pseudocode
  const handleTraverse = () => {
    const traversalPseudocode: Record<string, string[]> = {
      inorder: [
        'procedure inorder(node):',
        '  if node is null: return',
        '  inorder(node.left)',
        '  visit(node.val)  // LNR order (yields sorted output)',
        '  inorder(node.right)',
      ],
      preorder: [
        'procedure preorder(node):',
        '  if node is null: return',
        '  visit(node.val)  // NLR order (Root first)',
        '  preorder(node.left)',
        '  preorder(node.right)',
      ],
      postorder: [
        'procedure postorder(node):',
        '  if node is null: return',
        '  postorder(node.left)',
        '  postorder(node.right)',
        '  visit(node.val)  // LRN order (Children first, Root last)',
      ],
      levelorder: [
        'procedure levelOrder(root):',
        '  if root is null: return',
        '  queue.enqueue(root)',
        '  while not queue.isEmpty():',
        '    node = queue.dequeue()',
        '    visit(node.val)  // BFS level-by-level',
        '    if node.left: queue.enqueue(node.left)',
        '    if node.right: queue.enqueue(node.right)',
      ],
    };

    const traversalMeta: AlgorithmDefinition<any, any, any> = {
      id: `traversal_${traversalType}`,
      name: `Tree Traversal (${traversalType.toUpperCase()})`,
      category: 'trees',
      categoryLabel: 'Trees',
      summary:
        traversalType === 'inorder'
          ? 'Inorder traversal visits left subtree, root node, then right subtree (LNR). For a BST, this outputs keys in sorted ascending order.'
          : traversalType === 'preorder'
          ? 'Preorder traversal visits root node first, then left and right subtrees (NLR). Useful for cloning or serializing trees.'
          : traversalType === 'postorder'
          ? 'Postorder traversal visits left and right subtrees before root (LRN). Ideal for bottom-up cleanup or expression evaluation.'
          : 'Level-order traversal visits all nodes level by level from top to bottom (Breadth-First Search).',
      complexity: {
        best: 'O(n)',
        average: 'O(n)',
        worst: 'O(n)',
        space: 'O(h)',
        explanation: 'Visits every node exactly once in O(n) total time.',
        realWorldAnalogy: 'Reading a book chapter outline vs reading footnotes vs reading top-level summary.',
      },
      pseudocode: traversalPseudocode[traversalType] || traversalPseudocode.inorder,
      defaultInput: null,
      generateSteps: () => [],
    };

    onAlgorithmChange(traversalMeta);
    const steps = generateTraversalSteps(canonicalRoot, traversalType);
    loadSteps(steps, true);
  };

  // Type guard to ensure currentStep.state is actually a TreeNode and not state from another module
  const isTreeNode = (n: any): n is TreeNode =>
    Boolean(n && typeof n === 'object' && 'value' in n && 'height' in n && 'id' in n);

  // Extract current step tree state safely
  const currentTreeState = isTreeNode(currentStep?.state) ? currentStep.state : canonicalRoot;
  const aux = (currentStep?.auxiliary as TreeAuxiliary) || {};
  const highlightedNodeIds = currentStep?.highlights?.nodeIds || [];

  // Compute layout coordinates for SVG rendering
  interface RenderNode {
    id: string;
    value: number;
    height: number;
    balanceFactor: number;
    x: number;
    y: number;
    parent?: { x: number; y: number };
  }

  const nodesToRender: RenderNode[] = [];

  const layoutTree = (
    node: TreeNode | null,
    x: number,
    y: number,
    spread: number,
    parent?: { x: number; y: number }
  ) => {
    if (!node) return;
    nodesToRender.push({
      id: node.id,
      value: node.value,
      height: node.height,
      balanceFactor: node.balanceFactor,
      x,
      y,
      parent,
    });
    if (node.left) {
      layoutTree(node.left, x - spread, y + 55, spread / 2, { x, y });
    }
    if (node.right) {
      layoutTree(node.right, x + spread, y + 55, spread / 2, { x, y });
    }
  };

  layoutTree(currentTreeState, 350, 32, 130);

  return (
    <ErrorBoundary fallbackTitle="Tree Stage Error">
      <div className="flex-1 min-h-0 flex flex-col p-2 md:p-3 overflow-y-auto min-[1100px]:overflow-hidden">
        {/* Top Toolbar: At most 2 tight rows (Requirement 2a) */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 mb-2 shadow-xs shrink-0">
          {/* Tree Type Switcher */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setTreeType('avl')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                treeType === 'avl'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AVL (Self-Balancing)</span>
            </button>
            <button
              onClick={() => setTreeType('bst')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                treeType === 'bst'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Standard BST</span>
            </button>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <input
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="w-16 px-2 py-0.5 text-xs font-mono bg-slate-950 border border-slate-700 rounded text-slate-100"
              placeholder="Val"
            />

            <button
              onClick={handleInsert}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insert</span>
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <button
              onClick={handleSearch}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>

            {/* Traversals */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5 border border-slate-700/60">
              <select
                value={traversalType}
                onChange={e => setTraversalType(e.target.value as any)}
                className="bg-transparent text-slate-200 text-xs px-2 py-0.5 border-none focus:outline-none"
              >
                <option value="inorder">Inorder (LNR)</option>
                <option value="preorder">Preorder (NLR)</option>
                <option value="postorder">Postorder (LRN)</option>
                <option value="levelorder">Level-order (BFS)</option>
              </select>
              <button
                onClick={handleTraverse}
                className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded font-medium transition-colors"
              >
                Traverse
              </button>
            </div>

            <button
              onClick={handleResetSampleTree}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
              title="Reset Sample Tree"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Balance Factor Legend: SHOWN ONLY IN AVL MODE (Hidden in Standard BST Mode) */}
        {treeType === 'avl' && (
          <div className="mb-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-300 shadow-xs shrink-0 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
              <span>
                <strong>Badge = balance factor = left height - right height; red when outside -1..1</strong>
              </span>
            </div>
            <span className="text-[11px] text-indigo-400 hidden sm:inline font-mono font-semibold">
              AVL Invariant: |BF| ≤ 1
            </span>
          </div>
        )}

        {/* Rotation alert notification banner */}
        {aux.rotationCase && (
          <div className="mb-2 flex items-center justify-between p-2 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-200 text-xs animate-in fade-in shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
              <span>
                <strong>AVL Rotation Triggered: {aux.rotationCase} Case</strong> — Rebalanced node to maintain height property.
              </span>
            </div>
          </div>
        )}

        {/* Traversal Output Sequence Ribbon */}
        {aux.traversalOutput && aux.traversalOutput.length > 0 && (
          <div className="mb-2 p-2 rounded-xl bg-indigo-950/40 border border-indigo-900/60 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
            <span className="font-semibold text-indigo-300 whitespace-nowrap">
              Traversal Output ({aux.action}):
            </span>
            <div className="flex items-center gap-1.5">
              {aux.traversalOutput.map((val, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono font-bold text-xs shadow-xs animate-in zoom-in-75"
                >
                  {val}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* SVG Tree Canvas Stage: Flex-1 takes all flexible height (Requirement 2b) */}
        <div className="flex-1 min-h-0 flex flex-col justify-start p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 relative overflow-auto">
          {/* Visual Legend Header (Requirement 39) */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] mb-2 shrink-0 z-10">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-indigo-500" />
                <span className="text-slate-400">Node</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-400">Active / Inspecting</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="text-slate-400">Search Path</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-400">Unbalanced (|BF| &gt; 1)</span>
              </span>
            </div>
          </div>
          <svg className="w-full flex-1 min-w-[650px] min-h-[220px]" viewBox="0 0 700 240">
            {/* LAYER 1: First all edges (lines), shortened to circle border */}
            <g className="tree-edges">
              {nodesToRender
                .filter((node): node is RenderNode & { parent: { x: number; y: number } } => Boolean(node.parent))
                .map((node, i) => {
                  const dx = node.x - node.parent.x;
                  const dy = node.y - node.parent.y;
                  const dist = Math.hypot(dx, dy) || 1;
                  const r = 20;
                  const x1 = node.parent.x + (dx / dist) * r;
                  const y1 = node.parent.y + (dy / dist) * r;
                  const x2 = node.x - (dx / dist) * r;
                  const y2 = node.y - (dy / dist) * r;

                  return (
                    <line
                      key={`edge-${node.id}-${i}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#475569"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  );
                })}
            </g>

            {/* LAYER 2: Node groups centered at translate(node.x, node.y) */}
            <g className="tree-nodes">
              {nodesToRender.map((node, i) => {
                const isHighlighted = highlightedNodeIds.includes(node.id);
                const isUnbalanced = aux.unbalancedNodeId === node.id;
                const inSearchPath = aux.searchPath?.includes(node.value);

                let fill = '#1e293b';
                let stroke = '#6366f1';

                if (isUnbalanced) {
                  fill = '#e11d48';
                  stroke = '#fb7185';
                } else if (isHighlighted) {
                  fill = '#f59e0b';
                  stroke = '#fbbf24';
                } else if (inSearchPath) {
                  fill = '#0284c7';
                  stroke = '#38bdf8';
                }

                return (
                  <g
                    key={`tree-node-${node.id}-${i}`}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-default"
                  >
                    {/* Ring Fix: Centered at cx=0, cy=0 inside node group */}
                    {isHighlighted && (
                      <>
                        {/* Static thin ring */}
                        <circle
                          cx="0"
                          cy="0"
                          r="26"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2"
                          opacity="0.85"
                        />
                        {/* Calm pulse ring: scales 1.0 to 1.25 and fades out over 600ms */}
                        <circle
                          key={`tree-pulse-${node.id}-${currentStepIndex}`}
                          cx="0"
                          cy="0"
                          r="24"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2.5"
                          className="node-pulse-ring"
                        />
                      </>
                    )}

                    {/* Node circle with solid fill */}
                    <circle
                      cx="0"
                      cy="0"
                      r="20"
                      fill={fill}
                      stroke={stroke}
                      strokeWidth="2.5"
                      className="filter drop-shadow-md transition-colors duration-200"
                    />

                    {/* Node label */}
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      fontSize="12"
                      fontFamily="monospace"
                      fontWeight="bold"
                      className="select-none"
                      pointerEvents="none"
                    >
                      {node.value}
                    </text>

                    {/* AVL Balance Factor badge */}
                    {treeType === 'avl' && (
                      <g
                        transform="translate(12, -18)"
                        className="cursor-help"
                      >
                        <title>{`Badge = balance factor = left height - right height; red when outside -1..1 (current: ${node.balanceFactor})`}</title>
                        <rect
                          x="0"
                          y="0"
                          width="18"
                          height="14"
                          rx="4"
                          fill={Math.abs(node.balanceFactor) > 1 ? '#e11d48' : '#0f172a'}
                          stroke={Math.abs(node.balanceFactor) > 1 ? '#f43f5e' : '#475569'}
                          strokeWidth="1"
                        />
                        <text
                          x="9"
                          y="7"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={Math.abs(node.balanceFactor) > 1 ? '#ffffff' : '#94a3b8'}
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                          pointerEvents="none"
                        >
                          {node.balanceFactor > 0 ? `+${node.balanceFactor}` : node.balanceFactor}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    </ErrorBoundary>
  );
};
