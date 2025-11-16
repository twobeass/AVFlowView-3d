# Testing Strategy for AVFlowView-3d

## 1. Unit Tests
- **All** critical modules (`SchemaValidator`, `AVToELKConverter`, `CategoryStyler`) must have ≥90% coverage. 
- Use Jest with input and output fixtures from examples/simple.json, medium.json, complex.json, and invalid-examples.
- Cover valid/invalid JSON, error object returns, port mapping, and bidirectional resolution cases.

## 2. Integration Tests
- Use Playwright to load, interact, and visually verify diagrams in the browser for all supplied examples.
- Automate: 
  - Opening the main app
  - Loading valid and invalid JSON
  - Clicking, focus-changing, search, zoom/pan, export
- Baseline visual output for pixel regression (snapshots < 1% diff).

## 3. Performance Benchmarks
- Scripts (Jest, Playwright, or npm run benchmarks):
  - Render time for 50, 100, 500 nodes
  - Response latency on search, focus, filtering
  - File size, memory usage via browser API

## 4. Accessibility Tests
- Keyboard navigation and ARIA attributes tested via Playwright.
- Contrast checked via automated tool (aXe or Lighthouse).

## 5. Error Injection
- All errors (schema/input/conversion/render) must return error envelope (see TECHNICAL_SPECS.md).
- Simulate all known invalid case files (see examples/invalid-examples/).

## 6. CI Integration
- All of the above must pass on PRs to `main`.
- Output badge summary to README.md.

---

*Agents must conform to these requirements before submitting code to main or requesting human review.*
