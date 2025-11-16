// AVFlowView3dApp
// ---------------
// Thin application shell that will, in later phases, orchestrate:
// - SchemaValidator (validation)
// - AVToELKConverter (data transformation)
// - CategoryStyler & PortDirectionResolver (styling & semantics)
// - d3-hwschematic + custom renderers (visualization)
// - FocusManager & SearchManager (interaction)

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
      <p>Project shell is ready. Next phases will add schema validation, data transformation, and visualization.</p>
    `;

    wrapper.appendChild(message);
    this.container.appendChild(wrapper);
  }

  /**
   * Public API placeholder.
   * In later phases this will validate and render the provided AV wiring graph.
   * @param {unknown} graphJson
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  load(graphJson) {
    throw new Error('AVFlowView3dApp.load is not implemented yet (Phase 2+).');
  }
}
