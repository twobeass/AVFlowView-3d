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
  });

  describe('getStyleForCategory', () => {
    it('should return style for camera category', () => {
      const style = styler.getStyleForCategory('camera');
      expect(style).toBeDefined();
      expect(style.fill).toBeDefined();
      expect(style.stroke).toBeDefined();
    });

    it('should return style for switcher category', () => {
      const style = styler.getStyleForCategory('switcher');
      expect(style).toBeDefined();
      expect(style.fill).toBeDefined();
    });

    it('should return style for router category', () => {
      const style = styler.getStyleForCategory('router');
      expect(style).toBeDefined();
      expect(style.fill).toBeDefined();
    });

    it('should return style for monitor category', () => {
      const style = styler.getStyleForCategory('monitor');
      expect(style).toBeDefined();
      expect(style.fill).toBeDefined();
    });

    it('should return style for recorder category', () => {
      const style = styler.getStyleForCategory('recorder');
      expect(style).toBeDefined();
      expect(style.fill).toBeDefined();
    });

    it('should return style for converter category', () => {
      const style = styler.getStyleForCategory('converter');
      expect(style).toBeDefined();
      expect(style.fill).toBeDefined();
    });

    it('should return style for processor category', () => {
      const style = styler.getStyleForCategory('processor');
      expect(style).toBeDefined();
      expect(style.fill).toBeDefined();
    });

    it('should return default style for unknown category', () => {
      const style = styler.getStyleForCategory('unknown');
      expect(style).toBeDefined();
      expect(style.fill).toBeDefined();
    });

    it('should return default style for null category', () => {
      const style = styler.getStyleForCategory(null);
      expect(style).toBeDefined();
      expect(style.fill).toBeDefined();
    });

    it('should return default style for undefined category', () => {
      const style = styler.getStyleForCategory(undefined);
      expect(style).toBeDefined();
      expect(style.fill).toBeDefined();
    });

    it('should return consistent styles for same category', () => {
      const style1 = styler.getStyleForCategory('camera');
      const style2 = styler.getStyleForCategory('camera');
      expect(style1).toEqual(style2);
    });

    it('should handle case sensitivity', () => {
      const lowerCase = styler.getStyleForCategory('camera');
      const upperCase = styler.getStyleForCategory('CAMERA');
      expect(lowerCase).toBeDefined();
      expect(upperCase).toBeDefined();
    });
  });
});
