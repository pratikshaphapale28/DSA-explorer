import type { AlgorithmDefinition, Step } from '../../engine/types';

export interface TreeNode {
  id: string;
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  height: number;
  balanceFactor: number;
}

export interface TreeAuxiliary {
  searchPath?: number[];
  traversalOutput?: number[];
  rotationCase?: 'LL' | 'RR' | 'LR' | 'RL';
  unbalancedNodeId?: string;
  action?: string;
}

// Deep clone a tree
export const cloneTree = (node: TreeNode | null): TreeNode | null => {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
    height: node.height,
    balanceFactor: node.balanceFactor,
  };
};

// Node height & balance factor utilities
export const getHeight = (node: TreeNode | null): number => (node ? node.height : 0);

export const updateNodeStats = (node: TreeNode): void => {
  const leftH = getHeight(node.left);
  const rightH = getHeight(node.right);
  node.height = 1 + Math.max(leftH, rightH);
  node.balanceFactor = leftH - rightH;
};

// Inorder traversal pure collector
export const getInorderValues = (root: TreeNode | null): number[] => {
  const result: number[] = [];
  const traverse = (node: TreeNode | null) => {
    if (!node) return;
    traverse(node.left);
    result.push(node.value);
    traverse(node.right);
  };
  traverse(root);
  return result;
};

// Verify AVL invariants on tree
export const checkAVLInvariants = (node: TreeNode | null): boolean => {
  if (!node) return true;
  const leftH = getHeight(node.left);
  const rightH = getHeight(node.right);
  const bf = leftH - rightH;
  if (Math.abs(bf) > 1) return false;
  if (node.height !== 1 + Math.max(leftH, rightH)) return false;
  return checkAVLInvariants(node.left) && checkAVLInvariants(node.right);
};

// Right Rotation (for Left-heavy / LL)
const rotateRight = (y: TreeNode): TreeNode => {
  const x = y.left!;
  const T2 = x.right;

  x.right = y;
  y.left = T2;

  updateNodeStats(y);
  updateNodeStats(x);
  return x;
};

// Left Rotation (for Right-heavy / RR)
const rotateLeft = (x: TreeNode): TreeNode => {
  const y = x.right!;
  const T2 = y.left;

  y.left = x;
  x.right = T2;

  updateNodeStats(x);
  updateNodeStats(y);
  return y;
};

/**
 * BST Insert Step Generator
 */
export const generateBSTInsertSteps = (
  root: TreeNode | null,
  value: number
): { root: TreeNode; steps: Step<TreeNode | null, TreeAuxiliary>[] } => {
  const steps: Step<TreeNode | null, TreeAuxiliary>[] = [];
  let currentRoot = cloneTree(root);
  const path: number[] = [];

  let comparisons = 0;
  let iterations = 0;

  steps.push({
    id: 0,
    type: 'start',
    description: `Inserting value ${value} into Binary Search Tree.`,
    pseudocodeLine: 1,
    state: cloneTree(currentRoot),
    auxiliary: { searchPath: [], action: 'insert' },
    highlights: {},
    counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
  });

  const insert = (node: TreeNode | null): TreeNode => {
    iterations++;
    if (!node) {
      const newNode: TreeNode = {
        id: `node_${value}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        value,
        left: null,
        right: null,
        height: 1,
        balanceFactor: 0,
      };

      path.push(value);
      steps.push({
        id: steps.length,
        type: 'insert',
        description: `Found empty insertion position. Created new node with value ${value}.`,
        pseudocodeLine: 2,
        state: cloneTree(newNode),
        auxiliary: { searchPath: [...path], action: 'insert' },
        highlights: { nodeIds: [newNode.id] },
        counters: { comparisons, swaps: 0, iterations, arrayAccesses: 1 },
      });

      return newNode;
    }

    path.push(node.value);
    comparisons++;

    steps.push({
      id: steps.length,
      type: 'compare',
      description: `Comparing insert value ${value} with current node ${node.value}.`,
      pseudocodeLine: 3,
      state: cloneTree(currentRoot),
      auxiliary: { searchPath: [...path], action: 'insert' },
      highlights: { nodeIds: [node.id] },
      counters: { comparisons, swaps: 0, iterations, arrayAccesses: 1 },
    });

    if (value < node.value) {
      steps.push({
        id: steps.length,
        type: 'highlight',
        description: `${value} < ${node.value}: Traversing into LEFT subtree.`,
        pseudocodeLine: 4,
        state: cloneTree(currentRoot),
        auxiliary: { searchPath: [...path], action: 'insert' },
        highlights: { nodeIds: [node.id] },
        counters: { comparisons, swaps: 0, iterations, arrayAccesses: 1 },
      });
      node.left = insert(node.left);
    } else if (value > node.value) {
      steps.push({
        id: steps.length,
        type: 'highlight',
        description: `${value} > ${node.value}: Traversing into RIGHT subtree.`,
        pseudocodeLine: 5,
        state: cloneTree(currentRoot),
        auxiliary: { searchPath: [...path], action: 'insert' },
        highlights: { nodeIds: [node.id] },
        counters: { comparisons, swaps: 0, iterations, arrayAccesses: 1 },
      });
      node.right = insert(node.right);
    } else {
      steps.push({
        id: steps.length,
        type: 'highlight',
        description: `Value ${value} is a DUPLICATE of existing node. In standard BSTs, duplicates are ignored to keep keys unique.`,
        pseudocodeLine: 6,
        state: cloneTree(currentRoot),
        auxiliary: { searchPath: [...path], action: 'insert' },
        highlights: { nodeIds: [node.id] },
        counters: { comparisons, swaps: 0, iterations, arrayAccesses: 1 },
      });
      return node;
    }

    updateNodeStats(node);
    return node;
  };

  currentRoot = insert(currentRoot);

  steps.push({
    id: steps.length,
    type: 'complete',
    description: `BST insertion of ${value} completed.`,
    pseudocodeLine: 2,
    state: cloneTree(currentRoot),
    auxiliary: { searchPath: [...path], action: 'insert' },
    highlights: {},
    counters: { comparisons, swaps: 0, iterations, arrayAccesses: 1 },
  });

  return { root: currentRoot, steps };
};

/**
 * AVL Insert Step Generator with Balancing and Rotations
 */
export const generateAVLInsertSteps = (
  root: TreeNode | null,
  value: number
): { root: TreeNode; steps: Step<TreeNode | null, TreeAuxiliary>[] } => {
  const steps: Step<TreeNode | null, TreeAuxiliary>[] = [];
  let currentRoot = cloneTree(root);
  const path: number[] = [];

  let comparisons = 0;
  let iterations = 0;
  let swaps = 0;

  steps.push({
    id: 0,
    type: 'start',
    description: `Starting AVL Insert for value ${value}. Tree maintains balance factor in [-1, +1].`,
    pseudocodeLine: 1,
    state: cloneTree(currentRoot),
    auxiliary: { searchPath: [], action: 'avl_insert' },
    highlights: {},
    counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
  });

  const insertAVL = (node: TreeNode | null): TreeNode => {
    iterations++;
    if (!node) {
      const newNode: TreeNode = {
        id: `node_${value}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        value,
        left: null,
        right: null,
        height: 1,
        balanceFactor: 0,
      };
      path.push(value);
      return newNode;
    }

    path.push(node.value);
    comparisons++;

    if (value < node.value) {
      node.left = insertAVL(node.left);
    } else if (value > node.value) {
      node.right = insertAVL(node.right);
    } else {
      return node; // Duplicate
    }

    updateNodeStats(node);
    const balance = node.balanceFactor;

    // Check balancing conditions (LL, RR, LR, RL)
    // Left-Left (LL) Case
    if (balance > 1 && value < node.left!.value) {
      swaps++;
      steps.push({
        id: steps.length,
        type: 'rotate',
        description: `UNBALANCED NODE detected at ${node.value} (Balance Factor = +2). Insertion occurred in Left subtree's Left child -> Left-Left (LL) Case. Performing RIGHT ROTATION.`,
        pseudocodeLine: 7,
        state: cloneTree(currentRoot),
        auxiliary: {
          searchPath: [...path],
          rotationCase: 'LL',
          unbalancedNodeId: node.id,
          action: 'avl_insert',
        },
        highlights: { nodeIds: [node.id] },
        counters: { comparisons, swaps, iterations, arrayAccesses: 2 },
      });
      return rotateRight(node);
    }

    // Right-Right (RR) Case
    if (balance < -1 && value > node.right!.value) {
      swaps++;
      steps.push({
        id: steps.length,
        type: 'rotate',
        description: `UNBALANCED NODE detected at ${node.value} (Balance Factor = -2). Insertion occurred in Right subtree's Right child -> Right-Right (RR) Case. Performing LEFT ROTATION.`,
        pseudocodeLine: 8,
        state: cloneTree(currentRoot),
        auxiliary: {
          searchPath: [...path],
          rotationCase: 'RR',
          unbalancedNodeId: node.id,
          action: 'avl_insert',
        },
        highlights: { nodeIds: [node.id] },
        counters: { comparisons, swaps, iterations, arrayAccesses: 2 },
      });
      return rotateLeft(node);
    }

    // Left-Right (LR) Case
    if (balance > 1 && value > node.left!.value) {
      swaps += 2;
      steps.push({
        id: steps.length,
        type: 'rotate',
        description: `UNBALANCED NODE detected at ${node.value} (Balance Factor = +2). Insertion in Left subtree's Right child -> Left-Right (LR) Case. Performing LEFT rotation on left child (${node.left!.value}), then RIGHT rotation on ${node.value}.`,
        pseudocodeLine: 9,
        state: cloneTree(currentRoot),
        auxiliary: {
          searchPath: [...path],
          rotationCase: 'LR',
          unbalancedNodeId: node.id,
          action: 'avl_insert',
        },
        highlights: { nodeIds: [node.id, node.left!.id] },
        counters: { comparisons, swaps, iterations, arrayAccesses: 3 },
      });
      node.left = rotateLeft(node.left!);
      return rotateRight(node);
    }

    // Right-Left (RL) Case
    if (balance < -1 && value < node.right!.value) {
      swaps += 2;
      steps.push({
        id: steps.length,
        type: 'rotate',
        description: `UNBALANCED NODE detected at ${node.value} (Balance Factor = -2). Insertion in Right subtree's Left child -> Right-Left (RL) Case. Performing RIGHT rotation on right child (${node.right!.value}), then LEFT rotation on ${node.value}.`,
        pseudocodeLine: 10,
        state: cloneTree(currentRoot),
        auxiliary: {
          searchPath: [...path],
          rotationCase: 'RL',
          unbalancedNodeId: node.id,
          action: 'avl_insert',
        },
        highlights: { nodeIds: [node.id, node.right!.id] },
        counters: { comparisons, swaps, iterations, arrayAccesses: 3 },
      });
      node.right = rotateRight(node.right!);
      return rotateLeft(node);
    }

    return node;
  };

  currentRoot = insertAVL(currentRoot);

  steps.push({
    id: steps.length,
    type: 'complete',
    description: `AVL Insert complete. Tree height is ${currentRoot.height}, balance factors strictly in [-1, +1].`,
    pseudocodeLine: 2,
    state: cloneTree(currentRoot),
    auxiliary: { searchPath: [...path], action: 'avl_insert' },
    highlights: {},
    counters: { comparisons, swaps, iterations, arrayAccesses: 2 },
  });

  return { root: currentRoot, steps };
};

/**
 * BST / AVL Search Step Generator
 */
export const generateTreeSearchSteps = (
  root: TreeNode | null,
  target: number
): Step<TreeNode | null, TreeAuxiliary>[] => {
  const steps: Step<TreeNode | null, TreeAuxiliary>[] = [];
  const path: number[] = [];

  let comparisons = 0;
  let iterations = 0;
  let curr = root;
  let found = false;

  steps.push({
    id: 0,
    type: 'start',
    description: `Searching for value ${target} in Tree.`,
    pseudocodeLine: 1,
    state: cloneTree(root),
    auxiliary: { searchPath: [], action: 'search' },
    highlights: {},
    counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
  });

  while (curr) {
    iterations++;
    comparisons++;
    path.push(curr.value);

    steps.push({
      id: steps.length,
      type: 'compare',
      description: `Inspecting node ${curr.value}. Comparing with target ${target}.`,
      pseudocodeLine: 2,
      state: cloneTree(root),
      auxiliary: { searchPath: [...path], action: 'search' },
      highlights: { nodeIds: [curr.id] },
      counters: { comparisons, swaps: 0, iterations, arrayAccesses: 1 },
    });

    if (curr.value === target) {
      found = true;
      steps.push({
        id: steps.length,
        type: 'found',
        description: `Target ${target} FOUND! Search path: [${path.join(' -> ')}].`,
        pseudocodeLine: 3,
        state: cloneTree(root),
        auxiliary: { searchPath: [...path], action: 'search' },
        highlights: { nodeIds: [curr.id] },
        counters: { comparisons, swaps: 0, iterations, arrayAccesses: 1 },
      });
      break;
    } else if (target < curr.value) {
      curr = curr.left;
    } else {
      curr = curr.right;
    }
  }

  if (!found) {
    steps.push({
      id: steps.length,
      type: 'not_found',
      description: `Target ${target} was NOT FOUND in tree. Search path ended at null.`,
      pseudocodeLine: 5,
      state: cloneTree(root),
      auxiliary: { searchPath: [...path], action: 'search' },
      highlights: {},
      counters: { comparisons, swaps: 0, iterations, arrayAccesses: 1 },
    });
  }

  return steps;
};

/**
 * Tree Traversals (Inorder, Preorder, Postorder, Level-order)
 */
export const generateTraversalSteps = (
  root: TreeNode | null,
  type: 'inorder' | 'preorder' | 'postorder' | 'levelorder'
): Step<TreeNode | null, TreeAuxiliary>[] => {
  const steps: Step<TreeNode | null, TreeAuxiliary>[] = [];
  const output: number[] = [];

  let iterations = 0;

  steps.push({
    id: 0,
    type: 'start',
    description: `Starting ${type.toUpperCase()} traversal on tree. Output ribbon will build dynamically.`,
    pseudocodeLine: 1,
    state: cloneTree(root),
    auxiliary: { traversalOutput: [], action: type },
    highlights: {},
    counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
  });

  if (!root) {
    steps.push({
      id: steps.length,
      type: 'complete',
      description: `Tree is empty. Traversal output is [].`,
      pseudocodeLine: 2,
      state: null,
      auxiliary: { traversalOutput: [] },
      highlights: {},
      counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
    });
    return steps;
  }

  if (type === 'inorder') {
    const traverse = (node: TreeNode | null) => {
      if (!node) return;
      traverse(node.left);
      iterations++;
      output.push(node.value);
      steps.push({
        id: steps.length,
        type: 'visit',
        description: `Visited node ${node.value}. Inorder sequence so far: [${output.join(', ')}].`,
        pseudocodeLine: 3,
        state: cloneTree(root),
        auxiliary: { traversalOutput: [...output], action: 'inorder' },
        highlights: { nodeIds: [node.id] },
        counters: { comparisons: 0, swaps: 0, iterations, arrayAccesses: output.length },
      });
      traverse(node.right);
    };
    traverse(root);
  } else if (type === 'preorder') {
    const traverse = (node: TreeNode | null) => {
      if (!node) return;
      iterations++;
      output.push(node.value);
      steps.push({
        id: steps.length,
        type: 'visit',
        description: `Visited node ${node.value} (Root first). Preorder sequence so far: [${output.join(', ')}].`,
        pseudocodeLine: 3,
        state: cloneTree(root),
        auxiliary: { traversalOutput: [...output], action: 'preorder' },
        highlights: { nodeIds: [node.id] },
        counters: { comparisons: 0, swaps: 0, iterations, arrayAccesses: output.length },
      });
      traverse(node.left);
      traverse(node.right);
    };
    traverse(root);
  } else if (type === 'postorder') {
    const traverse = (node: TreeNode | null) => {
      if (!node) return;
      traverse(node.left);
      traverse(node.right);
      iterations++;
      output.push(node.value);
      steps.push({
        id: steps.length,
        type: 'visit',
        description: `Visited node ${node.value} (Children first). Postorder sequence so far: [${output.join(', ')}].`,
        pseudocodeLine: 3,
        state: cloneTree(root),
        auxiliary: { traversalOutput: [...output], action: 'postorder' },
        highlights: { nodeIds: [node.id] },
        counters: { comparisons: 0, swaps: 0, iterations, arrayAccesses: output.length },
      });
    };
    traverse(root);
  } else if (type === 'levelorder') {
    const queue: TreeNode[] = [root];
    while (queue.length > 0) {
      const node = queue.shift()!;
      iterations++;
      output.push(node.value);
      steps.push({
        id: steps.length,
        type: 'visit',
        description: `Visited node ${node.value} from queue (BFS Level-order). Sequence: [${output.join(', ')}].`,
        pseudocodeLine: 3,
        state: cloneTree(root),
        auxiliary: { traversalOutput: [...output], action: 'levelorder' },
        highlights: { nodeIds: [node.id] },
        counters: { comparisons: 0, swaps: 0, iterations, arrayAccesses: output.length },
      });
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }

  steps.push({
    id: steps.length,
    type: 'complete',
    description: `${type.toUpperCase()} traversal complete! Final output: [${output.join(', ')}].`,
    pseudocodeLine: 4,
    state: cloneTree(root),
    auxiliary: { traversalOutput: [...output], action: type },
    highlights: {},
    counters: { comparisons: 0, swaps: 0, iterations, arrayAccesses: output.length },
  });

  return steps;
};

/**
 * BST Delete Step Generator
 * Handles leaf, 1 child, and 2 children with inorder successor replacement
 */
export const generateBSTDeleteSteps = (
  root: TreeNode | null,
  value: number
): { root: TreeNode | null; steps: Step<TreeNode | null, TreeAuxiliary>[] } => {
  const steps: Step<TreeNode | null, TreeAuxiliary>[] = [];
  let currentRoot = cloneTree(root);
  const path: number[] = [];

  let comparisons = 0;
  let iterations = 0;
  let swaps = 0;

  steps.push({
    id: 0,
    type: 'start',
    description: `Starting BST deletion of value ${value}. Traversing to locate node.`,
    pseudocodeLine: 1,
    state: cloneTree(currentRoot),
    auxiliary: { searchPath: [], action: 'bst_delete' },
    highlights: {},
    counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
  });

  if (!currentRoot) {
    steps.push({
      id: steps.length,
      type: 'not_found',
      description: `Tree is empty. Cannot delete ${value}.`,
      pseudocodeLine: 1,
      state: null,
      auxiliary: { action: 'bst_delete' },
      highlights: {},
      counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
    });
    return { root: null, steps };
  }

  let found = false;

  const deleteNode = (node: TreeNode | null, targetVal: number): TreeNode | null => {
    if (!node) return null;
    iterations++;
    comparisons++;
    path.push(node.value);

    if (targetVal < node.value) {
      steps.push({
        id: steps.length,
        type: 'compare',
        description: `Comparing ${targetVal} < ${node.value}. Target is in the left subtree.`,
        pseudocodeLine: 2,
        state: cloneTree(currentRoot),
        auxiliary: { searchPath: [...path], action: 'bst_delete' },
        highlights: { nodeIds: [node.id] },
        counters: { comparisons, swaps, iterations, arrayAccesses: 1 },
      });
      node.left = deleteNode(node.left, targetVal);
    } else if (targetVal > node.value) {
      steps.push({
        id: steps.length,
        type: 'compare',
        description: `Comparing ${targetVal} > ${node.value}. Target is in the right subtree.`,
        pseudocodeLine: 3,
        state: cloneTree(currentRoot),
        auxiliary: { searchPath: [...path], action: 'bst_delete' },
        highlights: { nodeIds: [node.id] },
        counters: { comparisons, swaps, iterations, arrayAccesses: 1 },
      });
      node.right = deleteNode(node.right, targetVal);
    } else {
      // Node found
      found = true;

      // Case 1: Leaf node (no children)
      if (!node.left && !node.right) {
        swaps++;
        steps.push({
          id: steps.length,
          type: 'delete',
          description: `Node ${targetVal} is a leaf node (has 0 children). Directly removing it by setting parent pointer to null.`,
          pseudocodeLine: 4,
          state: cloneTree(currentRoot),
          auxiliary: { searchPath: [...path], action: 'bst_delete' },
          highlights: { nodeIds: [node.id] },
          counters: { comparisons, swaps, iterations, arrayAccesses: 1 },
        });
        return null;
      }

      // Case 2: One child
      if (!node.left || !node.right) {
        const child = node.left || node.right!;
        swaps++;
        steps.push({
          id: steps.length,
          type: 'delete',
          description: `Node ${targetVal} has only one child (${child.value}). Replacing node ${targetVal} with its child ${child.value}.`,
          pseudocodeLine: 5,
          state: cloneTree(currentRoot),
          auxiliary: { searchPath: [...path], action: 'bst_delete' },
          highlights: { nodeIds: [node.id, child.id] },
          counters: { comparisons, swaps, iterations, arrayAccesses: 2 },
        });
        return child;
      }

      // Case 3: Two children
      // Find inorder successor (smallest node in right subtree)
      let succ = node.right;
      while (succ.left) {
        succ = succ.left;
      }
      const succVal = succ.value;

      steps.push({
        id: steps.length,
        type: 'delete',
        description: `Node ${targetVal} has two children. Finding inorder successor (smallest node in right subtree, which is ${succVal}). Copying value ${succVal} into the node and then removing the successor.`,
        pseudocodeLine: 6,
        state: cloneTree(currentRoot),
        auxiliary: { searchPath: [...path], action: 'bst_delete' },
        highlights: { nodeIds: [node.id, succ.id] },
        counters: { comparisons, swaps, iterations, arrayAccesses: 2 },
      });

      // Copy successor value to this node
      node.value = succVal;
      swaps++;

      steps.push({
        id: steps.length,
        type: 'highlight',
        description: `Successor value ${succVal} copied into node. Now recursively removing original successor ${succVal} from right subtree.`,
        pseudocodeLine: 7,
        state: cloneTree(currentRoot),
        auxiliary: { searchPath: [...path], action: 'bst_delete' },
        highlights: { nodeIds: [node.id] },
        counters: { comparisons, swaps, iterations, arrayAccesses: 2 },
      });

      node.right = deleteNode(node.right, succVal);
    }

    updateNodeStats(node);
    return node;
  };

  currentRoot = deleteNode(currentRoot, value);

  if (!found) {
    steps.push({
      id: steps.length,
      type: 'not_found',
      description: `Value ${value} was not found in the BST. Tree remains unchanged.`,
      pseudocodeLine: 1,
      state: cloneTree(currentRoot),
      auxiliary: { searchPath: [...path], action: 'bst_delete' },
      highlights: {},
      counters: { comparisons, swaps, iterations, arrayAccesses: 1 },
    });
  } else {
    steps.push({
      id: steps.length,
      type: 'complete',
      description: `BST deletion of ${value} completed successfully. Inorder ordering is preserved.`,
      pseudocodeLine: 8,
      state: cloneTree(currentRoot),
      auxiliary: { searchPath: [...path], action: 'bst_delete' },
      highlights: {},
      counters: { comparisons, swaps, iterations, arrayAccesses: 1 },
    });
  }

  return { root: currentRoot, steps };
};

/**
 * AVL Delete Step Generator with Rebalancing & Rotation Cases
 */
export const generateAVLDeleteSteps = (
  root: TreeNode | null,
  value: number
): { root: TreeNode | null; steps: Step<TreeNode | null, TreeAuxiliary>[] } => {
  const steps: Step<TreeNode | null, TreeAuxiliary>[] = [];
  let currentRoot = cloneTree(root);
  const path: number[] = [];

  let comparisons = 0;
  let iterations = 0;
  let swaps = 0;

  steps.push({
    id: 0,
    type: 'start',
    description: `Starting AVL deletion of value ${value}. Tree will rebalance each ancestor to maintain balance factor in [-1, +1].`,
    pseudocodeLine: 1,
    state: cloneTree(currentRoot),
    auxiliary: { searchPath: [], action: 'avl_delete' },
    highlights: {},
    counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
  });

  if (!currentRoot) {
    steps.push({
      id: steps.length,
      type: 'not_found',
      description: `AVL Tree is empty. Cannot delete ${value}.`,
      pseudocodeLine: 1,
      state: null,
      auxiliary: { action: 'avl_delete' },
      highlights: {},
      counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
    });
    return { root: null, steps };
  }

  let found = false;

  const deleteAVL = (node: TreeNode | null, targetVal: number): TreeNode | null => {
    if (!node) return null;
    iterations++;
    comparisons++;
    path.push(node.value);

    if (targetVal < node.value) {
      steps.push({
        id: steps.length,
        type: 'compare',
        description: `Comparing ${targetVal} < ${node.value}. Target is in the left subtree.`,
        pseudocodeLine: 2,
        state: cloneTree(currentRoot),
        auxiliary: { searchPath: [...path], action: 'avl_delete' },
        highlights: { nodeIds: [node.id] },
        counters: { comparisons, swaps, iterations, arrayAccesses: 1 },
      });
      node.left = deleteAVL(node.left, targetVal);
    } else if (targetVal > node.value) {
      steps.push({
        id: steps.length,
        type: 'compare',
        description: `Comparing ${targetVal} > ${node.value}. Target is in the right subtree.`,
        pseudocodeLine: 3,
        state: cloneTree(currentRoot),
        auxiliary: { searchPath: [...path], action: 'avl_delete' },
        highlights: { nodeIds: [node.id] },
        counters: { comparisons, swaps, iterations, arrayAccesses: 1 },
      });
      node.right = deleteAVL(node.right, targetVal);
    } else {
      // Node found
      found = true;

      // Case 1: Leaf node (no children)
      if (!node.left && !node.right) {
        swaps++;
        steps.push({
          id: steps.length,
          type: 'delete',
          description: `Node ${targetVal} is a leaf node (has 0 children). Removing it.`,
          pseudocodeLine: 4,
          state: cloneTree(currentRoot),
          auxiliary: { searchPath: [...path], action: 'avl_delete' },
          highlights: { nodeIds: [node.id] },
          counters: { comparisons, swaps, iterations, arrayAccesses: 1 },
        });
        return null;
      }

      // Case 2: One child
      if (!node.left || !node.right) {
        const child = node.left || node.right!;
        swaps++;
        steps.push({
          id: steps.length,
          type: 'delete',
          description: `Node ${targetVal} has one child (${child.value}). Replacing node with its child ${child.value}.`,
          pseudocodeLine: 5,
          state: cloneTree(currentRoot),
          auxiliary: { searchPath: [...path], action: 'avl_delete' },
          highlights: { nodeIds: [node.id, child.id] },
          counters: { comparisons, swaps, iterations, arrayAccesses: 2 },
        });
        return child;
      }

      // Case 3: Two children (inorder successor)
      let succ = node.right;
      while (succ.left) {
        succ = succ.left;
      }
      const succVal = succ.value;

      steps.push({
        id: steps.length,
        type: 'delete',
        description: `Node ${targetVal} has two children. Finding inorder successor (smallest node in right subtree, which is ${succVal}). Copying value ${succVal} into the node and then removing the successor.`,
        pseudocodeLine: 6,
        state: cloneTree(currentRoot),
        auxiliary: { searchPath: [...path], action: 'avl_delete' },
        highlights: { nodeIds: [node.id, succ.id] },
        counters: { comparisons, swaps, iterations, arrayAccesses: 2 },
      });

      node.value = succVal;
      swaps++;

      node.right = deleteAVL(node.right, succVal);
    }

    if (!node) return null;

    updateNodeStats(node);
    const balance = node.balanceFactor;

    // Check balancing conditions (LL, RR, LR, RL)
    // Left-Left (LL) Case
    if (balance > 1 && node.left && node.left.balanceFactor >= 0) {
      swaps++;
      steps.push({
        id: steps.length,
        type: 'rotate',
        description: `UNBALANCED NODE detected at ${node.value} (Balance Factor = +2, left child BF >= 0). Left-Left (LL) Case after deletion. Performing RIGHT ROTATION.`,
        pseudocodeLine: 7,
        state: cloneTree(currentRoot),
        auxiliary: {
          searchPath: [...path],
          rotationCase: 'LL',
          unbalancedNodeId: node.id,
          action: 'avl_delete',
        },
        highlights: { nodeIds: [node.id] },
        counters: { comparisons, swaps, iterations, arrayAccesses: 2 },
      });
      return rotateRight(node);
    }

    // Left-Right (LR) Case
    if (balance > 1 && node.left && node.left.balanceFactor < 0) {
      swaps += 2;
      steps.push({
        id: steps.length,
        type: 'rotate',
        description: `UNBALANCED NODE detected at ${node.value} (Balance Factor = +2, left child BF < 0). Left-Right (LR) Case after deletion. Performing LEFT rotation on left child (${node.left.value}), then RIGHT rotation on ${node.value}.`,
        pseudocodeLine: 9,
        state: cloneTree(currentRoot),
        auxiliary: {
          searchPath: [...path],
          rotationCase: 'LR',
          unbalancedNodeId: node.id,
          action: 'avl_delete',
        },
        highlights: { nodeIds: [node.id, node.left.id] },
        counters: { comparisons, swaps, iterations, arrayAccesses: 3 },
      });
      node.left = rotateLeft(node.left);
      return rotateRight(node);
    }

    // Right-Right (RR) Case
    if (balance < -1 && node.right && node.right.balanceFactor <= 0) {
      swaps++;
      steps.push({
        id: steps.length,
        type: 'rotate',
        description: `UNBALANCED NODE detected at ${node.value} (Balance Factor = -2, right child BF <= 0). Right-Right (RR) Case after deletion. Performing LEFT ROTATION.`,
        pseudocodeLine: 8,
        state: cloneTree(currentRoot),
        auxiliary: {
          searchPath: [...path],
          rotationCase: 'RR',
          unbalancedNodeId: node.id,
          action: 'avl_delete',
        },
        highlights: { nodeIds: [node.id] },
        counters: { comparisons, swaps, iterations, arrayAccesses: 2 },
      });
      return rotateLeft(node);
    }

    // Right-Left (RL) Case
    if (balance < -1 && node.right && node.right.balanceFactor > 0) {
      swaps += 2;
      steps.push({
        id: steps.length,
        type: 'rotate',
        description: `UNBALANCED NODE detected at ${node.value} (Balance Factor = -2, right child BF > 0). Right-Left (RL) Case after deletion. Performing RIGHT rotation on right child (${node.right.value}), then LEFT rotation on ${node.value}.`,
        pseudocodeLine: 10,
        state: cloneTree(currentRoot),
        auxiliary: {
          searchPath: [...path],
          rotationCase: 'RL',
          unbalancedNodeId: node.id,
          action: 'avl_delete',
        },
        highlights: { nodeIds: [node.id, node.right.id] },
        counters: { comparisons, swaps, iterations, arrayAccesses: 3 },
      });
      node.right = rotateRight(node.right);
      return rotateLeft(node);
    }

    return node;
  };

  currentRoot = deleteAVL(currentRoot, value);

  if (!found) {
    steps.push({
      id: steps.length,
      type: 'not_found',
      description: `Value ${value} was not found in the AVL Tree. Tree remains unchanged.`,
      pseudocodeLine: 1,
      state: cloneTree(currentRoot),
      auxiliary: { searchPath: [...path], action: 'avl_delete' },
      highlights: {},
      counters: { comparisons, swaps, iterations, arrayAccesses: 1 },
    });
  } else {
    steps.push({
      id: steps.length,
      type: 'complete',
      description: `AVL deletion of ${value} completed. Tree height and balance factors are maintained.`,
      pseudocodeLine: 8,
      state: cloneTree(currentRoot),
      auxiliary: { searchPath: [...path], action: 'avl_delete' },
      highlights: {},
      counters: { comparisons, swaps, iterations, arrayAccesses: 1 },
    });
  }

  return { root: currentRoot, steps };
};
