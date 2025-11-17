// HwSchematicRenderer.test.js
// Basic smoke test for HwSchematicRenderer

import HwSchematicRenderer from '../HwSchematicRenderer.js';

describe('HwSchematicRenderer', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should instantiate without error', () => {
    const renderer = new HwSchematicRenderer('#test-container');
    expect(renderer).toBeDefined();
  });

  it('should render a simple ELK graph without error', () => {
    const renderer = new HwSchematicRenderer('#test-container');
    const data = {
      id: 'root',
      children: [
        {
          id: 'node1',
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          labels: [{ text: 'Node 1' }],
          ports: [],
        },
      ],
      edges: [],
    };
    expect(() => renderer.render(data)).not.toThrow();
  });
});
