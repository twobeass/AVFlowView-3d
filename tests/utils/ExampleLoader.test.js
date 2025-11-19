import { ExampleLoader } from '../../src/utils/ExampleLoader.js';

describe('ExampleLoader', () => {
  let loader;

  beforeEach(() => {
    loader = new ExampleLoader();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create instance with default base path', () => {
      expect(loader).toBeInstanceOf(ExampleLoader);
      expect(loader.basePath).toBe('/examples/');
    });

    it('should create instance with custom base path', () => {
      const customLoader = new ExampleLoader('/custom/path/');
      expect(customLoader.basePath).toBe('/custom/path/');
    });

    it('should accept empty string as base path', () => {
      const customLoader = new ExampleLoader('');
      expect(customLoader.basePath).toBe('');
    });
  });

  describe('listExamples', () => {
    it('should return array of example files', async () => {
      const examples = await loader.listExamples();
      expect(Array.isArray(examples)).toBe(true);
      expect(examples.length).toBeGreaterThan(0);
    });

    it('should return expected example filenames', async () => {
      const examples = await loader.listExamples();
      expect(examples).toContain('simple.json');
      expect(examples).toContain('medium.json');
      expect(examples).toContain('complex.json');
      expect(examples).toContain('heavy.json');
    });

    it('should return exactly 4 examples', async () => {
      const examples = await loader.listExamples();
      expect(examples).toHaveLength(4);
    });
  });

  describe('loadExample', () => {
    it('should load example successfully', async () => {
      const mockData = { nodes: [], edges: [] };
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await loader.loadExample('simple.json');
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/examples/simple.json');
    });

    it('should use custom base path when loading', async () => {
      const customLoader = new ExampleLoader('/custom/');
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ test: true }),
      });

      await customLoader.loadExample('test.json');
      expect(global.fetch).toHaveBeenCalledWith('/custom/test.json');
    });

    it('should throw error when fetch fails with 404', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(loader.loadExample('missing.json')).rejects.toThrow(
        'Failed to fetch example: missing.json (404)'
      );
    });

    it('should throw error when fetch fails with 500', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(loader.loadExample('error.json')).rejects.toThrow(
        'Failed to fetch example: error.json (500)'
      );
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(loader.loadExample('test.json')).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle JSON parse errors', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(loader.loadExample('bad.json')).rejects.toThrow(
        'Invalid JSON'
      );
    });

    it('should load different example files', async () => {
      const examples = ['simple.json', 'medium.json', 'complex.json'];

      for (const example of examples) {
        global.fetch.mockResolvedValue({
          ok: true,
          json: async () => ({ name: example }),
        });

        const result = await loader.loadExample(example);
        expect(result.name).toBe(example);
      }
    });
  });
});
