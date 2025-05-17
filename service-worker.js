const cacheName = "eni-cache-v1";
const assetsToCache = [
  "/",
  "/index.html",
  "/admin.html",
  "/assets/css/styles.css",
  "/assets/js/main.js",
  "/assets/js/admin.js",
  "/assets/js/auth.js",
  "/data/content.json"
];

// Install service worker and cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

// Serve cached content when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});