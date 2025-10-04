'use strict';

// Cache version. Bump this to invalidate old caches when deploying updates.
const CACHE_NAME = 'multiapp-cache-v3';
const OFFLINE_URL = './offline.html';

// Precache a known list of app HTML files so they work offline even on first use.
// Keep this in sync with apps.json.
const APPS_TO_PRECACHE = [
  'Apps/Fake News Detection System.html',
  'Apps/PDF Extraction.html',
  'Apps/Math_Problem_Solver.html',
  'Apps/Advanced_Equation_Grapher.html',
  'Apps/Advanced_Meeting_Notes_Formater.html',
  'Apps/Language_Translator.html',
  'Apps/Image_Resizer.html',
  'Apps/Clash_of_Castles.html',
  'Apps/Tap_Dash.html',
  'Apps/Circle_Bounce_Ball.html',
  'Apps/AI_Markdown_Formatter.html',
  'Apps/Dots_and_Boxes.html',
  'Apps/AI_PPT_Maker.html',
  'Apps/AI_Data_Analysis.html',
  'Apps/Mermaid_Diagram_Editor.html',
  'Apps/Ratio_Calc.html'
];

// Core assets to pre-cache for offline and quick loads.
const CORE_ASSETS = [
  './',
  './index.html',
  './index.js',
  './about.html',
  './manifest.json',
  './apps.json',
  './icon-192.svg',
  './icon-512.svg',
  OFFLINE_URL,
  ...APPS_TO_PRECACHE
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        await cache.addAll(CORE_ASSETS);
      } catch (_) {
        // If some resources fail (e.g., cross-origin), continue with what we could cache
      }
    })
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
    return;
  }
  if (event.data && event.data.type === 'PREFETCH' && event.data.url) {
    event.waitUntil((async () => {
      try {
        const resp = await fetch(event.data.url, { cache: 'no-cache' });
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.data.url, resp.clone());
      } catch (_) {}
    })());
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // Only cache safe GETs

  const url = new URL(req.url);

  // 1) Handle navigations (HTML) with network-first and offline fallback
  const isNavigation = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isNavigation) {
    event.respondWith(
      fetch(req)
        .then(async (networkResp) => {
          const clone = networkResp.clone();
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, clone);
          return networkResp;
        })
        .catch(async () => {
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
        return fetch(req)
          .then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(async () => (await caches.match(req)) || caches.match(OFFLINE_URL));
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
        const respClone = networkResp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, respClone));
        return networkResp;
      })
      .catch(() => caches.match(req))
  );
});
