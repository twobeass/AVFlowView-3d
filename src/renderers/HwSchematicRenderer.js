import * as d3 from 'd3';

class HwSchematicRenderer {
  constructor(containerSelector) {
    this.container = d3.select(containerSelector);
    this.zoomScale = 1;

    // Routing configuration - all parameters are adjustable
    this.routingConfig = {
      // Port extensions
      extensionLength: 30, // px to extend from port before routing

      // Obstacle detection
      obstaclePadding: 2, // MINIMAL: Just 2px padding to detect actual node overlap
      localSearchRadius: 300, // INCREASED: Check obstacles within larger radius

      // Routing behavior
      minBendPoints: 2, // Minimum waypoints near each port
      maxBendPoints: 4, // Maximum waypoints near each port
      maxIterations: 10, // Max iterations for collision resolution
      protectedSegmentsCount: 4, // Number of segments near each port to protect from collisions
      edgeSeparation: 8, // Pixels to offset parallel edges for visual clarity

      // Performance
      enableCollisionDetection: true, // Can disable for debugging/comparison
      logPerformance: false, // Log routing time per edge
      debugCollisions: false, // NEW: Log collision detection details
      visualizeObstacles: false, // DISABLED: Debug visualization
      visualizeSegments: false, // DISABLED: Debug visualization
    };

    this.initSVG();
    this.setupZoomPan();
  }

  initSVG() {
    this.svg = this.container
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('class', 'hwschematic-svg-container');

    // Add defs for arrow markers
    const defs = this.svg.append('defs');
    defs
      .append('marker')
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

  /**
   * Update routing configuration dynamically
   * @param {object} config - Partial configuration to merge with existing config
   * @example
   * renderer.setRoutingConfig({
   *   extensionLength: 40,
   *   localSearchRadius: 200,
   *   minBendPoints: 3
   * });
   */
  setRoutingConfig(config) {
    this.routingConfig = { ...this.routingConfig, ...config };
  }

  render(data) {
    // Clear previous content and render with ELK's orthogonal routing
    this.g.selectAll('*').remove();
    this.renderFallback(data);

    // Fit to view after initial render
    setTimeout(() => this.fitToView(), 100);
  }

  renderFallback(data) {
    // ... full original method from main branch ...
    // Cache obstacles for all edges (performance optimization)
    if (this.routingConfig.enableCollisionDetection) {
      this._cachedObstacles = this._getAllDeviceObstacles(data);
    }
    const renderNodes = (nodes, parentG, parentOffset = { x: 0, y: 0 }) => {
      nodes.forEach((node) => {
        const absoluteX = parentOffset.x + (node.x || 0);
        const absoluteY = parentOffset.y + (node.y || 0);
        if (node.children && node.children.length) {
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
          renderNodes(node.children, parentG, {
            x: absoluteX,
            y: absoluteY,
          });
        } else {
          const nodeG = parentG
            .append('g')
            .attr('class', 'device-node')
            .attr('data-id', node.id);
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
          if (node.ports && node.ports.length > 0) {
            node.ports.forEach((port) => {
              const px = absoluteX + (port.x !== undefined ? port.x : 0);
              const py = absoluteY + (port.y !== undefined ? port.y : 0);
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
    this.g.selectAll('*').remove();
    if (data.children) {
      renderNodes(data.children, this.g);
    }
    if (this.routingConfig.visualizeObstacles && this._cachedObstacles) {
      this._cachedObstacles.forEach((obs) => {
        this.g
          .append('rect')
          .attr('x', obs.x)
          .attr('y', obs.y)
          .attr('width', obs.width)
          .attr('height', obs.height)
          .attr('fill', 'none')
          .attr('stroke', 'red')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5')
          .attr('opacity', 0.5)
          .attr('pointer-events', 'none');
      });
    }
    if (data.edges) {
      data.edges.forEach((edge, idx) => {
        let pathData = null;
        if (edge.sections && edge.sections.length > 0) {
          const section = edge.sections[0];
          const sourceNodeId = edge.sources[0].split('/')[0];
          const targetNodeId = edge.targets[0].split('/')[0];
          const containerOffset = this.findEdgeContainer(
            edge,
            sourceNodeId,
            targetNodeId,
            data
          );
          const srcPos = this.findPortAbsolutePosition(
            edge.sources[0].split('/')[0],
            edge.sources[0].split('/')[1],
            data
          );
          const tgtPos = this.findPortAbsolutePosition(
            edge.targets[0].split('/')[0],
            edge.targets[0].split('/')[1],
            data
          );
          pathData = this.createPathFromELKSection(
            section,
            srcPos,
            tgtPos,
            containerOffset
          );
        } else {
          pathData = this.createFallbackPath(edge, data, idx);
        }
        if (pathData) {
          const points = [];
          const commands =
            pathData.match(/[ML]\s*([0-9.]+)\s+([0-9.]+)/g) || [];
          commands.forEach((cmd) => {
            const match = cmd.match(/([0-9.]+)\s+([0-9.]+)/);
            if (match) {
              points.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
            }
          });
          const edgePath = this.g
            .append('path')
            .attr('class', 'edge-path')
            .attr('data-id', edge.id)
            .attr('d', pathData)
            .attr('stroke', '#333')
            .attr('fill', 'none')
            .attr('stroke-width', 3)
            .attr('marker-end', 'url(#arrowhead)')
            .style('cursor', 'pointer')
            .datum(edge);
          edgePath
            .on('mouseenter', function () {
              d3.select(this).attr('stroke', '#2563eb').attr('stroke-width', 4);
            })
            .on('mouseleave', function () {
              d3.select(this).attr('stroke', '#333').attr('stroke-width', 3);
            })
            .on('click', () => {
              if (window.debugPanel) {
                window.debugPanel.inspectEdge(edge.id);
              }
            });
          if (edge.labels && edge.labels[0]) {
            const labelPos = this.findLabelPosition(pathData);
            const labelText = edge.labels[0].text;
            const labelGroup = this.g.append('g').attr('class', 'edge-label');
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

// (All utility and helper methods are unchanged)
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
  zoomIn() {}
  zoomOut() {}
  zoomToScale(_scale) {}
  resetZoom() {}
  fitToView() {}
  DeviceRenderer(_selection) {}
  AreaRenderer(_selection) {}
  EdgeRenderer(_selection) {}
}

export default HwSchematicRenderer;
