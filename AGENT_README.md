# AVFlowView-3d: Autonomous Agent Implementation Guide

## Quick Start
1. Read this document completely (it contains ALL context and maintenance info)
2. Follow the implementation plan: docs/AVFlowView-3d-plan.md
3. Reference technical details: docs/CONTEXT.md
4. Validate against: avflowview-wiring.schema.json

## Project Goal
Build an interactive AV wiring diagram visualizer using D3.js with custom orthogonal edge routing, driven by JSON schema.

## Technology Stack
- **Runtime**: Node.js >=18.0.0
- **Package Manager**: npm >=9.0.0
- **Bundler**: Vite ^5.0.0 (note: do NOT forcibly upgrade beyond 6.x unless tested)
- **Core Libraries**:
  - d3 ^7.8.5
  - elkjs ^0.9.0
  - **Custom OrthogonalRouter** - Professional Manhattan-style edge routing with parallel edge separation
- **Validation**: ajv ^8.12.0 (with ajv-formats^2.1.1, JSON Schema 2020-12 support)
- **Testing**: Jest ^29.7.0 (DO NOT downgrade; do NOT use v25 or v30)
- **Code Quality**: ESLint ^8.0.0+, Prettier ^3.0.0

## Dependency Management & Testing Tips
- **Jest v29+ is required for ESM, Node >=18, and the provided test suite/config.** Downgrading to older Jest (v25.x) will cause cryptic test failures.
- If you run `npm audit fix --force` and Jest breaks, restore with:
  ```bash
  npm install jest@^29.7.0 @types/jest@^29.5.0 jest-environment-jsdom@^29.7.0 --save-dev
  ```
- **Do not forcibly upgrade to Vite 7 or Jest 30+ unless all dev/test workflows are retested.** Breaking changes may not be fixable.
- Some test and build transitive dependencies are not up-to-date (e.g., `inflight`, `d3-color`, `rimraf`). This is normal in the current npm ecosystem but monitor regularly.

## Known Vulnerabilities
- **~~d3-hwschematic → d3 (<=6.7.0) → d3-color (<3.1.0)~~** – RESOLVED: d3-hwschematic removed (2025-11-17), custom orthogonal routing implemented
- **Jest, Vite, and related ecosystem** – Upgrading past currently-tested versions may break ESM or config. Only update deliberately and check tests.
- **Other transitive dependencies** – Most are not under direct project control and are considered low risk for this visualization tool.
- Vulnerabilities and deprecation warnings should be reviewed, not ignored, but addressed only when upstream projects release safe updates. Do NOT force fixes that break working tests unless you will update code/config to match new major APIs.

## Rebuilding a Stable Environment
1. To recover from a broken `npm install` or broken tests after an audit fix/force:
    ```bash
    rm -rf node_modules package-lock.json
    git checkout origin/feature/initial-development -- package.json
    npm install
    npm test
    ```
2. Restore all ESM/Jest/ajv-formats lines in config/code if accidentally removed.

## Current Status: Phase 5 Complete ✅

**Phase 5 completed with full ELK hierarchical support on 2025-11-17:**
- Integrated ControlsPanel component with zoom, layout toggle, and example selector
- Connected HwSchematicRenderer with zoom control methods (zoomIn, zoomOut, resetZoom, fitToView)
- **100% ELK.js orthogonal routing** - Removed all custom fallback routing
- **Hierarchical coordinate system fully working** - Supports nested areas at any depth
- Implemented complete validation → conversion → layout → render pipeline
- Added ExampleLoader utility for loading example graphs
- Main application entry point (src/main.js) loads default example on startup
- All controls wired through AVFlowView3dApp callbacks
- Controls styling with fixed-position panel and engineering aesthetic
- **87 unit tests passing**

**Key Features Now Available:**
- ✅ Automatic schema validation with clear error messages
- ✅ AV-to-ELK graph conversion with full hierarchy support
- ✅ ELK.js automatic layout (LR/TB direction support)
- ✅ **100% ELK.js orthogonal routing** - No fallback needed
- ✅ **Hierarchical coordinate system** - Works with flat, single-level, and nested hierarchies
- ✅ **Perfect port alignment** - Edges connect precisely at all hierarchy levels
- ✅ **Common ancestor detection** - Edges correctly placed in appropriate containers
- ✅ **Comprehensive debug panel** - Visual inspection and diagnostic tools
- ✅ Zoom controls (in, out, reset) with smooth animations
- ✅ Pan support with d3-zoom
- ✅ Layout direction toggle (Left-to-Right ↔ Top-to-Bottom)
- ✅ Example graph loading with dropdown selector (simple, medium, complex, heavy)
- ✅ Professional UI controls panel

**Ready for Phase 6: Advanced Interactions**
- Interactive selection (click devices/edges)
- Focus/context visualization (N-hop neighborhood highlighting)
- Search functionality (find by name, category, manufacturer)
- Advanced filtering (category, status, area)

## Test & Build Status
- **All tests passing, as of 2025-11-17**
- See CHECKLIST.md for granular progress and task status
- Test coverage: Schema validation, conversion logic, renderer initialization, styling, port direction resolution, and ELK integration
- **87 total tests** across all modules
- All example files tested: simple.json, medium.json, complex.json, heavy.json

## Change Log
*Agent should update this section after completing each phase/maintenance*

- **2025-11-17: COMPLETED - ELK Hierarchical Coordinate System**
  - Resolved coordinate mismatches in hierarchical and nested layouts
  - Implemented `findEdgeContainer()` for common ancestor detection
  - Implemented `findNodePath()` for building hierarchy paths
  - Implemented `findContainerOffset()` for absolute position calculation
  - Added cumulative offset tracking throughout rendering pipeline
  - Fixed coordinate translation for all hierarchy levels (flat, single, nested)
  - Created comprehensive debug panel (src/ui/DebugPanel.js) with diagnostic tools
  - Created complete documentation (docs/ELK_OPTIMIZATION_STATUS.md)
  - Updated README.md and CHECKLIST.md with completion status
  - All 87 tests passing
  - Tested with all example files: simple, medium, complex, heavy
  - **Key Achievement**: 100% ELK routing with perfect port alignment at all hierarchy levels
  - Branch: feature/phase5-ui-controls-panel

- **2025-11-17: Removed d3-hwschematic & Implemented Custom Orthogonal Routing**
  - Created src/utils/OrthogonalRouter.js (398 lines) with professional Manhattan-style routing
  - Implemented parallel edge separation (10px offset) to prevent visual stacking
  - Added obstacle detection and avoidance with 20px device padding
  - Integrated edge grouping for detecting parallel connections
  - Removed d3-hwschematic dependency completely from package.json
  - Updated HwSchematicRenderer to always use custom rendering
  - Eliminated transitive security vulnerability in d3-color
  - Created comprehensive implementation documentation (ORTHOGONAL_ROUTING_IMPLEMENTATION.md)
  - Tested with all 3 examples (simple, medium, complex) - all working
  - Branch: feature/phase5-ui-controls-panel

- **2025-11-16: Completed Phase 5 - UI Controls Panel**
  - Integrated ControlsPanel (zoom, layout toggle, example selector)
  - Updated src/main.js with automatic example loading
  - Enhanced AVFlowView3dApp with ELK layout and controls integration
  - Added zoom control methods to HwSchematicRenderer (zoomIn, zoomOut, resetZoom, fitToView)
  - Updated ExampleLoader to list actual available examples (simple, medium, complex)
  - Created comprehensive Phase 5 completion documentation
  - All features tested and functional
  - Branch: feature/phase5-ui-controls-panel

- **2025-11-16: Completed Phase 5 - Visualization via d3-hwschematic**
  - Integrated HwSchematicRenderer with custom device, area, and edge renderers
  - Implemented zoom/pan interactions with d3-zoom
  - Resolved Jest ESM module import issues and JSDOM compatibility
  - All tests passing (79 tests total)
  - Fallback rendering when d3-hwschematic unavailable

- **2025-11-16: Full dependency/test restore & documentation update**
  - After audit/recovery session
  - Jest/ajv/ESM/known issues all documented

- **2025-11-16: Completed Phase 4 - Styling & Semantics**
  - Implemented CategoryStyler, PortDirectionResolver
  - AVToELKConverter with styling and port direction integration
  - Comprehensive unit tests

## Extra References
- See README.md for installation and overview
- See CHECKLIST.md for up-to-date progress tracking
- See docs/PHASE5_COMPLETION.md for detailed Phase 5 documentation
- See docs/ELK_OPTIMIZATION_STATUS.md for ELK integration and hierarchical coordinate system documentation
- For maintenance, always consult this file if unsure whether to use --force or upgrade dev dependencies!

## Architecture Overview

```
index.html
    ↓
src/main.js (bootstrap)
    ↓
AVFlowView3dApp
├── SchemaValidator (validation)
├── AVToELKConverter (transformation with full hierarchy support)
├── CategoryStyler (styling)
├── PortDirectionResolver (semantics)
├── ELK (layout engine with hierarchical coordinates)
├── HwSchematicRenderer (visualization with coordinate translation)
│   ├── findEdgeContainer() - Common ancestor detection
│   ├── findNodePath() - Hierarchy path tracking
│   ├── findContainerOffset() - Absolute position calculation
│   └── Cumulative offset rendering for nested hierarchies
├── DebugPanel (visual inspection & diagnostics)
├── ControlsPanel (UI controls)
└── ExampleLoader (example management)
    ↓
Interactive Canvas + Controls Panel + Debug Panel
```

## Next Phase Preview

**Phase 6: Advanced Interactions**
- SelectionManager for click-to-select
- FocusManager for N-hop neighborhood highlighting
- SearchManager for text search and filtering
- Details panel for element information
- Keyboard navigation support
