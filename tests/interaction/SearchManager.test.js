import { SearchManager } from '../../src/interaction/SearchManager.js';

describe('SearchManager', () => {
  it('should be defined', () => {
    expect(SearchManager).toBeDefined();
  });

  it('should be instantiable', () => {
    const manager = new SearchManager();
    expect(manager).not.toBeNull();
  });
});
