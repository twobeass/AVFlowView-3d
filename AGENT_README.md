# AVFlowView-3d: Autonomous Agent Implementation Guide

## Quick Start
1. Read this document completely (it contains ALL context)
2. Follow the implementation plan: docs/AVFlowView-3d-plan.md
3. Reference technical details: docs/CONTEXT.md
4. Validate against: avflowview-wiring.schema.json

## Project Goal
Build an interactive AV wiring diagram visualizer using D3.js and d3-hwschematic, driven by JSON schema.

## Technology Stack
- **Runtime**: Node.js >=18.0.0
- **Package Manager**: npm >=9.0.0
- **Bundler**: Vite ^5.0.0
- **Core Libraries**:
  - d3 ^7.8.5
  - d3-hwschematic ^0.1.x (check latest compatible version)
  - elkjs ^0.9.0
- **Validation**: ajv ^8.12.0 (JSON Schema 2020-12 support)
- **Testing**: Jest ^29.0.0, Playwright ^1.40.0
- **Code Quality**: ESLint ^8.0.0, Prettier ^3.0.0

## Required Reading Order
1. **This file (AGENT_README.md)** - Complete context and starting point
2. **docs/CONTEXT.md** - Design philosophy and visual intentions
3. **docs/AVFlowView-3d-plan.md** - Phase-by-phase implementation roadmap
4. **avflowview-wiring.schema.json** - Data structure contract
5. **docs/CHECKLIST.md** - Verifiable implementation tasks

## Architecture Overview
```
Input Layer: JSON validation (ajv + schema)
    ↓
Transformation Layer: AV JSON → ELK JSON converter
    ↓
Styling Layer: Category/status-based visual rules
    ↓
Rendering Layer: d3-hwschematic custom renderers
    ↓
Interaction Layer: Focus/context, search, filters
```

### Module Dependency Graph
```
SchemaValidator (no deps)
    ↓
AVToELKConverter (uses: CategoryStyler, PortDirectionResolver)
    ↓
d3-hwschematic (uses: elkjs, d3)
    ↓
Custom Renderers (DeviceRenderer, AreaRenderer, EdgeRenderer)
    ↓
FocusManager (uses: graph traversal utils)
```

## src/ Directory Template
```
src/
├── main.js                    # Entry point
├── AVFlowView3dApp.js         # Main application class
├── converters/
│   ├── AVToELKConverter.js
│   └── index.js
├── validation/
│   ├── SchemaValidator.js
│   └── index.js
├── styling/
│   ├── CategoryStyler.js
│   ├── PortDirectionResolver.js
│   └── index.js
├── renderers/
│   ├── DeviceRenderer.js
│   ├── AreaRenderer.js
│   ├── EdgeRenderer.js
│   └── index.js
├── interaction/
│   ├── FocusManager.js
│   ├── SearchManager.js
│   └── index.js
└── utils/
    ├── graph-traversal.js
    └── index.js
```

## Common Pitfalls (What Previous Agents Got Wrong)
1. Forgetting to handle nested areas – Must recursively process parentId chains
2. Hardcoding port positions – Must compute from alignment + layout direction
3. Ignoring bidirectional edge direction – Creates incorrect flow visualization
4. Not handling missing optional fields – Schema allows omission, code must have defaults

## Non-Negotiable Requirements
1. All input MUST validate against avflowview-wiring.schema.json
2. Layout MUST be deterministic (same input = same output)
3. Categories MUST use consistent colors:
   - Audio: #4A90E2
   - Video: #E24A6F
   - Network: #50C878
   - Control: #F5A623
   - Power: #D0021B
4. Orthogonal routing is required; fallback to direct lines only when routing fails
5. Areas MUST render as containers visually distinct from devices
6. Port sides MUST respect flow direction (LR: inputs WEST, outputs EAST; TB: inputs NORTH, outputs SOUTH)
7. Focus/context highlighting MUST support 1-3 hop distances

## Decision Points & Resolutions

### If d3-hwschematic API changes
- Vendor/fork the working version into `src/vendor/d3-hwschematic/`
- Document the exact version and reason for vendoring

### If ELK.js layout fails
- Implement fallback force-directed layout with d3-force
- Log warning to console with layout failure reason

### If schema validation fails
- Return detailed error object with JSON paths
- Never silently fail or produce incorrect visuals
- Format: `{ success: false, error: { code, message, details } }`

### If port binding is ambiguous
- Follow `binding="auto"` by default
- Resolve bidirectional ports by analyzing majority flow direction

## Success Metrics (Phase-Specific)

### Phase 1: Project Setup
- `npm run dev` starts dev server on localhost
- `npm run build` produces `dist/` folder
- No console errors on page load

### Phase 2: Schema Validation
- Jest tests pass with 100% coverage for SchemaValidator
- Invalid JSON rejected with <100ms response time
- Error messages include JSON path and clear description

### Phase 3: Data Transformation
- Sample graph converts without errors
- Output ELK JSON validates against d3-hwschematic requirements
- Conversion completes in <200ms for 50 nodes

### Phase 4: Styling & Semantics
- All categories render with correct colors
- Bidirectional ports placed logically based on flow
- Status (Existing/Regular/Defect) visually distinguishable

### Phase 5: Visualization
- Example renders in <2s for 50 nodes/100 edges
- Zoom and pan work smoothly (60fps)
- All elements visible and properly positioned

### Phase 6: Interaction & Focus
- Search returns results in <200ms
- Focus highlighting updates in <100ms
- Keyboard navigation works for all interactive elements

### Phase 8: Testing & Polish
- Test coverage ≥80% overall
- Lighthouse performance score ≥85
- No accessibility violations in automated tests

## Example Data Location
- `examples/simple.json` - 5 nodes, 4 edges (basic validation)
- `examples/medium.json` - 20 nodes, 30 edges, 2 areas (realistic system)
- `examples/complex.json` - 50+ nodes, 80+ edges, 5 nested areas (stress test)
- `examples/invalid-examples/` - One file per validation error type

## External References
- **Original AVFlowView**: https://github.com/twobeass/AVFlowView
- **d3-hwschematic**: https://github.com/Nic30/d3-hwschematic
- **ELK.js documentation**: https://eclipse.dev/elk/reference.html
- **D3.js documentation**: https://d3js.org/
- **JSON Schema 2020-12**: https://json-schema.org/draft/2020-12/json-schema-core.html

## Troubleshooting Common Issues

### Port placement looks wrong
- Check `PortDirectionResolver` logic in Phase 4
- Verify layout direction (LR vs TB) in input JSON
- Ensure port alignment matches expected side

### Cables overlap devices
- Verify ELK option `edgeRouting: "ORTHOGONAL"` is set in converter
- Check edge-node spacing configuration
- Increase node spacing if needed

### Colors inconsistent
- Ensure `CategoryStyler` is singleton pattern
- Verify styles are loaded before rendering
- Check console for CSS loading errors

### Focus not working
- Verify graph traversal in `FocusManager` handles bidirectional edges
- Check that edge direction metadata is correct
- Test with simpler graphs first

### Performance issues
- Profile with browser DevTools
- Check for memory leaks in event listeners
- Consider virtualizing large graphs (>200 nodes)

## Browser Support
- Chrome/Edge: >=90
- Firefox: >=88
- Safari: >=14
- No IE11 support required

## Performance Targets
- Initial render: <2s for 50 nodes
- Interaction response: <100ms
- Memory usage: <200MB for 200 nodes
- Search latency: <200ms

## Accessibility Requirements
- Keyboard navigation for all interactions
- ARIA labels on all interactive elements
- Color contrast ratio ≥4.5:1
- Screen reader support for node/edge descriptions

## Change Log
*Agent should update this section after completing each phase*

- 2025-11-16: Phase 1 project shell initialized (Vite, src structure, placeholders)
- 2025-11-16: Phase 2 schema validation foundation implemented (Ajv + cross-reference checks)
- 2025-11-16: Phase 3 data transformation foundation implemented (AVToELKConverter skeleton)
- 2025-11-16: Jest test infrastructure added (ESM support, jest.config.js, package.json updates)
- 2025-11-16: Phase 2 testing complete - SchemaValidator test suite with 50+ test cases covering all validation scenarios
- 2025-11-16: Phase 3 testing complete - AVToELKConverter test suite covering basic conversion, ports, layouts, edges, areas, and error handling
- 2025-11-16: CHECKLIST.md updated with completed Phase 2 and Phase 3 test tasks
