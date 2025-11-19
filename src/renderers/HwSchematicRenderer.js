import * as d3 from 'd3';

class HwSchematicRenderer {
  constructor(containerSelector) {
    this.container = d3.select(containerSelector);
    this.zoomScale = 1;

    // Routing configuration - all parameters are adjustable
    this.routingConfig = {
      // Port extensions
      extensionLength: 30, // px to extend from port before routing

      // Obstacle detection
      obstaclePadding: 2, // MINIMAL: Just 2px padding to detect actual node overlap
      localSearchRadius: 300, // INCREASED: Check obstacles within larger radius

      // Routing behavior
      minBendPoints: 2, // Minimum waypoints near each port
      maxBendPoints: 4, // Maximum waypoints near each port
      maxIterations: 10, // Max iterations for collision resolution
      protectedSegmentsCount: 4, // Number of segments near each port to protect from collisions
      edgeSeparation: 8, // Pixels to offset parallel edges for visual clarity

      // Performance
      enableCollisionDetection: true, // Can disable for debugging/comparison
      logPerformance: false, // Log routing time per edge
      debugCollisions: false, // NEW: Log collision detection details
      visualizeObstacles: false, // DISABLED: Debug visualization
      visualizeSegments: false, // DISABLED: Debug visualization
    };

    this.initSVG();
    this.setupZoomPan();
  }

  initSVG() {
    this.svg = this.container
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('class', 'hwschematic-svg-container');

    // Add defs for arrow markers
    const defs = this.svg.append('defs');
    defs
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('refX', 9)
      .attr('refY', 3)
      .attr('orient', 'auto')
      .append('polygon')
      .attr('points', '0 0, 10 3, 0 6')
      .attr('fill', '#333');

    this.g = this.svg.append('g').attr('class', 'hwschematic-content');
  }

  setupZoomPan() {
    this.zoom = d3
      .zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
        this.currentTransform = event.transform;
      });

    this.svg.call(this.zoom);
    this.currentTransform = d3.zoomIdentity;
  }

  /**
   * Update routing configuration dynamically
   * @param {object} config - Partial configuration to merge with existing config
   * @example
   * renderer.setRoutingConfig({
   *   extensionLength: 40,
   *   localSearchRadius: 200,
   *   minBendPoints: 3
   * });
   */
  setRoutingConfig(config) {
    this.routingConfig = { ...this.routingConfig, ...config };
  }

  render(data) {
    // Clear previous content and render with ELK's orthogonal routing
    this.g.selectAll('*').remove();
    this.renderFallback(data);

    // Fit to view after initial render
    setTimeout(() => this.fitToView(), 100);
  }

  renderFallback(data) {
    // Cache obstacles for all edges (performance optimization)
    if (this.routingConfig.enableCollisionDetection) {
      this._cachedObstacles = this._getAllDeviceObstacles(data);
    }

    // Helper to recursively render children
    const renderNodes = (nodes, parentG, parentOffset = { x: 0, y: 0 }) => {
      nodes.forEach((node) => {
        // DEBUG: Log what ELK is providing
        // eslint-disable-next-line no-console
        console.log(
          `🔍 Node ${node.id}: ELK x=${node.x}, y=${node.y}, hasChildren=${!!(node.children && node.children.length)}, parentOffset=(${parentOffset.x}, ${parentOffset.y})`
        );

        // ELK provides coordinates relative to parent container
        // Add parent offset to get absolute SVG coordinates
        const absoluteX = parentOffset.x + (node.x || 0);
        const absoluteY = parentOffset.y + (node.y || 0);

        // eslint-disable-next-line no-console
        console.log(`   → Calculated absolute: (${absoluteX}, ${absoluteY})`);

        if (node.children && node.children.length) {
          // This is an area/container
          const groupG = parentG
            .append('g')
            .attr('class', 'area-container')
            .attr('data-id', node.id);

          groupG
            .append('rect')
            .attr('x', absoluteX)
            .attr('y', absoluteY)
            .attr('width', node.width || 400)
            .attr('height', node.height || 300)
            .attr('fill', 'rgba(240, 240, 240, 0.3)')
            .attr('stroke', '#999')
            .attr('stroke-width', 2)
            .attr('rx', 10);

          groupG
            .append('text')
            .attr('x', absoluteX + 10)
            .attr('y', absoluteY + 25)
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .attr('fill', '#666')
            .text(node.labels?.[0]?.text || node.id || 'Area');

          // Recurse into children with cumulative offset
          renderNodes(node.children, parentG, {
            x: absoluteX,
            y: absoluteY,
          });
        } else {
          // This is a device node
          const nodeG = parentG
            .append('g')
            .attr('class', 'device-node')
            .attr('data-id', node.id);

          // Get category for color
          const category = node.properties?.['hwMeta.category'] || 'default';
          const status = node.properties?.['hwMeta.status'] || 'Regular';
          const fillColor = this.getCategoryColor(category);
          const strokeColor = status === 'Defect' ? '#D0021B' : '#333';
          const strokeDash = status === 'Defect' ? '5,5' : 'none';

          nodeG
            .append('rect')
            .attr('class', 'device-box')
            .attr('x', absoluteX)
            .attr('y', absoluteY)
            .attr('width', node.width || 140)
            .attr('height', node.height || 80)
            .attr('rx', 5)
            .attr('fill', fillColor)
            .attr('stroke', strokeColor)
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', strokeDash)
            .attr('opacity', status === 'Existing' ? 0.7 : 1);

          nodeG
            .append('text')
            .attr('x', absoluteX + (node.width || 140) / 2)
            .attr('y', absoluteY + (node.height || 80) / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .attr('fill', '#000')
            .text(node.labels?.[0]?.text || node.id || 'Device');

          // Draw ports at ELK's calculated positions
          if (node.ports && node.ports.length > 0) {
            node.ports.forEach((port) => {
              // Use ELK's port position directly
              const px = absoluteX + (port.x !== undefined ? port.x : 0);
              const py = absoluteY + (port.y !== undefined ? port.y : 0);

              // DEBUG: Log port rendering positions
              // eslint-disable-next-line no-console
              console.log(
                `📍 Rendering port ${port.id} at (${px.toFixed(1)}, ${py.toFixed(1)}) - ELK port: (${port.x}, ${port.y}), node at (${absoluteX}, ${absoluteY})`
              );

              nodeG
                .append('circle')
                .attr('cx', px)
                .attr('cy', py)
                .attr('r', 5)
                .attr('fill', '#fff')
                .attr('stroke', '#333')
                .attr('stroke-width', 2);
            });
          }
        }
      });
    };

    // Clear previous content
    this.g.selectAll('*').remove();

    // Render all nodes/areas recursively
    if (data.children) {
      renderNodes(data.children, this.g);
    }

    // DEBUG: Visualize obstacle bounding boxes
    if (this.routingConfig.visualizeObstacles && this._cachedObstacles) {
      this._cachedObstacles.forEach((obs) => {
        this.g
          .append('rect')
          .attr('x', obs.x)
          .attr('y', obs.y)
          .attr('width', obs.width)
          .attr('height', obs.height)
          .attr('fill', 'none')
          .attr('stroke', 'red')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5')
          .attr('opacity', 0.5)
          .attr('pointer-events', 'none');
      });
    }

    // Render edges using ELK's computed orthogonal routing (or fallback for hierarchical edges)
    if (data.edges) {
      data.edges.forEach((edge, idx) => {
        let pathData = null;

        // TRY ELK ROUTING FIRST - it already does obstacle avoidance!
        if (edge.sections && edge.sections.length > 0) {
          const section = edge.sections[0];

          // CRITICAL: Find which container this edge belongs to
          // ELK places edges in the common ancestor container of source/target
          const sourceNodeId = edge.sources[0].split('/')[0];
          const targetNodeId = edge.targets[0].split('/')[0];
          const containerOffset = this.findEdgeContainer(
            edge,
            sourceNodeId,
            targetNodeId,
            data
          );

          // eslint-disable-next-line no-console
          console.log(
            `🔗 Edge ${edge.id}: container offset (${containerOffset.x}, ${containerOffset.y})`
          );

          // ELK provides sections with startPoint/endPoint
          // bendPoints may be omitted for straight edges (valid ELK output)
          const srcPos = this.findPortAbsolutePosition(
            edge.sources[0].split('/')[0],
            edge.sources[0].split('/')[1],
            data
          );
          const tgtPos = this.findPortAbsolutePosition(
            edge.targets[0].split('/')[0],
            edge.targets[0].split('/')[1],
            data
          );
          pathData = this.createPathFromELKSection(
            section,
            srcPos,
            tgtPos,
            containerOffset
          );
        } else {
          // ENHANCED LOGGING: Identify why ELK routing failed
          const sourceNodeId = edge.sources[0].split('/')[0];
          const targetNodeId = edge.targets[0].split('/')[0];
          const sourcePortKey = edge.sources[0].split('/')[1];
          const targetPortKey = edge.targets[0].split('/')[1];

          console.warn('⚠️ FALLBACK ROUTING ACTIVATED:', {
            edgeId: edge.id,
            source: `${sourceNodeId}/${sourcePortKey}`,
            target: `${targetNodeId}/${targetPortKey}`,
            reason: !edge.sections
              ? 'No sections array'
              : edge.sections.length === 0
                ? 'Empty sections array'
                : !edge.sections[0].bendPoints
                  ? 'No bendPoints in section[0]'
                  : 'Unknown',
            hasSections: !!edge.sections,
            sectionsCount: edge.sections?.length || 0,
            bendPointsCount: edge.sections?.[0]?.bendPoints?.length || 0,
            hasStartPoint: !!edge.sections?.[0]?.startPoint,
            hasEndPoint: !!edge.sections?.[0]?.endPoint,
          });

          // Fallback only when ELK doesn't provide routing
          pathData = this.createFallbackPath(edge, data, idx);
        }

        // Draw the edge path if we have valid path data
        if (pathData) {
          // Parse path to get all points for segment visualization
          const points = [];
          const commands =
            pathData.match(/[ML]\s*([0-9.]+)\s+([0-9.]+)/g) || [];
          commands.forEach((cmd) => {
            const match = cmd.match(/([0-9.]+)\s+([0-9.]+)/);
            if (match) {
              points.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
            }
          });

          // Draw edge path (neutral color by default, can be highlighted by debug panel)
          const edgePath = this.g
            .append('path')
            .attr('class', 'edge-path')
            .attr('data-id', edge.id)
            .attr('d', pathData)
            .attr('stroke', '#333') // Neutral color
            .attr('fill', 'none')
            .attr('stroke-width', 3)
            .attr('marker-end', 'url(#arrowhead)')
            .style('cursor', 'pointer')
            .datum(edge); // Bind edge data for debug panel

          // Add hover effect
          edgePath
            .on('mouseenter', function () {
              d3.select(this).attr('stroke', '#2563eb').attr('stroke-width', 4);
            })
            .on('mouseleave', function () {
              d3.select(this).attr('stroke', '#333').attr('stroke-width', 3);
            })
            .on('click', () => {
              // Notify debug panel of edge click
              if (window.debugPanel) {
                window.debugPanel.inspectEdge(edge.id);
              }
            });

          // Add edge label at optimal position (middle of longest segment)
          if (edge.labels && edge.labels[0]) {
            const labelPos = this.findLabelPosition(pathData);

            // Add label with background for better readability
            const labelText = edge.labels[0].text;
            const labelGroup = this.g.append('g').attr('class', 'edge-label');

            // Add semi-transparent background rectangle
            const tempText = labelGroup
              .append('text')
              .attr('x', labelPos.x)
              .attr('y', labelPos.y)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('font-size', '10px')
              .attr('visibility', 'hidden')
              .text(labelText);

            const bbox = tempText.node().getBBox();
            tempText.remove();

            labelGroup
              .append('rect')
              .attr('x', bbox.x - 2)
              .attr('y', bbox.y - 1)
              .attr('width', bbox.width + 4)
              .attr('height', bbox.height + 2)
              .attr('fill', 'rgba(255, 255, 255, 0.9)')
              .attr('rx', 2);

            labelGroup
              .append('text')
              .attr('x', labelPos.x)
              .attr('y', labelPos.y)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('font-size', '10px')
              .attr('font-weight', '500')
              .attr('fill', '#333')
              .text(labelText);
          }
        }
      });
    }
  }

  /**
   * Create SVG path from ELK edge section (with orthogonal routing)
   * CRITICAL: ELK's edge routing is in the container's local space!
   *
   * @param {object} section - ELK section with startPoint, bendPoints, endPoint
   * @param {object} srcPos - Our calculated source port position {x, y, side}
   * @param {object} tgtPos - Our calculated target port position {x, y, side}
   * @param {object} containerOffset - Container offset to add to ELK coordinates
   * @returns {string} SVG path data string
   */
  createPathFromELKSection(section, srcPos, tgtPos, containerOffset) {
    const bendPoints = section.bendPoints || [];
    const elkStart = section.startPoint;
    const elkEnd = section.endPoint;

    // Add container offset to convert from local to absolute coordinates
    const offsetX = containerOffset.x;
    const offsetY = containerOffset.y;

    let pathData = `M ${elkStart.x + offsetX} ${elkStart.y + offsetY}`;

    // Add all ELK bend points (with offset)
    bendPoints.forEach((bend) => {
      pathData += ` L ${bend.x + offsetX} ${bend.y + offsetY}`;
    });

    // End at ELK's end point (with offset)
    pathData += ` L ${elkEnd.x + offsetX} ${elkEnd.y + offsetY}`;

    return pathData;
  }

  /**
   * Find which container an edge belongs to
   * ELK places edges in the common ancestor container of source and target
   * Also checks edge.container property if available
   *
   * @param {object} edge - Edge object
   * @param {string} sourceNodeId - Source node ID
   * @param {string} targetNodeId - Target node ID
   * @param {object} data - Full graph data
   * @returns {object} Container offset {x, y}
   */
  findEdgeContainer(edge, sourceNodeId, targetNodeId, data) {
    // Check if edge has explicit container property
    if (edge.container) {
      return this.findContainerOffset(edge.container, data);
    }

    // Find common ancestor container of source and target nodes
    const srcPath = this.findNodePath(sourceNodeId, data);
    const tgtPath = this.findNodePath(targetNodeId, data);

    if (!srcPath || !tgtPath) {
      return { x: 0, y: 0 };
    }

    // Find common ancestor by comparing paths
    let commonAncestor = null;
    for (let i = 0; i < Math.min(srcPath.length, tgtPath.length); i++) {
      if (srcPath[i].id === tgtPath[i].id) {
        commonAncestor = srcPath[i];
      } else {
        break;
      }
    }

    // Return the absolute offset of the common ancestor
    if (commonAncestor) {
      return this.findContainerOffset(commonAncestor.id, data);
    }

    return { x: 0, y: 0 };
  }

  /**
   * Find the path from root to a node (list of containers)
   *
   * @param {string} nodeId - Node ID
   * @param {object} data - Full graph data
   * @returns {Array|null} Path of container nodes from root to target
   */
  findNodePath(nodeId, data) {
    const search = (nodes, path) => {
      for (const node of nodes) {
        const newPath = [...path, node];

        if (node.id === nodeId) {
          return newPath;
        }

        if (node.children) {
          const found = search(node.children, newPath);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    return search(data.children || [], []);
  }

  /**
   * Find the absolute offset of a container by ID
   *
   * @param {string} containerId - Container ID
   * @param {object} data - Full graph data
   * @returns {object} Absolute offset {x, y}
   */
  findContainerOffset(containerId, data) {
    const search = (nodes, offset) => {
      for (const node of nodes) {
        const absX = offset.x + (node.x || 0);
        const absY = offset.y + (node.y || 0);

        if (node.id === containerId) {
          return { x: absX, y: absY };
        }

        if (node.children) {
          const found = search(node.children, { x: absX, y: absY });
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    const result = search(data.children || [], { x: 0, y: 0 });
    return result || { x: 0, y: 0 };
  }

  /**
   * Create fallback orthogonal path for edges without ELK sections
   * Enhanced with port extensions and local obstacle avoidance
   *
   * @param {object} edge - Edge object with sources and targets
   * @param {object} data - Full graph data to find port positions
   * @returns {string} SVG path data string
   */
  createFallbackPath(edge, data) {
    const startTime = this.routingConfig.logPerformance ? performance.now() : 0;

    // Find source and target port positions
    const srcKey = edge.sources[0] || '';
    const tgtKey = edge.targets[0] || '';

    const [srcNodeId, srcPortKey] = srcKey.split('/');
    const [tgtNodeId, tgtPortKey] = tgtKey.split('/');

    // Find port positions in absolute coordinates
    const srcPos = this.findPortAbsolutePosition(srcNodeId, srcPortKey, data);
    const tgtPos = this.findPortAbsolutePosition(tgtNodeId, tgtPortKey, data);

    if (!srcPos || !tgtPos) {
      console.warn(`Could not find positions for edge ${edge.id}`);
      return null;
    }

    let pathData;

    if (!this.routingConfig.enableCollisionDetection) {
      // Simple Z-route (for debugging/comparison)
      const midX = (srcPos.x + tgtPos.x) / 2;
      const midY = (srcPos.y + tgtPos.y) / 2;

      if (srcPos.side === 'EAST' || srcPos.side === 'WEST') {
        pathData = `M ${srcPos.x} ${srcPos.y} L ${midX} ${srcPos.y} L ${midX} ${tgtPos.y} L ${tgtPos.x} ${tgtPos.y}`;
      } else {
        pathData = `M ${srcPos.x} ${srcPos.y} L ${srcPos.x} ${midY} L ${tgtPos.x} ${midY} L ${tgtPos.x} ${tgtPos.y}`;
      }
    } else {
      // Enhanced routing with port extensions and obstacle avoidance
      // Pass source and target node IDs to exclude them from obstacles
      const waypoints = this.routeWithLocalAvoidance(
        srcPos,
        tgtPos,
        data,
        srcNodeId,
        tgtNodeId
      );

      // Build SVG path from waypoints
      pathData = `M ${srcPos.x} ${srcPos.y}`;
      waypoints.forEach((wp) => {
        pathData += ` L ${wp.x} ${wp.y}`;
      });
      pathData += ` L ${tgtPos.x} ${tgtPos.y}`;
    }

    // Performance logging
    if (this.routingConfig.logPerformance) {
      const elapsed = (performance.now() - startTime).toFixed(2);
      // eslint-disable-next-line no-console
      console.log(`⚡ Edge ${edge.id}: ${elapsed}ms`);
    }

    return pathData;
  }

  /**
   * Find absolute position of a port in the rendered graph
   *
   * @param {string} nodeId - Node ID
   * @param {string} portKey - Port key
   * @param {object} data - Full graph data
   * @returns {object|null} {x, y, side} or null if not found
   */
  findPortAbsolutePosition(nodeId, portKey, data) {
    const search = (nodes, offset, _isArea) => {
      for (const node of nodes) {
        // Add parent offset to node position
        const x = offset.x + (node.x || 0);
        const y = offset.y + (node.y || 0);

        if (node.id === nodeId && node.ports) {
          // Found the node - calculate port position
          for (const port of node.ports) {
            if (port.id === `${nodeId}/${portKey}`) {
              const px = x + (port.x || 0);
              const py = y + (port.y || 0);
              const portSide =
                port.properties?.['org.eclipse.elk.portSide'] || 'EAST';

              // eslint-disable-next-line no-console
              console.log(
                `🎯 Port ${port.id}: offset=(${offset.x}, ${offset.y}), node=(${node.x}, ${node.y}), port=(${port.x}, ${port.y}) → absolute=(${px}, ${py})`
              );

              return { x: px, y: py, side: portSide };
            }
          }
        }

        if (node.children) {
          // Recurse with cumulative offset
          const found = search(node.children, { x, y }, true);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    return search(data.children || [], { x: 0, y: 0 }, false);
  }

  /**
   * Find the best position for a label on an SVG path (middle of longest segment).
   *
   * @param {string} pathData - SVG path data string
   * @returns {object} {x, y} coordinates for label placement
   */
  findLabelPosition(pathData) {
    // Parse path data to extract all points
    const points = [];
    const commands = pathData.match(/[ML]\s*([0-9.]+)\s+([0-9.]+)/g) || [];

    commands.forEach((cmd) => {
      const match = cmd.match(/([0-9.]+)\s+([0-9.]+)/);
      if (match) {
        points.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
      }
    });

    if (points.length < 2) {
      // Fallback: use first point if path is invalid
      return points[0] || { x: 0, y: 0 };
    }

    // Calculate length of each segment
    const segments = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const length = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
      );
      segments.push({
        start: p1,
        end: p2,
        length,
        midX: (p1.x + p2.x) / 2,
        midY: (p1.y + p2.y) / 2,
      });
    }

    // Find longest segment
    const longestSegment = segments.reduce((longest, current) =>
      current.length > longest.length ? current : longest
    );

    // Return midpoint of longest segment
    return {
      x: longestSegment.midX,
      y: longestSegment.midY,
    };
  }

  /**
   * Collect all device bounding boxes as obstacles (private helper)
   * Areas are not included - only leaf nodes (devices)
   *
   * @param {object} data - Full graph data
   * @returns {Array} Array of obstacle rectangles {id, x, y, width, height}
   * @private
   */
  _getAllDeviceObstacles(data) {
    const obstacles = [];
    const padding = this.routingConfig.obstaclePadding;

    const traverse = (nodes, offset = { x: 0, y: 0 }) => {
      for (const node of nodes) {
        // Add parent offset to get absolute position
        const absX = offset.x + (node.x || 0);
        const absY = offset.y + (node.y || 0);

        // Skip area containers (they have children)
        // Only collect device nodes (leaf nodes without children)
        if (!node.children || node.children.length === 0) {
          obstacles.push({
            id: node.id,
            x: absX - padding,
            y: absY - padding,
            width: (node.width || 140) + padding * 2,
            height: (node.height || 80) + padding * 2,
          });
        } else if (node.children) {
          // Recurse with cumulative offset
          traverse(node.children, { x: absX, y: absY });
        }
      }
    };

    traverse(data.children || []);
    return obstacles;
  }

  /**
   * Collect obstacles near a specific point (local search for performance)
   * Only obstacles within the specified radius are returned
   *
   * @param {object} point - Center point {x, y}
   * @param {number} radius - Search radius in pixels
   * @param {object} data - Full graph data
   * @param {Array} excludeNodeIds - Node IDs to exclude from obstacles (e.g., source/target)
   * @returns {Array} Nearby obstacles only
   */
  collectNearbyObstacles(point, radius, data, excludeNodeIds = []) {
    // Get all obstacles (cached if available)
    const allObstacles =
      this._cachedObstacles || this._getAllDeviceObstacles(data);

    // Filter to only obstacles within radius and not excluded
    return allObstacles.filter((obs) => {
      // Exclude source/target nodes
      if (excludeNodeIds.includes(obs.id)) {
        return false;
      }

      // Calculate distance from point to obstacle center
      const centerX = obs.x + obs.width / 2;
      const centerY = obs.y + obs.height / 2;
      const distance = Math.sqrt(
        Math.pow(centerX - point.x, 2) + Math.pow(centerY - point.y, 2)
      );
      return distance < radius;
    });
  }

  /**
   * Check if a line segment intersects with a rectangular obstacle
   * Uses Axis-Aligned Bounding Box (AABB) intersection test
   *
   * @param {object} p1 - Start point {x, y}
   * @param {object} p2 - End point {x, y}
   * @param {object} obstacle - Obstacle rectangle {x, y, width, height}
   * @returns {boolean} True if segment intersects obstacle
   */
  segmentIntersectsObstacle(p1, p2, obstacle) {
    // Create bounding box for the segment
    const segMinX = Math.min(p1.x, p2.x);
    const segMaxX = Math.max(p1.x, p2.x);
    const segMinY = Math.min(p1.y, p2.y);
    const segMaxY = Math.max(p1.y, p2.y);

    // Check if segment's bounding box intersects obstacle
    const intersects = !(
      segMaxX < obstacle.x ||
      segMinX > obstacle.x + obstacle.width ||
      segMaxY < obstacle.y ||
      segMinY > obstacle.y + obstacle.height
    );

    return intersects;
  }

  /**
   * Detect collisions in a path's waypoints (local segments only)
   * Only checks first N and last N segments for performance
   * Uses configurable protectedSegmentsCount for flexibility
   *
   * @param {Array} waypoints - Array of waypoint objects {x, y}
   * @param {Array} obstacles - Array of obstacle rectangles
   * @param {number} checkSegments - Number of segments to check from each end (defaults to config)
   * @returns {Array} Array of collision info {segmentIndex, obstacle}
   */
  detectLocalCollisions(waypoints, obstacles, checkSegments = null) {
    const collisions = [];

    if (waypoints.length < 2) {
      return collisions;
    }

    // Use config value if not specified
    const segmentsToCheck =
      checkSegments !== null
        ? checkSegments
        : this.routingConfig.protectedSegmentsCount;

    // Check first N segments (near source)
    const startCheck = Math.min(segmentsToCheck, waypoints.length - 1);
    for (let i = 0; i < startCheck; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];

      for (const obs of obstacles) {
        if (this.segmentIntersectsObstacle(p1, p2, obs)) {
          collisions.push({ segmentIndex: i, obstacle: obs });
          break; // Only record first collision per segment
        }
      }
    }

    // Check last N segments (near target) - MORE SEGMENTS as per user feedback
    const endStart = Math.max(
      waypoints.length - segmentsToCheck - 1,
      startCheck
    );
    for (let i = endStart; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];

      for (const obs of obstacles) {
        if (this.segmentIntersectsObstacle(p1, p2, obs)) {
          collisions.push({ segmentIndex: i, obstacle: obs });
          break; // Only record first collision per segment
        }
      }
    }

    return collisions;
  }

  /**
   * Calculate extension point from a port in its natural direction
   * This ensures edges extend outward from the port before routing
   *
   * @param {object} portPos - Port position with {x, y, side}
   * @returns {object} Extension point {x, y}
   */
  getExtensionPoint(portPos) {
    const extLength = this.routingConfig.extensionLength;

    switch (portPos.side) {
      case 'EAST':
        return { x: portPos.x + extLength, y: portPos.y };
      case 'WEST':
        return { x: portPos.x - extLength, y: portPos.y };
      case 'NORTH':
        return { x: portPos.x, y: portPos.y - extLength };
      case 'SOUTH':
        return { x: portPos.x, y: portPos.y + extLength };
      default:
        // Fallback to EAST if side is unknown
        return { x: portPos.x + extLength, y: portPos.y };
    }
  }

  /**
   * Route around local obstacles near a port (source or target)
   * REDESIGNED: Tests all possible routes and chooses first collision-free path
   *
   * @param {object} startPoint - Starting point {x, y}
   * @param {string} portSide - Port side (EAST, WEST, NORTH, SOUTH)
   * @param {Array} obstacles - Nearby obstacles
   * @param {object} targetPoint - End point to route toward {x, y}
   * @returns {Array} Waypoints to route around obstacles
   */
  routeAroundLocalObstacles(startPoint, portSide, obstacles, targetPoint) {
    const waypoints = [startPoint];
    const clearance = 20;

    // If no obstacles, just make simple perpendicular turn
    if (obstacles.length === 0) {
      if (portSide === 'EAST' || portSide === 'WEST') {
        waypoints.push({ x: startPoint.x, y: targetPoint.y });
      } else {
        waypoints.push({ x: targetPoint.x, y: startPoint.y });
      }
      return waypoints;
    }

    // Find bounding box of ALL obstacles to route around
    const minX = Math.min(...obstacles.map((o) => o.x));
    const maxX = Math.max(...obstacles.map((o) => o.x + o.width));
    const minY = Math.min(...obstacles.map((o) => o.y));
    const maxY = Math.max(...obstacles.map((o) => o.y + o.height));

    // REDESIGNED: Test multiple routing options and choose best
    const routeOptions = [];

    if (portSide === 'EAST' || portSide === 'WEST') {
      // Horizontal port - route above or below ALL obstacles
      // CRITICAL: Must clear obstacles in BOTH dimensions (vertical AND horizontal)

      // Option 1: Route above all obstacles
      const aboveY = minY - clearance;
      const clearHorizontal =
        portSide === 'EAST' ? maxX + clearance : minX - clearance;
      const routeAbove = [
        startPoint,
        { x: startPoint.x, y: aboveY }, // Go up
        { x: clearHorizontal, y: aboveY }, // Go past obstacles horizontally
        { x: clearHorizontal, y: targetPoint.y }, // Go down to target level
        { x: targetPoint.x, y: targetPoint.y }, // Go to target
      ];

      // Option 2: Route below all obstacles
      const belowY = maxY + clearance;
      const routeBelow = [
        startPoint,
        { x: startPoint.x, y: belowY }, // Go down
        { x: clearHorizontal, y: belowY }, // Go past obstacles horizontally
        { x: clearHorizontal, y: targetPoint.y }, // Go up to target level
        { x: targetPoint.x, y: targetPoint.y }, // Go to target
      ];

      routeOptions.push({ route: routeAbove, name: 'above' });
      routeOptions.push({ route: routeBelow, name: 'below' });
    } else {
      // Vertical port - route left or right of ALL obstacles
      // CRITICAL: Must clear obstacles in BOTH dimensions (horizontal AND vertical)

      // Option 1: Route to the right of all obstacles
      const rightX = maxX + clearance;
      const clearVertical =
        portSide === 'SOUTH' ? maxY + clearance : minY - clearance;
      const routeRight = [
        startPoint,
        { x: rightX, y: startPoint.y }, // Go right
        { x: rightX, y: clearVertical }, // Go past obstacles vertically
        { x: targetPoint.x, y: clearVertical }, // Go back to target X
        { x: targetPoint.x, y: targetPoint.y }, // Go to target
      ];

      // Option 2: Route to the left of all obstacles
      const leftX = minX - clearance;
      const routeLeft = [
        startPoint,
        { x: leftX, y: startPoint.y }, // Go left
        { x: leftX, y: clearVertical }, // Go past obstacles vertically
        { x: targetPoint.x, y: clearVertical }, // Go back to target X
        { x: targetPoint.x, y: targetPoint.y }, // Go to target
      ];

      routeOptions.push({ route: routeRight, name: 'right' });
      routeOptions.push({ route: routeLeft, name: 'left' });
    }

    // Test each route option and find first collision-free one
    for (const option of routeOptions) {
      const testRoute = option.route;
      let hasCollision = false;

      // Check every segment of this route
      for (let i = 0; i < testRoute.length - 1; i++) {
        const p1 = testRoute[i];
        const p2 = testRoute[i + 1];

        for (const obs of obstacles) {
          if (this.segmentIntersectsObstacle(p1, p2, obs)) {
            hasCollision = true;
            break;
          }
        }
        if (hasCollision) {
          break;
        }
      }

      if (!hasCollision) {
        // Found a collision-free route! Use it (skip first point as it's already in waypoints)
        for (let i = 1; i < testRoute.length - 1; i++) {
          waypoints.push(testRoute[i]);
        }
        return waypoints;
      }
    }

    // If we get here, both routes have collisions - just pick the shorter one
    // Calculate which direction has less distance
    const option1 = routeOptions[0].route;
    const option2 = routeOptions[1].route;

    let dist1 = 0,
      dist2 = 0;
    for (let i = 0; i < option1.length - 1; i++) {
      dist1 +=
        Math.abs(option1[i].x - option1[i + 1].x) +
        Math.abs(option1[i].y - option1[i + 1].y);
    }
    for (let i = 0; i < option2.length - 1; i++) {
      dist2 +=
        Math.abs(option2[i].x - option2[i + 1].x) +
        Math.abs(option2[i].y - option2[i + 1].y);
    }

    const chosenRoute = dist1 <= dist2 ? option1 : option2;
    for (let i = 1; i < chosenRoute.length - 1; i++) {
      waypoints.push(chosenRoute[i]);
    }

    return waypoints;
  }

  /**
   * Create middle routing between source-side and target-side waypoints
   * SIMPLIFIED: Just creates simple Z-connection (may cross distant nodes - acceptable per design)
   * This is per the original plan: "If the middle segment is crossing through nodes its acceptable!"
   *
   * @param {object} srcEnd - Last waypoint from source-side routing {x, y}
   * @param {object} tgtStart - First waypoint for target-side routing {x, y}
   * @param {string} srcSide - Source port side
   * @returns {Array} Middle waypoints
   */
  createMiddleRoute(srcEnd, tgtStart, srcSide) {
    const waypoints = [];

    // Simple Z-route for middle section (no obstacle checking - per design)
    if (srcSide === 'EAST' || srcSide === 'WEST') {
      // Horizontal start - create Z-shape
      const midX = (srcEnd.x + tgtStart.x) / 2;
      waypoints.push({ x: midX, y: srcEnd.y });
      waypoints.push({ x: midX, y: tgtStart.y });
    } else {
      // Vertical start - create Z-shape
      const midY = (srcEnd.y + tgtStart.y) / 2;
      waypoints.push({ x: srcEnd.x, y: midY });
      waypoints.push({ x: tgtStart.x, y: midY });
    }

    return waypoints;
  }

  /**
   * Route edge with local obstacle avoidance
   * Strategy: Avoid obstacles near source and target, allow middle crossings
   * Enhanced with extension collision detection
   *
   * @param {object} srcPos - Source port position {x, y, side}
   * @param {object} tgtPos - Target port position {x, y, side}
   * @param {object} data - Full graph data
   * @param {string} srcNodeId - Source node ID to exclude from obstacles
   * @param {string} tgtNodeId - Target node ID to exclude from obstacles
   * @returns {Array} Complete waypoint list
   */
  routeWithLocalAvoidance(srcPos, tgtPos, data, srcNodeId, tgtNodeId) {
    // 1. Calculate extension points
    const srcExt = this.getExtensionPoint(srcPos);
    const tgtExt = this.getExtensionPoint(tgtPos);

    // 2. Collect nearby obstacles for source and target (excluding source/target nodes)
    const srcObstacles = this.collectNearbyObstacles(
      srcPos,
      this.routingConfig.localSearchRadius,
      data,
      [srcNodeId, tgtNodeId] // Exclude both source and target from obstacles
    );
    const tgtObstacles = this.collectNearbyObstacles(
      tgtPos,
      this.routingConfig.localSearchRadius,
      data,
      [srcNodeId, tgtNodeId] // Exclude both source and target from obstacles
    );

    // CRITICAL FIX: Check if extension segments collide with obstacles
    // If they do, the extension points need to be adjusted
    const srcExtCollisions = this.detectLocalCollisions(
      [srcPos, srcExt],
      srcObstacles,
      1
    );

    const tgtExtCollisions = this.detectLocalCollisions(
      [tgtPos, tgtExt],
      tgtObstacles,
      1
    );

    // Adjust source extension if it collides
    let adjustedSrcExt = srcExt;
    if (srcExtCollisions.length > 0) {
      const obstacle = srcExtCollisions[0].obstacle;
      // Extend beyond the obstacle
      adjustedSrcExt = this.extendBeyondObstacle(srcPos, obstacle);
    }

    // Adjust target extension if it collides
    let adjustedTgtExt = tgtExt;
    if (tgtExtCollisions.length > 0) {
      const obstacle = tgtExtCollisions[0].obstacle;
      // Extend beyond the obstacle
      adjustedTgtExt = this.extendBeyondObstacle(tgtPos, obstacle);
    }

    // 3. Route around obstacles near source
    const srcWaypoints = this.routeAroundLocalObstacles(
      adjustedSrcExt,
      srcPos.side,
      srcObstacles,
      adjustedTgtExt
    );

    // 4. Route around obstacles near target (in reverse)
    const tgtWaypoints = this.routeAroundLocalObstacles(
      adjustedTgtExt,
      tgtPos.side,
      tgtObstacles,
      adjustedSrcExt
    );

    // 5. Create simple middle connection (NO obstacle checking - middle can cross nodes per design)
    const srcEndPoint = srcWaypoints[srcWaypoints.length - 1];
    const tgtStartPoint = tgtWaypoints[tgtWaypoints.length - 1];
    const middleWaypoints = this.createMiddleRoute(
      srcEndPoint,
      tgtStartPoint,
      srcPos.side
    );

    // 6. Combine all waypoints: src extension -> src routing -> middle -> tgt routing (reversed) -> tgt extension
    const tgtRouting = [...tgtWaypoints].reverse();

    return [...srcWaypoints, ...middleWaypoints, ...tgtRouting];
  }

  /**
   * Extend a point beyond an obstacle to avoid collision
   *
   * @param {object} portPos - Port position with {x, y, side}
   * @param {object} obstacle - Obstacle that is blocking the extension {x, y, width, height}
   * @returns {object} Extended point {x, y}
   */
  extendBeyondObstacle(portPos, obstacle) {
    const clearance = 20;

    switch (portPos.side) {
      case 'EAST':
        // Extend right beyond obstacle
        return {
          x: obstacle.x + obstacle.width + clearance,
          y: portPos.y,
        };
      case 'WEST':
        // Extend left beyond obstacle
        return {
          x: obstacle.x - clearance,
          y: portPos.y,
        };
      case 'NORTH':
        // Extend up beyond obstacle
        return {
          x: portPos.x,
          y: obstacle.y - clearance,
        };
      case 'SOUTH':
        // Extend down beyond obstacle
        return {
          x: portPos.x,
          y: obstacle.y + obstacle.height + clearance,
        };
      default:
        return { x: portPos.x, y: portPos.y };
    }
  }

  getCategoryColor(category) {
    const colors = {
      video: '#E24A6F',
      audio: '#4A90E2',
      network: '#50C878',
      control: '#F5A623',
      power: '#D0021B',
      display: '#9B59B6',
      wallplate: '#95A5A6',
      default: '#ddd',
    };
    return colors[category?.toLowerCase()] || colors.default;
  }

  zoomIn() {
    /* unchanged */
  }
  zoomOut() {
    /* unchanged */
  }
  zoomToScale(_scale) {
    /* unchanged */
  }
  resetZoom() {
    /* unchanged */
  }
  fitToView() {
    /* unchanged */
  }
  DeviceRenderer(_selection) {
    /* unchanged */
  }
  AreaRenderer(_selection) {
    /* unchanged */
  }
  EdgeRenderer(_selection) {
    /* unchanged */
  }
}

export default HwSchematicRenderer;
