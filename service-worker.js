'use strict';

// Service Worker version
const CACHE_NAME = 'multi-app-cache-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache on install
const CACHE_FILES = [
  '/',
  '/index.html',
  '/index.js',
  '/dashboard.js',
  '/apps.json',
  '/about.html',
  '/offline.html',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.json'
];

// Feature check for Service Worker API
if (!self.CacheStorage) {
  console.warn('Cache API not available');
}

// Install event - cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      if (!self.caches) return;
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(CACHE_FILES);
        await self.skipWaiting();
      } catch (error) {
        console.error('Cache installation failed:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if (!self.caches) return;
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
        await self.clients.claim();
      } catch (error) {
        console.error('Cache activation failed:', error);
      }
    })()
  );
});

// Helper: Check if two responses are the same
const responsesAreSame = (resp1, resp2) => {
  if (!resp1 || !resp2) return false;
  return resp1.headers.get('etag') === resp2.headers.get('etag') ||
         resp1.headers.get('last-modified') === resp2.headers.get('last-modified');
};

// Helper: Notify clients of updates
const notifyClientsUpdate = (url) => {
  if (!self.clients) return;
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'UPDATE_AVAILABLE',
        url: url
      });
    });
  });
};

// Fetch event - handle requests with multiple strategies
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests
  if (req.method !== 'GET') return;

  // 1) Network-first strategy for core HTML pages
  if (url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(req)
        .then(async (networkResp) => {
          if (!self.caches) return networkResp;
          const clone = networkResp.clone();
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, clone);
          return networkResp;
        })
        .catch(async () => {
          if (!self.caches) return Response.error();
          const cached = await caches.match(req);
          return cached || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 2) Cache-first strategy for app pages under /Apps/
  if (url.pathname.includes('/Apps/')) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse; // use offline copy
        if (!self.fetch) return Response.error();
        return fetch(req)
          .then((networkResponse) => {
            if (!self.caches) return networkResponse;
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(async () => {
            if (!self.caches) return Response.error();
            return (await caches.match(req)) || caches.match(OFFLINE_URL);
          });
      })
    );
    return;
  }

  // 3) Same-origin static assets: stale-while-revalidate
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((networkResp) => {
            if (!self.caches) return networkResp;
            caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResp.clone()));
            if (cached && !responsesAreSame(cached, networkResp)) {
              notifyClientsUpdate(req.url);
            }
            return networkResp.clone();
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 4) Cross-origin (CDNs): try network, fall back to cache
  event.respondWith(
    fetch(req)
      .then((networkResp) => {
        // Optionally cache successful CDN responses
        if (!self.caches) return networkResp;
        const respClone = networkResp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, respClone));
        return networkResp;
      })
      .catch(() => {
        if (!self.caches) return Response.error();
        return caches.match(req);
      })
  );
});
