// src/ui/DebugPanel.js
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

  // ... rest unchanged ...
}

export default DebugPanel;
