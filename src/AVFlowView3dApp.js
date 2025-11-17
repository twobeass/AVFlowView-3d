import ELK from 'elkjs';

import { AVToELKConverter } from './converters/index.js';
import { SchemaValidator } from './validation/index.js';
import { ControlsPanel } from './ui/ControlsPanel.js';
import { DebugPanel } from './ui/DebugPanel.js';
import { ExampleLoader } from './utils/ExampleLoader.js';
import HwSchematicRenderer from './renderers/HwSchematicRenderer.js';

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

  // ... rest identisch (keine Änderung nötig)
}
