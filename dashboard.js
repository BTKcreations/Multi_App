/**
 * @file dashboard.js
 * @description Handles all the DOM manipulation and logic for the dashboard page.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- App Data ---
    const applicationFiles = [
        { name: "Fake News Detection", file: "Fake News Detection System.html", icon: "🔍" },
        { name: "PDF Extractor", file: "PDF Extraction.html", icon: "📄" },
        { name: "Math Problem Solver", file: "Math_Problem_Solver.html", icon: "🧮" },
        { name: "Equation Grapher", file: "Advanced_Equation_Grapher.html", icon: "📈" },
    ];

    // --- Element References ---
    const dashboardView = document.getElementById('dashboard-view');
    const appView = document.getElementById('app-viewer-view');
    const appIframe = document.getElementById('app-iframe');
    const backButton = document.getElementById('back-button');
    const headerTitle = document.getElementById('canvas-title');
    const nav = document.getElementById('canvas-nav');
    const menuButton = document.getElementById('menu-button');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleButton = document.getElementById('sidebar-toggle-button');

    // --- App Navigation ---
    function renderSidebar() {
        nav.innerHTML = '';
        applicationFiles.forEach(app => {
            const link = document.createElement('a');
            link.className = 'nav-link flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors overflow-hidden';
            link.href = '#';
            link.title = app.name; // Add a tooltip for collapsed view
            link.innerHTML = `
                <span class="nav-link-icon mr-3 flex-shrink-0 text-xl">${app.icon}</span> 
                <span class="sidebar-text whitespace-nowrap transition-opacity duration-200">${app.name}</span>`;
            link.onclick = (e) => {
                e.preventDefault();
                loadApp(app);
                // Hide sidebar on mobile after clicking a link
                if (window.innerWidth < 768) {
                   sidebar.classList.add('-translate-x-full');
                }
            };
            nav.appendChild(link);
        });
    }

    function loadApp(app) {
        appIframe.src = app.file;
        showAppViewer(app.name);
    }

    function showAppViewer(appName) {
        headerTitle.textContent = appName;
        dashboardView.style.display = 'none';
        appView.classList.remove('hidden');
        backButton.classList.remove('hidden');
        backButton.classList.add('flex');
    }

    function showDashboard() {
        headerTitle.textContent = "Dashboard";
        appView.classList.add('hidden');
        backButton.classList.add('hidden');
        backButton.classList.remove('flex');
        dashboardView.style.display = 'block';
        appIframe.src = 'about:blank';
    }

    backButton.addEventListener('click', showDashboard);

    // --- Sidebar Toggle Logic ---
    // Mobile Sidebar Toggle
    menuButton.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
    });
    
    // Desktop Sidebar Toggle
    sidebarToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
        // Save the state to localStorage
        if (document.body.classList.contains('sidebar-collapsed')) {
            localStorage.setItem('sidebarCollapsed', 'true');
        } else {
            localStorage.setItem('sidebarCollapsed', 'false');
        }
    });
    
    // Close mobile sidebar if clicking outside of it
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 768 && !sidebar.contains(e.target) && !menuButton.contains(e.target)) {
            sidebar.classList.add('-translate-x-full');
        }
    });


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
    renderSidebar();
    showDashboard();
    applyTheme(localStorage.theme || 'system');
});
