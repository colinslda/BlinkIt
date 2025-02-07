const cacheName = 'defi-express-cache-v1';
const staticAssets = [
    '/',
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    'images/icon-192x192.png', // Ajoutez vos icônes
    'images/icon-512x512.png'
];

self.addEventListener('install', async event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log('Mise en cache des assets statiques');
            return cache.addAll(staticAssets);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cacheResponse => {
            return cacheResponse || fetch(event.request);
        })
    );
});
