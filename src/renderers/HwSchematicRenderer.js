import * as d3 from 'd3';

class HwSchematicRenderer {
  constructor(containerSelector) {
    this.container = d3.select(containerSelector);
    this.zoomScale = 1;

    // Routing configuration - all parameters are adjustable
    this.routingConfig = {
      extensionLength: 30, // px to extend from port before routing
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
    this.zoom = d3.zoom().scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
        this.currentTransform = event.transform;
      });
    this.svg.call(this.zoom);
    this.currentTransform = d3.zoomIdentity;
  }

  zoomIn() {
    this.svg.transition().duration(300).call(this.zoom.scaleBy, 1.3);
  }

  zoomOut() {
    this.svg.transition().duration(300).call(this.zoom.scaleBy, 0.77);
  }

  zoomToScale(scale) {
    this.svg.transition().duration(300).call(this.zoom.scaleTo, scale);
  }

  resetZoom() {
    this.svg.transition().duration(500)
      .call(this.zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1));
  }

  fitToView() {
    const bounds = this.g.node().getBBox();
    const parent = this.svg.node().parentElement;
    const fullWidth = parent.clientWidth;
    const fullHeight = parent.clientHeight;
    const width = bounds.width;
    const height = bounds.height;
    if (width === 0 || height === 0) return;
    const midX = bounds.x + width / 2;
    const midY = bounds.y + height / 2;
    const scale = 0.9 / Math.max(width / fullWidth, height / fullHeight);
    const translate = [
      fullWidth / 2 - scale * midX,
      fullHeight / 2 - scale * midY,
    ];
    this.svg.transition().duration(750)
      .call(
        this.zoom.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
  }

  /**
   * Main render method for AVFlowView3dApp
   * @param {Object} graph - The ELK graph object to display
   */
  render(graph) {
    // Clear existing SVG content
    this.g.selectAll('*').remove();
    if (!graph) return;
    // Render areas (containers)
    if (graph.children) {
      graph.children.forEach((node) => {
        this.renderNode(node);
      });
    }
    // Render edges (cables)
    if (graph.edges) {
      graph.edges.forEach((edge) => {
        this.renderEdge(edge, graph);
      });
    }
  }

  // Basic node renderer example
  renderNode(node) {
    this.g
      .append('rect')
      .attr('x', node.x)
      .attr('y', node.y)
      .attr('width', node.width)
      .attr('height', node.height)
      .attr('fill', '#e0e0e0')
      .attr('stroke', '#333')
      .attr('stroke-width', 2);
    if (node.label) {
      this.g.append('text')
        .attr('x', node.x + node.width / 2)
        .attr('y', node.y + node.height / 2)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('font-size', 12)
        .text(node.label);
    }
    if (node.children) {
      node.children.forEach((child) => this.renderNode(child));
    }
  }

  renderEdge(edge, graph) {
    if (!edge.sections || !edge.sections.length) return;
    const section = edge.sections[0];
    if (!section.startPoint || !section.endPoint) return;
    const path = d3.path();
    path.moveTo(section.startPoint.x, section.startPoint.y);
    if (section.bendPoints && section.bendPoints.length) {
      section.bendPoints.forEach((pt) => path.lineTo(pt.x, pt.y));
    }
    path.lineTo(section.endPoint.x, section.endPoint.y);
    this.g.append('path')
      .attr('d', path.toString())
      .attr('stroke', '#2196f3')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('class', 'edge-path');
  }
}

export default HwSchematicRenderer;
