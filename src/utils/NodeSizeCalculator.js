/**
 * NodeSizeCalculator - Dynamic node sizing for AVFlowView-3d
 * Calculates node dimensions based on port count, layout, and constraints
 */
export class NodeSizeCalculator {
  constructor(config = {}) {
    this.config = {
      // Dimensions
      fixedWidth: 125,  // Fixed width for all nodes
      
      // Port spacing - simplified formula: (portCount * portHeight) + label space
      portHeight: 20,  // Each port adds 20px to node height
      portSpacing: 20, // Spacing between ports (for ELK)
      portSize: 10,
      portPadding: 15,
      
      // Labels
      labelHeight: 16,
      labelPadding: 10,
      
      ...config
    };
  }

  /**
   * Group ports by side
   * @param {object} node - Node with ports
   * @param {string} layoutDirection - 'LR' or 'TB'
   * @returns {object} Ports grouped by side
   */
  _groupPortsBySide(node, layoutDirection) {
    const portsBySide = {
      NORTH: [],
      SOUTH: [],
      EAST: [],
      WEST: []
    };

    if (!node.ports) return portsBySide;

    Object.values(node.ports).forEach(port => {
      // Skip null or undefined ports
      if (!port) return;
      
      const side = this._computePortSide(port, layoutDirection);
      portsBySide[side].push(port);
    });

    return portsBySide;
  }

  /**
   * Compute port side based on layout direction and port properties
   * MUST match the logic in AVToELKConverter.computePortSide()
   * @param {object} port - Port object
   * @param {string} layoutDirection - 'LR' or 'TB'
   * @returns {string} Port side (NORTH, SOUTH, EAST, WEST)
   */
  _computePortSide(port, layoutDirection) {
    const isTB = layoutDirection === 'TB';
    
    switch (port.alignment) {
      case 'In':
        return isTB ? 'NORTH' : 'WEST';
      case 'Out':
        return isTB ? 'SOUTH' : 'EAST';
      case 'Bidirectional':
      default:
        return isTB ? 'SOUTH' : 'EAST';
    }
  }

  /**
   * Calculate required length for a side with ports
   * @param {array} ports - Ports on a specific side
   * @returns {number} Required length for the side
   */
  _calculateSideLength(ports) {
    const { portSpacing, portSize, portPadding } = this.config;
    const portCount = ports.length;

    if (portCount === 0) return 0;

    return (
      (portCount * portSize) + 
      ((portCount - 1) * portSpacing) + 
      (2 * portPadding)
    );
  }

  /**
   * Calculate label width
   * @param {object} node - Node with label
   * @returns {number} Label width in pixels
   */
  _calculateLabelWidth(node) {
    const { charWidth, labelPadding } = this.config;
    const labelText = node.label || '';
    return (labelText.length * charWidth) + (2 * labelPadding);
  }

  /**
   * Calculate node dimensions
   * @param {object} node - Node with ports and label
   * @param {string} layoutDirection - 'LR' or 'TB'
   * @returns {object} Calculated node dimensions
   */
  calculateNodeSize(node, layoutDirection = 'LR') {
    const { 
      fixedWidth,
      portHeight,
      labelHeight, 
      labelPadding
    } = this.config;

    // Group ports by side
    const portsBySide = this._groupPortsBySide(node, layoutDirection);

    // Count ports on each side
    const northCount = portsBySide.NORTH.length;
    const southCount = portsBySide.SOUTH.length;
    const eastCount = portsBySide.EAST.length;
    const westCount = portsBySide.WEST.length;

    // Fixed width for all nodes
    const width = fixedWidth;

    // Calculate height based on port count
    // Formula: (portCount * 20px) + label space (26px)
    let height;
    if (layoutDirection === 'LR') {
      // LR: Input ports on WEST, Output ports on EAST
      // Height determined by max(EAST, WEST) port count
      const maxVerticalPorts = Math.max(eastCount, westCount, 1); // At least 1 for nodes with no ports
      height = (maxVerticalPorts * portHeight) + labelHeight + labelPadding;
    } else { // TB layout
      // TB: Input ports on NORTH, Output ports on SOUTH
      // Height determined by max(NORTH, SOUTH) port count
      const maxVerticalPorts = Math.max(northCount, southCount, 1); // At least 1 for nodes with no ports
      height = (maxVerticalPorts * portHeight) + labelHeight + labelPadding;
    }

    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }
}
