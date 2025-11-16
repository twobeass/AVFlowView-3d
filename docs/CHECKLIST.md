# Implementation Checklist

This checklist provides concrete, verifiable tasks for each phase of the AVFlowView-3d implementation. Check off items as they are completed.

## Phase 1: Project Setup & Architecture

### Project Initialization
- [ ] Run `npm init` and configure package.json
- [ ] Add all dependencies with exact versions:
  - [ ] d3 ^7.8.5
  - [ ] d3-hwschematic ^0.1.x
  - [ ] elkjs ^0.9.0
  - [ ] ajv ^8.12.0
  - [ ] vite ^5.0.0
- [ ] Add dev dependencies:
  - [ ] jest ^29.0.0
  - [ ] playwright ^1.40.0
  - [ ] eslint ^8.0.0
  - [ ] prettier ^3.0.0
  - [ ] @types/d3 (if using TypeScript)

### Directory Structure
- [ ] Create `src/` directory
- [ ] Create `src/converters/` directory
- [ ] Create `src/renderers/` directory
- [ ] Create `src/validation/` directory
- [ ] Create `src/utils/` directory
- [ ] Create `src/ui/` directory
- [ ] Create `tests/` directory
- [ ] Create `tests/fixtures/` directory
- [ ] Ensure `examples/` directory exists

### Configuration Files
- [ ] Create `vite.config.js` with proper entry point
- [ ] Create `.eslintrc.js` with project rules
- [ ] Create `.prettierrc` with formatting rules
- [ ] Create `jest.config.js` for test configuration
- [ ] Create `playwright.config.js` for e2e tests
- [ ] Create `.gitignore` (node_modules, dist, coverage)

### Basic Application Shell
- [ ] Create `index.html` with container div
- [ ] Create `src/main.js` as entry point
- [ ] Add basic CSS reset/styles
- [ ] Verify `npm run dev` starts without errors
- [ ] Verify `npm run build` produces dist/ folder
- [ ] Verify empty page loads in browser without console errors

### Documentation
- [ ] Create `docs/ARCHITECTURE.md` (can be minimal initially)
- [ ] Update README.md with basic project description

---

## Phase 2: Schema Validation Layer

### Validator Implementation
- [ ] Install ajv: `npm install ajv ajv-formats`
- [ ] Create `src/validation/SchemaValidator.js`
- [ ] Implement `validateGraph(json)` method
- [ ] Precompile schema from `avflowview-wiring.schema.json`
- [ ] Add JSON Schema 2020-12 support
- [ ] Implement error formatting with JSON paths

### Test Cases
- [ ] Create `tests/validation/SchemaValidator.test.js`
- [ ] Test valid minimal graph (passes)
- [ ] Test missing required field "nodes" (fails)
- [ ] Test missing required field "edges" (fails)
- [ ] Test invalid node without required "id" (fails)
- [ ] Test invalid port alignment enum value (fails)
- [ ] Test invalid edge without "source" (fails)
- [ ] Test edge referencing non-existent node (fails)
- [ ] Test nested area with invalid parentId (fails)
- [ ] Achieve 100% code coverage for SchemaValidator

### Performance Verification
- [ ] Validation completes in <100ms for 50-node graph
- [ ] Error messages include clear JSON paths
- [ ] All tests pass: `npm test -- SchemaValidator`

---

## Phase 3: Data Transformation (AV → ELK)

### Converter Implementation
- [ ] Create `src/converters/AVToELKConverter.js`
- [ ] Implement node mapping (AV Node → ELK LNode)
- [ ] Implement area mapping (AV Area → ELK container LNode)
- [ ] Implement port mapping (AV Port → ELK LPort)
- [ ] Implement edge mapping (AV Edge → ELK LEdge)
- [ ] Handle layout direction (LR vs TB)
- [ ] Set ELK options (orthogonal routing, spacing)
- [ ] Handle nested areas via parent hierarchy

### Test Cases
- [ ] Create `tests/converters/AVToELKConverter.test.js`
- [ ] Test simple graph (2 nodes, 1 edge)
- [ ] Test graph with areas
- [ ] Test graph with nested areas
- [ ] Test bidirectional ports
- [ ] Test port-specific edge connections
- [ ] Test LR layout direction
- [ ] Test TB layout direction
- [ ] Verify output is valid ELK JSON

### Integration Verification
- [ ] Sample graph converts without errors
- [ ] ELK JSON can be consumed by d3-hwschematic
- [ ] Conversion completes in <200ms for 50 nodes
- [ ] All node IDs preserved correctly
- [ ] All port associations correct

---

## Phase 4: Styling & Semantics

### CategoryStyler Implementation
- [ ] Create `src/utils/CategoryStyler.js`
- [ ] Define color palette for categories
- [ ] Implement `getNodeStyle(category, status)`
- [ ] Implement `getEdgeStyle(category)`
- [ ] Handle status variations (Existing, Regular, Defect)
- [ ] Implement as singleton pattern

### PortDirectionResolver Implementation
- [ ] Create `src/utils/PortDirectionResolver.js`
- [ ] Implement bidirectional port analysis
- [ ] Determine port side based on edge connections
- [ ] Handle majority flow direction
- [ ] Integrate with AVToELKConverter

### Test Cases
- [ ] Create `tests/utils/CategoryStyler.test.js`
- [ ] Test each category returns correct color
- [ ] Test status variations
- [ ] Test default/unknown categories
- [ ] Create `tests/utils/PortDirectionResolver.test.js`
- [ ] Test bidirectional port with in-only connections
- [ ] Test bidirectional port with out-only connections
- [ ] Test bidirectional port with mixed connections

### Visual Verification
- [ ] Categories use consistent colors
- [ ] Status differences are visually clear
- [ ] Bidirectional ports placed sensibly

---

## Phase 5: Visualization via d3-hwschematic

### HwSchematic Setup
- [ ] Install d3-hwschematic: `npm install d3-hwschematic`
- [ ] Create `src/renderers/HwSchematicRenderer.js`
- [ ] Initialize HwSchematic with SVG container
- [ ] Configure ELK layout options

### Custom Renderers
- [ ] Create `src/renderers/DeviceRenderer.js`
  - [ ] Draw rectangular device box
  - [ ] Render device header (manufacturer + model)
  - [ ] Render device label
  - [ ] Add category color bar
  - [ ] Render ports on correct sides
  - [ ] Add port labels
- [ ] Create `src/renderers/AreaRenderer.js`
  - [ ] Draw low-contrast container rectangle
  - [ ] Add area label at top-left
  - [ ] Handle nested areas
- [ ] Create `src/renderers/EdgeRenderer.js`
  - [ ] Draw orthogonal edges with smooth corners
  - [ ] Apply category colors to edges
  - [ ] Add edge labels
  - [ ] Handle cable type patterns

### Zoom & Pan
- [ ] Implement d3-zoom on outer SVG group
- [ ] Add zoom-in button
- [ ] Add zoom-out button
- [ ] Add reset zoom button
- [ ] Constrain zoom levels (min/max)

### Visual Verification
- [ ] Example graph renders without errors
- [ ] All devices visible and properly sized
- [ ] Areas contain correct devices
- [ ] Edges route orthogonally
- [ ] Ports positioned on correct sides
- [ ] Zoom and pan work smoothly
- [ ] Renders in <2s for 50 nodes/100 edges

---

## Phase 6: Interaction & Focus/Context

### Selection Implementation
- [ ] Create `src/ui/SelectionManager.js`
- [ ] Handle click events on nodes
- [ ] Handle click events on edges
- [ ] Highlight selected element
- [ ] Show selection details in info panel

### Focus/Context Implementation
- [ ] Create `src/utils/FocusManager.js`
- [ ] Implement graph traversal (BFS/DFS)
- [ ] Calculate N-hop neighborhood
- [ ] Highlight focused elements
- [ ] Fade non-focused elements
- [ ] Add distance control (1-3 hops)

### Search Implementation
- [ ] Create `src/ui/SearchManager.js`
- [ ] Implement text search over node labels
- [ ] Search manufacturer and model fields
- [ ] Search edge labels and wireId
- [ ] Display search results
- [ ] Focus on selected result

### Filter Implementation
- [ ] Add category filter UI
- [ ] Add status filter UI
- [ ] Add area filter UI
- [ ] Apply filters to visible elements

### Interaction Verification
- [ ] Click selects nodes/edges correctly
- [ ] Selection shows detailed information
- [ ] Focus highlighting works for 1-3 hops
- [ ] Search returns results in <200ms
- [ ] Filters update view correctly
- [ ] Keyboard navigation works

---

## Phase 7: Application Shell & API

### Main Application Class
- [ ] Create `src/AVFlowView3dApp.js`
- [ ] Implement constructor with config
- [ ] Implement `load(graphJson)` method
- [ ] Implement `update(graphJson)` method
- [ ] Implement `setFocus(elementId, distance)` method
- [ ] Implement `export(type)` method (SVG/PNG)
- [ ] Wire up all components

### UI Controls
- [ ] Create controls panel
- [ ] Add zoom controls
- [ ] Add focus distance slider
- [ ] Add search box
- [ ] Add category filters
- [ ] Add info panel for selection details

### Example Page
- [ ] Create example HTML page
- [ ] Load sample JSON data
- [ ] Instantiate AVFlowView3dApp
- [ ] Verify all features work

### API Verification
- [ ] `load()` validates and renders graph
- [ ] `update()` re-renders with new data
- [ ] `setFocus()` highlights correctly
- [ ] `export()` produces valid SVG/PNG

---

## Phase 8: Testing, Docs & Polish

### Unit Tests
- [ ] SchemaValidator tests (100% coverage)
- [ ] AVToELKConverter tests (≥90% coverage)
- [ ] CategoryStyler tests (100% coverage)
- [ ] PortDirectionResolver tests (≥90% coverage)
- [ ] FocusManager tests (≥90% coverage)
- [ ] Overall test coverage ≥80%

### Integration Tests
- [ ] Create Playwright test suite
- [ ] Test loading example graphs
- [ ] Test node selection and info display
- [ ] Test focus distance adjustment
- [ ] Test search functionality
- [ ] Test filter functionality
- [ ] Test zoom and pan
- [ ] Test export functionality

### Documentation
- [ ] Expand README.md with:
  - [ ] Quick start guide
  - [ ] Installation instructions
  - [ ] Basic usage examples
  - [ ] Screenshots
- [ ] Complete `docs/ARCHITECTURE.md`
- [ ] Document all public API methods
- [ ] Add JSDoc comments to all modules
- [ ] Create examples with explanations

### Performance Optimization
- [ ] Profile with Chrome DevTools
- [ ] Optimize rendering for large graphs
- [ ] Check for memory leaks
- [ ] Achieve Lighthouse performance score ≥85
- [ ] Verify 60fps during zoom/pan

### Accessibility
- [ ] Add ARIA labels to interactive elements
- [ ] Verify keyboard navigation
- [ ] Test with screen reader
- [ ] Check color contrast ratios
- [ ] Run axe accessibility tests (0 violations)

### Browser Testing
- [ ] Test in Chrome ≥90
- [ ] Test in Firefox ≥88
- [ ] Test in Safari ≥14
- [ ] Test in Edge ≥90

### Final Verification
- [ ] All tests pass in CI
- [ ] No console errors or warnings
- [ ] Examples work in all supported browsers
- [ ] Documentation is complete and accurate
- [ ] Performance targets met
- [ ] Accessibility requirements met
