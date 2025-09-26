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
  // --- 1. APP DATA ---
  const applicationFiles = [
    {
      name: "Fake News Detection",
      file: "Apps/Fake News Detection System.html",
      icon: "🔍",
      category: "Content Tools",
      keywords: "verify truth article analysis",
    },
    {
      name: "PDF Extractor",
      file: "Apps/PDF Extraction.html",
      icon: "📄",
      category: "Productivity",
      keywords: "document read text data",
    },
    {
      name: "Math Problem Solver",
      file: "Apps/Math_Problem_Solver.html",
      icon: "🧮",
      category: "Utilities",
      keywords: "calculate algebra calculus equation",
    },
    {
      name: "Equation Grapher",
      file: "Apps/Advanced_Equation_Grapher.html",
      icon: "📈",
      category: "Utilities",
      keywords: "plot chart function math",
    },
    {
      name: "Advanced Meeting Notes",
      file: "Apps/Advanced_Meeting_Notes_Formater.html",
      icon: "📝",
      category: "Productivity",
      keywords: "minutes summary format document",
    },
    {
      name: "Language Translator",
      file: "Apps/Language_Translator.html",
      icon: "🌐",
      category: "Content Tools",
      keywords: "translate dictionary language",
    },
    {
      name: "Image Resizer",
      file: "Apps/Image_Resizer.html",
      icon: "📏",
      category: "Utilities",
      keywords: "resize crop dimensions photo",
    },
    {
      name: "Clash of Castles",
      file: "Apps/Clash_of_Castles.html",
      icon: "🏰",
      category: "Games",
      keywords: "clash of castles strategy game",
    },
    {
      name: "Tap Dash",
      file: "Apps/Tap_Dash.html",
      icon: "🏰",
      category: "Games",
      keywords: "Jump from Obstacles Tap Dash Game",
    },
    {
      name: "Circle Bounce Ball",
      file: "Apps/Circle_Bounce_Ball.html",
      icon: "🏰",
      category: "Games",
      keywords: "Ball Bounces in the circle get the score in virtual money",
    },
    {
      name: "AI Markdown Formatter",
      file: "Apps/AI_Markdown_Formatter.html",
      icon: "📝",
      category: "Productivity",
      keywords: "generate summarize format markdown",
    },
    {
      name: "Dots & Boxes",
      file: "Apps/Dots_and_Boxes.html",
      icon: "🟦",
      category: "Games",
      keywords: "dots boxes grid strategy board game",
    },
    // AI_PPT_Maker
    {
      name: "AI PPT Maker",
      file: "Apps/AI_PPT_Maker.html",
      icon: "📊",
      category: "Productivity",
      keywords: "presentation slides generate ai",
    },
    {
      name: "AI Data Analysis",
      file: "Apps/AI_Data_Analysis.html",
      icon: "📈",
      category: "Productivity",
      keywords: "data analysis charts graphs ai",
    },
    {
      name: "Mermaid Diagram Editor",
      file: "Apps/Mermaid_Diagram_Editor.html",
      icon: "🧩",
      category: "Productivity",
      keywords: "mermaid diagram flowchart editor",
    }
    // Add more apps here...
  ];

  // --- 2. ELEMENT REFERENCES ---
  // Views and Core App
  const dashboardView = document.getElementById("dashboard-view");
  const appView = document.getElementById("app-viewer-view");
  const appIframe = document.getElementById("app-iframe");
  const backButton = document.getElementById("back-button");
  const headerTitle = document.getElementById("canvas-title");
  const nav = document.getElementById("canvas-nav");
  // Sidebar
  const sidebar = document.getElementById("sidebar");
  const menuButton = document.getElementById("menu-button");
  const sidebarToggleButton = document.getElementById("sidebar-toggle-button");
  const appSearchInput = document.getElementById("app-search-input");
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
    appIframe.src = app.file;
    showAppViewer(app.name);
    logUserActivity("Viewed App", {
      appName: app.name,
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
  function showDashboard() {
    headerTitle.textContent = "Dashboard";
    appView.classList.add("hidden");
    backButton.classList.add("hidden");
    backButton.classList.remove("flex");
    dashboardView.style.display = "block";
    appIframe.src = "about:blank";
    if (currentUser) {
      logUserActivity("Viewed Dashboard");
    }
  }

  // Renders sidebar with categories and search filtering
  function renderSidebar(searchTerm = "") {
    nav.innerHTML = "";
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

    const filteredApps = applicationFiles.filter((app) => {
      if (!lowerCaseSearchTerm) return true;
      const searchableText =
        `${app.name} ${app.category} ${app.keywords}`.toLowerCase();
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
        link.href = "#";
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
  }

  // --- 5. EVENT LISTENERS ---

  // Search input listener
  appSearchInput.addEventListener("input", () =>
    renderSidebar(appSearchInput.value)
  );

  // Back button to return to dashboard
  backButton.addEventListener("click", showDashboard);

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
  userMenuButton.addEventListener("click", () =>
    userDropdown.classList.toggle("hidden")
  );

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

  // --- 6. INITIALIZATION CALLS ---
  renderSidebar();
  showDashboard();
  checkSession();
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

