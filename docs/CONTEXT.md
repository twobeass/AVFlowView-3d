# AVFlowView-3d Context

This document summarizes the purpose, concepts, and visual/design intentions behind AVFlowView-3d in a concise, implementation-oriented way.

## Purpose

AVFlowView-3d is a data-driven "map" for audio-visual systems that turns a structured JSON description of areas, devices, ports, and cables into an interactive wiring diagram.
It focuses on three aspects at once: neat arrangement of devices, readable cable routing, and clear visual language via color, grouping, and highlighting.

## Core Concepts

- **Structured input**: The source of truth is a JSON object following `av-wiring-graph.schema.json`, describing:
  - Layout preferences (flow direction, port binding behavior, area-first layout)
  - Areas (rooms, racks, zones, buildings, etc.)
  - Devices (manufacturer, model, category, status, label, area assignment)
  - Ports (alignment/direction, label, type, gender, metadata)
  - Edges/cables (wire ID, category, cable type, label, endpoints, binding, metadata)
- **Separation of concerns**: The schema captures system structure; AVFlowView-3d is strictly a viewer/renderer.
- **Repeatability**: Diagrams are fully reproducible from JSON; no manual dragging is required for a readable result.

## Layout & Visual Style

- **Flow direction**: Devices are arranged left-to-right (LR) or top-to-bottom (TB) so signal paths read like a story from source to destination.
- **Port placement**: Inputs are typically on the "upstream" side (e.g. WEST for LR), outputs on the "downstream" side (EAST for LR), with bidirectional ports resolved based on context.
- **Orthogonal routing**: Cables are drawn as right-angled paths with smooth corners and are routed around devices whenever possible.
- **Areas as containers**: Areas (rooms, racks, zones) are drawn as background containers grouping devices, conveying both physical/logical location and connectivity.
- **Color language**: Nodes and cables are color-coded by category (e.g. audio, video, network, control, power) using a centralized style definition.
- **Engineering style**: The overall look is closer to a clean engineering drawing than to a freehand sketch: wide boxes, aligned ports, minimal diagonals.

## Schematic Visualization (Phase 5)

- **Custom D3-based rendering**: The project leverages d3.js and ELK graph layouts for interactive hardware schematic visualization with no external schematic library dependencies.
- **Professional orthogonal routing**: Custom Manhattan-style edge routing with parallel edge separation prevents visual stacking and improves readability.
- **Obstacle avoidance**: Intelligent edge routing around device bounding boxes for clean cable paths.
- **Scalable graphics**: SVG-based rendering enables smooth zoom and pan from system overview to individual port details.
- **Custom renderers**: Device, area, and edge renderers provide specialized visualization for AV system components.
- **Interactive hardware schematics**: Users can navigate complex AV system topologies with responsive, real-time interactions.
- **Automatic layout**: ELK.js computes optimal device positioning with orthogonal cable routing, eliminating manual placement.
- **Professional controls**: Fixed-position controls panel with dark engineering aesthetic provides intuitive access to zoom, layout, and example selection.

## Interaction Model

### Current Implementation (Phase 5)

- **Map-like navigation**: Users can zoom (0.1x to 10x) and pan smoothly from an overview down to port-level details.
  - Zoom in/out with smooth 300ms animations
  - Reset to default view
  - Auto-fit content to viewport
- **Layout switching**: Toggle between Left-to-Right and Top-to-Bottom signal flow with automatic re-layout.
- **Example exploration**: Load different example graphs (simple, medium, complex) from dropdown selector.
- **Professional UI**: Fixed-position controls panel (top-right) with:
  - Zoom controls (+, -, Reset)
  - Layout direction toggle
  - Example selector
  - Accessible ARIA labels
  - Engineering aesthetic (dark theme, monospace font)

### Planned Interactions (Phase 6)

- **Selection & details**: Clicking a device or cable highlights it and reveals detailed information (metadata, ports, connected elements).
- **Focus/context**: Given a selected device or cable, the user can highlight the neighborhood within N steps (e.g. 1–3 hops) and fade out the rest for clarity.
- **Search & filters**: Users can search for devices or cables and filter by category, status, or area to reduce visual noise in large systems.
- **Keyboard navigation**: Full keyboard support for accessibility and power users.

## Data Validation & Reliability

- **Schema-based validation**: All incoming data is validated against `av-wiring-graph.schema.json` before rendering.
- **Early error detection**: Missing nodes/ports, invalid references, or wrong enums should be reported clearly instead of silently producing misleading visuals.
- **Single source of truth**: The same JSON used for visualization can be reused in other tools (reports, inventories, configuration), while AVFlowView-3d remains focused on visualization.
- **Graceful degradation**: The system handles missing examples and validation errors without crashing, providing clear console feedback.

## Design Goals for Implementation

- **Automation-friendly**: Designed so that external tools or agents can generate or modify graphs and immediately see the impact visually.
- **Predictable layouts**: Similar systems should produce similar-looking diagrams; layout rules should be deterministic for given input.
- **Extensibility**: New device types, categories, and renderers should be addable without rewriting the core.
- **Performance-conscious**: Should handle realistically sized AV systems (dozens to hundreds of devices and cables) with acceptable performance.
- **Progressive enhancement**: Core functionality works immediately; advanced features (search, focus/context) layer on top without disrupting basic usage.

## Technical Pipeline (Phase 5)

The complete data flow from JSON to interactive visualization:

```
JSON Input
    ↓
SchemaValidator (validation)
    ↓
AVToELKConverter (transformation)
    ↓
CategoryStyler (styling)
    ↓
PortDirectionResolver (semantics)
    ↓
ELK Layout Engine (positioning)
    ↓
HwSchematicRenderer (rendering)
    ↓
Interactive Canvas + Controls
```

**Key Components:**

- **AVFlowView3dApp**: Main orchestrator managing the entire pipeline
- **ControlsPanel**: UI component for user interactions
- **ExampleLoader**: Utility for loading and managing example graphs
- **HwSchematicRenderer**: SVG rendering with zoom/pan via d3-zoom
- **Custom Renderers**: DeviceRenderer, AreaRenderer, EdgeRenderer

## User Experience Priorities

1. **Immediate utility**: Load an example and see a working diagram within 1 second
2. **Clear visual language**: Category colors and status indicators instantly convey system topology
3. **Smooth interactions**: 60fps zoom/pan animations provide responsive feel
4. **No surprises**: Validation errors are clear; controls behave predictably
5. **Professional appearance**: Engineering aesthetic suitable for client presentations and technical documentation

_Last updated: 2025-11-16 (Phase 5 UI Controls Panel completion)_
