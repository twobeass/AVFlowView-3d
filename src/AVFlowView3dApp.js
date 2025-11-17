// AVFlowView3dApp
// ---------------
// Application shell that orchestrates:
// - SchemaValidator (validation)
// - AVToELKConverter (data transformation)
// - CategoryStyler & PortDirectionResolver (styling & semantics)
// - HwSchematicRenderer + ELK (visualization & layout)
// - ControlsPanel (UI controls)
// - FocusManager & SearchManager (interaction - Phase 6)

import { AVToELKConverter } from './converters/index.js';
import { SchemaValidator } from './validation/index.js';
import { ControlsPanel } from './ui/ControlsPanel.js';
import { DebugPanel } from './ui/DebugPanel.js';
import { ExampleLoader } from './utils/ExampleLoader.js';
import HwSchematicRenderer from './renderers/HwSchematicRenderer.js';
import ELK from 'elkjs';

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
      enableDebugPanel: true, // NEW: Enable debug panel by default (can be disabled for production)
      ...options,
    };

    this.schemaValidator = new SchemaValidator();
    this.converter = new AVToELKConverter();
    this.exampleLoader = new ExampleLoader('/examples/');
    this.elk = new ELK();
    this.currentGraph = null;
    this.currentLayoutDirection = 'LR';
    this.layoutTime = 0; // Track layout time for debug panel

    this._initializeUI();
    this._initializeRenderer();
    this._initializeDebugPanel();
    this._initializeControls();
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
   * Initialize the debug panel for ELK routing diagnostics
   * @private
   */
  _initializeDebugPanel() {
    if (!this.options.enableDebugPanel) {
      return;
    }

    this.debugPanel = new DebugPanel(this.renderer);
    
    // Make debug panel globally accessible for edge click handlers
    window.debugPanel = this.debugPanel;
    
    // Hide in production if debug is false
    if (!this.options.debug && !this.options.enableDebugPanel) {
      this.debugPanel.hide();
    }
  }

  /**
   * Initialize the controls panel with callbacks
   * @private
   */
  async _initializeControls() {
    this.controlsPanel = new ControlsPanel(this.container, {
      onZoomIn: () => this.zoomIn(),
      onZoomOut: () => this.zoomOut(),
      onReset: () => this.resetView(),
      onLayoutChange: (direction) => this.changeLayout(direction),
      onExampleLoad: (exampleName) => this.loadExample(exampleName),
    });

    // Populate available examples
    try {
      const examples = await this.exampleLoader.listExamples();
      this.controlsPanel.setAvailableExamples(examples);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to list examples:', error);
    }
  }

  /**
   * Validate, convert, layout, and render the provided AV wiring graph.
   *
   * @param {unknown} graphJson
   * @returns {Promise<{ success: true; elkGraph: object } | { success: false; error: { code: string; message: string; details: Array<{ path: string; message?: string; keyword: string; params: Record<string, unknown> }> } }>}
   */
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

    try {
      // Measure layout time for debug panel
      const layoutStart = performance.now();
      const laidOutGraph = await this.elk.layout(elkGraph);
      this.layoutTime = performance.now() - layoutStart;

      if (this.options.debug) {
        // eslint-disable-next-line no-console
        console.log('Layout complete', laidOutGraph);
        // eslint-disable-next-line no-console
        console.log(`⚡ Layout time: ${this.layoutTime.toFixed(2)}ms`);
        
        // DEBUG: Log port positions from ELK
        // eslint-disable-next-line no-console
        console.log('🔍 ELK Port Positions:', this.extractPortInfo(laidOutGraph));
      }

      this.renderer.render(laidOutGraph);

      // Update debug panel with layout results
      if (this.debugPanel) {
        this.debugPanel.update(laidOutGraph, this.layoutTime);
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

  /**
   * Load an example graph by name
   * @param {string} exampleName - Name of the example file
   * @returns {Promise<object>} Result of load operation
   */
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

  /**
   * Change the layout direction and re-render
   * @param {string} direction - Layout direction ('LR' or 'TB')
   */
  async changeLayout(direction) {
    if (!this.currentGraph) return;

    this.currentLayoutDirection = direction;
    this.currentGraph.layout.direction = direction;

    await this.load(this.currentGraph);
  }

  /**
   * Zoom in on the visualization
   */
  zoomIn() {
    if (this.renderer && this.renderer.zoomIn) {
      this.renderer.zoomIn();
    }
  }

  /**
   * Zoom out on the visualization
   */
  zoomOut() {
    if (this.renderer && this.renderer.zoomOut) {
      this.renderer.zoomOut();
    }
  }

  /**
   * Reset the view to default zoom and position
   */
  resetView() {
    if (this.renderer && this.renderer.resetZoom) {
      this.renderer.resetZoom();
    }
  }

  /**
   * Extract port information for debugging
   * @private
   */
  extractPortInfo(data) {
    const portInfo = [];
    const traverse = (nodes) => {
      nodes.forEach(node => {
        if (node.ports && node.ports.length > 0) {
          node.ports.forEach(port => {
            portInfo.push({
              nodeId: node.id,
              portId: port.id,
              x: port.x,
              y: port.y,
              side: port.properties?.['org.eclipse.elk.portSide']
            });
          });
        }
        if (node.children) traverse(node.children);
      });
    };
    if (data.children) traverse(data.children);
    return portInfo;
  }

  /**
   * Toggle debug panel visibility
   */
  toggleDebugPanel() {
    if (this.debugPanel) {
      if (this.debugPanel.isVisible) {
        this.debugPanel.hide();
      } else {
        this.debugPanel.show();
      }
    }
  }

  /**
   * Clean up resources and event listeners
   */
  destroy() {
    if (this.controlsPanel) {
      this.controlsPanel.destroy();
    }
    if (this.debugPanel) {
      this.debugPanel.hide();
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
