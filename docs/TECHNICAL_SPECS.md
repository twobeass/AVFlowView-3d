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

| Layout | Alignment     | Port Side |
| ------ | ------------- | --------- |
| LR     | In            | WEST      |
| LR     | Out           | EAST      |
| LR     | Bidirectional | auto\*    |
| TB     | In            | NORTH     |
| TB     | Out           | SOUTH     |
| TB     | Bidirectional | auto\*    |

\*For Bidirectional: Use PortDirectionResolver to assign side by majority edge direction. If even, default to In-side for predictability.

## Custom D3 Renderer with Orthogonal Edge Routing - Phase 5 Complete

### Visualization Architecture

**Core Rendering:**

- Custom D3-based renderer with no external schematic library dependencies
- Integrated with d3.js ^7.8.5 for SVG manipulation and interactions
- Uses ELK.js ^0.9.0 for automatic graph layout computation
- Professional Manhattan-style edge routing with obstacle avoidance

**Renderer Components:**

- `HwSchematicRenderer` - Main renderer class managing SVG container, zoom/pan, and rendering pipeline
- `OrthogonalRouter` - Custom edge routing utility with parallel edge separation
- Device, area, and edge rendering with category-based styling
- Port-side aware routing (WEST/EAST/NORTH/SOUTH)

**Custom Renderers (in `src/renderers/`):**

- Shape SVG as `<g class='device-node'>...</g>` with `<rect>`, category colors, labels, and ports
- SVG IDs must be stable and computed as `nodeId` or `areaId` for proper focus
- Event handling via `d3.select` and attached listeners

### Orthogonal Edge Routing Algorithm

**Location:** `src/utils/OrthogonalRouter.js`

**Core Functions:**

1. **`calculateOrthogonalPath(source, target, obstacles, offset)`**
   - Generates SVG path data for orthogonal connections
   - Input: Source/target positions with port sides, obstacle array, perpendicular offset
   - Output: SVG path string (e.g., `"M 10 20 L 50 20 L 50 80 L 90 80"`)
   - Routing strategies: L-shape (2 segments), Z-shape (3 segments), complex multi-segment

2. **`calculateEdgeOffset(edgeIndex, totalEdges, separation)`**
   - Calculates perpendicular offset for parallel edge separation
   - Algorithm: `offset = (edgeIndex - (totalEdges - 1) / 2) * separation`
   - Default separation: 10 pixels between parallel edges

3. **`collectObstacles(nodes, parentOffset)`**
   - Recursively collects device bounding boxes for collision detection
   - Adds 20px padding around each device for clearance
   - Returns absolute coordinates in SVG space

4. **`groupEdgesByEndpoints(edges)`**
   - Groups edges by source-target pairs to detect parallel connections
   - Returns Map<"source_target" → [edgeIndices]>

**Routing Strategies:**

| Port Sides             | Strategy | Segments | Description                                                   |
| ---------------------- | -------- | -------- | ------------------------------------------------------------- |
| EAST-WEST (horizontal) | Z-shape  | 5        | Horizontal extension → vertical middle → horizontal to target |
| NORTH-SOUTH (vertical) | Z-shape  | 5        | Vertical extension → horizontal middle → vertical to target   |
| Mixed orientation      | L-shape  | 4        | Extension from source → turn → extension to target            |
| Direct (aligned)       | Straight | 1        | Direct connection when ports align                            |

**Configuration Parameters:**

- **Edge Separation:** 10px (default) - Distance between parallel edges
- **Port Extension:** 40px - Distance to extend from port before first turn
- **Obstacle Padding:** 20px - Clearance around device bounding boxes

**Coordinate System:**

- All routing in global SVG coordinates
- Port positions calculated with absolute offsets from nested containers
- ELK-provided bend points preserved when available
- Offset applied perpendicular to routing direction (Y for horizontal, X for vertical)

**Obstacle Avoidance:**

- Basic detection with 40px extension from ports
- Checks for line-rectangle intersections
- Relies on port extensions to route around most obstacles
- Future enhancement: A\* pathfinding for complex scenarios

**Performance:**

- Routing time: <1ms per edge (negligible)
- Obstacle collection: O(n) where n = number of devices
- Edge grouping: O(e) where e = number of edges
- Tested with 100+ edges without performance issues

**Test Harness with Jest:**

- Jest ^29.7.0 configured for ES module support (`node --experimental-vm-modules`)
- `jest-environment-jsdom` for DOM/SVG testing environment
- All 79 tests passing with comprehensive renderer coverage
- Unit tests needed for OrthogonalRouter utility (TODO)

**Performance Considerations:**

- SVG-based rendering enables smooth zoom from 0.1x to 10x scale
- d3-zoom integrated for responsive pan and zoom interactions
- Custom renderers optimized for large schematic visualization
- Parallel edge separation improves visual clarity without performance cost

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
│   ├── ExampleLoader.js       # Example graph loader
│   └── OrthogonalRouter.js    # Custom orthogonal edge routing with separation
├── validation/
│   └── SchemaValidator.js     # JSON schema validation
└── styles/
    ├── main.css               # Base styles
    └── controls.css           # Controls panel styles
```

## See also

- Error formats, peer dependencies and validation/performance targets are unchanged, see the rest of this file.

---

_Last updated: 2025-11-16 (Phase 5 UI Controls Panel completion)_
