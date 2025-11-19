// src/ui/TopBar.js
import * as d3 from 'd3';

export class TopBar {
  constructor(container, callbacks) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    this.callbacks = callbacks || {};
    this.examples = [];
    this.debugState = {
      showELKHighlight: true,
      showBendPoints: false,
      showPortExtensions: false,
      showParallelEdges: false,
      showEdgeMetadata: false,
    };
    this.activeMenu = null;
    this.render();
    this.attachEventListeners();
  }

  render() {
    const topBar = document.createElement('div');
    topBar.className = 'topbar';
    topBar.innerHTML = `
      <div class="topbar-content">
        <div class="topbar-left">
          <div class="topbar-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
              <line x1="10" y1="6.5" x2="14" y2="6.5"/>
              <line x1="10" y1="17.5" x2="14" y2="17.5"/>
              <line x1="6.5" y1="10" x2="6.5" y2="14"/>
              <line x1="17.5" y1="10" x2="17.5" y2="14"/>
            </svg>
            <span class="topbar-title">AVFlowView-3d</span>
          </div>
        </div>
        <div class="topbar-center">
          <nav class="topbar-nav">
            <!-- ...unchanged menu code... -->
          </nav>
        </div>
        <div class="topbar-right">
          <button class="topbar-icon-btn" id="debug-panel-toggle" title="Toggle Debug Panel">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="topbar-stats" id="topbar-stats" style="display:none;">
        <div class="stat-item">
          <span class="stat-label">Edges:</span>
          <span class="stat-value" id="stat-total-edges">0</span>
        </div>
        <div class="stat-item">
          <span class="stat-label elk-label">ELK:</span>
          <span class="stat-value" id="stat-elk-edges">0</span>
        </div>
        <div class="stat-item">
          <span class="stat-label fallback-label">Fallback:</span>
          <span class="stat-value" id="stat-fallback-edges">0</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Layout:</span>
          <span class="stat-value" id="stat-layout-time">0ms</span>
        </div>
      </div>
    `;
    this.topBar = topBar;
    this.container.appendChild(topBar);
  }

  attachEventListeners() {
    // ...existing handlers...
    d3.select('#debug-panel-toggle').on('click', () => {
      if (this.callbacks.onToggleDebugPanel) {
        this.callbacks.onToggleDebugPanel();
      }
    });
  }

  updateStats(stats) {
    d3.select('#stat-total-edges').text(stats.totalEdges || 0);
    d3.select('#stat-elk-edges').text(stats.elkEdges || 0);
    d3.select('#stat-fallback-edges').text(stats.fallbackEdges || 0);
    d3.select('#stat-layout-time').text(`${(stats.layoutTime || 0).toFixed(1)}ms`);
    // show stats
    const bar = this.topBar.querySelector('#topbar-stats');
    if (bar) bar.style.display = 'flex';
  }
}
