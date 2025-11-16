# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- ESLint configuration (`.eslintrc.js`) with ES6+ rules and import ordering
- Prettier configuration (`.prettierrc`) for consistent code formatting
- Basic CSS reset and application styles (`src/styles/main.css`)
- Security policy (`SECURITY.md`) documenting known vulnerabilities
- Playwright dependency for e2e testing
- Playwright configuration (`playwright.config.js`) for browser testing
- GitHub Actions CI workflow (`.github/workflows/ci.yml`)
  - Automated testing on Node.js 18.x and 20.x
  - Linting and format checking
  - Code coverage reporting
  - E2E testing with Playwright
  - Build artifact uploads
- New npm scripts:
  - `npm run lint:fix` - Auto-fix linting issues
  - `npm run format` - Format code with Prettier
  - `npm run format:check` - Check code formatting
- CI status badge in README
- Security warning in README about known d3-color vulnerability
- Comprehensive project status section in README
- Improved project structure documentation

### Changed
- Updated `package.json` to include Playwright and format scripts
- Updated `docs/CHECKLIST.md` to accurately reflect completed phases:
  - Phase 1: Project Setup & Architecture - ✅ COMPLETED
  - Phase 2: Schema Validation Layer - ✅ COMPLETED
  - Phase 3: Data Transformation (AV → ELK) - ✅ COMPLETED
  - Phase 4: Styling & Semantics - ✅ COMPLETED
  - Phase 5: Visualization via d3-hwschematic - ✅ COMPLETED
- Enhanced README with:
  - Available scripts documentation
  - Technology stack links
  - Security section
  - Status with emoji indicators
  - Better project structure tree

### Fixed
- Documentation inconsistencies between checklist and actual code
- Missing configuration files that were marked in checklist
- Out-of-sync implementation status tracking

## [0.1.0] - 2025-11-16

### Completed
- Phase 1: Project Setup & Architecture
  - Project initialization with Vite, Jest, ESLint, Prettier
  - Directory structure for converters, renderers, validation, styling
  - Basic application shell with HTML entry point
  - Jest configuration with ESM support
  
- Phase 2: Schema Validation Layer
  - SchemaValidator implementation with ajv
  - JSON Schema 2020-12 support
  - Comprehensive test suite (50+ validation scenarios)
  - Cross-reference validation for nodes, areas, ports
  
- Phase 3: Data Transformation
  - AVToELKConverter implementation
  - Node, area, port, and edge mapping to ELK format
  - Layout direction support (LR/TB)
  - Nested area hierarchy handling
  - Comprehensive converter test suite
  
- Phase 4: Styling & Semantics
  - CategoryStyler with fixed color palette
  - PortDirectionResolver for bidirectional port analysis
  - Integration with AVToELKConverter
  - Unit tests for styling components
  
- Phase 5: Visualization
  - HwSchematicRenderer with d3-hwschematic integration
  - Custom DeviceRenderer, AreaRenderer, EdgeRenderer
  - Zoom and pan support
  - Jest ESM module compatibility fixes
  - JSDOM compatibility workarounds
  - 79 passing unit tests

### Known Issues
- Transitive dependency vulnerability in d3-color (low risk, monitored)
- UI controls panel not yet implemented
- Interactive features (selection, search, filter) pending Phase 6
- E2E test suite needs implementation

[Unreleased]: https://github.com/twobeass/AVFlowView-3d/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/twobeass/AVFlowView-3d/releases/tag/v0.1.0
