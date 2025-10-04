// --- Google Sign-In Initialization ---
// This is called when the Google library finishes loading.
window.onload = function () {
  try {
    // Only initialize Google Sign-In in secure contexts (https, localhost)
    if (!window.isSecureContext) return;
    google.accounts.id.initialize({
      client_id:
        "952892249789-e2h3j0k5ffdgv2hdnuebsfv3m7ul9mr2.apps.googleusercontent.com", // Your Client ID
      callback: handleCredentialResponse,
    });
    const signinEl = document.getElementById("g_id_signin");
    if (signinEl) {
      google.accounts.id.renderButton(signinEl, {
        theme: "outline",
        size: "large",
      });
      google.accounts.id.prompt();
    }
  } catch (_) {
    // ignore failures (e.g., file:// origin not allowed)
  }
};

// This runs after the main HTML document is ready.
document.addEventListener("DOMContentLoaded", () => {
  // --- 1. APP DATA (loaded from apps.json) ---
  let applicationFiles = [];

  async function loadRegistry() {
    try {
      const res = await fetch('apps.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to load apps.json');
      applicationFiles = await res.json();
    } catch (e) {
      // Fallback registry when running from file:// or offline
      applicationFiles = [
        { id: "fake-news-detection", name: "Fake News Detection", file: "Apps/Fake News Detection System.html", icon: "🔍", category: "Content Tools", keywords: "verify truth article analysis" },
        { id: "pdf-extractor", name: "PDF Extractor", file: "Apps/PDF Extraction.html", icon: "📄", category: "Productivity", keywords: "document read text data" },
        { id: "math-problem-solver", name: "Math Problem Solver", file: "Apps/Math_Problem_Solver.html", icon: "🧮", category: "Utilities", keywords: "calculate algebra calculus equation" },
        { id: "equation-grapher", name: "Equation Grapher", file: "Apps/Advanced_Equation_Grapher.html", icon: "📈", category: "Utilities", keywords: "plot chart function math" },
        { id: "advanced-meeting-notes", name: "Advanced Meeting Notes", file: "Apps/Advanced_Meeting_Notes_Formater.html", icon: "📝", category: "Productivity", keywords: "minutes summary format document" },
        { id: "language-translator", name: "Language Translator", file: "Apps/Language_Translator.html", icon: "🌐", category: "Content Tools", keywords: "translate dictionary language" },
        { id: "image-resizer", name: "Image Resizer", file: "Apps/Image_Resizer.html", icon: "📏", category: "Utilities", keywords: "resize crop dimensions photo" },
        { id: "clash-of-castles", name: "Clash of Castles", file: "Apps/Clash_of_Castles.html", icon: "🏰", category: "Games", keywords: "clash of castles strategy game" },
        { id: "tap-dash", name: "Tap Dash", file: "Apps/Tap_Dash.html", icon: "🏰", category: "Games", keywords: "Jump from Obstacles Tap Dash Game" },
        { id: "circle-bounce-ball", name: "Circle Bounce Ball", file: "Apps/Circle_Bounce_Ball.html", icon: "🏰", category: "Games", keywords: "Ball Bounces in the circle get the score in virtual money" },
        { id: "ai-markdown-formatter", name: "AI Markdown Formatter", file: "Apps/AI_Markdown_Formatter.html", icon: "📝", category: "Productivity", keywords: "generate summarize format markdown" },
        { id: "dots-and-boxes", name: "Dots & Boxes", file: "Apps/Dots_and_Boxes.html", icon: "🟦", category: "Games", keywords: "dots boxes grid strategy board game" },
        { id: "ai-ppt-maker", name: "AI PPT Maker", file: "Apps/AI_PPT_Maker.html", icon: "📊", category: "Productivity", keywords: "presentation slides generate ai" },
        { id: "ai-data-analysis", name: "AI Data Analysis", file: "Apps/AI_Data_Analysis.html", icon: "📈", category: "Productivity", keywords: "data analysis charts graphs ai" },
        { id: "mermaid-diagram-editor", name: "Mermaid Diagram Editor", file: "Apps/Mermaid_Diagram_Editor.html", icon: "🧩", category: "Productivity", keywords: "mermaid diagram flowchart editor" },
        { id: "ratio-calculator", name: "Ratio Calculator", file: "Apps/Ratio_Calc.html", icon: "🧮", category: "Calc", keywords: "Ratio Calculator" }
      ];
    }
  }

  // --- 2. ELEMENT REFERENCES ---
  // Views and Core App
  const dashboardView = document.getElementById("dashboard-view");
  const appView = document.getElementById("app-viewer-view");
  const appIframe = document.getElementById("app-iframe");
  const appErrorBox = document.getElementById('app-error');
  const appOpenNew = document.getElementById('app-open-new');
  const appRetry = document.getElementById('app-retry');
  const backButton = document.getElementById("back-button");
  const headerTitle = document.getElementById("canvas-title");
  const nav = document.getElementById("canvas-nav");
  // Sidebar
  const sidebar = document.getElementById("sidebar");
  const menuButton = document.getElementById("menu-button");
  const sidebarToggleButton = document.getElementById("sidebar-toggle-button");
  const appSearchInput = document.getElementById("app-search-input");
  // Header
  const installButton = document.getElementById('install-button');
  const offlineBanner = document.getElementById('offline-banner');
  // Dashboard grids and controls
  const pinnedSection = document.getElementById('pinned-section');
  const pinnedGrid = document.getElementById('pinned-grid');
  const recentSection = document.getElementById('recent-section');
  const recentGrid = document.getElementById('recent-grid');
  const allGrid = document.getElementById('all-grid');
  const viewToggle = document.getElementById('view-toggle');
  const categoryChips = document.getElementById('category-chips');
  // Command palette
  const cpModal = document.getElementById('command-palette-modal');
  const cpInput = document.getElementById('command-palette-input');
  const cpResults = document.getElementById('command-palette-results');
  // Context menu
  const ctxMenu = document.getElementById('app-context-menu');
  const ctxOpenNew = document.getElementById('ctx-open-new');
  const ctxTogglePin = document.getElementById('ctx-toggle-pin');
  const ctxCacheOffline = document.getElementById('ctx-cache-offline');
  // User Authentication & Menu
  const userArea = document.getElementById("user-area");
  const userMenu = document.getElementById("user-menu");
  const userMenuButton = document.getElementById("user-menu-button");
  const userDropdown = document.getElementById("user-dropdown");
  const signoutButton = document.getElementById("signout-button");
  const googleSignInButton = document.getElementById("g_id_signin");

  // --- 3. STATE VARIABLES ---
  let currentUser = null;
  let filterCategory = null;
  let viewMode = (localStorage.getItem('viewMode') || 'grid');
  let ctxAppId = null;

  // --- 4. FUNCTIONS ---

  // Utility to decode Google's token
  function jwt_decode(token) {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  }

  // Logs user actions to localStorage
  function logUserActivity(action, details) {
    if (!currentUser) return;
    const userId = currentUser.id;
    let history = JSON.parse(localStorage.getItem("userHistory")) || {};
    if (!history[userId]) {
      history[userId] = [];
    }
    history[userId].unshift({
      action: action,
      details: details || {},
      timestamp: new Date().toISOString(),
    });
    if (history[userId].length > 50) history[userId].pop();
    localStorage.setItem("userHistory", JSON.stringify(history));
  }

  // Handles successful Google login
  window.handleCredentialResponse = function (response) {
    const credential = jwt_decode(response.credential);
    currentUser = {
      id: credential.sub,
      name: credential.name,
      email: credential.email,
      avatar: credential.picture,
    };
    localStorage.setItem("loggedInUser", JSON.stringify(currentUser));
    updateUIAfterLogin();
    logUserActivity("Logged In", {
      browser: navigator.userAgent,
    });
  };

  // Updates the UI to show the logged-in user
  function updateUIAfterLogin() {
    if (!currentUser) return;
    googleSignInButton.style.display = "none";
    userMenu.classList.remove("hidden");
    document.getElementById("user-name").textContent = currentUser.name;
    document.getElementById("user-email").textContent = currentUser.email;
    document.getElementById("user-avatar").src = currentUser.avatar;
  }

  // Checks for a logged-in user on page load
  function checkSession() {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
      updateUIAfterLogin();
    }
  }

  // Navigation: Loads an app into the iframe
  function loadApp(app) {
    // Pre-check availability to show friendlier errors
    appErrorBox.classList.add('hidden');
    fetch(app.file, { method: 'HEAD', cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error('Not OK');
        appIframe.src = app.file;
        showAppViewer(app.name);
        const p = new URLSearchParams(location.search);
        p.set('app', app.id || app.name);
        history.pushState({ app: app.id || app.name }, '', `?${p.toString()}`);
        logUserActivity("Viewed App", { appName: app.name });
      })
      .catch(() => {
        appOpenNew.href = app.file;
        appRetry.onclick = () => loadApp(app);
        appErrorBox.classList.remove('hidden');
      });
  }

  // Navigation: Shows the iframe view
  function showAppViewer(appName) {
    headerTitle.textContent = appName;
    dashboardView.style.display = "none";
    appView.classList.remove("hidden");
    backButton.classList.remove("hidden");
    backButton.classList.add("flex");
  }

  // Navigation: Shows the main dashboard
  function showDashboard(pushState = true) {
    headerTitle.textContent = "Dashboard";
    appView.classList.add("hidden");
    backButton.classList.add("hidden");
    backButton.classList.remove("flex");
    dashboardView.style.display = "block";
    appIframe.src = "about:blank";
    if (currentUser) {
      logUserActivity("Viewed Dashboard");
    }
    if (pushState) {
      const p = new URLSearchParams(location.search);
      p.delete('app');
      history.pushState({}, '', `?${p.toString()}`);
    }
  }

  // Pinned apps management
  const PINNED_KEY = 'pinnedApps';
  function getPinned() { return JSON.parse(localStorage.getItem(PINNED_KEY) || '[]'); }
  function setPinned(ids) { localStorage.setItem(PINNED_KEY, JSON.stringify(ids)); }
  function isPinned(id) { return getPinned().includes(id); }
  function togglePin(id) {
    const pins = new Set(getPinned());
    if (pins.has(id)) pins.delete(id); else pins.add(id);
    setPinned([...pins]);
  }

  async function isCached(url) {
    try {
      if (!('caches' in window)) return false;
      const names = await caches.keys();
      for (const n of names) {
        const match = await caches.open(n).then(c => c.match(url));
        if (match) return true;
      }
    } catch(_) {}
    return false;
  }

  async function markOfflineBadges() {
    const links = Array.from(nav.querySelectorAll('.nav-link'));
    for (const link of links) {
      const id = link.getAttribute('data-app-id');
      const app = applicationFiles.find(a => (a.id || a.name) === id);
      if (!app) continue;
      const cached = await isCached(app.file);
      let badge = link.querySelector('.badge-offline');
      if (cached && !badge) {
        badge = document.createElement('span');
        badge.className = 'badge-offline ml-auto text-xs px-2 py-0.5 rounded bg-green-100 text-green-800';
        badge.textContent = 'Offline';
        link.appendChild(badge);
      }
      if (!cached && badge) badge.remove();
    }
  }

  // Recent apps for current user
  function getRecent(limit = 6) {
    if (!currentUser) return [];
    const hist = JSON.parse(localStorage.getItem('userHistory') || '{}');
    const items = hist[currentUser.id] || [];
    const names = [];
    const out = [];
    for (const h of items) {
      if (h.action !== 'Viewed App' || !h.details?.appName) continue;
      const app = applicationFiles.find(a => a.name === h.details.appName);
      if (!app) continue;
      const id = app.id || app.name;
      if (names.includes(id)) continue;
      names.push(id);
      out.push(app);
      if (out.length >= limit) break;
    }
    return out;
  }

  // Render dashboards
  function appCard(app) {
    const card = document.createElement('div');
    card.className = 'app-card cursor-pointer p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow transition flex items-start space-x-3';
    card.setAttribute('data-app-id', app.id || app.name);
    card.innerHTML = `
      <div class="text-2xl">${app.icon || '📦'}</div>
      <div class="flex-1">
        <div class="font-semibold">${app.name}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">${app.description || ''}</div>
        <div class="mt-1 text-xs text-gray-400">${app.category || ''}</div>
      </div>
      <div class="ml-2"><button class="pin-btn text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">${isPinned(app.id || app.name) ? 'Unpin' : 'Pin'}</button></div>
    `;
    card.addEventListener('click', (e) => {
      // Avoid clicks on pin button
      if (e.target && e.target.classList.contains('pin-btn')) return;
      loadApp(app);
    });
    card.querySelector('.pin-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      togglePin(app.id || app.name);
      renderAll();
    });
    // Context menu on card
    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY, app);
    });
    // Offline badge (async)
    isCached(app.file).then((cached) => {
      if (cached) {
        const badge = document.createElement('span');
        badge.className = 'ml-2 text-xs px-2 py-0.5 rounded bg-green-100 text-green-800 self-start';
        badge.textContent = 'Offline';
        card.appendChild(badge);
      }
    });
    return card;
  }

  function renderCategoryChips() {
    const cats = Array.from(new Set(applicationFiles.map(a => a.category || 'Uncategorized'))).sort();
    categoryChips.innerHTML = '';
    const allChip = document.createElement('button');
    allChip.className = `px-3 py-1 rounded text-sm ${!filterCategory ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`;
    allChip.textContent = 'All';
    allChip.onclick = () => { filterCategory = null; updateURLCategory(); renderAll(); };
    categoryChips.appendChild(allChip);
    cats.forEach(c => {
      const btn = document.createElement('button');
      btn.className = `px-3 py-1 rounded text-sm ${filterCategory===c ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`;
      btn.textContent = c;
      btn.onclick = () => { filterCategory = c; updateURLCategory(); renderAll(); };
      categoryChips.appendChild(btn);
    });
  }

  function renderDashboardGrids() {
    // Pinned
    const pins = getPinned();
    const pinnedApps = applicationFiles.filter(a => pins.includes(a.id || a.name)).filter(a => !filterCategory || (a.category===filterCategory));
    if (pinnedApps.length) {
      pinnedSection.classList.remove('hidden');
      pinnedGrid.innerHTML = '';
      pinnedApps.forEach(app => pinnedGrid.appendChild(appCard(app)));
    } else {
      pinnedSection.classList.add('hidden');
    }

    // Recent
    const recents = getRecent().filter(a => !filterCategory || (a.category===filterCategory));
    if (recents.length) {
      recentSection.classList.remove('hidden');
      recentGrid.innerHTML = '';
      recents.forEach(app => recentGrid.appendChild(appCard(app)));
    } else {
      recentSection.classList.add('hidden');
    }

    // All
    const all = applicationFiles.filter(a => !filterCategory || (a.category===filterCategory));
    allGrid.innerHTML = '';
    all.forEach(app => allGrid.appendChild(appCard(app)));

    // View mode styling
    const asList = (viewMode === 'list');
    [pinnedGrid, recentGrid, allGrid].forEach(grid => {
      if (!grid) return;
      if (asList) {
        grid.className = 'flex flex-col gap-2';
      } else {
        grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
      }
    });
    if (viewToggle) viewToggle.textContent = asList ? 'List' : 'Grid';
  }

  function renderSidebar(searchTerm = "") {
    nav.innerHTML = "";
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

    const filteredApps = applicationFiles.filter((app) => {
      if (!lowerCaseSearchTerm) return true;
      const searchableText = `${app.name} ${app.category} ${app.keywords}`.toLowerCase();
      return searchableText.includes(lowerCaseSearchTerm);
    });

    // Split pinned and others
    const pins = new Set(getPinned());

    // Render pinned at top
    const pinnedList = filteredApps.filter(a => pins.has(a.id || a.name));
    if (pinnedList.length) {
      const pinnedHeader = document.createElement('div');
      pinnedHeader.className = "px-4 pt-4 pb-1 text-xs font-bold uppercase text-gray-400 dark:text-gray-500 sidebar-text whitespace-nowrap";
      pinnedHeader.textContent = 'Pinned';
      nav.appendChild(pinnedHeader);

      pinnedList.forEach((app) => {
        const link = document.createElement('a');
        link.className = "nav-link flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors overflow-hidden";
        link.href = `?app=${encodeURIComponent(app.id || app.name)}`;
        link.setAttribute('data-app-id', app.id || app.name);
        link.innerHTML = `
                            <span class="nav-link-icon mr-3 flex-shrink-0">${app.icon}</span>
                            <span class="sidebar-text whitespace-nowrap transition-opacity duration-200">${app.name}</span>`;
        link.onclick = (e) => { e.preventDefault(); loadApp(app); if (window.innerWidth < 768) { sidebar.classList.add("-translate-x-full"); } };
        link.addEventListener('contextmenu', (e) => { e.preventDefault(); showContextMenu(e.clientX, e.clientY, app); });
        nav.appendChild(link);
      });

      const sep = document.createElement('div');
      sep.className = 'border-t border-gray-200 dark:border-gray-700 my-2';
      nav.appendChild(sep);
    }

    const groupedApps = filteredApps.filter(a => !pins.has(a.id || a.name)).reduce((acc, app) => {
      const category = app.category || "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(app);
      return acc;
    }, {});

    const sortedCategories = Object.keys(groupedApps).sort();

    if (sortedCategories.length === 0 && lowerCaseSearchTerm) {
      nav.innerHTML = `<p class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No apps found.</p>`;
      return;
    }

    sortedCategories.forEach((category) => {
      const categoryHeader = document.createElement("div");
      categoryHeader.className =
        "px-4 pt-4 pb-1 text-xs font-bold uppercase text-gray-400 dark:text-gray-500 sidebar-text whitespace-nowrap";
      categoryHeader.textContent = category;
      nav.appendChild(categoryHeader);

      groupedApps[category].forEach((app) => {
        const link = document.createElement("a");
        link.className =
          "nav-link flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors overflow-hidden";
        link.href = `?app=${encodeURIComponent(app.id || app.name)}`;
        link.setAttribute('data-app-id', app.id || app.name);
        link.innerHTML = `
                            <span class="nav-link-icon mr-3 flex-shrink-0">${app.icon}</span>
                            <span class="sidebar-text whitespace-nowrap transition-opacity duration-200">${app.name}</span>`;
        link.onclick = (e) => {
          e.preventDefault();
          loadApp(app);
          if (window.innerWidth < 768) {
            sidebar.classList.add("-translate-x-full");
          }
        };
        link.addEventListener('contextmenu', (e) => { e.preventDefault(); showContextMenu(e.clientX, e.clientY, app); });
        nav.appendChild(link);
      });
    });

    // Enhance keyboard navigation on the rendered list
    markOfflineBadges();
    const links = Array.from(nav.querySelectorAll('.nav-link'));
    appSearchInput.onkeydown = (e) => {
      if (e.key === 'ArrowDown' && links.length) { e.preventDefault(); links[0].focus(); }
    };
    links.forEach((lnk, idx) => {
      lnk.tabIndex = 0;
      lnk.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); (links[idx + 1] || links[0]).focus(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); (links[idx - 1] || links[links.length - 1]).focus(); }
        if (e.key === 'Enter') { e.preventDefault(); lnk.click(); }
      });
    });
  }

  // --- 5. EVENT LISTENERS ---

  // Search input listener
  appSearchInput.addEventListener("input", () => renderSidebar(appSearchInput.value));

  // Command palette open/close
  function openCommandPalette() {
    cpModal.classList.remove('hidden');
    cpInput.value = '';
    renderCommandPaletteResults('');
    setTimeout(() => cpInput.focus(), 0);
  }
  function closeCommandPalette() {
    cpModal.classList.add('hidden');
  }
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCommandPalette();
    } else if (e.key === 'Escape' && !cpModal.classList.contains('hidden')) {
      closeCommandPalette();
    }
  });
  cpModal.addEventListener('click', (e) => { if (e.target === cpModal) closeCommandPalette(); });
  cpInput.addEventListener('input', () => renderCommandPaletteResults(cpInput.value));
  cpResults.addEventListener('keydown', (e) => handleCommandPaletteKeys(e));

  // Back button to return to dashboard
  backButton.addEventListener("click", () => showDashboard());

  // Sign out button
  signoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    logUserActivity("Logged Out");
    currentUser = null;
    localStorage.removeItem("loggedInUser");
    google.accounts.id.disableAutoSelect();
    googleSignInButton.style.display = "block";
    userMenu.classList.add("hidden");
    userDropdown.classList.add("hidden");
    showDashboard();
  });

  // Toggle user dropdown menu
  userMenuButton.addEventListener("click", () => {
    const expanded = userMenuButton.getAttribute('aria-expanded') === 'true';
    userMenuButton.setAttribute('aria-expanded', String(!expanded));
    userDropdown.classList.toggle("hidden");
  });

  // Toggle mobile sidebar
  menuButton.addEventListener("click", () =>
    sidebar.classList.toggle("-translate-x-full")
  );

  // Toggle desktop sidebar (collapsed/expanded)
  sidebarToggleButton.addEventListener("click", () => {
    document.documentElement.classList.toggle("sidebar-collapsed");
    localStorage.setItem(
      "sidebarCollapsed",
      document.documentElement.classList.contains("sidebar-collapsed")
    );
  });

  // Close mobile sidebar when clicking outside
  document.addEventListener("click", (e) => {
    if (
      window.innerWidth < 768 &&
      !sidebar.contains(e.target) &&
      !menuButton.contains(e.target)
    ) {
      sidebar.classList.add("-translate-x-full");
    }
  });

  // Show banner if running from file:// (CORS and PWA features disabled)
  function showFileOriginBanner() {
    if (location.protocol !== 'file:') return;
    const banner = document.createElement('div');
    banner.className = 'bg-orange-500 text-white text-sm px-4 py-2 text-center';
    banner.textContent = 'You are running from file:// — some features (Google Sign-In, PWA, apps.json) may not work. Use a local server (e.g., python -m http.server 8080).';
    const container = document.querySelector('main') || document.body;
    container.prepend(banner);
  }

  // Command palette helpers
  function renderCommandPaletteResults(q) {
    cpResults.innerHTML = '';
    const query = (q || '').toLowerCase().trim();
    let items = applicationFiles;
    if (query) {
      items = applicationFiles.filter(a => (`${a.name} ${a.category} ${a.keywords || ''}`).toLowerCase().includes(query));
    }
    items.slice(0, 50).forEach((app, i) => {
      const li = document.createElement('li');
      li.className = 'px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between';
      li.setAttribute('data-app-id', app.id || app.name);
      li.tabIndex = 0;
      li.innerHTML = `<span><span class="mr-2">${app.icon}</span>${app.name}</span><span class="text-xs text-gray-500">${app.category || ''}</span>`;
      li.addEventListener('click', () => { closeCommandPalette(); loadApp(app); });
      li.addEventListener('keydown', (e) => { if (e.key === 'Enter') { closeCommandPalette(); loadApp(app); } });
      cpResults.appendChild(li);
      if (i === 0) li.focus();
    });
  }
  function handleCommandPaletteKeys(e) {
    const items = Array.from(cpResults.querySelectorAll('li'));
    const idx = items.findIndex(el => el === document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); (items[idx + 1] || items[0])?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); (items[idx - 1] || items[items.length - 1])?.focus(); }
    if (e.key === 'Enter') { e.preventDefault(); document.activeElement?.click(); }
  }

  // Online/offline banner
  function updateOfflineBanner() {
    if (navigator.onLine) {
      offlineBanner.classList.add('hidden');
    } else {
      offlineBanner.classList.remove('hidden');
    }
  }
  window.addEventListener('online', updateOfflineBanner);
  window.addEventListener('offline', updateOfflineBanner);

  // Context menu logic
  function showContextMenu(x, y, app) {
    ctxAppId = app.id || app.name;
    ctxOpenNew.onclick = () => { window.open(app.file, '_blank', 'noopener'); hideContextMenu(); };
    ctxTogglePin.textContent = isPinned(ctxAppId) ? 'Unpin' : 'Pin';
    ctxTogglePin.onclick = () => { togglePin(ctxAppId); hideContextMenu(); renderAll(); };
    ctxCacheOffline.onclick = () => { cacheForOffline(app.file); hideContextMenu(); };
    ctxMenu.style.left = `${x}px`;
    ctxMenu.style.top = `${y}px`;
    ctxMenu.classList.remove('hidden');
  }
  function hideContextMenu() { ctxMenu.classList.add('hidden'); ctxAppId = null; }
  document.addEventListener('click', () => hideContextMenu());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideContextMenu(); });

  function cacheForOffline(url) {
    try {
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'PREFETCH', url });
      }
    } catch(_) {}
  }

  // About link - open as modal or new tab (here: modal inside main app)
const aboutLink = document.getElementById("about-link");

aboutLink.addEventListener("click", (e) => {
  e.preventDefault();
  // Show About page in modal
  showAboutModal();
  // Optionally: userDropdown.classList.add("hidden"); // hide dropdown after click
});

// Modal creation function
function showAboutModal() {
  let modal = document.getElementById("about-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "about-modal";
    modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50";
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 max-w-lg w-full relative">
        <button id="close-about-modal" class="absolute top-2 right-2 text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl">&times;</button>
        <iframe src="about.html" class="w-full h-96 rounded-lg border dark:border-gray-700" title="About"></iframe>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById("close-about-modal").onclick = () => modal.remove();
    // Optional: close on outside click
    modal.addEventListener("click", (ev) => {
      if (ev.target === modal) modal.remove();
    });
  }
}

  // Service Worker update toast UI
  function showUpdateToast(onUpdate) {
    if (document.getElementById('update-toast')) return; // avoid duplicates
    const container = document.createElement('div');
    container.id = 'update-toast';
    container.className = 'fixed bottom-4 right-4 z-50 bg-gray-900 text-white rounded-lg shadow-lg p-4 flex items-center space-x-3';

    const text = document.createElement('span');
    text.textContent = 'Update available';
    const btn = document.createElement('button');
    btn.className = 'px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm';
    btn.textContent = 'Reload';
    btn.onclick = () => {
      try { onUpdate && onUpdate(); } catch (_) {}
    };

    container.appendChild(text);
    container.appendChild(btn);
    document.body.appendChild(container);
  }

  // Register the service worker (only on secure contexts such as https or localhost)
  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then((registration) => {
          function trackInstalling(worker) {
            worker.addEventListener('statechange', () => {
              if (worker.state === 'installed') {
                // If there's an existing controller, a new version is available
                if (navigator.serviceWorker.controller) {
                  showUpdateToast(() => {
                    try { worker.postMessage({ type: 'SKIP_WAITING' }); } catch (_) {}
                  });
                }
              }
            });
          }

          if (registration.installing) trackInstalling(registration.installing);
          registration.addEventListener('updatefound', () => {
            if (registration.installing) trackInstalling(registration.installing);
          });
        })
        .catch(() => {
          // Ignore registration failures silently
        });
    });

    // Listen for SW messages about updates for specific resources
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        showUpdateToast(() => {
          try {
            if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            }
          } catch (_) {}
        });
      }
    });

    // When the controller changes (new SW activates), reload to get fresh assets
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  // Deep link handling
  function openAppFromURL() {
    const params = new URLSearchParams(location.search);
    const id = params.get('app');
    if (!id) return false;
    const app = applicationFiles.find(a => (a.id || a.name) === id);
    if (app) { loadApp(app); return true; }
    return false;
  }

  window.addEventListener('popstate', () => {
    const hadApp = openAppFromURL();
    if (!hadApp) {
      const params = new URLSearchParams(location.search);
      const cat = params.get('category');
      filterCategory = cat || null;
      renderAll();
      showDashboard(false);
    }
  });

  // Install prompt
  let deferredInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    installButton.classList.remove('hidden');
  });
  if (installButton) {
    installButton.addEventListener('click', async () => {
      try {
        if (!deferredInstallPrompt) return;
        const res = await deferredInstallPrompt.prompt();
        deferredInstallPrompt = null;
        installButton.classList.add('hidden');
      } catch (_) {}
    });
  }

  function updateURLCategory() {
    const p = new URLSearchParams(location.search);
    if (filterCategory) p.set('category', filterCategory); else p.delete('category');
    history.replaceState(history.state, '', `?${p.toString()}`);
  }

  function renderAll() {
    renderSidebar(appSearchInput.value || '');
    renderCategoryChips();
    renderDashboardGrids();
  }

  if (viewToggle) viewToggle.addEventListener('click', () => {
    viewMode = (viewMode === 'grid') ? 'list' : 'grid';
    localStorage.setItem('viewMode', viewMode);
    renderDashboardGrids();
  });

  // --- 6. INITIALIZATION CALLS ---
  (async () => {
    await loadRegistry();
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    filterCategory = cat || null;
    renderAll();
    showFileOriginBanner();
    updateOfflineBanner();
    if (!openAppFromURL()) showDashboard(false);
    checkSession();
  })();
});

function toggleFullScreen() {
  const elem = document.getElementById("app-iframe");
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    /* IE11 */
    elem.msRequestFullscreen();
  }
}

