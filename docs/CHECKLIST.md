# Implementation Checklist

This checklist provides concrete, verifiable tasks for each phase of the AVFlowView-3d implementation. Check off items as they are completed.

## Phase 1: Project Setup & Architecture

### Project Initialization
- [x] Run `npm init` and configure package.json
- [x] Add all dependencies with exact versions:
  - [x] d3 ^7.8.5
  - [x] d3-hwschematic ^0.1.x
  - [x] elkjs ^0.9.0
  - [x] ajv ^8.12.0
  - [x] vite ^5.0.0
- [ ] Add dev dependencies:
  - [ ] jest ^29.0.0
  - [ ] playwright ^1.40.0
  - [x] eslint ^8.0.0
  - [x] prettier ^3.0.0
  - [ ] @types/d3 (if using TypeScript)

### Directory Structure
- [x] Create `src/` directory
- [x] Create `src/converters/` directory
- [x] Create `src/renderers/` directory
- [x] Create `src/validation/` directory
- [x] Create `src/utils/` directory
- [ ] Create `src/ui/` directory
- [ ] Create `tests/` directory
- [ ] Create `tests/fixtures/` directory
- [x] Ensure `examples/` directory exists

### Configuration Files
- [x] Create `vite.config.mjs` with proper entry point
- [ ] Create `.eslintrc.js` with project rules
- [ ] Create `.prettierrc` with formatting rules
- [ ] Create `jest.config.js` for test configuration
- [ ] Create `playwright.config.js` for e2e tests
- [x] Create `.gitignore` (node_modules, dist, coverage)

### Basic Application Shell
- [x] Create `index.html` with container div
- [x] Create `src/main.js` as entry point
- [ ] Add basic CSS reset/styles
- [x] Verify `npm run dev` starts without errors
- [x] Verify `npm run build` produces dist/ folder
- [x] Verify empty page loads in browser without console errors

### Documentation
- [ ] Create `docs/ARCHITECTURE.md` (can be minimal initially)
- [x] Update README.md with basic project description

---

## Phase 2: Schema Validation Layer

### Validator Implementation
- [x] Install ajv: `npm install ajv ajv-formats`
- [x] Create `src/validation/SchemaValidator.js`
- [x] Implement `validateGraph(json)` method
- [x] Precompile schema from `avflowview-wiring.schema.json`
- [x] Add JSON Schema 2020-12 support
- [x] Implement error formatting with JSON paths

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
- [x] Create `src/converters/AVToELKConverter.js`
- [x] Implement node mapping (AV Node → ELK LNode)
- [x] Implement area mapping (AV Area → ELK container LNode)
- [x] Implement port mapping (AV Port → ELK LPort)
- [x] Implement edge mapping (AV Edge → ELK LEdge)
- [x] Handle layout direction (LR vs TB)
- [x] Set ELK options (orthogonal routing, spacing)
- [x] Handle nested areas via parent hierarchy

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

## (Phase 4+ unchanged)
