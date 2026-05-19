import { saveToStorage, loadFromStorage, removeFromStorage, clearStorage, hasKey, getAllKeys, getStorageSize, isStorageAvailable, exportStorage, importStorage } from '../src/modules/storage.js';

describe('Storage Module', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear mocks
    jest.clearAllMocks();
  });

  describe('saveToStorage', () => {
    it('should save data to localStorage successfully', () => {
      const result = saveToStorage('testKey', { test: 'data' });

      expect(result).toBe(true);
      expect(localStorage.getItem('multiapp_testKey')).toBe('{"test":"data"}');
    });

    it('should handle errors and return false when saving fails', () => {
      // Mock localStorage.setItem to throw an error
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = saveToStorage('testKey', { test: 'data' });

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error saving to storage:', expect.any(Error));

      mockSetItem.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('loadFromStorage', () => {
    it('should load data from localStorage successfully', () => {
      localStorage.setItem('multiapp_testKey', '{"test":"data"}');

      const result = loadFromStorage('testKey');

      expect(result).toEqual({ test: 'data' });
    });

    it('should return default value if key does not exist', () => {
      const result = loadFromStorage('nonExistentKey', 'defaultValue');

      expect(result).toBe('defaultValue');
    });

    it('should handle errors and return default value when loading fails', () => {
      // Invalid JSON will cause JSON.parse to throw
      localStorage.setItem('multiapp_testKey', '{invalid json}');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = loadFromStorage('testKey', 'defaultValue');

      expect(result).toBe('defaultValue');
      expect(consoleSpy).toHaveBeenCalledWith('Error loading from storage:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('removeFromStorage', () => {
    it('should remove data from localStorage successfully', () => {
      localStorage.setItem('multiapp_testKey', '{"test":"data"}');

      const result = removeFromStorage('testKey');

      expect(result).toBe(true);
      expect(localStorage.getItem('multiapp_testKey')).toBeNull();
    });

    it('should handle errors and return false when removing fails', () => {
      const mockRemoveItem = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Error removing item');
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = removeFromStorage('testKey');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error removing from storage:', expect.any(Error));

      mockRemoveItem.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('clearStorage', () => {
    it('should clear only app data from localStorage', () => {
      localStorage.setItem('multiapp_testKey1', '1');
      localStorage.setItem('multiapp_testKey2', '2');
      localStorage.setItem('other_key', '3');

      const result = clearStorage();

      expect(result).toBe(true);
      expect(localStorage.getItem('multiapp_testKey1')).toBeNull();
      expect(localStorage.getItem('multiapp_testKey2')).toBeNull();
      expect(localStorage.getItem('other_key')).toBe('3');
    });

    it('should handle errors and return false when clearing fails', () => {
      // Mock Object.keys or removeItem
      const mockRemoveItem = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Error removing item');
      });
      localStorage.setItem('multiapp_testKey', '1');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = clearStorage();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error clearing storage:', expect.any(Error));

      mockRemoveItem.mockRestore();
      consoleSpy.mockRestore();
    });
  });
});
