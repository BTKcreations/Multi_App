// Basic service worker for offline support
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('fetch', function(event) {
  // You can add caching logic here if needed
});


/**
 * @file service-worker.js
 * @description Handles background tasks for the extension.
 */

// Listen for the extension's action icon to be clicked.
chrome.action.onClicked.addListener((tab) => {
  // When the icon is clicked, open the dashboard page.
  chrome.tabs.create({
    url: 'index.html'
  });
});

// A simple install listener to log a message when the extension is installed.
self.addEventListener('install', () => {
  console.log('Multi-App Dashboard extension installed.');
});
