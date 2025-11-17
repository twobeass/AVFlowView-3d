import * as d3 from 'd3';
import * as d3HwSchematic from 'd3-hwschematic';

class HwSchematicRenderer {
  constructor(containerSelector) {
    this.container = d3.select(containerSelector);
    this.zoomScale = 1;
    this.initSVG();
    this.setupZoomPan();
    this.schematic = d3HwSchematic.schematic ? d3HwSchematic.schematic() : null;
  }

  initSVG() {
    this.svg = this.container
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('class', 'hwschematic-svg-container');
    
    // Add defs for arrow markers
    const defs = this.svg.append('defs');
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('refX', 9)
      .attr('refY', 3)
      .attr('orient', 'auto')
      .append('polygon')
      .attr('points', '0 0, 10 3, 0 6')
      .attr('fill', '#333');
    
    this.g = this.svg.append('g').attr('class', 'hwschematic-content');
  }

  setupZoomPan() {
    this.zoom = d3
      .zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
        this.currentTransform = event.transform;
      });

    this.svg.call(this.zoom);
    this.currentTransform = d3.zoomIdentity;
  }

  render(data) {
    // Clear previous content
    this.g.selectAll('*').remove();

    if (this.schematic) {
      this.schematic.data(data).render(this.g.node());
    } else {
      // Fallback rendering if d3-hwschematic not available
      this.renderFallback(data);
    }

    // Fit to view after initial render
    setTimeout(() => this.fitToView(), 100);
  }

  renderFallback(data) {
    // Helper to find area offset by id
    const findAreaAbsOffset = (areaId) => {
      function search(nodes, offset) {
        for (const n of nodes) {
          const x = offset.x + (n.x || 0);
          const y = offset.y + (n.y || 0);
          if (n.id === areaId && n.children) return { x, y };
          if (n.children) {
            const found = search(n.children, { x, y });
            if (found) return found;
          }
        }
        return { x: 0, y: 0 };
      }
      return search(data.children || [], { x: 0, y: 0 }) || { x: 0, y: 0 };
    };

    // Helper to recursively render children
    const renderNodes = (nodes, parentG, parentOffset = { x: 0, y: 0 }) => {
      nodes.forEach((node) => {
        const absoluteX = parentOffset.x + (node.x || 0);
        const absoluteY = parentOffset.y + (node.y || 0);

        if (node.children && node.children.length) {
          // This is an area/container
          const groupG = parentG
            .append('g')
            .attr('class', 'area-container')
            .attr('data-id', node.id);

          groupG
            .append('rect')
            .attr('x', absoluteX)
            .attr('y', absoluteY)
            .attr('width', node.width || 400)
            .attr('height', node.height || 300)
            .attr('fill', 'rgba(240, 240, 240, 0.3)')
            .attr('stroke', '#999')
            .attr('stroke-width', 2)
            .attr('rx', 10);

          groupG
            .append('text')
            .attr('x', absoluteX + 10)
            .attr('y', absoluteY + 25)
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .attr('fill', '#666')
            .text(node.labels?.[0]?.text || node.id || 'Area');

          // Recurse into children with updated offset
          renderNodes(node.children, parentG, {
            x: absoluteX,
            y: absoluteY,
          });
        } else {
          // This is a device node
          const nodeG = parentG
            .append('g')
            .attr('class', 'device-node')
            .attr('data-id', node.id);

          // Get category for color
          const category = node.properties?.['hwMeta.category'] || 'default';
          const status = node.properties?.['hwMeta.status'] || 'Regular';
          const fillColor = this.getCategoryColor(category);
          const strokeColor = status === 'Defect' ? '#D0021B' : '#333';
          const strokeDash = status === 'Defect' ? '5,5' : 'none';

          nodeG
            .append('rect')
            .attr('class', 'device-box')
            .attr('x', absoluteX)
            .attr('y', absoluteY)
            .attr('width', node.width || 140)
            .attr('height', node.height || 80)
            .attr('rx', 5)
            .attr('fill', fillColor)
            .attr('stroke', strokeColor)
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', strokeDash)
            .attr('opacity', status === 'Existing' ? 0.7 : 1);

          nodeG
            .append('text')
            .attr('x', absoluteX + (node.width || 140) / 2)
            .attr('y', absoluteY + (node.height || 80) / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .attr('fill', '#000')
            .text(node.labels?.[0]?.text || node.id || 'Device');

          // Draw ports as small circles with improved distribution
          if (node.ports && node.ports.length > 0) {
            // Group ports by side for even distribution
            const portsBySide = {
              WEST: [],
              EAST: [],
              NORTH: [],
              SOUTH: []
            };
            
            node.ports.forEach((port) => {
              const portSide = port.properties?.['org.eclipse.elk.portSide'] || 'EAST';
              if (portsBySide[portSide]) {
                portsBySide[portSide].push(port);
              }
            });

            // Render each port with even distribution within its side
            Object.entries(portsBySide).forEach(([side, ports]) => {
              ports.forEach((port, portIndex) => {
                let px = absoluteX;
                let py = absoluteY;
                const portCount = ports.length;

                // Calculate even distribution
                switch (side) {
                  case 'WEST':
                    px = absoluteX;
                    py = absoluteY + ((node.height || 80) / (portCount + 1)) * (portIndex + 1);
                    break;
                  case 'EAST':
                    px = absoluteX + (node.width || 140);
                    py = absoluteY + ((node.height || 80) / (portCount + 1)) * (portIndex + 1);
                    break;
                  case 'NORTH':
                    px = absoluteX + ((node.width || 140) / (portCount + 1)) * (portIndex + 1);
                    py = absoluteY;
                    break;
                  case 'SOUTH':
                    px = absoluteX + ((node.width || 140) / (portCount + 1)) * (portIndex + 1);
                    py = absoluteY + (node.height || 80);
                    break;
                }

                nodeG
                  .append('circle')
                  .attr('cx', px)
                  .attr('cy', py)
                  .attr('r', 5)
                  .attr('fill', '#fff')
                  .attr('stroke', '#333')
                  .attr('stroke-width', 2);
              });
            });
          }
        }
      });
    };

    // Clear previous content
    this.g.selectAll('*').remove();

    // Render all nodes/areas recursively
    if (data.children) {
      renderNodes(data.children, this.g);
    }

    // Render edges AFTER nodes, in root coordinate space
    if (data.edges) {
      data.edges.forEach((edge) => {
        let pathData = null;
        // Use ELK path if present and offset if in a container
        if (edge.sections && edge.sections[0]) {
          // Find area offset if not root
          let offset = {x: 0, y: 0};
          if (edge.container && edge.container !== 'root') {
            offset = findAreaAbsOffset(edge.container);
          }
          pathData = this.createPathFromSectionWithOffset(edge.sections[0], offset);
        } else {
          // Manual fallback: Find nodes and port circles with port side info
          const srcKey = edge.sources[0] || '';
          const tgtKey = edge.targets[0] || '';
          const findNodePortAbsPosAndSide = (nodeId, portKey) => {
            function search(nodes, offset) {
              for (const n of nodes) {
                const x = offset.x + (n.x || 0);
                const y = offset.y + (n.y || 0);
                if (n.id === nodeId && n.ports) {
                  // Group ports by side to match rendering logic
                  const portsBySide = {
                    WEST: [],
                    EAST: [],
                    NORTH: [],
                    SOUTH: []
                  };
                  
                  n.ports.forEach((p) => {
                    const pSide = p.properties?.['org.eclipse.elk.portSide'] || 'EAST';
                    if (portsBySide[pSide]) {
                      portsBySide[pSide].push(p);
                    }
                  });
                  
                  // Find the target port and calculate its position with even distribution
                  for (const port of n.ports) {
                    if (port.id === nodeId + '/' + portKey) {
                      let px = x, py = y;
                      const portSide = port.properties?.['org.eclipse.elk.portSide'] || 'EAST';
                      const portsOnSameSide = portsBySide[portSide];
                      const portIndex = portsOnSameSide.findIndex(p => p.id === port.id);
                      const portCount = portsOnSameSide.length;
                      
                      // Use same distribution formula as rendering
                      switch (portSide) {
                        case 'WEST':
                          px = x;
                          py = y + ((n.height || 80) / (portCount + 1)) * (portIndex + 1);
                          break;
                        case 'EAST':
                          px = x + (n.width || 140);
                          py = y + ((n.height || 80) / (portCount + 1)) * (portIndex + 1);
                          break;
                        case 'NORTH':
                          px = x + ((n.width || 140) / (portCount + 1)) * (portIndex + 1);
                          py = y;
                          break;
                        case 'SOUTH':
                          px = x + ((n.width || 140) / (portCount + 1)) * (portIndex + 1);
                          py = y + (n.height || 80);
                          break;
                      }
                      return {x: px, y: py, side: portSide};
                    }
                  }
                }
                if(n.children) { const found = search(n.children, {x, y}); if(found) return found; }
              }
            }
            const found = search(data.children, {x:0, y:0});
            return found || {x: 0, y: 0, side: 'EAST'};
          };
          const [srcNode, srcPort] = srcKey.split('/');
          const [tgtNode, tgtPort] = tgtKey.split('/');
          const srcInfo = findNodePortAbsPosAndSide(srcNode, srcPort);
          const tgtInfo = findNodePortAbsPosAndSide(tgtNode, tgtPort);
          
          // Use orthogonal routing for professional schematic appearance
          pathData = this.createOrthogonalPath(
            {x: srcInfo.x, y: srcInfo.y},
            {x: tgtInfo.x, y: tgtInfo.y},
            srcInfo.side,
            tgtInfo.side
          );
        }
        // Draw edge if pathData is ready
        if (pathData) {
          this.g
            .append('path')
            .attr('class', 'edge-path')
            .attr('data-id', edge.id)
            .attr('d', pathData)
            .attr('stroke', this.getCategoryColor(edge.properties?.['hwMeta.category']) || '#333')
            .attr('fill', 'none')
            .attr('stroke-width', 3)
            .attr('marker-end', 'url(#arrowhead)');
          // Add edge label at optimal position (middle of longest segment)
          if (edge.labels && edge.labels[0]) {
            const labelPos = this.findLabelPosition(pathData);
            
            // Add label with background for better readability
            const labelText = edge.labels[0].text;
            const labelGroup = this.g.append('g').attr('class', 'edge-label');
            
            // Add semi-transparent background rectangle
            const tempText = labelGroup
              .append('text')
              .attr('x', labelPos.x)
              .attr('y', labelPos.y)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('font-size', '10px')
              .attr('visibility', 'hidden')
              .text(labelText);
            
            const bbox = tempText.node().getBBox();
            tempText.remove();
            
            labelGroup
              .append('rect')
              .attr('x', bbox.x - 2)
              .attr('y', bbox.y - 1)
              .attr('width', bbox.width + 4)
              .attr('height', bbox.height + 2)
              .attr('fill', 'rgba(255, 255, 255, 0.9)')
              .attr('rx', 2);
            
            labelGroup
              .append('text')
              .attr('x', labelPos.x)
              .attr('y', labelPos.y)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('font-size', '10px')
              .attr('font-weight', '500')
              .attr('fill', '#333')
              .text(labelText);
          }
        }
      });
    }
  }

  createPathFromSectionWithOffset(section, offset) {
    const start = section.startPoint;
    const end = section.endPoint;
    const bendPoints = section.bendPoints || [];
    let pathData = `M ${start.x + offset.x} ${start.y + offset.y}`;
    bendPoints.forEach((bp) => {
      pathData += ` L ${bp.x + offset.x} ${bp.y + offset.y}`;
    });
    pathData += ` L ${end.x + offset.x} ${end.y + offset.y}`;
    return pathData;
  }

  /**
   * Find the best position for a label on an SVG path (middle of longest segment).
   * 
   * @param {string} pathData - SVG path data string
   * @returns {object} {x, y} coordinates for label placement
   */
  findLabelPosition(pathData) {
    // Parse path data to extract all points
    const points = [];
    const commands = pathData.match(/[ML]\s*([0-9.]+)\s+([0-9.]+)/g) || [];
    
    commands.forEach(cmd => {
      const match = cmd.match(/([0-9.]+)\s+([0-9.]+)/);
      if (match) {
        points.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
      }
    });
    
    if (points.length < 2) {
      // Fallback: use first point if path is invalid
      return points[0] || { x: 0, y: 0 };
    }
    
    // Calculate length of each segment
    const segments = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const length = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
      );
      segments.push({
        start: p1,
        end: p2,
        length,
        midX: (p1.x + p2.x) / 2,
        midY: (p1.y + p2.y) / 2
      });
    }
    
    // Find longest segment
    const longestSegment = segments.reduce((longest, current) => 
      current.length > longest.length ? current : longest
    );
    
    // Return midpoint of longest segment
    return {
      x: longestSegment.midX,
      y: longestSegment.midY
    };
  }

  /**
   * Create an orthogonal (Manhattan-style) path between two points
   * based on their port sides for professional schematic routing.
   * 
   * @param {object} srcPos - Source position {x, y}
   * @param {object} tgtPos - Target position {x, y}
   * @param {string} srcSide - Source port side (WEST, EAST, NORTH, SOUTH)
   * @param {string} tgtSide - Target port side (WEST, EAST, NORTH, SOUTH)
   * @returns {string} SVG path data
   */
  createOrthogonalPath(srcPos, tgtPos, srcSide, tgtSide) {
    const { x: x1, y: y1 } = srcPos;
    const { x: x2, y: y2 } = tgtPos;
    
    const EXTENSION = 40; // How far to extend from port before turning
    
    // Determine routing strategy based on port sides
    if ((srcSide === 'EAST' || srcSide === 'WEST') && 
        (tgtSide === 'EAST' || tgtSide === 'WEST')) {
      // Horizontal-horizontal: create path with vertical segment in middle
      const midY = (y1 + y2) / 2;
      const extX1 = srcSide === 'EAST' ? x1 + EXTENSION : x1 - EXTENSION;
      const extX2 = tgtSide === 'EAST' ? x2 + EXTENSION : x2 - EXTENSION;
      return `M ${x1} ${y1} L ${extX1} ${y1} L ${extX1} ${midY} L ${extX2} ${midY} L ${extX2} ${y2} L ${x2} ${y2}`;
    } else if ((srcSide === 'NORTH' || srcSide === 'SOUTH') && 
               (tgtSide === 'NORTH' || tgtSide === 'SOUTH')) {
      // Vertical-vertical: create path with horizontal segment in middle
      const midX = (x1 + x2) / 2;
      const extY1 = srcSide === 'SOUTH' ? y1 + EXTENSION : y1 - EXTENSION;
      const extY2 = tgtSide === 'SOUTH' ? y2 + EXTENSION : y2 - EXTENSION;
      return `M ${x1} ${y1} L ${x1} ${extY1} L ${midX} ${extY1} L ${midX} ${extY2} L ${x2} ${extY2} L ${x2} ${y2}`;
    } else {
      // Mixed orientation: create L-shape or Z-shape based on sides
      if ((srcSide === 'EAST' && tgtSide === 'NORTH') || 
          (srcSide === 'SOUTH' && tgtSide === 'WEST')) {
        // Two-segment path: horizontal then vertical (or vertical then horizontal)
        if (srcSide === 'EAST' || srcSide === 'WEST') {
          const extX = srcSide === 'EAST' ? x1 + EXTENSION : x1 - EXTENSION;
          return `M ${x1} ${y1} L ${extX} ${y1} L ${extX} ${y2} L ${x2} ${y2}`;
        } else {
          const extY = srcSide === 'SOUTH' ? y1 + EXTENSION : y1 - EXTENSION;
          return `M ${x1} ${y1} L ${x1} ${extY} L ${x2} ${extY} L ${x2} ${y2}`;
        }
      } else {
        // Default: simple L-shape routing
        if (srcSide === 'EAST' || srcSide === 'WEST') {
          // Go horizontal first, then vertical
          const midX = x1 + (x2 - x1) * 0.6;
          return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
        } else {
          // Go vertical first, then horizontal
          const midY = y1 + (y2 - y1) * 0.6;
          return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
        }
      }
    }
  }

  getCategoryColor(category) {
    const colors = {
      video: '#E24A6F',
      audio: '#4A90E2',
      network: '#50C878',
      control: '#F5A623',
      power: '#D0021B',
      display: '#9B59B6',
      wallplate: '#95A5A6',
      default: '#ddd',
    };
    return colors[category?.toLowerCase()] || colors.default;
  }

  zoomIn() { /* unchanged */ }
  zoomOut() { /* unchanged */ }
  zoomToScale(scale) { /* unchanged */ }
  resetZoom() { /* unchanged */ }
  fitToView() { /* unchanged */ }
  DeviceRenderer(selection) { /* unchanged */ }
  AreaRenderer(selection) { /* unchanged */ }
  EdgeRenderer(selection) { /* unchanged */ }
}

export default HwSchematicRenderer;
