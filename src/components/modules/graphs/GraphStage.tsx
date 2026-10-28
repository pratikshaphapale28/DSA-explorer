import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../../../engine/PlayerContext';
import {
  bfsAlgorithm,
  dfsAlgorithm,
  dijkstraAlgorithm,
  type GraphState,
  type GraphNode,
  type GraphEdge,
  type GraphAuxiliary,
} from '../../../algorithms/graphs/graphAlgorithms';
import type { AlgorithmDefinition } from '../../../engine/types';
import { Network, Play, RotateCcw, Plus, Trash2, ArrowRight, Table, Layers, AlertCircle } from 'lucide-react';

interface GraphStageProps {
  onAlgorithmChange: (algo: AlgorithmDefinition<any, any, any>) => void;
}

export const GraphStage: React.FC<GraphStageProps> = ({ onAlgorithmChange }) => {
  const { currentStep, currentStepIndex, loadSteps } = usePlayer();

  const [graph, setGraph] = useState<GraphState>({
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
  });

  const [activeAlgoId, setActiveAlgoId] = useState<'bfs' | 'dfs' | 'dijkstra'>('dijkstra');
  const [startNodeId, setStartNodeId] = useState<string>('A');
  const [targetNodeId, setTargetNodeId] = useState<string>('F');
  const [hasRun, setHasRun] = useState<boolean>(false);

  // Interaction mode: 'select' | 'add_node' | 'add_edge'
  const [interactionMode, setInteractionMode] = useState<'select' | 'add_node' | 'add_edge'>('select');
  const [edgeStartNode, setEdgeStartNode] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<{ type: 'node' | 'edge'; id: string } | null>(null);

  // Dragging node state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Initialize idle step on mount and when algorithm/start node changes before running
  const initIdleStep = (algoId: 'bfs' | 'dfs' | 'dijkstra', currentGraph: GraphState, startId: string) => {
    const algo =
      algoId === 'bfs'
        ? bfsAlgorithm
        : algoId === 'dfs'
        ? dfsAlgorithm
        : dijkstraAlgorithm;
    onAlgorithmChange(algo);

    loadSteps([
      {
        id: 0,
        type: 'start',
        description: `Press Run to start ${algo.name} from node ${startId}.`,
        pseudocodeLine: 1,
        state: currentGraph,
        auxiliary: {
          isUnrun: true,
          visitedNodeIds: [],
          distanceTable: algoId === 'dijkstra' ? { [startId]: 0 } : undefined,
        },
        highlights: { nodeIds: [startId] },
        counters: { comparisons: 0, swaps: 0, iterations: 0, arrayAccesses: 0 },
      },
    ], false);
  };

  useEffect(() => {
    setHasRun(false);
    initIdleStep(activeAlgoId, graph, startNodeId);
  }, [activeAlgoId, startNodeId]);

  // Run chosen algorithm: only generate steps, Play/Next/Prev do playback
  const handleRun = () => {
    if (!graph.nodes.find(n => n.id === startNodeId)) return;
    setHasRun(true);

    if (activeAlgoId === 'bfs') {
      const steps = bfsAlgorithm.generateSteps({ graph, startNodeId });
      loadSteps(steps, false);
    } else if (activeAlgoId === 'dfs') {
      const steps = dfsAlgorithm.generateSteps({ graph, startNodeId });
      loadSteps(steps, false);
    } else {
      const steps = dijkstraAlgorithm.generateSteps({
        graph,
        startNodeId,
        targetNodeId: targetNodeId || undefined,
      });
      loadSteps(steps, false);
    }
  };

  const getCanvasCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const transformed = pt.matrixTransform(ctm.inverse());
      return {
        x: Math.round(transformed.x),
        y: Math.round(transformed.y),
      };
    }
    const rect = svg.getBoundingClientRect();
    const x = Math.round(((clientX - rect.left) / rect.width) * 550 + 75);
    const y = Math.round(((clientY - rect.top) / rect.height) * 285 + 25);
    return { x, y };
  };

  // Add Node on Canvas Click when in 'add_node' mode
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (interactionMode !== 'add_node') return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);

    // Generate unique node label
    const nextChar = String.fromCharCode(65 + graph.nodes.length);
    const newNodeId = graph.nodes.some(n => n.id === nextChar)
      ? `N${graph.nodes.length + 1}`
      : nextChar;

    const newNode: GraphNode = {
      id: newNodeId,
      label: newNodeId,
      x,
      y,
    };

    setGraph(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
    setInteractionMode('select');
  };

  // Node Click handler for connecting edges or selection
  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();

    if (interactionMode === 'add_edge') {
      if (!edgeStartNode) {
        setEdgeStartNode(nodeId);
      } else if (edgeStartNode !== nodeId) {
        // Create new edge between edgeStartNode and nodeId
        const newEdge: GraphEdge = {
          id: `e_${edgeStartNode}_${nodeId}_${Date.now()}`,
          from: edgeStartNode,
          to: nodeId,
          weight: Math.floor(Math.random() * 8) + 1,
        };

        setGraph(prev => ({
          ...prev,
          edges: [...prev.edges, newEdge],
        }));

        setEdgeStartNode(null);
        setInteractionMode('select');
      }
    } else {
      setSelectedElement({ type: 'node', id: nodeId });
    }
  };

  // Node Drag handlers
  const handleNodeMouseDown = (e: React.MouseEvent, node: GraphNode) => {
    if (interactionMode === 'add_edge') return;
    e.stopPropagation();
    setDraggingNodeId(node.id);
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setDragOffset({
      x: coords.x - node.x,
      y: coords.y - node.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingNodeId) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const newX = coords.x - dragOffset.x;
    const newY = coords.y - dragOffset.y;

    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n =>
        n.id === draggingNodeId
          ? { ...n, x: newX, y: newY }
          : n
      ),
    }));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Delete key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        if (selectedElement.type === 'node') {
          setGraph(prev => ({
            ...prev,
            nodes: prev.nodes.filter(n => n.id !== selectedElement.id),
            edges: prev.edges.filter(
              edge => edge.from !== selectedElement.id && edge.to !== selectedElement.id
            ),
          }));
        } else if (selectedElement.type === 'edge') {
          setGraph(prev => ({
            ...prev,
            edges: prev.edges.filter(edge => edge.id !== selectedElement.id),
          }));
        }
        setSelectedElement(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement]);

  // Edge weight update
  const handleUpdateEdgeWeight = (edgeId: string, newWeight: number) => {
    setGraph(prev => ({
      ...prev,
      edges: prev.edges.map(e => (e.id === edgeId ? { ...e, weight: newWeight } : e)),
    }));
  };

  // Sample Presets
  const loadPreset = (preset: 'diamond' | 'islands' | 'grid') => {
    if (preset === 'diamond') {
      const newGraph: GraphState = {
        nodes: [
          { id: 'S', label: 'S', x: 160, y: 175 },
          { id: 'A', label: 'A', x: 300, y: 95 },
          { id: 'B', label: 'B', x: 300, y: 255 },
          { id: 'T', label: 'T', x: 540, y: 175 },
        ],
        edges: [
          { id: 'e1', from: 'S', to: 'A', weight: 3 },
          { id: 'e2', from: 'S', to: 'B', weight: 7 },
          { id: 'e3', from: 'A', to: 'T', weight: 4 },
          { id: 'e4', from: 'B', to: 'T', weight: 2 },
          { id: 'e5', from: 'A', to: 'B', weight: 1 },
        ],
        isDirected: true,
        isWeighted: true,
      };
      setGraph(newGraph);
      setStartNodeId('S');
      setTargetNodeId('T');
      setHasRun(false);
      initIdleStep(activeAlgoId, newGraph, 'S');
    } else if (preset === 'islands') {
      const newGraph: GraphState = {
        nodes: [
          { id: '1', label: '1', x: 160, y: 110 },
          { id: '2', label: '2', x: 280, y: 110 },
          { id: '3', label: '3', x: 220, y: 240 },
          { id: 'X', label: 'X', x: 440, y: 175 },
          { id: 'Y', label: 'Y', x: 560, y: 175 },
        ],
        edges: [
          { id: 'e1', from: '1', to: '2', weight: 5 },
          { id: 'e2', from: '2', to: '3', weight: 4 },
          { id: 'e3', from: '3', to: '1', weight: 3 },
          { id: 'e4', from: 'X', to: 'Y', weight: 9 },
        ],
        isDirected: false,
        isWeighted: true,
      };
      setGraph(newGraph);
      setStartNodeId('1');
      setTargetNodeId('X');
      setHasRun(false);
      initIdleStep(activeAlgoId, newGraph, '1');
    }
  };

  // Active step highlights
  const highlightedNodeIds = currentStep?.highlights?.nodeIds || [];
  const highlightedEdgeIds = currentStep?.highlights?.edgeIds || [];
  const aux = (currentStep?.auxiliary as GraphAuxiliary) || {};

  // Node radius increased for readability at 1366x768 (Requirement 2)
  const nodeRadius = 26;

  // Calculate dynamic bounding box of all nodes with padding to fit the canvas (Requirement 2)
  const padding = 55;
  const xs = graph.nodes.map(n => n.x);
  const ys = graph.nodes.map(n => n.y);
  const minX = xs.length > 0 ? Math.min(...xs) : 100;
  const maxX = xs.length > 0 ? Math.max(...xs) : 600;
  const minY = ys.length > 0 ? Math.min(...ys) : 60;
  const maxY = ys.length > 0 ? Math.max(...ys) : 260;

  const vbX = Math.floor(minX - padding);
  const vbY = Math.floor(minY - padding);
  const vbWidth = Math.max(300, Math.ceil(maxX - minX + padding * 2));
  const vbHeight = Math.max(180, Math.ceil(maxY - minY + padding * 2 + 20)); // extra room for dist: labels
  const viewBoxStr = `${vbX} ${vbY} ${vbWidth} ${vbHeight}`;

  return (
    <div className="flex-1 min-h-0 flex flex-col p-2 md:p-3 overflow-y-auto min-[1100px]:overflow-hidden">
      {/* Top Configuration Toolbar: At most 2 tight rows (Requirement 2a) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 mb-2 shadow-xs shrink-0">
        {/* Algorithm Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveAlgoId('dijkstra')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeAlgoId === 'dijkstra'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dijkstra's Path
          </button>
          <button
            onClick={() => setActiveAlgoId('bfs')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeAlgoId === 'bfs'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            BFS (Queue)
          </button>
          <button
            onClick={() => setActiveAlgoId('dfs')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeAlgoId === 'dfs'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DFS (Stack)
          </button>
        </div>

        {/* Start / Target Pickers & Run */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <label className="flex items-center gap-1 text-slate-300">
            <span>Start:</span>
            <select
              value={startNodeId}
              onChange={e => setStartNodeId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-slate-200 font-mono"
            >
              {graph.nodes.map(n => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </label>

          {activeAlgoId === 'dijkstra' && (
            <label className="flex items-center gap-1 text-slate-300">
              <span>Target:</span>
              <select
                value={targetNodeId}
                onChange={e => setTargetNodeId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-slate-200 font-mono"
              >
                <option value="">None (All)</option>
                {graph.nodes.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <button
            onClick={handleRun}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run {activeAlgoId.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Canvas Tooling & Graph Props Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800 mb-2 text-xs shrink-0">
        {/* Canvas action modes */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setInteractionMode('select')}
            className={`px-2.5 py-1 rounded transition-colors ${
              interactionMode === 'select'
                ? 'bg-slate-700 text-white font-semibold'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Select / Drag
          </button>
          <button
            onClick={() => setInteractionMode('add_node')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              interactionMode === 'add_node'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>Add Node (Click Canvas)</span>
          </button>
          <button
            onClick={() => {
              setInteractionMode('add_edge');
              setEdgeStartNode(null);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              interactionMode === 'add_edge'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <ArrowRight className="w-3 h-3" />
            <span>{edgeStartNode ? `Connect from ${edgeStartNode}...` : 'Connect Edge'}</span>
          </button>
        </div>

        {/* Directed / Weighted Toggles & Presets */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGraph(g => ({ ...g, isDirected: !g.isDirected }))}
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300"
          >
            {graph.isDirected ? 'Directed →' : 'Undirected ↔'}
          </button>
          <button
            onClick={() => setGraph(g => ({ ...g, isWeighted: !g.isWeighted }))}
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300"
          >
            {graph.isWeighted ? 'Weighted' : 'Unweighted'}
          </button>
          <button
            onClick={() => loadPreset('diamond')}
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            Sample: Diamond
          </button>
          <button
            onClick={() => loadPreset('islands')}
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            Sample: Islands
          </button>
        </div>
      </div>

      {/* Error / Alert banner */}
      {aux.errorMessage && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{aux.errorMessage}</span>
        </div>
      )}

      {/* Auxiliary State Strip (Above Canvas, Non-Clipped Dedicated Row) */}
      <div className="mb-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs min-h-[52px]">
        {activeAlgoId === 'bfs' && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Queue (FIFO):
            </span>
            {(!aux.queue || aux.queue.length === 0) ? (
              <span className="text-slate-500 italic font-mono">Empty</span>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider">
                  FRONT
                </span>
                <div className="flex items-center gap-1">
                  {aux.queue.map((qId, i) => (
                    <span
                      key={i}
                      className={`px-2.5 py-1 rounded-md font-mono font-bold text-xs ${
                        i === 0
                          ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400'
                          : i === aux.queue!.length - 1
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {qId}
                    </span>
                  ))}
                </div>
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 text-[10px] font-black uppercase tracking-wider">
                  REAR
                </span>
              </div>
            )}
          </div>
        )}

        {activeAlgoId === 'dfs' && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Stack (LIFO):
              </span>
              {(!aux.stack || aux.stack.length === 0) ? (
                <span className="text-slate-500 italic font-mono">Empty</span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    {aux.stack.map((sId, i) => {
                      const isTop = i === aux.stack!.length - 1;
                      return (
                        <span
                          key={i}
                          className={`px-2.5 py-1 rounded-md font-mono font-bold text-xs ${
                            isTop
                              ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-sm'
                              : 'bg-slate-800 text-slate-200 border border-slate-700'
                          }`}
                        >
                          {sId}
                        </span>
                      );
                    })}
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                    TOP
                  </span>
                </div>
              )}
            </div>
            {/* Rule 24: DFS note */}
            <div className="text-[11px] text-slate-400">
              Nodes already visited are skipped when popped.
            </div>
          </div>
        )}

        {activeAlgoId === 'dijkstra' && aux.distanceTable && (
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="font-semibold text-slate-300">Distance Table:</span>
            <div className="flex items-center gap-1.5">
              {Object.entries(aux.distanceTable).map(([nId, d]) => (
                <span
                  key={nId}
                  className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px]"
                >
                  <strong className="text-slate-300">{nId}:</strong>{' '}
                  <span className="text-sky-400 font-bold">{d === Infinity ? '∞' : d}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="text-slate-400 font-mono text-xs flex items-center gap-1.5 ml-auto">
          <span className="font-semibold text-slate-300">Visited:</span>
          <span className="text-emerald-400 font-bold">
            [{(aux.visitedNodeIds || []).join(', ')}]
          </span>
        </div>
      </div>

      {/* Interactive Graph SVG Canvas: Flex-1 takes all flexible height (Requirement 2b) */}
      <div className="flex-1 min-h-[220px] rounded-2xl bg-slate-950/70 border border-slate-800/80 relative overflow-hidden flex flex-col justify-start p-2 shadow-xs">
        {/* Visual Legend Header (Requirement 39) */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] mb-1.5 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-indigo-400" />
              <span className="text-slate-400">Node</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-400">Current / Active</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-400">Visited</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400" />
              <span className="text-slate-400">Shortest Path</span>
            </span>
          </div>
        </div>
        <svg
          ref={svgRef}
          viewBox={viewBoxStr}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full h-full cursor-crosshair select-none"
        >
          {/* Arrow markers for directed edges */}
          <defs>
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
            </marker>
          </defs>

          {/* LAYER 1: First all edges (lines), shortened so they stop at circle borders */}
          <g className="graph-edges">
            {graph.edges.map(edge => {
              const fromNode = graph.nodes.find(n => n.id === edge.from);
              const toNode = graph.nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const isHighlighted = highlightedEdgeIds.includes(edge.id);
              const isShortestPathEdge =
                Boolean(aux.shortestPath && aux.shortestPath.length > 1 && isHighlighted && currentStep?.type === 'complete');

              const dx = toNode.x - fromNode.x;
              const dy = toNode.y - fromNode.y;
              const dist = Math.hypot(dx, dy) || 1;
              const rFrom = nodeRadius;
              const rTo = graph.isDirected ? nodeRadius + 1 : nodeRadius;

              const x1 = fromNode.x + (dx / dist) * rFrom;
              const y1 = fromNode.y + (dy / dist) * rFrom;
              const x2 = toNode.x - (dx / dist) * rTo;
              const y2 = toNode.y - (dy / dist) * rTo;

              return (
                <line
                  key={edge.id}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isShortestPathEdge ? '#10b981' : isHighlighted ? '#38bdf8' : '#334155'}
                  strokeWidth={isShortestPathEdge ? '4.5' : isHighlighted ? '3.5' : '2'}
                  markerEnd={
                    graph.isDirected
                      ? isHighlighted
                        ? 'url(#arrow-active)'
                        : 'url(#arrow-default)'
                      : undefined
                  }
                  className="transition-all duration-300"
                />
              );
            })}
          </g>

          {/* LAYER 2: Inline Edge Weight Labels with solid background rect so lines never cross through them */}
          {graph.isWeighted && activeAlgoId === 'dijkstra' && (
            <g className="graph-edge-weights">
              {graph.edges.map(edge => {
                const fromNode = graph.nodes.find(n => n.id === edge.from);
                const toNode = graph.nodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                const isHighlighted = highlightedEdgeIds.includes(edge.id);
                const isShortestPathEdge =
                  Boolean(aux.shortestPath && aux.shortestPath.length > 1 && isHighlighted && currentStep?.type === 'complete');
                const midX = (fromNode.x + toNode.x) / 2;
                const midY = (fromNode.y + toNode.y) / 2;

                return (
                  <g
                    key={`weight-${edge.id}`}
                    transform={`translate(${midX}, ${midY})`}
                    className="cursor-pointer"
                    onClick={e => {
                      e.stopPropagation();
                      const weightStr = prompt('Edit edge weight:', String(edge.weight));
                      if (weightStr !== null) {
                        const parsed = parseInt(weightStr, 10);
                        if (!isNaN(parsed)) handleUpdateEdgeWeight(edge.id, parsed);
                      }
                    }}
                  >
                    {/* Small background rect so lines don't cross through label (Requirement 2) */}
                    <rect
                      x="-16"
                      y="-11"
                      width="32"
                      height="22"
                      rx="5"
                      fill="#020617"
                      stroke={isShortestPathEdge ? '#10b981' : isHighlighted ? '#38bdf8' : '#475569'}
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#f1f5f9"
                      fontSize="12"
                      fontFamily="monospace"
                      fontWeight="bold"
                      pointerEvents="none"
                    >
                      {edge.weight}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* LAYER 3: Graph Nodes - Grouped with transform="translate(x, y)" so ring is always centered at cx=0, cy=0 (Requirement 1 & 2) */}
          <g className="graph-nodes">
            {graph.nodes.map(node => {
              const isCurrentNode = aux.currentNodeId === node.id;
              const isHighlighted = highlightedNodeIds.includes(node.id);
              const isSettled = aux.visitedNodeIds?.includes(node.id);
              const isShortestPathNode = Boolean(aux.shortestPath && aux.shortestPath.includes(node.id) && currentStep?.type === 'complete');
              const isStart = node.id === startNodeId;
              const isTarget = node.id === targetNodeId;
              const isSelected = selectedElement?.type === 'node' && selectedElement.id === node.id;
              const isInspecting = isHighlighted && !isSettled && !isCurrentNode;
              const dist = aux.distanceTable ? aux.distanceTable[node.id] : undefined;

              let fill = '#1e293b';
              let stroke = '#6366f1';

              if (isShortestPathNode) {
                fill = '#059669';
                stroke = '#34d399';
              } else if (isCurrentNode) {
                fill = '#78350f';
                stroke = '#f59e0b';
              } else if (isInspecting) {
                fill = '#0284c7';
                stroke = '#38bdf8';
              } else if (isSettled) {
                fill = '#059669';
                stroke = '#10b981';
              } else if (isHighlighted) {
                fill = '#0284c7';
                stroke = '#38bdf8';
              } else if (isStart && aux.isUnrun) {
                stroke = '#f59e0b';
              } else if (isTarget) {
                stroke = '#ec4899';
              }

              return (
                <g
                  key={`node-${node.id}`}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="select-none"
                >
                  {/* Current Node Highlight Rings: Exactly centered at cx=0, cy=0 (Requirement 1 & 4) */}
                  {isCurrentNode && (
                    <>
                      {/* Thin static ring that stays around the current node until next step */}
                      <circle
                        cx="0"
                        cy="0"
                        r={nodeRadius + 6}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        className="opacity-90"
                      />
                      {/* Solid pulse ring: scales 1.0 to 1.25 and fades out over 600ms */}
                      <circle
                        key={`pulse-${node.id}-${currentStepIndex}`}
                        cx="0"
                        cy="0"
                        r={nodeRadius + 6}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        className="node-pulse-ring"
                      />
                    </>
                  )}

                  {/* Solid Node Circle */}
                  <circle
                    cx="0"
                    cy="0"
                    r={nodeRadius}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isShortestPathNode ? '4' : isCurrentNode ? '3.5' : isSelected ? '3.5' : '2.5'}
                    className="filter drop-shadow-md transition-all duration-200"
                  />

                  {/* Node Label: bold, white, centered, readable font size (Requirement 2) */}
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize="15"
                    fontFamily="monospace"
                    fontWeight="bold"
                    pointerEvents="none"
                    className="select-none"
                  >
                    {node.label}
                  </text>

                  {/* Dijkstra Tentative Distance label (Requirement 2) */}
                  {activeAlgoId === 'dijkstra' && dist !== undefined && (
                    <text
                      x="0"
                      y={nodeRadius + 18}
                      textAnchor="middle"
                      fill={isShortestPathNode ? '#34d399' : '#38bdf8'}
                      fontSize="12"
                      fontFamily="monospace"
                      fontWeight="bold"
                      pointerEvents="none"
                      className="select-none"
                    >
                      dist: {dist === Infinity ? '∞' : dist}
                    </text>
                  )}

                  {/* Transparent interactive hitbox for smooth node dragging and selection */}
                  <circle
                    cx="0"
                    cy="0"
                    r={nodeRadius + 4}
                    fill="transparent"
                    onMouseDown={e => handleNodeMouseDown(e, node)}
                    onClick={e => handleNodeClick(e, node.id)}
                    className="cursor-grab active:cursor-grabbing"
                  />
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};
