import { AVFlowView3dApp } from '../../src/AVFlowView3dApp.js';

describe('AVFlowView3dApp', () => {
  it('should be defined', () => {
    expect(AVFlowView3dApp).toBeDefined();
  });

  it('should instantiate without error', () => {
    document.body.innerHTML = '<div id="container"></div>';
    const app = new AVFlowView3dApp('#container');
    expect(app).toBeInstanceOf(AVFlowView3dApp);
  });
});
