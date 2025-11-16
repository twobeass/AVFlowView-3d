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
    // Simple fallback rendering for nodes and edges
    if (data.children) {
      data.children.forEach((node) => {
        const nodeG = this.g
          .append('g')
          .attr('transform', `translate(${node.x || 0},${node.y || 0})`);

        nodeG
          .append('rect')
          .attr('class', 'device-box')
          .attr('width', node.width || 120)
          .attr('height', node.height || 60)
          .attr('rx', 5)
          .attr('fill', '#ddd')
          .attr('stroke', '#333');

        nodeG
          .append('text')
          .attr('x', 10)
          .attr('y', 30)
          .text(node.labels?.[0]?.text || node.id || 'Device');
      });
    }

    if (data.edges) {
      data.edges.forEach((edge) => {
        if (edge.sections && edge.sections[0]) {
          const section = edge.sections[0];
          const pathData = this.createPathFromSection(section);

          this.g
            .append('path')
            .attr('d', pathData)
            .attr('stroke', '#333')
            .attr('fill', 'none')
            .attr('stroke-width', 2);
        }
      });
    }
  }

  createPathFromSection(section) {
    const start = section.startPoint;
    const end = section.endPoint;
    const bendPoints = section.bendPoints || [];

    let pathData = `M ${start.x} ${start.y}`;
    bendPoints.forEach((bp) => {
      pathData += ` L ${bp.x} ${bp.y}`;
    });
    pathData += ` L ${end.x} ${end.y}`;

    return pathData;
  }

  /**
   * Zoom in by 30%
   */
  zoomIn() {
    const newScale = this.currentTransform.k * 1.3;
    this.zoomToScale(newScale);
  }

  /**
   * Zoom out by 30%
   */
  zoomOut() {
    const newScale = this.currentTransform.k / 1.3;
    this.zoomToScale(newScale);
  }

  /**
   * Zoom to a specific scale factor
   * @param {number} scale - Target zoom scale
   */
  zoomToScale(scale) {
    const bounded = Math.max(0.1, Math.min(10, scale));
    const svgNode = this.svg.node();
    const bounds = svgNode.getBoundingClientRect();
    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;

    this.svg
      .transition()
      .duration(300)
      .call(
        this.zoom.transform,
        d3.zoomIdentity
          .translate(centerX, centerY)
          .scale(bounded)
          .translate(
            -centerX / this.currentTransform.k,
            -centerY / this.currentTransform.k
          )
      );
  }

  /**
   * Reset zoom to identity (1:1 scale, no translation)
   */
  resetZoom() {
    this.svg.transition().duration(500).call(this.zoom.transform, d3.zoomIdentity);
  }

  /**
   * Automatically fit the rendered content to the viewport
   */
  fitToView() {
    const svgNode = this.svg.node();
    const contentBounds = this.g.node().getBBox();

    if (contentBounds.width === 0 || contentBounds.height === 0) return;

    const svgBounds = svgNode.getBoundingClientRect();
    const padding = 50;

    const scaleX = (svgBounds.width - padding * 2) / contentBounds.width;
    const scaleY = (svgBounds.height - padding * 2) / contentBounds.height;
    const scale = Math.min(scaleX, scaleY, 1);

    const translateX =
      (svgBounds.width - contentBounds.width * scale) / 2 -
      contentBounds.x * scale;
    const translateY =
      (svgBounds.height - contentBounds.height * scale) / 2 -
      contentBounds.y * scale;

    this.svg
      .transition()
      .duration(500)
      .call(
        this.zoom.transform,
        d3.zoomIdentity.translate(translateX, translateY).scale(scale)
      );
  }

  DeviceRenderer(selection) {
    selection
      .append('rect')
      .attr('class', 'device-box')
      .attr('width', 120)
      .attr('height', 60)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', '#ddd');

    selection
      .append('text')
      .attr('class', 'device-header')
      .attr('x', 10)
      .attr('y', 20)
      .text((d) => d.name || 'Device');
  }

  AreaRenderer(selection) {
    selection
      .append('rect')
      .attr('class', 'area-container')
      .attr('width', (d) => d.width || 200)
      .attr('height', (d) => d.height || 150)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', '#f7f7f7')
      .attr('stroke', '#999');

    selection
      .append('text')
      .attr('class', 'area-label')
      .attr('x', 10)
      .attr('y', 20)
      .text((d) => d.label || 'Area');
  }

  EdgeRenderer(selection) {
    selection
      .append('path')
      .attr('class', 'edge-path')
      .attr('stroke', (d) => d.color || '#333')
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');
  }
}

export default HwSchematicRenderer;
