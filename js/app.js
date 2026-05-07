// ═══════════════════════════════════════════════════════════
// js/app.js — Store + Router + Actions — KibaAlo
// ═══════════════════════════════════════════════════════════

// ── Store réactif ─────────────────────────────────────────
const Store = (() => {
  let _s = {
    screen:      'splash',
    authMode:    'login',
    selectedRole: null,
    obSlide:     0,
    activeTab:   'home',
    activeCategory: 'all',
    payMode:     'wallet',
    cart:        JSON.parse(localStorage.getItem('kba_cart') || '[]'),
    modalOpen:   null,
    modalData:   null,
    notifCount:  0,
    country:     'BF',
    // Données backend
    shops:           [],
    shopsLoading:    false,
    orders:          [],
    wallet:          null,
    walletLoading:   false,
    earnings:        null,
    dashStats:       null,
    myShopId:        null,
    myShopProducts:  [],
    merchantOrders:  [],
    notifications:   [],
    parcels:         [],
    livreurCourses:  [],
  };
  const _L = new Set();
  return {
    get:   (k)  => k ? _s[k] : { ..._s },
    set:   (u)  => { _s = { ..._s, ...u }; localStorage.setItem('kba_cart', JSON.stringify(_s.cart)); _L.forEach(f => f(_s)); },
    sub:   (f)  => { _L.add(f); return () => _L.delete(f); },
    // Cart helpers
    cartTotal:  () => _s.cart.reduce((a,i) => a + i.price * i.qty, 0),
    cartCount:  () => _s.cart.reduce((a,i) => a + i.qty, 0),
    addToCart:  (item, shopName) => {
      const cart = [..._s.cart];
      const idx  = cart.findIndex(c => c.id === item.id);
      if (idx >= 0) cart[idx] = { ...cart[idx], qty: cart[idx].qty + 1 };
      else          cart.push({ ...item, qty:1, shopName: shopName || '' });
      Store.set({ cart });
    },
    removeFromCart: (id) => {
      const cart = [..._s.cart];
      const idx  = cart.findIndex(c => c.id === id);
      if (idx < 0) return;
      if (cart[idx].qty > 1) cart[idx] = { ...cart[idx], qty: cart[idx].qty - 1 };
      else cart.splice(idx, 1);
      Store.set({ cart });
    },
    clearCart: () => Store.set({ cart: [] }),
  };
})();

// ── Toast ─────────────────────────────────────────────────
const Toast = {
  _t: null,
  show(msg, ms = 2800) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.innerHTML = msg;
    el.classList.add('show');
    clearTimeout(this._t);
    this._t = setTimeout(() => el.classList.remove('show'), ms);
  },
};

// ── Modal ─────────────────────────────────────────────────
const Modal = {
  open(name, data = null) {
    Store.set({ modalOpen: name, modalData: data });
    Router.renderModal();
    history.pushState({ modal: name }, '');
  },
  close() {
    Store.set({ modalOpen: null, modalData: null });
    document.getElementById('modal-overlay')?.remove();
  },
};

// ── Router ────────────────────────────────────────────────
const Router = {
  navigate(tab) {
    Modal.close();
    Store.set({ activeTab: tab });
    this._showApp();
    this.renderPage();
    document.getElementById('page')?.scrollTo(0, 0);
  },

  render() {
    const s = Store.get('screen');
    const els = ['topbar','searchbar','page','bottomnav'];
    els.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
    if (s === 'app')   { this._showApp(); this.renderPage(); return; }
    if (s === 'splash')      Views.splashScreen();
    else if (s === 'onboarding') Views.onboarding();
    else if (s === 'role')       Views.roleSelect();
    else if (s === 'auth')       Views.authScreen();
  },

  _showApp() {
    ['topbar','page','bottomnav'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = '';
    });
    const sb = document.getElementById('searchbar');
    if (sb) sb.style.display = ['home','services'].includes(Store.get('activeTab')) ? '' : 'none';
    this.updateTopbar();
    this.updateBottomNav();
  },

  renderPage() {
    const page = document.getElementById('page');
    if (!page) return;
    const { activeTab } = Store.get();
    const role = Auth.getUser()?.role;

    let html = '';
    if (role === 'livreur') {
      if (activeTab === 'home')     html = Views.livreurHome();
      else if (activeTab === 'courses')  html = Views.livreurCourses();
      else if (activeTab === 'earnings') html = Views.livreurEarnings();
      else                               html = Views.profilePage();
    } else if (role === 'commercant') {
      if (activeTab === 'home')     html = Views.dashboard();
      else if (activeTab === 'products') html = Views.products();
      else if (activeTab === 'orders')   html = Views.merchantOrders();
      else if (activeTab === 'wallet')   html = Views.walletPage();
      else                               html = Views.profilePage();
    } else {
      if (activeTab === 'home')     html = Views.homePage();
      else if (activeTab === 'services') html = Views.servicesPage();
      else if (activeTab === 'cart')     html = Views.cartPage();
      else if (activeTab === 'orders')   html = Views.ordersPage();
      else                               html = Views.profilePage();
    }

    page.innerHTML = html;
    page.classList.remove('anim-fade-in');
    void page.offsetWidth; // reflow
    page.classList.add('anim-fade-in');

    // Attacher les événements de délégation
    this._delegateEvents(page);

    // Charger les données asynchrones APRÈS le rendu HTML
    this._postRenderLoad(activeTab, role);
  },

  _delegateEvents(page) {
    // On retire les anciens listeners proprement
    const handler = (e) => {
      const t = e.target.closest('[data-action]');
      if (!t) return;
      e.stopPropagation();
      Actions.handle(t.dataset.action, t.dataset, e);
    };
    page._handler && page.removeEventListener('click', page._handler);
    page._handler = handler;
    page.addEventListener('click', handler);
  },

  // Déclenche les chargements asynchrones après rendu
  _postRenderLoad(tab, role) {
    if (role === 'client') {
      if (tab === 'home')   DataLoader.shops();
      if (tab === 'orders') DataLoader.orders();
    }
    if (role === 'commercant') {
      if (tab === 'home')     DataLoader.dashboard();
      if (tab === 'products') DataLoader.myProducts();
      if (tab === 'orders')   DataLoader.merchantOrders();
      if (tab === 'wallet')   DataLoader.wallet();
    }
    if (role === 'livreur') {
      if (tab === 'home')     DataLoader.livreurHome();
      if (tab === 'courses')  DataLoader.livreurCourses();
      if (tab === 'earnings') DataLoader.earnings();
    }
  },

  renderModal() {
    document.getElementById('modal-overlay')?.remove();
    const { modalOpen, modalData } = Store.get();
    if (!modalOpen) return;
    const html = Views.modal(modalOpen, modalData);
    if (!html) return;
    const overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.className = 'modal-overlay anim-fade-in';
    overlay.innerHTML = '<div class="modal-box">' + html + '</div>';
    overlay.addEventListener('click', e => { if (e.target === overlay) Modal.close(); });
    document.getElementById('app').appendChild(overlay);
    // Délégation dans la modal aussi
    this._delegateEvents(overlay.querySelector('.modal-box'));
    // Post-load pour modales qui ont besoin de données
    if (modalOpen === 'wallet' || modalOpen === 'recharge' || modalOpen === 'withdraw') DataLoader.wallet();
    if (modalOpen === 'notifications') DataLoader.notifications();
  },

  updateBottomNav() {
    const { activeTab } = Store.get();
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === activeTab);
    });
    const badge = document.getElementById('cart-badge');
    if (badge) {
      const n = Store.cartCount();
      badge.textContent = n;
      badge.style.display = n > 0 ? 'flex' : 'none';
    }
  },

  updateTopbar() {
    const user = Auth.getUser();
    if (!user) return;
    const h = new Date().getHours();
    const greet = h < 12 ? 'Bonjour 👋' : h < 18 ? 'Bon après-midi 👋' : 'Bonsoir 👋';
    const nameEl   = document.getElementById('topbar-name');
    const greetEl  = document.getElementById('topbar-greeting');
    const avatarEl = document.getElementById('topbar-avatar');
    const notifBdg = document.getElementById('notif-badge');
    if (nameEl)   nameEl.textContent  = user.firstName + ' ' + user.lastName;
    if (greetEl)  greetEl.textContent = greet;
    if (avatarEl) avatarEl.textContent = Fmt.initials(user);
    const nc = Store.get('notifCount');
    if (notifBdg) { notifBdg.textContent = nc; notifBdg.style.display = nc > 0 ? 'flex' : 'none'; }
    this.updateBottomNav();
  },

  setupNav() {
    const role  = Auth.getUser()?.role;
    const navEl = document.getElementById('bottomnav');
    if (!navEl) return;
    if (role === 'livreur') {
      navEl.innerHTML = `
        <div class="nav-item" data-tab="home"     onclick="Router.navigate('home')"    ><div class="nav-ic">🏠</div><div class="nav-lbl">Accueil</div></div>
        <div class="nav-item" data-tab="courses"  onclick="Router.navigate('courses')" ><div class="nav-ic">🛵</div><div class="nav-lbl">Courses</div></div>
        <div class="nav-item nav-center" data-tab="earnings" onclick="Router.navigate('earnings')"><div class="nav-ic">💰</div><div class="nav-lbl">Gains</div></div>
        <div class="nav-item" data-tab="profile" onclick="Router.navigate('profile')" ><div class="nav-ic">👤</div><div class="nav-lbl">Profil</div></div>
      `;
    } else if (role === 'commercant') {
      navEl.innerHTML = `
        <div class="nav-item" data-tab="home"     onclick="Router.navigate('home')"    ><div class="nav-ic">📊</div><div class="nav-lbl">Dashboard</div></div>
        <div class="nav-item" data-tab="products" onclick="Router.navigate('products')"><div class="nav-ic">🏪</div><div class="nav-lbl">Produits</div></div>
        <div class="nav-item nav-center" data-tab="orders" onclick="Router.navigate('orders')"><div class="nav-ic">📦</div><div class="nav-lbl">Commandes</div></div>
        <div class="nav-item" data-tab="wallet"  onclick="Router.navigate('wallet')"  ><div class="nav-ic">💰</div><div class="nav-lbl">Gains</div></div>
        <div class="nav-item" data-tab="profile" onclick="Router.navigate('profile')" ><div class="nav-ic">👤</div><div class="nav-lbl">Profil</div></div>
      `;
    } else {
      navEl.innerHTML = `
        <div class="nav-item" data-tab="home"     onclick="Router.navigate('home')"    ><div class="nav-ic">🏠</div><div class="nav-lbl">Accueil</div></div>
        <div class="nav-item" data-tab="services" onclick="Router.navigate('services')"><div class="nav-ic">⚙️</div><div class="nav-lbl">Services</div></div>
        <div class="nav-item nav-center" data-tab="cart" onclick="Router.navigate('cart')"><div class="nav-ic">🛒</div><div class="nav-lbl">Panier</div></div>
        <div class="nav-item" data-tab="orders"  onclick="Router.navigate('orders')"  ><div class="nav-ic">📦</div><div class="nav-lbl">Commandes</div></div>
        <div class="nav-item" data-tab="profile" onclick="Router.navigate('profile')" ><div class="nav-ic">👤</div><div class="nav-lbl">Profil</div></div>
      `;
    }
  },
};

// ── DataLoader — tous les appels API avec injection dans le DOM ──
const DataLoader = {
  async shops(params = {}) {
    const cat = Store.get('activeCategory');
    if (cat !== 'all') params.category = cat;
    const q = Store.get('searchQuery');
    if (q) params.q = q;

    Store.set({ shopsLoading: true });
    try {
      const res = await API.shops.list(params);
      Store.set({ shops: res.data || [], shopsLoading: false });
      // Mettre à jour les sections concernées
      const shopSection = document.getElementById('shop-list-container');
      const prodSection = document.getElementById('product-grid-container');
      if (shopSection) shopSection.innerHTML = Views._shopListHtml(res.data || []);
      if (prodSection) prodSection.innerHTML = Views._productGridHtml(res.data || []);
    } catch (err) {
      Store.set({ shopsLoading: false });
      const shopSection = document.getElementById('shop-list-container');
      if (shopSection) shopSection.innerHTML = Views._emptyState('🏪','Boutiques indisponibles', err.message);
    }
  },

  async orders() {
    const el = document.getElementById('orders-container');
    if (!el) return;
    el.innerHTML = Views._spinner();
    try {
      const res = await API.orders.list();
      Store.set({ orders: res.data || [] });
      el.innerHTML = (res.data || []).length === 0
        ? Views._emptyState('📦', 'Aucune commande', 'Vos commandes passées apparaîtront ici.')
        : res.data.map(o => Views._orderCard(o)).join('');
    } catch (err) {
      el.innerHTML = Views._errorState(err.message, () => DataLoader.orders());
    }
  },

  async wallet() {
    Store.set({ walletLoading: true });
    try {
      const res = await API.wallet.get();
      Store.set({ wallet: res.data, walletLoading: false });
      // Mettre à jour le solde où il est affiché
      document.querySelectorAll('[data-wallet-balance]').forEach(el => {
        el.textContent = Fmt.money(res.data.balance);
      });
      const txnEl = document.getElementById('txn-container');
      if (txnEl) txnEl.innerHTML = Views._transactionList(res.data.transactions || []);
    } catch {
      Store.set({ walletLoading: false });
    }
  },

  async dashboard() {
    const el = document.getElementById('dashboard-container');
    if (!el) return;
    el.innerHTML = Views._spinner();
    try {
      const res = await API.shops.dashboard();
      Store.set({ dashStats: res.data, myShopId: res.data?.shopId });
      el.innerHTML = Views._dashboardContent(res.data);
    } catch (err) {
      el.innerHTML = Views._errorState(err.message, () => DataLoader.dashboard());
    }
  },

  async myProducts() {
    const el = document.getElementById('products-container');
    if (!el) return;
    el.innerHTML = Views._spinner();
    try {
      // On récupère le shopId depuis le store ou on charge le dashboard
      let shopId = Store.get('myShopId');
      if (!shopId) {
        const dash = await API.shops.dashboard();
        shopId = dash.data?.shopId || dash.data?.pendingOrders?.[0]?.shop_id;
        Store.set({ myShopId: shopId });
      }
      if (!shopId) { el.innerHTML = Views._emptyState('🏪','Aucune boutique','Créez votre boutique pour ajouter des produits.'); return; }
      const res = await API.shops.products(shopId);
      Store.set({ myShopProducts: res.data || [] });
      el.innerHTML = (res.data||[]).length === 0
        ? Views._emptyState('📦','Aucun produit','Ajoutez vos premiers produits.')
        : Views._productListAdmin(res.data, shopId);
    } catch (err) {
      el.innerHTML = Views._errorState(err.message, () => DataLoader.myProducts());
    }
  },

  async merchantOrders() {
    const el = document.getElementById('merchant-orders-container');
    if (!el) return;
    el.innerHTML = Views._spinner();
    try {
      const res = await API.orders.list();
      Store.set({ merchantOrders: res.data || [] });
      el.innerHTML = (res.data||[]).length === 0
        ? Views._emptyState('📦','Aucune commande','Les commandes de vos clients apparaîtront ici.')
        : res.data.map(o => Views._merchantOrderCard(o)).join('');
    } catch (err) {
      el.innerHTML = Views._errorState(err.message, () => DataLoader.merchantOrders());
    }
  },

  async livreurHome() {
    const el = document.getElementById('livreur-stats-container');
    if (!el) return;
    try {
      const res = await API.livreurs.earnings();
      el.innerHTML = Views._livreurStats(res.data);
    } catch { /* pas bloquant */ }
  },

  async livreurCourses() {
    const el = document.getElementById('courses-container');
    if (!el) return;
    el.innerHTML = Views._spinner();
    try {
      const res = await API.orders.list();
      el.innerHTML = (res.data||[]).length === 0
        ? Views._emptyState('🛵','Aucune course','Les courses acceptées apparaîtront ici.')
        : res.data.map(o => Views._courseCard(o)).join('');
    } catch (err) {
      el.innerHTML = Views._errorState(err.message, () => DataLoader.livreurCourses());
    }
  },

  async earnings() {
    const el = document.getElementById('earnings-container');
    if (!el) return;
    el.innerHTML = Views._spinner();
    try {
      const res = await API.livreurs.earnings();
      Store.set({ earnings: res.data });
      // Mettre à jour le montant affiché
      document.querySelectorAll('[data-wallet-balance]').forEach(e => e.textContent = Fmt.money(res.data.walletBalance || 0));
      el.innerHTML = Views._earningsHistory(res.data);
    } catch (err) {
      el.innerHTML = Views._errorState(err.message, () => DataLoader.earnings());
    }
  },

  async notifications() {
    const el = document.getElementById('notif-container');
    if (!el) return;
    el.innerHTML = Views._spinner();
    try {
      const res = await API.notifications.list();
      Store.set({ notifications: res.data || [], notifCount: res.unreadCount || 0 });
      Router.updateTopbar();
      el.innerHTML = (res.data||[]).length === 0
        ? Views._emptyState('🔔','Aucune notification','')
        : res.data.map(n => Views._notifCard(n)).join('');
    } catch (err) {
      el.innerHTML = Views._errorState(err.message);
    }
  },

  async trackOrder(orderId) {
    const el = document.getElementById('tracking-status-container');
    if (!el) return;
    try {
      const res = await API.orders.get(orderId);
      el.innerHTML = Views._trackingStatus(res.data);
    } catch (err) {
      if (el) el.innerHTML = '<p class="text-muted text-sm">' + err.message + '</p>';
    }
  },
};

// ── Actions ───────────────────────────────────────────────
const Actions = {
  handle(action, data, e) {
    const map = {
      'open-shop':        () => this.openShop(data.id),
      'add-to-cart':      () => this.addToCart(data),
      'remove-from-cart': () => this.removeFromCart(data.id),
      'open-service':     () => this.openService(data.name),
      'track-order':      () => Modal.open('tracking', { orderId: data.id }),
      'open-product':     () => Modal.open('product', { id: data.id, shopId: data.shopid }),
      'toggle-fav':       () => this.toggleFav(data.id),
      'go-premium':       () => Modal.open('premium'),
      'open-wallet':      () => Modal.open('wallet'),
      'open-parcel':      () => Modal.open('parcel'),
      'open-rental':      () => Modal.open('rental', { name: data.name, price: data.price }),
      'open-notifs':      () => Modal.open('notifications'),
      'confirm-order':    () => this.changeOrderStatus(data.id, 'confirmed'),
      'reject-order':     () => this.changeOrderStatus(data.id, 'cancelled'),
      'mark-ready':       () => this.changeOrderStatus(data.id, 'ready'),
      'accept-delivery':  () => this.acceptDelivery(data.id),
      'delivered-order':  () => this.changeOrderStatus(data.id, 'delivered'),
      'delete-product':   () => this.deleteProduct(data.shopid, data.id),
      'review-order':     () => Modal.open('review', { orderId: data.id }),
      'set-category':     () => { Store.set({ activeCategory: data.cat }); DataLoader.shops(); Router.renderPage(); },
    };
    const fn = map[action];
    if (fn) fn();
  },

  openShop(id) {
    Modal.open('shop', { id });
    API.shops.get(id).then(res => {
      Store.set({ modalData: res.data });
      Router.renderModal();
    }).catch(err => Toast.show('❌ ' + err.message));
  },

  addToCart(data) {
    Store.addToCart({
      id: data.id, name: data.name,
      price: parseInt(data.price) || 0,
      emoji: data.emoji || '📦',
      shopId: data.shopid || '',
    }, data.shopname || '');
    Toast.show('✅ ' + data.name + ' ajouté au panier');
    Router.updateBottomNav();
  },

  removeFromCart(id) {
    Store.removeFromCart(id);
    Router.renderPage();
  },

  openService(name) {
    const n = (name||'').toLowerCase();
    if (n.includes('expéd') || n.includes('colis')) Modal.open('parcel');
    else if (n.includes('location')) Modal.open('rental');
    else Toast.show('🔧 ' + name + ' — Disponible bientôt');
  },

  toggleFav(id) {
    const favs = JSON.parse(localStorage.getItem('kba_favs') || '[]');
    const idx  = favs.indexOf(id);
    if (idx >= 0) { favs.splice(idx,1); Toast.show('💔 Retiré des favoris'); }
    else          { favs.push(id);      Toast.show('❤️ Ajouté aux favoris');  }
    localStorage.setItem('kba_favs', JSON.stringify(favs));
    // Mettre à jour l'icône
    const btn = document.querySelector('[data-action="toggle-fav"][data-id="' + id + '"]');
    if (btn) btn.textContent = idx >= 0 ? '🤍' : '❤️';
  },

  async changeOrderStatus(orderId, status) {
    try {
      await API.orders.updateStatus(orderId, status);
      const labels = { confirmed:'✅ Commande confirmée', cancelled:'❌ Commande annulée', ready:'📦 Commande prête', delivered:'🎉 Livraison confirmée' };
      Toast.show(labels[status] || '✅ Statut mis à jour');
      Router.renderPage();
    } catch (err) { Toast.show('❌ ' + err.message); }
  },

  async acceptDelivery(orderId) {
    try {
      await API.orders.updateStatus(orderId, 'picked_up');
      Toast.show('✅ Course acceptée !');
      Router.renderPage();
      // Démarrer l'envoi de position GPS
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(pos => {
          API.orders.sendLocation(orderId, pos.coords.latitude, pos.coords.longitude).catch(() => {});
          SocketMgr.sendLocation(orderId, pos.coords.latitude, pos.coords.longitude);
        }, null, { enableHighAccuracy: true, maximumAge: 10000 });
      }
    } catch (err) { Toast.show('❌ ' + err.message); }
  },

  async deleteProduct(shopId, productId) {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await API.shops.deleteProduct(shopId, productId);
      Toast.show('🗑️ Produit supprimé');
      DataLoader.myProducts();
    } catch (err) { Toast.show('❌ ' + err.message); }
  },
};

// ── Lifecycle ─────────────────────────────────────────────
window.addEventListener('kba:session-expired', () => {
  Toast.show('⚠️ Session expirée. Reconnectez-vous.');
  Auth.logout();
  Store.set({ screen:'role', selectedRole:null, activeTab:'home' });
  Router.render();
});

window.addEventListener('popstate', () => {
  if (Store.get('modalOpen')) Modal.close();
  else if (Store.get('screen') === 'app' && Store.get('activeTab') !== 'home') Router.navigate('home');
});

async function loadInitialData() {
  if (!Auth.isLoggedIn()) return;
  try {
    const me = await API.auth.me();
    Auth.setUser(me.user);
    Store.set({ notifCount: me.unreadNotifications || 0 });
    Router.updateTopbar();
  } catch { /* silencieux au démarrage */ }
}

// ── Boot ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (Auth.isLoggedIn() && Auth.getUser()) {
    Router.setupNav();
    Store.set({ screen: 'app' });
    Router.render();
    loadInitialData();
  }
  // Le splash démarre dans views.js
});
