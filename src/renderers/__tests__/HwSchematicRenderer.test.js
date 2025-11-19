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
            y: 0,
          },
          {
            id: 'node2',
            labels: [{ text: 'Device 2' }],
            width: 100,
            height: 50,
            x: 200,
            y: 0,
          },
        ],
        edges: [
          {
            id: 'edge1',
            sources: ['node1'],
            targets: ['node2'],
            hwMeta: { category: 'video' },
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

  describe('renderFallback method', () => {
    test('should render with hierarchical data', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      const hierarchicalData = {
        children: [
          {
            id: 'area1',
            labels: [{ text: 'Area 1' }],
            x: 0,
            y: 0,
            width: 400,
            height: 300,
            children: [
              {
                id: 'device1',
                labels: [{ text: 'Device 1' }],
                x: 50,
                y: 50,
                width: 100,
                height: 50,
                ports: [
                  {
                    id: 'device1/port1',
                    x: 100,
                    y: 25,
                    properties: { 'org.eclipse.elk.portSide': 'EAST' },
                  },
                ],
              },
            ],
          },
        ],
        edges: [],
      };

      expect(() => renderer.renderFallback(hierarchicalData)).not.toThrow();
      // Should create area container and device
      const areaRects = renderer.svg.selectAll('rect').nodes();
      expect(areaRects.length).toBeGreaterThan(0);
    });

    test('should render edges with ELK sections', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      const dataWithELKEdges = {
        children: [
          {
            id: 'device1',
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            ports: [{ id: 'device1/port1', x: 100, y: 25 }],
          },
          {
            id: 'device2',
            x: 200,
            y: 0,
            width: 100,
            height: 50,
            ports: [{ id: 'device2/port1', x: 0, y: 25 }],
          },
        ],
        edges: [
          {
            id: 'edge1',
            sources: ['device1/port1'],
            targets: ['device2/port1'],
            sections: [
              {
                startPoint: { x: 100, y: 25 },
                endPoint: { x: 200, y: 25 },
                bendPoints: [{ x: 150, y: 0 }],
              },
            ],
          },
        ],
      };

      expect(() => renderer.renderFallback(dataWithELKEdges)).not.toThrow();
      // Should create edge path
      const paths = renderer.svg.selectAll('path.edge-path').nodes();
      expect(paths.length).toBeGreaterThan(0);
    });
  });

  describe('findPortAbsolutePosition method', () => {
    test('should find port position in flat hierarchy', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      const data = {
        children: [
          {
            id: 'device1',
            x: 50,
            y: 30,
            ports: [
              {
                id: 'device1/port1',
                x: 100,
                y: 25,
                properties: { 'org.eclipse.elk.portSide': 'EAST' },
              },
            ],
          },
        ],
      };

      const result = renderer.findPortAbsolutePosition(
        'device1',
        'port1',
        data
      );
      expect(result).toBeDefined();
      expect(result.x).toBe(150); // 50 + 100
      expect(result.y).toBe(55); // 30 + 25
      expect(result.side).toBe('EAST');
    });

    test('should find port in hierarchical structure', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      const data = {
        children: [
          {
            id: 'area1',
            x: 100,
            y: 50,
            children: [
              {
                id: 'device1',
                x: 25,
                y: 35,
                ports: [{ id: 'device1/port1', x: 75, y: 20 }],
              },
            ],
          },
        ],
      };

      const result = renderer.findPortAbsolutePosition(
        'device1',
        'port1',
        data
      );
      expect(result).toBeDefined();
      expect(result.x).toBe(200); // 100 + 25 + 75
      expect(result.y).toBe(105); // 50 + 35 + 20
    });

    test('should return null for non-existent port', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      const data = { children: [] };

      const result = renderer.findPortAbsolutePosition('node1', 'port1', data);
      expect(result).toBeNull();
    });
  });

  describe('createPathFromELKSection method', () => {
    test('should create path from ELK section with bend points', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      const section = {
        startPoint: { x: 10, y: 20 },
        bendPoints: [
          { x: 50, y: 20 },
          { x: 50, y: 60 },
        ],
        endPoint: { x: 90, y: 60 },
      };
      const srcPos = { x: 10, y: 20, side: 'EAST' };
      const tgtPos = { x: 90, y: 60, side: 'WEST' };
      const containerOffset = { x: 100, y: 200 };

      const pathData = renderer.createPathFromELKSection(
        section,
        srcPos,
        tgtPos,
        containerOffset
      );

      expect(pathData).toContain('M 110 220'); // start point + offset
      expect(pathData).toContain('L 150 220'); // bend point + offset
      expect(pathData).toContain('L 150 260'); // bend point + offset
      expect(pathData).toContain('L 190 260'); // end point + offset
    });
  });

  describe('findLabelPosition method', () => {
    test('should find position on longest segment', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      const pathData = 'M 0 0 L 100 0 L 200 0'; // Longest segment from (100,0) to (200,0)

      const position = renderer.findLabelPosition(pathData);

      // Longest segment is from (100,0) to (200,0), midpoint should be (150, 0)
      expect(position.x).toBeCloseTo(150, 0);
      expect(position.y).toBeCloseTo(0, 0);
    });

    test('should handle invalid path data', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      const position = renderer.findLabelPosition('invalid');

      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
    });
  });

  describe('getCategoryColor method', () => {
    test('should return correct colors for categories', () => {
      const renderer = new HwSchematicRenderer('#test-container');

      expect(renderer.getCategoryColor('video')).toBe('#E24A6F');
      expect(renderer.getCategoryColor('audio')).toBe('#4A90E2');
      expect(renderer.getCategoryColor('network')).toBe('#50C878');
      expect(renderer.getCategoryColor('control')).toBe('#F5A623');
      expect(renderer.getCategoryColor('power')).toBe('#D0021B');
      expect(renderer.getCategoryColor('display')).toBe('#9B59B6');
      expect(renderer.getCategoryColor('wallplate')).toBe('#95A5A6');
    });

    test('should return default color for unknown category', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      expect(renderer.getCategoryColor('unknown')).toBe('#ddd');
      expect(renderer.getCategoryColor(null)).toBe('#ddd');
      expect(renderer.getCategoryColor(undefined)).toBe('#ddd');
    });
  });

  describe('routeWithLocalAvoidance method', () => {
    test('should create waypoint route between ports', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      const srcPos = { x: 0, y: 50, side: 'EAST' };
      const tgtPos = { x: 200, y: 50, side: 'WEST' };
      const data = { children: [] };

      const waypoints = renderer.routeWithLocalAvoidance(
        srcPos,
        tgtPos,
        data,
        'srcNode',
        'tgtNode'
      );

      expect(Array.isArray(waypoints)).toBe(true);
      expect(waypoints.length).toBeGreaterThan(2);
    });
  });

  describe('collectNearbyObstacles method', () => {
    test('should collect obstacles within radius', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      const data = {
        children: [
          {
            id: 'obstacle1',
            x: 100,
            y: 100,
            width: 50,
            height: 50,
          },
          {
            id: 'distant',
            x: 500,
            y: 500,
            width: 50,
            height: 50,
          },
        ],
      };

      const point = { x: 75, y: 75 };
      const radius = 100;
      const obstacles = renderer.collectNearbyObstacles(point, radius, data);

      expect(obstacles.length).toBe(1);
      expect(obstacles[0].id).toBe('obstacle1');
    });

    test('should exclude specified node IDs', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      const data = {
        children: [
          {
            id: 'srcNode',
            x: 50,
            y: 50,
            width: 50,
            height: 50,
          },
        ],
      };

      const point = { x: 75, y: 75 };
      const radius = 100;
      const obstacles = renderer.collectNearbyObstacles(point, radius, data, [
        'srcNode',
      ]);

      expect(obstacles.length).toBe(0);
    });
  });

  describe('setRoutingConfig method', () => {
    test('should update routing configuration', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      const newConfig = {
        extensionLength: 50,
        minBendPoints: 5,
      };

      renderer.setRoutingConfig(newConfig);

      expect(renderer.routingConfig.extensionLength).toBe(50);
      expect(renderer.routingConfig.minBendPoints).toBe(5);
      expect(renderer.routingConfig.obstaclePadding).toBe(2); // unchanged
    });

    test('should merge with existing configuration', () => {
      const renderer = new HwSchematicRenderer('#test-container');
      const originalPadding = renderer.routingConfig.obstaclePadding;

      renderer.setRoutingConfig({ extensionLength: 40 });

      expect(renderer.routingConfig.extensionLength).toBe(40);
      expect(renderer.routingConfig.obstaclePadding).toBe(originalPadding);
    });
  });
});
