import { breadthFirstSearch } from '../../src/utils/graph-traversal.js';

describe('graph-traversal', () => {
  describe('breadthFirstSearch', () => {
    const mockGraph = {
      nodes: [
        { id: 'node1' },
        { id: 'node2' },
        { id: 'node3' },
      ],
      edges: [
        { source: 'node1', target: 'node2' },
        { source: 'node2', target: 'node3' },
      ],
    };

    it('should throw error when called (not implemented)', () => {
      expect(() => breadthFirstSearch(mockGraph, 'node1')).toThrow(
        'breadthFirstSearch is not implemented yet.'
      );
    });

    it('should throw error with default maxDepth', () => {
      expect(() => breadthFirstSearch(mockGraph, 'node1')).toThrow();
    });

    it('should throw error with custom maxDepth', () => {
      expect(() => breadthFirstSearch(mockGraph, 'node1', 2)).toThrow(
        'breadthFirstSearch is not implemented yet.'
      );
    });

    it('should throw error with null graph', () => {
      expect(() => breadthFirstSearch(null, 'node1')).toThrow();
    });

    it('should throw error with undefined startId', () => {
      expect(() => breadthFirstSearch(mockGraph, undefined)).toThrow();
    });

    it('should throw error with zero maxDepth', () => {
      expect(() => breadthFirstSearch(mockGraph, 'node1', 0)).toThrow();
    });

    it('should throw error with negative maxDepth', () => {
      expect(() => breadthFirstSearch(mockGraph, 'node1', -1)).toThrow();
    });

    it('should throw error with large maxDepth', () => {
      expect(() => breadthFirstSearch(mockGraph, 'node1', 100)).toThrow();
    });
  });
});
