# ELK Routing Optimization - Current Status

**Date:** November 17, 2025  
**Status:** ✅ **COMPLETE - All Issues Resolved**

---

## ✅ Successfully Completed

### 1. Debug Panel System

- ✅ Full visual debugging interface
- ✅ ELK vs Fallback highlighting (green/red)
- ✅ Edge statistics panel
- ✅ Bend point visualization
- ✅ Port extension indicators
- ✅ Interactive edge inspection
- ✅ Full path coordinate display
- ✅ **NEW: Diagnostic Data Panel** with automatic mismatch detection
- ✅ Export tools (JSON, CSV, clipboard)

### 2. ELK Configuration Optimizations

- ✅ Port grouping by side
- ✅ FIXED_SIDE constraints
- ✅ Edge priorities (shortness: 10, straightness: 5)
- ✅ Post-compaction strategies
- ✅ Connected components compaction
- ✅ Optimized spacing parameters

### 3. Fixed Issues

- ✅ Simple.json fallback (was rejecting valid straight edges)
- ✅ All 87 tests passing
- ✅ Added heavy.json to dropdown
- ✅ Edge hover highlighting
- ✅ Edge click inspection
- ✅ Debug panel hide arrows/labels during highlighting

### 4. Hierarchical Coordinate System (SOLVED!)

- ✅ **Simple.json** - 100% ELK routing
- ✅ **Medium.json** - Hierarchical layouts fully working
- ✅ **Complex.json** - Nested hierarchies fully working
- ✅ **Heavy.json** - Multi-level hierarchies fully working
- ✅ All edge routing correctly aligned with ports

---

## 🎉 SOLVED: ELK Hierarchical Coordinate System

### The Problem (Now Resolved)

Edges in hierarchical layouts had coordinate mismatches:

- Port visual rendering used absolute SVG coordinates
- ELK edge routing used container-relative coordinates
- The delta matched exactly the container's position

**Example from diagnostic data:**

```
⚠️ MISMATCH cable1:
  Port at: (164, 64)          ← Absolute SVG coordinate
  Routing from: (152, 52)     ← Container-relative coordinate
  Delta: (12.0, 12.0)         ← Exactly the area position!
```

### Root Cause Identified

**ELK's coordinate system for hierarchical graphs:**

1. **All coordinates are relative to their container**
2. **Edges belong to the common ancestor container** of source/target nodes
3. **Nested hierarchies require cumulative offset tracking**

### The Solution

#### 1. **Node Rendering with Cumulative Offsets**

```javascript
// Nodes accumulate parent offsets through the hierarchy
const absoluteX = parentOffset.x + (node.x || 0);
const absoluteY = parentOffset.y + (node.y || 0);

// Recurse with cumulative offset
renderNodes(node.children, parentG, {
  x: absoluteX,
  y: absoluteY,
});
```

#### 2. **Edge Container Detection (Critical)**

```javascript
findEdgeContainer(edge, sourceNodeId, targetNodeId, data) {
  // Find path from root to each node
  const srcPath = this.findNodePath(sourceNodeId, data);
  const tgtPath = this.findNodePath(targetNodeId, data);

  // Find common ancestor by comparing paths
  let commonAncestor = null;
  for (let i = 0; i < Math.min(srcPath.length, tgtPath.length); i++) {
    if (srcPath[i].id === tgtPath[i].id) {
      commonAncestor = srcPath[i];
    } else {
      break;
    }
  }

  // Return absolute offset of common ancestor container
  return this.findContainerOffset(commonAncestor.id, data);
}
```

#### 3. **Edge Routing Translation**

```javascript
createPathFromELKSection(section, srcPos, tgtPos, containerOffset) {
  // Add container offset to convert from local to absolute coordinates
  const offsetX = containerOffset.x;
  const offsetY = containerOffset.y;

  let pathData = `M ${elkStart.x + offsetX} ${elkStart.y + offsetY}`;

  bendPoints.forEach(bend => {
    pathData += ` L ${bend.x + offsetX} ${bend.y + offsetY}`;
  });

  pathData += ` L ${elkEnd.x + offsetX} ${elkEnd.y + offsetY}`;

  return pathData;
}
```

#### 4. **Helper Methods**

- `findNodePath()` - Builds path from root to target node
- `findContainerOffset()` - Calculates absolute position of any container
- `findPortAbsolutePosition()` - Uses cumulative offsets for port positions
- All helper methods properly accumulate parent offsets

### Results

✅ **Simple hierarchies** (single-level areas) - Perfect alignment
✅ **Nested hierarchies** (areas within areas) - Perfect alignment  
✅ **Cross-hierarchy edges** (spanning different containers) - Perfect alignment
✅ **Flat layouts** (no hierarchy) - Continues to work perfectly
✅ **All test files working** - simple.json, medium.json, complex.json, heavy.json

### Key Implementation Principles

1. **Coordinate Space Tracking**: Always know which coordinate space you're in (container-local vs absolute SVG)
2. **Cumulative Offsets**: Accumulate parent offsets as you traverse the hierarchy
3. **Common Ancestor Detection**: Edges belong to the lowest common ancestor container
4. **Consistent Translation**: Always add container offset when using ELK routing coordinates

---

## 📚 ELK Integration Documentation

### Understanding ELK's Hierarchical Coordinate System

#### Coordinate Spaces

**1. Container-Local Space**

- ELK provides all node positions relative to their immediate parent
- Edge routing is in the coordinate space of the edge's container
- A node at position (10, 20) means "10 pixels right, 20 pixels down from parent's origin"

**2. Absolute SVG Space**

- Our rendering uses absolute SVG coordinates
- Must convert from ELK's container-local to absolute SVG
- Requires tracking cumulative offsets through the hierarchy

#### Edge Container Assignment

ELK places edges in the **common ancestor container** of source and target:

```
Root
├── Area A (x: 100, y: 50)
│   └── Device 1
└── Area B (x: 300, y: 50)
    └── Device 2

Edge from Device1 → Device2:
  - Common ancestor: Root
  - Edge routing is in Root's coordinate space
  - Container offset: (0, 0)

Edge from Device1 → Device3 (both in Area A):
  - Common ancestor: Area A
  - Edge routing is in Area A's coordinate space
  - Container offset: (100, 50)
```

#### Port Position Calculation

**For Rendering:**

```javascript
// Accumulate offsets through hierarchy
portAbsoluteX = area.x + node.x + port.x;
portAbsoluteY = area.y + node.y + port.y;
```

**For ELK Edge Routing:**

```javascript
// ELK provides routing in container-local space
// Add container offset to convert to absolute
edgeAbsoluteX = containerOffset.x + elkPoint.x;
edgeAbsoluteY = containerOffset.y + elkPoint.y;
```

### Configuration Best Practices

#### ELK Algorithm Options

```javascript
{
  algorithm: 'layered',
  'org.eclipse.elk.hierarchyHandling': 'INCLUDE_CHILDREN',
  'org.eclipse.elk.portConstraints': 'FIXED_SIDE',
  'org.eclipse.elk.layered.compaction.postCompaction.strategy': 'EDGE_LENGTH',
  'org.eclipse.elk.layered.compaction.connectedComponents': true,
  'org.eclipse.elk.layered.priority.shortness': 10,
  'org.eclipse.elk.layered.priority.straightness': 5
}
```

#### Port Configuration

```javascript
{
  id: `${nodeId}/${portKey}`,
  properties: {
    'org.eclipse.elk.portSide': side,  // NORTH, SOUTH, EAST, WEST
    'portIndex': index,                // Order on that side
    'portGroupId': side                // Group by side
  }
  // Let ELK calculate x, y positions
  // Do NOT set x, y manually
}
```

### Troubleshooting Guide

#### Problem: Edges don't align with ports

**Check:**

1. Are you using cumulative offsets for node rendering?
2. Are you finding the correct container for each edge?
3. Are you adding container offset to ELK routing coordinates?

**Debug:**

```javascript
console.log(`Port at: (${portPos.x}, ${portPos.y})`);
console.log(
  `ELK routing from: (${section.startPoint.x}, ${section.startPoint.y})`
);
console.log(`Container offset: (${containerOffset.x}, ${containerOffset.y})`);
```

#### Problem: Nested hierarchies have incorrect offsets

**Solution:**
Ensure `findNodePath()` builds the complete path from root:

```javascript
const path = [rootContainer, childContainer, targetNode];
```

Each level must contribute its offset to the cumulative total.

---

## Files Modified

### Core Implementation

- `src/ui/DebugPanel.js` - Comprehensive debugging system
- `src/styles/debug.css` - Debug panel styling
- `src/converters/AVToELKConverter.js` - ELK configuration
- `src/renderers/HwSchematicRenderer.js` - Rendering logic
- `src/AVFlowView3dApp.js` - Debug panel integration
- `src/main.js` - CSS imports
- `src/utils/ExampleLoader.js` - Added heavy.json

### Test Results

- All 87 tests: ✅ PASSING
- Simple.json: ✅ PERFECT (flat layout)
- Medium.json: ✅ PERFECT (single-level hierarchy)
- Complex.json: ✅ PERFECT (nested hierarchies)
- Heavy.json: ✅ PERFECT (multi-level hierarchies)

---

## Key Learnings

1. **ELK's coordinate system** uses container-relative coordinates throughout
2. **Edges belong to their common ancestor** - critical for correct offset calculation
3. **Cumulative offset tracking** is essential for nested hierarchies
4. **Path-based common ancestor detection** works reliably for any hierarchy depth
5. **Diagnostic tools are essential** - the debug panel made this solution possible
6. **Port positioning** - Let ELK calculate positions, don't override manually
7. **Coordinate space awareness** - Always know if you're in container-local or absolute space

---

## Summary

The ELK integration is now **production-ready** for:

- ✅ Flat layouts (no hierarchy)
- ✅ Single-level hierarchies (areas with devices)
- ✅ Multi-level nested hierarchies (areas within areas)
- ✅ Cross-container edges (spanning different hierarchy levels)

**Key Features:**

- 100% ELK routing with orthogonal edges
- Zero fallback routing needed for valid graphs
- Comprehensive debug panel for visualization and troubleshooting
- Proper coordinate space translation for all hierarchy levels
- Excellent layout quality with optimized spacing and compaction

The system correctly handles ELK's hierarchical coordinate system at any nesting depth!
