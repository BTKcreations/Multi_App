/**
 * Theme Module - Manages application theming
 * Handles theme switching and dark/light mode
 */

import { getStateValue, setState } from './state.js';
import { saveToStorage, loadFromStorage } from './storage.js';

const THEME_KEY = 'appTheme';
const THEMES = {
  light: 'light',
  dark: 'dark',
  auto: 'auto'
};

/**
 * Initialize theme based on saved preference or system preference
 */
export function initializeTheme() {
  const savedTheme = loadFromStorage(THEME_KEY);
  const theme = savedTheme || THEMES.auto;
  applyTheme(theme);
}

/**
 * Apply a theme to the document
 * @param {string} theme - Theme name ('light', 'dark', or 'auto')
 */
export function applyTheme(theme) {
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('theme-light', 'theme-dark');
  
  let effectiveTheme = theme;
  
  // Handle auto theme based on system preference
  if (theme === THEMES.auto) {
    effectiveTheme = getSystemTheme();
  }
  
  // Apply theme class
  root.classList.add(`theme-${effectiveTheme}`);
  root.setAttribute('data-theme', effectiveTheme);
  
  // Update state and storage
  setState({ theme: effectiveTheme }, false);
  saveToStorage(THEME_KEY, theme); // Save the user's preference (not auto-resolved)
}

/**
 * Get the system's preferred theme
 * @returns {string} 'light' or 'dark'
 */
function getSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return THEMES.dark;
  }
  return THEMES.light;
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme() {
  const currentTheme = getStateValue('theme');
  const newTheme = currentTheme === THEMES.light ? THEMES.dark : THEMES.light;
  applyTheme(newTheme);
}

/**
 * Set a specific theme
 * @param {string} theme - Theme to set ('light', 'dark', or 'auto')
 */
export function setTheme(theme) {
  if (Object.values(THEMES).includes(theme)) {
    applyTheme(theme);
  } else {
    console.warn(`Invalid theme: ${theme}`);
  }
}

/**
 * Get the current theme
 * @returns {string} Current theme
 */
export function getCurrentTheme() {
  return getStateValue('theme') || THEMES.light;
}

/**
 * Get available themes
 * @returns {Object} Object containing theme constants
 */
export function getAvailableThemes() {
  return { ...THEMES };
}

/**
 * Listen for system theme changes (when using auto theme)
 */
export function watchSystemTheme() {
  if (window.matchMedia) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    darkModeQuery.addEventListener('change', (e) => {
      const savedTheme = loadFromStorage(THEME_KEY);
      if (savedTheme === THEMES.auto) {
        applyTheme(THEMES.auto);
      }
    });
  }
}

/**
 * Apply custom theme colors
 * @param {Object} colors - Object containing CSS custom property values
 */
export function applyCustomColors(colors) {
  const root = document.documentElement;
  
  Object.entries(colors).forEach(([property, value]) => {
    root.style.setProperty(`--${property}`, value);
  });
}

/**
 * Reset custom colors to defaults
 */
export function resetCustomColors() {
  const root = document.documentElement;
  const customProperties = Array.from(root.style)
    .filter(prop => prop.startsWith('--'));
  
  customProperties.forEach(prop => {
    root.style.removeProperty(prop);
  });
}
