// A basic service worker to make the app installable.
self.addEventListener('install', (event) => {
  console.log('Service worker installed');
});

self.addEventListener('fetch', (event) => {
  // This is a basic fetch handler.
  // For a real-world app, you would want to implement caching strategies here.
  event.respondWith(fetch(event.request));
});