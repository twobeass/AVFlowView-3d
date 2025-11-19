import { SchemaValidator } from '../../src/validation/SchemaValidator.js';

describe('SchemaValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new SchemaValidator();
  });

  describe('Valid graphs', () => {
    test('should validate minimal valid graph', () => {
      const graph = {
        nodes: [
          {
            id: 'node1',
            manufacturer: 'TestCo',
            model: 'Model-X',
            category: 'Audio',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = validator.validateGraph(graph);
      expect(result).toEqual({ success: true });
    });

    test('should validate graph with all optional fields', () => {
      const graph = {
        layout: {
          direction: 'LR',
          portBinding: 'auto',
          areaFirst: true,
          areaPadding: 24,
        },
        areas: [
          {
            id: 'area1',
            label: 'Room 1',
            metadata: { floor: 1 },
          },
        ],
        nodes: [
          {
            id: 'node1',
            manufacturer: 'Sony',
            model: 'Camera-A',
            category: 'Video',
            subcategory: 'PTZ',
            status: 'Existing',
            label: 'Cam 1',
            areaId: 'area1',
            ports: {
              sdi1: {
                alignment: 'Out',
                label: 'SDI Out',
                type: 'SDI',
                gender: 'M',
                metadata: { format: '3G-SDI' },
              },
            },
            metadata: { ip: '192.168.1.10' },
          },
        ],
        edges: [
          {
            id: 'edge1',
            wireId: 'W001',
            category: 'Video',
            subcategory: 'SDI',
            cableType: 'SDI',
            label: 'Main Feed',
            source: 'node1',
            sourcePortKey: 'sdi1',
            target: 'node1',
            targetPortKey: 'sdi1',
            binding: 'exact',
            metadata: { length: '50m' },
          },
        ],
        metadata: {
          project: 'Studio A',
          version: '1.0',
        },
      };

      const result = validator.validateGraph(graph);
      expect(result).toEqual({ success: true });
    });

    test('should validate graph with nested areas', () => {
      const graph = {
        areas: [
          { id: 'area1', label: 'Building' },
          { id: 'area2', label: 'Floor 1', parentId: 'area1' },
          { id: 'area3', label: 'Room A', parentId: 'area2' },
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

      const result = validator.validateGraph(graph);
      expect(result).toEqual({ success: true });
    });

    test('should validate graph with bidirectional ports', () => {
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

      const result = validator.validateGraph(graph);
      expect(result).toEqual({ success: true });
    });

    test('should validate graph with TB layout direction', () => {
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

      const result = validator.validateGraph(graph);
      expect(result).toEqual({ success: true });
    });
  });

  describe('Invalid graphs - missing required fields', () => {
    test('should fail when nodes array is missing', () => {
      const graph = { edges: [] };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('SCHEMA_VALIDATION_FAILED');
      expect(result.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'required',
            params: expect.objectContaining({ missingProperty: 'nodes' }),
          }),
        ])
      );
    });

    test('should fail when edges array is missing', () => {
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
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'required',
            params: expect.objectContaining({ missingProperty: 'edges' }),
          }),
        ])
      );
    });

    test('should fail when node is missing required id field', () => {
      const graph = {
        nodes: [
          {
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: expect.stringContaining('/nodes/0'),
            keyword: 'required',
          }),
        ])
      );
    });

    test('should fail when node is missing manufacturer', () => {
      const graph = {
        nodes: [
          { id: 'n1', model: 'X', category: 'A', status: 'Regular', ports: {} },
        ],
        edges: [],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(
        result.error.details.some(
          (d) => d.params.missingProperty === 'manufacturer'
        )
      ).toBe(true);
    });

    test('should fail when node is missing model', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            category: 'A',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(
        result.error.details.some((d) => d.params.missingProperty === 'model')
      ).toBe(true);
    });

    test('should fail when node is missing category', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(
        result.error.details.some(
          (d) => d.params.missingProperty === 'category'
        )
      ).toBe(true);
    });

    test('should fail when node is missing status', () => {
      const graph = {
        nodes: [
          { id: 'n1', manufacturer: 'M', model: 'X', category: 'A', ports: {} },
        ],
        edges: [],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(
        result.error.details.some((d) => d.params.missingProperty === 'status')
      ).toBe(true);
    });

    test('should fail when node is missing ports', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
          },
        ],
        edges: [],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(
        result.error.details.some((d) => d.params.missingProperty === 'ports')
      ).toBe(true);
    });

    test('should fail when edge is missing source', () => {
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
        edges: [{ id: 'e1', target: 'n1' }],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(
        result.error.details.some((d) => d.params.missingProperty === 'source')
      ).toBe(true);
    });

    test('should fail when edge is missing target', () => {
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
        edges: [{ id: 'e1', source: 'n1' }],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(
        result.error.details.some((d) => d.params.missingProperty === 'target')
      ).toBe(true);
    });

    test('should fail when edge is missing id', () => {
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
        edges: [{ source: 'n1', target: 'n1' }],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(
        result.error.details.some((d) => d.params.missingProperty === 'id')
      ).toBe(true);
    });

    test('should fail when area is missing label', () => {
      const graph = {
        areas: [{ id: 'area1' }],
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

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(
        result.error.details.some((d) => d.params.missingProperty === 'label')
      ).toBe(true);
    });

    test('should fail when port is missing alignment', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: { p1: { label: 'Port 1', type: 'USB', gender: 'M' } },
          },
        ],
        edges: [],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(
        result.error.details.some(
          (d) => d.params.missingProperty === 'alignment'
        )
      ).toBe(true);
    });
  });

  describe('Invalid graphs - enum violations', () => {
    test('should fail when port alignment has invalid enum value', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {
              p1: {
                alignment: 'Invalid',
                label: 'Port 1',
                type: 'USB',
                gender: 'M',
              },
            },
          },
        ],
        edges: [],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ keyword: 'enum' })])
      );
    });

    test('should fail when node status has invalid enum value', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Invalid',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ keyword: 'enum' })])
      );
    });

    test('should fail when layout direction has invalid enum value', () => {
      const graph = {
        layout: { direction: 'RL' },
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

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ keyword: 'enum' })])
      );
    });

    test('should fail when port gender has invalid enum value', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {
              p1: {
                alignment: 'In',
                label: 'Port 1',
                type: 'USB',
                gender: 'X',
              },
            },
          },
        ],
        edges: [],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ keyword: 'enum' })])
      );
    });
  });

  describe('Invalid graphs - cross-reference errors', () => {
    test('should fail when edge references non-existent source node', () => {
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
        edges: [{ id: 'e1', source: 'nonexistent', target: 'n1' }],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: '/edges/0/source',
            keyword: 'ref-node',
            message: expect.stringContaining('unknown node id "nonexistent"'),
          }),
        ])
      );
    });

    test('should fail when edge references non-existent target node', () => {
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
        edges: [{ id: 'e1', source: 'n1', target: 'nonexistent' }],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: '/edges/0/target',
            keyword: 'ref-node',
            message: expect.stringContaining('unknown node id "nonexistent"'),
          }),
        ])
      );
    });

    test('should fail when area references non-existent parent area', () => {
      const graph = {
        areas: [{ id: 'area1', label: 'Area 1', parentId: 'nonexistent' }],
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

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: '/areas/0/parentId',
            keyword: 'ref-area',
            message: expect.stringContaining('unknown area id "nonexistent"'),
          }),
        ])
      );
    });

    test('should fail with multiple cross-reference errors', () => {
      const graph = {
        areas: [{ id: 'area1', label: 'Area 1', parentId: 'missing-area' }],
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
          { id: 'e1', source: 'missing-source', target: 'n1' },
          { id: 'e2', source: 'n1', target: 'missing-target' },
        ],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.details.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Invalid graphs - pattern and format violations', () => {
    test('should fail when node id has invalid pattern', () => {
      const graph = {
        nodes: [
          {
            id: 'invalid id!',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ keyword: 'pattern' }),
        ])
      );
    });

    test('should fail when edge id has invalid pattern', () => {
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
        edges: [{ id: 'invalid edge!', source: 'n1', target: 'n1' }],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ keyword: 'pattern' }),
        ])
      );
    });

    test('should fail when manufacturer is empty string', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: '',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {},
          },
        ],
        edges: [],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ keyword: 'minLength' }),
        ])
      );
    });

    test('should fail when port label is empty string', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: {
              p1: { alignment: 'In', label: '', type: 'USB', gender: 'M' },
            },
          },
        ],
        edges: [],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ keyword: 'minLength' }),
        ])
      );
    });
  });

  describe('Invalid graphs - type errors', () => {
    test('should fail when graph is not an object', () => {
      const result1 = validator.validateGraph(null);
      expect(result1.success).toBe(false);

      const result2 = validator.validateGraph('string');
      expect(result2.success).toBe(false);

      const result3 = validator.validateGraph(123);
      expect(result3.success).toBe(false);

      const result4 = validator.validateGraph([]);
      expect(result4.success).toBe(false);
    });

    test('should fail when nodes is not an array', () => {
      const graph = {
        nodes: 'not-an-array',
        edges: [],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ keyword: 'type' })])
      );
    });

    test('should fail when edges is not an array', () => {
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
        edges: 'not-an-array',
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ keyword: 'type' })])
      );
    });

    test('should fail when ports is not an object', () => {
      const graph = {
        nodes: [
          {
            id: 'n1',
            manufacturer: 'M',
            model: 'X',
            category: 'A',
            status: 'Regular',
            ports: [],
          },
        ],
        edges: [],
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ keyword: 'type' })])
      );
    });
  });

  describe('Edge cases', () => {
    test('should handle undefined input', () => {
      const result = validator.validateGraph(undefined);
      expect(result.success).toBe(false);
    });

    test('should handle empty object', () => {
      const result = validator.validateGraph({});
      expect(result.success).toBe(false);
      expect(
        result.error.details.some((d) => d.params.missingProperty === 'nodes')
      ).toBe(true);
      expect(
        result.error.details.some((d) => d.params.missingProperty === 'edges')
      ).toBe(true);
    });

    test('should handle graph with empty arrays', () => {
      const graph = { nodes: [], edges: [] };
      const result = validator.validateGraph(graph);
      expect(result).toEqual({ success: true });
    });

    test('should handle malformed nodes array', () => {
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

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
    });

    test('should handle malformed edges array for cross-reference checks', () => {
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
        edges: [null, { id: 'e1', source: 'n1', target: 'n1' }],
      };

      const result = validator.validateGraph(graph);
      // Should fail schema validation on null edge, not crash on cross-ref check
      expect(result.success).toBe(false);
    });

    test('should handle additional properties correctly', () => {
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
        unknownField: 'should fail',
      };

      const result = validator.validateGraph(graph);
      expect(result.success).toBe(false);
      expect(result.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ keyword: 'additionalProperties' }),
        ])
      );
    });
  });
});
