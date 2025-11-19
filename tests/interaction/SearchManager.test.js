import { SearchManager } from '../../src/interaction/SearchManager.js';

describe('SearchManager', () => {
  let manager;

  beforeEach(() => {
    manager = new SearchManager();
  });

  describe('Initialization', () => {
    it('should be defined', () => {
      expect(SearchManager).toBeDefined();
    });

    it('should be instantiable', () => {
      expect(manager).not.toBeNull();
      expect(manager).toBeInstanceOf(SearchManager);
    });
  });

  describe('search method', () => {
    const mockGraph = {
      nodes: [
        { id: 'node1', manufacturer: 'Sony', model: 'BVM-X300' },
        { id: 'node2', manufacturer: 'Blackmagic', model: 'ATEM' },
        { id: 'node3', manufacturer: 'Sony', model: 'PWS-4500' },
      ],
      edges: [],
    };

    it('should throw error when called (not implemented)', () => {
      expect(() => manager.search(mockGraph, 'Sony')).toThrow(
        'SearchManager.search is not implemented yet.'
      );
    });

    it('should throw error with empty query', () => {
      expect(() => manager.search(mockGraph, '')).toThrow();
    });

    it('should throw error with null graph', () => {
      expect(() => manager.search(null, 'Sony')).toThrow();
    });

    it('should throw error with undefined query', () => {
      expect(() => manager.search(mockGraph, undefined)).toThrow();
    });

    it('should throw error with numeric query', () => {
      expect(() => manager.search(mockGraph, 123)).toThrow();
    });

    it('should throw error with empty graph', () => {
      expect(() => manager.search({ nodes: [], edges: [] }, 'test')).toThrow();
    });
  });
});
