import { AVToELKConverter } from '../../src/converters/AVToELKConverter.js';

describe('AVToELKConverter', () => {
  let converter;

  beforeEach(() => {
    converter = new AVToELKConverter();
  });

  describe('Basic conversion', () => {
    test('should convert minimal graph with 2 nodes and 1 edge', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'Sony',
            model: 'Camera-A',
            category: 'Video',
            status: 'Regular',
            ports: {
              out1: {
                alignment: 'Out',
                label: 'SDI Out',
                type: 'SDI',
                gender: 'M',
              },
            },
          },
          {
            id: 'n2',
            manufacturer: 'Blackmagic',
            model: 'Recorder-B',
            category: 'Video',
            status: 'Regular',
            ports: {
              in1: {
                alignment: 'In',
                label: 'SDI In',
                type: 'SDI',
                gender: 'F',
              },
            },
          },
        ],
        edges: [
          {
            id: 'e1',
            source: 'n1',
            sourcePortKey: 'out1',
            target: 'n2',
            targetPortKey: 'in1',
            category: 'Video',
            cableType: 'SDI',
          },
        ],
      };

      const result = converter.convert(graph);

      expect(result.id).toBe('root');
      expect(result.children).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
      expect(result.layoutOptions['org.eclipse.elk.algorithm']).toBe('layered');
      expect(result.layoutOptions['org.eclipse.elk.layered.edgeRouting']).toBe(
        'ORTHOGONAL'
      );
    });

    test('should create ELK nodes with correct structure', () => {
      const graph = {
        nodes: [
          {
            id: 'device1',
            manufacturer: 'TestCo',
            model: 'Model-X',
            category: 'Audio',
            status: 'Existing',
            label: 'Main Mixer',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = converter.convert(graph);
      const node = result.children[0];

      expect(node.id).toBe('device1');
      expect(node.labels).toEqual([{ text: 'Main Mixer' }]);
      expect(node.properties['hwMeta.type']).toBe('device');
      expect(node.properties['hwMeta.category']).toBe('Audio');
      expect(node.properties['hwMeta.status']).toBe('Existing');
      expect(node.ports).toEqual([]);
    });

    test('should use fallback label from manufacturer and model', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'Sony',
            model: 'Camera-A',
            category: 'Video',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = converter.convert(graph);
      expect(result.children[0].labels).toEqual([{ text: 'Sony Camera-A' }]);
    });

    test('should use node id as fallback when no label or manufacturer/model', () => {
      const graph = {
        nodes: [
          {
            id: 'device1',
            manufacturer: '',
            model: '',
            category: 'Audio',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = converter.convert(graph);
      expect(result.children[0].labels).toEqual([{ text: 'device1' }]);
    });
  });

  describe('Port mapping', () => {
    test('should create ports with correct IDs and properties', () => {
      const graph = {
        nodes: [
          {
            id: 'switch1',
            manufacturer: 'Cisco',
            model: 'SG350',
            category: 'Network',
            status: 'Regular',
            ports: {
              port1: {
                alignment: 'In',
                label: 'Port 1',
                type: 'RJ45',
                gender: 'F',
              },
              port2: {
                alignment: 'Out',
                label: 'Port 2',
                type: 'RJ45',
                gender: 'M',
              },
            },
          },
        ],
        edges: [],
      };

      const result = converter.convert(graph);
      const node = result.children[0];

      expect(node.ports).toHaveLength(2);

      const port1 = node.ports.find((p) => p.id === 'switch1/port1');
      expect(port1).toBeDefined();
      expect(port1.labels).toEqual([{ text: 'Port 1' }]);
      expect(port1.properties['hwMeta.portKey']).toBe('port1');
      expect(port1.properties['hwMeta.type']).toBe('RJ45');
      expect(port1.properties['hwMeta.gender']).toBe('F');
      expect(port1.properties['org.eclipse.elk.portSide']).toBe('WEST');

      const port2 = node.ports.find((p) => p.id === 'switch1/port2');
      expect(port2.properties['org.eclipse.elk.portSide']).toBe('EAST');
    });

    test('should handle bidirectional ports', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'Network',
            status: 'Regular',
            ports: {
              p1: {
                alignment: 'Bidirectional',
                label: 'Port 1',
                type: 'RJ45',
                gender: 'N/A',
              },
            },
          },
        ],
        edges: [],
      };

      const result = converter.convert(graph);
      const port = result.children[0].ports[0];

      // Bidirectional defaults to Out/EAST for LR layout
      expect(port.properties['org.eclipse.elk.portSide']).toBe('EAST');
    });

    test('should handle nodes with no ports', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = converter.convert(graph);
      expect(result.children[0].ports).toEqual([]);
    });
  });

  describe('Layout direction', () => {
    test('should default to LEFT-to-RIGHT (RIGHT) layout', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = converter.convert(graph);
      expect(result.layoutOptions['org.eclipse.elk.direction']).toBe('RIGHT');
    });

    test('should use LR layout when specified', () => {
      const graph = {
        layout: { direction: 'LR' },
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = converter.convert(graph);
      expect(result.layoutOptions['org.eclipse.elk.direction']).toBe('RIGHT');
    });

    test('should use TB layout when specified', () => {
      const graph = {
        layout: { direction: 'TB' },
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = converter.convert(graph);
      expect(result.layoutOptions['org.eclipse.elk.direction']).toBe('DOWN');
    });

    test('should place input ports on NORTH for TB layout', () => {
      const graph = {
        layout: { direction: 'TB' },
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {
              in1: {
                alignment: 'In',
                label: 'Input',
                type: 'USB',
                gender: 'F',
              },
            },
          },
        ],
        edges: [],
      };

      const result = converter.convert(graph);
      const port = result.children[0].ports[0];
      expect(port.properties['org.eclipse.elk.portSide']).toBe('NORTH');
    });

    test('should place output ports on SOUTH for TB layout', () => {
      const graph = {
        layout: { direction: 'TB' },
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {
              out1: {
                alignment: 'Out',
                label: 'Output',
                type: 'USB',
                gender: 'M',
              },
            },
          },
        ],
        edges: [],
      };

      const result = converter.convert(graph);
      const port = result.children[0].ports[0];
      expect(port.properties['org.eclipse.elk.portSide']).toBe('SOUTH');
    });

    test('should place bidirectional ports on SOUTH for TB layout', () => {
      const graph = {
        layout: { direction: 'TB' },
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {
              p1: {
                alignment: 'Bidirectional',
                label: 'Port 1',
                type: 'RJ45',
                gender: 'N/A',
              },
            },
          },
        ],
        edges: [],
      };

      const result = converter.convert(graph);
      const port = result.children[0].ports[0];
      expect(port.properties['org.eclipse.elk.portSide']).toBe('SOUTH');
    });
  });

  describe('Edge mapping', () => {
    test('should create edges with port-specific connections', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {},
          },
          {
            id: 'n2',
            manufacturer: 'M',
            model: 'Y',
            category: 'A',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [
          {
            id: 'e1',
            source: 'n1',
            sourcePortKey: 'out1',
            target: 'n2',
            targetPortKey: 'in1',
          },
        ],
      };

      const result = converter.convert(graph);
      const edge = result.edges[0];

      expect(edge.id).toBe('e1');
      expect(edge.sources).toEqual(['n1/out1']);
      expect(edge.targets).toEqual(['n2/in1']);
    });

    test('should create edges without port keys (node-level connections)', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {},
          },
          {
            id: 'n2',
            manufacturer: 'M',
            model: 'Y',
            category: 'A',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [
          {
            id: 'e1',
            source: 'n1',
            target: 'n2',
          },
        ],
      };

      const result = converter.convert(graph);
      const edge = result.edges[0];

      expect(edge.sources).toEqual(['n1']);
      expect(edge.targets).toEqual(['n2']);
    });

    test('should preserve edge metadata', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [
          {
            id: 'e1',
            source: 'n1',
            target: 'n1',
            wireId: 'WIRE-001',
            category: 'Video',
            cableType: 'HDMI',
            label: 'Main Feed',
          },
        ],
      };

      const result = converter.convert(graph);
      const edge = result.edges[0];

      expect(edge.labels).toEqual([{ text: 'Main Feed' }]);
      expect(edge.properties['hwMeta.wireId']).toBe('WIRE-001');
      expect(edge.properties['hwMeta.category']).toBe('Video');
      expect(edge.properties['hwMeta.cableType']).toBe('HDMI');
    });

    test('should skip edges with missing required fields', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [
          { id: 'e1' }, // missing source and target
          { id: 'e2', source: 'n1' }, // missing target
          { source: 'n1', target: 'n1' }, // missing id
        ],
      };

      const result = converter.convert(graph);
      expect(result.edges).toHaveLength(0);
    });
  });

  describe('Area support', () => {
    test('should create area container nodes', () => {
      const graph = {
        areas: [
          { id: 'room1', label: 'Room 1' },
          { id: 'room2', label: 'Room 2' },
        ],
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = converter.convert(graph);

      // Areas should be in root children
      const area1 = result.children.find((c) => c.id === 'room1');
      const area2 = result.children.find((c) => c.id === 'room2');

      expect(area1).toBeDefined();
      expect(area1.labels).toEqual([{ text: 'Room 1' }]);
      expect(area1.properties['hwMeta.type']).toBe('area');
      expect(area1.ports).toEqual([]);

      expect(area2).toBeDefined();
      expect(area2.labels).toEqual([{ text: 'Room 2' }]);
    });

    test('should place nodes inside their assigned area', () => {
      const graph = {
        areas: [{ id: 'room1', label: 'Studio' }],
        nodes: [
          {
            id: 'camera1',
            manufacturer: 'Sony',
            model: 'Cam-A',
            category: 'Video',
            status: 'Regular',
            areaId: 'room1',
            ports: {},
          },
          {
            id: 'camera2',
            manufacturer: 'Sony',
            model: 'Cam-B',
            category: 'Video',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = converter.convert(graph);

      // room1 should contain camera1
      const area = result.children.find((c) => c.id === 'room1');
      expect(area.children).toHaveLength(1);
      expect(area.children[0].id).toBe('camera1');

      // camera2 (no areaId) should be in root
      const camera2 = result.children.find((c) => c.id === 'camera2');
      expect(camera2).toBeDefined();
    });

    test('should handle nested areas', () => {
      const graph = {
        areas: [
          { id: 'building', label: 'Building' },
          { id: 'floor1', label: 'Floor 1', parentId: 'building' },
          { id: 'room1', label: 'Room A', parentId: 'floor1' },
        ],
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = converter.convert(graph);

      // building should be in root
      const building = result.children.find((c) => c.id === 'building');
      expect(building).toBeDefined();

      // floor1 should be child of building
      const floor1 = building.children.find((c) => c.id === 'floor1');
      expect(floor1).toBeDefined();

      // room1 should be child of floor1
      const room1 = floor1.children.find((c) => c.id === 'room1');
      expect(room1).toBeDefined();
    });

    test('should handle areas with invalid parentId', () => {
      const graph = {
        areas: [{ id: 'room1', label: 'Room 1', parentId: 'nonexistent' }],
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = converter.convert(graph);

      // Area should be placed in root if parent doesn't exist
      const area = result.children.find((c) => c.id === 'room1');
      expect(area).toBeDefined();
    });
  });

  describe('Complex graphs', () => {
    test('should convert a realistic medium-sized graph', () => {
      const graph = {
        layout: { direction: 'LR' },
        areas: [
          { id: 'studio', label: 'Studio A' },
          { id: 'control', label: 'Control Room' },
        ],
        nodes: [
          {
            id: 'cam1',
            manufacturer: 'Sony',
            model: 'PXW-Z450',
            category: 'Video',
            status: 'Existing',
            areaId: 'studio',
            ports: {
              sdi1: {
                alignment: 'Out',
                label: 'SDI 1',
                type: 'SDI',
                gender: 'M',
              },
            },
          },
          {
            id: 'recorder',
            manufacturer: 'Blackmagic',
            model: 'HyperDeck',
            category: 'Video',
            status: 'Regular',
            areaId: 'control',
            ports: {
              sdi_in: {
                alignment: 'In',
                label: 'SDI In',
                type: 'SDI',
                gender: 'F',
              },
            },
          },
          {
            id: 'switcher',
            manufacturer: 'Cisco',
            model: 'SG350',
            category: 'Network',
            status: 'Regular',
            areaId: 'control',
            ports: {
              p1: {
                alignment: 'Bidirectional',
                label: 'Port 1',
                type: 'RJ45',
                gender: 'N/A',
              },
            },
          },
        ],
        edges: [
          {
            id: 'e1',
            source: 'cam1',
            sourcePortKey: 'sdi1',
            target: 'recorder',
            targetPortKey: 'sdi_in',
            category: 'Video',
            cableType: 'SDI',
            wireId: 'W-001',
          },
        ],
      };

      const result = converter.convert(graph);

      expect(result.children).toHaveLength(2); // 2 areas
      expect(result.edges).toHaveLength(1);

      const studio = result.children.find((c) => c.id === 'studio');
      expect(studio.children).toHaveLength(1); // cam1

      const control = result.children.find((c) => c.id === 'control');
      expect(control.children).toHaveLength(2); // recorder and switcher
    });
  });

  describe('Error handling', () => {
    test('should throw error for null input', () => {
      expect(() => converter.convert(null)).toThrow(
        'AVToELKConverter.convert expects a non-null object'
      );
    });

    test('should throw error for non-object input', () => {
      expect(() => converter.convert('string')).toThrow();
      expect(() => converter.convert(123)).toThrow();
      expect(() => converter.convert([])).toThrow();
    });

    test('should handle undefined arrays gracefully', () => {
      const graph = {}; // no nodes, edges, areas

      const result = converter.convert(graph);
      expect(result.children).toEqual([]);
      expect(result.edges).toEqual([]);
    });

    test('should skip malformed nodes', () => {
      const graph = {
        nodes: [
          null,
          undefined,
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = converter.convert(graph);
      expect(result.children).toHaveLength(1);
      expect(result.children[0].id).toBe('n1');
    });

    test('should skip malformed ports', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {
              valid: {
                alignment: 'In',
                label: 'Valid',
                type: 'USB',
                gender: 'F',
              },
              invalid: null,
            },
          },
        ],
        edges: [],
      };

      const result = converter.convert(graph);
      expect(result.children[0].ports).toHaveLength(1);
      expect(result.children[0].ports[0].id).toBe('n1/valid');
    });
  });
});
