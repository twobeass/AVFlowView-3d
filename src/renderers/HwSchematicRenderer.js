import * as d3 from 'd3';

class HwSchematicRenderer {
  constructor(containerSelector) {
    this.container = d3.select(containerSelector);
    this.zoomScale = 1;
    // Routing config ... (same as before)
    this.routingConfig = {
      extensionLength: 30,
      obstaclePadding: 2,
      localSearchRadius: 300,
      minBendPoints: 2,
      maxBendPoints: 4,
      maxIterations: 10,
      protectedSegmentsCount: 4,
      edgeSeparation: 8,
      enableCollisionDetection: true,
      logPerformance: false,
      debugCollisions: false,
      visualizeObstacles: false,
      visualizeSegments: false,
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
    const defs = this.svg.append('defs');
    defs.append('marker').attr('id', 'arrowhead').attr('markerWidth', 10).attr('markerHeight', 10).attr('refX', 9).attr('refY', 3).attr('orient', 'auto')
    .append('polygon').attr('points', '0 0, 10 3, 0 6').attr('fill', '#333');
    this.g = this.svg.append('g').attr('class', 'hwschematic-content');
  }
  setupZoomPan() {
    this.zoom = d3.zoom().scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
        this.currentTransform = event.transform;
      });
    this.svg.call(this.zoom);
    this.currentTransform = d3.zoomIdentity;
  }
  setRoutingConfig(config) {
    this.routingConfig = { ...this.routingConfig, ...config };
  }
  render(data) {
    this.g.selectAll('*').remove();
    this.renderFallback(data);
    setTimeout(() => (this.fitToView && this.fitToView()), 100);
  }
  renderFallback(data) {
    // <- Insert full original fallback renderer from main here, unchanged - ommitted for brevity
  }
  // ... all rendering, debug, util functions from main branch ...
  fitToView() {
   const bounds = this.g.node() ? this.g.node().getBBox() : { x: 0, y: 0, width: 0, height: 0 };
   const parent = this.svg.node().parentElement;
   const fullWidth = parent.clientWidth;
   const fullHeight = parent.clientHeight;
   const width = bounds.width;
   const height = bounds.height;
   if (width === 0 || height === 0) return;
   const midX = bounds.x + width / 2;
   const midY = bounds.y + height / 2;
   const scale = 0.9 / Math.max(width / fullWidth, height / fullHeight);
   const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];
   this.svg.transition().duration(750)
     .call(
       this.zoom.transform,
       d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
     );
  }
}
export default HwSchematicRenderer;
