const CACHE_NAME = 'tawakkul-cache-v11';
const coreAssets = [
  '/',
  '/index.html',
  '/manifest.json',
  '/fonts.css',
  '/fav.png',
  '/assets/index.js',
  '/assets/index.css',
  '/quran.json',
  '/saan-nuzul.json'
];

const backgroundAssets = [
  '/sources.txt',
  '/fonts/vazirmatn-bold.woff2',
  '/fonts/vazirmatn-light.woff2',
  '/fonts/vazirmatn-medium.ttf',
  '/fonts/vazirmatn-medium.woff2',
  '/fonts/vazirmatn-regular.woff2',
  '/fonts/vazirmatn-semibold.ttf',
  '/fonts/vazirmatn-semibold.woff2',
  '/fonts/Noto_Naskh_Arabic/NotoNaskhArabic-VariableFont_wght.ttf',
  '/fonts/Noto_Naskh_Arabic/static/NotoNaskhArabic-Bold.ttf',
  '/fonts/Noto_Naskh_Arabic/static/NotoNaskhArabic-Medium.ttf',
  '/fonts/Noto_Naskh_Arabic/static/NotoNaskhArabic-Regular.ttf',
  '/fonts/Noto_Naskh_Arabic/static/NotoNaskhArabic-SemiBold.ttf',
  ...Array.from({ length: 114 }, (_, i) => `/khamenei-interpretations/${i + 1}.json`)
];


// Install event: cache the application shell
self.addEventListener('install', (event) => {
  console.log('Service worker: install event in progress.');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service worker: caching core assets and quran.json');
      return Promise.all(
        coreAssets.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn(`Service worker: failed to cache ${asset}`, err);
          })
        )
      );
    }).then(() => {
      console.log('Service worker: core assets cached.');
      // Don't block installation for background assets
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service worker: caching background assets.');
        backgroundAssets.forEach((asset) => {
          cache.add(asset).catch((err) => {
            console.warn(`Service worker: failed to cache background asset ${asset}`, err);
          });
        });
      });
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
  const url = new URL(event.request.url);
  
  // Skip caching for AI API requests and other external APIs
  if (url.hostname.includes('unified-ai-router') ||
      url.hostname.includes('openai') ||
      url.pathname.includes('/chat/completions') ||
      url.pathname.includes('/chat/completion') ||
      url.hostname.includes('ai.') ||
      url.protocol === 'https:' && !url.hostname.includes(window.location.hostname)) {
    // Don't cache AI requests - let them go directly to network
    event.respondWith(fetch(event.request));
    return;
  }

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