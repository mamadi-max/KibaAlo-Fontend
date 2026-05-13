// js/app.js — KibaAlo v2.0 — Store + Router + DataLoader
// ================================================================

// ── Store réactif ─────────────────────────────────────────
const Store = (() => {
  let _s = {
    screen: 'splash',
    authMode: 'login',
    selectedRole: null,
    obSlide: 0,
    activeTab: 'home',
    activeCategory: 'all',
    activeSubCategory: null,
    payMode: 'wallet',
    cart: JSON.parse(localStorage.getItem('kba_cart') || '[]'),
    modalOpen: null,
    modalData: null,
    notifCount: 0,
    country: localStorage.getItem('kba_country') || 'BF',
    searchQuery: '',
    searchResults: null,
    searchSuggestions: [],
    showSuggestions: false,
    isOffline: !navigator.onLine,
    // Données backend
    shops: [],
    shopsLoading: false,
    featuredShops: [],
    popularProducts: [],
    digitalProducts: [],
    orders: [],
    wallet: null,
    earnings: null,
    dashStats: null,
    myShopId: localStorage.getItem('kba_shop_id') || null,
    myShopProducts: [],
    merchantOrders: [],
    notifications: [],
    parcels: [],
    livreurProfile: null,
    paymentProviders: [],
    savedAddresses: [],
    categories: [],
    // Filtres avancés
    filters: {
      minRating: null,
      maxDeliveryFee: null,
      freeDelivery: false,
      isOpen: false,
      sortBy: 'rating',
      lat: null,
      lng: null,
    },
  };
  const _L = new Set();
  return {
    get:   (k) => k ? _s[k] : { ..._s },
    set:   (u) => {
      _s = { ..._s, ...u };
      if (u.cart !== undefined)   localStorage.setItem('kba_cart', JSON.stringify(_s.cart));
      if (u.country !== undefined) localStorage.setItem('kba_country', _s.country);
      if (u.myShopId !== undefined && _s.myShopId) localStorage.setItem('kba_shop_id', _s.myShopId);
      _L.forEach(f => f(_s));
    },
    sub:   (f) => { _L.add(f); return () => _L.delete(f); },
    cartTotal:  () => _s.cart.reduce((a,i) => a + i.price * i.qty, 0),
    cartCount:  () => _s.cart.reduce((a,i) => a + i.qty, 0),
    addToCart:  (item, shopName) => {
      const cart = [..._s.cart];
      const idx  = cart.findIndex(c => c.id === item.id);
      if (idx >= 0) cart[idx] = { ...cart[idx], qty: cart[idx].qty + 1 };
      else cart.push({ ...item, qty:1, shopName: shopName || '' });
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
  _stack: [],
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
    Store.set({ activeTab: tab, searchQuery: '', showSuggestions: false });
    this._showApp();
    this.renderPage();
    document.getElementById('page')?.scrollTo(0, 0);
    // Masquer/afficher la searchbar
    const sb = document.getElementById('searchbar');
    if (sb) sb.style.display = ['home','services','search'].includes(tab) ? '' : 'none';
  },

  render() {
    const s = Store.get('screen');
    ['topbar','searchbar','page','bottomnav'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    if (s === 'app')   { this._showApp(); this.renderPage(); }
    else if (s === 'splash')     Views.splashScreen();
    else if (s === 'onboarding') Views.onboarding();
    else if (s === 'role')       Views.roleSelect();
    else if (s === 'auth')       Views.authScreen();
    else if (s === 'verify-email') Views.verifyEmailScreen();
    else if (s === 'reset-password') Views.resetPasswordScreen();
  },

  _showApp() {
    ['topbar','page','bottomnav'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = '';
    });
    const sb = document.getElementById('searchbar');
    const tab = Store.get('activeTab');
    if (sb) sb.style.display = ['home','services'].includes(tab) ? '' : 'none';
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
      const map = { home: Views.livreurHome, courses: Views.livreurCourses, earnings: Views.livreurEarnings, profile: Views.profilePage };
      html = (map[activeTab] || Views.profilePage).call(Views);
    } else if (role === 'commercant') {
      const map = { home: Views.dashboard, products: Views.products, orders: Views.merchantOrders, wallet: Views.walletPage, profile: Views.profilePage };
      html = (map[activeTab] || Views.profilePage).call(Views);
    } else {
      const map = { home: Views.homePage, services: Views.servicesPage, cart: Views.cartPage, orders: Views.ordersPage, profile: Views.profilePage, favorites: Views.favoritesPage, search: Views.searchPage };
      html = (map[activeTab] || Views.homePage).call(Views);
    }

    page.innerHTML = html;
    page.classList.remove('anim-fade-in');
    void page.offsetWidth;
    page.classList.add('anim-fade-in');

    this._delegateEvents(page);
    this._postRenderLoad(activeTab, role);
  },

  _delegateEvents(el) {
    el._handler && el.removeEventListener('click', el._handler);
    el._handler = (e) => {
      const t = e.target.closest('[data-action]');
      if (t) { e.stopPropagation(); Actions.handle(t.dataset.action, t.dataset, e); }
    };
    el.addEventListener('click', el._handler);
  },

  _postRenderLoad(tab, role) {
    if (role === 'client') {
      if (tab === 'home')      DataLoader.homeData();
      if (tab === 'orders')    DataLoader.orders();
      if (tab === 'favorites') DataLoader.favorites();
      if (tab === 'profile')   DataLoader.wallet();
    }
    if (role === 'commercant') {
      if (tab === 'home')      DataLoader.dashboard();
      if (tab === 'products')  DataLoader.myProducts();
      if (tab === 'orders')    DataLoader.merchantOrders();
      if (tab === 'wallet')    DataLoader.wallet();
    }
    if (role === 'livreur') {
      if (tab === 'home')      DataLoader.livreurHome();
      if (tab === 'courses')   DataLoader.livreurCourses();
      if (tab === 'earnings')  DataLoader.earnings();
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
    this._delegateEvents(overlay.querySelector('.modal-box'));
    // Post-load modales
    const postLoad = {
      wallet: DataLoader.wallet,
      notifications: DataLoader.notifications,
      myColis: DataLoader.parcels,
      addresses: DataLoader.addresses,
      shopDetail: () => modalData?.id && DataLoader.shopDetail(modalData.id),
      tracking: () => modalData?.orderId && DataLoader.trackOrder(modalData.orderId),
    };
    postLoad[modalOpen]?.();
  },

  updateBottomNav() {
    const { activeTab } = Store.get();
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === activeTab);
    });
    const badge = document.getElementById('cart-badge');
    if (badge) { const n = Store.cartCount(); badge.textContent = n; badge.style.display = n > 0 ? 'flex' : 'none'; }
    const notifBadge = document.getElementById('nav-notif-badge');
    const nc = Store.get('notifCount');
    if (notifBadge) { notifBadge.textContent = nc; notifBadge.style.display = nc > 0 ? 'flex' : 'none'; }
  },

  updateTopbar() {
    const user = Auth.getUser();
    if (!user) return;
    const h = new Date().getHours();
    const greet = h < 12 ? 'Bonjour 👋' : h < 18 ? 'Bon après-midi 👋' : 'Bonsoir 👋';
    const nameEl    = document.getElementById('topbar-name');
    const greetEl   = document.getElementById('topbar-greeting');
    const avatarEl  = document.getElementById('topbar-avatar');
    const notifBdg  = document.getElementById('notif-badge');
    if (nameEl)   nameEl.textContent   = user.firstName + ' ' + user.lastName;
    if (greetEl)  greetEl.textContent  = greet;
    if (avatarEl) {
      if (user.avatarUrl) {
        avatarEl.innerHTML = `<img src="${user.avatarUrl}" style="width:100%;height:100%;object-fit:cover;" />`;
        avatarEl.style.padding = '0';
      } else {
        avatarEl.textContent = Fmt.initials(user);
      }
    }
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
        <div class="nav-item" data-tab="home"     onclick="Router.navigate('home')"   ><div class="nav-ic">🏠</div><div class="nav-lbl">Accueil</div></div>
        <div class="nav-item" data-tab="courses"  onclick="Router.navigate('courses')"><div class="nav-ic">🛵</div><div class="nav-lbl">Courses</div></div>
        <div class="nav-item nav-center" data-tab="earnings" onclick="Router.navigate('earnings')"><div class="nav-ic">💰</div><div class="nav-lbl">Gains</div></div>
        <div class="nav-item" data-tab="profile"  onclick="Router.navigate('profile')"><div class="nav-ic">👤</div><div class="nav-lbl">Profil</div></div>
      `;
    } else if (role === 'commercant') {
      navEl.innerHTML = `
        <div class="nav-item" data-tab="home"     onclick="Router.navigate('home')"    ><div class="nav-ic">📊</div><div class="nav-lbl">Dashboard</div></div>
        <div class="nav-item" data-tab="products" onclick="Router.navigate('products')"><div class="nav-ic">🏪</div><div class="nav-lbl">Produits</div></div>
        <div class="nav-item nav-center" data-tab="orders" onclick="Router.navigate('orders')"><div class="nav-ic">📦</div><div class="nav-lbl">Commandes</div></div>
        <div class="nav-item" data-tab="wallet"   onclick="Router.navigate('wallet')"  ><div class="nav-ic">💰</div><div class="nav-lbl">Gains</div></div>
        <div class="nav-item" data-tab="profile"  onclick="Router.navigate('profile')" ><div class="nav-ic">👤</div><div class="nav-lbl">Profil</div></div>
      `;
    } else {
      navEl.innerHTML = `
        <div class="nav-item" data-tab="home"      onclick="Router.navigate('home')"     ><div class="nav-ic">🏠</div><div class="nav-lbl">Accueil</div></div>
        <div class="nav-item" data-tab="services"  onclick="Router.navigate('services')" ><div class="nav-ic">⚙️</div><div class="nav-lbl">Services</div></div>
        <div class="nav-item nav-center" data-tab="cart" onclick="Router.navigate('cart')"><div class="nav-ic">🛒</div><div class="nav-lbl">Panier</div></div>
        <div class="nav-item" data-tab="orders"    onclick="Router.navigate('orders')"   ><div class="nav-ic">📦</div><div class="nav-lbl">Commandes</div></div>
        <div class="nav-item" data-tab="profile"   onclick="Router.navigate('profile')"  >
          <div class="nav-ic">👤</div><div class="nav-lbl">Profil</div>
          <div class="nav-badge" id="nav-notif-badge" style="display:none;">0</div>
        </div>
      `;
    }
  },
};

// ── DataLoader ────────────────────────────────────────────
const DataLoader = {

  async homeData() {
    // Charger boutiques + populaires en parallèle
    try {
      const [shopsRes, popularRes] = await Promise.allSettled([
        API.shops.list({ country: Store.get('country'), limit: 20 }),
        API.search.popular(Store.get('country')),
      ]);

      if (shopsRes.status === 'fulfilled') {
        Store.set({ shops: shopsRes.value.data || [] });
        const shopSection = document.getElementById('shop-list-container');
        if (shopSection) shopSection.innerHTML = Views._shopScrollHtml(shopsRes.value.data || []);
      }
      if (popularRes.status === 'fulfilled') {
        Store.set({
          featuredShops:   popularRes.value.data?.featuredShops   || [],
          popularProducts: popularRes.value.data?.popularProducts || [],
          digitalProducts: popularRes.value.data?.digitalProducts || [],
        });
        const prodSection = document.getElementById('product-grid-container');
        if (prodSection) prodSection.innerHTML = Views._productGridHtml(popularRes.value.data?.popularProducts || []);
        const digitalSection = document.getElementById('digital-grid-container');
        if (digitalSection) digitalSection.innerHTML = Views._digitalGridHtml(popularRes.value.data?.digitalProducts || []);
      }
    } catch (err) {
      // Charger depuis le cache offline
      const cached = OfflineCache.get('home_data');
      if (cached) {
        const shopSection = document.getElementById('shop-list-container');
        if (shopSection) shopSection.innerHTML = Views._shopScrollHtml(cached.shops || []) + '<div class="offline-banner">📡 Données en cache — mode hors ligne</div>';
      }
    }
  },

  async shops(params = {}) {
    Store.set({ shopsLoading: true });
    const { activeCategory, filters, country } = Store.get();
    const p = { country, limit: 30, ...params };
    if (activeCategory !== 'all') p.category = activeCategory;
    if (filters.minRating)    p.minRating    = filters.minRating;
    if (filters.maxDeliveryFee) p.maxDeliveryFee = filters.maxDeliveryFee;
    if (filters.freeDelivery) p.freeDelivery = 'true';
    if (filters.isOpen)       p.isOpen       = 'true';
    if (filters.sortBy)       p.sortBy       = filters.sortBy;
    if (filters.lat)          p.lat          = filters.lat;
    if (filters.lng)          p.lng          = filters.lng;

    try {
      const res = await API.shops.list(p);
      Store.set({ shops: res.data || [], shopsLoading: false });
      const el = document.getElementById('shop-list-container');
      if (el) el.innerHTML = Views._shopScrollHtml(res.data || []);
    } catch (err) {
      Store.set({ shopsLoading: false });
    }
  },

  async shopDetail(id) {
    try {
      const res = await API.shops.get(id);
      Store.set({ modalData: res.data });
      Router.renderModal();
    } catch (err) {
      Toast.show('❌ ' + err.message);
    }
  },

  async orders() {
    const el = document.getElementById('orders-container');
    if (!el) return;
    el.innerHTML = Views._spinner();
    try {
      const res = await API.orders.list();
      Store.set({ orders: res.data || [] });
      el.innerHTML = (res.data||[]).length === 0
        ? Views._emptyState('📦','Aucune commande','Vos commandes apparaîtront ici.')
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
      document.querySelectorAll('[data-wallet-balance]').forEach(el => {
        el.textContent = Fmt.money(res.data.balance);
      });
      const txnEl = document.getElementById('txn-container');
      if (txnEl) txnEl.innerHTML = Views._transactionList(res.data.transactions || []);
    } catch { Store.set({ walletLoading: false }); }
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
      let shopId = Store.get('myShopId');
      if (!shopId) {
        const dash = await API.shops.dashboard();
        shopId = dash.data?.shopId;
        Store.set({ myShopId: shopId });
      }
      if (!shopId) { el.innerHTML = Views._emptyState('🏪','Aucune boutique','Créez votre boutique d\'abord.'); return; }
      const res = await API.shops.products(shopId, { limit: 100 });
      Store.set({ myShopProducts: res.data || [] });
      el.innerHTML = (res.data||[]).length === 0
        ? Views._emptyState('📦','Aucun produit','Ajoutez votre premier produit.')
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
    try {
      const res = await API.livreurs.earnings();
      Store.set({ earnings: res.data });
      const el = document.getElementById('livreur-stats-container');
      if (el) el.innerHTML = Views._livreurStats(res.data);
    } catch { /* silencieux */ }
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
      document.querySelectorAll('[data-wallet-balance]').forEach(e => e.textContent = Fmt.money(res.data.walletBalance||0));
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

  async parcels() {
    const el = document.getElementById('colis-container');
    if (!el) return;
    el.innerHTML = Views._spinner();
    try {
      const res = await API.parcels.myList();
      el.innerHTML = (res.data||[]).length === 0
        ? Views._emptyState('📦','Aucun colis','')
        : res.data.map(p => Views._parcelCard(p)).join('');
    } catch (err) {
      el.innerHTML = Views._errorState(err.message);
    }
  },

  async addresses() {
    const el = document.getElementById('addresses-container');
    if (!el) return;
    try {
      const res = await API.auth.getAddresses();
      Store.set({ savedAddresses: res.data || [] });
      el.innerHTML = Views._addressList(res.data || []);
    } catch { el.innerHTML = ''; }
  },

  async trackOrder(orderId) {
    const el = document.getElementById('tracking-status-container');
    if (!el || !orderId) return;
    try {
      const res = await API.orders.get(orderId);
      el.innerHTML = Views._trackingStatus(res.data);
      // Connecter Socket.IO
      const user = Auth.getUser();
      SocketMgr.connect(user?.id, user?.role);
      SocketMgr.joinOrder(orderId);
    } catch (err) {
      if (el) el.innerHTML = '<p class="text-muted text-sm">' + err.message + '</p>';
    }
  },

  async searchQuery(q) {
    if (!q || q.length < 2) {
      Store.set({ searchResults: null, showSuggestions: false });
      return;
    }
    try {
      const res = await API.search.query(q, { country: Store.get('country') });
      Store.set({ searchResults: res.data, showSuggestions: false });
      const el = document.getElementById('search-results-container');
      if (el) el.innerHTML = Views._searchResults(res.data, q);
    } catch { /* silencieux */ }
  },

  async loadSuggestions(q) {
    if (!q || q.length < 2) { Store.set({ searchSuggestions: [], showSuggestions: false }); return; }
    try {
      const res = await API.search.suggestions(q, Store.get('country'));
      Store.set({ searchSuggestions: res.data || [], showSuggestions: true });
      Views.renderSuggestions(res.data || []);
    } catch { /**/ }
  },

  async favorites() {
    const el = document.getElementById('fav-container');
    if (!el) return;
    el.innerHTML = Views._spinner();
    const favIds = JSON.parse(localStorage.getItem('kba_favs') || '[]');
    if (!favIds.length) { el.innerHTML = Views._emptyState('❤️','Aucun favori','Ajoutez des produits à vos favoris.'); return; }
    try {
      const results = await Promise.allSettled(
        favIds.slice(0,20).map(id => API.shops.products('all', { id }).catch(() => null))
      );
      el.innerHTML = '<p class="text-muted text-sm p-20">Favoris — bientôt disponible avec synchronisation</p>';
    } catch { el.innerHTML = Views._errorState('Erreur'); }
  },
};

// ── Actions ───────────────────────────────────────────────
const Actions = {
  handle(action, data, e) {
    const map = {
      'open-shop':           () => Modal.open('shopDetail', { id: data.id }),
      'add-to-cart':         () => this.addToCart(data),
      'remove-from-cart':    () => { Store.removeFromCart(data.id); Router.renderPage(); },
      'open-service':        () => this.openService(data.name),
      'track-order':         () => Modal.open('tracking', { orderId: data.id }),
      'open-product':        () => Modal.open('productDetail', { id: data.id, shopId: data.shopid }),
      'toggle-fav':          () => this.toggleFav(data.id, data.name),
      'go-premium':          () => Modal.open('premium'),
      'open-wallet':         () => Modal.open('wallet'),
      'open-parcel':         () => Modal.open('parcel'),
      'open-rental':         () => Modal.open('rental', { name: data.name, price: data.price }),
      'open-notifs':         () => Modal.open('notifications'),
      'open-kyc':            () => Modal.open('kyc'),
      'open-addresses':      () => Modal.open('addresses'),
      'open-filters':        () => Modal.open('filters'),
      'open-digital-buy':    () => Modal.open('digitalBuy', { id: data.id, name: data.name, price: data.price, shopid: data.shopid }),
      'confirm-order':       () => this.changeOrderStatus(data.id, 'confirmed'),
      'reject-order':        () => this.changeOrderStatus(data.id, 'cancelled'),
      'mark-ready':          () => this.changeOrderStatus(data.id, 'ready'),
      'accept-delivery':     () => this.acceptDelivery(data.id),
      'mark-delivered':      () => this.changeOrderStatus(data.id, 'delivered'),
      'delete-product':      () => this.deleteProduct(data.shopid, data.id),
      'review-order':        () => Modal.open('review', { orderId: data.id }),
      'set-category':        () => { Store.set({ activeCategory: data.cat, activeSubCategory: null }); DataLoader.shops(); Router.renderPage(); },
      'set-subcategory':     () => { Store.set({ activeSubCategory: data.sub }); DataLoader.shops({ subcategory: data.sub }); },
      'download-invoice':    () => this.downloadInvoice(data.id),
      'download-digital':    () => Modal.open('digitalDownload', { orderId: data.orderid, purchaseId: data.id }),
      'track-parcel':        () => Modal.open('trackParcel', { code: data.code }),
      'set-sort':            () => { Store.set({ filters: { ...Store.get('filters'), sortBy: data.sort } }); DataLoader.shops(); Router.renderPage(); },
    };
    map[action]?.();
  },

  addToCart(data) {
    // Vérifier si produit digital (pas de panier, achat direct)
    if (data.isdigital === 'true') {
      Modal.open('digitalBuy', { id: data.id, name: data.name, price: data.price, shopid: data.shopid });
      return;
    }
    Store.addToCart({
      id: data.id, name: data.name,
      price: parseInt(data.price) || 0,
      emoji: data.emoji || '📦',
      shopId: data.shopid || '',
      isDigital: false,
    }, data.shopname || '');
    Toast.show(`✅ ${data.name} ajouté au panier`);
    Router.updateBottomNav();
  },

  openService(name) {
    const n = (name||'').toLowerCase();
    if (n.includes('expéd') || n.includes('colis')) Modal.open('parcel');
    else if (n.includes('location') || n.includes('appare')) Modal.open('rental');
    else if (n.includes('digital') || n.includes('format')) { Store.set({ activeTab:'services', activeCategory:'digital' }); Router.renderPage(); }
    else Toast.show('🔧 ' + name + ' — Contactez-nous');
  },

  toggleFav(id, name) {
    const favs = JSON.parse(localStorage.getItem('kba_favs') || '[]');
    const idx  = favs.indexOf(id);
    if (idx >= 0) { favs.splice(idx,1); Toast.show('💔 Retiré des favoris'); }
    else          { favs.push(id);      Toast.show('❤️ ' + (name||'Produit') + ' ajouté aux favoris'); }
    localStorage.setItem('kba_favs', JSON.stringify(favs));
    const btn = document.querySelector(`[data-action="toggle-fav"][data-id="${id}"]`);
    if (btn) btn.textContent = idx >= 0 ? '🤍' : '❤️';
  },

  async changeOrderStatus(orderId, status) {
    try {
      await API.orders.updateStatus(orderId, status);
      const labels = { confirmed:'✅ Confirmée', cancelled:'❌ Annulée', ready:'📦 Prête', delivered:'🎉 Livrée', picked_up:'🛵 Récupérée' };
      Toast.show('✅ Commande ' + (labels[status]||status));
      Router.renderPage();
    } catch (err) { Toast.show('❌ ' + err.message); }
  },

  async acceptDelivery(orderId) {
    try {
      await API.orders.updateStatus(orderId, 'picked_up');
      Toast.show('✅ Course acceptée ! GPS activé...');
      Router.renderPage();
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(pos => {
          API.orders.sendLocation(orderId, pos.coords.latitude, pos.coords.longitude).catch(() => {});
          SocketMgr.sendLocation(orderId, pos.coords.latitude, pos.coords.longitude);
        }, null, { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 });
      }
    } catch (err) { Toast.show('❌ ' + err.message); }
  },

  async deleteProduct(shopId, productId) {
    if (!confirm('Désactiver ce produit ?')) return;
    try {
      await API.shops.deleteProduct(shopId, productId);
      Toast.show('🗑️ Produit désactivé');
      DataLoader.myProducts();
    } catch (err) { Toast.show('❌ ' + err.message); }
  },

  downloadInvoice(orderId) {
    const url = API.orders.getInvoice(orderId);
    const token = Auth.getToken();
    // Ouvrir avec le token
    fetch(url, { headers: { 'Authorization': 'Bearer ' + token } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `facture-${orderId.slice(0,8)}.pdf`;
        a.click();
        Toast.show('📥 Facture téléchargée !');
      })
      .catch(() => Toast.show('❌ Erreur téléchargement facture'));
  },
};

// ── Lifecycle ─────────────────────────────────────────────
window.addEventListener('kba:session-expired', () => {
  Toast.show('⚠️ Session expirée. Reconnectez-vous.');
  Auth.logout();
  SocketMgr.disconnect();
  Store.set({ screen:'role', selectedRole:null, activeTab:'home', shops:[], orders:[], wallet:null });
  Router.render();
});

window.addEventListener('online',  () => { Store.set({ isOffline: false }); Toast.show('✅ Connexion rétablie'); });
window.addEventListener('offline', () => { Store.set({ isOffline: true  }); Toast.show('📡 Mode hors ligne activé — données en cache disponibles 1h', 4000); });

window.addEventListener('popstate', () => {
  if (Store.get('modalOpen')) Modal.close();
  else if (Store.get('screen') === 'app' && Store.get('activeTab') !== 'home') Router.navigate('home');
});

window.addEventListener('kba:order-status', e => {
  Toast.show('🔄 Statut: ' + Fmt.statusLabel(e.detail.status), 4000);
  if (Store.get('activeTab') === 'orders') DataLoader.orders();
  if (Store.get('modalOpen') === 'tracking') DataLoader.trackOrder(Store.get('modalData')?.orderId);
});

// Vérifier lien de vérification email dans l'URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('token') && window.location.pathname.includes('verify')) {
  Store.set({ screen: 'verify-email', verifyToken: urlParams.get('token') });
}
if (urlParams.get('token') && window.location.pathname.includes('reset')) {
  Store.set({ screen: 'reset-password', resetToken: urlParams.get('token') });
}

async function loadInitialData() {
  if (!Auth.isLoggedIn()) return;
  try {
    const me = await API.auth.me();
    Auth.setUser(me.user);
    Store.set({
      notifCount: me.unreadNotifications || 0,
      myShopId: me.shopId || Store.get('myShopId'),
    });
    if (me.shopId) localStorage.setItem('kba_shop_id', me.shopId);
    Router.updateTopbar();

    // Connecter Socket.IO
    const user = Auth.getUser();
    SocketMgr.connect(user.id, user.role);

    // Charger les providers de paiement
    try {
      const providers = await API.payments.providers(user.country || 'BF');
      Store.set({ paymentProviders: providers.data || [] });
    } catch { /**/ }

  } catch { /* silencieux au démarrage */ }
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  const screen = Store.get('screen');
  if (screen === 'verify-email' || screen === 'reset-password') {
    Router.render(); return;
  }
  if (Auth.isLoggedIn() && Auth.getUser()) {
    Router.setupNav();
    Store.set({ screen: 'app' });
    Router.render();
    loadInitialData();
  }
  // Sinon, le splash démarre dans views.js
});
