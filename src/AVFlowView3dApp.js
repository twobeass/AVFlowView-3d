// AVFlowView3dApp
// ---------------
// Thin application shell that will orchestrate:
// - SchemaValidator (validation)
// - AVToELKConverter (data transformation)
// - CategoryStyler & PortDirectionResolver (styling & semantics)
// - d3-hwschematic + custom renderers (visualization)
// - FocusManager & SearchManager (interaction)

import { AVToELKConverter } from './converters/index.js';
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
      ...options,
    };

    this.schemaValidator = new SchemaValidator();
    this.converter = new AVToELKConverter();

    if (this.options.debug) {
      // eslint-disable-next-line no-console
      console.log('AVFlowView3dApp initialized', this.options);
    }

    this._renderPlaceholder();
  }

  /**
   * Placeholder render method for Phase 1.
   * Later phases replace this with full validation → transform → render pipeline.
   * @private
   */
  _renderPlaceholder() {
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.height = '100vh';
    wrapper.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';

    const message = document.createElement('div');
    message.innerHTML = `
      <h1>AVFlowView-3d</h1>
      <p>Project shell is ready. Validation and data transformation are wired; visualization will follow in next phases.</p>
    `;

    wrapper.appendChild(message);
    this.container.appendChild(wrapper);
  }

  /**
   * Validate and convert the provided AV wiring graph.
   * Rendering will be added in later phases.
   *
   * @param {unknown} graphJson
   * @returns {{ success: true; elkGraph: object } | { success: false; error: { code: string; message: string; details: Array<{ path: string; message?: string; keyword: string; params: Record<string, unknown> }> } }}
   */
  load(graphJson) {
    const validation = this.schemaValidator.validateGraph(graphJson);

    if (!validation.success) {
      if (this.options.debug) {
        // eslint-disable-next-line no-console
        console.error('AVFlowView3dApp.load validation failed', validation.error);
      }

      return validation;
    }

    const elkGraph = this.converter.convert(graphJson);

    if (this.options.debug) {
      // eslint-disable-next-line no-console
      console.log('AVFlowView3dApp.load validation and conversion succeeded', {
        elkGraph,
      });
    }

    return {
      success: true,
      elkGraph,
    };
  }
}
