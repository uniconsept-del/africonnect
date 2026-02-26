const CACHE_NAME = 'africonnect-v1';
const ASSETS = [
  './',
  './index.html',
  './script.js',
  './styles.css',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Network first for Firebase, cache fallback for static assets
  if (event.request.url.includes('firebase') || event.request.url.includes('googleapis')) {
    return; // Don't intercept Firebase requests
  }
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then(r => r || caches.match('./index.html'))
    )
  );
});
