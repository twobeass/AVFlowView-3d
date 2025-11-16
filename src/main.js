import { AVFlowView3dApp } from './AVFlowView3dApp.js';

function bootstrap() {
  const container = document.getElementById('app');

  if (!container) {
    console.error('AVFlowView-3d: #app container not found');
    return;
  }

  // Placeholder instance for Phase 1; real wiring happens in later phases.
  // This ensures the dev server loads without runtime errors.
  // eslint-disable-next-line no-new
  new AVFlowView3dApp(container, {
    debug: true,
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
