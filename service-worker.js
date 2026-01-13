const CACHE_NAME = 'math-wizard-v100';
const ASSETS = [
    './',
    './index.html',
    './addition.html',
    './subtraction.html',
    './multiplication.html',
    './daily.html',
    './assets/styles.css',
    './assets/app.js',
    './assets/pdf.js',
    './assets/vendor/jspdf.umd.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
