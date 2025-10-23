/**
 * Dashboard logic for Multi_App (ES6 refactor)
 * - Dynamic app registry loaded from apps.json
 * - Debounced sidebar search with input sanitization
 * - Single dynamically-positioned context menu
 * - Enhanced error handling with user feedback
 * - Feature checks for fetch, localStorage, matchMedia
 */

document.addEventListener('DOMContentLoaded', async () => {
  // --- Feature checks ---
  const hasFetch = typeof window.fetch === 'function';
  const hasLocalStorage = (() => {
    try {
      const t = '__ls_test__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
      return true;
    } catch {
      return false;
    }
  })();
  const hasMatchMedia = typeof window.matchMedia === 'function';

  // --- State Management ---
  let appRegistry = [];
  let filteredApps = [];
  let searchDebounceTimer = null;
  const DEBOUNCE_DELAY = 300; // ms

  // --- Utility: sanitize user input for search/localStorage keys ---
  const sanitize = (str) => String(str).replace(/[<>"'`]/g, '').trim().slice(0, 200);

  // --- Dynamic App Registry Loading ---
  const loadAppRegistry = async () => {
    if (!hasFetch) {
      showErrorFeedback('Your browser does not support Fetch API.');
      return false;
    }
    try {
      const response = await fetch('apps.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      appRegistry = Array.isArray(data?.apps) ? data.apps : [];
      filteredApps = [...appRegistry];
      return true;
    } catch (error) {
      console.error('Failed to load app registry:', error);
      showErrorFeedback('Failed to load applications. Please refresh the page.');
      return false;
    }
  };

  // --- Error Feedback UI ---
  const showErrorFeedback = (message) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    errorDiv.textContent = String(message).slice(0, 300);
    document.body.appendChild(errorDiv);
    setTimeout(() => {
      errorDiv.style.opacity = '0';
      errorDiv.style.transition = 'opacity 0.5s';
      setTimeout(() => errorDiv.remove(), 500);
    }, 5000);
  };

  // --- Debounced Search Logic ---
  const debounceSearch = (callback, delay) => (...args) => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => callback.apply(null, args), delay);
  };

  const performSearch = (queryRaw) => {
    const query = sanitize(queryRaw).toLowerCase();
    if (!query) {
      filteredApps = [...appRegistry];
    } else {
      filteredApps = appRegistry.filter((app) =>
        app.name?.toLowerCase().includes(query) || (app.category && app.category.toLowerCase().includes(query))
      );
    }
    renderSidebar();
  };

  const debouncedSearch = debounceSearch(performSearch, DEBOUNCE_DELAY);

  // --- Single Dynamic Context Menu ---
  let contextMenu = null;
  let currentContextApp = null;

  const createContextMenu = () => {
    if (!contextMenu) {
      contextMenu = document.createElement('div');
      contextMenu.className = 'fixed hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50';
      contextMenu.style.minWidth = '200px';
      document.body.appendChild(contextMenu);
      // Close on click outside
      document.addEventListener('click', (e) => {
        if (contextMenu && !contextMenu.contains(e.target)) hideContextMenu();
      });
    }
    return contextMenu;
  };

  const showContextMenu = (x, y, app) => {
    const menu = createContextMenu();
    currentContextApp = app;
    menu.innerHTML = `
      <button class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" data-action="open">Open</button>
      <button class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" data-action="open-new-tab">Open in New Tab</button>
      <hr class="my-2 border-gray-200 dark:border-gray-700" />
      <button class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" data-action="add-favorite">${app.favorite ? 'Remove from Favorites' : 'Add to Favorites'}</button>
    `;
    menu.classList.remove('hidden');
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = `${x - rect.width}px`;
    if (rect.bottom > window.innerHeight) menu.style.top = `${y - rect.height}px`;
    menu.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        handleContextMenuAction(e.target.dataset.action);
        hideContextMenu();
      });
    });
  };

  const hideContextMenu = () => {
    if (contextMenu) {
      contextMenu.classList.add('hidden');
      currentContextApp = null;
    }
  };

  const handleContextMenuAction = (action) => {
    if (!currentContextApp) return;
    switch (action) {
      case 'open':
        window.location.href = currentContextApp.url;
        break;
      case 'open-new-tab':
        window.open(currentContextApp.url, '_blank', 'noopener');
        break;
      case 'add-favorite':
        toggleFavorite(currentContextApp.id);
        break;
      default:
        break;
    }
  };

  const getFavorites = () => {
    if (!hasLocalStorage) return [];
    try {
      return JSON.parse(localStorage.getItem('appFavorites') || '[]');
    } catch {
      return [];
    }
  };

  const setFavorites = (arr) => {
    if (!hasLocalStorage) return;
    try {
      localStorage.setItem('appFavorites', JSON.stringify(Array.from(new Set(arr))));
    } catch {}
  };

  const toggleFavorite = (appIdRaw) => {
    const appId = sanitize(appIdRaw);
    const app = appRegistry.find((a) => String(a.id) === appId);
    if (app) {
      app.favorite = !app.favorite;
      const favorites = getFavorites();
      if (app.favorite) favorites.push(appId);
      else {
        const idx = favorites.indexOf(appId);
        if (idx > -1) favorites.splice(idx, 1);
      }
      setFavorites(favorites);
      renderSidebar();
    }
  };

  // --- Sidebar Rendering ---
  const renderSidebar = () => {
    const sidebarList = document.getElementById('sidebar-list');
    if (!sidebarList) return;
    sidebarList.innerHTML = '';
    if (!filteredApps.length) {
      sidebarList.innerHTML = '<div class="px-4 py-2 text-gray-500 dark:text-gray-400">No apps found</div>';
      return;
    }
    filteredApps.forEach((app) => {
      const appItem = document.createElement('div');
      appItem.className = 'px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between';
      appItem.innerHTML = `
        ${app.name}
        ${app.favorite ? '<span class="text-yellow-500">★</span>' : ''}
      `;
      appItem.addEventListener('click', () => {
        window.location.href = app.url;
      });
      appItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e.clientX, e.clientY, app);
      });
      sidebarList.appendChild(appItem);
    });
  };

  // --- Search Input Handler ---
  const searchInput = document.getElementById('sidebar-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      debouncedSearch(e.target.value);
    });
  }

  // --- Dashboard Display ---
  const showDashboard = () => {
    const dashboardContent = document.getElementById('dashboard-content');
    if (!dashboardContent) return;
    const categories = {};
    filteredApps.forEach((app) => {
      const cat = app.category || 'Uncategorized';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(app);
    });
    dashboardContent.innerHTML = Object.entries(categories)
      .map(([category, apps]) => `
        <div class="mb-8">
          <h2 class="text-xl font-bold mb-4 dark:text-white">${category}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${apps
              .map(
                (app) => `
                <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                     onclick="window.location.href='${app.url}'"
                     oncontextmenu="event.preventDefault(); window.__showContextMenu && window.__showContextMenu(event.clientX, event.clientY, ${JSON.stringify(app).replace(/"/g, '&quot;')});">
                  <h3 class="font-semibold text-lg dark:text-white">${app.name}</h3>
                  ${app.description ? `<p class="text-sm text-gray-600 dark:text-gray-400 mt-2">${app.description}</p>` : ''}
                </div>`
              )
              .join('')}
          </div>
        </div>`)
      .join('');
  };

  // expose for inline handler safety (used above)
  window.__showContextMenu = showContextMenu;

  // --- Theme Switcher Logic ---
  const themeToggleButton = document.getElementById('theme-toggle-button');
  const themeMenu = document.getElementById('theme-menu');
  const themeIcons = {
    light: document.getElementById('theme-icon-light'),
    dark: document.getElementById('theme-icon-dark'),
    system: document.getElementById('theme-icon-system')
  };
  Object.values(themeIcons).forEach((icon) => {
    if (!icon) return;
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke-width', '1.5');
  });

  const updateThemeIcon = (theme) => {
    Object.values(themeIcons).forEach((icon) => icon && icon.classList.add('hidden'));
    if (theme === 'system' && themeIcons.system) themeIcons.system.classList.remove('hidden');
    else if (theme === 'dark' && themeIcons.dark) themeIcons.dark.classList.remove('hidden');
    else if (themeIcons.light) themeIcons.light.classList.remove('hidden');
  };

  const applyTheme = (theme) => {
    const t = theme || 'system';
    if (t === 'dark' || (t === 'system' && hasMatchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    updateThemeIcon(t);
  };

  if (themeToggleButton && themeMenu) {
    themeToggleButton.addEventListener('click', (e) => {
      e.stopPropagation();
      themeMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', () => themeMenu.classList.add('hidden'));
    themeMenu.addEventListener('click', (e) => {
      e.preventDefault();
      const dataTheme = e.target?.dataset?.theme;
      if (dataTheme) {
        const safeTheme = sanitize(dataTheme);
        if (hasLocalStorage) localStorage.theme = safeTheme;
        applyTheme(safeTheme);
      }
    });
    if (hasMatchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if ((hasLocalStorage && localStorage.theme === 'system') || (hasLocalStorage && !('theme' in localStorage))) {
          applyTheme('system');
        }
      });
    }
  }

  // --- Initial Load ---
  const loaded = await loadAppRegistry();
  if (loaded) {
    // Load favorites from localStorage
    const favorites = getFavorites();
    appRegistry.forEach((app) => {
      app.favorite = favorites.includes(String(app.id));
    });
    filteredApps = [...appRegistry];
    renderSidebar();
    showDashboard();
  }
  applyTheme((hasLocalStorage && localStorage.theme) || 'system');
});
