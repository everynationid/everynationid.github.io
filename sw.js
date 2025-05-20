const CACHE_NAME = 'church-site-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/content.json',
    '/manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(response => response || fetch(e.request))
    );
});