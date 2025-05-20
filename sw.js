const CACHE_NAME = 'church-site-v3';
const ASSETS = [
    '/',
    '/index.html',
    '/404.html',
    '/style.css',
    '/script.js',
    '/content.json',
    '/manifest.json'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching core assets');
                return cache.addAll(ASSETS);
            })
            .catch(error => {
                console.error('Error caching assets:', error);
            })
    );
    // Activate the new service worker immediately
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Claim clients immediately
    return self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip cross-origin requests
    if (event.request.url.startsWith(self.location.origin) === false) return;

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached response
                    return cachedResponse;
                }
                
                // For navigation requests, serve index.html if not in cache
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }

                // For other requests, go to network
                return fetch(event.request)
                    .then(networkResponse => {
                        // Don't cache non-successful responses
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }
                        
                        // Cache new successful responses
                        return caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, networkResponse.clone());
                                return networkResponse;
                            });
                    })
                    .catch(() => {
                        // If both cache and network fail for resources, return a fallback
                        if (event.request.url.indexOf('.html') > -1) {
                            return caches.match('/index.html');
                        }
                        
                        // Return nothing for other resource types
                        return new Response('Network error', {
                            status: 408,
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});