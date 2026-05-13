// js/api.js — KibaAlo v2.0 — Client API Complet
// ================================================================

const API_URL    = 'https://kibaalo-backend.onrender.com/api';
const SOCKET_URL = 'https://kibaalo-backend.onrender.com';
// Dev local: décommentez
// const API_URL    = 'http://localhost:5000/api';
// const SOCKET_URL = 'http://localhost:5000';

// ── Auth JWT ──────────────────────────────────────────────
const Auth = {
  getToken:    ()  => localStorage.getItem('kba_token'),
  setToken:    (t) => localStorage.setItem('kba_token', t),
  getUser:     ()  => { try { return JSON.parse(localStorage.getItem('kba_user')||'null'); } catch { return null; } },
  setUser:     (u) => localStorage.setItem('kba_user', JSON.stringify(u)),
  isLoggedIn:  ()  => !!localStorage.getItem('kba_token'),
  isPremium:   ()  => { const u = Auth.getUser(); return !!(u?.premiumUntil && new Date(u.premiumUntil) > new Date()); },
  isVerified:  ()  => Auth.getUser()?.isEmailVerified === true,
  kycStatus:   ()  => Auth.getUser()?.kycStatus || 'pending',
  logout:      ()  => {
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
  } catch {
    throw new Error('Serveur inaccessible. Vérifiez votre connexion internet.');
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

const apiGet   = (p, a)      => http('GET',    p, null, a);
const apiPost  = (p, b, a)   => http('POST',   p, b, a);
const apiPut   = (p, b)      => http('PUT',    p, b);
const apiPatch = (p, b)      => http('PATCH',  p, b);
const apiDel   = (p)         => http('DELETE', p, null);

// ── API Modules ───────────────────────────────────────────
const API = {

  auth: {
    register:           (d)     => apiPost('/auth/register', d, false),
    login:              (d)     => apiPost('/auth/login', d, false),
    verifyEmail:        (token) => apiGet(`/auth/verify-email?token=${token}`, false),
    resendVerification: (email) => apiPost('/auth/resend-verification', { email }, false),
    forgotPassword:     (email) => apiPost('/auth/forgot-password', { email }, false),
    resetPassword:      (d)     => apiPost('/auth/reset-password', d, false),
    me:                 ()      => apiGet('/auth/me'),
    updateProfile:      (d)     => apiPut('/auth/profile', d),
    changePassword:     (d)     => apiPut('/auth/password', d),
    uploadAvatar:       (file)  => {
      const fd = new FormData(); fd.append('avatar', file);
      return http('POST', '/auth/avatar', fd);
    },
    submitKyc: (data, files) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k,v]) => fd.append(k, v));
      if (files.id_front) fd.append('id_front', files.id_front);
      if (files.id_back)  fd.append('id_back',  files.id_back);
      if (files.selfie)   fd.append('selfie',   files.selfie);
      return http('POST', '/auth/kyc', fd);
    },
    getAddresses:  ()  => apiGet('/auth/addresses'),
    addAddress:    (d) => apiPost('/auth/addresses', d),
  },

  shops: {
    list:           (p={})         => apiGet('/shops?' + new URLSearchParams(p), false),
    categories:     ()             => apiGet('/shops/categories', false),
    get:            (id)           => apiGet('/shops/' + id, false),
    create:         (d)            => apiPost('/shops', d),
    update:         (id, d)        => apiPut('/shops/' + id, d),
    uploadLogo:     (id, file)     => {
      const fd = new FormData(); fd.append('logo', file);
      return http('POST', '/shops/' + id + '/logo', fd);
    },
    dashboard:      ()             => apiGet('/shops/my/dashboard'),
    products:       (id, p={})     => apiGet('/shops/' + id + '/products?' + new URLSearchParams(p), false),
    addProduct:     (sid, d, files=[]) => {
      if (files.length > 0) {
        const fd = new FormData();
        Object.entries(d).forEach(([k,v]) => { if (v !== undefined) fd.append(k, v); });
        files.forEach(f => fd.append('images', f));
        return http('POST', '/shops/' + sid + '/products', fd);
      }
      return apiPost('/shops/' + sid + '/products', d);
    },
    updateProduct:  (sid, pid, d)  => apiPut('/shops/' + sid + '/products/' + pid, d),
    deleteProduct:  (sid, pid)     => apiDel('/shops/' + sid + '/products/' + pid),
    reviews:        (id)           => apiGet('/shops/' + id + '/reviews', false),
    createPromo:    (id, d)        => apiPost('/shops/' + id + '/promo', d),
    validatePromo:  (d)            => apiPost('/shops/validate-promo', d),
  },

  orders: {
    create:         (d)            => apiPost('/orders', d),
    list:           (p={})         => apiGet('/orders?' + new URLSearchParams(p)),
    get:            (id)           => apiGet('/orders/' + id),
    updateStatus:   (id, status)   => apiPatch('/orders/' + id + '/status', { status }),
    cancel:         (id, reason)   => apiPatch('/orders/' + id + '/status', { status:'cancelled', cancelReason: reason }),
    getInvoice:     (id)           => API_URL + '/orders/' + id + '/invoice',
    downloadDigital:(id, pid, pwd) => apiGet(`/orders/${id}/digital/${pid}?password=${encodeURIComponent(pwd)}`),
    sendLocation:   (id, lat, lng) => apiPost('/orders/' + id + '/tracking', { latitude: lat, longitude: lng }),
    review:         (id, d)        => apiPost('/orders/' + id + '/review', d),
  },

  wallet: {
    get:      ()  => apiGet('/wallet'),
    recharge: (d) => apiPost('/wallet/recharge', d),
    withdraw: (d) => apiPost('/wallet/withdraw', d),
  },

  payments: {
    providers: (country) => apiGet('/payments/providers/' + country, false),
    initiate:  (d)       => apiPost('/payments/initiate', d),
    status:    (ref, provider) => apiGet(`/payments/status/${ref}?provider=${provider}`),
    refund:    (d)       => apiPost('/payments/refund', d),
  },

  parcels: {
    countries: ()         => apiGet('/parcels/countries', false),
    cities:    (code)     => apiGet('/parcels/countries/' + code + '/cities', false),
    estimate:  (d)        => apiPost('/parcels/estimate', d, false),
    create:    (d)        => apiPost('/parcels', d),
    track:     (code)     => apiGet('/parcels/track/' + code, false),
    myList:    ()         => apiGet('/parcels'),
  },

  livreurs: {
    setAvailability: (v, lat, lng) => apiPut('/livreurs/availability', { isAvailable:v, latitude:lat, longitude:lng }),
    sendLocation:    (lat, lng)    => apiPut('/livreurs/location', { latitude:lat, longitude:lng }),
    earnings:        ()            => apiGet('/livreurs/earnings'),
    getProfile:      ()            => apiGet('/livreurs/profile'),
    updateProfile:   (d)           => apiPut('/livreurs/profile', d),
    available:       (p={})        => apiGet('/livreurs/available?' + new URLSearchParams(p)),
  },

  notifications: {
    list:    ()   => apiGet('/notifications'),
    readAll: ()   => apiPatch('/notifications/read-all', {}),
    read:    (id) => apiPatch('/notifications/' + id + '/read', {}),
    delete:  (id) => apiDel('/notifications/' + id),
  },

  premium: {
    plans:     ()     => apiGet('/premium/plans', false),
    subscribe: (plan) => apiPost('/premium/subscribe', { plan }),
    cancel:    ()     => apiPost('/premium/cancel', {}),
  },

  search: {
    query:       (q, params={}) => apiGet('/search?' + new URLSearchParams({ q, ...params }), false),
    suggestions: (q, country)   => apiGet('/search/suggestions?' + new URLSearchParams({ q, country }), false),
    popular:     (country)      => apiGet('/search/popular?' + new URLSearchParams({ country }), false),
  },

  admin: {
    stats:       ()             => apiGet('/admin/stats'),
    users:       (p={})         => apiGet('/admin/users?' + new URLSearchParams(p)),
    verifyKyc:   (id, action, reason) => apiPatch('/admin/users/' + id + '/kyc', { action, reason }),
    suspendUser: (id, reason, suspend) => apiPatch('/admin/users/' + id + '/suspend', { reason, suspend }),
    verifyShop:  (id, featured) => apiPatch('/admin/shops/' + id + '/verify', { featured }),
    orders:      (p={})         => apiGet('/admin/orders?' + new URLSearchParams(p)),
  },
};

// ── Socket.IO ─────────────────────────────────────────────
let _socket = null;
const SocketMgr = {
  connect(userId, role) {
    if (!window.io) return null;
    if (_socket?.connected) return _socket;

    _socket = window.io(SOCKET_URL, {
      transports: ['websocket','polling'],
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    _socket.on('connect', () => {
      console.log('🔌 Socket connecté');
      if (userId) _socket.emit('auth', { userId, role });
    });
    _socket.on('location_update', d => window.dispatchEvent(new CustomEvent('kba:location',  { detail:d })));
    _socket.on('status_update',   d => window.dispatchEvent(new CustomEvent('kba:order-status', { detail:d })));
    _socket.on('chat_message',    d => window.dispatchEvent(new CustomEvent('kba:chat',      { detail:d })));
    _socket.on('disconnect', () => console.log('🔌 Socket déconnecté'));
    return _socket;
  },
  joinOrder(orderId)  { _socket?.emit('join_order', orderId); },
  leaveOrder(orderId) { _socket?.emit('leave_order', orderId); },
  sendLocation(orderId, lat, lng) { _socket?.emit('livreur_location', { orderId, lat, lng }); },
  sendChat(orderId, message, senderId) { _socket?.emit('chat_message', { orderId, message, senderId }); },
  disconnect() { _socket?.disconnect(); _socket = null; },
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
    if (m < 60) return `Il y a ${m} min`;
    const h = Math.floor(m/60);
    if (h < 24) return `Il y a ${h}h`;
    const days = Math.floor(h/24);
    if (days < 7) return `Il y a ${days}j`;
    return Fmt.date(d);
  },
  statusLabel: s => ({
    pending:'⏳ En attente', confirmed:'✅ Confirmé', preparing:'👨‍🍳 Préparation',
    ready:'📦 Prêt', picked_up:'🛵 Récupéré', in_route:'🛵 En route',
    delivered:'🎉 Livré', cancelled:'❌ Annulé', refunded:'↩️ Remboursé', disputed:'⚠️ Litige',
  }[s] || s || '—'),
  statusClass: s => ({
    pending:'badge-amber', confirmed:'badge-orange', preparing:'badge-orange',
    ready:'badge-orange', picked_up:'badge-orange', in_route:'badge-orange',
    delivered:'badge-green', cancelled:'badge-red', refunded:'badge-surface', disputed:'badge-red',
  }[s] || 'badge-surface'),
  roleLabel:  r => ({ client:'Client', livreur:'Livreur', commercant:'Commerçant', admin:'Admin' }[r] || r),
  roleEmoji:  r => ({ client:'👤', livreur:'🛵', commercant:'🏪', admin:'⚙️' }[r] || '👤'),
  initials:   u => u ? ((u.firstName||'')[0]+(u.lastName||'')[0]).toUpperCase() || '?' : '?',
  fileType:   t => ({
    pdf:'PDF', word:'Word', excel:'Excel', powerpoint:'PowerPoint',
    video:'Vidéo', audio:'Audio', zip:'Archive', other:'Fichier',
  }[t] || t || 'Fichier'),
  fileTypeClass: t => ({
    pdf:'file-type-pdf', word:'file-type-word', excel:'file-type-excel',
    powerpoint:'file-type-pptx', video:'file-type-video',
  }[t] || 'file-type-other'),
  kycLabel: s => ({
    pending:'⏳ Non soumis', submitted:'🔍 En vérification',
    verified:'✅ Vérifié', rejected:'❌ Refusé',
  }[s] || s),
};

// ── Offline Cache ─────────────────────────────────────────
const OfflineCache = {
  _store: {},
  set(key, data, ttlMs = 60 * 60 * 1000) { // 1h par défaut
    this._store[key] = { data, expiresAt: Date.now() + ttlMs };
    try { localStorage.setItem('kba_cache_' + key, JSON.stringify(this._store[key])); } catch { /**/ }
  },
  get(key) {
    const item = this._store[key] || (() => {
      try { return JSON.parse(localStorage.getItem('kba_cache_' + key) || 'null'); } catch { return null; }
    })();
    if (!item) return null;
    if (Date.now() > item.expiresAt) { this.delete(key); return null; }
    return item.data;
  },
  delete(key) {
    delete this._store[key];
    localStorage.removeItem('kba_cache_' + key);
  },
  clear() {
    Object.keys(this._store).forEach(k => this.delete(k));
    Object.keys(localStorage).filter(k => k.startsWith('kba_cache_')).forEach(k => localStorage.removeItem(k));
  },
};

// ── Wrapper API avec cache offline ───────────────────────
const APIWithCache = {
  async get(path, cacheKey, ttl) {
    if (!navigator.onLine) {
      const cached = OfflineCache.get(cacheKey || path);
      if (cached) return cached;
      throw new Error('Hors ligne — données non disponibles');
    }
    const result = await apiGet(path, false);
    OfflineCache.set(cacheKey || path, result, ttl);
    return result;
  },
};

// ── Données villes (16 pays) ──────────────────────────────
const COUNTRIES = {
  BF: { name:'Burkina Faso', flag:'🇧🇫', phone:'+226', currency:'XOF' },
  NE: { name:'Niger',        flag:'🇳🇪', phone:'+227', currency:'XOF' },
  ML: { name:'Mali',         flag:'🇲🇱', phone:'+223', currency:'XOF' },
  SN: { name:'Sénégal',      flag:'🇸🇳', phone:'+221', currency:'XOF' },
  CI: { name:"Côte d'Ivoire",flag:'🇨🇮', phone:'+225', currency:'XOF' },
  GH: { name:'Ghana',        flag:'🇬🇭', phone:'+233', currency:'GHS' },
  NG: { name:'Nigeria',      flag:'🇳🇬', phone:'+234', currency:'NGN' },
  GN: { name:'Guinée',       flag:'🇬🇳', phone:'+224', currency:'GNF' },
  CM: { name:'Cameroun',     flag:'🇨🇲', phone:'+237', currency:'XAF' },
  TG: { name:'Togo',         flag:'🇹🇬', phone:'+228', currency:'XOF' },
  BJ: { name:'Bénin',        flag:'🇧🇯', phone:'+229', currency:'XOF' },
  MR: { name:'Mauritanie',   flag:'🇲🇷', phone:'+222', currency:'MRU' },
  GM: { name:'Gambie',       flag:'🇬🇲', phone:'+220', currency:'GMD' },
  SL: { name:'Sierra Leone', flag:'🇸🇱', phone:'+232', currency:'SLL' },
  LR: { name:'Libéria',      flag:'🇱🇷', phone:'+231', currency:'LRD' },
  GW: { name:'Guinée-Bissau',flag:'🇬🇼', phone:'+245', currency:'XOF' },
};

const CITIES = {
  BF: ['Ouagadougou','Bobo-Dioulasso','Koudougou','Ouahigouya','Banfora','Dédougou','Kaya','Tenkodogo',"Fada N'Gourma",'Ziniaré','Manga','Réo','Kongoussi','Dori','Nouna','Tougan','Gaoua','Diébougou','Pô','Léo','Boulsa','Zorgho','Yako','Titao','Bogandé','Djibo','Gorom-Gorom','Kombissiri','Sapouy','Houndé'],
  NE: ['Niamey','Zinder','Maradi','Agadez','Tahoua','Dosso','Diffa','Arlit',"Birni-N'Konni",'Madaoua','Tessaoua','Mirriah','Matamey','Maine-Soroa','Gouré',"N'Guigmi",'Dakoro','Filingué','Illéla','Bouza','Keïta','Loga','Gaya','Dogondoutchi','Téra','Tillabéri','Say','Ouallam','Tillabéry'],
  ML: ['Bamako','Sikasso','Ségou','Mopti','Kayes','Gao','Koutiala','Tombouctou','Kati','San'],
  SN: ['Dakar','Thiès','Kaolack','Ziguinchor','Saint-Louis','Touba','Diourbel','Tambacounda','Kolda','Louga'],
  CI: ['Abidjan','Bouaké','Korhogo','Yamoussoukro','San-Pédro','Man','Daloa','Gagnoa','Divo','Abengourou'],
  GH: ['Accra','Kumasi','Tamale','Takoradi','Tema','Ashaiman','Cape Coast'],
  NG: ['Lagos','Abuja','Kano','Ibadan','Port Harcourt','Benin City','Kaduna','Enugu'],
  GN: ['Conakry','Kankan','Labé','Kindia','Nzérékoré','Mamou','Faranah'],
  CM: ['Yaoundé','Douala','Bamenda','Garoua','Maroua','Bafoussam','Ngaoundéré'],
  TG: ['Lomé','Sokodé','Kara','Atakpamé','Palimé','Bassar'],
  BJ: ['Cotonou','Porto-Novo','Parakou','Abomey','Kandi','Bohicon'],
  MR: ['Nouakchott','Nouadhibou','Kiffa','Rosso','Kaédi'],
  GM: ['Banjul','Serekunda','Brikama','Bakau'],
  SL: ['Freetown','Bo','Kenema','Makeni'],
  LR: ['Monrovia','Gbarnga','Buchanan','Zwedru'],
  GW: ['Bissau','Bafatá','Gabú','Cacheu'],
};
