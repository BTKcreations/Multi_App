/**
 * Main Application Entry Point - Modularized
 * Uses ES modules to organize code into separate concerns
 */

// Import all module functions
import { initializeState, getState, setState } from './src/modules/state.js';
import { initializeApps, getApps, launchApp } from './src/modules/app-manager.js';
import { initializeUI, renderDashboard, renderSidebar, showNotification } from './src/modules/ui.js';
import { initializeTheme, watchSystemTheme } from './src/modules/theme.js';
import { initializeCommandPalette, toggleCommandPalette } from './src/modules/command-palette.js';
import { filterApps, searchApps } from './src/modules/search.js';
import { $, $$, ready, on } from './src/modules/dom.js';
import { isStorageAvailable } from './src/modules/storage.js';

// --- Application Initialization ---
ready(() => {
  console.log('Multi App Dashboard - Initializing with modular architecture...');
  
  // Check storage availability
  if (!isStorageAvailable()) {
    showNotification('Warning: LocalStorage is not available. Some features may not work.', 'warning');
  }
  
  // Initialize all modules
  initializeTheme();
  watchSystemTheme();
  initializeState();
  initializeApps();
  initializeCommandPalette();
  initializeUI();
  
  // Setup search functionality
  setupSearch();
  
  // Setup keyboard shortcuts
  setupGlobalKeyboardShortcuts();
  
  // Setup PWA install prompt
  setupPWAInstall();
  
  // Check online/offline status
  setupOnlineOfflineHandlers();
  
  console.log('Multi App Dashboard - Initialization complete!');
});

/**
 * Setup search functionality
 */
function setupSearch() {
  const searchInput = $('#app-search-input');
  if (!searchInput) return;
  
  let searchTimeout;
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const query = e.target.value.trim();
      setState({ searchQuery: query });
      renderDashboard();
    }, 300); // Debounce search
  });
  
  // Clear search button
  const clearBtn = $('#clear-search');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      setState({ searchQuery: '' });
      renderDashboard();
    });
  }
}

/**
 * Setup global keyboard shortcuts
 */
function setupGlobalKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for command palette (handled in command-palette.js)
    // This is just for other global shortcuts
    
    // Ctrl/Cmd + / for search focus
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      const searchInput = $('#app-search-input');
      if (searchInput) searchInput.focus();
    }
    
    // Ctrl/Cmd + B for sidebar toggle
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      const { sidebarCollapsed } = getState();
      setState({ sidebarCollapsed: !sidebarCollapsed });
      const sidebar = $('#sidebar');
      if (sidebar) sidebar.classList.toggle('collapsed');
    }
  });
}

/**
 * Setup PWA installation
 */
let deferredInstallPrompt = null;

function setupPWAInstall() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    
    const installButton = $('#install-btn');
    if (installButton) {
      installButton.classList.remove('hidden');
    }
  });
  
  const installButton = $('#install-btn');
  if (installButton) {
    installButton.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      
      try {
        await deferredInstallPrompt.prompt();
        const choiceResult = await deferredInstallPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          showNotification('App installed successfully!', 'success');
        }
        
        deferredInstallPrompt = null;
        installButton.classList.add('hidden');
      } catch (error) {
        console.error('Error installing app:', error);
        showNotification('Failed to install app', 'error');
      }
    });
  }
  
  // Handle successful installation
  window.addEventListener('appinstalled', () => {
    showNotification('Multi App Dashboard installed!', 'success');
    deferredInstallPrompt = null;
  });
}

/**
 * Setup online/offline status handlers
 */
function setupOnlineOfflineHandlers() {
  function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    const banner = $('#offline-banner');
    
    if (banner) {
      if (isOnline) {
        banner.classList.add('hidden');
      } else {
        banner.classList.remove('hidden');
      }
    }
    
    if (isOnline) {
      showNotification('You are back online!', 'success');
    } else {
      showNotification('You are offline. Some features may be limited.', 'warning');
    }
  }
  
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Initial check
  if (!navigator.onLine) {
    const banner = $('#offline-banner');
    if (banner) banner.classList.remove('hidden');
  }
}

/**
 * Handle category filter from URL
 */
function loadCategoryFromURL() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  
  if (category) {
    setState({ currentCategory: category });
  }
}

// Load category from URL on page load
ready(() => {
  loadCategoryFromURL();
});

// Handle browser back/forward
window.addEventListener('popstate', () => {
  loadCategoryFromURL();
  renderDashboard();
});

// Export for debugging in console
if (typeof window !== 'undefined') {
  window.MultiApp = {
    getState,
    setState,
    getApps,
    launchApp,
    renderDashboard,
    renderSidebar,
    toggleCommandPalette,
    version: '2.0.0-modular'
  };
}
