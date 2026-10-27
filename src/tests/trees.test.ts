import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateBSTInsertSteps,
  generateAVLInsertSteps,
  getInorderValues,
  checkAVLInvariants,
  generateTraversalSteps,
  type TreeNode,
} from '../algorithms/trees/treeAlgorithms';

test('BST: Inorder traversal is always sorted', () => {
  const values = [50, 30, 70, 20, 40, 60, 80, 15, 25, 35, 45];
  let root: TreeNode | null = null;

  for (const v of values) {
    const res = generateBSTInsertSteps(root, v);
    root = res.root;
  }

  const inorder = getInorderValues(root);
  const expected = [...values].sort((a, b) => a - b);
  assert.deepEqual(inorder, expected, 'BST inorder must match numerically sorted array');
});

test('AVL: Balance factor remains within [-1, 1] across sequential and random insertions', () => {
  // Sequential ascending order (worst case for normal BST, triggers repeated RR rotations in AVL)
  let avlRoot: TreeNode | null = null;
  for (let i = 1; i <= 25; i++) {
    const res = generateAVLInsertSteps(avlRoot, i);
    avlRoot = res.root;
    assert.ok(
      checkAVLInvariants(avlRoot),
      `AVL invariant broken after inserting sequential value ${i}`
    );
  }

  // Random insertions
  let randomRoot: TreeNode | null = null;
  for (let i = 0; i < 40; i++) {
    const v = Math.floor(Math.random() * 200);
    const res = generateAVLInsertSteps(randomRoot, v);
    randomRoot = res.root;
    assert.ok(
      checkAVLInvariants(randomRoot),
      `AVL invariant broken after inserting random value ${v}`
    );
  }
});

test('AVL: Triggers all 4 rotation cases (LL, RR, LR, RL)', () => {
  // Test LL (Right rotation): insert 30, 20, 10
  let rootLL: TreeNode | null = null;
  generateAVLInsertSteps(rootLL, 30);
  rootLL = generateAVLInsertSteps(null, 30).root;
  rootLL = generateAVLInsertSteps(rootLL, 20).root;
  const resLL = generateAVLInsertSteps(rootLL, 10);
  const llStep = resLL.steps.find(s => s.auxiliary?.rotationCase === 'LL');
  assert.ok(llStep, 'Should detect and trigger LL rotation');

  // Test RR (Left rotation): insert 10, 20, 30
  let rootRR = generateAVLInsertSteps(null, 10).root;
  rootRR = generateAVLInsertSteps(rootRR, 20).root;
  const resRR = generateAVLInsertSteps(rootRR, 30);
  const rrStep = resRR.steps.find(s => s.auxiliary?.rotationCase === 'RR');
  assert.ok(rrStep, 'Should detect and trigger RR rotation');

  // Test LR (Left-Right rotation): insert 30, 10, 20
  let rootLR = generateAVLInsertSteps(null, 30).root;
  rootLR = generateAVLInsertSteps(rootLR, 10).root;
  const resLR = generateAVLInsertSteps(rootLR, 20);
  const lrStep = resLR.steps.find(s => s.auxiliary?.rotationCase === 'LR');
  assert.ok(lrStep, 'Should detect and trigger LR rotation');

  // Test RL (Right-Left rotation): insert 10, 30, 20
  let rootRL = generateAVLInsertSteps(null, 10).root;
  rootRL = generateAVLInsertSteps(rootRL, 30).root;
  const resRL = generateAVLInsertSteps(rootRL, 20);
  const rlStep = resRL.steps.find(s => s.auxiliary?.rotationCase === 'RL');
  assert.ok(rlStep, 'Should detect and trigger RL rotation');
});

test('Tree Traversals: Inorder, Preorder, Postorder, and Level-order correctness', () => {
  // Create tree:
  //      20
  //     /  \
  //   10    30
  let root = generateBSTInsertSteps(null, 20).root;
  root = generateBSTInsertSteps(root, 10).root;
  root = generateBSTInsertSteps(root, 30).root;

  // Inorder: 10, 20, 30
  const inSteps = generateTraversalSteps(root, 'inorder');
  const inLast = inSteps[inSteps.length - 1];
  assert.deepEqual(inLast.auxiliary?.traversalOutput, [10, 20, 30]);

  // Preorder: 20, 10, 30
  const preSteps = generateTraversalSteps(root, 'preorder');
  const preLast = preSteps[preSteps.length - 1];
  assert.deepEqual(preLast.auxiliary?.traversalOutput, [20, 10, 30]);

  // Postorder: 10, 30, 20
  const postSteps = generateTraversalSteps(root, 'postorder');
  const postLast = postSteps[postSteps.length - 1];
  assert.deepEqual(postLast.auxiliary?.traversalOutput, [10, 30, 20]);

  // Levelorder: 20, 10, 30
  const lvlSteps = generateTraversalSteps(root, 'levelorder');
  const lvlLast = lvlSteps[lvlSteps.length - 1];
  assert.deepEqual(lvlLast.auxiliary?.traversalOutput, [20, 10, 30]);
});

import {
  generateBSTDeleteSteps,
  generateAVLDeleteSteps,
} from '../algorithms/trees/treeAlgorithms';

test('BST Delete: correctly handles leaf, single-child, and two-children node deletion', () => {
  // Build tree:
  //         50
  //       /    \
  //      30     70
  //     /  \   /  \
  //    20  40 60  80
  let root: TreeNode | null = generateBSTInsertSteps(null, 50).root;
  for (const v of [30, 70, 20, 40, 60, 80]) {
    root = generateBSTInsertSteps(root, v).root;
  }

  // 1. Delete leaf node (20)
  const leafRes = generateBSTDeleteSteps(root, 20);
  root = leafRes.root;
  assert.deepEqual(getInorderValues(root), [30, 40, 50, 60, 70, 80]);
  const leafStep = leafRes.steps.find(s => s.description.includes('is a leaf node'));
  assert.ok(leafStep, 'Should identify leaf node deletion');

  // 2. Delete node with 1 child (30 now has only right child 40)
  const singleChildRes = generateBSTDeleteSteps(root, 30);
  root = singleChildRes.root;
  assert.deepEqual(getInorderValues(root), [40, 50, 60, 70, 80]);
  const singleStep = singleChildRes.steps.find(s => s.description.includes('has only one child'));
  assert.ok(singleStep, 'Should identify single-child node deletion');

  // 3. Delete node with 2 children (root 50, children 40 and 70)
  const twoChildRes = generateBSTDeleteSteps(root, 50);
  root = twoChildRes.root;
  assert.deepEqual(getInorderValues(root), [40, 60, 70, 80]);
  const succStep = twoChildRes.steps.find(s =>
    s.description.includes('Copying value 60 into the node and then removing the successor')
  );
  assert.ok(succStep, 'Should find inorder successor and explain copying its value');
});

test('AVL Delete: balance factor remains within [-1, 1] after every insertion and deletion across 100+ operations', () => {
  let avlRoot: TreeNode | null = null;
  const values = [40, 20, 60, 10, 30, 50, 70, 5, 15, 25, 35, 45, 55, 65, 75];

  // Insert all
  for (const v of values) {
    avlRoot = generateAVLInsertSteps(avlRoot, v).root;
    assert.ok(checkAVLInvariants(avlRoot), `AVL invariant broken after inserting ${v}`);
  }

  // Delete elements one by one, checking invariants after EVERY deletion
  for (const v of values) {
    const res = generateAVLDeleteSteps(avlRoot, v);
    avlRoot = res.root;
    assert.ok(checkAVLInvariants(avlRoot), `AVL invariant broken after deleting ${v}`);
  }

  // Random stress test: 100 random inserts and deletes
  let stressRoot: TreeNode | null = null;
  const inserted: number[] = [];
  for (let i = 0; i < 50; i++) {
    const v = Math.floor(Math.random() * 500) + 1;
    stressRoot = generateAVLInsertSteps(stressRoot, v).root;
    inserted.push(v);
    assert.ok(checkAVLInvariants(stressRoot), `Stress test AVL invariant broken on insert ${v}`);
  }

  for (const v of inserted) {
    const res = generateAVLDeleteSteps(stressRoot, v);
    stressRoot = res.root;
    assert.ok(checkAVLInvariants(stressRoot), `Stress test AVL invariant broken on delete ${v}`);
  }
});

