// In AVFlowView3dApp.js, patched methods for TopBar integration and zoom reset callback
resetView() {
  if (this.renderer && typeof this.renderer.resetZoom === 'function') {
    this.renderer.resetZoom();
  }
}