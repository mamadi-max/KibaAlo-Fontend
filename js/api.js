// js/api.js — KibaAlo — Client API
// ================================================================
// ⚠️  IMPORTANT: Mettez ici l'URL EXACTE de votre backend Render
// Allez sur render.com → votre service → copiez l'URL affichée
// ================================================================
const API_URL    = 'https://kibaalo-backend.onrender.com/api';
const SOCKET_URL = 'https://kibaalo-backend.onrender.com';

// ── Auth JWT ──────────────────────────────────────────────
const Auth = {
  getToken:   ()  => localStorage.getItem('kba_token'),
  setToken:   (t) => localStorage.setItem('kba_token', t),
  getUser:    ()  => { try { return JSON.parse(localStorage.getItem('kba_user')||'null'); } catch { return null; } },
  setUser:    (u) => localStorage.setItem('kba_user', JSON.stringify(u)),
  isLoggedIn: ()  => !!localStorage.getItem('kba_token'),
  isPremium:  ()  => { const u = Auth.getUser(); return !!(u?.premiumUntil && new Date(u.premiumUntil) > new Date()); },
  logout:     ()  => {
    ['kba_token','kba_user','kba_shop_id','kba_cart'].forEach(k => localStorage.removeItem(k));
  },
};

// ── HTTP Core ─────────────────────────────────────────────
async function http(method, path, body, auth = true) {
  const headers = {};
  if (!(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (auth) { const t = Auth.getToken(); if (t) headers['Authorization'] = 'Bearer ' + t; }

  let res;
  try {
    res = await fetch(API_URL + path, {
      method, headers,
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  } catch (networkErr) {
    // Erreur réseau - donner un message utile
    const msg = API_URL.includes('kibaalo-backend.onrender.com')
      ? 'Backend non configuré. Mettez à jour API_URL dans js/api.js avec votre URL Render.'
      : 'Serveur inaccessible. Vérifiez votre connexion internet et que le backend est en ligne.';
    throw new Error(msg);
  }

  let data = {};
  try { data = await res.json(); } catch { /**/ }

  if (res.status === 401) {
    Auth.logout();
    window.dispatchEvent(new CustomEvent('kba:session-expired'));
    throw new Error('Session expirée. Reconnectez-vous.');
  }
  if (!res.ok) {
    if (Array.isArray(data.errors)) throw new Error(data.errors.map(e => e.msg).join(', '));
    throw new Error(data.message || 'Erreur ' + res.status);
  }
  return data;
}

const apiGet   = (p, a)     => http('GET',   p, null, a);
const apiPost  = (p, b, a)  => http('POST',  p, b, a);
const apiPut   = (p, b)     => http('PUT',   p, b);
const apiPatch = (p, b)     => http('PATCH', p, b);
const apiDel   = (p)        => http('DELETE',p, null);

// ── API Modules ───────────────────────────────────────────
const API = {
  auth: {
    register:           (d)     => apiPost('/auth/register', d, false),
    login:              (d)     => apiPost('/auth/login', d, false),
    me:                 ()      => apiGet('/auth/me'),
    updateProfile:      (d)     => apiPut('/auth/profile', d),
    changePassword:     (d)     => apiPut('/auth/password', d),
    uploadAvatar:       (file)  => {
      const fd = new FormData(); fd.append('avatar', file);
      return http('POST', '/auth/avatar', fd);
    },
  },
  shops: {
    list:          (p={})      => apiGet('/shops?' + new URLSearchParams(p), false),
    get:           (id)        => apiGet('/shops/' + id, false),
    create:        (d)         => apiPost('/shops', d),
    update:        (id, d)     => apiPut('/shops/' + id, d),
    dashboard:     ()          => apiGet('/shops/my/dashboard'),
    products:      (id, p={})  => apiGet('/shops/' + id + '/products?' + new URLSearchParams(p), false),
    addProduct:    (sid, d)    => apiPost('/shops/' + sid + '/products', d),
    updateProduct: (sid,pid,d) => apiPut('/shops/' + sid + '/products/' + pid, d),
    deleteProduct: (sid, pid)  => apiDel('/shops/' + sid + '/products/' + pid),
    validatePromo: (d)         => apiPost('/shops/validate-promo', d),
  },
  orders: {
    create:       (d)          => apiPost('/orders', d),
    list:         (p={})       => apiGet('/orders?' + new URLSearchParams(p)),
    get:          (id)         => apiGet('/orders/' + id),
    updateStatus: (id, status) => apiPatch('/orders/' + id + '/status', { status }),
    cancel:       (id, reason) => apiPatch('/orders/' + id + '/status', { status:'cancelled', cancelReason:reason }),
    getInvoice:   (id)         => API_URL + '/orders/' + id + '/invoice',
    sendLocation: (id,lat,lng) => apiPost('/orders/' + id + '/tracking', { latitude:lat, longitude:lng }),
    review:       (id, d)      => apiPost('/orders/' + id + '/review', d),
  },
  wallet: {
    get:      ()  => apiGet('/wallet'),
    recharge: (d) => apiPost('/wallet/recharge', d),
    withdraw: (d) => apiPost('/wallet/withdraw', d),
  },
  parcels: {
    estimate: (d)    => apiPost('/parcels/estimate', d, false),
    create:   (d)    => apiPost('/parcels', d),
    track:    (code) => apiGet('/parcels/track/' + code, false),
    myList:   ()     => apiGet('/parcels'),
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
    plans:     ()     => apiGet('/premium/plans', false),
    subscribe: (plan) => apiPost('/premium/subscribe', { plan }),
  },
};

// ── Socket.IO ─────────────────────────────────────────────
let _socket = null;
const SocketMgr = {
  connect(userId, role) {
    if (!window.io) return null;
    if (_socket?.connected) return _socket;
    _socket = window.io(SOCKET_URL, { transports:['websocket','polling'], reconnectionAttempts:3 });
    _socket.on('connect', () => { if (userId) _socket.emit('auth', { userId, role }); });
    _socket.on('location_update', d => window.dispatchEvent(new CustomEvent('kba:location', { detail:d })));
    _socket.on('status_update',   d => window.dispatchEvent(new CustomEvent('kba:order-status', { detail:d })));
    return _socket;
  },
  sendLocation(orderId, lat, lng) { _socket?.emit('livreur_location', { orderId, lat, lng }); },
  disconnect() { _socket?.disconnect(); _socket = null; },
};

// ── Formatters ────────────────────────────────────────────
const Fmt = {
  money:      (n) => (+(n)||0).toLocaleString('fr-FR') + ' F CFA',
  moneyShort: (n) => (+(n)||0).toLocaleString('fr-FR') + ' F',
  date:       (d) => d ? new Date(d).toLocaleDateString('fr-FR',{ day:'2-digit', month:'short', year:'numeric' }) : '—',
  relative:   (d) => {
    if (!d) return '—';
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 1)  return 'À l\'instant';
    if (m < 60) return `Il y a ${m} min`;
    const h = Math.floor(m/60);
    if (h < 24) return `Il y a ${h}h`;
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
  roleLabel: r => ({ client:'Client', livreur:'Livreur', commercant:'Commerçant' }[r] || r),
  roleEmoji: r => ({ client:'👤', livreur:'🛵', commercant:'🏪' }[r] || '👤'),
  initials:  u => u ? ((u.firstName||'')[0]+(u.lastName||'')[0]).toUpperCase() || '?' : '?',
};

// ── Offline Cache 1h ──────────────────────────────────────
const OfflineCache = {
  set(key, data) {
    try { localStorage.setItem('kba_cache_'+key, JSON.stringify({ data, exp: Date.now()+3600000 })); } catch {}
  },
  get(key) {
    try {
      const item = JSON.parse(localStorage.getItem('kba_cache_'+key)||'null');
      if (!item || Date.now() > item.exp) return null;
      return item.data;
    } catch { return null; }
  },
};

// ── Villes ────────────────────────────────────────────────
const COUNTRIES = {
  BF:{name:'Burkina Faso',flag:'🇧🇫'}, NE:{name:'Niger',flag:'🇳🇪'},
  ML:{name:'Mali',flag:'🇲🇱'},         SN:{name:'Sénégal',flag:'🇸🇳'},
  CI:{name:"Côte d'Ivoire",flag:'🇨🇮'},GH:{name:'Ghana',flag:'🇬🇭'},
  NG:{name:'Nigeria',flag:'🇳🇬'},       GN:{name:'Guinée',flag:'🇬🇳'},
  CM:{name:'Cameroun',flag:'🇨🇲'},      TG:{name:'Togo',flag:'🇹🇬'},
  BJ:{name:'Bénin',flag:'🇧🇯'},         MR:{name:'Mauritanie',flag:'🇲🇷'},
  GM:{name:'Gambie',flag:'🇬🇲'},        SL:{name:'Sierra Leone',flag:'🇸🇱'},
  LR:{name:'Libéria',flag:'🇱🇷'},       GW:{name:'Guinée-Bissau',flag:'🇬🇼'},
};
const CITIES = {
  BF:['Ouagadougou','Bobo-Dioulasso','Koudougou','Ouahigouya','Banfora','Dédougou','Kaya','Tenkodogo',"Fada N'Gourma",'Ziniaré','Dori','Nouna','Tougan','Gaoua','Manga','Djibo','Houndé','Kombissiri','Yako'],
  NE:['Niamey','Zinder','Maradi','Agadez','Tahoua','Dosso','Diffa','Arlit',"Birni-N'Konni",'Madaoua','Tessaoua',"N'Guigmi",'Gaya','Tillabéri'],
  ML:['Bamako','Sikasso','Ségou','Mopti','Kayes','Gao','Koutiala'],
  SN:['Dakar','Thiès','Kaolack','Ziguinchor','Saint-Louis','Touba','Diourbel'],
  CI:['Abidjan','Bouaké','Korhogo','Yamoussoukro','San-Pédro','Man','Daloa','Gagnoa'],
  GH:['Accra','Kumasi','Tamale','Takoradi','Tema'],
  NG:['Lagos','Abuja','Kano','Ibadan','Port Harcourt'],
  GN:['Conakry','Kankan','Labé','Kindia','Nzérékoré'],
  CM:['Yaoundé','Douala','Bamenda','Garoua','Maroua'],
  TG:['Lomé','Sokodé','Kara','Atakpamé'],
  BJ:['Cotonou','Porto-Novo','Parakou','Abomey'],
  MR:['Nouakchott','Nouadhibou','Kiffa'],
  GM:['Banjul','Serekunda','Brikama'],
  SL:['Freetown','Bo','Kenema'],
  LR:['Monrovia','Gbarnga','Buchanan'],
  GW:['Bissau','Bafatá','Gabú'],
};
