// src/styling/PortDirectionResolver.js

// Responsible for resolving port directions, including inference from bidirectional ports and assigning sides for layout.

export class PortDirectionResolver {
  constructor() {
    this.bidirectional = new Set();
  }

  analyzeBidirectionalPorts(ports, edges) {
    // Collect connected edges for each port
    const portEdgeMap = new Map();
    ports.forEach((port) => {
      portEdgeMap.set(port.id, []);
    });

    edges.forEach((edge) => {
      if (portEdgeMap.has(edge.source)) {
        portEdgeMap.get(edge.source).push(edge);
      }
      if (portEdgeMap.has(edge.target)) {
        portEdgeMap.get(edge.target).push(edge);
      }
    });

    // Infer direction for bidirectional ports
    ports.forEach((port) => {
      if (port.direction === 'bidirectional') {
        const connectedEdges = portEdgeMap.get(port.id);
        let outCount = 0;
        let inCount = 0;

        connectedEdges.forEach((edge) => {
          if (edge.source === port.id) {
            outCount++;
          } else if (edge.target === port.id) {
            inCount++;
          }
        });

        // Assign direction based on majority flow
        if (outCount > inCount) {
          port.inferredDirection = 'out';
        } else if (inCount > outCount) {
          port.inferredDirection = 'in';
        } else {
          port.inferredDirection = 'bidirectional';
        }
      }
    });

    return ports;
  }

  assignPortSides(ports) {
    ports.forEach((port) => {
      // Assign sides based on inferred direction
      if (port.inferredDirection === 'in') {
        port.side = 'left';
      } else if (port.inferredDirection === 'out') {
        port.side = 'right';
      } else {
        // default side if direction unknown
        port.side = 'top';
      }
    });
    return ports;
  }

  resolve(ports, edges) {
    this.analyzeBidirectionalPorts(ports, edges);
    this.assignPortSides(ports);
    return ports;
  }
}
