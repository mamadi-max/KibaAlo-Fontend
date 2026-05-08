// sw.js — Service Worker KibaAlo PWA
// Version optimisée pour PWABuilder score maximum

const CACHE_NAME = 'kibaalo-v2.0.0';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/css/style.css',
  '/js/api.js',
  '/js/app.js',
  '/js/views.js',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
];

// ── Installation ─────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
    }).catch(() => {
      // Si certains assets manquent, continuer quand même
      return caches.open(CACHE_NAME);
    })
  );
  self.skipWaiting();
});

// ── Activation ───────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch Strategy ───────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;

  // API backend → Network only, pas de cache
  if (url.hostname.includes('onrender.com') || url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({ success: false, message: 'Hors ligne. Vérifiez votre connexion.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // Socket.IO → Network only
  if (url.pathname.startsWith('/socket.io/')) {
    event.respondWith(fetch(request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // Fonts Google → Cache first
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_NAME + '-fonts').then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(res => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          }).catch(() => new Response('', { status: 503 }));
        })
      )
    );
    return;
  }

  // Navigation requests → Network first, fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/index.html').then(cached => cached || caches.match(OFFLINE_URL))
      )
    );
    return;
  }

  // Tous les autres assets → Cache first, network fallback
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        if (res.ok && res.type !== 'opaque') {
          caches.open(CACHE_NAME).then(cache => cache.put(request, res.clone()));
        }
        return res;
      }).catch(() => {
        // Fallback vers index.html pour les pages
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
        return new Response('', { status: 503 });
      });
    })
  );
});

// ── Background Sync ──────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  // Synchroniser les commandes en attente quand la connexion revient
  const db = await caches.open(CACHE_NAME + '-pending');
  const keys = await db.keys();
  for (const key of keys) {
    try {
      const request = await db.match(key);
      if (request) await fetch(request);
      await db.delete(key);
    } catch { /* réessayer plus tard */ }
  }
}

// ── Push Notifications ───────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch { data = { title: 'KibaAlo', body: event.data.text() }; }

  const options = {
    body:    data.body    || 'Vous avez une nouvelle notification',
    icon:    data.icon    || '/assets/icon-192.png',
    badge:   data.badge   || '/assets/icon-192.png',
    image:   data.image   || undefined,
    data:    data.data    || {},
    tag:     data.tag     || 'kibaalo-notif',
    renotify: true,
    requireInteraction: false,
    actions: [
      { action: 'view',    title: 'Voir',   icon: '/assets/icon-96.png' },
      { action: 'dismiss', title: 'Fermer' },
    ],
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'KibaAlo 🛵', options)
  );
});

// ── Notification Click ───────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  let targetUrl = '/';
  if (event.notification.data?.orderId) targetUrl = '/?tab=orders';
  if (event.notification.data?.url)     targetUrl = event.notification.data.url;

  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});

// ── Periodic Background Sync ─────────────────────────────
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-notifications') {
    event.waitUntil(checkForNotifications());
  }
});

async function checkForNotifications() {
  try {
    // Vérifier les nouvelles notifications en arrière-plan
    const response = await fetch('/api/notifications?unread=true');
    if (response.ok) {
      const data = await response.json();
      if (data.unreadCount > 0) {
        await self.registration.showNotification('KibaAlo 🛵', {
          body: `Vous avez ${data.unreadCount} nouvelle(s) notification(s)`,
          icon: '/assets/icon-192.png',
          badge: '/assets/icon-192.png',
        });
      }
    }
  } catch { /* silencieux en cas d'échec */ }
}
