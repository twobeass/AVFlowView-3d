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
        if (edge.sections && edge.sections[0]) {
          const section = edge.sections[0];
          const pathData = this.createPathFromSection(section);
          const category = edge.properties?.['hwMeta.category'];

          this.g
            .append('path')
            .attr('class', 'edge-path')
            .attr('d', pathData)
            .attr('stroke', this.getCategoryColor(category) || '#333')
            .attr('fill', 'none')
            .attr('stroke-width', 3)
            .attr('marker-end', 'url(#arrowhead)');

          // Optional: Add edge label
          if (edge.labels && edge.labels[0]) {
            const midPoint = this.getMidPoint(section);
            this.g
              .append('text')
              .attr('x', midPoint.x)
              .attr('y', midPoint.y - 5)
              .attr('text-anchor', 'middle')
              .attr('font-size', '10px')
              .attr('fill', '#666')
              .text(edge.labels[0].text);
          }
        }
      });
    }
  }

  getMidPoint(section) {
    const start = section.startPoint;
    const end = section.endPoint;
    return {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    };
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
    this.svg
      .transition()
      .duration(500)
      .call(this.zoom.transform, d3.zoomIdentity);
  }

  /**
   * Automatically fit the rendered content to the viewport
   */
  fitToView() {
    try {
      const svgNode = this.svg.node();
      const contentBounds = this.g.node().getBBox();

      if (contentBounds.width === 0 || contentBounds.height === 0) return;

      const svgBounds = svgNode.getBoundingClientRect();
      const padding = 50;

      const scaleX = (svgBounds.width - padding * 2) / contentBounds.width;
      const scaleY = (svgBounds.height - padding * 2) / contentBounds.height;
      const scale = Math.min(scaleX, scaleY, 1.5);

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
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('fitToView failed:', error);
    }
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
