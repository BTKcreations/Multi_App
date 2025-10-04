'use strict';

// Cache version. Bump this to invalidate old caches when deploying updates.
const CACHE_NAME = 'multiapp-cache-v1';

// Core assets to pre-cache for offline and quick loads.
const CORE_ASSETS = [
  './',
  './index.html',
  './index.js',
  './about.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  // Activate the new SW immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
      await self.clients.claim();
    })()
  );
});

function responsesAreSame(a, b) {
  try {
    if (!a || !b) return false;
    const etagA = a.headers.get('ETag');
    const etagB = b.headers.get('ETag');
    if (etagA && etagB) return etagA === etagB;
    const lmA = a.headers.get('Last-Modified');
    const lmB = b.headers.get('Last-Modified');
    if (lmA && lmB) return lmA === lmB;
  } catch (_) {
    // ignore
  }
  // If we can't determine, assume different to be conservative and update cache + notify.
  return false;
}

async function notifyClientsUpdate(url) {
  try {
    const allClients = await self.clients.matchAll({ includeUncontrolled: true });
    for (const client of allClients) {
      client.postMessage({ type: 'UPDATE_AVAILABLE', url });
    }
  } catch (_) {
    // ignore
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // Only cache safe GETs

  const url = new URL(req.url);

  // 1) Cache-first strategy for app pages under /Apps/
  if (url.pathname.includes('/Apps/')) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse; // use offline copy
        return fetch(req)
          .then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => cachedResponse);
      })
    );
    return;
  }

  // 2) Stale-while-revalidate for same-origin core assets (HTML/JS/SVG/etc.)
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((networkResp) => {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResp.clone()));
            if (cached && !responsesAreSame(cached, networkResp)) {
              // Notify clients that a newer version of this resource is available
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

  // 3) For cross-origin requests (e.g., CDNs), just try network, fall back to cache if available
  event.respondWith(
    fetch(req)
      .then((networkResp) => networkResp)
      .catch(() => caches.match(req))
  );
});
