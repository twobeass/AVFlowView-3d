// src/ui/ControlsPanel.js
export class ControlsPanel {
  constructor(container, callbacks) {
    this.container =
      typeof container === 'string'
        ? document.querySelector(container)
        : container;
    this.callbacks = callbacks || {};
    this.render();
    this.attachEventListeners();
    this.examples = [];
  }

  render() {
    const panel = document.createElement('div');
    panel.className = 'controls-panel';
    panel.innerHTML = `
      <div class="controls-section">
        <h3>Zoom</h3>
        <button id="zoom-in" title="Zoom In" aria-label="Zoom In">+</button>
        <button id="zoom-out" title="Zoom Out" aria-label="Zoom Out">-</button>
        <button id="zoom-reset" title="Reset View" aria-label="Reset View">Reset</button>
      </div>
      <div class="controls-section">
        <h3>Layout Direction</h3>
        <select id="layout-direction" aria-label="Layout Direction">
          <option value="LR">Left to Right</option>
          <option value="TB">Top to Bottom</option>
        </select>
      </div>
      <div class="controls-section">
        <h3>Examples</h3>
        <select id="example-selector" aria-label="Example Graph Selector">
          <option value="">Select example...</option>
        </select>
      </div>
    `;
    this.panel = panel;
    this.container.appendChild(panel);
  }

  attachEventListeners() {
    this._zoomInBtn = this.panel.querySelector('#zoom-in');
    this._zoomOutBtn = this.panel.querySelector('#zoom-out');
    this._zoomResetBtn = this.panel.querySelector('#zoom-reset');
    this._layoutSelect = this.panel.querySelector('#layout-direction');
    this._exampleSelector = this.panel.querySelector('#example-selector');

    this._zoomInHandler = () => {
      if (this.callbacks.onZoomIn) {
        this.callbacks.onZoomIn();
      }
    };
    this._zoomOutHandler = () => {
      if (this.callbacks.onZoomOut) {
        this.callbacks.onZoomOut();
      }
    };
    this._zoomResetHandler = () => {
      if (this.callbacks.onReset) {
        this.callbacks.onReset();
      }
    };
    this._layoutChangeHandler = (e) => {
      if (this.callbacks.onLayoutChange) {
        this.callbacks.onLayoutChange(e.target.value);
      }
    };
    this._exampleChangeHandler = (e) => {
      if (this.callbacks.onExampleLoad) {
        const val = e.target.value;
        if (val) {
          this.callbacks.onExampleLoad(val);
        }
      }
    };

    this._zoomInBtn.addEventListener('click', this._zoomInHandler);
    this._zoomOutBtn.addEventListener('click', this._zoomOutHandler);
    this._zoomResetBtn.addEventListener('click', this._zoomResetHandler);
    this._layoutSelect.addEventListener('change', this._layoutChangeHandler);
    this._exampleSelector.addEventListener(
      'change',
      this._exampleChangeHandler
    );
  }

  setAvailableExamples(examples) {
    this.examples = examples;
    if (!this._exampleSelector) {
      return;
    }
    // Clear current options except placeholder
    this._exampleSelector.innerHTML =
      '<option value="">Select example...</option>';
    examples.forEach((example) => {
      const option = document.createElement('option');
      option.value = example;
      option.textContent = example;
      this._exampleSelector.appendChild(option);
    });
  }

  destroy() {
    if (this._zoomInBtn) {
      this._zoomInBtn.removeEventListener('click', this._zoomInHandler);
    }
    if (this._zoomOutBtn) {
      this._zoomOutBtn.removeEventListener('click', this._zoomOutHandler);
    }
    if (this._zoomResetBtn) {
      this._zoomResetBtn.removeEventListener('click', this._zoomResetHandler);
    }
    if (this._layoutSelect) {
      this._layoutSelect.removeEventListener(
        'change',
        this._layoutChangeHandler
      );
    }
    if (this._exampleSelector) {
      this._exampleSelector.removeEventListener(
        'change',
        this._exampleChangeHandler
      );
    }
    if (this.panel && this.container.contains(this.panel)) {
      this.container.removeChild(this.panel);
    }
  }
}
