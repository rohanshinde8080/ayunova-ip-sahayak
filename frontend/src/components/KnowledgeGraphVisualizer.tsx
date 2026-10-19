import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Search,
  Layers,
  ChevronRight,
  ArrowRight,
  Compass,
  X,
  Share2,
  Info,
  HelpCircle,
  Eye,
  EyeOff,
  Target,
  Move
} from 'lucide-react';
import { GraphData, GraphNode, GraphEdge } from '../types';
import { synthesizeDynamicClientSubgraph } from '../services/graphService';

interface KnowledgeGraphVisualizerProps {
  graph?: GraphData;
  height?: number | string;
  interactive?: boolean;
  onNodeClick?: (node: GraphNode) => void;
  title?: string;
  subtitle?: string;
  showFullscreenButton?: boolean;
  className?: string;
}

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  degree: number;
}

interface SimEdge extends GraphEdge {
  sourceNode: SimNode;
  targetNode: SimNode;
}

const ENTITY_CONFIG: Record<
  string,
  { bg: string; border: string; glow: string; text: string; icon: string }
> = {
  Herb: {
    bg: '#064e3b',
    border: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    text: '#a7f3d0',
    icon: '🌿'
  },
  Statute: {
    bg: '#1e3a8a',
    border: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
    text: '#bfdbfe',
    icon: '⚖️'
  },
  Section: {
    bg: '#312e81',
    border: '#6366f1',
    glow: 'rgba(99, 102, 241, 0.4)',
    text: '#c7d2fe',
    icon: '📋'
  },
  Treatise: {
    bg: '#78350f',
    border: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    text: '#fde68a',
    icon: '📜'
  },
  Patent: {
    bg: '#581c87',
    border: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.4)',
    text: '#e9d5ff',
    icon: '📑'
  },
  RegulatoryBody: {
    bg: '#881337',
    border: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.4)',
    text: '#fecdd3',
    icon: '🏛️'
  },
  Formulation: {
    bg: '#065f46',
    border: '#34d399',
    glow: 'rgba(52, 211, 153, 0.4)',
    text: '#d1fae5',
    icon: '🧪'
  },
  Document: {
    bg: '#1e293b',
    border: '#64748b',
    glow: 'rgba(100, 116, 139, 0.4)',
    text: '#cbd5e1',
    icon: '📄'
  },
  Chunk: {
    bg: '#0f172a',
    border: '#475569',
    glow: 'rgba(71, 85, 105, 0.4)',
    text: '#94a3b8',
    icon: '🧩'
  }
};

const DEFAULT_CONFIG = {
  bg: '#1e293b',
  border: '#94a3b8',
  glow: 'rgba(148, 163, 184, 0.4)',
  text: '#f1f5f9',
  icon: '🔹'
};

const RELATION_CONFIG: Record<
  string,
  { stroke: string; marker: string; labelBg: string; text: string; badge: string; meaning: string }
> = {
  BARRED_BY: {
    stroke: '#f43f5e',
    marker: 'arrow-barred',
    labelBg: '#4c0519',
    text: '#fda4af',
    badge: '3(p)/3(e) Bar',
    meaning: 'Prior art or traditional knowledge triggers statutory patent exclusion.'
  },
  REQUIRES_SYNERGY_UNDER: {
    stroke: '#f59e0b',
    marker: 'arrow-synergy',
    labelBg: '#451a03',
    text: '#fde68a',
    badge: 'Section 3(e)',
    meaning: 'Requires quantitative experimental evidence of synergistic effect (CI < 1.0).'
  },
  DOCUMENTED_IN: {
    stroke: '#10b981',
    marker: 'arrow-treatise',
    labelBg: '#064e3b',
    text: '#a7f3d0',
    badge: 'Classical Text',
    meaning: 'Documented in classical treatises (First Schedule of DCA 1940).'
  },
  CONTAINS_HERB: {
    stroke: '#14b8a6',
    marker: 'arrow-contains',
    labelBg: '#134e4a',
    text: '#99f6e4',
    badge: 'Constituent Herb',
    meaning: 'Botanical ingredient codified as part of this traditional polyherbal blend.'
  },
  PART_OF: {
    stroke: '#6366f1',
    marker: 'arrow-partof',
    labelBg: '#1e1b4b',
    text: '#c7d2fe',
    badge: 'Statutory Body',
    meaning: 'Section or provision enacted as part of the primary legislation.'
  },
  TRIGGERS_COMPLIANCE: {
    stroke: '#ec4899',
    marker: 'arrow-bda',
    labelBg: '#500724',
    text: '#fbcfe8',
    badge: 'BDA 2002',
    meaning: 'Utilization of biological material mandates prior approval under Section 3 BDA.'
  },
  MANDATES_APPROVAL_FROM: {
    stroke: '#ec4899',
    marker: 'arrow-bda',
    labelBg: '#500724',
    text: '#fbcfe8',
    badge: 'NBA Mandate',
    meaning: 'National Biodiversity Authority approval required prior to filing patent.'
  },
  INDEXES_PRIOR_ART: {
    stroke: '#06b6d4',
    marker: 'arrow-tkdl',
    labelBg: '#083344',
    text: '#a5f3fc',
    badge: 'TKDL Index',
    meaning: 'CSIR TKDL database digitally indexes shlokas to prevent foreign patent misappropriation.'
  },
  PREVENTS_PATENTING_UNDER: {
    stroke: '#ef4444',
    marker: 'arrow-barred',
    labelBg: '#450a0a',
    text: '#fca5a5',
    badge: 'Anticipation',
    meaning: 'Direct prior art anticipation cited by examiners to reject claims under Section 3(p).'
  },
  CLAIMS_OR_CITES: {
    stroke: '#a855f7',
    marker: 'arrow-patent',
    labelBg: '#3b0764',
    text: '#e9d5ff',
    badge: 'Patent Claim',
    meaning: 'Patent specification references or attempts to claim botanical compositions.'
  },
  INVALIDATED: {
    stroke: '#22c55e',
    marker: 'arrow-treatise',
    labelBg: '#052e16',
    text: '#86efac',
    badge: 'Revoked Precedent',
    meaning: 'Revoked in international patent office using Indian classical treatise citations.'
  }
};

const DEFAULT_REL_CONFIG = {
  stroke: '#64748b',
  marker: 'arrow-default',
  labelBg: '#0f172a',
  text: '#cbd5e1',
  badge: 'Relationship',
  meaning: 'Statutory or botanical relation between connected Ayush legal entities.'
};

export const KnowledgeGraphVisualizer: React.FC<KnowledgeGraphVisualizerProps> = ({
  graph,
  height = 420,
  interactive = true,
  onNodeClick,
  title = 'Neo4j Multi-Hop Subgraph',
  subtitle = 'Interactive statutory bars, botanical prior art & legal entities',
  showFullscreenButton = true,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [localGraphOverride, setLocalGraphOverride] = useState<GraphData | null>(null);
  const activeGraph = localGraphOverride || (graph && graph.nodes && graph.nodes.length > 0 ? graph : null);

  const [selectedNode, setSelectedNode] = useState<SimNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<SimEdge | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<SimEdge | null>(null);
  const [showPathDrawer, setShowPathDrawer] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Responsive dimensions tracker with ResizeObserver
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 480,
    height: typeof height === 'number' ? height : 420
  });

  // Zoom and Pan transform
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 0.95 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<SimNode | null>(null);
  const fitToViewRef = useRef<(() => void) | null>(null);

  // Simulation physics state
  const simNodesRef = useRef<SimNode[]>([]);
  const simEdgesRef = useRef<SimEdge[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const [, setTick] = useState(0);

  // Toggle fullscreen with animated auto-fit transition
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => {
      const next = !prev;
      setTimeout(() => fitToViewRef.current?.(), 60);
      setTimeout(() => fitToViewRef.current?.(), 320);
      return next;
    });
  }, []);

  // Keyboard shortcut (ESC to exit fullscreen) & scroll lock
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        setTimeout(() => fitToViewRef.current?.(), 250);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer1 = setTimeout(() => fitToViewRef.current?.(), 60);
    const timer2 = setTimeout(() => fitToViewRef.current?.(), 320);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origOverflow;
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isFullscreen]);

  // ResizeObserver for reliable dynamic canvas measurements
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const w = el.clientWidth || 480;
      const h = el.clientHeight || (typeof height === 'number' ? height : 420);
      setDimensions({ width: w, height: h });
    };

    updateSize();
    const ro = new ResizeObserver(() => {
      updateSize();
      fitToViewRef.current?.();
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [height, isFullscreen]);

  // Auto-fit & Center the entire graph nicely within container
  const fitToView = useCallback(() => {
    const nodes = simNodesRef.current;
    if (!nodes || nodes.length === 0) return;
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || dimensions.width || 380;
    const h = typeof height === 'number'
      ? (isFullscreen ? window.innerHeight - 40 : height)
      : (container.clientHeight || dimensions.height || 420);

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    nodes.forEach(n => {
      const r = n.radius || 20;
      minX = Math.min(minX, n.x - r - 25);
      maxX = Math.max(maxX, n.x + r + 25);
      minY = Math.min(minY, n.y - r - 25);
      maxY = Math.max(maxY, n.y + r + 25);
    });

    const graphWidth = Math.max(maxX - minX, 100);
    const graphHeight = Math.max(maxY - minY, 100);

    const scaleX = (width * 0.88) / graphWidth;
    const scaleY = (h * 0.88) / graphHeight;
    const scale = Math.min(1.25, Math.max(0.35, Math.min(scaleX, scaleY)));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setTransform({
      x: width / 2 - centerX * scale,
      y: h / 2 - centerY * scale,
      k: scale
    });
  }, [height, dimensions.width, dimensions.height, isFullscreen]);

  useEffect(() => {
    fitToViewRef.current = fitToView;
  }, [fitToView]);

  // Derive unique entity types
  const entityTypes = useMemo(() => {
    if (!activeGraph?.nodes) return ['All'];
    const types = new Set<string>();
    activeGraph.nodes.forEach(n => {
      if (n.type || n.label) types.add(n.type || n.label);
    });
    return ['All', ...Array.from(types)];
  }, [activeGraph]);

  // Initialize or update simulation nodes & edges when graph prop changes
  useEffect(() => {
    if (!activeGraph || !activeGraph.nodes || activeGraph.nodes.length === 0) {
      simNodesRef.current = [];
      simEdgesRef.current = [];
      return;
    }

    const width = containerRef.current?.clientWidth || dimensions.width || 380;
    const h = typeof height === 'number' ? height : (containerRef.current?.clientHeight || dimensions.height || 420);
    const centerX = width / 2;
    const centerY = h / 2;

    // Calculate node degree (number of connected edges)
    const degreeMap: Record<string, number> = {};
    activeGraph.edges?.forEach(e => {
      degreeMap[e.source] = (degreeMap[e.source] || 0) + 1;
      degreeMap[e.target] = (degreeMap[e.target] || 0) + 1;
    });

    // Keep initial radius strictly within the viewport bounds!
    const minDim = Math.min(width, h);
    const baseRadius = Math.max(45, Math.min(120, minDim * 0.28));

    const totalNodes = activeGraph.nodes.length;
    const simNodes: SimNode[] = activeGraph.nodes.map((n, i) => {
      const angle = (i / totalNodes) * 2 * Math.PI;
      const deg = degreeMap[n.id] || 1;
      const ringOffset = ((i % 2) - 0.5) * 16;
      const rDist = Math.max(35, baseRadius + ringOffset);
      return {
        ...n,
        x: centerX + rDist * Math.cos(angle),
        y: centerY + rDist * Math.sin(angle),
        vx: 0,
        vy: 0,
        radius: Math.min(26, Math.max(18, 16 + deg * 1.8)),
        degree: deg
      };
    });

    const nodeMap = new Map<string, SimNode>();
    simNodes.forEach(n => nodeMap.set(n.id, n));

    const simEdges: SimEdge[] = [];
    activeGraph.edges?.forEach(e => {
      const sourceNode = nodeMap.get(e.source);
      const targetNode = nodeMap.get(e.target);
      if (sourceNode && targetNode) {
        simEdges.push({
          ...e,
          label: e.label || e.type || 'RELATES_TO',
          sourceNode,
          targetNode
        });
      }
    });

    simNodesRef.current = simNodes;
    simEdgesRef.current = simEdges;

    // Auto-fit immediately so nodes are centered with perfect scaling
    requestAnimationFrame(() => {
      fitToView();
    });
  }, [activeGraph, height, fitToView, dimensions.width, dimensions.height]);

  // Force-directed physics simulation loop with STRICT anti-collision separation
  useEffect(() => {
    let running = true;
    let iteration = 0;
    const maxIterations = 200;

    const tickSimulation = () => {
      if (!running || iteration > maxIterations) return;
      iteration++;

      const nodes = simNodesRef.current;
      const edges = simEdgesRef.current;
      if (nodes.length === 0) return;

      const width = containerRef.current?.clientWidth || dimensions.width || 380;
      const h = typeof height === 'number' ? height : (containerRef.current?.clientHeight || dimensions.height || 420);
      const centerX = width / 2;
      const centerY = h / 2;

      // 1. Repulsion between all node pairs with anti-collision separation
      const repulsionStrength = 2200;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);

          // Hard collision avoidance
          const minDist = (n1.radius || 20) + (n2.radius || 20) + 24;
          if (dist < minDist) {
            const overlap = (minDist - dist) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;
            if (draggedNode !== n1) {
              n1.x -= nx * overlap;
              n1.y -= ny * overlap;
              n1.vx -= nx * 0.3;
              n1.vy -= ny * 0.3;
            }
            if (draggedNode !== n2) {
              n2.x += nx * overlap;
              n2.y += ny * overlap;
              n2.vx += nx * 0.3;
              n2.vy += ny * 0.3;
            }
          }

          if (dist < 380) {
            const force = repulsionStrength / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (draggedNode !== n1) {
              n1.vx -= fx;
              n1.vy -= fy;
            }
            if (draggedNode !== n2) {
              n2.vx += fx;
              n2.vy += fy;
            }
          }
        }
      }

      // 2. Spring attraction along edges
      const springLength = 85;
      const springStrength = 0.04;
      edges.forEach(e => {
        const n1 = e.sourceNode;
        const n2 = e.targetNode;
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const displacement = dist - springLength;
        const force = displacement * springStrength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (draggedNode !== n1) {
          n1.vx += fx;
          n1.vy += fy;
        }
        if (draggedNode !== n2) {
          n2.vx += fx;
          n2.vy += fy;
        }
      });

      // 3. Gentle pull toward center
      const centerPull = 0.025;
      nodes.forEach(n => {
        if (draggedNode !== n) {
          n.vx += (centerX - n.x) * centerPull;
          n.vy += (centerY - n.y) * centerPull;
        }
      });

      // 4. Dampen velocity, update position, and keep within canvas bounds
      const damping = 0.76;
      const pad = 36;
      nodes.forEach(n => {
        if (draggedNode !== n) {
          n.vx = Math.max(-6, Math.min(6, n.vx * damping));
          n.vy = Math.max(-6, Math.min(6, n.vy * damping));
          n.x += n.vx;
          n.y += n.vy;

          // Boundary constraints so nodes never fly off-screen
          if (n.x < pad) { n.x = pad; n.vx = 0; }
          if (n.x > width - pad) { n.x = width - pad; n.vx = 0; }
          if (n.y < pad) { n.y = pad; n.vy = 0; }
          if (n.y > h - pad) { n.y = h - pad; n.vy = 0; }
        }
      });

      setTick(t => t + 1);

      // Auto-fit at key milestones
      if (iteration === 15 || iteration === 45 || iteration === 90 || iteration === maxIterations) {
        fitToViewRef.current?.();
      }

      if (iteration < maxIterations) {
        animFrameIdRef.current = requestAnimationFrame(tickSimulation);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(tickSimulation);

    return () => {
      running = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [activeGraph, draggedNode, height, dimensions.width, dimensions.height]);

  // Zoom handlers (centered on viewport)
  const handleZoom = (factor: number) => {
    const container = containerRef.current;
    const width = container?.clientWidth || dimensions.width || 380;
    const h = typeof height === 'number' ? height : (container?.clientHeight || dimensions.height || 420);
    const centerX = width / 2;
    const centerY = h / 2;

    setTransform(prev => {
      const newK = Math.max(0.3, Math.min(3.0, prev.k * factor));
      const kFactor = newK / prev.k;
      return {
        k: newK,
        x: centerX - (centerX - prev.x) * kFactor,
        y: centerY - (centerY - prev.y) * kFactor
      };
    });
  };

  const handleResetZoom = () => {
    fitToView();
  };

  // Mouse wheel zoom centered on cursor
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setTransform(prev => {
      const newK = Math.max(0.3, Math.min(3.0, prev.k * zoomFactor));
      const factor = newK / prev.k;
      return {
        k: newK,
        x: mouseX - (mouseX - prev.x) * factor,
        y: mouseY - (mouseY - prev.y) * factor
      };
    });
  };

  // Mouse pan & drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'graph-bg') {
      setIsPanning(true);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    } else if (draggedNode) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const nodeX = (clientX - transform.x) / transform.k;
      const nodeY = (clientY - transform.y) / transform.k;

      draggedNode.x = nodeX;
      draggedNode.y = nodeY;
      draggedNode.vx = 0;
      draggedNode.vy = 0;
      setTick(t => t + 1);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNode(null);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: SimNode) => {
    e.stopPropagation();
    setDraggedNode(node);
  };

  const handleNodeClick = (node: SimNode) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  const handleEdgeClick = (edge: SimEdge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  // Filter nodes & edges
  const filteredNodes = useMemo(() => {
    return simNodesRef.current.filter(n => {
      const matchesType =
        filterType === 'All' ||
        (n.type || n.label).toLowerCase() === filterType.toLowerCase();
      const matchesQuery =
        !searchQuery.trim() ||
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.label || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesQuery;
    });
  }, [filterType, searchQuery, simNodesRef.current]);

  const activeNodeIds = useMemo(() => {
    return new Set(filteredNodes.map(n => n.id));
  }, [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return simEdgesRef.current.filter(e => {
      return activeNodeIds.has(e.sourceNode.id) && activeNodeIds.has(e.targetNode.id);
    });
  }, [activeNodeIds, simEdgesRef.current]);

  // Active highlight calculation for hover & selection spotlighting
  const activeHighlight = useMemo(() => {
    const active = selectedNode || hoveredNode;
    if (!active) return null;
    const nodeIds = new Set<string>([active.id]);
    const edgeIds = new Set<string>();

    simEdgesRef.current.forEach(e => {
      if (e.sourceNode.id === active.id) {
        nodeIds.add(e.targetNode.id);
        edgeIds.add(e.id);
      } else if (e.targetNode.id === active.id) {
        nodeIds.add(e.sourceNode.id);
        edgeIds.add(e.id);
      }
    });

    return { nodeIds, edgeIds, activeNode: active };
  }, [selectedNode, hoveredNode]);

  // If no graph is available, display an interactive fallback state
  if (!activeGraph || !activeGraph.nodes || activeGraph.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/90 text-slate-300 rounded-2xl border border-slate-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
          <Share2 className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-100">Live Knowledge Graph Ready</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Explore multi-hop relationships between Ayurvedic herbs, classical treatises, and Patents Act Section 3(p)/3(e) statutory bars.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setLocalGraphOverride(synthesizeDynamicClientSubgraph('Ashwagandha Triphala Curcumin Section 3(p)'))}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Load Ayurvedic Knowledge Graph RAG</span>
        </button>
      </div>
    );
  }

  const visualizerContent = (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? 'relative z-10 w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200'
          : `relative rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-xl overflow-hidden flex flex-col ${className}`
      }
      style={{
        height: isFullscreen ? '100%' : height
      }}
    >
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <Share2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-100">
                {isFullscreen ? 'Live Grounded Knowledge Graph · Deep Inspector' : title}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                Neo4j Live Grounded
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              {isFullscreen ? 'Interactive multi-hop statutory bars, TKDL prior art & botanical relations' : subtitle}
            </span>
          </div>
        </div>

        {/* Search, Filter, Guide, Fullscreen & Traversal List Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {/* Guide / How to Read Button */}
          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-emerald-400 hover:text-emerald-300 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            title="How to read this legal graph"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {/* Path Explorer Button */}
          <button
            type="button"
            onClick={() => setShowPathDrawer(prev => !prev)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              showPathDrawer
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-xs'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white'
            }`}
            title="Inspect all directional paths (संबंध सूची)"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-300" />
            <span>Paths ({filteredEdges.length})</span>
          </button>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
            <input
              type="text"
              placeholder="Search graph..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-7 pr-2 py-1 bg-slate-800/80 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 text-[11px] focus:outline-none focus:border-emerald-500/80 w-24 sm:w-32 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 top-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Type Filter dropdown */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-2 py-1 bg-slate-800/80 border border-slate-700/80 rounded-lg text-slate-200 text-[11px] focus:outline-none focus:border-emerald-500/80 font-medium"
          >
            {entityTypes.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Quick Header Zoom & View Actions */}
          <div className="flex items-center gap-0.5 bg-slate-800/80 border border-slate-700/80 rounded-lg p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => handleZoom(1.2)}
              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(0.8)}
              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded cursor-pointer"
              title="Fit / Center View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dedicated Fullscreen Toggle Button in Header */}
          {showFullscreenButton && (
            <button
              type="button"
              onClick={toggleFullscreen}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                isFullscreen
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/40 text-rose-300 hover:text-white'
                  : 'bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-500/40 text-emerald-300 hover:text-emerald-200'
              }`}
              title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Expand Fullscreen (पूर्ण स्क्रीनवर पहा)'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Exit</span>
                  <kbd className="hidden sm:inline px-1 py-0.2 text-[9px] font-mono bg-slate-900 border border-slate-700 rounded text-slate-400">ESC</kbd>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Graph SVG Canvas */}
      <div className="relative flex-1 min-h-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden">
        {/* Quick Re-center Button on Canvas */}
        <button
          type="button"
          onClick={fitToView}
          className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 hover:bg-slate-800/95 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 px-3 py-1 rounded-full text-[11px] font-medium shadow-lg flex items-center gap-1.5 transition-all cursor-pointer z-10 select-none backdrop-blur-md"
          title="Center graph nodes in view (मध्यभागी आणा)"
        >
          <Target className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Center Graph ({filteredNodes.length})</span>
        </button>
        <svg
          ref={svgRef}
          id="graph-bg"
          className="w-full h-full select-none"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            {/* Directional Arrowhead markers for various edge types */}
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
            </marker>

            <marker
              id="arrow-barred"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
            </marker>

            <marker
              id="arrow-synergy"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
            </marker>

            <marker
              id="arrow-treatise"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
            </marker>

            <marker
              id="arrow-contains"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#14b8a6" />
            </marker>

            <marker
              id="arrow-partof"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#818cf8" />
            </marker>

            <marker
              id="arrow-bda"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ec4899" />
            </marker>

            <marker
              id="arrow-tkdl"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#06b6d4" />
            </marker>

            <marker
              id="arrow-patent"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#c084fc" />
            </marker>

            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#34d399" />
            </marker>

            {/* Glowing radial gradient for background */}
            <radialGradient id="graph-ambient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#064e3b" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient background rect */}
          <rect width="100%" height="100%" fill="url(#graph-ambient)" />

          {/* Transform group for Zoom & Pan */}
          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
            {/* Edges with exact Source ➔ Target direction */}
            {filteredEdges.map(edge => {
              const relCfg = RELATION_CONFIG[edge.type] || RELATION_CONFIG[edge.label] || DEFAULT_REL_CONFIG;
              const isSelectedEdge = selectedEdge?.id === edge.id;
              const isHighlighted = activeHighlight ? activeHighlight.edgeIds.has(edge.id) : true;
              const isDimmed = activeHighlight && !isHighlighted;
              const isEdgeConnectedToSelectedNode =
                selectedNode &&
                (edge.sourceNode.id === selectedNode.id || edge.targetNode.id === selectedNode.id);
              const isEdgeHovered = hoveredEdge?.id === edge.id;

              const dx = edge.targetNode.x - edge.sourceNode.x;
              const dy = edge.targetNode.y - edge.sourceNode.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;

              const sourceR = edge.sourceNode.radius || 24;
              const targetR = edge.targetNode.radius || 24;

              // Calculate clean start & end coordinates outside the node radiuses
              const startX = edge.sourceNode.x + (dx / dist) * sourceR;
              const startY = edge.sourceNode.y + (dy / dist) * sourceR;
              const endX = edge.targetNode.x - (dx / dist) * (targetR + 8);
              const endY = edge.targetNode.y - (dy / dist) * (targetR + 8);

              const midX = (startX + endX) / 2;
              const midY = (startY + endY) / 2;

              const edgeText = relCfg.badge || edge.label || edge.type || 'RELATES_TO';
              const pillWidth = Math.max(48, edgeText.length * 6 + 14);

              return (
                <g
                  key={edge.id}
                  className="transition-opacity duration-200"
                  style={{ opacity: isDimmed ? 0.12 : 1 }}
                  onMouseEnter={() => setHoveredEdge(edge)}
                  onMouseLeave={() => setHoveredEdge(null)}
                >
                  {/* Invisible wide hit area for effortless clicking */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke="transparent"
                    strokeWidth="20"
                    className="cursor-pointer"
                    onClick={() => handleEdgeClick(edge)}
                  />

                  {/* Visible directional edge line */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={isSelectedEdge || isEdgeHovered || (isHighlighted && activeHighlight) ? '#34d399' : relCfg.stroke}
                    strokeWidth={isSelectedEdge || isEdgeHovered ? 3.5 : (isHighlighted && activeHighlight) ? 2.8 : 1.6}
                    strokeDasharray={isSelectedEdge || (isHighlighted && activeHighlight) ? '6,3' : edge.type === 'BARRED_BY' ? '5,4' : undefined}
                    markerEnd={
                      isSelectedEdge || isEdgeHovered || (isHighlighted && activeHighlight)
                        ? 'url(#arrow-active)'
                        : `url(#${relCfg.marker || 'arrow-default'})`
                    }
                    className="transition-all cursor-pointer hover:stroke-emerald-400"
                    onClick={() => handleEdgeClick(edge)}
                  />

                  {/* Edge relationship label pill */}
                  {(showLabels || isHighlighted || isSelectedEdge || isEdgeHovered) && !isDimmed && (
                    <g
                      transform={`translate(${midX}, ${midY})`}
                      className="cursor-pointer group"
                      onClick={() => handleEdgeClick(edge)}
                    >
                      <rect
                        x={-pillWidth / 2}
                        y="-9"
                        width={pillWidth}
                        height="18"
                        rx="9"
                        fill={isSelectedEdge || isEdgeHovered ? '#064e3b' : relCfg.labelBg}
                        stroke={isSelectedEdge || isEdgeHovered ? '#34d399' : relCfg.stroke}
                        strokeWidth="1.2"
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                        className="transition-colors group-hover:stroke-emerald-300"
                      />
                      <text
                        textAnchor="middle"
                        dy="3.5"
                        className="text-[9px] font-mono font-bold select-none pointer-events-none"
                        fill={isSelectedEdge || isEdgeHovered ? '#a7f3d0' : relCfg.text}
                      >
                        {edgeText}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map(node => {
              const config = ENTITY_CONFIG[node.type || node.label] || DEFAULT_CONFIG;
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode?.id === node.id;
              const isNodeHighlighted = activeHighlight ? activeHighlight.nodeIds.has(node.id) : true;
              const isNodeDimmed = activeHighlight && !isNodeHighlighted;

              const isEdgeSource = selectedEdge?.sourceNode.id === node.id;
              const isEdgeTarget = selectedEdge?.targetNode.id === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseDown={e => handleNodeMouseDown(e, node)}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer group transition-opacity duration-200"
                  style={{ opacity: isNodeDimmed ? 0.22 : 1 }}
                >
                  {/* Selection / Connection glow ring */}
                  {(isSelected || isHovered || isEdgeSource || isEdgeTarget || (isNodeHighlighted && activeHighlight)) && (
                    <circle
                      r={node.radius + 8}
                      fill="none"
                      stroke={isSelected || isHovered || isEdgeSource ? '#10b981' : isEdgeTarget ? '#38bdf8' : '#6366f1'}
                      strokeWidth="2.5"
                      strokeDasharray="4,3"
                      className="animate-spin"
                      style={{ animationDuration: '8s' }}
                    />
                  )}

                  {/* Node Body Circle */}
                  <circle
                    r={node.radius}
                    fill={config.bg}
                    stroke={isSelected || isHovered || isEdgeSource ? '#34d399' : isEdgeTarget ? '#38bdf8' : config.border}
                    strokeWidth={isSelected || isHovered ? 3.5 : 2}
                    filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))"
                    className="transition-all duration-200 group-hover:scale-110"
                  />

                  {/* Node Icon */}
                  <text
                    textAnchor="middle"
                    dy={node.radius > 24 ? '-4' : '4'}
                    className="text-xs select-none pointer-events-none"
                  >
                    {config.icon}
                  </text>

                  {/* Node Type Label */}
                  {node.radius > 24 && (
                    <text
                      textAnchor="middle"
                      dy="12"
                      className="text-[8px] font-mono font-bold uppercase tracking-wider select-none pointer-events-none"
                      fill={config.text}
                    >
                      {node.type || node.label}
                    </text>
                  )}

                  {/* Node Name pill */}
                  <g transform={`translate(0, ${node.radius + 13})`}>
                    <rect
                      x={-Math.min(node.name.length * 3.6, 80) - 5}
                      y="-8"
                      width={Math.min(node.name.length * 7.2, 160) + 10}
                      height="17"
                      rx="4"
                      fill="#020617"
                      fillOpacity="0.92"
                      stroke={isSelected || isHovered ? '#10b981' : isEdgeSource ? '#34d399' : isEdgeTarget ? '#38bdf8' : '#334155'}
                      strokeWidth="1.2"
                    />
                    <text
                      textAnchor="middle"
                      dy="4"
                      className="text-[10px] font-semibold select-none pointer-events-none"
                      fill={isSelected || isHovered ? '#34d399' : '#f1f5f9'}
                    >
                      {node.name.length > 22 ? node.name.slice(0, 20) + '…' : node.name}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Quick Inspection Tooltip on Hover */}
        {hoveredNode && !selectedNode && (
          <div className="absolute top-3 left-3 bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 rounded-xl px-3 py-2 shadow-2xl text-xs text-white max-w-xs space-y-1 animate-fade-in z-20 pointer-events-none">
            <div className="flex items-center gap-1.5 font-bold">
              <span>{ENTITY_CONFIG[hoveredNode.type || hoveredNode.label]?.icon || '🔹'}</span>
              <span className="text-emerald-300">{hoveredNode.name}</span>
              <span className="text-[9px] font-mono uppercase bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">
                {hoveredNode.type || hoveredNode.label}
              </span>
            </div>
            <div className="text-[10.5px] text-slate-300 font-mono">
              <span className="text-emerald-400 font-bold">{hoveredNode.degree || 1}</span> connections isolated · Click to pin
            </div>
          </div>
        )}

        {/* Dedicated Floating Zoom & Navigation Dock */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-2xl space-y-1">
          <button
            type="button"
            onClick={() => handleZoom(1.25)}
            className="p-2 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Zoom In (Scroll Up)"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={fitToView}
            className="px-1.5 py-1 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 font-mono text-[10px] font-bold rounded-lg transition-colors cursor-pointer text-center"
            title="Reset Zoom & Center"
            aria-label="Reset Zoom"
          >
            {Math.round(transform.k * 100)}%
          </button>
          <button
            type="button"
            onClick={() => handleZoom(0.8)}
            className="p-2 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Zoom Out (Scroll Down)"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-5 h-px bg-slate-700/80" />
          <button
            type="button"
            onClick={fitToView}
            className="p-2 hover:bg-slate-800 text-slate-200 hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
            title="Fit to Screen & Center"
            aria-label="Fit to Screen"
          >
            <Target className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowLabels(prev => !prev)}
            className={`p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ${showLabels ? 'text-emerald-400' : 'text-slate-400'}`}
            title={showLabels ? "Hide relationship labels (Clean mode)" : "Show all relationship labels"}
            aria-label="Toggle Labels"
          >
            {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          {showFullscreenButton && (
            <button
              type="button"
              onClick={toggleFullscreen}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isFullscreen
                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                  : 'hover:bg-slate-800 text-slate-200 hover:text-white'
              }`}
              title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Expand to Fullscreen (पूर्ण स्क्रीनवर पहा)'}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Legend Overlay at bottom left */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl text-[11px] shadow-lg flex flex-wrap items-center gap-2.5 z-10">
          <div className="flex items-center gap-1 font-bold text-slate-300 text-[10px] uppercase tracking-wider">
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>Entities:</span>
          </div>
          {Object.entries(ENTITY_CONFIG).slice(0, 5).map(([label, cfg]) => (
            <div key={label} className="flex items-center gap-1 text-slate-300">
              <span className="text-xs">{cfg.icon}</span>
              <span className="text-[10px] font-medium">{label}</span>
            </div>
          ))}
          <div className="text-[10px] font-mono text-emerald-400 font-semibold hidden md:inline">
            {filteredNodes.length} Nodes · {filteredEdges.length} Directed Edges
          </div>
        </div>

        {/* Interactive Edge Traversal Inspector ("kuthun edges kuthe jatat") */}
        {selectedEdge && (
          <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-80 bg-slate-900/95 backdrop-blur-lg border border-emerald-500/60 rounded-xl p-4 shadow-2xl space-y-2.5 animate-slide-up z-20">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Edge Traversal (कसे जोडले आहे)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEdge(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* From (कुठून) */}
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">
                🛫 कुठून (Origin / Source)
              </span>
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">
                    {ENTITY_CONFIG[selectedEdge.sourceNode.type || selectedEdge.sourceNode.label]?.icon || '🔹'}
                  </span>
                  <span className="font-bold text-xs text-white">
                    {selectedEdge.sourceNode.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNode(selectedEdge.sourceNode)}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium underline cursor-pointer"
                >
                  View
                </button>
              </div>
            </div>

            {/* Traversal Relationship (संबंध) */}
            <div className="p-2.5 bg-indigo-950/50 border border-indigo-500/40 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase text-indigo-300">
                  🔄 संबंध (Relation)
                </span>
                <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 font-bold">
                  {selectedEdge.label || selectedEdge.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                {selectedEdge.properties?.description ||
                  RELATION_CONFIG[selectedEdge.type]?.meaning ||
                  `${selectedEdge.sourceNode.name} connects to ${selectedEdge.targetNode.name}`}
              </p>
            </div>

            {/* To (कुठे जाते) */}
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">
                🛬 कुठे जाते (Destination / Target)
              </span>
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">
                    {ENTITY_CONFIG[selectedEdge.targetNode.type || selectedEdge.targetNode.label]?.icon || '🔹'}
                  </span>
                  <span className="font-bold text-xs text-white">
                    {selectedEdge.targetNode.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNode(selectedEdge.targetNode)}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium underline cursor-pointer"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Node Details Slide-over Drawer (Right Side) */}
        {selectedNode && (
          <div className="absolute top-3 right-3 w-76 max-h-[calc(100%-1.5rem)] bg-slate-900/95 backdrop-blur-lg border border-slate-700/80 rounded-xl p-4 shadow-2xl overflow-y-auto space-y-3 animate-fade-in z-20">
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {ENTITY_CONFIG[selectedNode.type || selectedNode.label]?.icon || '🔹'}
                </span>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                    {selectedNode.type || selectedNode.label}
                  </span>
                  <h4 className="font-bold text-xs text-white leading-tight">
                    {selectedNode.name}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Properties */}
            {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Node Properties
                </span>
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1 font-mono text-[11px]">
                  {Object.entries(selectedNode.properties).map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between gap-2">
                      <span className="text-slate-400 font-semibold">{k}:</span>
                      <span className="text-emerald-300 text-right font-medium">
                        {String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outgoing Edges: कुठून कुठे जाते */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                <span>कुठून कुठे जाते (Outgoing Edges)</span>
              </span>
              <div className="space-y-1">
                {filteredEdges
                  .filter(e => e.sourceNode.id === selectedNode.id)
                  .map(e => (
                    <div
                      key={e.id}
                      onClick={() => handleEdgeClick(e)}
                      className="p-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg flex items-center justify-between gap-1.5 cursor-pointer text-[11px] group transition-all"
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-xs">
                          {ENTITY_CONFIG[e.targetNode.type || e.targetNode.label]?.icon || '🔹'}
                        </span>
                        <div className="truncate">
                          <span className="text-[9.5px] font-mono font-bold text-emerald-400 block">
                            → [{e.label || e.type}]
                          </span>
                          <span className="text-slate-200 group-hover:text-emerald-300 font-medium truncate block">
                            {e.targetNode.name}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                    </div>
                  ))}
              </div>
            </div>

            {/* Incoming Edges: येणारे संबंध */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                <ArrowRight className="w-3 h-3 rotate-180" />
                <span>येणारे संबंध (Incoming Edges)</span>
              </span>
              <div className="space-y-1">
                {filteredEdges
                  .filter(e => e.targetNode.id === selectedNode.id)
                  .map(e => (
                    <div
                      key={e.id}
                      onClick={() => handleEdgeClick(e)}
                      className="p-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg flex items-center justify-between gap-1.5 cursor-pointer text-[11px] group transition-all"
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-xs">
                          {ENTITY_CONFIG[e.sourceNode.type || e.sourceNode.label]?.icon || '🔹'}
                        </span>
                        <div className="truncate">
                          <span className="text-[9.5px] font-mono font-bold text-indigo-300 block">
                            ← [{e.label || e.type}]
                          </span>
                          <span className="text-slate-200 group-hover:text-indigo-300 font-medium truncate block">
                            {e.sourceNode.name}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Traversal Path Explorer Drawer (संबंध सूची) */}
        {showPathDrawer && (
          <div className="absolute inset-x-3 bottom-3 max-h-56 bg-slate-900/95 backdrop-blur-xl border border-indigo-500/50 rounded-xl p-3 shadow-2xl overflow-y-auto space-y-2 z-20 animate-slide-up">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">
                  ज्ञान आलेख संबंध सूची (Full Knowledge Graph Traversal Paths)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                  {filteredEdges.length} Traversal Hops
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPathDrawer(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {filteredEdges.map((e, idx) => (
                <div
                  key={idx}
                  onClick={() => handleEdgeClick(e)}
                  className="p-2 bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-slate-200 truncate">
                      {e.sourceNode.name}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/40 shrink-0">
                      {e.label || e.type}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="font-bold text-emerald-300 truncate">
                      {e.targetNode.name}
                    </span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guide / How to Read Modal */}
        {showGuideModal && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90%] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">How to Read this Knowledge Graph</h3>
                    <p className="text-[11px] text-slate-400">Interactive Neo4j legal traversal explained</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Node Categories */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                  Node Types (Entities)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center gap-2">
                    <span className="text-base">🌿</span>
                    <div>
                      <span className="font-bold text-emerald-300 block">Herb</span>
                      <span className="text-[10px] text-slate-400">Ayurvedic botanical source</span>
                    </div>
                  </div>
                  <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center gap-2">
                    <span className="text-base">📜</span>
                    <div>
                      <span className="font-bold text-amber-300 block">Treatise</span>
                      <span className="text-[10px] text-slate-400">TKDL classical text precedent</span>
                    </div>
                  </div>
                  <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center gap-2">
                    <span className="text-base">⚖️</span>
                    <div>
                      <span className="font-bold text-blue-300 block">Statute</span>
                      <span className="text-[10px] text-slate-400">Patents Act, BDA 2002</span>
                    </div>
                  </div>
                  <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center gap-2">
                    <span className="text-base">📋</span>
                    <div>
                      <span className="font-bold text-indigo-300 block">Section</span>
                      <span className="text-[10px] text-slate-400">Section 3(p), 3(e) exclusions</span>
                    </div>
                  </div>
                  <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center gap-2">
                    <span className="text-base">🏛️</span>
                    <div>
                      <span className="font-bold text-rose-300 block">Regulatory Body</span>
                      <span className="text-[10px] text-slate-400">NBA, CGPDTM authorities</span>
                    </div>
                  </div>
                  <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center gap-2">
                    <span className="text-base">🧪</span>
                    <div>
                      <span className="font-bold text-teal-300 block">Formulation</span>
                      <span className="text-[10px] text-slate-400">Polyherbal compound blend</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edge Meanings */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                  Directed Arrows (Legal Relations)
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 bg-rose-950/40 border border-rose-900/60 rounded-lg">
                    <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>BARRED_BY / Section 3(p) Bar</span>
                    </div>
                    <p className="text-[11px] text-rose-200/80 mt-0.5">
                      Traditional Knowledge anticipation bar: this formulation or herb is directly precluded from patent grant under Section 3(p).
                    </p>
                  </div>
                  <div className="p-2 bg-amber-950/40 border border-amber-900/60 rounded-lg">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>REQUIRES_SYNERGY_UNDER / Section 3(e)</span>
                    </div>
                    <p className="text-[11px] text-amber-200/80 mt-0.5">
                      Mere admixture bar: claims must demonstrate synergistic interaction (Combination Index CI &lt; 1.0).
                    </p>
                  </div>
                  <div className="p-2 bg-emerald-950/40 border border-emerald-900/60 rounded-lg">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>DOCUMENTED_IN / Classical Text</span>
                    </div>
                    <p className="text-[11px] text-emerald-200/80 mt-0.5">
                      Codified in authoritative First Schedule Ayurvedic treatises (Charaka, Sushruta, Bhavaprakasha).
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation controls */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1 text-xs text-slate-300">
                <span className="font-bold text-white block">Navigation Tips:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400">
                  <li><strong className="text-slate-200">Zoom:</strong> Scroll your mouse wheel / trackpad pinch, or use the floating [+] / [-] buttons.</li>
                  <li><strong className="text-slate-200">Pan:</strong> Click and drag on empty canvas to move around.</li>
                  <li><strong className="text-slate-200">Reposition:</strong> Drag any circle to move it wherever you like.</li>
                  <li><strong className="text-slate-200">Spotlight:</strong> Hover over any node to highlight only its connections and dim others.</li>
                  <li><strong className="text-slate-200">Inspect:</strong> Click any node or edge to open full legal properties.</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <>
        {/* Placeholder in original location so layout stays intact */}
        <div
          className="rounded-2xl bg-slate-900/60 border border-dashed border-emerald-500/40 p-6 flex flex-col items-center justify-center text-center space-y-2 text-slate-300"
          style={{ height }}
        >
          <Maximize2 className="w-8 h-8 text-emerald-400 animate-pulse" />
          <div className="font-bold text-slate-100 text-sm">Full-Screen Mode Active</div>
          <p className="text-xs text-slate-400 max-w-xs">
            The knowledge graph is expanded across your entire screen for deep analysis.
          </p>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center gap-1.5 mt-2"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Fullscreen (ESC)</span>
          </button>
        </div>

        {/* Portal directly attached to document.body */}
        {createPortal(
          <div className="fixed inset-0 z-[99999] flex flex-col p-2 sm:p-5 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200">
            {/* Click backdrop to exit */}
            <div
              onClick={toggleFullscreen}
              className="absolute inset-0 -z-10"
              title="Click outside to exit fullscreen"
            />
            {visualizerContent}
          </div>,
          document.body
        )}
      </>
    );
  }

  return visualizerContent;
};
