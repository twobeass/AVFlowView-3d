# AVFlowView-3d: Autonomous Agent Implementation Guide

## Quick Start
1. Read this document completely (it contains ALL context and maintenance info)
2. Follow the implementation plan: docs/AVFlowView-3d-plan.md
3. Reference technical details: docs/CONTEXT.md
4. Validate against: avflowview-wiring.schema.json

## Project Goal
Build an interactive AV wiring diagram visualizer using D3.js and d3-hwschematic, driven by JSON schema.

## Technology Stack
- **Runtime**: Node.js >=18.0.0
- **Package Manager**: npm >=9.0.0
- **Bundler**: Vite ^5.0.0 (note: do NOT forcibly upgrade beyond 6.x unless tested)
- **Core Libraries**:
  - d3 ^7.8.5
  - d3-hwschematic ^0.1.x (note: uses vulnerable d3-color transitively, see below)
  - elkjs ^0.9.0
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
- **d3-hwschematic → d3 (<=6.7.0) → d3-color (<3.1.0)** – see audit warning. No fix possible until upstream releases an update.
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

**Phase 5 (UI Controls Panel) completed on 2025-11-16:**
- Integrated ControlsPanel component with zoom, layout toggle, and example selector
- Connected HwSchematicRenderer with zoom control methods (zoomIn, zoomOut, resetZoom, fitToView)
- Integrated ELK layout engine for automatic graph positioning
- Implemented complete validation → conversion → layout → render pipeline
- Added ExampleLoader utility for loading example graphs
- Main application entry point (src/main.js) loads default example on startup
- All controls wired through AVFlowView3dApp callbacks
- Controls styling with fixed-position panel and engineering aesthetic
- **79 unit tests passing**

**Key Features Now Available:**
- ✅ Automatic schema validation with clear error messages
- ✅ AV-to-ELK graph conversion with category styling
- ✅ ELK.js automatic layout (LR/TB direction support)
- ✅ Interactive d3-hwschematic rendering with custom device/area/edge renderers
- ✅ Zoom controls (in, out, reset) with smooth animations
- ✅ Pan support with d3-zoom
- ✅ Layout direction toggle (Left-to-Right ↔ Top-to-Bottom)
- ✅ Example graph loading with dropdown selector
- ✅ Professional UI controls panel

**Ready for Phase 6: Advanced Interactions**
- Interactive selection (click devices/edges)
- Focus/context visualization (N-hop neighborhood highlighting)
- Search functionality (find by name, category, manufacturer)
- Advanced filtering (category, status, area)

## Test & Build Status
- **All tests passing, as of 2025-11-16**
- See CHECKLIST.md for granular progress and task status
- Test coverage: Schema validation, conversion logic, renderer initialization, styling, and port direction resolution
- 79 total tests across all modules

## Change Log
*Agent should update this section after completing each phase/maintenance*

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
- For maintenance, always consult this file if unsure whether to use --force or upgrade dev dependencies!

## Architecture Overview

```
index.html
    ↓
src/main.js (bootstrap)
    ↓
AVFlowView3dApp
├── SchemaValidator (validation)
├── AVToELKConverter (transformation)
├── CategoryStyler (styling)
├── PortDirectionResolver (semantics)
├── ELK (layout engine)
├── HwSchematicRenderer (visualization)
├── ControlsPanel (UI controls)
└── ExampleLoader (example management)
    ↓
Interactive Canvas + Controls Panel
```

## Next Phase Preview

**Phase 6: Advanced Interactions**
- SelectionManager for click-to-select
- FocusManager for N-hop neighborhood highlighting
- SearchManager for text search and filtering
- Details panel for element information
- Keyboard navigation support
