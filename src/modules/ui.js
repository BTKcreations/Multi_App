/**
 * UI Module - Handles UI rendering and interactions
 * Manages dashboard rendering and sidebar logic
 */

import { getState, setState } from './state.js';
import { getApps } from './app-manager.js';
import { filterApps } from './search.js';

/**
 * Render the dashboard with apps
 */
export function renderDashboard() {
  const dashboardElement = document.getElementById('dashboard');
  if (!dashboardElement) return;

  const { searchQuery, currentCategory } = getState();
  const apps = getApps();
  const filteredApps = filterApps(apps, searchQuery, currentCategory);

  if (filteredApps.length === 0) {
    dashboardElement.innerHTML = `
      <div class="empty-state">
        <p>No apps found</p>
      </div>
    `;
    return;
  }

  dashboardElement.innerHTML = filteredApps.map(app => `
    <div class="app-card" data-app-id="${app.id}">
      <div class="app-icon">${app.icon || '📱'}</div>
      <h3 class="app-title">${app.name}</h3>
      <p class="app-description">${app.description || ''}</p>
      <button class="launch-btn" data-url="${app.url}">Launch</button>
    </div>
  `).join('');

  // Add event listeners to launch buttons
  dashboardElement.querySelectorAll('.launch-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const url = e.target.dataset.url;
      if (url) {
        window.open(url, '_blank');
      }
    });
  });
}

/**
 * Render the sidebar with categories
 */
export function renderSidebar() {
  const sidebarElement = document.getElementById('sidebar');
  if (!sidebarElement) return;

  const { currentCategory } = getState();
  const apps = getApps();
  
  // Get unique categories
  const categories = ['all', ...new Set(apps.map(app => app.category).filter(Boolean))];

  sidebarElement.innerHTML = `
    <div class="sidebar-content">
      <h2>Categories</h2>
      <ul class="category-list">
        ${categories.map(cat => `
          <li>
            <button 
              class="category-btn ${currentCategory === cat ? 'active' : ''}"
              data-category="${cat}"
            >
              ${cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          </li>
        `).join('')}
      </ul>
    </div>
  `;

  // Add event listeners to category buttons
  sidebarElement.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = e.target.dataset.category;
      setState({ currentCategory: category });
      renderDashboard();
      renderSidebar(); // Re-render to update active state
    });
  });
}

/**
 * Toggle sidebar visibility
 */
export function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('collapsed');
  }
}

/**
 * Show a notification/toast message
 */
export function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Initialize UI event listeners
 */
export function initializeUI() {
  // Render initial UI
  renderSidebar();
  renderDashboard();
  
  // Setup sidebar toggle button
  const toggleBtn = document.getElementById('sidebar-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleSidebar);
  }
}
