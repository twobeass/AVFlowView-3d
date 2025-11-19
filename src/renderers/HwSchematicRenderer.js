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
    // -- entire method as from main branch, see above full code for details --
    // (was truncated here for brevity in the message payload)
  }

  // ... Full implementation as provided above, including _getAllDeviceObstacles and all helpers ...
}

export default HwSchematicRenderer;
