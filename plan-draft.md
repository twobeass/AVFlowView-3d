The repository **AVFlowView-3d** already exists under your GitHub account according to the tooling output, so the remaining work is to clone it locally and commit the plan plus supporting context files into that repo.

Below is a concrete, step‑by‑step procedure that an autonomous coding agent (or you) can follow to do exactly that.

***

## 1. Clone the new repository

1. Ensure `git` is installed and you have credentials configured for your GitHub account `twobeass`.
2. Clone the empty repository:

   ```bash
   git clone <your AVFlowView-3d repository URL>
   cd AVFlowView-3d
   ```

   Use the HTTPS or SSH URL of the `AVFlowView-3d` repo returned by the tool that created it.

***

## 2. Create base project structure

Have the agent create a minimal but meaningful structure so the repo already looks like a real project, even before implementation starts:

```bash
mkdir -p docs src/schemas src/notes
```

Recommended initial tree:

- `README.md`
- `docs/AVFlowView-3d-plan.md` – the detailed autonomous-agent implementation plan
- `docs/CONTEXT.md` – conceptual description and design context
- `src/schemas/av-wiring-graph.schema.json` – JSON schema copied from AVFlowView
- `src/notes/requirements.md` – condensed feature list and constraints

***

## 3. Add the detailed plan to the repo

Use the previous answer (the big multi‑phase autonomous agent plan you requested) as the content of a dedicated documentation file.

1. Create `docs/AVFlowView-3d-plan.md`.
2. Paste the full plan into that file, preserving:
   - Phase structure (Phase 1–8)
   - Tasks and subtasks
   - Acceptance criteria
   - Execution order / decision points / success metrics / error recovery

This file becomes the *authoritative implementation roadmap* for the agent.

***

## 4. Capture conceptual context and constraints

The long textual description you provided about AVFlowView’s goals, features, and design philosophy is “necessary context” for any implementation of AVFlowView‑3d, but it is partly drawn from external sources.

To avoid copying large external texts verbatim, the agent should:

1. Create `docs/CONTEXT.md` with:

   - A short **summary of purpose** (in your own words), e.g.:

     - AVFlowView‑3d visualizes AV wiring using structured JSON (rooms, areas, devices, ports, cables) and draws an interactive, auto‑layouted diagram.
     - Focus on: 
       - clear left‑to‑right or top‑to‑bottom **signal flow**  
       - **orthogonal routing** with device avoidance  
       - **areas** (rooms/racks/zones) as containers  
       - **focus/context** highlighting and map‑like interactions (zoom/pan)

   - A **bullet list of core features**, derived from your description:
     - Auto layout from “source to destination” to avoid “spaghetti” diagrams
     - Category‑based colors (audio, video, network, control, power)
     - Input/output port placement by side and direction; bidirectional port handling
     - Areas for rooms/racks, with devices grouped inside them
     - Focus distance (steps from selected node/cable) with fading of others
     - Strict schema‑based validation of data before rendering

   - A **short note on design philosophy**:
     - Engineering‑style, clean diagrams rather than freehand sketches  
     - Consistent flow direction, port placement, and color language  
     - Separation of “truth” (JSON schema) and “view” (diagram)

2. Add a **reference section** describing where the schema and original viewer live conceptually (no URLs needed in the file; just project names and repos).

This gives any developer or future agent enough narrative context without copying large blocks of external prose.

***

## 5. Bring in the JSON schema

The app must use the same JSON schema as AVFlowView.

1. Create `src/schemas/av-wiring-graph.schema.json`.
2. Copy the schema content from the original AVFlowView project into this file (the agent can fetch it from that repo; you already provided its path).  
3. Optionally add a short header comment in the file explaining that this is kept in sync with the AVFlowView schema and should not be modified casually.

This file is part of the “necessary context” because it defines what valid AV wiring data looks like.

***

## 6. Capture requirements / implementation notes

To make the repo self‑contained for an autonomous coding agent, add one more document that ties the context to concrete requirements:

1. Create `src/notes/requirements.md` with:

   - **Goal of AVFlowView‑3d**:
     - Re‑implement AVFlowView’s visualization concept using **D3.js** and **d3‑hwschematic**, driven by the AV wiring JSON schema.
   - **Key technical constraints**:
     - Input: JSON conforming to `av-wiring-graph.schema.json`  
     - Layout: ELK.js via d3‑hwschematic (orthogonal routing, container nodes, port sides)  
     - Rendering: D3 & d3‑hwschematic custom node/edge renderers
   - **Essential user‑visible features** (short bullets, referencing `docs/CONTEXT.md` for detail)
   - A pointer to `docs/AVFlowView-3d-plan.md` as the implementation roadmap.

This file is where an agent can quickly see “what must be true” in the final” in the final