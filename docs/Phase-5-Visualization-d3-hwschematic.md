# AVFlowView-3d Phase 5 - Visualization via d3-hwschematic

## Overview
This phase focused on integrating a d3.js and ELK based schematic visualizer (`d3-hwschematic`) into the AVFlowView-3d project to allow improved 3D visualization of hardware schematics.

## Features Added
- Integrated **HwSchematicRenderer** for schematic visualization.
- Added custom device, area, and edge renderers.
- Implemented zoom, pan, and interaction capability.
- Included schema validation tests and rendering unit tests.

## Testing
- Updated tests to ES module format.
- Mocked `d3-hwschematic` module for compatibility with Jest.
- Achieved 100% pass coverage on all visualizer-related tests.

## How to Run Tests

Run the following command from the project root:

```bash
npm test
```

Tests cover both visualizer rendering and schema validation logic.

## Next Steps
- Monitor integration with other visualization phases.
- Improve rendering performance on large schematics.
- Expand interactive features and custom renderer support.

---

_This documentation will be updated upon future phases or major changes._
