// Skify PWA Service Worker
const CACHE_NAME = 'skify-v1.0.0';
const STATIC_CACHE = 'skify-static-v1.0.0';
const DYNAMIC_CACHE = 'skify-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/mobile',
  '/manifest.json',
  // Add core assets that should be cached
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Take control immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // API requests - network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache for offline
          return caches.match(request);
        })
    );
    return;
  }
  
  // Static assets and pages - cache first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(request).then((response) => {
        // Don't cache if not a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });
        
        return response;
      });
    })
  );
});

// Background sync for offline video processing
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'video-upload') {
    event.waitUntil(syncVideoUploads());
  }
  
  if (event.tag === 'template-save') {
    event.waitUntil(syncTemplateSaves());
  }
});

// Push notifications for processing completion
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'Your video transformation is complete!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: '/',
      action: 'open-app'
    },
    actions: [
      {
        action: 'view',
        title: 'View Video'
      },
      {
        action: 'share',
        title: 'Share'
      }
    ]
  };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      options.body = payload.message || options.body;
      options.data = { ...options.data, ...payload.data };
    } catch (e) {
      console.log('[SW] Push payload parsing failed:', e);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('Skify', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  const action = event.action || 'open-app';
  const data = event.notification.data || {};
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clients) => {
      // Check if app is already open
      for (const client of clients) {
        if (client.url.includes(location.origin)) {
          return client.focus();
        }
      }
      
      // Open new window
      const url = action === 'view' ? (data.url || '/') : '/';
      return clients.openWindow(url);
    })
  );
});

// Helper functions
async function syncVideoUploads() {
  try {
    const uploads = await getStoredUploads();
    
    for (const upload of uploads) {
      try {
        const response = await fetch('/api/viral/extract-style', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(upload)
        });
        
        if (response.ok) {
          await removeStoredUpload(upload.id);
        }
      } catch (error) {
        console.log('[SW] Upload sync failed:', error);
      }
    }
  } catch (error) {
    console.log('[SW] Video upload sync failed:', error);
  }
}

async function syncTemplateSaves() {
  try {
    const templates = await getStoredTemplates();
    
    for (const template of templates) {
      try {
        const response = await fetch('/api/templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(template)
        });
        
        if (response.ok) {
          await removeStoredTemplate(template.id);
        }
      } catch (error) {
        console.log('[SW] Template sync failed:', error);
      }
    }
  } catch (error) {
    console.log('[SW] Template save sync failed:', error);
  }
}

// IndexedDB helpers for offline storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SkifyOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('uploads')) {
        db.createObjectStore('uploads', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('templates')) {
        db.createObjectStore('templates', { keyPath: 'id' });
      }
    };
  });
}

async function getStoredUploads() {
  const db = await openDB();
  const transaction = db.transaction(['uploads'], 'readonly');
  const store = transaction.objectStore('uploads');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getStoredTemplates() {
  const db = await openDB();
  const transaction = db.transaction(['templates'], 'readonly');
  const store = transaction.objectStore('templates');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function removeStoredUpload(id) {
  const db = await openDB();
  const transaction = db.transaction(['uploads'], 'readwrite');
  const store = transaction.objectStore('uploads');
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function removeStoredTemplate(id) {
  const db = await openDB();
  const transaction = db.transaction(['templates'], 'readwrite');
  const store = transaction.objectStore('templates');
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}