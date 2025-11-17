# AVFlowView-3d

[![CI](https://github.com/twobeass/AVFlowView-3d/actions/workflows/ci.yml/badge.svg)](https://github.com/twobeass/AVFlowView-3d/actions/workflows/ci.yml)

D3.js and ELK.js based interactive AV wiring diagram visualizer using the AVFlowView JSON schema.

## Overview

AVFlowView-3d transforms structured JSON descriptions of audio-visual systems into clean, interactive wiring diagrams. It automatically arranges devices with intelligent orthogonal cable routing, and provides focus/context visualization for exploring complex AV installations.

## Key Features

- **Automatic Layout**: Left-to-right or top-to-bottom signal flow with ELK.js (fully hierarchical)
- **Smart Cable Routing**: ELK.js orthogonal routing with perfect port alignment at all hierarchy levels
- **Category Colors**: Consistent color-coding for audio, video, network, control, and power
- **Areas & Grouping**: Visual containers for rooms, racks, and zones
- **Focus/Context**: Highlight N-hop neighborhoods to reduce visual complexity
- **Interactive**: Zoom, pan, search, and filter for easy navigation
- **Schema-Driven**: Validated JSON input ensures data integrity

## For Autonomous Coding Agents

**Start here**: [`AGENT_README.md`](AGENT_README.md)

This repository is specifically organized for autonomous implementation. All necessary context, requirements, and decision logic are provided in a single entry-point document with clear references to supporting files.

### Implementation Resources

1. **[AGENT_README.md](AGENT_README.md)** - Master document with complete context
2. **[docs/CONTEXT.md](docs/CONTEXT.md)** - Design philosophy and visual intentions
3. **[docs/AVFlowView-3d-plan.md](docs/AVFlowView-3d-plan.md)** - Phase-by-phase implementation roadmap
4. **[docs/CHECKLIST.md](docs/CHECKLIST.md)** - Verifiable tasks for each phase
5. **[docs/TECHNICAL_SPECS.md](docs/TECHNICAL_SPECS.md)** - Technical requirements and constraints
6. **[avflowview-wiring.schema.json](avflowview-wiring.schema.json)** - JSON Schema definition
7. **[examples/](examples/)** - Valid and invalid example graphs

## Quick Start (For Developers)

### Prerequisites

- Node.js >=18.0.0
- npm >=9.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/twobeass/AVFlowView-3d.git
cd AVFlowView-3d

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Check code quality with ESLint
- `npm run lint:fix` - Fix auto-fixable linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Usage Example

```javascript
import { AVFlowView3dApp } from './src/AVFlowView3dApp';

// Initialize the viewer
const viewer = new AVFlowView3dApp('#container', {
  width: 1200,
  height: 800
});

// Load a graph
fetch('examples/simple.json')
  .then(res => res.json())
  .then(graph => viewer.load(graph));
```

## Project Structure

```
AVFlowView-3d/
├── AGENT_README.md              # Master entry-point for autonomous agents
├── README.md                    # This file (user-facing overview)
├── SECURITY.md                  # Security policy and known vulnerabilities
├── avflowview-wiring.schema.json # JSON Schema for AV wiring graphs
├── docs/
│   ├── CONTEXT.md               # Design philosophy and concepts
│   ├── AVFlowView-3d-plan.md    # Implementation roadmap
│   ├── CHECKLIST.md             # Phase-by-phase task checklist
│   └── TECHNICAL_SPECS.md       # Technical requirements
├── examples/
│   ├── simple.json              # Basic 5-node example
│   └── invalid-examples/        # Examples of validation errors
├── src/
│   ├── converters/              # AV to ELK graph conversion
│   ├── renderers/               # D3-based custom rendering with orthogonal routing
│   ├── styling/                 # Category colors and styles
│   ├── validation/              # JSON schema validation
│   └── utils/                   # Utility functions (including OrthogonalRouter)
└── tests/
    ├── converters/              # Converter unit tests
    ├── validation/              # Validator unit tests
    └── e2e/                     # End-to-end tests (Playwright)
```

## Technology Stack

- **[D3.js](https://d3js.org/)** - Visualization and DOM manipulation
- **[ELK.js](https://eclipse.dev/elk/)** - Graph layout engine
- **Custom Orthogonal Router** - Professional Manhattan-style edge routing with obstacle avoidance
- **[ajv](https://ajv.js.org/)** - JSON Schema validation
- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[Jest](https://jestjs.io/)** - Unit testing framework
- **[Playwright](https://playwright.dev/)** - E2E testing framework

## Schema

AVFlowView-3d uses a JSON schema that describes:

- **Layout preferences** (direction, port binding, area-first layout)
- **Areas** (rooms, racks, zones as containers)
- **Nodes** (devices with manufacturer, model, category, status, ports)
- **Edges** (cables connecting device ports)
- **Metadata** (project information)

See [`avflowview-wiring.schema.json`](avflowview-wiring.schema.json) for the complete schema definition.

## Examples

- **[simple.json](examples/simple.json)** - Basic setup with 5 devices
- **[invalid-examples/](examples/invalid-examples/)** - Common validation errors

## Security

For security issues, please review our [Security Policy](SECURITY.md) before reporting.

## Related Projects

- **[AVFlowView](https://github.com/twobeass/AVFlowView)** - Original React Flow implementation

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please:

1. Read the implementation docs (especially AGENT_README.md)
2. Follow the existing code structure and style
3. Add tests for new features
4. Update documentation as needed
5. Run `npm run lint` and `npm test` before submitting

## Status

**Current Status**: Phases 1-5 complete with full ELK hierarchical support. Interactive features (Phase 6) and UI shell (Phase 7) in progress.

See [docs/CHECKLIST.md](docs/CHECKLIST.md) for detailed progress tracking.

### Completed Features

✅ Schema validation with comprehensive error reporting  
✅ AV to ELK graph conversion with full hierarchy support  
✅ Category-based styling system  
✅ D3-based rendering with zoom/pan  
✅ Custom device, area, and edge renderers  
✅ **100% ELK.js orthogonal routing** - No fallback needed  
✅ **Hierarchical coordinate system** - Works with nested areas at any depth  
✅ **Perfect port alignment** - Edges connect precisely in all layouts  
✅ **Debug panel** - Comprehensive visualization and diagnostic tools  
✅ **87 passing unit tests** - All edge cases covered  

### In Progress

🚧 Interactive selection and focus/context  
🚧 Search and filtering UI  
🚧 Complete application shell  
🚧 E2E testing with Playwright

### ELK Integration

The project now features **production-ready ELK integration** for:
- ✅ Flat layouts (no hierarchy)
- ✅ Single-level hierarchies (areas with devices)
- ✅ Multi-level nested hierarchies (areas within areas)
- ✅ Cross-container edges (spanning different hierarchy levels)

See [docs/ELK_OPTIMIZATION_STATUS.md](docs/ELK_OPTIMIZATION_STATUS.md) for complete technical documentation on ELK's hierarchical coordinate system, configuration best practices, and troubleshooting guide.
