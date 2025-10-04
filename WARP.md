# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Multi App Dashboard is a static, client-side dashboard that loads individual tools/games as standalone HTML pages into an iframe.
- No build system, package.json, or test framework is present. Development happens directly against HTML/JS/CSS files.
- Tech: Tailwind via CDN, vanilla JS, Google Identity Services, and basic PWA assets (manifest + service worker stub).

Common commands
- Run locally (no build step): open index.html in a browser.

- Optional: serve over HTTP for PWA-like behavior and clean reloads
  - Python (cross-platform):
    ```bash path=null start=null
    python -m http.server 8080
    ```
  - PowerShell (static file preview with Python as above). Once running, open http://localhost:8080/ and navigate to index.html.

- Preview a specific tool directly (bypassing the dashboard): open its HTML page under Apps/, e.g. Apps/Image_Resizer.html.

Notes on build/lint/tests
- There is no package.json, linter config, or test suite in this repository. Accordingly, there are no build, lint, or test commands defined.

High-level architecture
- Entry HTML (index.html)
  - Loads Tailwind via CDN and Google Identity script.
  - Declares the sidebar, header (with theme toggle and user menu), and two main views:
    - dashboard-view: the welcome screen.
    - app-viewer-view: an iframe container used to render a tool/app page when selected.
  - Links manifest.json; no explicit service worker registration is present.

- Main controller (index.js)
  - App registry: a data array defines each app with name, file path (under Apps/), icon, category, and keywords.
  - UI composition: renders a grouped, searchable sidebar from the registry; clicking an item loads its file into the iframe and switches the view/state.
  - Navigation/state: toggles between dashboard and app viewer; updates header title; adapts for mobile/desktop sidebar behavior; persists sidebar collapse state in localStorage.
  - Authentication: integrates Google Identity Services, decodes the credential, stores a lightweight user object in localStorage, and updates UI to show user info and sign-out action.
  - Activity logging: user actions (login, viewing apps, etc.) are appended per-user to localStorage with a bounded history.
  - Theming: applies dark/light/system by toggling a class on the document element and persists preference in localStorage. A small inline script in index.html pre-applies the theme to avoid FOUC.
  - About modal: loads about.html in a modal iframe.

- Tools/apps (Apps/ directory)
  - Each app is a standalone HTML file loaded into the dashboard’s iframe. They do not share a bundler or module system with the dashboard—communication is purely via navigation (src change) and the iframe.

- PWA assets
  - manifest.json and manifest.pwa.json define app metadata and icons. service-worker.js exists but is a stub and is not registered anywhere in the codebase (no navigator.serviceWorker.register detected), so offline support is currently inactive.

- Legacy/unused
  - dashboard.js appears to be an earlier version of the dashboard controller and is not referenced by index.html. The active controller is index.js.

Key files
- index.html: structure, header/sidebar, view containers, manifest link, and inline theme/sidebar pre-application.
- index.js: main application logic (registry, navigation, auth, logging, theming, modal).
- Apps/*.html: self-contained tools and games rendered in the iframe.
- about.html: content for the modal About dialog.
- manifest.json, manifest.pwa.json: PWA metadata.
- service-worker.js: present but not registered.

Important points from README.md
- “Just open index.html in your browser. No build step required!”
- Live Demo: https://btkcreations.github.io/Multi_App/
- Features align with the architecture above: Google Sign-In, sidebar with categories + search, iframe app loading, user activity logging, dark/light theme, and PWA intent.

Environment assumptions for Warp
- Windows + PowerShell works out of the box since no local tooling is required.
- For local HTTP serving, ensure Python is available if you use the http.server example above.
