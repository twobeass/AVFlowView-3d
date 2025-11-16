import Ajv from 'ajv';

import schema from '../schemas/av-wiring-graph.schema.json';

const ajv = new Ajv({
  strict: false,
  allErrors: true,
  allowUnionTypes: true,
});

const validate = ajv.compile(schema);

export class SchemaValidator {
  /**
   * Validate an AV wiring graph JSON object against the av-wiring-graph schema.
   * Returns a normalized success/failure result as required by AGENT_README.
   *
   * @param {unknown} json
   * @returns {{ success: true } | { success: false; error: { code: string; message: string; details: Array<{ path: string; message?: string; keyword: string; params: Record<string, unknown> }> } }}
   */
  // eslint-disable-next-line class-methods-use-this
  validateGraph(json) {
    const valid = validate(json);

    if (valid) {
      return { success: true };
    }

    const details = (validate.errors || []).map((err) => ({
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
