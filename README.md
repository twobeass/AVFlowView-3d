# AVFlowView-3d

D3.js and d3-hwschematic based interactive AV wiring diagram visualizer using the AVFlowView JSON schema.

## Overview

AVFlowView-3d transforms structured JSON descriptions of audio-visual systems into clean, interactive wiring diagrams. It automatically arranges devices, routes cables orthogonally, and provides focus/context visualization for exploring complex AV installations.

## Key Features

- **Automatic Layout**: Left-to-right or top-to-bottom signal flow with ELK.js
- **Smart Cable Routing**: Orthogonal paths that avoid overlapping devices
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
├── avflowview-wiring.schema.json # JSON Schema for AV wiring graphs
├── docs/
│   ├── CONTEXT.md               # Design philosophy and concepts
│   ├── AVFlowView-3d-plan.md    # Implementation roadmap
│   ├── CHECKLIST.md             # Phase-by-phase task checklist
│   └── TECHNICAL_SPECS.md       # Technical requirements
├── examples/
│   ├── simple.json              # Basic 5-node example
│   └── invalid-examples/        # Examples of validation errors
└── src/
    ├── schemas/                 # Schema files
    └── notes/                   # Implementation notes
```

## Technology Stack

- **[D3.js](https://d3js.org/)** - Visualization and DOM manipulation
- **[d3-hwschematic](https://github.com/Nic30/d3-hwschematic)** - Hardware schematic rendering
- **[ELK.js](https://eclipse.dev/elk/)** - Graph layout engine
- **[ajv](https://ajv.js.org/)** - JSON Schema validation
- **[Vite](https://vitejs.dev/)** - Build tool and dev server

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

## Related Projects

- **[AVFlowView](https://github.com/twobeass/AVFlowView)** - Original React Flow implementation
- **[d3-hwschematic](https://github.com/Nic30/d3-hwschematic)** - Hardware schematic library

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please:

1. Read the implementation docs (especially AGENT_README.md)
2. Follow the existing code structure and style
3. Add tests for new features
4. Update documentation as needed

## Status

**Current Status**: Repository structure and documentation complete. Implementation in progress.

See [docs/CHECKLIST.md](docs/CHECKLIST.md) for detailed progress tracking.
