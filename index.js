// --- Google Sign-In Initialization ---
// This is called when the Google library finishes loading.
window.onload = function () {
  google.accounts.id.initialize({
    client_id:
      "952892249789-e2h3j0k5ffdgv2hdnuebsfv3m7ul9mr2.apps.googleusercontent.com", // Your Client ID
    callback: handleCredentialResponse,
  });
  google.accounts.id.renderButton(document.getElementById("g_id_signin"), {
    theme: "outline",
    size: "large",
  });
  google.accounts.id.prompt();
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
      // Fallback to minimal set if offline and no cache yet
      applicationFiles = [
        { id: 'image-resizer', name: 'Image Resizer', file: 'Apps/Image_Resizer.html', icon: '📏', category: 'Utilities', keywords: 'resize crop' }
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
  // User Authentication & Menu
  const userArea = document.getElementById("user-area");
  const userMenu = document.getElementById("user-menu");
  const userMenuButton = document.getElementById("user-menu-button");
  const userDropdown = document.getElementById("user-dropdown");
  const signoutButton = document.getElementById("signout-button");
  const googleSignInButton = document.getElementById("g_id_signin");

  // --- 3. STATE VARIABLES ---
  let currentUser = null;

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

  // Renders sidebar with categories and search filtering
  function renderSidebar(searchTerm = "") {
    nav.innerHTML = "";
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

    const filteredApps = applicationFiles.filter((app) => {
      if (!lowerCaseSearchTerm) return true;
      const searchableText = `${app.name} ${app.category} ${app.keywords}`.toLowerCase();
      return searchableText.includes(lowerCaseSearchTerm);
    });

    const groupedApps = filteredApps.reduce((acc, app) => {
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
        nav.appendChild(link);
      });
    });

    // Enhance keyboard navigation on the rendered list
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

  // Search input listener and shortcut
  appSearchInput.addEventListener("input", () => renderSidebar(appSearchInput.value));
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      appSearchInput.focus();
    }
  });

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
    document.body.classList.toggle("sidebar-collapsed");
    localStorage.setItem(
      "sidebarCollapsed",
      document.body.classList.contains("sidebar-collapsed")
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
    if (!hadApp) showDashboard(false);
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

  // --- 6. INITIALIZATION CALLS ---
  (async () => {
    await loadRegistry();
    renderSidebar();
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

