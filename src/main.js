import { AVFlowView3dApp } from './AVFlowView3dApp.js';
import { ExampleLoader } from './utils/ExampleLoader.js';
import './styles/controls.css';
import './styles/debug.css';

async function bootstrap() {
  const container = document.getElementById('app');

  if (!container) {
    // eslint-disable-next-line no-console
    console.error('AVFlowView-3d: #app container not found');
    return;
  }

  try {
    // Initialize the application
    const app = new AVFlowView3dApp(container, {
      debug: true,
    });

    // Initialize example loader
    const exampleLoader = new ExampleLoader('/examples/');

    // Load default example (simple.json)
    try {
      const defaultGraph = await exampleLoader.loadExample('simple.json');
      const result = await app.load(defaultGraph);

      if (result.success) {
        // eslint-disable-next-line no-console
        console.log('Default example loaded successfully');
      } else {
        // eslint-disable-next-line no-console
        console.error('Validation failed for default example:', result.error);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load default example:', error);
      // Continue with empty state - controls will still be functional
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('AVFlowView-3d initialization failed:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
