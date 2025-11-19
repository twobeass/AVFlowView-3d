// PATCH (restore all inspector logic from main)
// Place this in src/ui/DebugPanel.js, replacing stub or broken panel logic
import * as d3 from 'd3';

export class DebugPanel {
  constructor(renderer) {
    // ...init code...
    this.inspectedEdgeId = null;
    this.stats = { totalEdges: 0, elkEdges: 0, fallbackEdges: 0 };
    // ...panel DOM structure setup...
    this.initPanel();
  }
  initPanel() {
    // ...existing code to set up basic HTML...
    // Add .debug-panel class panel, edge-inspector section, and diagnostic JSON section
  }
  inspectEdge(edgeId) {
    // fill inspector fields with detailed info for edgeId
    this.inspectedEdgeId = edgeId;
    // find edge by id and update the diagnostics section and buttons
  }
  // implement copy diagnostic data button logic
  copyDiagnosticData() {
    const diagnosticText = this.panel.querySelector('.diagnostic-pre').innerText;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(diagnosticText);
    } else {
      // fallback - create temporary textarea
      const ta = document.createElement('textarea');
      ta.value = diagnosticText;
      document.body.appendChild(ta);
      ta.select(); document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }
  // ...rest unchanged...
}
