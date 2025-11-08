const CACHE_NAME = 'tawakkul-cache-v1';
const assetsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/fonts.css',
  '/quran.json',
  '/fav.png',
  '/sources/sources.json'
];

// Install event: cache the application shell
self.addEventListener('install', (event) => {
  console.log('Service worker: install event in progress.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service worker: caching app shell');
        return cache.addAll(assetsToCache);
      })
      .then(() => {
        console.log('Service worker: install completed');
        self.skipWaiting();
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service worker: activate event in progress.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service worker: deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service worker: activate completed');
      return self.clients.claim();
    })
  );
});

// Fetch event: serve from cache, fallback to network, and cache new requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // If the response is in the cache, return it
        if (cachedResponse) {
          return cachedResponse;
        }

        // If the response is not in the cache, fetch it from the network
        return fetch(event.request).then((networkResponse) => {
          // Clone the response because it's a stream and can only be consumed once
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              // Cache the new response for future use
              cache.put(event.request, responseToCache);
            });

          // Return the network response
          return networkResponse;
        });
      }).catch((error) => {
        // Handle fetch errors, e.g., when the network is unavailable
        console.error('Service worker fetch error:', error);
        // You could return a fallback offline page here if you have one
      })
  );
});