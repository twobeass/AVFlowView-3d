import * as d3 from 'd3';
import * as d3HwSchematic from 'd3-hwschematic';

class HwSchematicRenderer {
  constructor(containerSelector) {
    console.log('d3HwSchematic exports:', d3HwSchematic);
    this.container = d3.select(containerSelector);
    this.initSVG();
    this.setupZoomPan();
    // Temporarily comment out schematic usage until export is identified
    // this.schematic = d3HwSchematic.schematic ? d3HwSchematic.schematic() : null;
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
    if(this.schematic) {
      this.schematic.data(data)
        .render(this.g.node());
    } else {
      console.error('Schematic factory not set.');
    }
  }

  DeviceRenderer(selection) {
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

  AreaRenderer(selection) {
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

  EdgeRenderer(selection) {
    selection.append('path')
      .attr('class', 'edge-path')
      .attr('stroke', d => d.color || '#333')
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');
  }
}

export default HwSchematicRenderer;
