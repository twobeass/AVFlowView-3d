import { PortDirectionResolver } from '../../src/styling/PortDirectionResolver.js';

describe('PortDirectionResolver', () => {
  let resolver;

  beforeEach(() => {
    resolver = new PortDirectionResolver();
  });

  describe('Constructor', () => {
    it('should be defined', () => {
      expect(PortDirectionResolver).toBeDefined();
    });

    it('should create instance', () => {
      expect(resolver).toBeInstanceOf(PortDirectionResolver);
    });

    it('should initialize bidirectional set', () => {
      expect(resolver.bidirectional).toBeDefined();
      expect(resolver.bidirectional instanceof Set).toBe(true);
    });
  });

  describe('analyzeBidirectionalPorts', () => {
    it('should analyze ports with no edges', () => {
      const ports = [
        { id: 'port1', direction: 'input' },
        { id: 'port2', direction: 'output' },
      ];
      const edges = [];
      const result = resolver.analyzeBidirectionalPorts(ports, edges);
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
    });

    it('should infer bidirectional port as output when more outgoing edges', () => {
      const ports = [{ id: 'port1', direction: 'bidirectional' }];
      const edges = [
        { source: 'port1', target: 'port2' },
        { source: 'port1', target: 'port3' },
      ];
      const result = resolver.analyzeBidirectionalPorts(ports, edges);
      expect(result[0].inferredDirection).toBe('out');
    });

    it('should infer bidirectional port as input when more incoming edges', () => {
      const ports = [{ id: 'port1', direction: 'bidirectional' }];
      const edges = [
        { source: 'port2', target: 'port1' },
        { source: 'port3', target: 'port1' },
      ];
      const result = resolver.analyzeBidirectionalPorts(ports, edges);
      expect(result[0].inferredDirection).toBe('in');
    });

    it('should keep bidirectional when equal incoming and outgoing', () => {
      const ports = [{ id: 'port1', direction: 'bidirectional' }];
      const edges = [
        { source: 'port1', target: 'port2' },
        { source: 'port3', target: 'port1' },
      ];
      const result = resolver.analyzeBidirectionalPorts(ports, edges);
      expect(result[0].inferredDirection).toBe('bidirectional');
    });

    it('should handle empty port list', () => {
      const ports = [];
      const edges = [];
      const result = resolver.analyzeBidirectionalPorts(ports, edges);
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('assignPortSides', () => {
    it('should assign left side for input ports', () => {
      const ports = [{ id: 'port1', inferredDirection: 'in' }];
      const result = resolver.assignPortSides(ports);
      expect(result[0].side).toBe('left');
    });

    it('should assign right side for output ports', () => {
      const ports = [{ id: 'port1', inferredDirection: 'out' }];
      const result = resolver.assignPortSides(ports);
      expect(result[0].side).toBe('right');
    });

    it('should assign top side for bidirectional ports', () => {
      const ports = [{ id: 'port1', inferredDirection: 'bidirectional' }];
      const result = resolver.assignPortSides(ports);
      expect(result[0].side).toBe('top');
    });

    it('should handle multiple ports', () => {
      const ports = [
        { id: 'port1', inferredDirection: 'in' },
        { id: 'port2', inferredDirection: 'out' },
        { id: 'port3', inferredDirection: 'bidirectional' },
      ];
      const result = resolver.assignPortSides(ports);
      expect(result[0].side).toBe('left');
      expect(result[1].side).toBe('right');
      expect(result[2].side).toBe('top');
    });

    it('should handle missing inferredDirection', () => {
      const ports = [{ id: 'port1' }];
      const result = resolver.assignPortSides(ports);
      expect(result[0].side).toBe('top');
    });
  });

  describe('resolve', () => {
    it('should analyze and assign sides to bidirectional ports', () => {
      const ports = [{ id: 'port1', direction: 'bidirectional' }];
      const edges = [{ source: 'port1', target: 'port2' }];
      const result = resolver.resolve(ports, edges);
      expect(result).toBeDefined();
      expect(result[0].inferredDirection).toBe('out');
      expect(result[0].side).toBe('right');
    });

    it('should handle mixed port types', () => {
      const ports = [
        { id: 'port1', direction: 'input' },
        { id: 'port2', direction: 'bidirectional' },
      ];
      const edges = [{ source: 'port2', target: 'port3' }];
      const result = resolver.resolve(ports, edges);
      expect(result.length).toBe(2);
      expect(result[0]).toBeDefined();
      expect(result[1].side).toBe('right');
    });

    it('should handle empty input', () => {
      const result = resolver.resolve([], []);
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });

    it('should handle null ports', () => {
      expect(() => {
        resolver.resolve(null, []);
      }).toThrow();
    });
  });
});
