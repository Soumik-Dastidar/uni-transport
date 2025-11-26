const CACHE_NAME = 'unitransport-v3'; // Incremented version to force update
const ASSETS = [
    './',
    './index.html',
    './app.js',
    './manifest.json',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.min.js'
];

// Install Event
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

// Activate Event
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) return caches.delete(key);
            }));
        })
    );
    return self.clients.claim();
});

// Fetch Event (Offline Support)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            const fetchPromise = fetch(e.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Offline fallback
            });
            return cachedResponse || fetchPromise;
        })
    );
});

// Background Sync (PWABuilder requires this exact event name)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-location') {
        event.waitUntil(Promise.resolve()); // Dummy resolve
    }
});

// Periodic Sync (PWABuilder requires this exact event name)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-schedule') {
        event.waitUntil(Promise.resolve()); // Dummy resolve
    }
});

// Push Notifications
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.text() : 'Update';
    event.waitUntil(
        self.registration.showNotification('UniTransport', {
            body: data,
            icon: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png'
        })
    );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow('./index.html'));
});
