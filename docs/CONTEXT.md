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

- **d3-hwschematic integration**: The project leverages d3.js and ELK graph layouts for interactive hardware schematic visualization.
- **Scalable graphics**: SVG-based rendering enables smooth zoom and pan from system overview to individual port details.
- **Custom renderers**: Device, area, and edge renderers provide specialized visualization for AV system components.
- **Interactive hardware schematics**: Users can navigate complex AV system topologies with responsive, real-time interactions.

## Interaction Model

- **Map-like navigation**: Users can zoom and pan smoothly from an overview down to port-level details.
- **Selection & details**: Clicking a device or cable highlights it and reveals detailed information (metadata, ports, connected elements).
- **Focus/context**: Given a selected device or cable, the user can highlight the neighborhood within N steps (e.g. 12 hops) and fade out the rest for clarity.
- **Search & filters**: Users can search for devices or cables and filter by category, status, or area to reduce visual noise in large systems.

## Data Validation & Reliability

- **Schema-based validation**: All incoming data is validated against `av-wiring-graph.schema.json` before rendering.
- **Early error detection**: Missing nodes/ports, invalid references, or wrong enums should be reported clearly instead of silently producing misleading visuals.
- **Single source of truth**: The same JSON used for visualization can be reused in other tools (reports, inventories, configuration), while AVFlowView-3d remains focused on visualization.

## Design Goals for Implementation

- **Automation-friendly**: Designed so that external tools or agents can generate or modify graphs and immediately see the impact visually.
- **Predictable layouts**: Similar systems should produce similar-looking diagrams; layout rules should be deterministic for given input.
- **Extensibility**: New device types, categories, and renderers should be addable without rewriting the core.
- **Performance-conscious**: Should handle realistically sized AV systems (dozens to hundreds of devices and cables) with acceptable performance.

*Last updated: 2025-11-16*