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

  /* [initSVG, setupZoomPan, render, renderFallback node drawing code unchanged] */

  renderFallback(data) {
    // ... Node/area rendering is unchanged ...
    // Clear previous content
    this.g.selectAll('*').remove();
    // Render nodes/areas as before:
    const renderNodes = (nodes, parentG, parentOffset = { x: 0, y: 0 }) => { /* ... unchanged ... */ };
    if (data.children) renderNodes(data.children, this.g);

    //=== Render edges (FIXED version) ===//
    if (data.edges) {
      data.edges.forEach((edge) => {
        let pathData = null;
        // Try elkjs geometry if available
        if (edge.sections && edge.sections[0]) {
          pathData = this.createPathFromSection(edge.sections[0]);
        } else {
          // Manual fallback: Find nodes and port circles
          const srcKey = edge.sources[0] || '';
          const tgtKey = edge.targets[0] || '';
          const findNodePortAbsPos = (nodeId, portKey) => {
            let abs = {x: 0, y: 0};
            function search(nodes, offset) {
              for (const n of nodes) {
                const x = offset.x + (n.x || 0);
                const y = offset.y + (n.y || 0);
                if (n.id === nodeId && n.ports) {
                  for (const port of n.ports) {
                    if (port.id === nodeId + '/' + portKey) {
                      // Compute port position based on node, portSide
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
            .attr('d', pathData)
            .attr('stroke', this.getCategoryColor(edge.properties?.['hwMeta.category']) || '#333')
            .attr('fill', 'none')
            .attr('stroke-width', 3)
            .attr('marker-end', 'url(#arrowhead)');
          // Optional: Add edge label at middle
          if (edge.labels && edge.labels[0]) {
            // For simple lines, get midpoint
            let mx = 0, my = 0;
            if (edge.sections && edge.sections[0]) {
              const midPoint = this.getMidPoint(edge.sections[0]);
              mx = midPoint.x; my = midPoint.y;
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

  // (rest unchanged)
}

export default HwSchematicRenderer;
