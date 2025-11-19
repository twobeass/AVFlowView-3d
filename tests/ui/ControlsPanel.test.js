import { ControlsPanel } from '../../src/ui/ControlsPanel.js';

describe('ControlsPanel', () => {
  let container;
  let panel;
  let mockCallbacks;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test-container"></div>';
    container = document.getElementById('test-container');
    mockCallbacks = {
      onZoomIn: jest.fn(),
      onZoomOut: jest.fn(),
      onReset: jest.fn(),
      onLayoutChange: jest.fn(),
      onExampleLoad: jest.fn(),
    };
  });

  afterEach(() => {
    if (panel) {
      panel.destroy();
    }
    document.body.innerHTML = '';
  });

  describe('Constructor', () => {
    it('should create instance with string selector', () => {
      panel = new ControlsPanel('#test-container', mockCallbacks);
      expect(panel).toBeInstanceOf(ControlsPanel);
      expect(panel.container).toBe(container);
    });

    it('should create instance with DOM element', () => {
      panel = new ControlsPanel(container, mockCallbacks);
      expect(panel).toBeInstanceOf(ControlsPanel);
      expect(panel.container).toBe(container);
    });

    it('should render panel HTML', () => {
      panel = new ControlsPanel(container, mockCallbacks);
      expect(panel.panel).toBeDefined();
      expect(panel.panel.className).toBe('controls-panel');
      expect(container.contains(panel.panel)).toBe(true);
    });

    it('should render zoom controls', () => {
      panel = new ControlsPanel(container, mockCallbacks);
      expect(panel._zoomInBtn).toBeDefined();
      expect(panel._zoomOutBtn).toBeDefined();
      expect(panel._zoomResetBtn).toBeDefined();
      expect(panel._zoomInBtn.title).toBe('Zoom In');
    });

    it('should render layout direction select', () => {
      panel = new ControlsPanel(container, mockCallbacks);
      expect(panel._layoutSelect).toBeDefined();
      expect(panel._layoutSelect.tagName).toBe('SELECT');
    });

    it('should render example selector', () => {
      panel = new ControlsPanel(container, mockCallbacks);
      expect(panel._exampleSelector).toBeDefined();
      expect(panel._exampleSelector.tagName).toBe('SELECT');
    });
  });

  describe('Event Handlers', () => {
    beforeEach(() => {
      panel = new ControlsPanel(container, mockCallbacks);
    });

    it('should call onZoomIn callback when zoom in clicked', () => {
      panel._zoomInBtn.click();
      expect(mockCallbacks.onZoomIn).toHaveBeenCalled();
    });

    it('should call onZoomOut callback when zoom out clicked', () => {
      panel._zoomOutBtn.click();
      expect(mockCallbacks.onZoomOut).toHaveBeenCalled();
    });

    it('should call onReset callback when reset clicked', () => {
      panel._zoomResetBtn.click();
      expect(mockCallbacks.onReset).toHaveBeenCalled();
    });

    it('should call onLayoutChange callback when layout direction changes', () => {
      panel._layoutSelect.value = 'TB';
      panel._layoutSelect.dispatchEvent(new Event('change'));
      expect(mockCallbacks.onLayoutChange).toHaveBeenCalledWith('TB');
    });

    it('should call onExampleLoad callback when example selected', () => {
      panel.setAvailableExamples(['simple', 'complex']);
      panel._exampleSelector.value = 'simple';
      panel._exampleSelector.dispatchEvent(new Event('change'));
      expect(mockCallbacks.onExampleLoad).toHaveBeenCalledWith('simple');
    });

    it('should not call onExampleLoad when placeholder selected', () => {
      panel.setAvailableExamples(['simple', 'complex']);
      panel._exampleSelector.value = '';
      panel._exampleSelector.dispatchEvent(new Event('change'));
      expect(mockCallbacks.onExampleLoad).not.toHaveBeenCalled();
    });
  });

  describe('setAvailableExamples', () => {
    beforeEach(() => {
      panel = new ControlsPanel(container, mockCallbacks);
    });

    it('should populate example selector with provided examples', () => {
      const examples = ['simple', 'medium', 'complex'];
      panel.setAvailableExamples(examples);

      const options = panel._exampleSelector.querySelectorAll('option');
      expect(options.length).toBe(4); // placeholder + 3 examples
      expect(options[0].value).toBe('');
      expect(options[1].value).toBe('simple');
      expect(options[2].value).toBe('medium');
      expect(options[3].value).toBe('complex');
    });

    it('should do nothing if selector not available', () => {
      const examples = ['simple'];
      panel._exampleSelector = null;
      expect(() => panel.setAvailableExamples(examples)).not.toThrow();
      // Should not crash in destroy if elements are null
      expect(() => panel.destroy()).not.toThrow();
    });
  });

  describe('destroy', () => {
    beforeEach(() => {
      panel = new ControlsPanel(container, mockCallbacks);
    });

    it('should remove panel from container', () => {
      expect(container.contains(panel.panel)).toBe(true);
      panel.destroy();
      expect(container.contains(panel.panel)).toBe(false);
    });

    it('should remove event listeners', () => {
      const zoomInSpy = jest.spyOn(panel._zoomInBtn, 'removeEventListener');
      const zoomOutSpy = jest.spyOn(panel._zoomOutBtn, 'removeEventListener');
      const zoomResetSpy = jest.spyOn(
        panel._zoomResetBtn,
        'removeEventListener'
      );
      const layoutSpy = jest.spyOn(panel._layoutSelect, 'removeEventListener');
      const exampleSpy = jest.spyOn(
        panel._exampleSelector,
        'removeEventListener'
      );

      panel.destroy();

      expect(zoomInSpy).toHaveBeenCalledWith('click', panel._zoomInHandler);
      expect(zoomOutSpy).toHaveBeenCalledWith('click', panel._zoomOutHandler);
      expect(zoomResetSpy).toHaveBeenCalledWith(
        'click',
        panel._zoomResetHandler
      );
      expect(layoutSpy).toHaveBeenCalledWith(
        'change',
        panel._layoutChangeHandler
      );
      expect(exampleSpy).toHaveBeenCalledWith(
        'change',
        panel._exampleChangeHandler
      );
    });
  });
});
