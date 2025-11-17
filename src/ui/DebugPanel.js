// DebugPanel.js
// ------------------
// Visual debugging panel for ELK routing diagnostics
// Provides real-time visualization of routing methods, edge metadata, and performance metrics

import * as d3 from 'd3';

export class DebugPanel {
  constructor(renderer, containerSelector = '#debug-panel-container') {
    this.renderer = renderer;
    this.containerSelector = containerSelector;
    this.isVisible = true;
    
    // Debug state
    this.debugState = {
      showELKHighlight: true,
      showBendPoints: false,
      showPortExtensions: false,
      showParallelEdges: false,
      showEdgeMetadata: false,
    };
    
    // Statistics
    this.stats = {
      elkEdges: 0,
      fallbackEdges: 0,
      totalEdges: 0,
      layoutTime: 0,
      renderTime: 0,
    };
    
    // Currently selected edge for inspection
    this.selectedEdge = null;
    this.currentData = null;
    
    this.initPanel();
  }

  initPanel() {
    // Check if container exists, if not create it
    let container = d3.select(this.containerSelector);
    
    if (container.empty()) {
      container = d3.select('body')
        .append('div')
        .attr('id', 'debug-panel-container')
        .attr('class', 'debug-panel');
    }
    
    // Build panel HTML
    container.html(`
      <div class="debug-panel-header">
        <h3>🔍 ELK Routing Diagnostics</h3>
        <button class="debug-toggle-btn" id="debug-collapse-btn">−</button>
      </div>
      
      <div class="debug-panel-content" id="debug-panel-content">
        <!-- Statistics Section -->
        <div class="debug-section">
          <h4>📊 Edge Statistics</h4>
          <div class="debug-stats">
            <div class="stat-item">
              <span class="stat-label">Total Edges:</span>
              <span class="stat-value" id="debug-total-edges">0</span>
            </div>
            <div class="stat-item elk-stat">
              <span class="stat-label">ELK Routed:</span>
              <span class="stat-value" id="debug-elk-edges">0</span>
            </div>
            <div class="stat-item fallback-stat">
              <span class="stat-label">Fallback:</span>
              <span class="stat-value" id="debug-fallback-edges">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Layout Time:</span>
              <span class="stat-value" id="debug-layout-time">0ms</span>
            </div>
          </div>
        </div>
        
        <!-- Visualization Controls -->
        <div class="debug-section">
          <h4>👁️ Visualizations</h4>
          <div class="debug-controls">
            <label class="debug-checkbox">
              <input type="checkbox" id="debug-elk-highlight" checked>
              <span class="checkbox-label">
                <span class="elk-indicator">■</span> ELK / 
                <span class="fallback-indicator">■</span> Fallback Highlight
              </span>
            </label>
            
            <label class="debug-checkbox">
              <input type="checkbox" id="debug-bend-points">
              <span class="checkbox-label">Show Bend Points</span>
            </label>
            
            <label class="debug-checkbox">
              <input type="checkbox" id="debug-port-extensions">
              <span class="checkbox-label">Show Port Extensions</span>
            </label>
            
            <label class="debug-checkbox">
              <input type="checkbox" id="debug-parallel-edges">
              <span class="checkbox-label">Highlight Parallel Edges</span>
            </label>
            
            <label class="debug-checkbox">
              <input type="checkbox" id="debug-edge-metadata">
              <span class="checkbox-label">Show Edge Labels</span>
            </label>
          </div>
        </div>
        
        <!-- Edge Inspector -->
        <div class="debug-section">
          <h4>🔎 Edge Inspector</h4>
          <div id="debug-edge-inspector" class="debug-inspector">
            <p class="inspector-hint">Click on an edge to inspect its routing data</p>
          </div>
        </div>
        
        <!-- Diagnostic Data Panel -->
        <div class="debug-section">
          <h4>📋 Diagnostic Data</h4>
          <div id="debug-diagnostic-data" class="debug-diagnostic">
            <p class="diagnostic-hint">Comprehensive debugging information will appear here</p>
          </div>
        </div>
        
        <!-- Export Tools -->
        <div class="debug-section">
          <h4>🛠️ Tools</h4>
          <button class="debug-btn" id="debug-export-elk">Export ELK Graph JSON</button>
          <button class="debug-btn" id="debug-export-stats">Export Statistics CSV</button>
          <button class="debug-btn" id="debug-clear-console">Clear Console Logs</button>
          <button class="debug-btn" id="debug-copy-diagnostics">Copy Diagnostic Data</button>
        </div>
      </div>
    `);
    
    this.attachEventHandlers();
  }

  attachEventHandlers() {
    // Collapse/expand toggle
    d3.select('#debug-collapse-btn').on('click', () => {
      const content = d3.select('#debug-panel-content');
      const btn = d3.select('#debug-collapse-btn');
      
      if (this.isVisible) {
        content.style('display', 'none');
        btn.text('+');
        this.isVisible = false;
      } else {
        content.style('display', 'block');
        btn.text('−');
        this.isVisible = true;
      }
    });
    
    // Visualization toggles
    d3.select('#debug-elk-highlight').on('change', (event) => {
      this.debugState.showELKHighlight = event.target.checked;
      this.updateVisualization();
    });
    
    d3.select('#debug-bend-points').on('change', (event) => {
      this.debugState.showBendPoints = event.target.checked;
      this.updateVisualization();
    });
    
    d3.select('#debug-port-extensions').on('change', (event) => {
      this.debugState.showPortExtensions = event.target.checked;
      this.updateVisualization();
    });
    
    d3.select('#debug-parallel-edges').on('change', (event) => {
      this.debugState.showParallelEdges = event.target.checked;
      this.updateVisualization();
    });
    
    d3.select('#debug-edge-metadata').on('change', (event) => {
      this.debugState.showEdgeMetadata = event.target.checked;
      this.updateVisualization();
    });
    
    // Export tools
    d3.select('#debug-export-elk').on('click', () => this.exportELKGraph());
    d3.select('#debug-export-stats').on('click', () => this.exportStatistics());
    d3.select('#debug-clear-console').on('click', () => console.clear()); // eslint-disable-line no-console
    d3.select('#debug-copy-diagnostics').on('click', () => this.copyDiagnostics());
  }

  /**
   * Update debug panel with new graph data
   * Called after each render to analyze routing results
   */
  update(data, layoutTime = 0) {
    this.currentData = data;
    this.stats.layoutTime = layoutTime;
    
    // Analyze edges
    this.analyzeEdges(data);
    
    // Update statistics display
    this.updateStatistics();
    
    // Update diagnostic data panel
    this.updateDiagnosticData(data);
    
    // Update visualizations if enabled
    this.updateVisualization();
  }

  /**
   * Analyze edges to determine routing method
   */
  analyzeEdges(data) {
    if (!data || !data.edges) {
      this.stats.totalEdges = 0;
      this.stats.elkEdges = 0;
      this.stats.fallbackEdges = 0;
      return;
    }
    
    let elkCount = 0;
    let fallbackCount = 0;
    
    data.edges.forEach(edge => {
      // ELK routing is present if edge has sections with startPoint/endPoint
      // bendPoints may be omitted for straight edges (valid ELK output)
      if (edge.sections && edge.sections.length > 0 && edge.sections[0].startPoint && edge.sections[0].endPoint) {
        elkCount++;
        edge._debugRoutingMethod = 'ELK';
      } else {
        fallbackCount++;
        edge._debugRoutingMethod = 'FALLBACK';
      }
    });
    
    this.stats.totalEdges = data.edges.length;
    this.stats.elkEdges = elkCount;
    this.stats.fallbackEdges = fallbackCount;
  }

  /**
   * Update statistics display in UI
   */
  updateStatistics() {
    d3.select('#debug-total-edges').text(this.stats.totalEdges);
    d3.select('#debug-elk-edges').text(this.stats.elkEdges);
    d3.select('#debug-fallback-edges').text(this.stats.fallbackEdges);
    d3.select('#debug-layout-time').text(`${this.stats.layoutTime.toFixed(2)}ms`);
  }

  /**
   * Update visual debugging overlays
   */
  updateVisualization() {
    if (!this.renderer || !this.renderer.g) {
      return;
    }
    
    // Remove existing debug overlays
    this.renderer.g.selectAll('.debug-overlay').remove();
    
    if (!this.currentData) {
      return;
    }
    
    // Restore labels and arrows when NOT highlighting
    if (!this.debugState.showELKHighlight) {
      this.renderer.g.selectAll('.edge-label').style('opacity', 1);
      this.renderer.g.selectAll('.edge-path')
        .attr('marker-end', 'url(#arrowhead)')
        .style('stroke', '#333')
        .style('stroke-width', 3);
    }
    
    // Create debug overlay group
    const debugGroup = this.renderer.g.append('g').attr('class', 'debug-overlay');
    
    // Apply visualizations based on state
    if (this.debugState.showELKHighlight) {
      this.highlightRoutingMethods(debugGroup);
    }
    
    if (this.debugState.showBendPoints) {
      this.visualizeBendPoints(debugGroup);
    }
    
    if (this.debugState.showPortExtensions) {
      this.visualizePortExtensions(debugGroup);
    }
    
    if (this.debugState.showParallelEdges) {
      this.highlightParallelEdges(debugGroup);
    }
    
    if (this.debugState.showEdgeMetadata) {
      this.showEdgeMetadata(debugGroup);
    }
  }

  /**
   * Highlight edges by routing method (ELK = green, Fallback = red)
   * Hides arrows and labels for cleaner path visualization
   */
  highlightRoutingMethods(group) {
    if (!this.currentData || !this.currentData.edges) {
      return;
    }
    
    // Hide edge labels and arrows for cleaner visualization
    this.renderer.g.selectAll('.edge-label').style('opacity', 0);
    
    // Update existing edge paths with highlight colors
    this.renderer.g.selectAll('.edge-path').each(function(d) {
      const edgePath = d3.select(this);
      
      // d is the bound edge data
      if (!d || !d.id) {
        edgePath.style('stroke', null);
        return;
      }
      
      // Remove arrow marker during debug highlighting
      edgePath.attr('marker-end', null);
      
      // Check routing method
      if (d._debugRoutingMethod === 'ELK') {
        edgePath
          .style('stroke', '#22c55e')  // Green for ELK
          .style('stroke-width', 4);
      } else if (d._debugRoutingMethod === 'FALLBACK') {
        edgePath
          .style('stroke', '#ef4444')  // Red for fallback
          .style('stroke-width', 4);
      } else {
        // Restore neutral if routing method not set
        edgePath
          .style('stroke', '#333')
          .style('stroke-width', 3);
      }
    });
  }

  /**
   * Visualize ELK bend points as circles
   */
  visualizeBendPoints(group) {
    if (!this.currentData || !this.currentData.edges) {
      return;
    }
    
    this.currentData.edges.forEach(edge => {
      if (edge.sections && edge.sections[0] && edge.sections[0].bendPoints) {
        const bendPoints = edge.sections[0].bendPoints;
        
        bendPoints.forEach((point, index) => {
          group.append('circle')
            .attr('cx', point.x)
            .attr('cy', point.y)
            .attr('r', 4)
            .attr('fill', '#3b82f6')
            .attr('stroke', '#1e40af')
            .attr('stroke-width', 1)
            .attr('class', 'debug-bend-point')
            .style('cursor', 'pointer')
            .append('title')
            .text(`Bend Point ${index + 1}\n(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`);
        });
      }
    });
  }

  /**
   * Visualize port extensions as yellow lines
   */
  visualizePortExtensions(group) {
    if (!this.currentData) {
      return;
    }
    
    // Find all ports and draw extension indicators
    const traverseNodes = (nodes, offset = { x: 0, y: 0 }) => {
      if (!nodes) {
        return;
      }
      
      nodes.forEach(node => {
        const absX = offset.x + (node.x || 0);
        const absY = offset.y + (node.y || 0);
        
        if (node.ports && node.ports.length > 0) {
          node.ports.forEach(port => {
            // Calculate port position (simplified - matches renderer logic)
            const portSide = port.properties?.['org.eclipse.elk.portSide'] || 'EAST';
            let px = absX, py = absY;
            
            // Simplified port position (center of side)
            switch (portSide) {
              case 'EAST':
                px = absX + (node.width || 140);
                py = absY + (node.height || 80) / 2;
                break;
              case 'WEST':
                px = absX;
                py = absY + (node.height || 80) / 2;
                break;
              case 'NORTH':
                px = absX + (node.width || 140) / 2;
                py = absY;
                break;
              case 'SOUTH':
                px = absX + (node.width || 140) / 2;
                py = absY + (node.height || 80);
                break;
            }
            
            // Calculate extension endpoint (30px default)
            const extLength = 30;
            let ex = px, ey = py;
            
            switch (portSide) {
              case 'EAST': ex = px + extLength; break;
              case 'WEST': ex = px - extLength; break;
              case 'NORTH': ey = py - extLength; break;
              case 'SOUTH': ey = py + extLength; break;
            }
            
            // Draw extension line
            group.append('line')
              .attr('x1', px)
              .attr('y1', py)
              .attr('x2', ex)
              .attr('y2', ey)
              .attr('stroke', '#fbbf24')
              .attr('stroke-width', 2)
              .attr('stroke-dasharray', '5,5')
              .attr('class', 'debug-port-extension');
          });
        }
        
        // Recurse into children
        if (node.children) {
          traverseNodes(node.children, { x: absX, y: absY });
        }
      });
    };
    
    if (this.currentData.children) {
      traverseNodes(this.currentData.children);
    }
  }

  /**
   * Highlight parallel edges (same source/target)
   */
  highlightParallelEdges(group) {
    if (!this.currentData || !this.currentData.edges) {
      return;
    }
    
    // Detect parallel edge groups
    const parallelGroups = new Map();
    
    this.currentData.edges.forEach(edge => {
      const key = `${edge.sources[0]}_${edge.targets[0]}`;
      if (!parallelGroups.has(key)) {
        parallelGroups.set(key, []);
      }
      parallelGroups.get(key).push(edge);
    });
    
    // Highlight groups with multiple edges
    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
    let colorIndex = 0;
    
    parallelGroups.forEach((edges, key) => {
      if (edges.length > 1) {
        const color = colors[colorIndex % colors.length];
        colorIndex++;
        
        // Highlight these edges
        edges.forEach(edge => {
          this.renderer.g.selectAll(`.edge-path[data-id="${edge.id}"]`)
            .style('stroke', color)
            .style('stroke-width', 5)
            .style('opacity', 0.8);
        });
      }
    });
  }

  /**
   * Show edge metadata as text labels
   */
  showEdgeMetadata(group) {
    if (!this.currentData || !this.currentData.edges) {
      return;
    }
    
    this.currentData.edges.forEach(edge => {
      const edgePath = this.renderer.g.select(`.edge-path[data-id="${edge.id}"]`);
      if (edgePath.empty()) {
        return;
      }
      
      // Get path data to find midpoint
      const pathData = edgePath.attr('d');
      if (!pathData) {
        return;
      }
      
      // Parse path to get approximate midpoint
      const points = this.parsePathPoints(pathData);
      if (points.length === 0) {
        return;
      }
      
      const midIndex = Math.floor(points.length / 2);
      const midPoint = points[midIndex];
      
      // Create metadata label
      const method = edge._debugRoutingMethod || 'UNKNOWN';
      const bendCount = edge.sections?.[0]?.bendPoints?.length || 0;
      
      group.append('text')
        .attr('x', midPoint.x)
        .attr('y', midPoint.y - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#000')
        .attr('class', 'debug-edge-label')
        .style('pointer-events', 'none')
        .text(`${edge.id} [${method}, ${bendCount} bends]`);
    });
  }

  /**
   * Parse SVG path data to extract points
   */
  parsePathPoints(pathData) {
    const points = [];
    const commands = pathData.match(/[ML]\s*([0-9.]+)\s+([0-9.]+)/g) || [];
    
    commands.forEach(cmd => {
      const match = cmd.match(/([0-9.]+)\s+([0-9.]+)/);
      if (match) {
        points.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
      }
    });
    
    return points;
  }

  /**
   * Export ELK graph as JSON
   */
  exportELKGraph() {
    if (!this.currentData) {
      // eslint-disable-next-line no-console
      console.warn('No graph data to export');
      return;
    }
    
    const json = JSON.stringify(this.currentData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elk-graph-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    // eslint-disable-next-line no-console
    console.log('✅ ELK graph exported');
  }

  /**
   * Export statistics as CSV
   */
  exportStatistics() {
    const csv = [
      'Metric,Value',
      `Total Edges,${this.stats.totalEdges}`,
      `ELK Routed,${this.stats.elkEdges}`,
      `Fallback,${this.stats.fallbackEdges}`,
      `Layout Time (ms),${this.stats.layoutTime.toFixed(2)}`,
      `ELK Coverage (%),${((this.stats.elkEdges / this.stats.totalEdges) * 100).toFixed(1)}`,
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elk-stats-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    // eslint-disable-next-line no-console
    console.log('✅ Statistics exported');
  }

  /**
   * Inspect specific edge (called when user clicks edge)
   */
  inspectEdge(edgeId) {
    if (!this.currentData || !this.currentData.edges) {
      return;
    }
    
    const edge = this.currentData.edges.find(e => e.id === edgeId);
    if (!edge) {
      return;
    }
    
    this.selectedEdge = edge;
    
    // Build inspection UI
    const method = edge._debugRoutingMethod || 'UNKNOWN';
    const bendCount = edge.sections?.[0]?.bendPoints?.length || 0;
    const hasStartPoint = !!edge.sections?.[0]?.startPoint;
    const hasEndPoint = !!edge.sections?.[0]?.endPoint;
    
    let html = `
      <div class="inspector-content">
        <h5>Edge: ${edge.id}</h5>
        <div class="inspector-field">
          <strong>Routing Method:</strong> <span class="routing-badge ${method.toLowerCase()}">${method}</span>
        </div>
        <div class="inspector-field">
          <strong>Source:</strong> ${edge.sources[0]}
        </div>
        <div class="inspector-field">
          <strong>Target:</strong> ${edge.targets[0]}
        </div>
        <div class="inspector-field">
          <strong>Bend Points:</strong> ${bendCount}
        </div>
        <div class="inspector-field">
          <strong>Has Start Point:</strong> ${hasStartPoint ? '✓' : '✗'}
        </div>
        <div class="inspector-field">
          <strong>Has End Point:</strong> ${hasEndPoint ? '✓' : '✗'}
        </div>
    `;
    
    // Add ELK routing coordinates
    if (edge.sections && edge.sections[0]) {
      const section = edge.sections[0];
      html += '<div class="inspector-field"><strong>ELK Routing:</strong><ul class="bend-list">';
      if (section.startPoint) {
        html += `<li>START: (${section.startPoint.x.toFixed(1)}, ${section.startPoint.y.toFixed(1)})</li>`;
      }
      if (bendCount > 0) {
        section.bendPoints.forEach((point, i) => {
          html += `<li>BEND ${i + 1}: (${point.x.toFixed(1)}, ${point.y.toFixed(1)})</li>`;
        });
      }
      if (section.endPoint) {
        html += `<li>END: (${section.endPoint.x.toFixed(1)}, ${section.endPoint.y.toFixed(1)})</li>`;
      }
      html += '</ul></div>';
    }
    
    // Add RENDERED path coordinates (from SVG)
    const edgePath = this.renderer.g.select(`.edge-path[data-id="${edge.id}"]`);
    if (!edgePath.empty()) {
      const pathData = edgePath.attr('d');
      if (pathData) {
        const pathPoints = this.parsePathPoints(pathData);
        if (pathPoints.length > 0) {
          html += '<div class="inspector-field"><strong>Rendered Path:</strong><ul class="bend-list">';
          pathPoints.forEach((point, i) => {
            html += `<li>Point ${i + 1}: (${point.x.toFixed(1)}, ${point.y.toFixed(1)})</li>`;
          });
          html += '</ul></div>';
        }
      }
    }
    
    html += '</div>';
    
    d3.select('#debug-edge-inspector').html(html);
  }

  /**
   * Update diagnostic data panel with comprehensive debugging information
   */
  updateDiagnosticData(data) {
    if (!data) {
      return;
    }
    
    let diagnosticText = '=== DIAGNOSTIC DATA ===\n\n';
    
    // 1. Graph Structure with Area Info
    diagnosticText += '--- GRAPH STRUCTURE ---\n';
    diagnosticText += `Children: ${data.children?.length || 0}\n`;
    diagnosticText += `Edges: ${data.edges?.length || 0}\n\n`;
    
    // 1.5 Area Information
    if (data.children && data.children.length > 0) {
      diagnosticText += '--- AREAS ---\n';
      data.children.forEach(child => {
        if (child.children && child.children.length > 0) {
          diagnosticText += `Area: ${child.id}\n`;
          diagnosticText += `  Position: (${child.x || 0}, ${child.y || 0})\n`;
          diagnosticText += `  Size: ${child.width} x ${child.height}\n`;
          diagnosticText += `  Children: ${child.children.length}\n`;
          child.children.forEach(device => {
            diagnosticText += `    - ${device.id} at (${device.x || 0}, ${device.y || 0})\n`;
          });
          diagnosticText += '\n';
        }
      });
    }
    
    // 2. Port Positions from ELK
    diagnosticText += '--- ELK PORT POSITIONS ---\n';
    const portInfo = this.extractPortPositions(data);
    portInfo.forEach(p => {
      diagnosticText += `${p.portId}:\n`;
      diagnosticText += `  Node: ${p.nodeId} at (${p.nodeX}, ${p.nodeY})\n`;
      diagnosticText += `  Port: (${p.portX}, ${p.portY}) on ${p.side}\n`;
      diagnosticText += `  Calculated Absolute: (${p.absX}, ${p.absY})\n\n`;
    });
    
    // 3. Edge Routing Data
    if (data.edges && data.edges.length > 0) {
      diagnosticText += '--- EDGE ROUTING ---\n';
      data.edges.forEach(edge => {
        const method = edge._debugRoutingMethod || 'UNKNOWN';
        diagnosticText += `${edge.id} [${method}]:\n`;
        diagnosticText += `  Source: ${edge.sources[0]}\n`;
        diagnosticText += `  Target: ${edge.targets[0]}\n`;
        
        if (edge.sections && edge.sections[0]) {
          const sec = edge.sections[0];
          diagnosticText += `  START: (${sec.startPoint?.x}, ${sec.startPoint?.y})\n`;
          if (sec.bendPoints && sec.bendPoints.length > 0) {
            sec.bendPoints.forEach((bp, i) => {
              diagnosticText += `  BEND${i+1}: (${bp.x}, ${bp.y})\n`;
            });
          }
          diagnosticText += `  END: (${sec.endPoint?.x}, ${sec.endPoint?.y})\n`;
        }
        diagnosticText += '\n';
      });
    }
    
    // 4. Coordinate Mismatches
    diagnosticText += '--- COORDINATE ANALYSIS ---\n';
    if (data.edges && data.edges.length > 0 && portInfo.length > 0) {
      data.edges.forEach(edge => {
        if (edge.sections && edge.sections[0]) {
          const srcPortId = edge.sources[0];
          const srcPort = portInfo.find(p => p.portId === srcPortId);
          if (srcPort && edge.sections[0].startPoint) {
            const deltaX = Math.abs(srcPort.absX - edge.sections[0].startPoint.x);
            const deltaY = Math.abs(srcPort.absY - edge.sections[0].startPoint.y);
            if (deltaX > 1 || deltaY > 1) {
              diagnosticText += `⚠️ MISMATCH ${edge.id}:\n`;
              diagnosticText += `  Port at: (${srcPort.absX}, ${srcPort.absY})\n`;
              diagnosticText += `  Routing from: (${edge.sections[0].startPoint.x}, ${edge.sections[0].startPoint.y})\n`;
              diagnosticText += `  Delta: (${deltaX.toFixed(1)}, ${deltaY.toFixed(1)})\n\n`;
            }
          }
        }
      });
    }
    
    d3.select('#debug-diagnostic-data').html(`<pre class="diagnostic-pre">${diagnosticText}</pre>`);
  }
  
  /**
   * Extract port positions from graph data
   */
  extractPortPositions(data) {
    const ports = [];
    const traverse = (nodes, offset = {x: 0, y: 0}) => {
      nodes.forEach(node => {
        const hasChildren = node.children && node.children.length > 0;
        // CRITICAL: Match findPortAbsolutePosition logic - areas don't add offset
        const nodeX = hasChildren ? (node.x || 0) : offset.x + (node.x || 0);
        const nodeY = hasChildren ? (node.y || 0) : offset.y + (node.y || 0);
        
        if (node.ports && node.ports.length > 0) {
          node.ports.forEach(port => {
            ports.push({
              nodeId: node.id,
              portId: port.id,
              nodeX: node.x || 0,
              nodeY: node.y || 0,
              portX: port.x || 0,
              portY: port.y || 0,
              absX: nodeX + (port.x || 0),
              absY: nodeY + (port.y || 0),
              side: port.properties?.['org.eclipse.elk.portSide']
            });
          });
        }
        
        if (node.children) {
          traverse(node.children, {x: nodeX, y: nodeY});
        }
      });
    };
    if (data.children) {
      traverse(data.children);
    }
    return ports;
  }
  
  /**
   * Copy diagnostic data to clipboard
   */
  copyDiagnostics() {
    const text = d3.select('#debug-diagnostic-data pre').text();
    navigator.clipboard.writeText(text).then(() => {
      // eslint-disable-next-line no-console
      console.log('✅ Diagnostic data copied to clipboard');
    });
  }

  /**
   * Hide debug panel (for production)
   */
  hide() {
    d3.select(this.containerSelector).style('display', 'none');
  }

  /**
   * Show debug panel
   */
  show() {
    d3.select(this.containerSelector).style('display', 'block');
  }
}

export default DebugPanel;
