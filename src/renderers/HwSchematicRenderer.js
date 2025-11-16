// src/renderers/HwSchematicRenderer.js

import * as d3 from 'd3';
import d3HwSchematic from 'd3-hwschematic';

class HwSchematicRenderer {
  constructor(containerSelector) {
    this.container = d3.select(containerSelector);
    this.initSVG();
    this.setupZoomPan();
    this.schematic = d3HwSchematic();
  }

  initSVG() {
    this.svg = this.container.append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('class', 'hwschematic-svg-container');
    this.g = this.svg.append('g')
      .attr('class', 'hwschematic-content');
  }

  setupZoomPan() {
    this.zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);
  }

  render(data) {
    this.schematic.data(data)
      .render(this.g.node());
  }

  // Placeholder for custom device rendering
  DeviceRenderer(selection) {
    // Render device boxes with header and label
    selection.append('rect')
      .attr('class', 'device-box')
      .attr('width', 120)
      .attr('height', 60)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', '#ddd');

    selection.append('text')
      .attr('class', 'device-header')
      .attr('x', 10)
      .attr('y', 20)
      .text(d => d.name || 'Device');
  }

  // Placeholder for custom area rendering
  AreaRenderer(selection) {
    // Render area container
    selection.append('rect')
      .attr('class', 'area-container')
      .attr('width', d => d.width || 200)
      .attr('height', d => d.height || 150)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', '#f7f7f7')
      .attr('stroke', '#999');

    selection.append('text')
      .attr('class', 'area-label')
      .attr('x', 10)
      .attr('y', 20)
      .text(d => d.label || 'Area');
  }

  // Placeholder for custom edge rendering
  EdgeRenderer(selection) {
    // Render orthogonal edges with category colors and cable patterns
    selection.append('path')
      .attr('class', 'edge-path')
      .attr('stroke', d => d.color || '#333')
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');
  }
}

export default HwSchematicRenderer;
