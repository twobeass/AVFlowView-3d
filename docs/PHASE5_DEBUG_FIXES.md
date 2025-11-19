# Phase 5 Debug Fixes

**Date**: November 17, 2025  
**Branch**: `feature/phase5-ui-controls-panel`

## Issues Fixed

### 1. Source Maps Not Visible in DevTools ✅

**Problem:**

- Only `(index)` visible in Chrome DevTools Sources tab
- Couldn't debug actual source files

**Solution:**

- Added `sourcemap: true` to `vite.config.mjs` build options
- Added `sourcemapIgnoreList: false` to server config
- Now all source files visible in DevTools for debugging

**Commit:** [e1da7f4](https://github.com/twobeass/AVFlowView-3d/commit/e1da7f4e4f264a17c10e0c9959fd1dc699da3fb3)

---

### 2. Nodes Overlapping (All at Same Position) ✅

**Problem:**

- ELK layout returned width=0, height=0 for all nodes
- All devices rendered at same coordinates
- Impossible to see graph structure

**Root Cause:**

- `AVToELKConverter` didn't provide dimensions to ELK
- ELK couldn't compute proper spacing without knowing node sizes

**Solution:**

- Added `width: 140, height: 80` to device nodes
- Added `width: 400, height: 300` to area containers
- Added ELK spacing options:
  - `nodeNode: 80` - space between nodes
  - `edgeNode: 40` - space between edges and nodes
  - `edgeEdge: 20` - space between edges
  - `edgeNodeBetweenLayers: 40` - layer spacing

**Commit:** [fb1edbe](https://github.com/twobeass/AVFlowView-3d/commit/fb1edbe64a04498443738a11d365e0c3c7815284)

---

### 3. Nodes Disappear When Areas Added ✅

**Problem:**

- When areas added to JSON, device nodes disappeared
- Only area container visible, but empty

**Root Cause:**

- Original `renderFallback()` only rendered direct children of root
- When areas exist, devices become children of areas (nested)
- Non-recursive rendering skipped nested devices

**Solution:**

- Rewrote `renderFallback()` to be **fully recursive**
- Tracks absolute coordinates through parent offset accumulation
- Renders areas as semi-transparent containers
- Renders devices inside areas at correct absolute positions
- Distinguishes area containers from device nodes via `children.length`

**Commit:** [68ecf30](https://github.com/twobeass/AVFlowView-3d/commit/68ecf30a52e3dad8fa7ca85709976a099ee913a2)

---

### 4. Edges Disappear After Recursive Fix ✅

**Problem:**

- After fixing recursive rendering, edges no longer visible

**Root Cause:**

- Edges rendered inside nested groups with wrong coordinate transforms
- ELK edge coordinates are in **global/root space**, not relative to containers

**Solution:**

- Moved edge rendering to **after** all nodes, at root level
- Edges now render in global coordinate space (matching ELK output)
- Added category-based coloring to edges
- Added arrow markers for direction
- Added optional edge labels at midpoint

**Commit:** [68ecf30](https://github.com/twobeass/AVFlowView-3d/commit/68ecf30a52e3dad8fa7ca85709976a099ee913a2)

---

## New Features Added

### Category-Based Coloring ✅

**Device Colors:**

- Video: `#E24A6F` (pink/red)
- Audio: `#4A90E2` (blue)
- Network: `#50C878` (green)
- Control: `#F5A623` (orange)
- Power: `#D0021B` (red)
- Display: `#9B59B6` (purple)
- Wallplate: `#95A5A6` (gray)
- Default: `#ddd` (light gray)

**Edge Colors:**

- Match category of connection (video, network, power, etc.)

### Status Visualization ✅

- **Existing**: Opacity 0.7 (semi-transparent)
- **Regular**: Opacity 1.0 (solid)
- **Defect**: Red dashed border (#D0021B, dasharray 5,5)

### Port Visualization ✅

- Small circles (5px radius) on device edges
- Positioned according to port side (WEST, EAST, NORTH, SOUTH)
- White fill with black border

### Area Styling ✅

- Semi-transparent background (rgba(240, 240, 240, 0.3))
- Gray border (#999, 2px)
- Rounded corners (10px radius)
- Area label in top-left corner

---

## New Example Files ✅

### simple.json

- **2 nodes**: Sony camera → Samsung display
- **1 edge**: SDI video connection
- **0 areas**: All nodes at root level
- **Purpose**: Basic connectivity test

**Commit:** [c3a28da](https://github.com/twobeass/AVFlowView-3d/commit/c3a28da313a4b6f0ab7c4d802da41bf32ccaad56)

### medium.json

- **3 nodes**: Blackmagic switcher → 2 Sony monitors
- **2 edges**: Two SDI outputs from switcher
- **1 area**: Studio Room containing all devices
- **Purpose**: Test area grouping and multi-output devices

**Commit:** [949a99d](https://github.com/twobeass/AVFlowView-3d/commit/949a99d49bbd4a3b1f852c642d8080fb727b0b31)

### complex.json

- **6 nodes**: 2 cameras, switcher, monitor, network switch, PDU
- **6 edges**: Video (SDI), network (Ethernet), power (PowerCON)
- **3 areas**: Control Room, Equipment Rack (nested), Studio Floor
- **Multiple categories**: video, network, power
- **Multiple statuses**: Regular, Existing
- **Purpose**: Full feature test with nested areas and mixed connections

**Commit:** [c5dc77f](https://github.com/twobeass/AVFlowView-3d/commit/c5dc77f04e4cb1bcd1992410e1897a0bd1e0ee93)

---

## What You Should See Now

### simple.json

```
[Sony PXW-Z450] ---(pink SDI line)---> [Samsung QM55B]
```

- Two pink/red boxes (video category)
- One pink edge connecting them
- Clean left-to-right layout
- Port circles on device edges

### medium.json

```
╔════════════════ Studio Room ═══════════════╗
║                                             ║
║  [Switcher] ----> [Monitor 1]              ║
║      |                                      ║
║      └---------> [Monitor 2]               ║
║                                             ║
╚═════════════════════════════════════════════╝
```

- Semi-transparent gray area container
- Three video devices (pink)
- Two pink edges (SDI connections)
- Switcher has two output ports visible

### complex.json

```
╔═══════════════ Studio Floor ═══════════╗
║  [Camera 1]                             ║
║  [Camera 2]                             ║
╚═════════════════════════════════════════╝
       │ (pink SDI)    │ (pink SDI)
       ↓               ↓
╔═══════════════ Control Room ═══════════════════╗
║  ╔═══════ Equipment Rack ═══════╗             ║
║  ║  [Switcher]                  ║             ║
║  ║  [Network Switch] (green)    ║             ║
║  ║  [PDU] (red)                 ║             ║
║  ╚══════════════════════════════╝             ║
║       │ (pink SDI)                            ║
║       ↓                                       ║
║  [Monitor]                                    ║
╚═══════════════════════════════════════════════╝
```

- Two nested area containers
- 6 devices with category colors:
  - Cameras, Switcher, Monitor: Pink (video)
  - Network Switch: Green (network)
  - PDU: Red (power)
- 6 edges with category colors
- Power connections in red
- Network connection in green
- Video connections in pink

---

## Testing Checklist

### Visual Verification

- [ ] **simple.json**: Two separate boxes with connecting line
- [ ] **medium.json**: Area container with 3 devices inside
- [ ] **complex.json**: Nested areas with 6 devices
- [ ] Devices have category colors (not all gray)
- [ ] Edges have category colors matching connection type
- [ ] Existing status shows semi-transparent
- [ ] Defect status shows dashed red border (if any)
- [ ] Port circles visible on device edges
- [ ] No overlapping devices
- [ ] Proper spacing between elements

### Controls Verification

- [ ] Zoom in: Devices get larger
- [ ] Zoom out: Devices get smaller
- [ ] Reset: Returns to default view
- [ ] Layout toggle: Switches LR ↔ TB
- [ ] Example selector: Loads all three examples

### DevTools Verification

- [ ] Sources tab shows `src/` folder with all files
- [ ] Can set breakpoints in `HwSchematicRenderer.js`
- [ ] No console errors during normal operation
- [ ] "Layout complete" message appears on load

---

## Technical Details

### Recursive Rendering Algorithm

```javascript
renderNodes(nodes, parentG, parentOffset) {
  for each node:
    absoluteX = parentOffset.x + node.x
    absoluteY = parentOffset.y + node.y

    if node has children:
      // It's an area
      draw area rectangle at (absoluteX, absoluteY)
      draw area label
      recurse: renderNodes(node.children, parentG, {absoluteX, absoluteY})
    else:
      // It's a device
      draw device rectangle at (absoluteX, absoluteY)
      draw device label
      draw port circles
}
```

### Coordinate System

- **ELK provides**: Hierarchical coordinates (relative to parent)
- **Renderer needs**: Absolute coordinates for SVG
- **Solution**: Accumulate parent offsets during recursion

### Edge Rendering

- ELK provides edges in **global coordinate space**
- Edges always rendered at root level (not inside area groups)
- startPoint and endPoint already absolute from ELK
- bendPoints (if any) also absolute

---

## Performance Notes

- Recursive rendering: O(n) where n = total nodes + areas
- Edge rendering: O(e) where e = total edges
- No significant performance impact for graphs <100 nodes

---

## Next Steps

With these fixes:

1. ✅ Graphs render correctly with proper spacing
2. ✅ Areas show as containers
3. ✅ Category colors visible
4. ✅ Edges connect devices properly
5. ✅ Debug-friendly examples available

**Ready to proceed with Phase 6: Interactive selection and focus/context!**

---

**Total Commits:** 6  
**Files Changed:** 5  
**Lines Added:** ~350  
**Lines Removed:** ~50
