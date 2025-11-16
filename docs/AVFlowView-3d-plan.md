# AVFlowView-3d Autonomous Implementation Plan

This document is the detailed roadmap for an autonomous coding agent to implement **AVFlowView-3d**, a D3.js + d3-hwschematic based viewer for A/V wiring graphs driven by the `av-wiring-graph` JSON schema.

---

## 1. Project Overview

AVFlowView-3d turns structured JSON descriptions of areas, devices, ports, and cables into an interactive, auto-layouted wiring diagram using d3-hwschematic and ELK.js.
The agent must consume JSON conforming to `av-wiring-graph.schema.json`, validate it, convert it into ELK JSON, and render a clear left-to-right or top-to-bottom signal-flow diagram with areas, port directions, category colors, and focus/context highlighting.

---

## 2. Phased Implementation

The implementation is split into phases; phases run sequentially, tasks inside a phase may run in parallel when dependencies allow.

### Phase 1: Project Setup & Architecture

**Goals:** Repository structure, tooling, and basic docs.

**Tasks:**
- Initialize Node project (npm init), add core deps: `d3`, `d3-hwschematic`, `elkjs`, bundler (Vite), test libs (Jest, Playwright), linter.
- Create base structure:
  - `src/` (code)
  - `src/converters/`, `src/renderers/`, `src/validation/`, `src/utils/`, `src/ui/`
  - `src/schemas/av-wiring-graph.schema.json` (copied from root schema)
- Set up Vite config, ESLint + Prettier, basic `index.html` and `main.js` entry.
- Document high-level architecture in `docs/ARCHITECTURE.md` later.

**Exit criteria:** Project builds with `npm run dev` and `npm run build`; empty but functional shell page loads.

---

### Phase 2: Schema Validation Layer

**Goals:** Reliable validation of input data against the AV wiring schema.

**Tasks:**
- Add `ajv` for JSON Schema 2020-12 validation.
- Implement `SchemaValidator` module:
  - `validateGraph(json: unknown): { valid: boolean; errors?: AjvError[] }`.
  - Precompile schema from `src/schemas/av-wiring-graph.schema.json`.
- Add unit tests with valid and invalid sample graphs.
- Add developer-friendly error formatting (paths + messages) to use in the UI.

**Exit criteria:** Invalid graphs are rejected with clear messages; tests cover typical error cases (missing nodes, broken references, wrong enums).

---

### Phase 3: Data Transformation (AV → ELK)

**Goals:** Convert AV graph JSON into ELK JSON compatible with d3-hwschematic.

**Core module:** `AVToELKConverter`.

**Tasks:**
1. **Node mapping**
   - Map each AV `Node` to an ELK `LNode` with:
     - `id`: node id
     - `hwMeta.name`: human label or `${manufacturer} ${model}`
     - `hwMeta.cls`: category / subcategory
     - `hwMeta.cssClass` / `cssStyle`: from styling module.
   - For nodes assigned to an area, the parent will be the area container node.

2. **Area mapping**
   - Represent each AV `Area` as a container `LNode` without ports.
   - Use hierarchy for nested areas via `parentId`.
   - Optionally use `_children`/`_edges` for collapsed areas.

3. **Port mapping**
   - For each entry in `node.ports`:
     - Create an `LPort` with side and index computed from alignment and layout direction.
     - Map `alignment` `In`/`Out`/`Bidirectional` → ELK port direction and side; default: inputs on WEST, outputs on EAST (for LR layout).

4. **Edge mapping**
   - Map each AV `Edge` to an ELK `LEdge`:
     - Resolve `source`, `target` node IDs.
     - Resolve `sourcePortKey`, `targetPortKey` to specific LPort IDs when present.
     - Store wire meta in `hwMeta` (label, wireId, category, cableType).
   - Support hyper-edge modeling later if needed, starting with simple edges.

5. **Layout options**
   - Map `layout.direction` LR/TB to ELK options (layered algorithm).
   - Set `org.eclipse.elk.layered.edgeRouting = ORTHOGONAL`.
   - Configure spacing for edge-node and edge-edge distances.

**Exit criteria:** Sample AV JSON converts into valid ELK JSON; d3-hwschematic can render it without runtime errors.

---

### Phase 4: Styling & Semantics

**Goals:** Encapsulate category/status-based visuals and bidirectional port semantics.

**Modules:** `CategoryStyler`, `PortDirectionResolver`.

**Tasks:**
1. **CategoryStyler**
   - Define a fixed palette for categories:
     - Audio, Video, Network, Control, Power, Default.
   - Expose:
     - `getNodeStyle(category, status)` → `{ cssClass, cssStyle }`.
     - `getEdgeStyle(category)` → `{ cssClass, cssStyle }`.
   - Make status (Existing/Regular/Defect) map to border styles or alpha.

2. **PortDirectionResolver**
   - For `Bidirectional` ports, inspect all edges connected to the node.
   - Infer practical direction (in vs out) by context and majority flow.
   - Assign port side accordingly for cleaner layouts.

**Exit criteria:** Nodes and edges are consistently styled by category & status; bidirectional ports are placed sensibly by default.

---

### Phase 5: Visualization via d3-hwschematic ✅ COMPLETED

**Goals:** Implement custom renderers for devices, areas, and cables, and integrate zoom/pan.

**Status:** Phase 5 completed on 2025-11-16. Added HwSchematicRenderer for interactive hardware schematic visualization with custom device, area, and edge renderers. Integrated zoom, pan and comprehensive testing including Jest ES module support.

**Completed Tasks:**
1. **HwSchematic initialization**
   - ✅ Instantiated HwSchematic with container SVG
   - ✅ Configured zoom and pan behavior
   - ✅ Handled d3-hwschematic module exports correctly

2. **Device renderer**
   - ✅ Implemented DeviceRenderer as a method
   - ✅ Draws rectangular box with device metadata
   - ✅ Renders device name and category information

3. **Area renderer**
   - ✅ Implemented AreaRenderer as a method
   - ✅ Draws container rectangles for areas
   - ✅ Shows area labels

4. **Cable edges**
   - ✅ Implemented EdgeRenderer as a method
   - ✅ Renders edges with category colors
   - ✅ Supports cable type patterns

5. **Zoom & pan**
   - ✅ Implemented d3-zoom on SVG container
   - ✅ Configured scale extents (0.1 to 10)

6. **Testing**
   - ✅ Resolved Jest ESM module import issues
   - ✅ Implemented async mocking with jest.unstable_mockModule
   - ✅ Fixed JSDOM compatibility (SVGGElement testing)
   - ✅ All renderer tests passing (79 total tests)

**Exit criteria met:** Example graph renders with devices, areas, ports, and cables; zoom/pan works smoothly; all tests pass.

---

### Phase 6: Interaction & Focus/Context

**Goals:** Implement selection, neighbor highlighting, search, and filters.

**Modules:** `FocusManager`, `SearchManager`.

**Tasks:**
1. **Selection**
   - Click on a node or edge → mark as selected.
   - Show details in an info panel (label, category, ports, connected edges).

2. **Focus/context**
   - Given a starting node/edge and distance N, compute all nodes and edges within N hops.
   - Highlight focused elements; fade others (reduced opacity/desaturation).
   - Provide a UI control to adjust distance (1–3).

3. **Search & filter**
   - Text search over node labels, manufacturer, model, and edge labels/wireId.
   - Filters by category, status, area.
   - Clicking a result focuses/centers that element.

**Exit criteria:** User can click to see local neighborhood, adjust focus distance, and find elements by text or filters.

---

### Phase 7: Application Shell & API

**Goals:** Provide a simple app shell and a programmatic API for embedding.

**Main class:** `AVFlowView3dApp`.

**Tasks:**
- Initialize:
  - Accept DOM container and optional config.
  - Wire up SchemaValidator → AVToELKConverter → CategoryStyler → d3-hwschematic.
- Public methods:
  - `load(graphJson)` – validate, transform, render.
  - `update(graphJson)` – re-render (with future incremental diffing).
  - `setFocus(nodeIdOrEdgeId, distance)` – programmatic focus.
  - `export(type: 'svg' | 'png')` – export diagram.
- Hook up basic controls panel around the canvas.

**Exit criteria:** A minimal HTML page can instantiate `AVFlowView3dApp` and show a working diagram from a sample JSON.

---

### Phase 8: Testing, Docs & Polish

**Goals:** Make the project robust, documented, and ready for others (or other agents) to extend.

**Tasks:**
- Unit tests for:
  - SchemaValidator, AVToELKConverter, CategoryStyler, PortDirectionResolver, FocusManager.
- Integration tests with Playwright or similar:
  - Load example graphs, click nodes, adjust focus, run search.
- Documentation:
  - Expand `README.md` with quick start and screenshots.
  - `docs/CONTEXT.md` (high-level narrative) and `docs/ARCHITECTURE.md` (components & data flow).
  - `src/notes/requirements.md` (see that file) for non-negotiable constraints.
- Performance tuning for medium/large graphs.

**Exit criteria:** CI passes, examples work in major browsers, and docs are sufficient for another agent or human to continue development.