import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

import schema from '../schemas/av-wiring-graph.schema.json';

const ajv = new Ajv2020({
  strict: false,
  allErrors: true,
  allowUnionTypes: true,
});

addFormats(ajv);

const validate = ajv.compile(schema);

function buildCrossReferenceErrors(json) {
  const errors = [];

  if (!json || typeof json !== 'object') {
    return errors;
  }

  const graph = json;

  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const areas = Array.isArray(graph.areas) ? graph.areas : [];
  const edges = Array.isArray(graph.edges) ? graph.edges : [];

  const nodeIds = new Set(nodes.map((n) => n && n.id).filter(Boolean));
  const areaIds = new Set(areas.map((a) => a && a.id).filter(Boolean));

  // Edge → node reference checks
  edges.forEach((edge, index) => {
    if (!edge || typeof edge !== 'object') return;

    if (edge.source && !nodeIds.has(edge.source)) {
      errors.push({
        instancePath: `/edges/${index}/source`,
        message: `Edge.source references unknown node id "${edge.source}"`,
        keyword: 'ref-node',
        params: { missingNodeId: edge.source },
      });
    }

    if (edge.target && !nodeIds.has(edge.target)) {
      errors.push({
        instancePath: `/edges/${index}/target`,
        message: `Edge.target references unknown node id "${edge.target}"`,
        keyword: 'ref-node',
        params: { missingNodeId: edge.target },
      });
    }
  });

  // Area → parent area reference checks
  areas.forEach((area, index) => {
    if (!area || typeof area !== 'object') return;

    if (area.parentId && !areaIds.has(area.parentId)) {
      errors.push({
        instancePath: `/areas/${index}/parentId`,
        message: `Area.parentId references unknown area id "${area.parentId}"`,
        keyword: 'ref-area',
        params: { missingAreaId: area.parentId },
      });
    }
  });

  return errors;
}

export class SchemaValidator {
  /**
   * Validate an AV wiring graph JSON object against the av-wiring-graph schema
   * and perform additional cross-reference checks (edges → nodes, areas → parent areas).
   * Returns a normalized success/failure result as required by AGENT_README.
   *
   * @param {unknown} json
   * @returns {{ success: true } | { success: false; error: { code: string; message: string; details: Array<{ path: string; message?: string; keyword: string; params: Record<string, unknown> }> } }}
   */
  // eslint-disable-next-line class-methods-use-this
  validateGraph(json) {
    const structurallyValid = validate(json);

    // Ajv collects structural validation errors here (draft 2020-12 support).
    const structuralErrors = validate.errors || [];

    // Perform semantic cross-reference checks only if the overall shape is an object.
    const crossRefErrors = buildCrossReferenceErrors(json);

    const allErrors = [...structuralErrors, ...crossRefErrors];

    if (structurallyValid && allErrors.length === 0) {
      return { success: true };
    }

    const details = allErrors.map((err) => ({
      path: err.instancePath || err.schemaPath,
      message: err.message,
      keyword: err.keyword,
      // Ajv's params provide machine-readable context (expected value, limit, etc.).
      params: err.params || {},
    }));

    return {
      success: false,
      error: {
        code: 'SCHEMA_VALIDATION_FAILED',
        message: 'Graph JSON does not conform to av-wiring-graph.schema.json',
        details,
      },
    };
  }
}
