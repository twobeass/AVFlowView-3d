import { NodeSizeCalculator } from '../../src/utils/NodeSizeCalculator.js';

describe('NodeSizeCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new NodeSizeCalculator();
  });

  describe('Constructor and configuration', () => {
    test('should initialize with default configuration', () => {
      expect(calculator.config.minWidth).toBe(100);
      expect(calculator.config.minHeight).toBe(60);
      expect(calculator.config.portSpacing).toBe(20);
      expect(calculator.config.portSize).toBe(10);
      expect(calculator.config.portPadding).toBe(15);
    });

    test('should allow custom configuration', () => {
      const customCalc = new NodeSizeCalculator({
        minWidth: 150,
        portSpacing: 25,
      });
      expect(customCalc.config.minWidth).toBe(150);
      expect(customCalc.config.portSpacing).toBe(25);
      expect(customCalc.config.minHeight).toBe(60); // default
    });
  });

  describe('Port side computation', () => {
    test('should compute WEST for In alignment in LR layout', () => {
      const port = { alignment: 'In' };
      const side = calculator._computePortSide(port, 'LR');
      expect(side).toBe('WEST');
    });

    test('should compute EAST for Out alignment in LR layout', () => {
      const port = { alignment: 'Out' };
      const side = calculator._computePortSide(port, 'LR');
      expect(side).toBe('EAST');
    });

    test('should compute EAST for Bidirectional alignment in LR layout', () => {
      const port = { alignment: 'Bidirectional' };
      const side = calculator._computePortSide(port, 'LR');
      expect(side).toBe('EAST');
    });

    test('should compute NORTH for In alignment in TB layout', () => {
      const port = { alignment: 'In' };
      const side = calculator._computePortSide(port, 'TB');
      expect(side).toBe('NORTH');
    });

    test('should compute SOUTH for Out alignment in TB layout', () => {
      const port = { alignment: 'Out' };
      const side = calculator._computePortSide(port, 'TB');
      expect(side).toBe('SOUTH');
    });

    test('should compute SOUTH for Bidirectional alignment in TB layout', () => {
      const port = { alignment: 'Bidirectional' };
      const side = calculator._computePortSide(port, 'TB');
      expect(side).toBe('SOUTH');
    });
  });

  describe('Side length calculation', () => {
    test('should return 0 for empty port array', () => {
      const length = calculator._calculateSideLength([]);
      expect(length).toBe(0);
    });

    test('should calculate correct length for single port', () => {
      const ports = [{ alignment: 'Out' }];
      // (1 * 10) + (0 * 20) + (2 * 15) = 10 + 0 + 30 = 40
      const length = calculator._calculateSideLength(ports);
      expect(length).toBe(40);
    });

    test('should calculate correct length for two ports', () => {
      const ports = [{ alignment: 'Out' }, { alignment: 'Out' }];
      // (2 * 10) + (1 * 20) + (2 * 15) = 20 + 20 + 30 = 70
      const length = calculator._calculateSideLength(ports);
      expect(length).toBe(70);
    });

    test('should calculate correct length for multiple ports', () => {
      const ports = [
        { alignment: 'Out' },
        { alignment: 'Out' },
        { alignment: 'Out' },
        { alignment: 'Out' },
      ];
      // (4 * 10) + (3 * 20) + (2 * 15) = 40 + 60 + 30 = 130
      const length = calculator._calculateSideLength(ports);
      expect(length).toBe(130);
    });
  });

  describe('Label width calculation', () => {
    test('should calculate correct width for empty label', () => {
      const node = { label: '' };
      // (0 * 7) + (2 * 10) = 0 + 20 = 20
      const width = calculator._calculateLabelWidth(node);
      expect(width).toBe(20);
    });

    test('should calculate correct width for short label', () => {
      const node = { label: 'Test' };
      // (4 * 7) + (2 * 10) = 28 + 20 = 48
      const width = calculator._calculateLabelWidth(node);
      expect(width).toBe(48);
    });

    test('should calculate correct width for long label', () => {
      const node = { label: 'Sony PXW-Z450' };
      // (13 * 7) + (2 * 10) = 91 + 20 = 111
      const width = calculator._calculateLabelWidth(node);
      expect(width).toBe(111);
    });

    test('should handle node without label', () => {
      const node = {};
      const width = calculator._calculateLabelWidth(node);
      expect(width).toBe(20);
    });
  });

  describe('Node size calculation - LR layout', () => {
    test('should return minimum size for node with no ports', () => {
      const node = {
        id: 'test',
        label: 'Test',
        ports: {},
      };
      const size = calculator.calculateNodeSize(node, 'LR');
      
      // Width: max(0, 48, 100) = 100
      // Height: max(0, 60) + 16 + 10 = 86
      expect(size.width).toBe(100);
      expect(size.height).toBe(86);
    });

    test('should increase width for node with NORTH/SOUTH ports', () => {
      const node = {
        id: 'test',
        label: 'Test',
        ports: {
          p1: { alignment: 'In' },  // Not on NORTH/SOUTH in LR
          p2: { alignment: 'Out' }, // Not on NORTH/SOUTH in LR
        },
      };
      const size = calculator.calculateNodeSize(node, 'LR');
      
      // In LR layout: In→WEST, Out→EAST (not NORTH/SOUTH)
      // So width is based on label and minWidth only
      expect(size.width).toBe(100);
    });

    test('should increase height for node with EAST/WEST ports', () => {
      const node = {
        id: 'test',
        label: 'Test',
        ports: {
          p1: { alignment: 'In' },  // WEST in LR
          p2: { alignment: 'Out' }, // EAST in LR
        },
      };
      const size = calculator.calculateNodeSize(node, 'LR');
      
      // WEST has 1 port: 40px
      // EAST has 1 port: 40px
      // Height: max(40, 40, 60) + 16 + 10 = 86
      expect(size.height).toBe(86);
    });

    test('should handle node with multiple ports on same side', () => {
      const node = {
        id: 'switcher',
        label: 'Blackmagic ATEM 2 M/E',
        ports: {
          out1: { alignment: 'Out' },
          out2: { alignment: 'Out' },
          out3: { alignment: 'Out' },
          out4: { alignment: 'Out' },
        },
      };
      const size = calculator.calculateNodeSize(node, 'LR');
      
      // All 4 ports on EAST: (4 * 10) + (3 * 20) + (2 * 15) = 130
      // Width: max(0, labelWidth ~160, 100) = 160
      // Height: max(130, 60) + 16 + 10 = 156
      expect(size.width).toBeGreaterThan(100);
      expect(size.height).toBe(156);
    });

    test('should respect aspect ratio constraints', () => {
      // Create a scenario where aspect ratio would be violated
      const node = {
        id: 'test',
        label: 'A very long label that should affect the width calculation',
        ports: {
          p1: { alignment: 'Out' },
        },
      };
      const size = calculator.calculateNodeSize(node, 'LR');
      
      const aspectRatio = size.width / size.height;
      expect(aspectRatio).toBeGreaterThanOrEqual(0.5);
      expect(aspectRatio).toBeLessThanOrEqual(3.0);
    });
  });

  describe('Node size calculation - TB layout', () => {
    test('should return minimum size for node with no ports', () => {
      const node = {
        id: 'test',
        label: 'Test',
        ports: {},
      };
      const size = calculator.calculateNodeSize(node, 'TB');
      
      expect(size.width).toBe(100);
      expect(size.height).toBe(86);
    });

    test('should increase height for node with NORTH/SOUTH ports in TB layout', () => {
      const node = {
        id: 'test',
        label: 'Test',
        ports: {
          p1: { alignment: 'In' },  // NORTH in TB
          p2: { alignment: 'Out' }, // SOUTH in TB
          p3: { alignment: 'Out' }, // SOUTH in TB
        },
      };
      const size = calculator.calculateNodeSize(node, 'TB');
      
      // NORTH has 1 port: 40px
      // SOUTH has 2 ports: 70px
      // Height: max(70, 60) + 16 + 10 = 96
      expect(size.height).toBe(96);
    });

    test('should increase width for node with EAST/WEST ports in TB layout', () => {
      const node = {
        id: 'test',
        label: 'Test',
        ports: {
          p1: { alignment: 'Bidirectional' }, // SOUTH in TB (not EAST/WEST)
        },
      };
      const size = calculator.calculateNodeSize(node, 'TB');
      
      // No EAST/WEST ports, so width is based on minWidth
      expect(size.width).toBe(100);
    });
  });

  describe('Real-world examples', () => {
    test('should calculate size for simple camera node', () => {
      const node = {
        id: 'camera',
        label: 'Sony PXW-Z450',
        ports: {
          sdi_out: { alignment: 'Out' },
        },
      };
      const size = calculator.calculateNodeSize(node, 'LR');
      
      expect(size.width).toBeGreaterThan(100);
      expect(size.height).toBeGreaterThan(60);
    });

    test('should calculate larger size for switcher with multiple outputs', () => {
      const switcher = {
        id: 'switcher',
        label: 'Blackmagic ATEM',
        ports: {
          sdi_out_1: { alignment: 'Out' },
          sdi_out_2: { alignment: 'Out' },
          sdi_out_3: { alignment: 'Out' },
          sdi_out_4: { alignment: 'Out' },
        },
      };
      const camera = {
        id: 'camera',
        label: 'Sony Camera',
        ports: {
          sdi_out: { alignment: 'Out' },
        },
      };
      
      const switcherSize = calculator.calculateNodeSize(switcher, 'LR');
      const cameraSize = calculator.calculateNodeSize(camera, 'LR');
      
      // Switcher should be taller due to more ports on EAST side
      expect(switcherSize.height).toBeGreaterThan(cameraSize.height);
    });

    test('should handle node with mixed port alignments', () => {
      const node = {
        id: 'device',
        label: 'Hybrid Device',
        ports: {
          in1: { alignment: 'In' },
          in2: { alignment: 'In' },
          out1: { alignment: 'Out' },
          out2: { alignment: 'Out' },
          out3: { alignment: 'Out' },
        },
      };
      const size = calculator.calculateNodeSize(node, 'LR');
      
      // WEST: 2 ports = 70px
      // EAST: 3 ports = 100px
      // Height should be max(100, 60) + 26 = 126
      expect(size.height).toBe(126);
    });
  });

  describe('Edge cases', () => {
    test('should handle node without ports property', () => {
      const node = {
        id: 'test',
        label: 'Test',
      };
      const size = calculator.calculateNodeSize(node, 'LR');
      
      expect(size.width).toBe(100);
      expect(size.height).toBe(86);
    });

    test('should handle node with null ports', () => {
      const node = {
        id: 'test',
        label: 'Test',
        ports: null,
      };
      const size = calculator.calculateNodeSize(node, 'LR');
      
      expect(size.width).toBe(100);
      expect(size.height).toBe(86);
    });

    test('should round dimensions to integers', () => {
      const node = {
        id: 'test',
        label: 'T', // Label width will be (1 * 7) + 20 = 27
        ports: {
          p1: { alignment: 'Out' },
        },
      };
      const size = calculator.calculateNodeSize(node, 'LR');
      
      expect(Number.isInteger(size.width)).toBe(true);
      expect(Number.isInteger(size.height)).toBe(true);
    });

    test('should enforce minimum aspect ratio', () => {
      const calculator2 = new NodeSizeCalculator({
        minAspectRatio: 1.0,
        maxAspectRatio: 2.0,
      });
      
      const node = {
        id: 'test',
        label: 'X',
        ports: {
          p1: { alignment: 'Out' },
          p2: { alignment: 'Out' },
          p3: { alignment: 'Out' },
          p4: { alignment: 'Out' },
          p5: { alignment: 'Out' },
          p6: { alignment: 'Out' },
        },
      };
      const size = calculator2.calculateNodeSize(node, 'LR');
      
      const aspectRatio = size.width / size.height;
      expect(aspectRatio).toBeGreaterThanOrEqual(1.0);
      expect(aspectRatio).toBeLessThanOrEqual(2.0);
    });
  });
});
