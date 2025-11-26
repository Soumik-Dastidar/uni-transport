const CACHE_NAME = 'unitransport-v2';
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

// Install Event: Cache Core Assets
self.addEventListener('install', (e) => {
    self.skipWaiting(); // Activate immediately
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

// Activate Event: Clean up old caches
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

// Fetch Event: Stale-While-Revalidate Strategy
self.addEventListener('fetch', (e) => {
    // Skip cross-origin requests like Google Maps or API calls if needed, 
    // but for this app we want to cache CDN assets too.
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            const fetchPromise = fetch(e.request).then((networkResponse) => {
                // Update cache with new version
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Fallback logic could go here
            });
            // Return cached response immediately if available, otherwise wait for network
            return cachedResponse || fetchPromise;
        })
    );
});

// Background Sync Event
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-location') {
        event.waitUntil(
            // Logic to sync data when back online
            // In a real app, this would send stored offline location points to the server
            console.log('Background Sync: Sending offline data...')
        );
    }
});

// Periodic Sync Event
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-schedule') {
        event.waitUntil(
            // Logic to fetch new bus schedules in the background
            console.log('Periodic Sync: Updating schedules...')
        );
    }
});

// Push Notification Event
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.text() : 'Bus Update';
    const options = {
        body: data,
        icon: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png'
    };
    event.waitUntil(
        self.registration.showNotification('UniTransport', options)
    );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('./index.html')
    );
});
