/**
 * Storage Module - LocalStorage wrapper with error handling
 * Provides safe localStorage operations with JSON serialization
 */

const STORAGE_PREFIX = 'multiapp_';

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {boolean} True if successful, false otherwise
 */
export function saveToStorage(key, value) {
  try {
    const prefixedKey = STORAGE_PREFIX + key;
    const serialized = JSON.stringify(value);
    localStorage.setItem(prefixedKey, serialized);
    return true;
  } catch (error) {
    console.error('Error saving to storage:', error);
    return false;
  }
}

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Stored value or default value
 */
export function loadFromStorage(key, defaultValue = null) {
  try {
    const prefixedKey = STORAGE_PREFIX + key;
    const serialized = localStorage.getItem(prefixedKey);
    
    if (serialized === null) {
      return defaultValue;
    }
    
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Error loading from storage:', error);
    return defaultValue;
  }
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} True if successful, false otherwise
 */
export function removeFromStorage(key) {
  try {
    const prefixedKey = STORAGE_PREFIX + key;
    localStorage.removeItem(prefixedKey);
    return true;
  } catch (error) {
    console.error('Error removing from storage:', error);
    return false;
  }
}

/**
 * Clear all app data from localStorage
 * @returns {boolean} True if successful, false otherwise
 */
export function clearStorage() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
}

/**
 * Check if a key exists in storage
 * @param {string} key - Storage key
 * @returns {boolean} True if key exists
 */
export function hasKey(key) {
  const prefixedKey = STORAGE_PREFIX + key;
  return localStorage.getItem(prefixedKey) !== null;
}

/**
 * Get all storage keys (without prefix)
 * @returns {Array} Array of storage keys
 */
export function getAllKeys() {
  try {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .map(key => key.substring(STORAGE_PREFIX.length));
  } catch (error) {
    console.error('Error getting storage keys:', error);
    return [];
  }
}

/**
 * Get storage size in bytes
 * @returns {number} Approximate storage size in bytes
 */
export function getStorageSize() {
  try {
    let size = 0;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        size += localStorage.getItem(key).length + key.length;
      }
    });
    return size;
  } catch (error) {
    console.error('Error getting storage size:', error);
    return 0;
  }
}

/**
 * Check if storage is available
 * @returns {boolean} True if localStorage is available
 */
export function isStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Export all storage data
 * @returns {Object} Object containing all storage data
 */
export function exportStorage() {
  try {
    const data = {};
    const keys = getAllKeys();
    
    keys.forEach(key => {
      data[key] = loadFromStorage(key);
    });
    
    return data;
  } catch (error) {
    console.error('Error exporting storage:', error);
    return {};
  }
}

/**
 * Import storage data
 * @param {Object} data - Data to import
 * @param {boolean} merge - Whether to merge with existing data (default: false)
 * @returns {boolean} True if successful, false otherwise
 */
export function importStorage(data, merge = false) {
  try {
    if (!merge) {
      clearStorage();
    }
    
    Object.entries(data).forEach(([key, value]) => {
      saveToStorage(key, value);
    });
    
    return true;
  } catch (error) {
    console.error('Error importing storage:', error);
    return false;
  }
}
