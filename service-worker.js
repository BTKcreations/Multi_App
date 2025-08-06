// Basic service worker for offline support
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('fetch', function(event) {
  // You can add caching logic here if needed
});
