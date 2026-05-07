// ═══════════════════════════════════════════════════════════
// js/api.js — Client API KibaAlo — Connexion backend réelle
// ═══════════════════════════════════════════════════════════

// ── CONFIG ────────────────────────────────────────────────
// ⚠️  Remplacez par l'URL de votre backend Render après déploiement
const API_URL    = 'https://kibaalo-backend.onrender.com/api';
const SOCKET_URL = 'https://kibaalo-backend.onrender.com';
// Développement local : décommentez :
// const API_URL    = 'http://localhost:5000/api';
// const SOCKET_URL = 'http://localhost:5000';

// ── Auth JWT ──────────────────────────────────────────────
const Auth = {
  getToken:   ()  => localStorage.getItem('kba_token'),
  setToken:   (t) => localStorage.setItem('kba_token', t),
  getUser:    ()  => { try { return JSON.parse(localStorage.getItem('kba_user') || 'null'); } catch { return null; } },
  setUser:    (u) => localStorage.setItem('kba_user', JSON.stringify(u)),
  isLoggedIn: ()  => !!localStorage.getItem('kba_token'),
  isPremium:  ()  => { const u = Auth.getUser(); return !!(u?.premiumUntil && new Date(u.premiumUntil) > new Date()); },
  logout:     ()  => { localStorage.removeItem('kba_token'); localStorage.removeItem('kba_user'); },
};

// ── HTTP Core ─────────────────────────────────────────────
async function http(method, path, body, requiresAuth) {
  const headers = { 'Content-Type': 'application/json' };
  if (requiresAuth !== false) {
    const token = Auth.getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
  }
  let res;
  try {
    res = await fetch(API_URL + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Serveur inaccessible. Vérifiez votre connexion.');
  }
  let data = {};
  try { data = await res.json(); } catch { /**/ }
  if (res.status === 401) {
    Auth.logout();
    window.dispatchEvent(new CustomEvent('kba:session-expired'));
    throw new Error('Session expirée.');
  }
  if (!res.ok) {
    if (Array.isArray(data.errors)) throw new Error(data.errors.map(e => e.msg).join(', '));
    throw new Error(data.message || 'Erreur ' + res.status);
  }
  return data;
}

const apiGet    = (path, auth)      => http('GET',    path, null, auth);
const apiPost   = (path, body, auth)=> http('POST',   path, body, auth);
const apiPut    = (path, body)      => http('PUT',    path, body);
const apiPatch  = (path, body)      => http('PATCH',  path, body);
const apiDel    = (path)            => http('DELETE', path, null);

// ── API Modules ───────────────────────────────────────────
const API = {
  auth: {
    register:       (d)     => apiPost('/auth/register', d, false),
    login:          (d)     => apiPost('/auth/login',    d, false),
    me:             ()      => apiGet('/auth/me'),
    updateProfile:  (d)     => apiPut('/auth/profile', d),
    changePassword: (d)     => apiPut('/auth/password', d),
  },
  shops: {
    list:          (p={})   => apiGet('/shops?' + new URLSearchParams(p), false),
    get:           (id)     => apiGet('/shops/' + id, false),
    create:        (d)      => apiPost('/shops', d),
    update:        (id,d)   => apiPut('/shops/' + id, d),
    dashboard:     ()       => apiGet('/shops/my/dashboard'),
    products:      (id)     => apiGet('/shops/' + id + '/products', false),
    addProduct:    (sid,d)  => apiPost('/shops/' + sid + '/products', d),
    updateProduct: (sid,pid,d) => apiPut('/shops/' + sid + '/products/' + pid, d),
    deleteProduct: (sid,pid)   => apiDel('/shops/' + sid + '/products/' + pid),
  },
  orders: {
    create:       (d)          => apiPost('/orders', d),
    list:         (p={})       => apiGet('/orders?' + new URLSearchParams(p)),
    get:          (id)         => apiGet('/orders/' + id),
    updateStatus: (id,status)  => apiPatch('/orders/' + id + '/status', { status }),
    cancel:       (id,reason)  => apiPatch('/orders/' + id + '/status', { status:'cancelled', cancelReason:reason }),
    sendLocation: (id,lat,lng) => apiPost('/orders/' + id + '/tracking', { latitude:lat, longitude:lng }),
    review:       (id,d)       => apiPost('/orders/' + id + '/review', d),
  },
  wallet: {
    get:      ()  => apiGet('/wallet'),
    recharge: (d) => apiPost('/wallet/recharge', d),
    withdraw: (d) => apiPost('/wallet/withdraw', d),
  },
  parcels: {
    cities:    ()    => apiGet('/parcels/cities', false),
    estimate:  (d)   => apiPost('/parcels/estimate', d, false),
    create:    (d)   => apiPost('/parcels', d),
    track:     (code)=> apiGet('/parcels/track/' + code, false),
    myList:    ()    => apiGet('/parcels'),
  },
  livreurs: {
    setAvailability: (v,lat,lng) => apiPut('/livreurs/availability', { isAvailable:v, latitude:lat, longitude:lng }),
    sendLocation:    (lat,lng)   => apiPut('/livreurs/location', { latitude:lat, longitude:lng }),
    earnings:        ()          => apiGet('/livreurs/earnings'),
  },
  notifications: {
    list:    ()   => apiGet('/notifications'),
    readAll: ()   => apiPatch('/notifications/read-all', {}),
    read:    (id) => apiPatch('/notifications/' + id + '/read', {}),
  },
  premium: {
    plans:     () => apiGet('/premium/plans', false),
    subscribe: (plan) => apiPost('/premium/subscribe', { plan }),
  },
};

// ── Socket.IO ─────────────────────────────────────────────
let _socket = null;
const SocketMgr = {
  connect(orderId) {
    if (!window.io) return null;
    if (_socket && _socket.connected) { if (orderId) _socket.emit('join_order', orderId); return _socket; }
    _socket = window.io(SOCKET_URL, { transports:['websocket','polling'], reconnectionAttempts:5 });
    _socket.on('connect',         () => { if (orderId) _socket.emit('join_order', orderId); });
    _socket.on('location_update', d  => window.dispatchEvent(new CustomEvent('kba:livreur-location', { detail:d })));
    _socket.on('status_update',   d  => window.dispatchEvent(new CustomEvent('kba:order-status',    { detail:d })));
    return _socket;
  },
  sendLocation(orderId, lat, lng) { _socket && _socket.emit('livreur_location', { orderId, lat, lng }); },
  disconnect() { _socket && _socket.disconnect(); _socket = null; },
};

// ── Formatters ────────────────────────────────────────────
const Fmt = {
  money:      (n) => (+(n)||0).toLocaleString('fr-FR') + ' F CFA',
  moneyShort: (n) => (+(n)||0).toLocaleString('fr-FR') + ' F',
  date:       (d) => d ? new Date(d).toLocaleDateString('fr-FR',{ day:'2-digit', month:'short', year:'numeric' }) : '—',
  time:       (d) => d ? new Date(d).toLocaleString('fr-FR',{ day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—',
  relative:   (d) => {
    if (!d) return '—';
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 1)  return 'À l\'instant';
    if (m < 60) return 'Il y a ' + m + ' min';
    const h = Math.floor(m/60);
    if (h < 24) return 'Il y a ' + h + 'h';
    return Fmt.date(d);
  },
  statusLabel: s => ({
    pending:'⏳ En attente', confirmed:'✅ Confirmé', preparing:'👨‍🍳 Préparation',
    ready:'📦 Prêt', picked_up:'🛵 Récupéré', in_route:'🛵 En route',
    delivered:'🎉 Livré', cancelled:'❌ Annulé', refunded:'↩️ Remboursé',
  }[s] || s || '—'),
  statusClass: s => ({
    pending:'badge-amber', confirmed:'badge-orange', preparing:'badge-orange',
    ready:'badge-orange', picked_up:'badge-orange', in_route:'badge-orange',
    delivered:'badge-green', cancelled:'badge-red', refunded:'badge-surface',
  }[s] || 'badge-surface'),
  roleLabel: r => ({client:'Client', livreur:'Livreur', commercant:'Commerçant'}[r] || r),
  roleEmoji: r => ({client:'👤', livreur:'🛵', commercant:'🏪'}[r] || '👤'),
  initials:  u => u ? ((u.firstName||'')[0]+(u.lastName||'')[0]).toUpperCase() || '?' : '?',
};

// ── Données villes ────────────────────────────────────────
const CITIES = {
  BF: ['Ouagadougou','Bobo-Dioulasso','Koudougou','Ouahigouya','Banfora','Dédougou','Kaya','Tenkodogo',
       "Fada N'Gourma",'Ziniaré','Manga','Réo','Kongoussi','Dori','Nouna','Tougan','Gaoua','Diébougou',
       'Pô','Léo','Boulsa','Zorgho','Yako','Titao','Bogandé','Djibo','Gorom-Gorom','Kombissiri','Sapouy','Houndé'],
  NE: ['Niamey','Zinder','Maradi','Agadez','Tahoua','Dosso','Diffa','Arlit',"Birni-N'Konni",'Madaoua',
       'Tessaoua','Mirriah','Matamey','Maine-Soroa','Gouré',"N'Guigmi",'Dakoro','Filingué','Illéla','Bouza',
       'Keïta','Loga','Gaya','Dogondoutchi','Téra','Tillabéri','Say','Ouallam','Tillabéry','Tera'],
};
