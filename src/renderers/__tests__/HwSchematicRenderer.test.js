import HwSchematicRenderer from './HwSchematicRenderer';

// Basic tests to validate rendering setup

export function testHwSchematicRendererInit() {
  const container = document.createElement('div');
  container.style.width = '800px';
  container.style.height = '600px';
  document.body.appendChild(container);

  const renderer = new HwSchematicRenderer(container);

  if (!renderer.svg) throw new Error('SVG container not created.');
  if (!renderer.g) throw new Error('g element not created inside SVG.');
  if (!renderer.zoom) throw new Error('Zoom behavior not initialized.');

  document.body.removeChild(container);
}

export function testRenderEmptyData() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const renderer = new HwSchematicRenderer(container);
  renderer.render({ nodes: [], edges: [] });
  // Minimal sanity check: no exceptions thrown and SVG exists
  if (!renderer.svg) throw new Error('SVG is missing after render call.');
  document.body.removeChild(container);
}
