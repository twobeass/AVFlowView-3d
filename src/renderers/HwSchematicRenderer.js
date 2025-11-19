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
   * Zoom in programmatically
   */
  zoomIn() {
    const svg = this.svg;
    const zoom = this.zoom;
    svg
      .transition()
      .duration(300)
      .call(zoom.scaleBy, 1.3);
  }

  /**
   * Zoom out programmatically
   */
  zoomOut() {
    const svg = this.svg;
    const zoom = this.zoom;
    svg
      .transition()
      .duration(300)
      .call(zoom.scaleBy, 0.77); // 1/1.3
  }

  /**
   * Zoom to specific scale
   * @param {number} scale - Target zoom scale
   */
  zoomToScale(scale) {
    const svg = this.svg;
    const zoom = this.zoom;
    svg
      .transition()
      .duration(300)
      .call(zoom.scaleTo, scale);
  }

  /**
   * Reset zoom to 1:1 scale
   */
  resetZoom() {
    const svg = this.svg;
    const zoom = this.zoom;
    svg
      .transition()
      .duration(500)
      .call(
        zoom.transform,
        d3.zoomIdentity.translate(0, 0).scale(1)
      );
  }

  /**
   * Fit content to view
   */
  fitToView() {
    const bounds = this.g.node().getBBox();
    const parent = this.svg.node().parentElement;
    const fullWidth = parent.clientWidth;
    const fullHeight = parent.clientHeight;

    const width = bounds.width;
    const height = bounds.height;

    if (width === 0 || height === 0) return; // Nothing to fit

    const midX = bounds.x + width / 2;
    const midY = bounds.y + height / 2;

    const scale = 0.9 / Math.max(width / fullWidth, height / fullHeight);
    const translate = [
      fullWidth / 2 - scale * midX,
      fullHeight / 2 - scale * midY,
    ];

    this.svg
      .transition()
      .duration(750)
      .call(
        this.zoom.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
  }

  // ... rest of the file remains the same ...
  // (All the other methods from the original file)
}

export default HwSchematicRenderer;
