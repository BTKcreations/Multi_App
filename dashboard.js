/**
 * Dashboard logic for Multi_App
 * Step 3 improvements:
 * - Dynamic app registry loaded from apps.json
 * - Debounced sidebar search
 * - Single dynamically-positioned context menu
 * - Enhanced error handling with user feedback
 */

document.addEventListener('DOMContentLoaded', async () => {
    // --- State Management ---
    let appRegistry = [];
    let filteredApps = [];
    let searchDebounceTimer = null;
    const DEBOUNCE_DELAY = 300; // milliseconds

    // --- Dynamic App Registry Loading ---
    async function loadAppRegistry() {
        try {
            const response = await fetch('apps.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            appRegistry = data.apps || [];
            filteredApps = [...appRegistry];
            return true;
        } catch (error) {
            console.error('Failed to load app registry:', error);
            showErrorFeedback('Failed to load applications. Please refresh the page.');
            return false;
        }
    }

    // --- Error Feedback UI ---
    function showErrorFeedback(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            errorDiv.style.transition = 'opacity 0.5s';
            setTimeout(() => errorDiv.remove(), 500);
        }, 5000);
    }

    // --- Debounced Search Logic ---
    function debounceSearch(callback, delay) {
        return function(...args) {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(() => callback.apply(this, args), delay);
        };
    }

    function performSearch(query) {
        const lowerQuery = query.toLowerCase();
        filteredApps = appRegistry.filter(app => 
            app.name.toLowerCase().includes(lowerQuery) ||
            (app.category && app.category.toLowerCase().includes(lowerQuery))
        );
        renderSidebar();
    }

    const debouncedSearch = debounceSearch(performSearch, DEBOUNCE_DELAY);

    // --- Single Dynamic Context Menu ---
    let contextMenu = null;
    let currentContextApp = null;

    function createContextMenu() {
        if (!contextMenu) {
            contextMenu = document.createElement('div');
            contextMenu.className = 'fixed hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50';
            contextMenu.style.minWidth = '200px';
            document.body.appendChild(contextMenu);

            // Close on click outside
            document.addEventListener('click', (e) => {
                if (contextMenu && !contextMenu.contains(e.target)) {
                    hideContextMenu();
                }
            });
        }
        return contextMenu;
    }

    function showContextMenu(x, y, app) {
        const menu = createContextMenu();
        currentContextApp = app;

        // Build menu content
        menu.innerHTML = `
            <button class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" data-action="open">
                Open
            </button>
            <button class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" data-action="open-new-tab">
                Open in New Tab
            </button>
            <hr class="my-2 border-gray-200 dark:border-gray-700">
            <button class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" data-action="add-favorite">
                ${app.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
        `;

        // Position menu
        menu.classList.remove('hidden');
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;

        // Adjust if menu goes off screen
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = `${x - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = `${y - rect.height}px`;
        }

        // Add event listeners
        menu.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                handleContextMenuAction(e.target.dataset.action);
                hideContextMenu();
            });
        });
    }

    function hideContextMenu() {
        if (contextMenu) {
            contextMenu.classList.add('hidden');
            currentContextApp = null;
        }
    }

    function handleContextMenuAction(action) {
        if (!currentContextApp) return;

        switch (action) {
            case 'open':
                window.location.href = currentContextApp.url;
                break;
            case 'open-new-tab':
                window.open(currentContextApp.url, '_blank');
                break;
            case 'add-favorite':
                toggleFavorite(currentContextApp.id);
                break;
        }
    }

    function toggleFavorite(appId) {
        const app = appRegistry.find(a => a.id === appId);
        if (app) {
            app.favorite = !app.favorite;
            // Save to localStorage
            const favorites = JSON.parse(localStorage.getItem('appFavorites') || '[]');
            if (app.favorite) {
                favorites.push(appId);
            } else {
                const index = favorites.indexOf(appId);
                if (index > -1) favorites.splice(index, 1);
            }
            localStorage.setItem('appFavorites', JSON.stringify(favorites));
            renderSidebar();
        }
    }

    // --- Sidebar Rendering ---
    function renderSidebar() {
        const sidebarList = document.getElementById('sidebar-list');
        if (!sidebarList) return;

        sidebarList.innerHTML = '';

        if (filteredApps.length === 0) {
            sidebarList.innerHTML = '<div class="px-4 py-2 text-gray-500 dark:text-gray-400">No apps found</div>';
            return;
        }

        filteredApps.forEach(app => {
            const appItem = document.createElement('div');
            appItem.className = 'px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between';
            appItem.innerHTML = `
                <span>${app.name}</span>
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
    }

    // --- Search Input Handler ---
    const searchInput = document.getElementById('sidebar-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    }

    // --- Dashboard Display ---
    function showDashboard() {
        const dashboardContent = document.getElementById('dashboard-content');
        if (!dashboardContent) return;

        // Group apps by category
        const categories = {};
        filteredApps.forEach(app => {
            const cat = app.category || 'Uncategorized';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(app);
        });

        dashboardContent.innerHTML = Object.entries(categories).map(([category, apps]) => `
            <div class="mb-8">
                <h2 class="text-xl font-bold mb-4 dark:text-white">${category}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${apps.map(app => `
                        <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition cursor-pointer" 
                             onclick="window.location.href='${app.url}'"
                             oncontextmenu="event.preventDefault(); showContextMenu(event.clientX, event.clientY, ${JSON.stringify(app).replace(/"/g, '&quot;')});">
                            <h3 class="font-semibold text-lg dark:text-white">${app.name}</h3>
                            ${app.description ? `<p class="text-sm text-gray-600 dark:text-gray-400 mt-2">${app.description}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // --- Theme Switcher Logic ---
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const themeMenu = document.getElementById('theme-menu');
    const themeIcons = {
        light: document.getElementById('theme-icon-light'),
        dark: document.getElementById('theme-icon-dark'),
        system: document.getElementById('theme-icon-system')
    };

    Object.values(themeIcons).forEach(icon => {
        icon.setAttribute('stroke', 'currentColor');
        icon.setAttribute('fill', 'none');
        icon.setAttribute('stroke-width', '1.5');
    });

    const updateThemeIcon = (theme) => {
        Object.values(themeIcons).forEach(icon => icon.classList.add('hidden'));
        
        if (theme === 'system') themeIcons.system.classList.remove('hidden');
        else if (theme === 'dark') themeIcons.dark.classList.remove('hidden');
        else themeIcons.light.classList.remove('hidden');
    };

    const applyTheme = (theme) => {
        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        updateThemeIcon(theme);
    };

    themeToggleButton.addEventListener('click', (e) => {
        e.stopPropagation();
        themeMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => themeMenu.classList.add('hidden'));

    themeMenu.addEventListener('click', (e) => {
        e.preventDefault();
        const theme = e.target.dataset.theme;
        if (theme) {
            localStorage.theme = theme;
            applyTheme(theme);
        }
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.theme === 'system' || !('theme' in localStorage)) {
            applyTheme('system');
        }
    });

    // --- Initial Load ---
    const loaded = await loadAppRegistry();
    if (loaded) {
        // Load favorites from localStorage
        const favorites = JSON.parse(localStorage.getItem('appFavorites') || '[]');
        appRegistry.forEach(app => {
            app.favorite = favorites.includes(app.id);
        });
        filteredApps = [...appRegistry];
        
        renderSidebar();
        showDashboard();
    }
    applyTheme(localStorage.theme || 'system');
});
