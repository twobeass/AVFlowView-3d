import * as d3 from 'd3';

class HwSchematicRenderer {
  constructor(containerSelector) {
    this.container = d3.select(containerSelector);
    this.zoomScale = 1;
    this.routingConfig = { extensionLength: 30, obstaclePadding: 2, localSearchRadius: 300, minBendPoints: 2, maxBendPoints: 4, maxIterations: 10, protectedSegmentsCount: 4, edgeSeparation: 8, enableCollisionDetection: true, logPerformance: false, debugCollisions: false, visualizeObstacles: false, visualizeSegments: false };
    this.initSVG();
    this.setupZoomPan();
  }

  initSVG() {
    this.svg = this.container.append('svg').attr('width', '100%').attr('height', '100%').attr('class', 'hwschematic-svg-container');
    const defs = this.svg.append('defs');
    defs.append('marker').attr('id', 'arrowhead').attr('markerWidth', 10).attr('markerHeight', 10).attr('refX', 9).attr('refY', 3).attr('orient', 'auto').append('polygon').attr('points', '0 0, 10 3, 0 6').attr('fill', '#333');
    this.g = this.svg.append('g').attr('class', 'hwschematic-content');
  }

  setupZoomPan() {
    this.zoom = d3.zoom().scaleExtent([0.1, 10]).on('zoom', (event) => { this.g.attr('transform', event.transform); this.currentTransform = event.transform; });
    this.svg.call(this.zoom);
    this.currentTransform = d3.zoomIdentity;
  }

  setRoutingConfig(config) {
    this.routingConfig = { ...this.routingConfig, ...config };
  }

  render(data) {
    this.g.selectAll('*').remove();
    this.renderFallback(data);
    setTimeout(() => this.fitToView(), 100);
  }

  renderFallback(data) {
    if (this.routingConfig.enableCollisionDetection) {
      this._cachedObstacles = this._getAllDeviceObstacles(data);
    }
    
    const renderNodes = (nodes, parentG, parentOffset = { x: 0, y: 0 }) => {
      nodes.forEach((node) => {
        // eslint-disable-next-line no-console
        console.log(`🔍 Node ${node.id}: ELK x=${node.x}, y=${node.y}, hasChildren=${!!(node.children && node.children.length)}, parentOffset=(${parentOffset.x}, ${parentOffset.y})`);
        const absoluteX = parentOffset.x + (node.x || 0);
        const absoluteY = parentOffset.y + (node.y || 0);
        // eslint-disable-next-line no-console
        console.log(`   → Calculated absolute: (${absoluteX}, ${absoluteY})`);
        if (node.children && node.children.length) {
          const groupG = parentG.append('g').attr('class', 'area-container').attr('data-id', node.id);
          groupG.append('rect').attr('x', absoluteX).attr('y', absoluteY).attr('width', node.width || 400).attr('height', node.height || 300).attr('fill', 'rgba(240, 240, 240, 0.3)').attr('stroke', '#999').attr('stroke-width', 2).attr('rx', 10);
          groupG.append('text').attr('x', absoluteX + 10).attr('y', absoluteY + 25).attr('font-size', '16px').attr('font-weight', 'bold').attr('fill', '#666').text(node.labels?.[0]?.text || node.id || 'Area');
          renderNodes(node.children, parentG, { x: absoluteX, y: absoluteY });
        } else {
          const nodeG = parentG.append('g').attr('class', 'device-node').attr('data-id', node.id);
          const category = node.properties?.['hwMeta.category'] || 'default';
          const status = node.properties?.['hwMeta.status'] || 'Regular';
          const fillColor = this.getCategoryColor(category);
          const strokeColor = status === 'Defect' ? '#D0021B' : '#333';
          const strokeDash = status === 'Defect' ? '5,5' : 'none';
          nodeG.append('rect').attr('class', 'device-box').attr('x', absoluteX).attr('y', absoluteY).attr('width', node.width || 140).attr('height', node.height || 80).attr('rx', 5).attr('fill', fillColor).attr('stroke', strokeColor).attr('stroke-width', 2).attr('stroke-dasharray', strokeDash).attr('opacity', status === 'Existing' ? 0.7 : 1);
          nodeG.append('text').attr('x', absoluteX + (node.width || 140) / 2).attr('y', absoluteY + (node.height || 80) / 2).attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('font-size', '12px').attr('font-weight', 'bold').attr('fill', '#000').text(node.labels?.[0]?.text || node.id || 'Device');
          if (node.ports && node.ports.length > 0) {
            node.ports.forEach((port) => {
              const px = absoluteX + (port.x !== undefined ? port.x : 0);
              const py = absoluteY + (port.y !== undefined ? port.y : 0);
              // eslint-disable-next-line no-console
              console.log(`📍 Rendering port ${port.id} at (${px.toFixed(1)}, ${py.toFixed(1)}) - ELK port: (${port.x}, ${port.y}), node at (${absoluteX}, ${absoluteY})`);
              nodeG.append('circle').attr('cx', px).attr('cy', py).attr('r', 5).attr('fill', '#fff').attr('stroke', '#333').attr('stroke-width', 2);
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
      this._cachedObstacles.forEach(obs => {
        this.g.append('rect').attr('x', obs.x).attr('y', obs.y).attr('width', obs.width).attr('height', obs.height).attr('fill', 'none').attr('stroke', 'red').attr('stroke-width', 2).attr('stroke-dasharray', '5,5').attr('opacity', 0.5).attr('pointer-events', 'none');
      });
    }
    if (data.edges) {
      data.edges.forEach((edge, idx) => {
        let pathData = null;
        if (edge.sections && edge.sections.length > 0) {
          const section = edge.sections[0];
          const sourceNodeId = edge.sources[0].split('/')[0];
          const targetNodeId = edge.targets[0].split('/')[0];
          const containerOffset = this.findEdgeContainer(edge, sourceNodeId, targetNodeId, data);
          // eslint-disable-next-line no-console
          console.log(`🔗 Edge ${edge.id}: container offset (${containerOffset.x}, ${containerOffset.y})`);
          const srcPos = this.findPortAbsolutePosition(edge.sources[0].split('/')[0], edge.sources[0].split('/')[1], data);
          const tgtPos = this.findPortAbsolutePosition(edge.targets[0].split('/')[0], edge.targets[0].split('/')[1], data);
          pathData = this.createPathFromELKSection(section, srcPos, tgtPos, containerOffset);
        } else {
          const sourceNodeId = edge.sources[0].split('/')[0];
          const targetNodeId = edge.targets[0].split('/')[0];
          const sourcePortKey = edge.sources[0].split('/')[1];
          const targetPortKey = edge.targets[0].split('/')[1];
          // eslint-disable-next-line no-console
          console.warn('⚠️ FALLBACK ROUTING ACTIVATED:', {
            edgeId: edge.id,
            source: `${sourceNodeId}/${sourcePortKey}`,
            target: `${targetNodeId}/${targetPortKey}`,
            reason: !edge.sections ? 'No sections array' : edge.sections.length === 0 ? 'Empty sections array' : !edge.sections[0].bendPoints ? 'No bendPoints in section[0]' : 'Unknown',
            hasSections: !!edge.sections,
            sectionsCount: edge.sections?.length || 0,
            bendPointsCount: edge.sections?.[0]?.bendPoints?.length || 0,
            hasStartPoint: !!edge.sections?.[0]?.startPoint,
            hasEndPoint: !!edge.sections?.[0]?.endPoint,
          });
          pathData = this.createFallbackPath(edge, data, idx);
        }
        if (pathData) {
          const points = [];
          const commands = pathData.match(/[ML]\s*([0-9.]+)\s+([0-9.]+)/g) || [];
          commands.forEach(cmd => {
            const match = cmd.match(/([0-9.]+)\s+([0-9.]+)/);
            if (match) {
              points.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
            }
          });
          const edgePath = this.g.append('path').attr('class', 'edge-path').attr('data-id', edge.id).attr('d', pathData).attr('stroke', '#333').attr('fill', 'none').attr('stroke-width', 3).attr('marker-end', 'url(#arrowhead)').style('cursor', 'pointer').datum(edge);
          edgePath.on('mouseenter', function() {
            d3.select(this).attr('stroke', '#2563eb').attr('stroke-width', 4);
          }).on('mouseleave', function() {
            d3.select(this).attr('stroke', '#333').attr('stroke-width', 3);
          }).on('click', () => {
            if (window.debugPanel) {
              window.debugPanel.inspectEdge(edge.id);
            }
          });
          if (edge.labels && edge.labels[0]) {
            const labelPos = this.findLabelPosition(pathData);
            const labelText = edge.labels[0].text;
            const labelGroup = this.g.append('g').attr('class', 'edge-label');
            const tempText = labelGroup.append('text').attr('x', labelPos.x).attr('y', labelPos.y).attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('font-size', '10px').attr('visibility', 'hidden').text(labelText);
            const bbox = tempText.node().getBBox();
            tempText.remove();
            labelGroup.append('rect').attr('x', bbox.x - 2).attr('y', bbox.y - 1).attr('width', bbox.width + 4).attr('height', bbox.height + 2).attr('fill', 'rgba(255, 255, 255, 0.9)').attr('rx', 2);
            labelGroup.append('text').attr('x', labelPos.x).attr('y', labelPos.y).attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('font-size', '10px').attr('font-weight', '500').attr('fill', '#333').text(labelText);
          }
        }
      });
    }
  }

  // Remaining methods unchanged but with proper formatting
  getCategoryColor(category) {
    const colors = {
      audio: '#FFB74D',
      video: '#64B5F6',
      control: '#81C784',
      network: '#BA68C8',
      power: '#E57373',
      default: '#E0E0E0'
    };
    return colors[category] || colors.default;
  }

  findPortAbsolutePosition(nodeId, portKey, data) {
    let result = { x: 0, y: 0 };
    const search = (nodes, offset = { x: 0, y: 0 }) => {
      for (const node of nodes) {
        const hasChildren = node.children && node.children.length > 0;
        const nodeX = hasChildren ? (node.x || 0) : offset.x + (node.x || 0);
        const nodeY = hasChildren ? (node.y || 0) : offset.y + (node.y || 0);
        if (node.id === nodeId) {
          if (node.ports && node.ports.length > 0) {
            const port = node.ports.find(p => p.id === `${nodeId}/${portKey}`);
            if (port) {
              result = { x: nodeX + (port.x || 0), y: nodeY + (port.y || 0) };
              return true;
            }
          }
          result = { x: nodeX + (node.width || 140) / 2, y: nodeY + (node.height || 80) / 2 };
          return true;
        }
        if (node.children && search(node.children, { x: nodeX, y: nodeY })) {
          return true;
        }
      }
      return false;
    };
    if (data.children) {
      search(data.children);
    }
    return result;
  }

  findEdgeContainer(edge, sourceNodeId, targetNodeId, data) {
    return { x: 0, y: 0 };
  }

  createPathFromELKSection(section, srcPos, tgtPos, containerOffset) {
    let path = `M ${srcPos.x} ${srcPos.y}`;
    if (section.bendPoints && section.bendPoints.length > 0) {
      section.bendPoints.forEach(bp => {
        path += ` L ${bp.x} ${bp.y}`;
      });
    }
    path += ` L ${tgtPos.x} ${tgtPos.y}`;
    return path;
  }

  createFallbackPath(edge, data, idx) {
    const sourceNodeId = edge.sources[0].split('/')[0];
    const targetNodeId = edge.targets[0].split('/')[0];
    const sourcePortKey = edge.sources[0].split('/')[1];
    const targetPortKey = edge.targets[0].split('/')[1];
    const srcPos = this.findPortAbsolutePosition(sourceNodeId, sourcePortKey, data);
    const tgtPos = this.findPortAbsolutePosition(targetNodeId, targetPortKey, data);
    return `M ${srcPos.x} ${srcPos.y} L ${tgtPos.x} ${tgtPos.y}`;
  }

  findLabelPosition(pathData) {
    const points = [];
    const commands = pathData.match(/[ML]\s*([0-9.]+)\s+([0-9.]+)/g) || [];
    commands.forEach(cmd => {
      const match = cmd.match(/([0-9.]+)\s+([0-9.]+)/);
      if (match) {
        points.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
      }
    });
    if (points.length === 0) {
      return { x: 0, y: 0 };
    }
    const midIndex = Math.floor(points.length / 2);
    return points[midIndex];
  }

  _getAllDeviceObstacles(data) {
    const obstacles = [];
    const traverse = (nodes, offset = { x: 0, y: 0 }) => {
      nodes.forEach(node => {
        const hasChildren = node.children && node.children.length > 0;
        const nodeX = hasChildren ? (node.x || 0) : offset.x + (node.x || 0);
        const nodeY = hasChildren ? (node.y || 0) : offset.y + (node.y || 0);
        if (!hasChildren) {
          obstacles.push({
            x: nodeX,
            y: nodeY,
            width: node.width || 140,
            height: node.height || 80
          });
        }
        if (node.children) {
          traverse(node.children, { x: nodeX, y: nodeY });
        }
      });
    };
    if (data.children) {
      traverse(data.children);
    }
    return obstacles;
  }

  fitToView() {
    const bounds = this.g.node().getBBox();
    const parent = this.svg.node().parentElement;
    const fullWidth = parent.clientWidth;
    const fullHeight = parent.clientHeight;
    const width = bounds.width;
    const height = bounds.height;
    const midX = bounds.x + width / 2;
    const midY = bounds.y + height / 2;
    if (width === 0 || height === 0) {
      return;
    }
    const scale = 0.9 / Math.max(width / fullWidth, height / fullHeight);
    const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];
    this.svg.transition().duration(750).call(
      this.zoom.transform,
      d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
    );
  }

  zoomIn() {
    this.svg.transition().call(this.zoom.scaleBy, 1.3);
  }

  zoomOut() {
    this.svg.transition().call(this.zoom.scaleBy, 0.7);
  }

  resetZoom() {
    this.fitToView();
  }
}

export default HwSchematicRenderer;
