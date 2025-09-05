/**
 * Eye on the Fire - Service Worker v3.0
 * Aggressive caching for mobile performance and offline support
 */

const CACHE_VERSION = 'eyeonthefire-v3.0.1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const TILES_CACHE = `${CACHE_VERSION}-tiles`;
const FIRE_DATA_CACHE = `${CACHE_VERSION}-firedata`;

// Cache duration constants
const CACHE_DURATIONS = {
  STATIC: 7 * 24 * 60 * 60 * 1000,      // 7 days
  TILES: 30 * 24 * 60 * 60 * 1000,      // 30 days  
  FIRE_DATA: 30 * 60 * 1000,            // 30 minutes
  GEOCODING: 24 * 60 * 60 * 1000        // 24 hours
};

// Essential files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/app.css',
  '/js/app.js',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.png',
  '/apple-touch-icon.png',
  // Leaflet core files
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// URLs that should always go to network first
const NETWORK_FIRST_URLS = [
  '/api/fires',
  '/api/nasa/firms',
  'analytics.google.com',
  'cloudflareinsights.com'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('ServiceWorker: Installing v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('ServiceWorker: Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, {
          cache: 'reload' // Force fresh download
        })));
      })
      .then(() => {
        console.log('ServiceWorker: Static assets cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch(error => {
        console.error('ServiceWorker: Failed to cache static assets:', error);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  console.log('ServiceWorker: Activating v' + CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName.startsWith('eyeonthefire-') && 
                     !cacheName.includes(CACHE_VERSION);
            })
            .map(cacheName => {
              console.log('ServiceWorker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Take control of all pages immediately
      self.clients.claim()
    ])
  );
});

// Fetch Event Handler
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Route requests to appropriate strategy
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isTileRequest(url)) {
    event.respondWith(staleWhileRevalidate(request, TILES_CACHE));
  } else if (isFireDataRequest(url)) {
    event.respondWith(networkFirstWithFallback(request, FIRE_DATA_CACHE));
  } else if (isGeocodingRequest(url)) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  } else if (isNetworkFirstUrl(url)) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

// Caching Strategies

/**
 * Cache First - For static assets that rarely change
 */
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      // Check if cached version is still fresh
      const cachedDate = new Date(cached.headers.get('sw-cached-date') || 0);
      const isStale = Date.now() - cachedDate.getTime() > CACHE_DURATIONS.STATIC;
      
      if (!isStale) {
        return cached;
      }
    }
    
    // Fetch fresh version
    const response = await fetch(request);
    
    if (response.ok) {
      const responseClone = response.clone();
      const headers = new Headers(responseClone.headers);
      headers.set('sw-cached-date', new Date().toISOString());
      
      const responseWithTimestamp = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: headers
      });
      
      await cache.put(request, responseWithTimestamp);
    }
    
    return response;
    
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    
    // Fallback to cache even if stale
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Ultimate fallback for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

/**
 * Stale While Revalidate - For assets that can be stale
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Fetch fresh version in background
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        const responseClone = response.clone();
        const headers = new Headers(responseClone.headers);
        headers.set('sw-cached-date', new Date().toISOString());
        
        const responseWithTimestamp = new Response(responseClone.body, {
          status: responseClone.status,
          statusText: responseClone.statusText,
          headers: headers
        });
        
        cache.put(request, responseWithTimestamp);
      }
      return response;
    })
    .catch(error => {
      console.warn('Background fetch failed:', error);
      return cached; // Return cached version if fetch fails
    });
  
  // Return cached version immediately if available
  if (cached) {
    return cached;
  }
  
  // Otherwise wait for fetch
  return fetchPromise;
}

/**
 * Network First with Fallback - For critical real-time data
 */
async function networkFirstWithFallback(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const responseClone = response.clone();
      const headers = new Headers(responseClone.headers);
      headers.set('sw-cached-date', new Date().toISOString());
      
      const responseWithTimestamp = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: headers
      });
      
      await cache.put(request, responseWithTimestamp);
    }
    
    return response;
    
  } catch (error) {
    console.warn('Network first failed, trying cache:', error);
    
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      // Check if cached data is not too old for fire data
      const cachedDate = new Date(cached.headers.get('sw-cached-date') || 0);
      const isStale = Date.now() - cachedDate.getTime() > CACHE_DURATIONS.FIRE_DATA;
      
      if (!isStale) {
        return cached;
      }
      
      // Return stale data with warning header
      const headers = new Headers(cached.headers);
      headers.set('sw-cache-status', 'stale');
      
      return new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: headers
      });
    }
    
    throw error;
  }
}

/**
 * Network First - For analytics and tracking
 */
async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Fail silently for analytics requests
    return new Response('', { status: 204 });
  }
}

// URL Classification Functions

function isStaticAsset(url) {
  const pathname = url.pathname;
  return pathname.includes('/css/') ||
         pathname.includes('/js/') ||
         pathname.includes('/images/') ||
         pathname.includes('/fonts/') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.woff2') ||
         pathname.endsWith('.woff') ||
         pathname.endsWith('.svg') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.ico') ||
         pathname.endsWith('/manifest.json') ||
         url.hostname === 'unpkg.com';
}

function isTileRequest(url) {
  return url.hostname.includes('openstreetmap.org') ||
         url.hostname.includes('tile.openstreetmap.org') ||
         url.hostname.includes('arcgisonline.com') ||
         url.pathname.includes('/tile/') ||
         /\/\d+\/\d+\/\d+\.png$/.test(url.pathname);
}

function isFireDataRequest(url) {
  return url.pathname.includes('/api/fires') ||
         url.pathname.includes('/api/nasa/firms') ||
         url.pathname.includes('fire') && url.pathname.includes('.csv');
}

function isGeocodingRequest(url) {
  return url.hostname.includes('nominatim.openstreetmap.org') ||
         url.pathname.includes('/geocode') ||
         url.pathname.includes('/reverse');
}

function isNetworkFirstUrl(url) {
  return NETWORK_FIRST_URLS.some(pattern => 
    url.hostname.includes(pattern) || url.pathname.includes(pattern)
  );
}

// Background Sync for Fire Data Updates
self.addEventListener('sync', event => {
  if (event.tag === 'fire-data-sync') {
    event.waitUntil(syncFireData());
  }
});

async function syncFireData() {
  try {
    console.log('ServiceWorker: Background syncing fire data');
    
    const response = await fetch('/api/fires.csv');
    if (response.ok) {
      const cache = await caches.open(FIRE_DATA_CACHE);
      const headers = new Headers(response.headers);
      headers.set('sw-cached-date', new Date().toISOString());
      headers.set('sw-sync-update', 'true');
      
      const responseWithTimestamp = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
      });
      
      await cache.put('/api/fires.csv', responseWithTimestamp);
      
      // Notify clients of new data
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'FIRE_DATA_UPDATED',
          timestamp: Date.now()
        });
      });
    }
  } catch (error) {
    console.error('ServiceWorker: Background sync failed:', error);
  }
}

// Push Notifications for Fire Alerts
self.addEventListener('push', event => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New wildfire activity detected in your area',
      icon: '/favicon.png',
      badge: '/badge.png',
      tag: data.tag || 'fire-alert',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View on Map',
          icon: '/action-view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/action-dismiss.png'
        }
      ],
      data: {
        url: data.url || '/',
        lat: data.lat,
        lng: data.lng
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Fire Alert - Eye on the Fire',
        options
      )
    );
  } catch (error) {
    console.error('ServiceWorker: Push notification error:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const { action, data } = event;
  let url = data?.url || '/';
  
  if (action === 'view' && data?.lat && data?.lng) {
    url = `/?lat=${data.lat}&lng=${data.lng}&zoom=12`;
  }
  
  if (action !== 'dismiss') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          // Focus existing window if open
          for (const client of clientList) {
            if (client.url.includes(self.location.origin)) {
              client.navigate(url);
              return client.focus();
            }
          }
          
          // Open new window
          return clients.openWindow(url);
        })
    );
  }
});

// Message handler for communication with main app
self.addEventListener('message', event => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'PREFETCH_TILES':
      prefetchTiles(data.bounds, data.zoomLevel);
      break;
  }
});

// Cache management functions
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const cacheName of cacheNames) {
    if (cacheName.startsWith('eyeonthefire-')) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      status[cacheName] = {
        size: keys.length,
        lastUpdate: cacheName.includes(CACHE_VERSION) ? 'current' : 'outdated'
      };
    }
  }
  
  return status;
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  
  return Promise.all(
    cacheNames
      .filter(name => name.startsWith('eyeonthefire-'))
      .map(name => caches.delete(name))
  );
}

// Tile prefetching for better performance
async function prefetchTiles(bounds, zoomLevel) {
  if (!bounds || !zoomLevel) return;
  
  const cache = await caches.open(TILES_CACHE);
  const tileUrls = generateTileUrls(bounds, zoomLevel);
  
  // Limit concurrent requests
  const batchSize = 5;
  for (let i = 0; i < tileUrls.length; i += batchSize) {
    const batch = tileUrls.slice(i, i + batchSize);
    
    await Promise.allSettled(
      batch.map(async url => {
        try {
          const cached = await cache.match(url);
          if (!cached) {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
            }
          }
        } catch (error) {
          console.warn('Tile prefetch failed:', url, error);
        }
      })
    );
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

function generateTileUrls(bounds, zoomLevel) {
  // Simple tile URL generation - can be enhanced
  const urls = [];
  const { north, south, east, west } = bounds;
  
  // Convert lat/lng bounds to tile coordinates
  const northTile = Math.floor((1 - Math.log(Math.tan(north * Math.PI / 180) + 1 / Math.cos(north * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoomLevel));
  const southTile = Math.floor((1 - Math.log(Math.tan(south * Math.PI / 180) + 1 / Math.cos(south * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoomLevel));
  const westTile = Math.floor((west + 180) / 360 * Math.pow(2, zoomLevel));
  const eastTile = Math.floor((east + 180) / 360 * Math.pow(2, zoomLevel));
  
  for (let x = westTile; x <= eastTile; x++) {
    for (let y = northTile; y <= southTile; y++) {
      const subdomains = ['a', 'b', 'c'];
      const subdomain = subdomains[(x + y) % 3];
      urls.push(`https://${subdomain}.tile.openstreetmap.org/${zoomLevel}/${x}/${y}.png`);
    }
  }
  
  return urls.slice(0, 50); // Limit to prevent excessive requests
}

console.log('ServiceWorker: Script loaded v' + CACHE_VERSION);
