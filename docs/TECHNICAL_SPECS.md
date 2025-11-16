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

## Renderer Integration (d3-hwschematic)

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

## See also

- Error formats, peer dependencies and validation/performance targets are unchanged, see the rest of this file.

---

