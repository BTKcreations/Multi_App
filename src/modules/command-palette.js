/**
 * Command Palette Module - Command palette logic
 * Provides keyboard-driven command execution
 */

import { getState, setState } from './state.js';
import { getApps, launchApp } from './app-manager.js';
import { searchApps } from './search.js';
import { $ } from './dom.js';

let commandPaletteElement = null;
let inputElement = null;
let resultsElement = null;
let selectedIndex = 0;

/**
 * Initialize the command palette
 */
export function initializeCommandPalette() {
  createCommandPalette();
  setupKeyboardShortcuts();
}

/**
 * Create the command palette DOM structure
 */
function createCommandPalette() {
  const palette = document.createElement('div');
  palette.id = 'command-palette';
  palette.className = 'command-palette hidden';
  palette.innerHTML = `
    <div class="command-palette-backdrop"></div>
    <div class="command-palette-modal">
      <div class="command-palette-header">
        <input 
          type="text" 
          class="command-palette-input" 
          placeholder="Type a command or search for an app..."
          autocomplete="off"
        />
        <button class="command-palette-close" aria-label="Close">×</button>
      </div>
      <div class="command-palette-results"></div>
      <div class="command-palette-footer">
        <span>↑↓ Navigate</span>
        <span>↵ Select</span>
        <span>Esc Close</span>
      </div>
    </div>
  `;
  
  document.body.appendChild(palette);
  
  commandPaletteElement = palette;
  inputElement = palette.querySelector('.command-palette-input');
  resultsElement = palette.querySelector('.command-palette-results');
  
  // Event listeners
  inputElement.addEventListener('input', handleInput);
  inputElement.addEventListener('keydown', handleKeydown);
  palette.querySelector('.command-palette-close').addEventListener('click', closeCommandPalette);
  palette.querySelector('.command-palette-backdrop').addEventListener('click', closeCommandPalette);
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to open command palette
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      toggleCommandPalette();
    }
    
    // Escape to close
    if (e.key === 'Escape' && getState().commandPaletteOpen) {
      closeCommandPalette();
    }
  });
}

/**
 * Toggle command palette visibility
 */
export function toggleCommandPalette() {
  const { commandPaletteOpen } = getState();
  
  if (commandPaletteOpen) {
    closeCommandPalette();
  } else {
    openCommandPalette();
  }
}

/**
 * Open the command palette
 */
export function openCommandPalette() {
  if (!commandPaletteElement) {
    initializeCommandPalette();
  }
  
  commandPaletteElement.classList.remove('hidden');
  setState({ commandPaletteOpen: true }, false);
  
  // Focus input
  setTimeout(() => {
    inputElement.focus();
    inputElement.value = '';
    renderResults([]);
  }, 50);
}

/**
 * Close the command palette
 */
export function closeCommandPalette() {
  if (commandPaletteElement) {
    commandPaletteElement.classList.add('hidden');
  }
  setState({ commandPaletteOpen: false }, false);
  selectedIndex = 0;
}

/**
 * Handle input changes
 */
function handleInput(e) {
  const query = e.target.value.trim();
  
  if (!query) {
    renderResults(getCommands());
    return;
  }
  
  // Search for apps
  const apps = getApps();
  const matchingApps = searchApps(apps, query);
  
  // Filter commands
  const commands = getCommands().filter(cmd => 
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );
  
  // Combine results
  const results = [...commands, ...matchingApps.map(app => ({
    name: app.name,
    description: app.description || 'Launch app',
    icon: app.icon,
    action: () => launchApp(app.id)
  }))];
  
  renderResults(results);
  selectedIndex = 0;
}

/**
 * Handle keyboard navigation
 */
function handleKeydown(e) {
  const results = resultsElement.querySelectorAll('.command-item');
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % results.length;
      updateSelection(results);
      break;
      
    case 'ArrowUp':
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + results.length) % results.length;
      updateSelection(results);
      break;
      
    case 'Enter':
      e.preventDefault();
      if (results[selectedIndex]) {
        results[selectedIndex].click();
      }
      break;
  }
}

/**
 * Update selected item
 */
function updateSelection(items) {
  items.forEach((item, index) => {
    item.classList.toggle('selected', index === selectedIndex);
  });
  
  // Scroll into view
  if (items[selectedIndex]) {
    items[selectedIndex].scrollIntoView({ block: 'nearest' });
  }
}

/**
 * Render results
 */
function renderResults(results) {
  if (!results || results.length === 0) {
    resultsElement.innerHTML = '<div class="no-results">No results found</div>';
    return;
  }
  
  resultsElement.innerHTML = results.map((result, index) => `
    <div class="command-item ${index === selectedIndex ? 'selected' : ''}" data-index="${index}">
      <span class="command-icon">${result.icon || '🕹️'}</span>
      <div class="command-info">
        <div class="command-name">${result.name}</div>
        <div class="command-description">${result.description || ''}</div>
      </div>
    </div>
  `).join('');
  
  // Add click handlers
  resultsElement.querySelectorAll('.command-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      if (results[index].action) {
        results[index].action();
      }
      closeCommandPalette();
    });
  });
}

/**
 * Get available commands
 */
function getCommands() {
  return [
    {
      name: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon: '🌙',
      action: () => {
        const { theme } = getState();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        import('./theme.js').then(module => module.setTheme(newTheme));
      }
    },
    {
      name: 'Toggle Sidebar',
      description: 'Show or hide the sidebar',
      icon: '📋',
      action: () => {
        import('./ui.js').then(module => module.toggleSidebar());
      }
    }
  ];
}
