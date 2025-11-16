import { CategoryStyler } from '../styling/CategoryStyler.js';
import { PortDirectionResolver } from '../styling/PortDirectionResolver.js';

class AVToELKConverter {
  constructor() {
    this.categoryStyler = new CategoryStyler();
    this.portDirectionResolver = new PortDirectionResolver();
  }

  convertNode(avNode) {
    // Simplified transformation of an AV node to ELK node with styling
    const category = avNode.category || 'Default';
    const status = avNode.status || 'Regular';

    const style = this.categoryStyler.getNodeStyle(category, status);

    // Analyze and resolve port directions
    const ports = this.portDirectionResolver.resolve(avNode.ports || [], avNode.edges || []);

    // Map ports with resolved sides
    const elkPorts = ports.map(port => ({
      id: port.id,
      label: port.label || '',
      side: port.side || 'top',
    }));

    return {
      id: avNode.id,
      label: avNode.label || '',
      width: avNode.width || 100,
      height: avNode.height || 100,
      ports: elkPorts,
      style: style,
      category: category,
      status: status,
    };
  }

  convertEdge(avEdge) {
    const category = avEdge.category || 'Default';
    const status = avEdge.status || 'Regular';
    const style = this.categoryStyler.getEdgeStyle(category, status);

    return {
      id: avEdge.id,
      source: avEdge.source,
      target: avEdge.target,
      style: style,
      category: category,
      status: status,
    };
  }

  convert(avJson) {
    // Assuming avJson has nodes and edges arrays
    const elkNodes = avJson.nodes.map(node => this.convertNode(node));
    const elkEdges = avJson.edges.map(edge => this.convertEdge(edge));

    return {
      id: avJson.id || 'elkGraph',
      layoutOptions: {}, // Layout options can be customized
      children: elkNodes,
      edges: elkEdges,
    };
  }
}

export default AVToELKConverter;
