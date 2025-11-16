// src/utils/ExampleLoader.js

export class ExampleLoader {
  constructor(basePath = '/examples/') {
    this.basePath = basePath;
  }

  async listExamples() {
    try {
      // Dummy list. In real app, this might come from an API endpoint or manifest file.
      return [
        'simple.json',
        'complex-setup.json',
        'networked-room.json'
      ];
    } catch (error) {
      console.error('Failed to list examples:', error);
      return [];
    }
  }

  async loadExample(name) {
    try {
      const response = await fetch(this.basePath + name);
      if (!response.ok) throw new Error(`Failed to fetch example: ${name}`);
      const json = await response.json();
      return json;
    } catch (error) {
      console.error(`Error loading example ${name}:`, error);
      throw error;
    }
  }
}
