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
  const { currentStep, loadSteps } = usePlayer();

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
    const rect = svg.getBoundingClientRect();
    const x = Math.round(((clientX - rect.left) / rect.width) * 700);
    const y = Math.round(((clientY - rect.top) / rect.height) * 320);
    return {
      x: Math.max(30, Math.min(x, 670)),
      y: Math.max(30, Math.min(y, 290)),
    };
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
          ? { ...n, x: Math.max(25, Math.min(newX, 660)), y: Math.max(25, Math.min(newY, 315)) }
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

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
      {/* Top Configuration Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 mb-4 shadow-sm">
        {/* Algorithm Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveAlgoId('dijkstra')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeAlgoId === 'dijkstra'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dijkstra's Shortest Path
          </button>
          <button
            onClick={() => setActiveAlgoId('bfs')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeAlgoId === 'bfs'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            BFS (Queue)
          </button>
          <button
            onClick={() => setActiveAlgoId('dfs')}
            className={`px-3 py-1.5 rounded-md transition-all ${
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
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
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
                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
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
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run {activeAlgoId.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Canvas Tooling & Graph Props Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 mb-4 text-xs">
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

      {/* Interactive Graph SVG Canvas */}
      <div className="h-[380px] rounded-2xl bg-slate-950/70 border border-slate-800/80 relative overflow-hidden flex flex-col justify-center shrink-0 shadow-sm">
        <svg
          ref={svgRef}
          viewBox="0 0 700 320"
          preserveAspectRatio="xMidYMid meet"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full flex-1 cursor-crosshair select-none"
        >
          {/* Arrow markers for directed edges */}
          <defs>
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
            </marker>
          </defs>

          {/* Render Edges */}
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
              <g key={edge.id} onClick={() => setSelectedElement({ type: 'edge', id: edge.id })}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
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

                {/* Inline Edge Weight Label: only show in Dijkstra mode; hide in BFS and DFS mode */}
                {graph.isWeighted && activeAlgoId === 'dijkstra' && (
                  <g
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
                    <rect
                      x="-12"
                      y="-10"
                      width="24"
                      height="18"
                      rx="4"
                      fill="#0f172a"
                      stroke={isShortestPathEdge ? '#10b981' : isHighlighted ? '#38bdf8' : '#475569'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {edge.weight}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Render Nodes: Distinguish inspecting (cyan) vs settled (green) vs current active node (orange) */}
          {graph.nodes.map(node => {
            const isCurrentNode = aux.currentNodeId === node.id;
            const isHighlighted = highlightedNodeIds.includes(node.id);
            const isSettled = aux.visitedNodeIds?.includes(node.id);
            const isShortestPathNode = Boolean(aux.shortestPath && aux.shortestPath.includes(node.id) && currentStep?.type === 'complete');
            const isStart = node.id === startNodeId;
            const isTarget = node.id === targetNodeId;
            const isSelected = selectedElement?.type === 'node' && selectedElement.id === node.id;
            const isInspecting = isHighlighted && !isSettled && !isCurrentNode;

            let fill = '#1e293b';
            let stroke = '#6366f1';

            if (isShortestPathNode) {
              fill = '#059669';
              stroke = '#34d399';
            } else if (isCurrentNode) {
              // Current active node gets distinct orange stroke and amber fill
              fill = '#78350f';
              stroke = '#f59e0b';
            } else if (isInspecting) {
              fill = '#0284c7';
              stroke = '#38bdf8';
            } else if (isSettled) {
              // Green ONLY after node is permanently settled/visited!
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
                key={node.id}
                onMouseDown={e => handleNodeMouseDown(e, node)}
                onClick={e => handleNodeClick(e, node.id)}
                className="cursor-grab active:cursor-grabbing transition-transform"
              >
                {/* Rule 21: Orange "current node" ring only rendered for the active node; clears when node changes */}
                {isCurrentNode && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="26"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeDasharray="4 2"
                    className="animate-spin"
                  />
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="20"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isShortestPathNode ? '4' : isCurrentNode ? '3.5' : isSelected ? '3.5' : '2.5'}
                  className="filter drop-shadow-md transition-all duration-200"
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {node.label}
                </text>

                {/* Tentative distance label for Dijkstra */}
                {activeAlgoId === 'dijkstra' && aux.distanceTable && (
                  <text
                    x={node.x}
                    y={node.y + 32}
                    textAnchor="middle"
                    fill={isShortestPathNode ? '#34d399' : '#38bdf8'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    dist: {aux.distanceTable[node.id] === Infinity ? '∞' : aux.distanceTable[node.id]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
