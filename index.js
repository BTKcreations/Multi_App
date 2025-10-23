/**
 * Main Application Entry Point
 * Legacy-compliant version without ES modules
 */

// Simple DOM utility functions
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

// Application state
const state = {
  currentView: 'dashboard',
  darkMode: false,
  notes: [],
  tasks: [],
  expenses: []
};

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  console.log('Multi App Dashboard - Initializing...');
  
  // Load state from localStorage
  loadState();
  
  // Initialize theme
  initializeTheme();
  
  // Setup navigation
  setupNavigation();
  
  // Setup dark mode toggle
  setupDarkModeToggle();
  
  // Setup app-specific features
  setupNotes();
  setupCalendar();
  setupBudget();
  setupTasks();
  setupWeather();
  
  console.log('Multi App Dashboard - Initialization complete!');
}

// State management
function loadState() {
  try {
    const saved = localStorage.getItem('multiAppState');
    if (saved) {
      Object.assign(state, JSON.parse(saved));
    }
  } catch (e) {
    console.warn('Could not load state:', e);
  }
}

function saveState() {
  try {
    localStorage.setItem('multiAppState', JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save state:', e);
  }
}

// Theme management
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    state.darkMode = true;
  }
}

function setupDarkModeToggle() {
  const toggle = $('#dark-mode-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      state.darkMode = !state.darkMode;
      localStorage.setItem('theme', state.darkMode ? 'dark' : 'light');
    });
  }
}

// Navigation
function setupNavigation() {
  const navButtons = {
    'nav-dashboard': 'dashboard',
    'nav-notes': 'notes',
    'nav-calendar': 'calendar',
    'nav-budget': 'budget',
    'nav-tasks': 'tasks',
    'nav-weather': 'weather'
  };
  
  Object.keys(navButtons).forEach(id => {
    const btn = $(`#${id}`);
    if (btn) {
      btn.addEventListener('click', () => {
        switchView(navButtons[id]);
      });
    }
  });
}

function switchView(viewName) {
  // Hide all views
  const views = ['dashboard', 'notes', 'calendar', 'budget', 'tasks', 'weather'];
  views.forEach(view => {
    const el = $(`#${view}-view`);
    if (el) el.classList.add('hidden');
  });
  
  // Show selected view
  const selectedView = $(`#${viewName}-view`);
  if (selectedView) selectedView.classList.remove('hidden');
  
  // Update navigation buttons
  $$('aside button').forEach(btn => {
    btn.classList.remove('bg-blue-500', 'text-white');
  });
  const activeBtn = $(`#nav-${viewName}`);
  if (activeBtn) {
    activeBtn.classList.add('bg-blue-500', 'text-white');
  }
  
  state.currentView = viewName;
  saveState();
}

// Notes functionality
function setupNotes() {
  const addBtn = $('#add-note-btn');
  if (addBtn) {
    addBtn.addEventListener('click', addNote);
  }
  renderNotes();
}

function addNote() {
  const title = prompt('Enter note title:');
  if (!title) return;
  
  const content = prompt('Enter note content:');
  if (!content) return;
  
  state.notes.push({
    id: Date.now(),
    title,
    content,
    date: new Date().toISOString()
  });
  
  saveState();
  renderNotes();
}

function renderNotes() {
  const container = $('#notes-container');
  if (!container) return;
  
  container.innerHTML = state.notes.map(note => `
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 class="text-lg font-bold mb-2">${escapeHtml(note.title)}</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-2">${escapeHtml(note.content)}</p>
      <small class="text-gray-500">${new Date(note.date).toLocaleDateString()}</small>
      <button onclick="deleteNote(${note.id})" class="ml-4 text-red-500 hover:text-red-700">Delete</button>
    </div>
  `).join('');
}

function deleteNote(id) {
  state.notes = state.notes.filter(note => note.id !== id);
  saveState();
  renderNotes();
}

// Calendar functionality
function setupCalendar() {
  const container = $('#calendar-container');
  if (!container) return;
  
  const now = new Date();
  container.innerHTML = `
    <div class="text-center">
      <h3 class="text-xl font-bold mb-4">${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
      <p class="text-gray-600 dark:text-gray-400">Calendar view coming soon...</p>
    </div>
  `;
}

// Budget functionality
function setupBudget() {
  const addBtn = $('#add-expense-btn');
  if (addBtn) {
    addBtn.addEventListener('click', addExpense);
  }
  renderExpenses();
}

function addExpense() {
  const description = prompt('Enter expense description:');
  if (!description) return;
  
  const amount = prompt('Enter amount:');
  if (!amount) return;
  
  state.expenses.push({
    id: Date.now(),
    description,
    amount: parseFloat(amount),
    date: new Date().toISOString()
  });
  
  saveState();
  renderExpenses();
}

function renderExpenses() {
  const container = $('#expenses-container');
  if (!container) return;
  
  const total = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  container.innerHTML = `
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
      <h3 class="text-lg font-bold">Total Expenses: $${total.toFixed(2)}</h3>
    </div>
    ${state.expenses.map(expense => `
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div class="flex justify-between items-center">
          <div>
            <h4 class="font-bold">${escapeHtml(expense.description)}</h4>
            <small class="text-gray-500">${new Date(expense.date).toLocaleDateString()}</small>
          </div>
          <div class="text-right">
            <p class="text-lg font-bold">$${expense.amount.toFixed(2)}</p>
            <button onclick="deleteExpense(${expense.id})" class="text-red-500 hover:text-red-700 text-sm">Delete</button>
          </div>
        </div>
      </div>
    `).join('')}
  `;
}

function deleteExpense(id) {
  state.expenses = state.expenses.filter(exp => exp.id !== id);
  saveState();
  renderExpenses();
}

// Tasks functionality
function setupTasks() {
  const addBtn = $('#add-task-btn');
  if (addBtn) {
    addBtn.addEventListener('click', addTask);
  }
  renderTasks();
}

function addTask() {
  const title = prompt('Enter task title:');
  if (!title) return;
  
  state.tasks.push({
    id: Date.now(),
    title,
    completed: false,
    date: new Date().toISOString()
  });
  
  saveState();
  renderTasks();
}

function renderTasks() {
  const container = $('#tasks-container');
  if (!container) return;
  
  container.innerHTML = state.tasks.map(task => `
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-between">
      <div class="flex items-center">
        <input type="checkbox" ${task.completed ? 'checked' : ''} 
               onchange="toggleTask(${task.id})" 
               class="mr-3 w-5 h-5" />
        <span class="${task.completed ? 'line-through text-gray-500' : ''}">
          ${escapeHtml(task.title)}
        </span>
      </div>
      <button onclick="deleteTask(${task.id})" class="text-red-500 hover:text-red-700">Delete</button>
    </div>
  `).join('');
}

function toggleTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveState();
    renderTasks();
  }
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(task => task.id !== id);
  saveState();
  renderTasks();
}

// Weather functionality
function setupWeather() {
  const container = $('#weather-container');
  if (!container) return;
  
  container.innerHTML = `
    <div class="text-center">
      <h3 class="text-xl font-bold mb-4">Weather</h3>
      <p class="text-gray-600 dark:text-gray-400">Weather feature coming soon...</p>
      <p class="text-sm text-gray-500 mt-2">This would integrate with a weather API</p>
    </div>
  `;
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make functions globally available for onclick handlers
window.deleteNote = deleteNote;
window.deleteExpense = deleteExpense;
window.deleteTask = deleteTask;
window.toggleTask = toggleTask;
