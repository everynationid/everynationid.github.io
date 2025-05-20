const CACHE_NAME = 'church-site-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/404.html',
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
        caches.match(e.request).then(response => {
            // Return cached file if found
            if(response) return response;
            
            // Handle navigation requests
            if(e.request.mode === 'navigate') {
                return caches.match('/index.html');
            }
            
            return fetch(e.request);
        })
    );
});