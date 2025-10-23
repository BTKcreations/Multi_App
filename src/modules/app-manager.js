/**
 * App Manager Module - Manages app data and loading
 * Handles app registration, loading, and management
 */

import { loadFromStorage, saveToStorage } from './storage.js';
import { addRecentApp } from './state.js';

const APPS_KEY = 'apps';
const DEFAULT_APPS_KEY = 'defaultApps';

// In-memory app storage
let apps = [];

/**
 * Initialize apps from storage or defaults
 */
export function initializeApps() {
  const storedApps = loadFromStorage(APPS_KEY);
  
  if (storedApps && storedApps.length > 0) {
    apps = storedApps;
  } else {
    apps = getDefaultApps();
    saveToStorage(APPS_KEY, apps);
  }
  
  return apps;
}

/**
 * Get all apps
 * @returns {Array} Array of app objects
 */
export function getApps() {
  return [...apps]; // Return a copy
}

/**
 * Get app by ID
 * @param {string} id - App ID
 * @returns {Object|null} App object or null
 */
export function getAppById(id) {
  return apps.find(app => app.id === id) || null;
}

/**
 * Add a new app
 * @param {Object} app - App object to add
 * @returns {Object} Added app with generated ID
 */
export function addApp(app) {
  const newApp = {
    id: generateId(),
    name: app.name || 'Unnamed App',
    url: app.url || '',
    description: app.description || '',
    icon: app.icon || '📱',
    category: app.category || 'other',
    tags: app.tags || [],
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usageCount: 0
  };
  
  apps.push(newApp);
  saveToStorage(APPS_KEY, apps);
  
  return newApp;
}

/**
 * Update an existing app
 * @param {string} id - App ID
 * @param {Object} updates - Updates to apply
 * @returns {Object|null} Updated app or null
 */
export function updateApp(id, updates) {
  const index = apps.findIndex(app => app.id === id);
  
  if (index === -1) {
    return null;
  }
  
  apps[index] = { ...apps[index], ...updates };
  saveToStorage(APPS_KEY, apps);
  
  return apps[index];
}

/**
 * Delete an app
 * @param {string} id - App ID to delete
 * @returns {boolean} True if deleted, false otherwise
 */
export function deleteApp(id) {
  const index = apps.findIndex(app => app.id === id);
  
  if (index === -1) {
    return false;
  }
  
  apps.splice(index, 1);
  saveToStorage(APPS_KEY, apps);
  
  return true;
}

/**
 * Launch an app and track usage
 * @param {string} id - App ID
 * @returns {boolean} True if launched, false otherwise
 */
export function launchApp(id) {
  const app = getAppById(id);
  
  if (!app || !app.url) {
    return false;
  }
  
  // Update usage stats
  updateApp(id, {
    lastUsed: new Date().toISOString(),
    usageCount: (app.usageCount || 0) + 1
  });
  
  // Add to recent apps
  addRecentApp(id);
  
  // Open in new tab
  window.open(app.url, '_blank');
  
  return true;
}

/**
 * Get default apps
 * @returns {Array} Default app list
 */
function getDefaultApps() {
  return [
    {
      id: 'app-1',
      name: 'Calculator',
      url: '/apps/calculator.html',
      description: 'Simple calculator application',
      icon: '🧮',
      category: 'tools',
      tags: ['math', 'calculator', 'utility'],
      createdAt: new Date().toISOString(),
      lastUsed: null,
      usageCount: 0
    },
    {
      id: 'app-2',
      name: 'Weather',
      url: '/apps/weather.html',
      description: 'Check current weather and forecasts',
      icon: '☀️',
      category: 'lifestyle',
      tags: ['weather', 'forecast', 'climate'],
      createdAt: new Date().toISOString(),
      lastUsed: null,
      usageCount: 0
    },
    {
      id: 'app-3',
      name: 'Todo List',
      url: '/apps/todo.html',
      description: 'Manage your tasks and todos',
      icon: '✅',
      category: 'productivity',
      tags: ['todo', 'tasks', 'checklist'],
      createdAt: new Date().toISOString(),
      lastUsed: null,
      usageCount: 0
    },
    {
      id: 'app-4',
      name: 'Notes',
      url: '/apps/notes.html',
      description: 'Take and organize notes',
      icon: '📝',
      category: 'productivity',
      tags: ['notes', 'writing', 'notepad'],
      createdAt: new Date().toISOString(),
      lastUsed: null,
      usageCount: 0
    }
  ];
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
function generateId() {
  return `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Import apps from JSON
 * @param {Array} importedApps - Apps to import
 * @returns {number} Number of apps imported
 */
export function importApps(importedApps) {
  if (!Array.isArray(importedApps)) {
    return 0;
  }
  
  let count = 0;
  
  importedApps.forEach(app => {
    if (app.name && app.url) {
      addApp(app);
      count++;
    }
  });
  
  return count;
}

/**
 * Export apps to JSON
 * @returns {Array} Apps array
 */
export function exportApps() {
  return getApps();
}

/**
 * Reset apps to defaults
 */
export function resetApps() {
  apps = getDefaultApps();
  saveToStorage(APPS_KEY, apps);
}
