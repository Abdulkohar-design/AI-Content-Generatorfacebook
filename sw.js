// Service Worker for AI Content Generator PWA

const CACHE_NAME = 'ai-content-generator-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/features.js',
    '/export.js',
    '/advanced-features.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Cache installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                
                return fetch(event.request).then((response) => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
            .catch(() => {
                // Return offline page for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Push notification handling
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New content generated!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Content',
                icon: '/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-192x192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('AI Content Generator', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Background sync function
async function doBackgroundSync() {
    try {
        // Check for pending scheduled posts
        const scheduledPosts = await getScheduledPosts();
        const now = new Date();
        
        for (const post of scheduledPosts) {
            const scheduledTime = new Date(post.scheduledAt);
            if (scheduledTime <= now && post.status === 'scheduled') {
                await executeScheduledPost(post);
            }
        }
        
        console.log('Background sync completed');
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Get scheduled posts from IndexedDB
async function getScheduledPosts() {
    return new Promise((resolve) => {
        const request = indexedDB.open('aiContentDB', 1);
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['scheduledPosts'], 'readonly');
            const store = transaction.objectStore('scheduledPosts');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => {
                resolve(getAllRequest.result);
            };
        };
        
        request.onerror = () => {
            resolve([]);
        };
    });
}

// Execute scheduled post
async function executeScheduledPost(post) {
    try {
        // Update post status
        post.status = 'executed';
        post.executedAt = new Date().toISOString();
        
        // Store in IndexedDB
        await updateScheduledPost(post);
        
        // Show notification
        self.registration.showNotification('Post Executed', {
            body: `Scheduled post "${post.title}" has been executed`,
            icon: '/icon-192x192.png'
        });
        
    } catch (error) {
        console.error('Failed to execute scheduled post:', error);
    }
}

// Update scheduled post in IndexedDB
async function updateScheduledPost(post) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('aiContentDB', 1);
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['scheduledPosts'], 'readwrite');
            const store = transaction.objectStore('scheduledPosts');
            const updateRequest = store.put(post);
            
            updateRequest.onsuccess = () => resolve();
            updateRequest.onerror = () => reject(updateRequest.error);
        };
        
        request.onerror = () => reject(request.error);
    });
}

// Initialize IndexedDB
function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('aiContentDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object stores
            if (!db.objectStoreNames.contains('scheduledPosts')) {
                const scheduledPostsStore = db.createObjectStore('scheduledPosts', { keyPath: 'id' });
                scheduledPostsStore.createIndex('status', 'status', { unique: false });
                scheduledPostsStore.createIndex('scheduledAt', 'scheduledAt', { unique: false });
            }
            
            if (!db.objectStoreNames.contains('savedContent')) {
                const savedContentStore = db.createObjectStore('savedContent', { keyPath: 'id' });
                savedContentStore.createIndex('topic', 'topic', { unique: false });
                savedContentStore.createIndex('createdAt', 'createdAt', { unique: false });
            }
            
            if (!db.objectStoreNames.contains('analytics')) {
                const analyticsStore = db.createObjectStore('analytics', { keyPath: 'id' });
                analyticsStore.createIndex('date', 'date', { unique: false });
            }
        };
    });
}

// Initialize when service worker starts
initIndexedDB().then(() => {
    console.log('IndexedDB initialized');
}).catch((error) => {
    console.error('IndexedDB initialization failed:', error);
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled rejection:', event.reason);
}); 