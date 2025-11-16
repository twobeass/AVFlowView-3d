# AVFlowView-3d Requirements

This document captures the non-negotiable requirements and key design decisions for AVFlowView-3d.
It is intended as a quick reference for both human developers and autonomous coding agents.

## 1. Scope and Goal

- Build a web-based viewer that renders AV wiring systems as interactive diagrams using **D3.js** and **d3-hwschematic**.
- The viewer must consume JSON conforming to the `av-wiring-graph` schema (see `avflowview-wiring.schema.json` and `src/schemas/av-wiring-graph.schema.json`).
- The main output is an SVG (or SVG-like) schematic with devices, ports, cables, and area containers laid out automatically.

## 2. Input Data Model (Contract)

- Input JSON **must** validate against `av-wiring-graph.schema.json`.
- The schema includes:
  - `layout`: direction (LR/TB), portBinding (auto/exact), areaFirst, areaPadding.
  - `areas`: containers without ports, identified by `id`, optional `parentId`.
  - `nodes`: devices with `id`, `manufacturer`, `model`, `category`, `status`, `label`, `areaId`, `ports`.
  - `ports`: per-node object keyed by local port IDs, each with `alignment`, `label`, `type`, `gender`, `metadata`.
  - `edges`: cables with `id`, `wireId`, `category`, `cableType`, `label`, `source`, `target`, optional `sourcePortKey`/`targetPortKey`, `binding`, `metadata`.
- Any implementation must treat this schema as the single source of truth for data shape.

## 3. Technology Choices

- Rendering:
  - **D3.js** for low-level SVG and interaction primitives.
  - **d3-hwschematic** as the schematic layout and rendering core built on ELK.
  - **ELK.js** for layered graph layout and orthogonal edge routing.
- Tooling:
  - Modern bundler (Vite) and ES modules.
  - Testing with Jest (unit) and Playwright or similar (integration) is recommended.
- No hard dependency on a specific UI framework is required; a minimal vanilla JS UI shell is acceptable.

## 4. Functional Requirements

- Parse and validate AV graph JSON; surface validation errors clearly.
- Convert AV nodes/areas/ports/edges into ELK JSON suitable for d3-hwschematic.
- Auto-layout devices left-to-right or top-to-bottom depending on `layout.direction`.
- Draw area containers around devices belonging to each area, respecting nesting via `parentId`.
- Place input ports on the upstream side and output ports on the downstream side; resolve bidirectional ports contextually.
- Route cables as orthogonal lines with smooth bends, avoiding device overlaps where possible.
- Apply a centralized color scheme by category for nodes and edges (audio, video, network, control, power, etc.).
- Provide zoom and pan interactions, selection, focus/context highlighting, and basic search/filtering.

## 5. Non-Functional Requirements

- **Deterministic layout** for a given input and configuration.
- **Performance**: Handle at least mid-sized systems (e.g. 100+ nodes, 300+ edges) without freezing.
- **Resilience**: Graceful handling of partial or imperfect data (e.g. unknown categories) while still enforcing schema for core structure.
- **Extensibility**: New node renderers and style rules can be added without changing core conversion logic.

## 6. Documents and Files

- `docs/AVFlowView-3d-plan.md`: Detailed phased implementation plan (this is the roadmap).
- `docs/CONTEXT.md`: Narrative description of purpose, concepts, and visual style.
- `avflowview-wiring.schema.json`: Schema file at repo root for quick reference.
- `src/schemas/av-wiring-graph.schema.json`: Schema used at runtime for validation.
- Additional docs like `docs/ARCHITECTURE.md` and integration tests should be added as the implementation progresses.

## 7. Out of Scope (for now)

- Full-featured editing of graphs (adding/removing devices and cables in the UI).
- Persisting edits back to a back-end or configuration database.
- Complex hyper-edge modeling beyond simple point-to-point connections.
- Rich theming/theming editor beyond the central category color scheme.
