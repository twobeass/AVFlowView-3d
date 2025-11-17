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

          // Draw ports as small circles
          if (node.ports && node.ports.length > 0) {
            node.ports.forEach((port, idx) => {
              const portSide = port.properties?.['org.eclipse.elk.portSide'];
              let px = absoluteX;
              let py = absoluteY;

              // Position ports on device sides
              switch (portSide) {
                case 'WEST':
                  px = absoluteX;
                  py = absoluteY + (node.height || 80) / 2 + idx * 20 - 10;
                  break;
                case 'EAST':
                  px = absoluteX + (node.width || 140);
                  py = absoluteY + (node.height || 80) / 2 + idx * 20 - 10;
                  break;
                case 'NORTH':
                  px = absoluteX + (node.width || 140) / 2 + idx * 20 - 10;
                  py = absoluteY;
                  break;
                case 'SOUTH':
                  px = absoluteX + (node.width || 140) / 2 + idx * 20 - 10;
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
          // Manual fallback: Find nodes and port circles
          const srcKey = edge.sources[0] || '';
          const tgtKey = edge.targets[0] || '';
          const findNodePortAbsPos = (nodeId, portKey) => {
            function search(nodes, offset) {
              for (const n of nodes) {
                const x = offset.x + (n.x || 0);
                const y = offset.y + (n.y || 0);
                if (n.id === nodeId && n.ports) {
                  for (const port of n.ports) {
                    if (port.id === nodeId + '/' + portKey) {
                      let px = x, py = y;
                      switch (port.properties?.['org.eclipse.elk.portSide']) {
                        case 'WEST': px = x; py = y + (n.height||80)/2; break;
                        case 'EAST': px = x+(n.width||140); py = y + (n.height||80)/2; break;
                        case 'NORTH': px = x+(n.width||140)/2; py = y; break;
                        case 'SOUTH': px = x+(n.width||140)/2; py = y+(n.height||80); break;
                        default: break;
                      }
                      return {x: px, y: py};
                    }
                  }
                }
                if(n.children) { const found = search(n.children, {x, y}); if(found) return found; }
              }
            }
            const found = search(data.children, {x:0, y:0});
            return found || {x: 0, y: 0};
          };
          const [srcNode, srcPort] = srcKey.split('/');
          const [tgtNode, tgtPort] = tgtKey.split('/');
          const srcPos = findNodePortAbsPos(srcNode, srcPort);
          const tgtPos = findNodePortAbsPos(tgtNode, tgtPort);
          pathData = `M ${srcPos.x} ${srcPos.y} L ${tgtPos.x} ${tgtPos.y}`;
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
          // Optional: Add edge label at middle
          if (edge.labels && edge.labels[0]) {
            let mx = 0, my = 0;
            if (edge.sections && edge.sections[0]) {
              // Add offset for accurate label
              const section = edge.sections[0];
              let offset = {x: 0, y: 0};
              if (edge.container && edge.container !== 'root') {
                offset = findAreaAbsOffset(edge.container);
              }
              mx = ((section.startPoint.x + section.endPoint.x) / 2) + offset.x;
              my = ((section.startPoint.y + section.endPoint.y) / 2) + offset.y;
            } else {
              const m = pathData.match(/M ([0-9.]+) ([0-9.]+) L ([0-9.]+) ([0-9.]+)/);
              if(m) { mx = (Number(m[1])+Number(m[3]))/2; my = (Number(m[2])+Number(m[4]))/2; }
            }
            this.g
              .append('text')
              .attr('x', mx)
              .attr('y', my - 5)
              .attr('text-anchor', 'middle')
              .attr('font-size', '10px')
              .attr('fill', '#666')
              .text(edge.labels[0].text);
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
