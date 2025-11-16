# Quickstart

AVFlowView-3d agent onboarding: validate everything and see results in one go.

## Workflow

```bash
# 1. Clone and install

git clone https://github.com/twobeass/AVFlowView-3d.git
cd AVFlowView-3d
npm install

# 2. Validate an example
npm run validate-schema examples/simple.json
# (or)
npm run validate-schema examples/medium.json

# 3. Start dev server and open the app
npm run dev
# Open browser at http://localhost:5173

# 4. Check rendering and logs
# Should see expected diagram, no console errors for valid files
```

## Agent Notes
- If validation fails, error details will print with JSON paths.
- Work phase-by-phase as in AGENT_README.md.
- To upgrade dependencies or patch a renderer, see docs/TECHNICAL_SPECS.md.
