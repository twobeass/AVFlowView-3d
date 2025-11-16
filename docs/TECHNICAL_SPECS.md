# Technical Specifications

This document defines the technical requirements, constraints, and targets for AVFlowView-3d.

## ELK.js Configuration Reference

The following ELK options must be used for graph layout:

```js
{
  algorithm: 'layered',
  'elk.direction': 'RIGHT', // or 'DOWN' for TB
  'elk.spacing.nodeNode': 80,
  'elk.spacing.edgeNode': 40,
  'elk.spacing.edgeEdge': 20,
  'elk.layered.spacing.edgeNodeBetweenLayers': 40,
  'elk.layered.edgeRouting': 'ORTHOGONAL',
  'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX'
}
```
- Set `elk.direction` to 'RIGHT' for Left-to-Right (LR) layouts, 'DOWN' for Top-to-Bottom (TB).
- Always set `edgeRouting` to 'ORTHOGONAL'.
- Tune spacing for node/edge collision avoidance as above.

## Port Side Mapping Table

| Layout | Alignment      | Port Side   |
|--------|---------------|-------------|
| LR     | In            | WEST        |
| LR     | Out           | EAST        |
| LR     | Bidirectional | auto*       |
| TB     | In            | NORTH       |
| TB     | Out           | SOUTH       |
| TB     | Bidirectional | auto*       |

*For Bidirectional: Use PortDirectionResolver to assign side by majority edge direction. If even, default to In-side for predictability.

## Renderer Integration (d3-hwschematic) - Phase 5 Complete

For AVFlowView-3d:
- Every ELK node object must have a `hwMeta` property:
  - `{ name, cls, cssClass, status }` where `name` is label, `cls` is (sub)category, `status` is one of Existing/Regular/Defect.
- Register with:

```js
HwSchematic.registerNodeRenderer('Device', DeviceRenderer);
HwSchematic.registerNodeRenderer('Area', AreaRenderer);
HwSchematic.registerEdgeRenderer('Cable', EdgeRenderer);
```
- Custom renderers (in `src/renderers/`) must shape SVG:
  - `<g class='device-node'>...</g>` with a `<rect>`, category color bar, label and ports as children.
- SVG IDs must be stable and computed as `nodeId` or `areaId` for proper focus.
- For event-handling:
  - Attach listeners using `d3.select` or via renderer entrypoints as needed.
- If `d3-hwschematic` API changes, immediately fork to `src/vendor/d3-hwschematic/` and update documentation/usage accordingly.

### Phase 5 Implementation Details

**d3-hwschematic as Key Visualization Dependency:**
- Added `d3-hwschematic ^0.1.0` as a core visualization library
- Integrated with d3.js ^7.8.5 for SVG manipulation and interactions
- Uses ELK.js ^0.9.0 for graph layout computation

**Renderer Components:**
- `HwSchematicRenderer` - Main renderer class managing SVG container, zoom/pan, and schematic initialization
- `DeviceRenderer` - Custom device node rendering with boxes, labels, and ports
- `AreaRenderer` - Area container rendering for grouping devices
- `EdgeRenderer` - Cable/edge rendering with category colors and patterns

**Test Harness with Jest:**
- Jest ^29.7.0 configured for ES module support (`node --experimental-vm-modules`)
- `jest-environment-jsdom` for DOM/SVG testing environment
- Async mocking strategy using `jest.unstable_mockModule` for d3-hwschematic
- Dynamic imports to support ESM test patterns
- JSDOM compatibility fixes (e.g., tagName checks instead of SVGGElement instanceof)

**Performance Considerations:**
- SVG-based rendering enables smooth zoom from 0.1x to 10x scale
- d3-zoom integrated for responsive pan and zoom interactions
- Custom renderers optimized for large schematic visualization
- All 79 tests passing with comprehensive renderer coverage

## UI Controls Specifications (Phase 5)

**ControlsPanel Component:**
- Fixed position: top-right corner (20px from edges)
- Dark engineering aesthetic:
  - Background: #1e1e1e
  - Border: #444 (1px solid)
  - Text: #cccccc
  - Font: Consolas, Monaco (monospace)
  - Z-index: 1000
- Dimensions: 220px width, auto height
- Sections:
  1. Zoom controls (3 buttons)
  2. Layout direction (select dropdown)
  3. Example selector (select dropdown)

**Button Styling:**
- Background: #282828
- Border: #555 (1px solid)
- Padding: 6px 10px
- Border radius: 3px
- Hover state: #3a3a3a background
- Active state: #555 background
- Font weight: bold
- Font size: 13px
- Transition: 0.2s ease

**Accessibility:**
- All buttons have `aria-label` attributes
- All select elements have `aria-label` attributes
- Keyboard navigable (tab order)
- Clear visual focus indicators

**Responsive Design:**
- Mobile (<480px): 90% width, centered (5% margins)
- Maintains functionality on all screen sizes

## Zoom Control Specifications

**Zoom Methods:**
- `zoomIn()`: Multiply scale by 1.3 (30% increase)
- `zoomOut()`: Divide scale by 1.3 (30% decrease)
- `resetZoom()`: Return to identity transform (1.0 scale, 0,0 translation)
- `fitToView()`: Auto-scale to fit content with 50px padding

**Zoom Constraints:**
- Minimum scale: 0.1x (10% of original)
- Maximum scale: 10x (1000% of original)
- Default scale: 1.0x (100%)

**Animation:**
- Duration: 300ms for zoom in/out
- Duration: 500ms for reset/fit-to-view
- Easing: d3 default (cubic)
- Center-based zooming maintains focal point

**Pan Behavior:**
- Free pan with mouse drag
- Constrained by zoom scale
- No boundaries (infinite canvas)

## Layout Direction Specifications

**Supported Directions:**
- LR (Left-to-Right): Signal flow from left to right
- TB (Top-to-Bottom): Signal flow from top to bottom

**Switching Behavior:**
- User selects direction from dropdown
- App triggers `changeLayout(direction)` callback
- Graph is re-converted with new direction
- ELK re-computes layout
- Renderer re-draws with new positions
- Auto-fit to view after layout

**ELK Direction Mapping:**
- LR → `elk.direction = 'RIGHT'`
- TB → `elk.direction = 'DOWN'`

## Example Loading Specifications

**ExampleLoader Class:**
```js
class ExampleLoader {
  constructor(basePath = '/examples/')
  async listExamples(): Promise<string[]>
  async loadExample(name: string): Promise<object>
}
```

**Available Examples:**
- `simple.json` - 5 devices, basic topology
- `medium.json` - ~10-15 devices, moderate complexity
- `complex.json` - 20+ devices, realistic AV system

**Loading Behavior:**
- Fetch from server using Fetch API
- Parse JSON
- Return graph object
- Throw error with HTTP status on failure
- Errors logged to console

**Error Handling:**
- Missing files: Clear error message with filename and status
- Invalid JSON: Parse error reported
- Validation errors: SchemaValidator error messages displayed
- App continues running after load failure

## Application Pipeline (Phase 5)

**Data Flow:**
```
1. User action (load example, toggle layout)
   ↓
2. AVFlowView3dApp method called
   ↓
3. SchemaValidator validates JSON
   ↓
4. AVToELKConverter transforms to ELK format
   ↓
5. CategoryStyler applies colors
   ↓
6. PortDirectionResolver assigns port sides
   ↓
7. ELK.layout() computes positions
   ↓
8. HwSchematicRenderer draws SVG
   ↓
9. fitToView() scales to viewport
   ↓
10. User sees interactive diagram
```

**Timing Targets:**
- Validation: <50ms for typical graph
- Conversion: <100ms for typical graph
- ELK layout: <500ms for typical graph
- Rendering: <200ms for typical graph
- Total load time: <1 second for simple examples

## Main Entry Point (src/main.js)

**Bootstrap Sequence:**
```js
1. Wait for DOMContentLoaded
2. Get #app container
3. Create AVFlowView3dApp instance
4. Create ExampleLoader instance
5. Load default example (simple.json)
6. Call app.load(graphData)
7. Handle errors gracefully
```

**Error Recovery:**
- Missing container: Log error, exit gracefully
- Failed example load: Log error, show empty canvas with controls
- Validation failure: Log error details, show empty canvas
- Layout failure: Log error, show last successful state

## Testing Requirements

**Unit Test Coverage:**
- SchemaValidator: 100% (36 tests)
- AVToELKConverter: 100% (25 tests)
- CategoryStyler: 100% (8 tests)
- PortDirectionResolver: 100% (10 tests)
- HwSchematicRenderer: Initialization (basic tests)
- Total: 79 tests passing

**Manual Testing Checklist:**
- [ ] Controls panel visible on load
- [ ] Default example loads and renders
- [ ] Zoom in button increases scale
- [ ] Zoom out button decreases scale
- [ ] Reset button returns to default view
- [ ] Layout toggle switches between LR/TB
- [ ] Example selector loads different graphs
- [ ] Pan works with mouse drag
- [ ] No console errors during normal operation

**Browser Compatibility:**
- Target: Modern evergreen browsers
- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- ES6+ features required
- SVG support required

## File Structure

```
src/
├── main.js                    # Entry point with bootstrap
├── AVFlowView3dApp.js         # Main orchestrator class
├── converters/
│   └── AVToELKConverter.js    # AV → ELK transformation
├── renderers/
│   ├── HwSchematicRenderer.js # Main SVG renderer
│   ├── DeviceRenderer.js      # Device node rendering
│   ├── AreaRenderer.js        # Area container rendering
│   └── EdgeRenderer.js        # Cable/edge rendering
├── styling/
│   ├── CategoryStyler.js      # Category color mapping
│   └── PortDirectionResolver.js # Port side assignment
├── ui/
│   └── ControlsPanel.js       # UI controls component
├── utils/
│   └── ExampleLoader.js       # Example graph loader
├── validation/
│   └── SchemaValidator.js     # JSON schema validation
└── styles/
    ├── main.css               # Base styles
    └── controls.css           # Controls panel styles
```

## See also

- Error formats, peer dependencies and validation/performance targets are unchanged, see the rest of this file.

---

*Last updated: 2025-11-16 (Phase 5 UI Controls Panel completion)*
