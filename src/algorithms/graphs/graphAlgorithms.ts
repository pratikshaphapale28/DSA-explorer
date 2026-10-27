import type { AlgorithmDefinition, Step } from '../../engine/types';

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
}

export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  isDirected: boolean;
  isWeighted: boolean;
}

export interface GraphAuxiliary {
  visitedNodeIds: string[];
  traversalOrder: string[];
  queue?: string[];
  stack?: string[];
  distanceTable?: Record<string, number>;
  previousTable?: Record<string, string | null>;
  priorityQueue?: { nodeId: string; dist: number }[];
  shortestPath?: string[];
  relaxingEdge?: { from: string; to: string; oldDist: number; newDist: number };
  errorMessage?: string;
  isUnrun?: boolean;
  currentNodeId?: string;
  inspectingNodeId?: string;
}

/**
 * BFS Algorithm Step Generator
 */
export const bfsAlgorithm: AlgorithmDefinition<
  { graph: GraphState; startNodeId: string },
  GraphState,
  GraphAuxiliary
> = {
  id: 'bfs',
  name: 'Breadth-First Search (BFS)',
  category: 'graphs',
  categoryLabel: 'Graphs',
  summary: 'Explores the graph level by level using a FIFO Queue, visiting all immediate neighbors before moving to the next distance horizon.',
  complexity: {
    best: 'O(V + E)',
    average: 'O(V + E)',
    worst: 'O(V + E)',
    space: 'O(V)',
    explanation: 'Visits every vertex once and checks each outgoing edge once. Queue holds up to O(V) vertices at maximum breadth.',
    realWorldAnalogy: 'Ripples spreading across a pond: wave expands outward equidistant in all directions from the center drop.',
  },
  pseudocode: [
    'procedure BFS(G, start):',
    '  queue = new Queue()',
    '  visited = new Set([start])',
    '  queue.enqueue(start)',
    '  while not queue.isEmpty():',
    '    u = queue.dequeue()',
    '    for each neighbor v of u:',
    '      if v not in visited: visited.add(v); queue.enqueue(v)',
  ],
  defaultInput: {
    graph: { nodes: [], edges: [], isDirected: false, isWeighted: false },
    startNodeId: '',
  },
  generateSteps: ({ graph, startNodeId }): Step<GraphState, GraphAuxiliary>[] => {
    const steps: Step<GraphState, GraphAuxiliary>[] = [];
    const nodes = graph.nodes;
    const edges = graph.edges;

    if (nodes.length === 0 || !nodes.find(n => n.id === startNodeId)) {
      return steps;
    }

    const visited = new Set<string>();
    const traversalOrder: string[] = [];
    const queue: string[] = [startNodeId];
    visited.add(startNodeId);

    let comparisons = 0;
    let iterations = 0;
    let arrayAccesses = 1;

    // Helper to get neighbors
    const getNeighbors = (uId: string) => {
      const neighbors: { to: string; edgeId: string }[] = [];
      for (const e of edges) {
        if (e.from === uId) {
          neighbors.push({ to: e.to, edgeId: e.id });
        } else if (!graph.isDirected && e.to === uId) {
          neighbors.push({ to: e.from, edgeId: e.id });
        }
      }
      return neighbors;
    };

    steps.push({
      id: 0,
      type: 'start',
      description: `Starting BFS at node "${startNodeId}". Added to visited set and ENQUEUEd into queue.`,
      pseudocodeLine: 4,
      state: { ...graph },
      auxiliary: {
        visitedNodeIds: Array.from(visited),
        traversalOrder: [],
        queue: [...queue],
        currentNodeId: startNodeId,
      },
      highlights: { nodeIds: [startNodeId] },
      counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 1 },
    });

    while (queue.length > 0) {
      iterations++;
      const u = queue.shift()!;
      traversalOrder.push(u);

      steps.push({
        id: steps.length,
        type: 'dequeue',
        description: `DEQUEUEd node "${u}" from front of queue. Visiting its unvisited neighbors.`,
        pseudocodeLine: 6,
        state: { ...graph },
        auxiliary: {
          visitedNodeIds: Array.from(visited),
          traversalOrder: [...traversalOrder],
          queue: [...queue],
          currentNodeId: u,
        },
        highlights: { nodeIds: [u] },
        counters: { comparisons, swaps: 0, iterations, arrayAccesses },
      });

      const neighbors = getNeighbors(u);

      for (const { to: v, edgeId } of neighbors) {
        comparisons++;
        arrayAccesses++;

        steps.push({
          id: steps.length,
          type: 'visit',
          description: `Examining neighbor "${v}" via edge (${u} -> ${v}).`,
          pseudocodeLine: 7,
          state: { ...graph },
          auxiliary: {
            visitedNodeIds: Array.from(visited),
            traversalOrder: [...traversalOrder],
            queue: [...queue],
            currentNodeId: u,
            inspectingNodeId: v,
          },
          highlights: {
            nodeIds: [u, v],
            edgeIds: [edgeId],
          },
          counters: { comparisons, swaps: 0, iterations, arrayAccesses },
        });

        if (!visited.has(v)) {
          visited.add(v);
          queue.push(v);

          steps.push({
            id: steps.length,
            type: 'enqueue',
            description: `Neighbor "${v}" was unvisited! Marked visited and ENQUEUEd into queue.`,
            pseudocodeLine: 8,
            state: { ...graph },
            auxiliary: {
              visitedNodeIds: Array.from(visited),
              traversalOrder: [...traversalOrder],
              queue: [...queue],
              currentNodeId: u,
              inspectingNodeId: v,
            },
            highlights: {
              nodeIds: [v],
              edgeIds: [edgeId],
            },
            counters: { comparisons, swaps: 0, iterations, arrayAccesses },
          });
        }
      }
    }

    steps.push({
      id: steps.length,
      type: 'complete',
      description: `BFS completed! Visited ${traversalOrder.length} reachable nodes: [${traversalOrder.join(' -> ')}].`,
      pseudocodeLine: 5,
      state: { ...graph },
      auxiliary: {
        visitedNodeIds: Array.from(visited),
        traversalOrder: [...traversalOrder],
        queue: [],
        currentNodeId: undefined,
      },
      highlights: { nodeIds: traversalOrder },
      counters: { comparisons, swaps: 0, iterations, arrayAccesses },
    });

    return steps;
  },
};

/**
 * DFS Algorithm Step Generator
 */
export const dfsAlgorithm: AlgorithmDefinition<
  { graph: GraphState; startNodeId: string },
  GraphState,
  GraphAuxiliary
> = {
  id: 'dfs',
  name: 'Depth-First Search (DFS)',
  category: 'graphs',
  categoryLabel: 'Graphs',
  summary: 'Explores as deep as possible along each branch before backtracking, utilizing a LIFO Call Stack.',
  complexity: {
    best: 'O(V + E)',
    average: 'O(V + E)',
    worst: 'O(V + E)',
    space: 'O(V)',
    explanation: 'Visits all vertices and edges. Recursion/call stack depth can reach O(V) in long linear chain graphs.',
    realWorldAnalogy: 'Solving a maze by walking as far as possible down one passage until hitting a dead end, then backtracking to the last fork.',
  },
  pseudocode: [
    'procedure DFS(G, start):',
    '  stack = [start]',
    '  visited = new Set()',
    '  while not stack.isEmpty():',
    '    u = stack.pop()',
    '    if u not in visited:',
    '      visited.add(u)',
    '      for each neighbor v of u: stack.push(v)',
  ],
  defaultInput: {
    graph: { nodes: [], edges: [], isDirected: false, isWeighted: false },
    startNodeId: '',
  },
  generateSteps: ({ graph, startNodeId }): Step<GraphState, GraphAuxiliary>[] => {
    const steps: Step<GraphState, GraphAuxiliary>[] = [];
    const nodes = graph.nodes;
    const edges = graph.edges;

    if (nodes.length === 0 || !nodes.find(n => n.id === startNodeId)) {
      return steps;
    }

    const visited = new Set<string>();
    const traversalOrder: string[] = [];
    const stack: string[] = [startNodeId];

    let comparisons = 0;
    let iterations = 0;
    let arrayAccesses = 1;

    const getNeighbors = (uId: string) => {
      const neighbors: { to: string; edgeId: string }[] = [];
      for (const e of edges) {
        if (e.from === uId) {
          neighbors.push({ to: e.to, edgeId: e.id });
        } else if (!graph.isDirected && e.to === uId) {
          neighbors.push({ to: e.from, edgeId: e.id });
        }
      }
      return neighbors;
    };

    steps.push({
      id: 0,
      type: 'start',
      description: `Starting DFS at root "${startNodeId}". Pushed onto LIFO execution stack.`,
      pseudocodeLine: 2,
      state: { ...graph },
      auxiliary: {
        visitedNodeIds: [],
        traversalOrder: [],
        stack: [...stack],
        currentNodeId: startNodeId,
      },
      highlights: { nodeIds: [startNodeId] },
      counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 1 },
    });

    while (stack.length > 0) {
      iterations++;
      const u = stack.pop()!;

      if (!visited.has(u)) {
        visited.add(u);
        traversalOrder.push(u);

        steps.push({
          id: steps.length,
          type: 'visit',
          description: `POPPED node "${u}" from stack. Marked as VISITED (depth-first order position ${traversalOrder.length}).`,
          pseudocodeLine: 7,
          state: { ...graph },
          auxiliary: {
            visitedNodeIds: Array.from(visited),
            traversalOrder: [...traversalOrder],
            stack: [...stack],
            currentNodeId: u,
          },
          highlights: { nodeIds: [u] },
          counters: { comparisons, swaps: 0, iterations, arrayAccesses },
        });

        const neighbors = getNeighbors(u);
        // Push in reverse so left-to-right order is preserved
        for (let i = neighbors.length - 1; i >= 0; i--) {
          const { to: v, edgeId } = neighbors[i];
          comparisons++;
          if (!visited.has(v)) {
            stack.push(v);
            arrayAccesses++;

            steps.push({
              id: steps.length,
              type: 'push',
              description: `PUSHed unvisited neighbor "${v}" onto stack for future exploration.`,
              pseudocodeLine: 8,
              state: { ...graph },
              auxiliary: {
                visitedNodeIds: Array.from(visited),
                traversalOrder: [...traversalOrder],
                stack: [...stack],
                currentNodeId: u,
                inspectingNodeId: v,
              },
              highlights: { nodeIds: [u, v], edgeIds: [edgeId] },
              counters: { comparisons, swaps: 0, iterations, arrayAccesses },
            });
          }
        }
      }
    }

    steps.push({
      id: steps.length,
      type: 'complete',
      description: `DFS traversal complete! Visited sequence: [${traversalOrder.join(' -> ')}].`,
      pseudocodeLine: 4,
      state: { ...graph },
      auxiliary: {
        visitedNodeIds: Array.from(visited),
        traversalOrder: [...traversalOrder],
        stack: [],
        currentNodeId: undefined,
      },
      highlights: { nodeIds: traversalOrder },
      counters: { comparisons, swaps: 0, iterations, arrayAccesses },
    });

    return steps;
  },
};

/**
 * Dijkstra Shortest Path Algorithm Step Generator
 */
export const dijkstraAlgorithm: AlgorithmDefinition<
  { graph: GraphState; startNodeId: string; targetNodeId?: string },
  GraphState,
  GraphAuxiliary
> = {
  id: 'dijkstra',
  name: "Dijkstra's Shortest Path Algorithm",
  category: 'graphs',
  categoryLabel: 'Graphs',
  summary: 'Greedy algorithm that finds the shortest path between nodes in a weighted graph with non-negative edge weights using a Priority Queue.',
  complexity: {
    best: 'O((V + E) log V)',
    average: 'O((V + E) log V)',
    worst: 'O((V + E) log V)',
    space: 'O(V)',
    explanation: 'Uses a min-priority queue (or min-distance selection). Every vertex is extracted once and each edge is relaxed once.',
    realWorldAnalogy: 'GPS satellite navigation recomputing optimal route: checks the nearest intersection with the shortest travel time first.',
  },
  pseudocode: [
    'procedure Dijkstra(G, start):',
    '  dist[v] = infinity for all v; dist[start] = 0',
    '  PQ = new MinPriorityQueue([(start, 0)])',
    '  while not PQ.isEmpty():',
    '    (u, d) = PQ.extractMin()',
    '    for each neighbor (v, weight) of u:',
    '      if dist[u] + weight < dist[v]:',
    '        dist[v] = dist[u] + weight; prev[v] = u; PQ.insert(v, dist[v])',
  ],
  defaultInput: {
    graph: { nodes: [], edges: [], isDirected: false, isWeighted: true },
    startNodeId: '',
  },
  generateSteps: ({ graph, startNodeId, targetNodeId }): Step<GraphState, GraphAuxiliary>[] => {
    const steps: Step<GraphState, GraphAuxiliary>[] = [];
    const nodes = graph.nodes;
    const edges = graph.edges;

    if (nodes.length === 0 || !nodes.find(n => n.id === startNodeId)) {
      return steps;
    }

    // 1. Negative weight check (Dijkstra requirement)
    const negativeEdge = edges.find(e => e.weight < 0);
    if (negativeEdge) {
      steps.push({
        id: 0,
        type: 'highlight',
        description: `INVALID WEIGHT: Edge (${negativeEdge.from} -> ${negativeEdge.to}) has negative weight ${negativeEdge.weight}. Dijkstra's algorithm requires all non-negative weights! Use Bellman-Ford for negative weights.`,
        pseudocodeLine: 1,
        state: { ...graph },
        auxiliary: {
          visitedNodeIds: [],
          traversalOrder: [],
          errorMessage: 'Negative edge weight detected. Dijkstra cannot guarantee shortest path.',
        },
        highlights: { edgeIds: [negativeEdge.id] },
        counters: { comparisons: 1, swaps: 0, iterations: 0, arrayAccesses: 0 },
      });
      return steps;
    }

    // Distance and previous tables
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const settled = new Set<string>();

    for (const node of nodes) {
      distances[node.id] = Infinity;
      previous[node.id] = null;
    }
    distances[startNodeId] = 0;

    let pq: { nodeId: string; dist: number }[] = [{ nodeId: startNodeId, dist: 0 }];

    let comparisons = 0;
    let iterations = 0;
    let arrayAccesses = nodes.length;

    steps.push({
      id: 0,
      type: 'start',
      description: `Starting Dijkstra from "${startNodeId}". Distances to all other nodes initialized to ∞, distance to start = 0.`,
      pseudocodeLine: 2,
      state: { ...graph },
      auxiliary: {
        visitedNodeIds: [],
        traversalOrder: [],
        distanceTable: { ...distances },
        previousTable: { ...previous },
        priorityQueue: [...pq],
      },
      highlights: { nodeIds: [startNodeId] },
      counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses },
    });

    while (pq.length > 0) {
      iterations++;
      // Extract node with minimum distance
      pq.sort((a, b) => a.dist - b.dist);
      const { nodeId: u, dist: d } = pq.shift()!;

      if (settled.has(u)) continue;
      settled.add(u);

      steps.push({
        id: steps.length,
        type: 'visit',
        description: `Extract-Min: Node "${u}" has minimum tentative distance ${d}. Marking permanently settled.`,
        pseudocodeLine: 5,
        state: { ...graph },
        auxiliary: {
          visitedNodeIds: Array.from(settled),
          traversalOrder: Array.from(settled),
          distanceTable: { ...distances },
          previousTable: { ...previous },
          priorityQueue: [...pq],
          currentNodeId: u,
        },
        highlights: { nodeIds: [u] },
        counters: { comparisons, swaps: 0, iterations, arrayAccesses },
      });

      if (targetNodeId && u === targetNodeId) {
        steps.push({
          id: steps.length,
          type: 'found',
          description: `Target node "${targetNodeId}" has been settled! Shortest path guaranteed with total distance ${d}.`,
          pseudocodeLine: 5,
          state: { ...graph },
          auxiliary: {
            visitedNodeIds: Array.from(settled),
            traversalOrder: Array.from(settled),
            distanceTable: { ...distances },
            previousTable: { ...previous },
            priorityQueue: [...pq],
            currentNodeId: u,
          },
          highlights: { nodeIds: [u] },
          counters: { comparisons, swaps: 0, iterations, arrayAccesses },
        });
        break;
      }

      // Find outgoing neighbors
      for (const e of edges) {
        let v: string | null = null;
        if (e.from === u) v = e.to;
        else if (!graph.isDirected && e.to === u) v = e.from;

        if (v && !settled.has(v)) {
          comparisons++;
          arrayAccesses += 2;
          const oldDist = distances[v];
          const newDist = d + e.weight;

          steps.push({
            id: steps.length,
            type: 'compare',
            description: `Inspecting edge (${u} -> ${v}, wt: ${e.weight}). Current dist to ${v}: ${oldDist === Infinity ? '∞' : oldDist}. New path via ${u}: ${d} + ${e.weight} = ${newDist}.`,
            pseudocodeLine: 7,
            state: { ...graph },
            auxiliary: {
              visitedNodeIds: Array.from(settled),
              traversalOrder: Array.from(settled),
              distanceTable: { ...distances },
              previousTable: { ...previous },
              priorityQueue: [...pq],
              relaxingEdge: { from: u, to: v, oldDist, newDist },
              currentNodeId: u,
              inspectingNodeId: v,
            },
            highlights: {
              nodeIds: [u, v],
              edgeIds: [e.id],
            },
            counters: { comparisons, swaps: 0, iterations, arrayAccesses },
          });

          if (newDist < oldDist) {
            distances[v] = newDist;
            previous[v] = u;
            pq.push({ nodeId: v, dist: newDist });

            steps.push({
              id: steps.length,
              type: 'relax',
              description: `RELAXATION: Found shorter path to "${v}"! Updating dist[${v}] from ${oldDist === Infinity ? '∞' : oldDist} to ${newDist}. Setting prev[${v}] = ${u}.`,
              pseudocodeLine: 8,
              state: { ...graph },
              auxiliary: {
                visitedNodeIds: Array.from(settled),
                traversalOrder: Array.from(settled),
                distanceTable: { ...distances },
                previousTable: { ...previous },
                priorityQueue: [...pq],
                relaxingEdge: { from: u, to: v, oldDist, newDist },
                currentNodeId: u,
                inspectingNodeId: v,
              },
              highlights: {
                nodeIds: [v],
                edgeIds: [e.id],
              },
              counters: { comparisons, swaps: 0, iterations, arrayAccesses },
            });
          }
        }
      }
    }

    // Reconstruct shortest path if target specified
    const shortestPath: string[] = [];
    const shortestPathEdges: string[] = [];
    if (targetNodeId && distances[targetNodeId] !== Infinity) {
      let curr: string | null = targetNodeId;
      while (curr) {
        shortestPath.unshift(curr);
        const prevNode: string | null = previous[curr];
        if (prevNode) {
          const edge = edges.find(
            e =>
              (e.from === prevNode && e.to === curr) ||
              (!graph.isDirected && e.to === prevNode && e.from === curr)
          );
          if (edge) shortestPathEdges.push(edge.id);
        }
        curr = prevNode;
      }
    }

    steps.push({
      id: steps.length,
      type: 'complete',
      description: targetNodeId
        ? distances[targetNodeId] !== Infinity
          ? `Dijkstra completed! Optimal shortest path to ${targetNodeId} is [${shortestPath.join(' -> ')}] with total distance ${distances[targetNodeId]}.`
          : `Dijkstra completed! Target ${targetNodeId} is UNREACHABLE from ${startNodeId} (distance = ∞).`
        : `Dijkstra completed! All reachable node shortest distances calculated.`,
      pseudocodeLine: 8,
      state: { ...graph },
      auxiliary: {
        visitedNodeIds: Array.from(settled),
        traversalOrder: Array.from(settled),
        distanceTable: { ...distances },
        previousTable: { ...previous },
        priorityQueue: [],
        shortestPath,
        currentNodeId: undefined,
      },
      highlights: {
        nodeIds: shortestPath.length > 0 ? shortestPath : Array.from(settled),
        edgeIds: shortestPathEdges,
      },
      counters: { comparisons, swaps: 0, iterations, arrayAccesses },
    });

    return steps;
  },
};
