import { CategoryStyler } from '../../src/styling/CategoryStyler.js';

describe('CategoryStyler', () => {
  let styler;

  beforeEach(() => {
    styler = new CategoryStyler();
  });

  describe('Constructor', () => {
    it('should be defined', () => {
      expect(CategoryStyler).toBeDefined();
    });

    it('should create instance', () => {
      expect(styler).toBeInstanceOf(CategoryStyler);
    });

    it('should initialize with category colors', () => {
      expect(styler.categoryColors).toBeDefined();
      expect(styler.categoryColors.Audio).toBe('#1f77b4');
      expect(styler.categoryColors.Video).toBe('#ff7f0e');
    });

    it('should initialize with status styles', () => {
      expect(styler.statusStyles).toBeDefined();
      expect(styler.statusStyles.Existing).toBeDefined();
      expect(styler.statusStyles.Regular).toBeDefined();
    });
  });

  describe('getNodeStyle', () => {
    it('should return style for Audio category', () => {
      const style = styler.getNodeStyle('Audio', 'Regular');
      expect(style).toBeDefined();
      expect(style.fill).toBe('#1f77b4');
      expect(style.stroke).toBe('#000000');
      expect(style.opacity).toBe(1.0);
    });

    it('should return style for Video category', () => {
      const style = styler.getNodeStyle('Video', 'Regular');
      expect(style).toBeDefined();
      expect(style.fill).toBe('#ff7f0e');
    });

    it('should return style for Network category', () => {
      const style = styler.getNodeStyle('Network', 'Regular');
      expect(style).toBeDefined();
      expect(style.fill).toBe('#2ca02c');
    });

    it('should return style for Control category', () => {
      const style = styler.getNodeStyle('Control', 'Regular');
      expect(style).toBeDefined();
      expect(style.fill).toBe('#d62728');
    });

    it('should return default style for unknown category', () => {
      const style = styler.getNodeStyle('Unknown', 'Regular');
      expect(style).toBeDefined();
      expect(style.fill).toBe('#cccccc');
    });

    it('should apply Existing status', () => {
      const style = styler.getNodeStyle('Audio', 'Existing');
      expect(style.opacity).toBe(0.6);
      expect(style.stroke).toBe('#555555');
    });

    it('should apply Defect status', () => {
      const style = styler.getNodeStyle('Audio', 'Defect');
      expect(style.stroke).toBe('#ff0000');
      expect(style.opacity).toBe(1.0);
    });

    it('should handle null category', () => {
      const style = styler.getNodeStyle(null, 'Regular');
      expect(style).toBeDefined();
      expect(style.fill).toBe('#cccccc');
    });

    it('should handle undefined status', () => {
      const style = styler.getNodeStyle('Audio', undefined);
      expect(style).toBeDefined();
      expect(style.opacity).toBe(1.0);
    });
  });

  describe('getEdgeStyle', () => {
    it('should return edge style for Audio category', () => {
      const style = styler.getEdgeStyle('Audio', 'Regular');
      expect(style).toBeDefined();
      expect(style.stroke).toBe('#1f77b4');
      expect(style.strokeWidth).toBe(1.5);
      expect(style.opacity).toBe(1.0);
    });

    it('should apply Defect status with thicker stroke', () => {
      const style = styler.getEdgeStyle('Video', 'Defect');
      expect(style.strokeWidth).toBe(3);
      expect(style.stroke).toBe('#ff7f0e');
    });

    it('should apply Existing status', () => {
      const style = styler.getEdgeStyle('Network', 'Existing');
      expect(style.opacity).toBe(0.6);
      expect(style.strokeWidth).toBe(1.5);
    });

    it('should use default color for unknown category', () => {
      const style = styler.getEdgeStyle('Unknown', 'Regular');
      expect(style.stroke).toBe('#cccccc');
    });
  });
});
