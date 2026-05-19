import { jest } from '@jest/globals';
import {
  saveToStorage,
  loadFromStorage,
  removeFromStorage,
  clearStorage,
  hasKey,
  getAllKeys,
  getStorageSize,
  isStorageAvailable,
  exportStorage,
  importStorage
} from './storage.js';

const STORAGE_PREFIX = 'multiapp_';

describe('Storage Module', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveToStorage', () => {
    it('should save value to localStorage with prefix', () => {
      const result = saveToStorage('testKey', { value: 123 });
      expect(result).toBe(true);
      expect(localStorage.getItem(STORAGE_PREFIX + 'testKey')).toBe('{"value":123}');
    });

    it('should return false and log error if localStorage throws', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });
      const result = saveToStorage('testKey', 'test');
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('loadFromStorage', () => {
    it('should load value from localStorage', () => {
      localStorage.setItem(STORAGE_PREFIX + 'testKey', '{"value":123}');
      const result = loadFromStorage('testKey');
      expect(result).toEqual({ value: 123 });
    });

    it('should return defaultValue if key does not exist', () => {
      const result = loadFromStorage('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('should return defaultValue and log error if JSON.parse fails', () => {
      localStorage.setItem(STORAGE_PREFIX + 'invalidJSON', 'not-json');
      const result = loadFromStorage('invalidJSON', 'default');
      expect(result).toBe('default');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('removeFromStorage', () => {
    it('should remove value from localStorage', () => {
      localStorage.setItem(STORAGE_PREFIX + 'testKey', 'data');
      const result = removeFromStorage('testKey');
      expect(result).toBe(true);
      expect(localStorage.getItem(STORAGE_PREFIX + 'testKey')).toBeNull();
    });

    it('should return false and log error if removeItem throws', () => {
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Remove failed');
      });
      const result = removeFromStorage('testKey');
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('clearStorage', () => {
    it('should remove all app-specific data from localStorage', () => {
      localStorage.setItem(STORAGE_PREFIX + 'key1', 'val1');
      localStorage.setItem(STORAGE_PREFIX + 'key2', 'val2');
      localStorage.setItem('otherPrefix_key3', 'val3');

      const result = clearStorage();

      expect(result).toBe(true);
      expect(localStorage.getItem(STORAGE_PREFIX + 'key1')).toBeNull();
      expect(localStorage.getItem(STORAGE_PREFIX + 'key2')).toBeNull();
      expect(localStorage.getItem('otherPrefix_key3')).toBe('val3');
    });

    it('should return false and log error if clearing fails', () => {
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Clear failed');
      });
      localStorage.setItem(STORAGE_PREFIX + 'key1', 'val1');

      const result = clearStorage();
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('hasKey', () => {
    it('should return true if key exists', () => {
      localStorage.setItem(STORAGE_PREFIX + 'existingKey', 'data');
      expect(hasKey('existingKey')).toBe(true);
    });

    it('should return false if key does not exist', () => {
      expect(hasKey('nonexistentKey')).toBe(false);
    });
  });

  describe('getAllKeys', () => {
    it('should return an array of keys without the prefix', () => {
      localStorage.setItem(STORAGE_PREFIX + 'key1', 'val1');
      localStorage.setItem(STORAGE_PREFIX + 'key2', 'val2');
      localStorage.setItem('otherPrefix_key3', 'val3');

      const keys = getAllKeys();
      expect(keys).toEqual(expect.arrayContaining(['key1', 'key2']));
      expect(keys).not.toContain('otherPrefix_key3');
      expect(keys.length).toBe(2);
    });

    it('should return empty array on error', () => {
      const originalKeys = Object.keys;
      jest.spyOn(Object, 'keys').mockImplementation((obj) => {
        if (obj === localStorage) throw new Error('Keys failed');
        return originalKeys(obj);
      });
      const keys = getAllKeys();
      expect(keys).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getStorageSize', () => {
    it('should calculate the size of storage used by the app', () => {
      const key = STORAGE_PREFIX + 'key';
      const val = 'val';
      localStorage.setItem(key, val);

      const size = getStorageSize();
      // Length of key string + length of value string
      expect(size).toBe(key.length + val.length);
    });

    it('should return 0 on error', () => {
      const originalKeys = Object.keys;
      jest.spyOn(Object, 'keys').mockImplementation((obj) => {
        if (obj === localStorage) throw new Error('Size failed');
        return originalKeys(obj);
      });
      const size = getStorageSize();
      expect(size).toBe(0);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('isStorageAvailable', () => {
    it('should return true if localStorage is available', () => {
      expect(isStorageAvailable()).toBe(true);
    });

    it('should return false if localStorage throws an error', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage unavailable');
      });
      expect(isStorageAvailable()).toBe(false);
    });
  });

  describe('exportStorage', () => {
    it('should return an object with all app data', () => {
      saveToStorage('k1', 'v1');
      saveToStorage('k2', { v2: 2 });

      const exported = exportStorage();
      expect(exported).toEqual({
        k1: 'v1',
        k2: { v2: 2 }
      });
    });

    it('should return empty object on error', () => {
      const originalKeys = Object.keys;
      jest.spyOn(Object, 'keys').mockImplementation((obj) => {
        if (obj === localStorage) throw new Error('Export failed');
        return originalKeys(obj);
      });
      saveToStorage('k1', 'v1');

      const exported = exportStorage();
      expect(exported).toEqual({});
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('importStorage', () => {
    it('should import data and replace existing data by default', () => {
      saveToStorage('oldKey', 'oldData');

      const newData = { newKey1: 'new1', newKey2: 'new2' };
      const result = importStorage(newData);

      expect(result).toBe(true);
      expect(loadFromStorage('oldKey')).toBeNull();
      expect(loadFromStorage('newKey1')).toBe('new1');
      expect(loadFromStorage('newKey2')).toBe('new2');
    });

    it('should merge data if merge flag is true', () => {
      saveToStorage('existingKey', 'oldData');
      saveToStorage('mergeKey', 'oldVal');

      const newData = { mergeKey: 'newVal', newKey: 'new1' };
      const result = importStorage(newData, true);

      expect(result).toBe(true);
      expect(loadFromStorage('existingKey')).toBe('oldData');
      expect(loadFromStorage('mergeKey')).toBe('newVal');
      expect(loadFromStorage('newKey')).toBe('new1');
    });

    it('should return false on error', () => {
      // Pass null to cause Object.entries(null) to throw an error
      const result = importStorage(null);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });
});
