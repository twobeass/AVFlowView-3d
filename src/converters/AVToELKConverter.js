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
      width: 400,  // Default area width
      height: 300, // Default area height
      children: [],
      ports: [],
      properties: {
        'hwMeta.type': 'area',
        'elk.padding': '[top=40,left=20,bottom=20,right=20]',
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
      width: 140,  // Default device width
      height: 80,  // Default device height
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

    Object.entries(ports).forEach(([portKey, port]) => {
      if (!port) {
        return;
      }

      const side = computePortSide(port.alignment, layoutDirection);

      elkNode.ports.push({
        id: `${node.id}/${portKey}`,
        labels: port.label ? [{ text: port.label }] : [],
        properties: {
          'org.eclipse.elk.portSide': side,
          'hwMeta.portKey': portKey,
          'hwMeta.type': port.type,
          'hwMeta.gender': port.gender,
        },
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
        'org.eclipse.elk.algorithm': 'layered',
        'org.eclipse.elk.direction': layoutDirection,
        'org.eclipse.elk.layered.edgeRouting': 'ORTHOGONAL',
        'org.eclipse.elk.spacing.nodeNode': 220,  // +10%: More space to reduce overlap
        'org.eclipse.elk.spacing.edgeNode': 88,   // +10%: More clearance for obstacle avoidance
        'org.eclipse.elk.spacing.edgeEdge': 55,   // +10%: Better edge separation
        'org.eclipse.elk.layered.spacing.edgeNodeBetweenLayers': 110,  // +10%: More space between layers
        'org.eclipse.elk.layered.spacing.baseValue': 55,  // +10%: Increased base spacing
        'org.eclipse.elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',  // Better node positioning
        'org.eclipse.elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',  // Respect input order
        'org.eclipse.elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',  // Better crossing minimization
        'org.eclipse.elk.separateConnectedComponents': true,  // Separate disconnected components
        'org.eclipse.elk.hierarchyHandling': 'INCLUDE_CHILDREN',  // CRITICAL: Enable routing for hierarchical edges
        'org.eclipse.elk.edgeRouting': 'ORTHOGONAL',  // CRITICAL: Enable edge routing at root level
      },
    };

    const areaNodeMap = createAreaNodes(graph, elkGraph);

    createDeviceNodes(graph, elkGraph, areaNodeMap, layoutDirection);

    createEdges(graph, elkGraph);

    return elkGraph;
  }
}
