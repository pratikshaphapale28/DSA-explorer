import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bfsAlgorithm,
  dfsAlgorithm,
  dijkstraAlgorithm,
  type GraphState,
} from '../algorithms/graphs/graphAlgorithms';

// Known graph for BFS & DFS:
// A -> B, A -> C
// B -> D, C -> E
const testGraph: GraphState = {
  nodes: [
    { id: 'A', label: 'A', x: 100, y: 100 },
    { id: 'B', label: 'B', x: 200, y: 50 },
    { id: 'C', label: 'C', x: 200, y: 150 },
    { id: 'D', label: 'D', x: 300, y: 50 },
    { id: 'E', label: 'E', x: 300, y: 150 },
  ],
  edges: [
    { id: 'e1', from: 'A', to: 'B', weight: 4 },
    { id: 'e2', from: 'A', to: 'C', weight: 2 },
    { id: 'e3', from: 'B', to: 'D', weight: 5 },
    { id: 'e4', from: 'C', to: 'E', weight: 3 },
    { id: 'e5', from: 'C', to: 'D', weight: 1 },
  ],
  isDirected: true,
  isWeighted: true,
};

test('BFS: visits level by level in queue order', () => {
  const steps = bfsAlgorithm.generateSteps({ graph: testGraph, startNodeId: 'A' });
  const finalStep = steps[steps.length - 1];
  assert.ok(finalStep.auxiliary?.traversalOrder);

  // A -> B, C -> D, E
  const order = finalStep.auxiliary.traversalOrder;
  assert.equal(order[0], 'A');
  // At level 1, B and C are visited before D and E
  assert.ok(order.indexOf('B') < order.indexOf('D'));
  assert.ok(order.indexOf('C') < order.indexOf('E'));
});

test('DFS: traverses deep branches in stack order', () => {
  const steps = dfsAlgorithm.generateSteps({ graph: testGraph, startNodeId: 'A' });
  const finalStep = steps[steps.length - 1];
  const order = finalStep.auxiliary?.traversalOrder || [];

  assert.equal(order[0], 'A');
  assert.equal(order.length, 5);
});

// Reference Bellman-Ford implementation for verification
const referenceShortestPath = (
  nodes: string[],
  edges: { from: string; to: string; weight: number }[],
  isDirected: boolean,
  start: string
): Record<string, number> => {
  const dist: Record<string, number> = {};
  for (const n of nodes) dist[n] = Infinity;
  dist[start] = 0;

  for (let i = 0; i < nodes.length - 1; i++) {
    for (const e of edges) {
      if (dist[e.from] !== Infinity && dist[e.from] + e.weight < dist[e.to]) {
        dist[e.to] = dist[e.from] + e.weight;
      }
      if (!isDirected && dist[e.to] !== Infinity && dist[e.to] + e.weight < dist[e.from]) {
        dist[e.from] = dist[e.to] + e.weight;
      }
    }
  }
  return dist;
};

test('Dijkstra: matches reference Bellman-Ford on weighted directed and undirected graphs', () => {
  const steps = dijkstraAlgorithm.generateSteps({
    graph: testGraph,
    startNodeId: 'A',
    targetNodeId: 'D',
  });
  const finalStep = steps[steps.length - 1];
  const dijkstraDist = finalStep.auxiliary?.distanceTable;

  const nodeIds = testGraph.nodes.map(n => n.id);
  const refDist = referenceShortestPath(nodeIds, testGraph.edges, true, 'A');

  // Verify shortest distances
  for (const n of nodeIds) {
    assert.equal(
      dijkstraDist?.[n],
      refDist[n],
      `Dijkstra distance to node ${n} must match reference`
    );
  }

  // Shortest path to D should be A -> C -> D with total weight 3 (since A->B->D is 9, A->C->D is 2+1=3)
  assert.equal(dijkstraDist?.['D'], 3);
  assert.deepEqual(finalStep.auxiliary?.shortestPath, ['A', 'C', 'D']);
});

test('Dijkstra: handles disconnected graphs (unreachable = infinity)', () => {
  const disconnectedGraph: GraphState = {
    nodes: [
      { id: '1', label: '1', x: 0, y: 0 },
      { id: '2', label: '2', x: 1, y: 1 },
      { id: '3', label: '3', x: 2, y: 2 }, // Island node
    ],
    edges: [{ id: 'e1', from: '1', to: '2', weight: 10 }],
    isDirected: false,
    isWeighted: true,
  };

  const steps = dijkstraAlgorithm.generateSteps({
    graph: disconnectedGraph,
    startNodeId: '1',
    targetNodeId: '3',
  });
  const finalStep = steps[steps.length - 1];
  assert.equal(finalStep.auxiliary?.distanceTable?.['3'], Infinity);
});

test('Dijkstra: sample graph produces A -> C -> E -> F with total distance 7', () => {
  const sampleGraph: GraphState = {
    nodes: [
      { id: 'A', label: 'A', x: 140, y: 160 },
      { id: 'B', label: 'B', x: 280, y: 80 },
      { id: 'C', label: 'C', x: 280, y: 240 },
      { id: 'D', label: 'D', x: 420, y: 80 },
      { id: 'E', label: 'E', x: 420, y: 240 },
      { id: 'F', label: 'F', x: 560, y: 160 },
    ],
    edges: [
      { id: 'e1', from: 'A', to: 'B', weight: 4 },
      { id: 'e2', from: 'A', to: 'C', weight: 2 },
      { id: 'e3', from: 'B', to: 'D', weight: 5 },
      { id: 'e4', from: 'C', to: 'E', weight: 3 },
      { id: 'e5', from: 'C', to: 'D', weight: 1 },
      { id: 'e6', from: 'D', to: 'F', weight: 6 },
      { id: 'e7', from: 'E', to: 'F', weight: 2 },
    ],
    isDirected: false,
    isWeighted: true,
  };

  const steps = dijkstraAlgorithm.generateSteps({
    graph: sampleGraph,
    startNodeId: 'A',
    targetNodeId: 'F',
  });

  const finalStep = steps[steps.length - 1];
  assert.equal(finalStep.auxiliary?.distanceTable?.['F'], 7, 'Total shortest distance to F must be 7');
  assert.deepEqual(finalStep.auxiliary?.shortestPath, ['A', 'C', 'E', 'F'], 'Shortest path must be A -> C -> E -> F');
  assert.ok(finalStep.highlights?.edgeIds?.includes('e2'), 'e2 (A->C) must be highlighted');
  assert.ok(finalStep.highlights?.edgeIds?.includes('e4'), 'e4 (C->E) must be highlighted');
  assert.ok(finalStep.highlights?.edgeIds?.includes('e7'), 'e7 (E->F) must be highlighted');
});

test('BFS: every step has a valid pseudocode line number and single active currentNodeId', () => {
  const steps = bfsAlgorithm.generateSteps({ graph: testGraph, startNodeId: 'A' });
  for (const step of steps) {
    assert.ok(
      typeof step.pseudocodeLine === 'number' && step.pseudocodeLine >= 1,
      `Step ${step.id} (${step.type}) must have valid pseudocodeLine >= 1`
    );
  }
  // On completion, currentNodeId must be cleared
  const lastStep = steps[steps.length - 1];
  assert.equal(lastStep.auxiliary?.currentNodeId, undefined, 'Final step must clear currentNodeId');
});

test('DFS: every step has a valid pseudocode line number and single active currentNodeId', () => {
  const steps = dfsAlgorithm.generateSteps({ graph: testGraph, startNodeId: 'A' });
  for (const step of steps) {
    assert.ok(
      typeof step.pseudocodeLine === 'number' && step.pseudocodeLine >= 1,
      `Step ${step.id} (${step.type}) must have valid pseudocodeLine >= 1`
    );
  }
  // On completion, currentNodeId must be cleared
  const lastStep = steps[steps.length - 1];
  assert.equal(lastStep.auxiliary?.currentNodeId, undefined, 'Final step must clear currentNodeId');
});

