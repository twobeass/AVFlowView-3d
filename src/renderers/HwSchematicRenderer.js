import * as d3 from 'd3';

class HwSchematicRenderer {
  constructor(containerSelector) {
    this.container = d3.select(containerSelector);
    this.zoomScale = 1;
    this.routingConfig = { extensionLength: 30, obstaclePadding: 2, localSearchRadius: 300, minBendPoints: 2, maxBendPoints: 4, maxIterations: 10, protectedSegmentsCount: 4, edgeSeparation: 8, enableCollisionDetection: true, logPerformance: false, debugCollisions: false, visualizeObstacles: false, visualizeSegments: false };
    this.initSVG();
    this.setupZoomPan();
  }

  // ... rest unchanged ...
}

export default HwSchematicRenderer;
