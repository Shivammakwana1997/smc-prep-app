const CACHE_NAME = 'smc-prep-v3';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/sw.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => Promise.all(
            cacheNames.map(cache => {
                if (cache !== CACHE_NAME) return caches.delete(cache);
            })
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) return response;
            return fetch(event.request).then(fetchResponse => {
                if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') return fetchResponse;
                const responseToCache = fetchResponse.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                return fetchResponse;
            }).catch(() => new Response('You are offline. Connect to the internet to cache the app.', {status:200, headers:{'Content-Type':'text/plain'}}));
        })
    );
});
