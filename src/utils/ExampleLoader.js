// src/utils/ExampleLoader.js

export class ExampleLoader {
  constructor(basePath = '/examples/') {
    this.basePath = basePath;
  }

  async listExamples() {
    try {
      // List of available example files in the repository
      // These correspond to actual files in the /examples/ directory
      // NOTE: To add new examples, simply add the filename to this array
      return ['simple.json', 'medium.json', 'complex.json', 'heavy.json'];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to list examples:', error);
      return [];
    }
  }

  async loadExample(name) {
    try {
      const response = await fetch(this.basePath + name);
      if (!response.ok)
        throw new Error(
          `Failed to fetch example: ${name} (${response.status})`
        );
      const json = await response.json();
      return json;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error loading example ${name}:`, error);
      throw error;
    }
  }
}
