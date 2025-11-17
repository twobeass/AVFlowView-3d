import { jest } from '@jest/globals';

// Note: d3-hwschematic removed November 17, 2025
// HwSchematicRenderer now uses custom D3-based rendering with OrthogonalRouter

const { default: HwSchematicRenderer } = await import(
  '../HwSchematicRenderer.js'
);

describe('HwSchematicRenderer', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  });

  describe('Initialization', () => {
    test('should create SVG container on initialization', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      expect(renderer.svg).toBeDefined();
      expect(renderer.svg.node()).toBeInstanceOf(SVGSVGElement);
      expect(renderer.svg.attr('class')).toBe('hwschematic-svg-container');
    });

    test('should create g element inside SVG', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      expect(renderer.g).toBeDefined();
      expect(renderer.g.node().tagName).toBe('g');
      expect(renderer.g.attr('class')).toBe('hwschematic-content');
    });

    test('should initialize zoom behavior', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      expect(renderer.zoom).toBeDefined();
      expect(typeof renderer.zoom).toBe('function');
    });
  });

  describe('Rendering', () => {
    test('should render empty data without errors', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      const emptyData = { nodes: [], edges: [] };
      expect(() => renderer.render(emptyData)).not.toThrow();
      expect(renderer.svg.node()).toBeInstanceOf(SVGSVGElement);
    });

    test('should render with minimal node data', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      const minimalData = {
        nodes: [{ id: 'node1', name: 'Test Device' }],
        edges: [],
      };
      expect(() => renderer.render(minimalData)).not.toThrow();
    });

    test('should render with edges', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      const dataWithEdges = {
        children: [
          { 
            id: 'node1', 
            labels: [{ text: 'Device 1' }],
            width: 100,
            height: 50,
            x: 0,
            y: 0
          },
          { 
            id: 'node2', 
            labels: [{ text: 'Device 2' }],
            width: 100,
            height: 50,
            x: 200,
            y: 0
          },
        ],
        edges: [
          { 
            id: 'edge1', 
            sources: ['node1'], 
            targets: ['node2'],
            hwMeta: { category: 'video' }
          },
        ],
      };
      expect(() => renderer.render(dataWithEdges)).not.toThrow();
    });
  });

  describe('Custom Renderers', () => {
    test('DeviceRenderer should be defined', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      expect(renderer.DeviceRenderer).toBeDefined();
      expect(typeof renderer.DeviceRenderer).toBe('function');
    });

    test('AreaRenderer should be defined', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      expect(renderer.AreaRenderer).toBeDefined();
      expect(typeof renderer.AreaRenderer).toBe('function');
    });

    test('EdgeRenderer should be defined', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      expect(renderer.EdgeRenderer).toBeDefined();
      expect(typeof renderer.EdgeRenderer).toBe('function');
    });
  });
});
