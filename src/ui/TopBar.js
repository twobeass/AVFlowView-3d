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
            <div class="topbar-menu-item" data-menu="view">
              <button class="topbar-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 5v2m0 10v2m7-7h-2M5 12H3m15.364 6.364l-1.414-1.414M6.05 6.05L4.636 4.636m12.728 0l-1.414 1.414M6.05 17.95l-1.414 1.414"/>
                </svg>
                View
              </button>
              <div class="topbar-dropdown">
                <div class="dropdown-section">
                  <div class="dropdown-label">Zoom</div>
                  <div class="dropdown-buttons">
                    <button id="zoom-in-btn" class="dropdown-btn" title="Zoom In">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35M11 8v6m-3-3h6"/>
                      </svg>
                      Zoom In
                    </button>
                    <button id="zoom-out-btn" class="dropdown-btn" title="Zoom Out">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35M8 11h6"/>
                      </svg>
                      Zoom Out
                    </button>
                    <button id="zoom-reset-btn" class="dropdown-btn" title="Reset View">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                        <path d="M21 3v5h-5"/>
                      </svg>
                      Reset
                    </button>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-section">
                  <div class="dropdown-label">Layout Direction</div>
                  <select id="layout-direction-select" class="dropdown-select">
                    <option value="LR">Left to Right</option>
                    <option value="TB">Top to Bottom</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="topbar-menu-item" data-menu="examples">
              <button class="topbar-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13 2 13 9 20 9"/>
                </svg>
                Examples
              </button>
              <div class="topbar-dropdown">
                <div class="dropdown-section">
                  <div class="dropdown-label">Load Example Graph</div>
                  <select id="example-selector" class="dropdown-select">
                    <option value="">Select example...</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="topbar-menu-item" data-menu="debug">
              <button class="topbar-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M12 8v4m0 4h.01"/>
                </svg>
                Debug
              </button>
              <div class="topbar-dropdown topbar-dropdown-wide">
                <div class="dropdown-section">
                  <div class="dropdown-label">Visualizations</div>
                  <label class="dropdown-checkbox">
                    <input type="checkbox" id="debug-elk-highlight" checked>
                    <span>
                      <span class="indicator elk-indicator">■</span> ELK / 
                      <span class="indicator fallback-indicator">■</span> Fallback Highlight
                    </span>
                  </label>
                  <label class="dropdown-checkbox">
                    <input type="checkbox" id="debug-bend-points">
                    <span>Show Bend Points</span>
                  </label>
                  <label class="dropdown-checkbox">
                    <input type="checkbox" id="debug-port-extensions">
                    <span>Show Port Extensions</span>
                  </label>
                  <label class="dropdown-checkbox">
                    <input type="checkbox" id="debug-parallel-edges">
                    <span>Highlight Parallel Edges</span>
                  </label>
                  <label class="dropdown-checkbox">
                    <input type="checkbox" id="debug-edge-metadata">
                    <span>Show Edge Labels</span>
                  </label>
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-section">
                  <div class="dropdown-label">Tools</div>
                  <button id="debug-export-elk" class="dropdown-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5l5 5 5-5m-5 5V3"/>
                    </svg>
                    Export ELK Graph
                  </button>
                  <button id="debug-export-stats" class="dropdown-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5l5 5 5-5m-5 5V3"/>
                    </svg>
                    Export Statistics
                  </button>
                </div>
              </div>
            </div>
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

      <!-- Stats Bar -->
      <div class="topbar-stats" id="topbar-stats" style="display: none;">
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
    // Menu toggle handlers
    const menuItems = this.topBar.querySelectorAll('.topbar-menu-item');
    menuItems.forEach(item => {
      const btn = item.querySelector('.topbar-btn');
      const dropdown = item.querySelector('.topbar-dropdown');
      
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menuName = item.dataset.menu;
        
        if (this.activeMenu === menuName) {
          this.closeAllMenus();
        } else {
          this.closeAllMenus();
          dropdown.classList.add('active');
          this.activeMenu = menuName;
        }
      });
    });

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.topbar-menu-item')) {
        this.closeAllMenus();
      }
    });

    // Zoom controls
    d3.select('#zoom-in-btn').on('click', () => {
      if (this.callbacks.onZoomIn) this.callbacks.onZoomIn();
      this.closeAllMenus();
    });

    d3.select('#zoom-out-btn').on('click', () => {
      if (this.callbacks.onZoomOut) this.callbacks.onZoomOut();
      this.closeAllMenus();
    });

    d3.select('#zoom-reset-btn').on('click', () => {
      if (this.callbacks.onReset) this.callbacks.onReset();
      this.closeAllMenus();
    });

    // Layout direction
    d3.select('#layout-direction-select').on('change', (event) => {
      if (this.callbacks.onLayoutChange) {
        this.callbacks.onLayoutChange(event.target.value);
      }
    });

    // Example selector
    d3.select('#example-selector').on('change', (event) => {
      const val = event.target.value;
      if (val && this.callbacks.onExampleLoad) {
        this.callbacks.onExampleLoad(val);
      }
    });

    // Debug controls
    d3.select('#debug-elk-highlight').on('change', (event) => {
      this.debugState.showELKHighlight = event.target.checked;
      if (this.callbacks.onDebugStateChange) {
        this.callbacks.onDebugStateChange(this.debugState);
      }
    });

    d3.select('#debug-bend-points').on('change', (event) => {
      this.debugState.showBendPoints = event.target.checked;
      if (this.callbacks.onDebugStateChange) {
        this.callbacks.onDebugStateChange(this.debugState);
      }
    });

    d3.select('#debug-port-extensions').on('change', (event) => {
      this.debugState.showPortExtensions = event.target.checked;
      if (this.callbacks.onDebugStateChange) {
        this.callbacks.onDebugStateChange(this.debugState);
      }
    });

    d3.select('#debug-parallel-edges').on('change', (event) => {
      this.debugState.showParallelEdges = event.target.checked;
      if (this.callbacks.onDebugStateChange) {
        this.callbacks.onDebugStateChange(this.debugState);
      }
    });

    d3.select('#debug-edge-metadata').on('change', (event) => {
      this.debugState.showEdgeMetadata = event.target.checked;
      if (this.callbacks.onDebugStateChange) {
        this.callbacks.onDebugStateChange(this.debugState);
      }
    });

    // Debug export tools
    d3.select('#debug-export-elk').on('click', () => {
      if (this.callbacks.onExportELK) this.callbacks.onExportELK();
      this.closeAllMenus();
    });

    d3.select('#debug-export-stats').on('click', () => {
      if (this.callbacks.onExportStats) this.callbacks.onExportStats();
      this.closeAllMenus();
    });

    // Debug panel toggle
    const toggleBtn = this.topBar.querySelector('#debug-panel-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.toggleStatsBar();
      });
    }
  }

  toggleStatsBar() {
    const statsBar = this.topBar.querySelector('#topbar-stats');
    if (statsBar) {
      const isVisible = statsBar.style.display !== 'none';
      statsBar.style.display = isVisible ? 'none' : 'flex';
    }
  }

  closeAllMenus() {
    const dropdowns = this.topBar.querySelectorAll('.topbar-dropdown');
    dropdowns.forEach(dd => dd.classList.remove('active'));
    this.activeMenu = null;
  }

  setAvailableExamples(examples) {
    this.examples = examples;
    const selector = this.topBar.querySelector('#example-selector');
    if (!selector) return;
    
    selector.innerHTML = '<option value="">Select example...</option>';
    examples.forEach(example => {
      const option = document.createElement('option');
      option.value = example;
      option.textContent = example;
      selector.appendChild(option);
    });
  }

  updateStats(stats) {
    d3.select('#stat-total-edges').text(stats.totalEdges || 0);
    d3.select('#stat-elk-edges').text(stats.elkEdges || 0);
    d3.select('#stat-fallback-edges').text(stats.fallbackEdges || 0);
    d3.select('#stat-layout-time').text(`${(stats.layoutTime || 0).toFixed(1)}ms`);
  }

  destroy() {
    if (this.topBar && this.container.contains(this.topBar)) {
      this.container.removeChild(this.topBar);
    }
  }
}
