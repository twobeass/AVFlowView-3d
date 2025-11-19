import ELK from 'elkjs';

import { AVToELKConverter } from './converters/index.js';
import HwSchematicRenderer from './renderers/HwSchematicRenderer.js';
import { TopBar } from './ui/TopBar.js';
import { DebugPanel } from './ui/DebugPanel.js';
import { ExampleLoader } from './utils/ExampleLoader.js';
import { SchemaValidator } from './validation/index.js';

export class AVFlowView3dApp {
  /**
   * @param {HTMLElement | string} container - DOM element or selector.
   * @param {object} [options] - Configuration options.
   */
  constructor(container, options = {}) {
    this.container =
      typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!this.container) {
      throw new Error('AVFlowView3dApp: container not found');
    }

    this.options = {
      debug: false,
      enableDebugPanel: true,
      ...options,
    };

    this.schemaValidator = new SchemaValidator();
    this.converter = new AVToELKConverter();
    this.exampleLoader = new ExampleLoader('/examples/');
    this.elk = new ELK();
    this.currentGraph = null;
    this.currentLayoutDirection = 'LR';
    this.layoutTime = 0;
    this.debugPanelVisible = false; 

    this._initializeUI();
    this._initializeRenderer();
    this._initializeTopBar();
    this._initializeDebugPanel();
  }

  /**
   * Initialize the container structure
   * @private
   */
  _initializeUI() {
    this.container.innerHTML = '';
    this.container.style.width = '100%';
    this.container.style.height = '100vh';
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
  }

  /**
   * Initialize the HwSchematicRenderer
   * @private
   */
  _initializeRenderer() {
    const renderContainer = document.createElement('div');
    renderContainer.id = 'render-container';
    renderContainer.style.width = '100%';
    renderContainer.style.height = '100%';
    this.container.appendChild(renderContainer);

    this.renderer = new HwSchematicRenderer('#render-container');
  }

  /**
   * Initialize the TopBar with all controls
   * @private
   */
  async _initializeTopBar() {
    this.topBar = new TopBar(document.body, {
      onZoomIn: () => this.zoomIn(),
      onZoomOut: () => this.zoomOut(),
      onReset: () => this.resetView(),
      onLayoutChange: (direction) => this.changeLayout(direction),
      onExampleLoad: (exampleName) => this.loadExample(exampleName),
      onDebugStateChange: (state) => this.handleDebugStateChange(state),
      onExportELK: () => this.exportELKGraph(),
      onExportStats: () => this.exportStatistics(),
    });

    // Load available examples
    try {
      const examples = await this.exampleLoader.listExamples();
      this.topBar.setAvailableExamples(examples);
    } catch (error) {
      if (this.options.debug) {
        // eslint-disable-next-line no-console
        console.error('Failed to list examples:', error);
      }
    }
  }

  /**
   * Initialize the debug panel for ELK routing diagnostics
   * @private
   */
  _initializeDebugPanel() {
    if (!this.options.enableDebugPanel) {
      return;
    }

    // Create debug panel container
    const debugContainer = document.createElement('div');
    debugContainer.id = 'debug-panel-container';
    document.body.appendChild(debugContainer);

    this.debugPanel = new DebugPanel(this.renderer, '#debug-panel-container');
    window.debugPanel = this.debugPanel;
    
    // Panel is visible by default (isVisible = false in constructor of DebugPanel)
    // No explicit hide() needed here, DebugPanel controls its own initial visibility.
    this.debugPanelVisible = false; 
    
    // Initialize debug panel with TopBar's current debug state
    if (this.topBar) {
      this.debugPanel.updateDebugState(this.topBar.debugState);
    }
  }

  /**
   * Handle debug state changes from TopBar
   * @private
   */
  handleDebugStateChange(state) {
    if (this.debugPanel) {
      this.debugPanel.updateDebugState(state);
    }
  }

  /**
   * Export ELK graph JSON
   */
  exportELKGraph() {
    if (this.debugPanel) {
      this.debugPanel.exportELKGraph();
    }
  }

  /**
   * Export statistics CSV
   */
  exportStatistics() {
    if (this.debugPanel) {
      this.debugPanel.exportStatistics();
    }
  }

  async load(graphJson) {
    const validation = this.schemaValidator.validateGraph(graphJson);
    if (!validation.success) {
      if (this.options.debug) {
        // eslint-disable-next-line no-console
        console.error('Validation failed', validation.error);
      }
      return validation;
    }

    this.currentGraph = graphJson;
    const elkGraph = this.converter.convert(graphJson);

    // PERFORMANCE PATCH: Overwrite ELK options if node count is high
    const nodeCount = (function countNodes(node) {
      let count = 0;
      function traverse(n) {
        if (n.children) {
          count += n.children.length;
          n.children.forEach(traverse);
        }
      }
      traverse(node);
      return count;
    })(elkGraph);

    if (nodeCount > 100) {
      // eslint-disable-next-line no-console
      console.warn(
        `⚠️ Large graph detected (${nodeCount} nodes) - applying fast ELK layout options.`
      );
      elkGraph.layoutOptions['org.eclipse.elk.layered.nodePlacement.strategy'] =
        'SIMPLE';
      elkGraph.layoutOptions[
        'org.eclipse.elk.layered.crossingMinimization.strategy'
      ] = 'INTERACTIVE';
      elkGraph.layoutOptions['org.eclipse.elk.spacing.nodeNode'] = 150;
      elkGraph.layoutOptions['org.eclipse.elk.spacing.edgeNode'] = 60;
    }

    try {
      const layoutStart = performance.now();
      const laidOutGraph = await this.elk.layout(elkGraph);
      this.layoutTime = performance.now() - layoutStart;

      if (this.options.debug) {
        // eslint-disable-next-line no-console
        console.log('Layout complete', laidOutGraph);
        // eslint-disable-next-line no-console
        console.log(`⚡ Layout time: ${this.layoutTime.toFixed(2)}ms`);
        // eslint-disable-next-line no-console
        console.log(
          '🔍 ELK Port Positions:',
          this.extractPortInfo(laidOutGraph)
        );
      }

      // Render the graph
      this.renderer.render(laidOutGraph);

      // Update debug panel and stats
      if (this.debugPanel) {
        this.debugPanel.update(laidOutGraph, this.layoutTime);
        
        // Update TopBar stats
        if (this.topBar) {
          this.topBar.updateStats({
            totalEdges: this.debugPanel.stats.totalEdges,
            elkEdges: this.debugPanel.stats.elkEdges,
            fallbackEdges: this.debugPanel.stats.fallbackEdges,
            layoutTime: this.layoutTime,
          });
        }
      }

      return {
        success: true,
        elkGraph: laidOutGraph,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Layout failed:', error);
      return {
        success: false,
        error: {
          code: 'LAYOUT_ERROR',
          message: error.message,
          details: [],
        },
      };
    }
  }

  async loadExample(exampleName) {
    try {
      const graphData = await this.exampleLoader.loadExample(exampleName);
      const result = await this.load(graphData);
      if (!result.success) {
        // eslint-disable-next-line no-console
        console.error(`Failed to load example ${exampleName}:`, result.error);
      }
      return result;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error loading example ${exampleName}:`, error);
      return {
        success: false,
        error: {
          code: 'LOAD_ERROR',
          message: error.message,
          details: [],
        },
      };
    }
  }

  async changeLayout(direction) {
    if (!this.currentGraph) {
      return;
    }
    this.currentLayoutDirection = direction;
    this.currentGraph.layout.direction = direction;
    return this.load(this.currentGraph);
  }

  zoomIn() {
    if (this.renderer && this.renderer.zoomIn) {
      this.renderer.zoomIn();
    }
  }

  zoomOut() {
    if (this.renderer && this.renderer.zoomOut) {
      this.renderer.zoomOut();
    }
  }

  resetView() {
    if (this.renderer && typeof this.renderer.resetZoom === 'function') {
      this.renderer.resetZoom();
    }
  }

  extractPortInfo(data) {
    const portInfo = [];
    const traverse = (nodes) => {
      nodes.forEach((node) => {
        if (node.ports && node.ports.length > 0) {
          node.ports.forEach((port) => {
            portInfo.push({
              nodeId: node.id,
              portId: port.id,
              x: port.x,
              y: port.y,
              side: port.properties?.['org.eclipse.elk.portSide'],
            });
          });
        }
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    if (data.children) {
      traverse(data.children);
    }
    return portInfo;
  }

  toggleDebugPanel() {
    if (this.debugPanel) {
      this.debugPanelVisible = !this.debugPanelVisible;
      if (this.debugPanelVisible) {
        this.debugPanel.show();
      } else {
        this.debugPanel.hide();
      }
    }
  }

  destroy() {
    if (this.topBar) {
      this.topBar.destroy();
    }
    if (this.debugPanel) {
      const debugContainer = document.getElementById('debug-panel-container');
      if (debugContainer) {
        debugContainer.remove();
      }
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
