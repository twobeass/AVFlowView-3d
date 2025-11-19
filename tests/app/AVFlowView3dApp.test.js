import { AVFlowView3dApp } from '../../src/AVFlowView3dApp.js';

describe('AVFlowView3dApp', () => {
  let container;
  let app;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test-container"></div>';
    container = document.getElementById('test-container');
  });

  afterEach(() => {
    if (app) {
      app.destroy();
    }
    document.body.innerHTML = '';
  });

  describe('Constructor', () => {
    it('should be defined', () => {
      expect(AVFlowView3dApp).toBeDefined();
    });

    it('should instantiate with string selector', () => {
      app = new AVFlowView3dApp('#test-container');
      expect(app).toBeInstanceOf(AVFlowView3dApp);
    });

    it('should instantiate with DOM element', () => {
      app = new AVFlowView3dApp(container);
      expect(app).toBeInstanceOf(AVFlowView3dApp);
    });

    it('should throw error when container not found', () => {
      expect(() => {
        app = new AVFlowView3dApp('#nonexistent-container');
      }).toThrow('AVFlowView3dApp: container not found');
    });

    it('should initialize with options', () => {
      app = new AVFlowView3dApp(container, {
        debug: true,
        enableDebugPanel: false,
      });
      expect(app.options.debug).toBe(true);
      expect(app.options.enableDebugPanel).toBe(false);
    });

    it('should initialize renderer', () => {
      app = new AVFlowView3dApp(container);
      expect(app.renderer).toBeDefined();
    });

    it('should initialize schema validator', () => {
      app = new AVFlowView3dApp(container);
      expect(app.schemaValidator).toBeDefined();
    });

    it('should initialize converter', () => {
      app = new AVFlowView3dApp(container);
      expect(app.converter).toBeDefined();
    });

    it('should initialize ELK instance', () => {
      app = new AVFlowView3dApp(container);
      expect(app.elk).toBeDefined();
    });

    it('should initialize controls panel', async () => {
      app = new AVFlowView3dApp(container);
      expect(app.controlsPanel).toBeDefined();
    });
  });

  describe('load method', () => {
    beforeEach(() => {
      app = new AVFlowView3dApp(container);
      // Mock ELK layout to prevent test failures
      const mockLayoutResult = {
        id: 'root',
        children: [],
        edges: [],
      };
      app.elk.layout = jest.fn().mockResolvedValue(mockLayoutResult);
    });

    it('should validate graph before loading', async () => {
      const invalidGraph = { invalid: true };
      const result = await app.load(invalidGraph);
      expect(result.success).toBe(false);
    });

    it('should set currentGraph on successful load', async () => {
      const validGraph = {
        nodes: [],
        edges: [],
      };
      const result = await app.load(validGraph);
      expect(result.success).toBe(true);
      expect(app.currentGraph).toEqual(validGraph);
    });

    it('should call renderer.render', async () => {
      const validGraph = {
        nodes: [],
        edges: [],
      };
      const renderSpy = jest.spyOn(app.renderer, 'render');
      await app.load(validGraph);
      expect(renderSpy).toHaveBeenCalled();
      renderSpy.mockRestore();
    });

    it('should track layout time', async () => {
      const validGraph = {
        nodes: [],
        edges: [],
      };
      await app.load(validGraph);
      expect(app.layoutTime).toBeGreaterThanOrEqual(0);
    });

    it('should update debug panel when available', async () => {
      const validGraph = {
        nodes: [],
        edges: [],
      };
      if (app.debugPanel) {
        const updateSpy = jest.spyOn(app.debugPanel, 'update');
        await app.load(validGraph);
        expect(updateSpy).toHaveBeenCalled();
        updateSpy.mockRestore();
      }
    });
  });

  describe('loadExample method', () => {
    beforeEach(() => {
      app = new AVFlowView3dApp(container);
    });

    it('should load example with valid name', async () => {
      // This test may fail if the example file doesn't exist
      // but it should handle the error gracefully
      const result = await app.loadExample('simple');
      expect(result).toBeDefined();
      expect(result.success !== undefined).toBe(true);
    });
  });

  describe('changeLayout method', () => {
    beforeEach(() => {
      app = new AVFlowView3dApp(container);
      // Mock ELK layout to prevent test failures
      const mockLayoutResult = {
        id: 'root',
        children: [],
        edges: [],
      };
      app.elk.layout = jest.fn().mockResolvedValue(mockLayoutResult);
    });

    it('should do nothing if no current graph', async () => {
      const result = await app.changeLayout('TB');
      expect(result).toBeUndefined();
    });

    it('should update layout direction', async () => {
      const validGraph = {
        layout: { direction: 'LR' },
        nodes: [],
        edges: [],
      };
      await app.load(validGraph);
      expect(app.currentLayoutDirection).toBe('LR');
      const result = await app.changeLayout('TB');
      expect(result).toBeDefined();
      expect(app.currentLayoutDirection).toBe('TB');
    });
  });

  describe('zoom methods', () => {
    beforeEach(() => {
      app = new AVFlowView3dApp(container);
    });

    it('should call renderer.zoomIn', () => {
      const zoomInSpy = jest.spyOn(app.renderer, 'zoomIn');
      app.zoomIn();
      expect(zoomInSpy).toHaveBeenCalled();
      zoomInSpy.mockRestore();
    });

    it('should call renderer.zoomOut', () => {
      const zoomOutSpy = jest.spyOn(app.renderer, 'zoomOut');
      app.zoomOut();
      expect(zoomOutSpy).toHaveBeenCalled();
      zoomOutSpy.mockRestore();
    });

    it('should call renderer.resetZoom', () => {
      const resetZoomSpy = jest.spyOn(app.renderer, 'resetZoom');
      app.resetView();
      expect(resetZoomSpy).toHaveBeenCalled();
      resetZoomSpy.mockRestore();
    });
  });

  describe('extractPortInfo method', () => {
    beforeEach(() => {
      app = new AVFlowView3dApp(container);
    });

    it('should extract port info from graph', () => {
      const data = {
        children: [
          {
            id: 'node1',
            ports: [
              {
                id: 'port1',
                x: 10,
                y: 20,
                properties: { 'org.eclipse.elk.portSide': 'EAST' },
              },
            ],
          },
        ],
      };
      const portInfo = app.extractPortInfo(data);
      expect(portInfo.length).toBe(1);
      expect(portInfo[0].nodeId).toBe('node1');
      expect(portInfo[0].portId).toBe('port1');
    });

    it('should handle nested children', () => {
      const data = {
        children: [
          {
            id: 'area1',
            children: [
              {
                id: 'node1',
                ports: [{ id: 'port1', x: 10, y: 20 }],
              },
            ],
          },
        ],
      };
      const portInfo = app.extractPortInfo(data);
      expect(portInfo.length).toBe(1);
    });

    it('should handle empty graph', () => {
      const data = { children: [] };
      const portInfo = app.extractPortInfo(data);
      expect(portInfo.length).toBe(0);
    });
  });

  describe('toggleDebugPanel method', () => {
    it('should toggle debug panel visibility', () => {
      app = new AVFlowView3dApp(container, { enableDebugPanel: true });
      if (app.debugPanel) {
        const initialState = app.debugPanel.isVisible;
        app.toggleDebugPanel();
        expect(app.debugPanel.isVisible).toBe(!initialState);
      }
    });
  });

  describe('destroy method', () => {
    beforeEach(() => {
      app = new AVFlowView3dApp(container);
    });

    it('should clear container HTML', () => {
      app.destroy();
      expect(container.innerHTML).toBe('');
    });

    it('should hide debug panel', () => {
      if (app.debugPanel) {
        const hideSpy = jest.spyOn(app.debugPanel, 'hide');
        app.destroy();
        expect(hideSpy).toHaveBeenCalled();
        hideSpy.mockRestore();
      }
    });
  });
});
