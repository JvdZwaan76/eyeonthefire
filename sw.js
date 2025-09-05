/**
 * Eye on the Fire - Service Worker
 * PWA functionality for offline capabilities and caching
 * Version: 1.0.0 - Production Ready
 */

const CACHE_NAME = 'eyeonthefire-v1.0.0';
const STATIC_CACHE_NAME = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE_NAME = `${CACHE_NAME}-dynamic`;

// Files to cache on install
const STATIC_FILES = [
    '/',
    '/index.html',
    '/safety/',
    '/prevention/',
    '/assets/css/styles.css',
    '/assets/js/app.js',
    '/images/eyeonthefire-logo.png',
    '/favicon.ico',
    '/manifest.json',
    // External dependencies (cached with network fallback)
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// Files that should always come from network (dynamic content)
const NETWORK_FIRST_URLS = [
    '/api/',
    '/api/nasa/firms'
];

// Install event - cache static resources
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .catch(error => {
                console.error('Service Worker: Failed to cache static files', error);
            })
    );
    
    // Force activation of new service worker
    self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => {
                        // Remove old versions of our cache
                        return cacheName.startsWith('eyeonthefire-') && 
                               cacheName !== STATIC_CACHE_NAME && 
                               cacheName !== DYNAMIC_CACHE_NAME;
                    })
                    .map(cacheName => {
                        console.log('Service Worker: Removing old cache', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        })
    );
    
    // Take control of all pages
    self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle API requests with network-first strategy
    if (isNetworkFirstUrl(url.pathname)) {
        event.respondWith(networkFirst(request));
        return;
    }
    
    // Handle static assets with cache-first strategy
    if (isStaticAsset(url)) {
        event.respondWith(cacheFirst(request));
        return;
    }
    
    // Handle navigation requests with network-first, cache fallback
    if (isNavigationRequest(request)) {
        event.respondWith(networkFirstWithOfflineFallback(request));
        return;
    }
    
    // Default: stale-while-revalidate strategy
    event.respondWith(staleWhileRevalidate(request));
});

// Network-first strategy for dynamic content
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Network failed, trying cache', error);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page or error response
        return createOfflineResponse(request);
    }
}

// Cache-first strategy for static assets
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Failed to fetch static asset', error);
        return createOfflineResponse(request);
    }
}

// Network-first with offline fallback for navigation
async function networkFirstWithOfflineFallback(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Network failed for navigation', error);
        
        // Try to serve from cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Serve offline page
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }
        
        // Last resort: create minimal offline response
        return createMinimalOfflineResponse();
    }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
            const cache = caches.open(DYNAMIC_CACHE_NAME);
            cache.then(c => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
    }).catch(error => {
        console.log('Service Worker: Network failed in stale-while-revalidate', error);
    });
    
    return cachedResponse || fetchPromise;
}

// Helper functions
function isNetworkFirstUrl(pathname) {
    return NETWORK_FIRST_URLS.some(url => pathname.startsWith(url));
}

function isStaticAsset(url) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
    const pathname = url.pathname.toLowerCase();
    return staticExtensions.some(ext => pathname.endsWith(ext)) || 
           url.hostname === 'fonts.googleapis.com' ||
           url.hostname === 'fonts.gstatic.com' ||
           url.hostname === 'cdnjs.cloudflare.com';
}

function isNavigationRequest(request) {
    return request.mode === 'navigate' || 
           (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

function createOfflineResponse(request) {
    const url = new URL(request.url);
    
    // For HTML requests, return basic offline page
    if (request.headers.get('accept').includes('text/html')) {
        return new Response(
            createOfflineHTML(),
            {
                status: 200,
                statusText: 'OK',
                headers: {
                    'Content-Type': 'text/html; charset=utf-8'
                }
            }
        );
    }
    
    // For other requests, return appropriate offline response
    if (url.pathname.startsWith('/api/')) {
        return new Response(
            JSON.stringify({
                error: 'Offline',
                message: 'No internet connection. Please try again when online.',
                offline: true
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
    
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
}

function createMinimalOfflineResponse() {
    return new Response(
        createOfflineHTML(),
        {
            status: 200,
            statusText: 'OK',
            headers: {
                'Content-Type': 'text/html; charset=utf-8'
            }
        }
    );
}

function createOfflineHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline - Eye on the Fire</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #FF4444 0%, #FF6B35 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 2rem;
        }
        .offline-container {
            max-width: 500px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 1rem;
            padding: 3rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .offline-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        p {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .retry-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .retry-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">🔥</div>
        <h1>You're Offline</h1>
        <p>No internet connection detected. Eye on the Fire requires an active internet connection to provide real-time wildfire data.</p>
        <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
    </div>
</body>
</html>
    `;
}

// Background sync for when connectivity is restored
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Background sync triggered');
        event.waitUntil(syncFireData());
    }
});

async function syncFireData() {
    try {
        // Attempt to fetch latest fire data when back online
        const response = await fetch('/api/nasa/firms?source=MODIS_NRT&days=1&area=usa');
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put('/api/nasa/firms?source=MODIS_NRT&days=1&area=usa', response.clone());
            console.log('Service Worker: Fire data synced successfully');
            
            // Notify all clients that new data is available
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'DATA_SYNC_COMPLETE',
                    timestamp: Date.now()
                });
            });
        }
    } catch (error) {
        console.log('Service Worker: Failed to sync fire data', error);
    }
}

// Push notification handling (for future fire alerts)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/images/eyeonthefire-logo.png',
            badge: '/images/notification-badge.png',
            tag: 'fire-alert',
            requireInteraction: true,
            actions: [
                {
                    action: 'view',
                    title: 'View Map',
                    icon: '/images/map-icon.png'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'Fire Alert', options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/#map')
        );
    }
});

// Handle service worker updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('Service Worker: Script loaded successfully');
