import FocusManager from '../../src/interaction/FocusManager.js';

describe('FocusManager', () => {
  it('should be defined', () => {
    expect(FocusManager).toBeDefined();
  });

  it('should be instantiable', () => {
    const manager = new FocusManager();
    expect(manager).not.toBeNull();
  });
});
