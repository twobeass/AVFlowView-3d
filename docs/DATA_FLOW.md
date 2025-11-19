# Data Flow in AVFlowView-3d

## 1. Ingestion/Validation Sequence

- **User/Input:** Loads AV-wiring JSON via `load()`.
- **SchemaValidator:** Checks and flags errors; if fail, error object returned.
- **Transformer:** Valid AV JSON is converted to ELK JSON.
- **Styler:** ELK nodes/edges are decorated with category, status, and class assignments.
- **ELK Layout:** ELK.js computes positions with automatic orthogonal routing.
- **Renderer:** Custom D3-based HwSchematicRenderer renders SVG with OrthogonalRouter for edge paths.
- **Interaction Layer:** Listeners/hooks are attached for select, focus, search.

## 2. User Interaction/Update Flow

- **Interaction:** User clicks/selects/searches an element, or sets a new focus via UI or API.
- **FocusManager:** Computes neighborhood, updates highlight/focus state.
- **Renderer:** Redraws/fades/updates SVG as per current state.

## 3. Error and Event Propagation

- All stages return `{ success: false, error: {...} }` on failure.
- All critical transitions fire an event (e.g. `onGraphLoaded`, `onValidationError`, ...).

## 4. Example Sequence Diagram

```txt
Input JSON (user/file)
  ↓
SchemaValidator.validateGraph()
  ↓ (if valid)
AVToELKConverter.convert()
  ↓
CategoryStyler/PortDirectionResolver
  ↓
ELK.js layout() - computes positions
  ↓
HwSchematicRenderer.render()
  ├─ Device/Area rendering (D3.js)
  ├─ OrthogonalRouter.calculateOrthogonalPath()
  │   ├─ groupEdgesByEndpoints() - detect parallel edges
  │   ├─ calculateEdgeOffset() - compute separation
  │   ├─ collectObstacles() - get device bounding boxes
  │   └─ Generate orthogonal SVG path data
  └─ Edge rendering with parallel separation
  ↓
UI event handler registration
  ↓
User interaction (zoom/pan/layout toggle)
  ↓
FocusManager/SearchManager (Phase 6)
  ↓
HwSchematicRenderer re-render with updated state
```

## 5. File/Data Boundaries

- Only JSON input/output (see avflowview-wiring.schema.json for format)
- ELK objects/edges enriched with `hwMeta`/`cssClass` (see TECHNICAL_SPECS.md)
- No state leaks or global mutations allowed
