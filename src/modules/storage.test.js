import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadFromStorage } from './storage.js';

describe('loadFromStorage error paths', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return defaultValue and catch error when JSON is invalid', () => {
    localStorage.setItem('multiapp_testKey', '{invalid_json}');

    const result = loadFromStorage('testKey', 'fallback');

    expect(result).toBe('fallback');
    expect(console.error).toHaveBeenCalledWith(
      'Error loading from storage:',
      expect.any(SyntaxError)
    );
  });

  it('should return defaultValue and catch error when localStorage.getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage access denied');
    });

    const result = loadFromStorage('testKey', 'fallback');

    expect(result).toBe('fallback');
    expect(console.error).toHaveBeenCalledWith(
      'Error loading from storage:',
      expect.any(Error)
    );
  });
});
