self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('church-cache').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/assets/style.css',
        '/assets/script.js',
        '/content/home.json'
      ]);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});