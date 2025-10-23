/**
 * State Module - Manages application state
 * Centralized state management with change notifications
 */

import { saveToStorage, loadFromStorage } from './storage.js';

// Application state
let state = {
  searchQuery: '',
  currentCategory: 'all',
  theme: 'light',
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  recentApps: [],
  favoriteApps: [],
  settings: {
    animations: true,
    compactMode: false,
    showDescriptions: true
  }
};

// State change listeners
const listeners = new Set();

/**
 * Initialize state from localStorage
 */
export function initializeState() {
  const savedState = loadFromStorage('appState');
  if (savedState) {
    state = { ...state, ...savedState };
  }
  notifyListeners();
}

/**
 * Get the current state
 * @returns {Object} Current application state
 */
export function getState() {
  return { ...state }; // Return a copy to prevent direct mutations
}

/**
 * Get a specific state value
 * @param {string} key - State key to retrieve
 * @returns {*} State value
 */
export function getStateValue(key) {
  return state[key];
}

/**
 * Update state with new values
 * @param {Object} updates - Object containing state updates
 * @param {boolean} persist - Whether to persist to localStorage (default: true)
 */
export function setState(updates, persist = true) {
  const oldState = { ...state };
  state = { ...state, ...updates };
  
  if (persist) {
    saveToStorage('appState', state);
  }
  
  notifyListeners(oldState, state);
}

/**
 * Reset state to initial values
 */
export function resetState() {
  state = {
    searchQuery: '',
    currentCategory: 'all',
    theme: 'light',
    sidebarCollapsed: false,
    commandPaletteOpen: false,
    recentApps: [],
    favoriteApps: [],
    settings: {
      animations: true,
      compactMode: false,
      showDescriptions: true
    }
  };
  saveToStorage('appState', state);
  notifyListeners();
}

/**
 * Subscribe to state changes
 * @param {Function} listener - Function to call on state change
 * @returns {Function} Unsubscribe function
 */
export function subscribeToState(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Notify all listeners of state changes
 * @param {Object} oldState - Previous state
 * @param {Object} newState - New state
 */
function notifyListeners(oldState = {}, newState = state) {
  listeners.forEach(listener => {
    try {
      listener(newState, oldState);
    } catch (error) {
      console.error('Error in state listener:', error);
    }
  });
}

/**
 * Update search query
 * @param {string} query - Search query
 */
export function setSearchQuery(query) {
  setState({ searchQuery: query });
}

/**
 * Update current category
 * @param {string} category - Category name
 */
export function setCategory(category) {
  setState({ currentCategory: category });
}

/**
 * Toggle sidebar collapsed state
 */
export function toggleSidebarCollapsed() {
  setState({ sidebarCollapsed: !state.sidebarCollapsed });
}

/**
 * Add app to recent apps list
 * @param {string} appId - App ID to add
 */
export function addRecentApp(appId) {
  const recentApps = [appId, ...state.recentApps.filter(id => id !== appId)].slice(0, 10);
  setState({ recentApps });
}

/**
 * Toggle favorite app
 * @param {string} appId - App ID to toggle
 */
export function toggleFavoriteApp(appId) {
  const favoriteApps = state.favoriteApps.includes(appId)
    ? state.favoriteApps.filter(id => id !== appId)
    : [...state.favoriteApps, appId];
  setState({ favoriteApps });
}

/**
 * Update settings
 * @param {Object} updates - Settings updates
 */
export function updateSettings(updates) {
  setState({
    settings: { ...state.settings, ...updates }
  });
}
