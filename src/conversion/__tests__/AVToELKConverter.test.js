import AVToELKConverter from '../AVToELKConverter.js';
import { CategoryStyler } from '../../styling/CategoryStyler.js';
import { PortDirectionResolver } from '../../styling/PortDirectionResolver.js';

// src/conversion/__tests__/AVToELKConverter.test.js

import { describe, it, expect } from '@jest/globals';

// Mock data sets for tests
const sampleAVJson = {
  id: 'sampleGraph',
  nodes: [
    {
      id: 'node1',
      label: 'Audio Device',
      category: 'Audio',
      status: 'Existing',
      width: 120,
      height: 80,
      ports: [
        { id: 'port1', label: 'In', direction: 'in' },
        { id: 'port2', label: 'Out', direction: 'out' },
        { id: 'port3', label: 'Bi', direction: 'bidirectional' },
      ],
      edges: [
        { id: 'edge1', source: 'port2', target: 'port4' },
        { id: 'edge2', source: 'port3', target: 'port5' },
      ],
    },
    {
      id: 'node2',
      label: 'Video Device',
      category: 'Video',
      status: 'Regular',
      width: 150,
      height: 100,
      ports: [
        { id: 'port4', label: 'In', direction: 'in' },
        { id: 'port5', label: 'Out', direction: 'out' },
      ],
      edges: [],
    },
  ],
  edges: [
    { id: 'connection1', source: 'node1', target: 'node2' },
  ],
};

describe('AVToELKConverter', () => {
  const converter = new AVToELKConverter();

  it('should convert nodes with correct styles and port directions', () => {
    const elkGraph = converter.convert(sampleAVJson);

    expect(elkGraph.children).toHaveLength(2);

    elkGraph.children.forEach(node => {
      expect(node.style).toHaveProperty('fill');
      expect(node.style).toHaveProperty('stroke');

      node.ports.forEach(port => {
        expect(['left', 'right', 'top']).toContain(port.side);
      });
    });
  });

  it('should convert edges with correct styles', () => {
    const elkGraph = converter.convert(sampleAVJson);

    expect(elkGraph.edges).toHaveLength(1);
    elkGraph.edges.forEach(edge => {
      expect(edge.style).toHaveProperty('stroke');
      expect(edge.style).toHaveProperty('strokeWidth');
    });
  });
});
