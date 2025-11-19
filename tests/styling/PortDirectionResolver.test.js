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
  });

  describe('resolveDirection', () => {
    it('should resolve input port direction', () => {
      const direction = resolver.resolveDirection('input');
      expect(direction).toBeDefined();
      expect(typeof direction).toBe('string');
    });

    it('should resolve output port direction', () => {
      const direction = resolver.resolveDirection('output');
      expect(direction).toBeDefined();
      expect(typeof direction).toBe('string');
    });

    it('should resolve bidirectional port direction', () => {
      const direction = resolver.resolveDirection('bidirectional');
      expect(direction).toBeDefined();
      expect(typeof direction).toBe('string');
    });

    it('should handle null alignment', () => {
      const direction = resolver.resolveDirection(null);
      expect(direction).toBeDefined();
    });

    it('should handle undefined alignment', () => {
      const direction = resolver.resolveDirection(undefined);
      expect(direction).toBeDefined();
    });

    it('should handle unknown alignment', () => {
      const direction = resolver.resolveDirection('unknown');
      expect(direction).toBeDefined();
    });

    it('should return consistent results for same input', () => {
      const dir1 = resolver.resolveDirection('input');
      const dir2 = resolver.resolveDirection('input');
      expect(dir1).toBe(dir2);
    });
  });

  describe('resolveDirectionForLayout', () => {
    it('should resolve direction for LR layout with input', () => {
      const direction = resolver.resolveDirectionForLayout('input', 'LR');
      expect(direction).toBeDefined();
    });

    it('should resolve direction for LR layout with output', () => {
      const direction = resolver.resolveDirectionForLayout('output', 'LR');
      expect(direction).toBeDefined();
    });

    it('should resolve direction for TB layout with input', () => {
      const direction = resolver.resolveDirectionForLayout('input', 'TB');
      expect(direction).toBeDefined();
    });

    it('should resolve direction for TB layout with output', () => {
      const direction = resolver.resolveDirectionForLayout('output', 'TB');
      expect(direction).toBeDefined();
    });

    it('should handle null layout', () => {
      const direction = resolver.resolveDirectionForLayout('input', null);
      expect(direction).toBeDefined();
    });

    it('should handle undefined layout', () => {
      const direction = resolver.resolveDirectionForLayout('input', undefined);
      expect(direction).toBeDefined();
    });

    it('should handle bidirectional ports in LR layout', () => {
      const direction = resolver.resolveDirectionForLayout('bidirectional', 'LR');
      expect(direction).toBeDefined();
    });

    it('should handle bidirectional ports in TB layout', () => {
      const direction = resolver.resolveDirectionForLayout('bidirectional', 'TB');
      expect(direction).toBeDefined();
    });
  });
});
