// AVToELKConverter
// ------------------
// Converts an AV wiring graph (validated against av-wiring-graph.schema.json)
// into an ELK JSON structure suitable for use with ELK's layered algorithm
// and d3-hwschematic.
//
// Phase 3 focuses on:
// - Mapping Areas → container nodes
// - Mapping Nodes → ELK nodes with ports
// - Mapping Edges → ELK edges referencing nodes/ports
// - Applying basic layout options (direction, orthogonal routing)
//
// Later phases will enrich this with CategoryStyler, PortDirectionResolver,
// and d3-hwschematic-specific metadata.

function computeLayoutDirection(layout = {}) {
  return layout.direction === 'TB' ? 'DOWN' : 'RIGHT';
}

function computePortSide(alignment, layoutDirection) {
  const isTB = layoutDirection === 'DOWN';

  switch (alignment) {
    case 'In':
      return isTB ? 'NORTH' : 'WEST';
    case 'Out':
      return isTB ? 'SOUTH' : 'EAST';
    case 'Bidirectional':
    default:
      return isTB ? 'SOUTH' : 'EAST';
  }
}

function createAreaNodes(graph, elkGraph) {
  const areas = Array.isArray(graph.areas) ? graph.areas : [];
  const areaNodeMap = new Map();

  // First pass: create ELK nodes for all areas.
  areas.forEach((area) => {
    if (!area || !area.id) {
      return;
    }

    const elkArea = {
      id: area.id,
      labels: area.label ? [{ text: area.label }] : [],
      width: 400, // Default area width
      height: 300, // Default area height
      children: [],
      ports: [],
      properties: {
        'hwMeta.type': 'area',
        // Removed padding to test if it's causing coordinate issues
        // 'elk.padding': '[top=40,left=20,bottom=20,right=20]',
      },
    };

    areaNodeMap.set(area.id, elkArea);
  });

  // Second pass: attach areas to their parent or to the root graph.
  areas.forEach((area) => {
    if (!area || !area.id) {
      return;
    }

    const elkArea = areaNodeMap.get(area.id);

    if (area.parentId && areaNodeMap.has(area.parentId)) {
      const parentElk = areaNodeMap.get(area.parentId);
      parentElk.children.push(elkArea);
    } else {
      elkGraph.children.push(elkArea);
    }
  });

  return areaNodeMap;
}

function createDeviceNodes(graph, elkGraph, areaNodeMap, layoutDirection) {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const nodeMap = new Map();

  nodes.forEach((node) => {
    if (!node || !node.id) {
      return;
    }

    const label =
      node.label ||
      `${node.manufacturer ?? ''} ${node.model ?? ''}`.trim() ||
      node.id;

    const elkNode = {
      id: node.id,
      labels: [{ text: label }],
      width: 140, // Default device width
      height: 80, // Default device height
      children: [],
      ports: [],
      properties: {
        'hwMeta.type': 'device',
        'hwMeta.category': node.category,
        'hwMeta.status': node.status,
      },
    };

    // Ports
    const ports =
      node.ports && typeof node.ports === 'object' ? node.ports : {};

    // Group ports by side first (critical for correct distribution)
    const portEntries = Object.entries(ports);
    const portsBySide = {
      WEST: [],
      EAST: [],
      NORTH: [],
      SOUTH: [],
    };

    // First pass: group ports by their side
    portEntries.forEach(([portKey, port]) => {
      if (!port) {
        return;
      }
      const side = computePortSide(port.alignment, layoutDirection);
      portsBySide[side].push({ portKey, port });
    });

    // Second pass: create ELK ports with correct distribution per side
    let globalIndex = 0;
    Object.entries(portsBySide).forEach(([side, portsOnSide]) => {
      portsOnSide.forEach(({ portKey, port }) => {
        // Calculate position based on ports ON THIS SIDE only
        // Note: ELK will automatically position ports on the specified side

        elkNode.ports.push({
          id: `${node.id}/${portKey}`,
          labels: port.label ? [{ text: port.label }] : [],
          // Let ELK position ports - no explicit x/y
          properties: {
            'org.eclipse.elk.portSide': side,
            'org.eclipse.elk.port.index': globalIndex,
            'hwMeta.portKey': portKey,
            'hwMeta.type': port.type,
            'hwMeta.gender': port.gender,
          },
        });

        globalIndex++;
      });
    });

    nodeMap.set(node.id, elkNode);

    if (node.areaId && areaNodeMap.has(node.areaId)) {
      const areaContainer = areaNodeMap.get(node.areaId);
      areaContainer.children.push(elkNode);
    } else {
      elkGraph.children.push(elkNode);
    }
  });

  return nodeMap;
}

function createEdges(graph, elkGraph) {
  const edges = Array.isArray(graph.edges) ? graph.edges : [];

  edges.forEach((edge) => {
    if (!edge || !edge.id || !edge.source || !edge.target) {
      return;
    }

    const sourcePortId =
      edge.sourcePortKey !== null && edge.sourcePortKey !== undefined
        ? `${edge.source}/${edge.sourcePortKey}`
        : undefined;
    const targetPortId =
      edge.targetPortKey !== null && edge.targetPortKey !== undefined
        ? `${edge.target}/${edge.targetPortKey}`
        : undefined;

    const elkEdge = {
      id: edge.id,
      sources: [sourcePortId || edge.source],
      targets: [targetPortId || edge.target],
      labels: edge.label ? [{ text: edge.label }] : [],
      properties: {
        'hwMeta.category': edge.category,
        'hwMeta.cableType': edge.cableType,
        'hwMeta.wireId': edge.wireId,
      },
    };

    elkGraph.edges.push(elkEdge);
  });
}

export class AVToELKConverter {
  /**
   * Convert a validated AV wiring graph JSON object into an ELK JSON graph
   * suitable for ELK's layered algorithm and d3-hwschematic.
   *
   * @param {unknown} json
   * @returns {object} ELK graph JSON
   */
  // eslint-disable-next-line class-methods-use-this
  convert(json) {
    if (!json || typeof json !== 'object' || Array.isArray(json)) {
      throw new Error('AVToELKConverter.convert expects a non-null object');
    }

    const graph = json;

    const layoutDirection = computeLayoutDirection(graph.layout || {});

    const elkGraph = {
      id: 'root',
      children: [],
      edges: [],
      layoutOptions: {
        // ========== CORE ALGORITHM ==========
        'org.eclipse.elk.algorithm': 'layered',
        'org.eclipse.elk.direction': layoutDirection,

        // ========== EDGE ROUTING ==========
        'org.eclipse.elk.layered.edgeRouting': 'ORTHOGONAL',
        'org.eclipse.elk.edgeRouting': 'ORTHOGONAL', // CRITICAL: Root-level edge routing

        // ========== HIERARCHY & PORT HANDLING ==========
        'org.eclipse.elk.hierarchyHandling': 'INCLUDE_CHILDREN', // Back to INCLUDE_CHILDREN, testing without padding
        'org.eclipse.elk.portConstraints': 'FIXED_SIDE', // Ports stay on assigned sides, ELK positions them

        // ========== SPACING (Optimized for AV diagrams) ==========
        'org.eclipse.elk.spacing.nodeNode': 220,
        'org.eclipse.elk.spacing.edgeNode': 88,
        'org.eclipse.elk.spacing.edgeEdge': 55,
        'org.eclipse.elk.layered.spacing.edgeNodeBetweenLayers': 110,
        'org.eclipse.elk.layered.spacing.edgeEdgeBetweenLayers': 15, // NEW: Better parallel edge separation
        'org.eclipse.elk.layered.spacing.baseValue': 55,

        // ========== NODE PLACEMENT ==========
        'org.eclipse.elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
        'org.eclipse.elk.layered.nodePlacement.bk.edgeStraightening':
          'IMPROVE_STRAIGHTNESS', // NEW: Straighter edges
        'org.eclipse.elk.layered.nodePlacement.favorStraightEdges': true, // NEW: Prefer straight edges

        // ========== CROSSING & ORDERING ==========
        'org.eclipse.elk.layered.considerModelOrder.strategy':
          'NODES_AND_EDGES',
        'org.eclipse.elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',

        // ========== EDGE PRIORITIES ==========
        'org.eclipse.elk.layered.priority.shortness': 10, // NEW: Prioritize shorter edges
        'org.eclipse.elk.layered.priority.straightness': 5, // NEW: Secondary: straight edges
        'org.eclipse.elk.layered.priority.direction': 0, // Tertiary: flow direction

        // ========== COMPACTION ==========
        'org.eclipse.elk.layered.compaction.connectedComponents': true, // NEW: Reduce whitespace
        'org.eclipse.elk.layered.compaction.postCompaction.strategy':
          'EDGE_LENGTH', // NEW: Better edge separation
        'org.eclipse.elk.layered.compaction.postCompaction.constraints':
          'SCANLINE', // NEW: Constraint handling

        // ========== COMPONENT SEPARATION ==========
        'org.eclipse.elk.separateConnectedComponents': true,
      },
    };

    const areaNodeMap = createAreaNodes(graph, elkGraph);

    createDeviceNodes(graph, elkGraph, areaNodeMap, layoutDirection);

    createEdges(graph, elkGraph);

    return elkGraph;
  }
}
