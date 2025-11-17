# Plan Mode Prompt: Advanced ELK Routing Optimization

**Purpose:** Fine-tune ELK layout and routing configuration to achieve production-quality edge routing for AV wiring diagrams

**Requirements:** Extensive knowledge of Eclipse Layout Kernel (ELK) configuration options, algorithms, and layered graph drawing

---

## Starting Prompt for (Plan Mode)

```
I need your expertise in Eclipse Layout Kernel (ELK) configuration to optimize graph routing for professional AV wiring diagrams. You'll need extensive knowledge of ELK's layered algorithm, orthogonal routing options, and hierarchical graph handling.

## Current Implementation Status

We've successfully implemented a HYBRID routing system that combines ELK's intelligent routing with custom port extensions:

**What's Working:**
- ✅ ELK hierarchical routing enabled (`hierarchyHandling: 'INCLUDE_CHILDREN'`)
- ✅ 5/6 edges in complex.json use ELK's bend points
- ✅ Zero edges routing through nodes (critical bug fixed!)
- ✅ Custom port extensions (30px) connecting to ELK routing orthogonally
- ✅ Enhanced fallback for edges without ELK sections (but still not optimal)
- ✅ All 87 tests passing

**Current ELK Configuration** (`src/converters/AVToELKConverter.js`):
```javascript
layoutOptions: {
  'org.eclipse.elk.algorithm': 'layered',
  'org.eclipse.elk.direction': layoutDirection,
  'org.eclipse.elk.layered.edgeRouting': 'ORTHOGONAL',
  'org.eclipse.elk.spacing.nodeNode': 220,
  'org.eclipse.elk.spacing.edgeNode': 88,
  'org.eclipse.elk.spacing.edgeEdge': 55,
  'org.eclipse.elk.layered.spacing.edgeNodeBetweenLayers': 110,
  'org.eclipse.elk.layered.spacing.baseValue': 55,
  'org.eclipse.elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
  'org.eclipse.elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
  'org.eclipse.elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'org.eclipse.elk.separateConnectedComponents': true,
  'org.eclipse.elk.hierarchyHandling': 'INCLUDE_CHILDREN',
  'org.eclipse.elk.edgeRouting': 'ORTHOGONAL',
}
```

## Problems to Solve

### 1. Fallback Edge in medium.json (Simple 3-Node Graph)
**File:** `examples/medium.json`
```json
{
  "nodes": [
    { "id": "switcher", "areaId": "studio", "ports": { "sdi_out_1", "sdi_out_2" } },
    { "id": "monitor1", "areaId": "studio", "ports": { "sdi_in" } },
    { "id": "monitor2", "areaId": "studio", "ports": { "sdi_in" } }
  ],
  "edges": [
    { "switcher/sdi_out_1" → "monitor1/sdi_in" },
    { "switcher/sdi_out_2" → "monitor2/sdi_in" }
  ]
}
```

**Issue:** One edge gets ELK routing, one doesn't (falls back to custom)
**Question:** Why would ELK fail to route such a simple same-area connection?
**Hypothesis:** Port-level edges within same container might need special handling

### 2. Edge Overlapping/Bundling
**Issue:** Multiple edges sharing paths overlap completely, reducing readability
**Current State:** ELK has `spacing.edgeEdge: 55` but edges still overlap
**Questions:**
- Is there an ELK option for automatic edge bundling?
- Should we use `org.eclipse.elk.layered.edgeRouting.splines.mode`?
- Can ELK offset parallel edges automatically?

### 3. Extreme Routing in Some Cases
**Issue:** Some edges take unnecessarily long paths (going far out of the way)
**Visible in:** medium.json shows convoluted routing
**Questions:**
- Is there an ELK option to prefer shorter paths?
- Can we tune the cost function for routing?
- Should we use different `edgeRouting` modes (POLYLINE vs ORTHOGONAL)?

### 4. Scalability with Heavy Graphs
**File:** `examples/heavy.json` - 80+ nodes, 200+ edges
**Untested Performance:** Need to verify ELK handles this efficiently
**Questions:**
- Are there ELK performance optimization options?
- Should we enable incremental layout?
- Can we use different algorithms for large graphs?

## Graph Structure Context

**Hierarchy:**
```
Root Graph
  ├─ Area: "Control Room"
  │   └─ Area: "Equipment Rack" (nested)
  │       ├─ Device: switcher
  │       ├─ Device: network-switch
  │       └─ Device: pdu
  ├─ Area: "Studio Floor"
  │   ├─ Device: camera1
  │   └─ Device: camera2
  └─ Device: monitor (root level)
```

**Edge Types:**
- Same-area edges (e.g., switcher → network-switch within Equipment Rack)
- Cross-area edges (e.g., camera → switcher from Studio Floor to Equipment Rack)
- Hierarchical edges (spanning nested areas)

**Port Distribution:**
- Devices have 1-8 ports
- Ports evenly distributed on EAST/WEST sides (LR layout)
- Custom port positioning (not ELK-controlled)

## Technical Constraints

**Must Preserve:**
- ✅ Custom port positions (evenly distributed on node edges)
- ✅ Port extensions (edges must "stick out" 30px from ports)
- ✅ Zero edges through nodes
- ✅ All 87 tests passing
- ✅ Backward compatibility

**Can Change:**
- ELK configuration options
- Spacing parameters
- Algorithm choices
- Node/edge properties passed to ELK

## ELK Knowledge Needed

To optimize this, you need deep knowledge of:

### 1. ELK Layered Algorithm Options
- **Node placement strategies:** NETWORK_SIMPLEX, SIMPLE, INTERACTIVE, etc.
- **Layer assignment:** Different strategies and their effects
- **Crossing minimization:** LAYER_SWEEP vs BARYCENTER vs others
- **Cycle breaking:** How it affects routing

### 2. Orthogonal Edge Routing
- **Routing modes:** ORTHOGONAL vs POLYLINE vs SPLINES
- **Edge-node spacing:** How to ensure edges don't overlap nodes
- **Edge-edge spacing:** Making parallel edges visually distinct
- **Junction points:** Controlling where edges can cross/meet

### 3. Hierarchical Graph Handling
- **hierarchyHandling options:** INCLUDE_CHILDREN, SEPARATE_CHILDREN, etc.
- **Cross-hierarchy edges:** How ELK routes between nested areas
- **Port constraints:** Ensuring ports stay on correct sides
- **Compound node handling:** Areas containing devices

### 4. Advanced Spacing Options
All ELK spacing options and their interactions:
- `spacing.nodeNode`
- `spacing.edgeNode`
- `spacing.edgeEdge`
- `layered.spacing.edgeNodeBetweenLayers`
- `layered.spacing.baseValue`
- Individual component spacing overrides

### 5. Port Handling
- **Port sides:** NORTH, SOUTH, EAST, WEST
- **Port constraints:** Fixed vs free positioning
- **Port ordering:** How ELK arranges ports
- **Port offset:** Can we influence port position on node edge?

### 6. Edge Routing Specific Options
- `layered.edgeRouting.selfLoopDistribution`
- `layered.edgeRouting.selfLoopPlacement`
- `layered.edgeRouting.splines.mode`
- `layered.edgeRouting.multiEdgeSpacing`
- `layered.edgeRouting.polyline.slopedEdgeZoneWidth`

## Desired Outcomes

**Priority 1: All Edges Get ELK Routing**
- Eliminate the 1 fallback edge in medium.json
- 100% ELK routing coverage (or understand why not possible)
- Identify which edge configurations prevent ELK routing

**Priority 2: Better Visual Separation**
- Parallel edges should be clearly distinguishable
- Reduce/eliminate overlapping edges
- Maintain readability even with 10+ parallel edges

**Priority 3: Shorter/Cleaner Paths**
- Reduce unnecessary detours
- More direct routing where obstacles allow
- Professional appearance (like Visio/Lucidchart quality)

**Priority 4: Scalability**
- Confirm heavy.json (80+ nodes) renders efficiently
- Maintain performance with 1000+ nodes
- No layout explosions or extreme computation times

**Priority 5: Maintainability**
- Well-documented ELK configuration choices
- Clear rationale for each option
- Tuning guide for different graph types

## Example Files for Testing

**examples/simple.json** - 2 devices, 1 edge (baseline)  
**examples/medium.json** - 3 devices, 2 edges (has 1 fallback edge)  
**examples/complex.json** - 6 devices, 6 edges (5 ELK + 1 fallback)  
**examples/heavy.json** - 80+ devices, 200+ edges (scalability - needs to be implemented in gui for visual user test)

## Your Task

Create a comprehensive plan to:

1. **Audit current ELK configuration**
   - Which options are helping?
   - Which might be causing the fallback edge?
   - What's missing that could improve routing?

2. **Research ELK documentation** for:
   - Options specifically for parallel edge handling
   - Advanced orthogonal routing tuning
   - Hierarchical graph best practices
   - Port constraint options

3. **Propose configuration changes** with:
   - Specific ELK option names and values
   - Rationale for each change
   - Expected impact on routing quality
   - Risk assessment (what might break)

4. **Design testing strategy:**
   - How to verify improvements
   - Regression prevention
   - Performance benchmarks

5. **Consider alternative approaches:**
   - Different ELK algorithms (box, force, etc.)
   - Hybrid algorithm selection based on graph structure
   - Custom port positioning strategies that work better with ELK

## Reference Materials

**ELK Documentation:** https://eclipse.dev/elk/reference.html
**Our codebase:** `src/converters/AVToELKConverter.js` and `src/renderers/HwSchematicRenderer.js`
**Test suite:** All tests in `tests/` and `src/` directories

## Success Criteria

Your plan should achieve:
- [ ] 100% ELK routing coverage (or explain why impossible)
- [ ] Visual Debug Mode (activate through GUI) to let the user understand the routings better and give better feedback to the agent
- [ ] Clear visual separation of parallel edges
- [ ] Shorter, cleaner routing paths
- [ ] Heavy.json renders smoothly
- [ ] Configuration is well-documented and maintainable
- [ ] No regressions (87 tests still passing)

## Deliverable

A detailed implementation plan including:
1. Specific ELK configuration changes (option by option)
2. Testing strategy for each change
3. Rollback plan if changes cause issues
4. Performance expectations
5. Documentation updates needed

Take your time to research ELK's capabilities thoroughly. This is about leveraging ELK's full power to achieve professional-grade routing quality.
```