import { AVFlowView3dApp } from '../AVFlowView3dApp.js';

describe('AVFlowView3dApp', () => {
  it('should be defined', () => {
    expect(AVFlowView3dApp).toBeDefined();
  });

  it('should instantiate without error', () => {
    // Create a container element for the app
    document.body.innerHTML = '<div id="container"></div>';
    const app = new AVFlowView3dApp('#container');
    expect(app).toBeInstanceOf(AVFlowView3dApp);
  });
});
