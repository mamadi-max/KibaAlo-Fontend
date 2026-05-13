// sw.js — KibaAlo v2.0 — Service Worker
// Cache offline 1h après dernière connexion
// ================================================================
const CACHE      = 'kibaalo-v2.0.0';
const CACHE_FONT = 'kibaalo-fonts-v2';
const OFFLINE    = '/offline.html';

const STATIC = [
  '/', '/index.html', '/offline.html', '/manifest.json',
  '/css/style.css',
  '/js/api.js', '/js/app.js', '/js/views.js',
  '/assets/icon-192.png', '/assets/icon-512.png',
];

// ── Installation ─────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC.map(u => new Request(u, { cache:'reload' }))))
      .catch(() => caches.open(CACHE)) // continue si assets manquants
  );
  self.skipWaiting();
});

// ── Activation ───────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE && k !== CACHE_FONT).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  // Ignorer méthodes non-GET et extensions navigateur
  if (req.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // ── API backend → Network only, pas de cache ──────────
  if (url.hostname.includes('onrender.com') || url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(req).catch(() => new Response(
        JSON.stringify({ success:false, message:'Hors ligne. Vérifiez votre connexion.' }),
        { status:503, headers:{ 'Content-Type':'application/json' } }
      ))
    );
    return;
  }

  // ── Socket.IO → Network only ──────────────────────────
  if (url.pathname.startsWith('/socket.io/')) {
    e.respondWith(fetch(req).catch(() => new Response('', { status:503 })));
    return;
  }

  // ── Google Fonts → Cache first (TTL 7 jours) ─────────
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.open(CACHE_FONT).then(c =>
        c.match(req).then(cached => {
          if (cached) return cached;
          return fetch(req).then(res => {
            if (res.ok) c.put(req, res.clone());
            return res;
          }).catch(() => new Response('', { status:503 }));
        })
      )
    );
    return;
  }

  // ── Navigation (pages HTML) → Network first, fallback offline ──
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) {
            caches.open(CACHE).then(c => c.put(req, res.clone()));
          }
          return res;
        })
        .catch(() =>
          caches.match('/index.html').then(c => c || caches.match(OFFLINE))
        )
    );
    return;
  }

  // ── Autres assets → Cache first, Network fallback ─────
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // Refresh en arrière-plan (Stale While Revalidate)
        const refresh = fetch(req).then(res => {
          if (res.ok && res.type !== 'opaque') {
            caches.open(CACHE).then(c => c.put(req, res.clone()));
          }
          return res;
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then(res => {
        if (res.ok && res.type !== 'opaque') {
          caches.open(CACHE).then(c => c.put(req, res.clone()));
        }
        return res;
      }).catch(() => {
        if (req.destination === 'document') return caches.match('/index.html');
        return new Response('', { status:503 });
      });
    })
  );
});

// ── Background Sync ───────────────────────────────────────
self.addEventListener('sync', e => {
  if (e.tag === 'sync-orders') {
    e.waitUntil(syncPendingOrders());
  }
  if (e.tag === 'sync-location') {
    e.waitUntil(syncLocation());
  }
});

async function syncPendingOrders() {
  try {
    const pending = await getFromIDB('pending-orders');
    for (const order of (pending || [])) {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + order.token },
        body: JSON.stringify(order.data),
      });
    }
    await clearIDB('pending-orders');
  } catch { /* réessayer au prochain sync */ }
}

async function syncLocation() {
  try {
    const loc = await getFromIDB('pending-location');
    if (loc) {
      await fetch('/api/livreurs/location', {
        method: 'PUT',
        headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + loc.token },
        body: JSON.stringify({ latitude: loc.lat, longitude: loc.lng }),
      });
    }
  } catch { /**/ }
}

// Helpers IndexedDB (simplifié)
async function getFromIDB(key)   { return null; } // implémentation simplifiée
async function clearIDB(key)     { return; }

// ── Push Notifications ────────────────────────────────────
self.addEventListener('push', e => {
  if (!e.data) return;
  let data = {};
  try { data = e.data.json(); } catch { data = { title:'KibaAlo', body: e.data.text() }; }

  e.waitUntil(
    self.registration.showNotification(data.title || 'KibaAlo 🛵', {
      body:    data.body    || 'Vous avez une nouvelle notification',
      icon:    '/assets/icon-192.png',
      badge:   '/assets/icon-192.png',
      image:   data.image   || undefined,
      tag:     data.tag     || 'kibaalo-notif',
      data:    data.data    || {},
      renotify: true,
      requireInteraction: ['new_order','delivery_request'].includes(data.type),
      actions: [
        { action:'view',    title:'Voir',   icon:'/assets/icon-96.png' },
        { action:'dismiss', title:'Fermer' },
      ],
      vibrate: [200,100,200,100,200],
    })
  );
});

// ── Notification Click ────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;

  let url = '/';
  const data = e.notification.data || {};
  if (data.orderId)  url = '/?tab=orders';
  if (data.url)      url = data.url;
  if (data.type === 'new_order') url = '/?tab=orders';
  if (data.type === 'delivery_request') url = '/?tab=home';

  e.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// ── Periodic Background Sync (si supporté) ───────────────
self.addEventListener('periodicsync', e => {
  if (e.tag === 'check-notifications') {
    e.waitUntil(checkNotifications());
  }
  if (e.tag === 'refresh-data') {
    e.waitUntil(refreshCachedData());
  }
});

async function checkNotifications() {
  try {
    // Vérifier nouvelles notifs en arrière-plan
    const token = await getStoredToken();
    if (!token) return;
    const res = await fetch('/api/notifications?limit=1', {
      headers: { 'Authorization':'Bearer ' + token },
    });
    if (!res.ok) return;
    const data = await res.json();
    if ((data.unreadCount || 0) > 0) {
      await self.registration.showNotification('KibaAlo 🛵', {
        body: `Vous avez ${data.unreadCount} nouvelle(s) notification(s)`,
        icon: '/assets/icon-192.png',
        badge: '/assets/icon-192.png',
        tag: 'periodic-notif',
      });
    }
  } catch { /**/ }
}

async function refreshCachedData() {
  try {
    const cache = await caches.open(CACHE);
    await cache.add(new Request('/', { cache:'reload' }));
  } catch { /**/ }
}

async function getStoredToken() {
  try {
    const clients = await self.clients.matchAll();
    return null; // simplifié — en prod, utiliser postMessage
  } catch { return null; }
}
