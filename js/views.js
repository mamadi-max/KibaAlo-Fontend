// ═══════════════════════════════════════════════════════════
// js/views.js — Toutes les vues HTML, connectées au backend
// ═══════════════════════════════════════════════════════════

// ── Données statiques ─────────────────────────────────────
const OB_SLIDES = [
  { emoji:'🛵', title:'Livraison <em>Rapide</em>', text:'Commandez auprès de vos commerçants locaux. Un livreur proche livre en moins de 45 min.' },
  { emoji:'🏪', title:'Services <em>Divers</em>',  text:'Location d\'électronique, informatique, expédition de colis au Burkina Faso et au Niger.' },
  { emoji:'💳', title:'Paiement <em>Sécurisé</em>', text:'Orange Money, Moov Money, portefeuille KibaAlo. Rapide, sécurisé, sans contact.' },
];
const SERVICES_DATA = [
  { emoji:'💻', name:"Services Informatique",  desc:'Réparation, installation, maintenance', price:'À partir de 5 000 F' },
  { emoji:'📺', name:"Location d'Appareils",   desc:'TV, réfrigérateur, climatiseur, PC', price:'À partir de 2 000 F/j' },
  { emoji:'📦', name:"Expédition de Colis",    desc:'Toutes communes BF et Niger', price:'À partir de 3 000 F' },
  { emoji:'🛵', name:"Livraison Express",       desc:'En moins de 45 min dans votre ville', price:'À partir de 500 F' },
  { emoji:'🔧', name:"Dépannage Maison",        desc:'Plomberie, électricité, serrurerie', price:'À partir de 8 000 F' },
  { emoji:'🧹', name:"Ménage & Nettoyage",      desc:'Appartement, bureau, commerce', price:'À partir de 7 000 F' },
];
const RENTAL_ITEMS = [
  { emoji:'📺', name:'Smart TV 55"',  price:3500 }, { emoji:'🧊', name:'Réfrigérateur', price:2000 },
  { emoji:'❄️', name:'Climatiseur',   price:4500 }, { emoji:'💻', name:'PC Portable',  price:5000 },
  { emoji:'📽️', name:'Projecteur',    price:7000 }, { emoji:'🔊', name:'Sono Complète', price:8000 },
];
const CATS = [
  { id:'all', emoji:'🌟', label:'Tout' }, { id:'food', emoji:'🍔', label:'Resto' },
  { id:'grocery', emoji:'🛒', label:'Épicerie' }, { id:'pharma', emoji:'💊', label:'Pharma' },
  { id:'tech', emoji:'📱', label:'Tech' }, { id:'fashion', emoji:'👗', label:'Mode' },
  { id:'beauty', emoji:'💄', label:'Beauté' },
];

// ═══════════════════════════════════════════════════════════
const Views = {

  // ── HELPERS UI ─────────────────────────────────────────
  _spinner: () => '<div class="loading-center"><div class="spinner"></div></div>',

  _emptyState: (icon, title, text) => `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <div class="empty-title">${title}</div>
      ${text ? `<div class="empty-text">${text}</div>` : ''}
    </div>`,

  _errorState: (msg, retryFn) => `
    <div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <div class="empty-title">Erreur de chargement</div>
      <div class="empty-text">${msg}</div>
      ${retryFn ? `<button class="btn btn-secondary btn-sm mt-12" onclick="(${retryFn.toString()})()">Réessayer</button>` : ''}
    </div>`,

  // ── SPLASH ─────────────────────────────────────────────
  splashScreen() {
    const prev = document.getElementById('overlay-screen');
    if (prev) prev.remove();
    const el = document.createElement('div');
    el.id = 'overlay-screen';
    el.style.cssText = 'position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:20px;';
    el.innerHTML = `
      <div class="splash-logo">🛵</div>
      <div class="splash-title"><span>Kiba</span>Alo</div>
      <div class="splash-sub">Livraison & Services — Sahel 🌍</div>
      <div class="splash-bar"><div class="splash-progress" id="splash-prog"></div></div>
    `;
    document.getElementById('app').appendChild(el);
    let w = 0;
    const prog = el.querySelector('#splash-prog');
    const iv = setInterval(() => {
      w = Math.min(w + 1.8, 100);
      if (prog) prog.style.width = w + '%';
      if (w >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          el.style.transition = 'opacity 0.4s';
          el.style.opacity = '0';
          setTimeout(() => { el.remove(); Store.set({ screen:'onboarding' }); Router.render(); }, 400);
        }, 200);
      }
    }, 20);
  },

  // ── ONBOARDING ─────────────────────────────────────────
  onboarding() {
    const prev = document.getElementById('overlay-screen');
    if (prev) prev.remove();
    const slide = Store.get('obSlide');
    const el = document.createElement('div');
    el.id = 'overlay-screen';
    el.style.cssText = 'position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;z-index:9999;';
    el.innerHTML = `
      <div style="flex:1;overflow:hidden;">
        <div style="display:flex;transform:translateX(-${slide*100}%);transition:transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94);">
          ${OB_SLIDES.map(s => `
            <div style="min-width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 32px;gap:20px;text-align:center;">
              <span style="font-size:88px;animation:floatUp 3s ease-in-out infinite;">${s.emoji}</span>
              <h2 style="font-size:28px;font-weight:800;letter-spacing:-0.5px;line-height:1.2;">${s.title}</h2>
              <p style="color:var(--text2);font-size:15px;line-height:1.65;max-width:300px;">${s.text}</p>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="padding:24px;display:flex;flex-direction:column;gap:12px;align-items:center;">
        <div style="display:flex;gap:6px;margin-bottom:4px;">
          ${OB_SLIDES.map((_,i) => `<div style="width:${i===slide?28:8}px;height:8px;border-radius:4px;background:${i===slide?'var(--orange)':'var(--surface2)'};transition:all 0.3s;"></div>`).join('')}
        </div>
        <button class="btn btn-primary" id="ob-next" style="max-width:340px;">
          ${slide < OB_SLIDES.length-1 ? 'Suivant →' : 'Commencer 🚀'}
        </button>
        ${slide < OB_SLIDES.length-1 ? `<button class="btn btn-ghost" id="ob-skip" style="max-width:340px;">Passer</button>` : ''}
      </div>
    `;
    document.getElementById('app').appendChild(el);
    el.querySelector('#ob-next')?.addEventListener('click', () => {
      const cur = Store.get('obSlide');
      if (cur < OB_SLIDES.length-1) { Store.set({ obSlide: cur+1 }); el.remove(); Views.onboarding(); }
      else { el.remove(); Store.set({ screen:'role' }); Router.render(); }
    });
    el.querySelector('#ob-skip')?.addEventListener('click', () => {
      el.remove(); Store.set({ screen:'role' }); Router.render();
    });
  },

  // ── ROLE SELECT ────────────────────────────────────────
  roleSelect() {
    const prev = document.getElementById('overlay-screen');
    if (prev) prev.remove();
    const el = document.createElement('div');
    el.id = 'overlay-screen';
    el.style.cssText = 'position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;overflow-y:auto;z-index:9999;padding:24px;';
    el.innerHTML = `
      <div style="text-align:center;padding:32px 0 24px;">
        <div style="font-size:48px;margin-bottom:12px;">👋</div>
        <h2 style="font-size:26px;font-weight:800;letter-spacing:-0.5px;">Bienvenue sur KibaAlo</h2>
        <p style="color:var(--text2);font-size:14px;margin-top:6px;">Choisissez votre profil pour commencer</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px;flex:1;justify-content:center;">
        ${[
          { id:'client',     emoji:'👤', bg:'rgba(42,42,56,1)', title:'Client',     desc:'Commandez et recevez des produits livrés chez vous.', pill:'' },
          { id:'livreur',    emoji:'🛵', bg:'rgba(20,36,20,1)', title:'Livreur',    desc:'Effectuez des livraisons et gagnez de l\'argent.', pill:'Revenus +' },
          { id:'commercant', emoji:'🏪', bg:'rgba(36,20,20,1)', title:'Commerçant', desc:'Vendez vos produits et gérez votre boutique.', pill:'Dashboard' },
        ].map(r => `
          <div class="role-card" id="rc-${r.id}" data-role="${r.id}">
            <div class="role-card-icon" style="background:${r.bg};">${r.emoji}</div>
            <div class="role-card-info"><h3>${r.title}</h3><p>${r.desc}</p></div>
            ${r.pill ? `<div class="role-pill">${r.pill}</div>` : ''}
          </div>
        `).join('')}
      </div>
      <div style="padding-top:20px;">
        <button class="btn btn-primary" id="rc-continue" disabled style="opacity:.5;">Continuer →</button>
      </div>
    `;
    document.getElementById('app').appendChild(el);
    el.querySelectorAll('.role-card').forEach(card => {
      card.addEventListener('click', () => {
        el.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        Store.set({ selectedRole: card.dataset.role });
        const btn = el.querySelector('#rc-continue');
        const labels = { client:'Client', livreur:'Livreur', commercant:'Commerçant' };
        if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.textContent = 'Continuer comme ' + labels[card.dataset.role] + ' →'; }
      });
    });
    el.querySelector('#rc-continue')?.addEventListener('click', () => {
      if (!Store.get('selectedRole')) return;
      el.remove();
      Store.set({ screen:'auth', authMode:'register' });
      Router.render();
    });
  },

  // ── AUTH ───────────────────────────────────────────────
  authScreen() {
    const prev = document.getElementById('overlay-screen');
    if (prev) prev.remove();
    const role    = Store.get('selectedRole') || 'client';
    const mode    = Store.get('authMode');
    const isLogin = mode === 'login';
    const country = Store.get('country') || 'BF';
    const roleLabels = { client:'Client 👤', livreur:'Livreur 🛵', commercant:'Commerçant 🏪' };

    const el = document.createElement('div');
    el.id = 'overlay-screen';
    el.style.cssText = 'position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;z-index:9999;animation:slideLeft 0.3s ease;';
    el.innerHTML = `
      <div style="padding:calc(var(--safe-top)+12px) 20px 0;display:flex;align-items:center;gap:14px;flex-shrink:0;">
        <button class="back-btn" id="auth-back">←</button>
        <span class="auth-role-label" style="margin-left:auto;">${roleLabels[role]}</span>
      </div>
      <div style="flex:1;overflow-y:auto;padding:20px 20px 40px;">
        <div class="tabs" style="margin-bottom:24px;">
          <div class="tab ${isLogin?'active':''}" data-t="login">Connexion</div>
          <div class="tab ${!isLogin?'active':''}" data-t="register">Inscription</div>
        </div>
        <div style="font-size:26px;font-weight:800;letter-spacing:-0.5px;margin-bottom:4px;">
          ${isLogin ? 'Bon retour <em style="color:var(--orange);font-style:normal;">👋</em>' : 'Créer un compte <em style="color:var(--orange);font-style:normal;">' + Fmt.roleEmoji(role) + '</em>'}
        </div>
        <div style="color:var(--text2);font-size:14px;margin-bottom:24px;">${isLogin ? 'Connectez-vous à votre compte' : 'Rejoignez KibaAlo, c\'est gratuit !'}</div>
        <div id="auth-error" style="background:rgba(255,61,61,0.1);border:1px solid rgba(255,61,61,0.3);border-radius:10px;padding:12px 16px;color:var(--red);font-size:14px;margin-bottom:16px;display:none;"></div>
        <div class="field-group">
          ${!isLogin ? `
            <div class="row-2">
              <div class="field"><label>Prénom</label><input id="f-fname" type="text" placeholder="Moussa" autocomplete="given-name"/></div>
              <div class="field"><label>Nom</label><input id="f-lname" type="text" placeholder="Traoré" autocomplete="family-name"/></div>
            </div>` : ''}
          <div class="field"><label>Email *</label>
            <div class="input-wrap" style="position:relative;">
              <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:18px;color:var(--text3);">📧</span>
              <input id="f-email" type="email" placeholder="votre@email.com" autocomplete="email" style="padding-left:44px;"/>
            </div>
          </div>
          <div class="field"><label>Téléphone (optionnel)</label><input id="f-phone" type="tel" placeholder="+226 70 00 00 00" autocomplete="tel"/></div>
          ${!isLogin ? `
            <div class="row-2">
              <div class="field"><label>Pays</label>
                <select id="f-country">
                  <option value="BF" ${country==='BF'?'selected':''}>🇧🇫 Burkina Faso</option>
                  <option value="NE" ${country==='NE'?'selected':''}>🇳🇪 Niger</option>
                </select>
              </div>
              <div class="field"><label>Ville</label>
                <select id="f-city">
                  <option value="">-- Sélectionner --</option>
                  ${(CITIES[country]||CITIES.BF).map(c => `<option>${c}</option>`).join('')}
                </select>
              </div>
            </div>
            ${role === 'commercant' ? `
              <div class="field"><label>Nom de la boutique</label><input id="f-shop" placeholder="Mon Super Marché"/></div>
              <div class="field"><label>Type d'activité</label>
                <select id="f-shopcat">
                  <option value="food">🍔 Alimentation / Restaurant</option>
                  <option value="grocery">🛒 Épicerie / Supermarché</option>
                  <option value="pharma">💊 Pharmacie</option>
                  <option value="tech">📱 Électronique</option>
                  <option value="fashion">👗 Mode & Vêtements</option>
                  <option value="beauty">💄 Beauté & Cosmétiques</option>
                  <option value="other">📦 Autre</option>
                </select>
              </div>` : ''}
            ${role === 'livreur' ? `
              <div class="field"><label>Type de véhicule</label>
                <select id="f-vehicle">
                  <option value="moto">🛵 Moto</option>
                  <option value="velo">🚲 Vélo</option>
                  <option value="voiture">🚗 Voiture</option>
                  <option value="pied">🚶 À pied</option>
                </select>
              </div>` : ''}
          ` : ''}
          <div class="field"><label>Mot de passe</label><input id="f-pwd" type="password" placeholder="••••••••" autocomplete="${isLogin?'current-password':'new-password'}"/></div>
          ${!isLogin ? `<div class="field"><label>Confirmer le mot de passe</label><input id="f-pwd2" type="password" placeholder="••••••••" autocomplete="new-password"/></div>` : ''}
        </div>
        <button class="btn btn-primary" id="auth-submit" style="margin-top:24px;">
          ${isLogin ? 'Se connecter →' : 'Créer mon compte →'}
        </button>
        <div class="divider" style="margin:20px 0;">ou</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <button class="btn btn-secondary" style="font-size:13px;" onclick="Toast.show('📱 Mobile Money — Bientôt')">📱 Mobile Money</button>
          <button class="btn btn-secondary" style="font-size:13px;" onclick="Toast.show('📩 SMS — Bientôt')">📩 Code SMS</button>
        </div>
        <p style="text-align:center;color:var(--text2);font-size:14px;margin-top:16px;">
          ${isLogin
            ? `Pas de compte ? <span style="color:var(--orange);font-weight:700;cursor:pointer;" id="auth-switch">S'inscrire</span>`
            : `Déjà un compte ? <span style="color:var(--orange);font-weight:700;cursor:pointer;" id="auth-switch">Se connecter</span>`}
        </p>
      </div>
    `;
    document.getElementById('app').appendChild(el);

    // Événements
    el.querySelector('#auth-back')?.addEventListener('click', () => {
      el.remove(); Store.set({ screen:'role' }); Router.render();
    });
    el.querySelector('#auth-switch')?.addEventListener('click', () => {
      el.remove(); Store.set({ authMode: isLogin ? 'register' : 'login' }); Views.authScreen();
    });
    el.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
      el.remove(); Store.set({ authMode: t.dataset.t }); Views.authScreen();
    }));
    el.querySelector('#f-country')?.addEventListener('change', e => {
      Store.set({ country: e.target.value });
      const cityEl = el.querySelector('#f-city');
      if (cityEl) cityEl.innerHTML = '<option value="">-- Sélectionner --</option>' + (CITIES[e.target.value]||CITIES.BF).map(c=>`<option>${c}</option>`).join('');
    });
    el.querySelector('#auth-submit')?.addEventListener('click', () => Views._submitAuth(role, isLogin, el));
  },

  async _submitAuth(role, isLogin, el) {
    const errEl = el.querySelector('#auth-error');
    const btn   = el.querySelector('#auth-submit');
    const showErr = msg => { errEl.textContent = msg; errEl.style.display = 'block'; errEl.scrollIntoView({ behavior:'smooth', block:'center' }); };
    errEl.style.display = 'none';

    const email = el.querySelector('#f-email')?.value?.trim() || el.querySelector('#f-phone')?.value?.trim();
    const pwd   = el.querySelector('#f-pwd')?.value;
    if (!email) { showErr('⚠️ Email requis'); return; }
    if (!pwd)   { showErr('⚠️ Mot de passe requis'); return; }

    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      let res;
      if (isLogin) {
        res = await API.auth.login({ email, password: pwd });
      } else {
        const fname   = el.querySelector('#f-fname')?.value?.trim() || '';
        const lname   = el.querySelector('#f-lname')?.value?.trim() || '';
        const country = el.querySelector('#f-country')?.value || 'BF';
        const city    = el.querySelector('#f-city')?.value || '';
        const pwd2    = el.querySelector('#f-pwd2')?.value || '';
        if (!fname || !lname) { showErr('⚠️ Prénom et nom requis'); return; }
        if (!city)   { showErr('⚠️ Veuillez sélectionner une ville'); return; }
        if (pwd.length < 6) { showErr('⚠️ Mot de passe : minimum 6 caractères'); return; }
        if (pwd !== pwd2)   { showErr('⚠️ Les mots de passe ne correspondent pas'); return; }
        const payload = { email, phone, firstName:fname, lastName:lname, password:pwd, role, country, city };
        if (role === 'commercant') {
          payload.shopName     = el.querySelector('#f-shop')?.value?.trim();
          payload.shopCategory = el.querySelector('#f-shopcat')?.value || 'other';
        }
        if (role === 'livreur') payload.vehicleType = el.querySelector('#f-vehicle')?.value || 'moto';
        res = await API.auth.register(payload);
      }
      Auth.setToken(res.token);
      Auth.setUser(res.user);
      el.remove();
      Router.setupNav();
      Store.set({ screen:'app', activeTab:'home' });
      Router.render();
      await loadInitialData();
      Toast.show('🎉 Bienvenue ' + res.user.firstName + ' !');
    } catch (err) {
      showErr('❌ ' + err.message);
    } finally {
      btn.classList.remove('btn-loading'); btn.disabled = false;
    }
  },

  // ══════════════════════════════════════════════════════
  // PAGES CLIENT
  // ══════════════════════════════════════════════════════

  homePage() {
    const { activeCategory, shopsLoading } = Store.get();
    return `
      <div style="padding-top:16px;padding-bottom:20px;">
        <div class="section">
          <div class="banner">
            <h3>Livraison en<br/>30 min 🔥</h3>
            <p>Commandez maintenant et<br/>recevez en un temps record !</p>
            <button class="banner-btn" onclick="Router.navigate('services')">Voir les services →</button>
          </div>
        </div>
        <div class="section mt-20">
          <div class="section-hd"><span class="section-title">Catégories</span></div>
          <div class="cat-row">
            ${CATS.map(c => `
              <div class="cat-item ${activeCategory===c.id?'active':''}" data-action="set-category" data-cat="${c.id}">
                <div class="cat-icon">${c.emoji}</div>
                <span class="cat-label">${c.label}</span>
              </div>`).join('')}
          </div>
        </div>
        <div class="section mt-20">
          <div class="section-hd"><span class="section-title">Boutiques</span><span class="section-link" onclick="Toast.show('🔍 Toutes les boutiques')">Voir tout</span></div>
          <div id="shop-list-container">
            ${shopsLoading ? this._spinner() : this._shopListHtml(Store.get('shops'))}
          </div>
        </div>
        <div class="section mt-20">
          <div class="section-hd"><span class="section-title">Produits du moment</span><span class="section-link">Voir tout</span></div>
          <div id="product-grid-container" class="product-grid">
            ${this._productGridHtml(Store.get('shops'))}
          </div>
        </div>
        <div class="section mt-20">
          <div style="background:linear-gradient(135deg,rgba(255,184,0,0.08),rgba(255,107,0,0.08));border:1.5px solid rgba(255,184,0,0.25);border-radius:var(--radius);padding:20px;cursor:pointer;" data-action="go-premium">
            <div style="font-size:28px;margin-bottom:8px;">👑</div>
            <div class="font-800" style="font-size:16px;">Passez Premium</div>
            <div class="text-muted text-sm mt-8">Livraison gratuite illimitée, cashback 5%, priorité de livraison...</div>
            <button class="btn btn-outline btn-sm mt-12" style="width:auto;pointer-events:none;">Voir les offres →</button>
          </div>
        </div>
      </div>`;
  },

  _shopListHtml(shops) {
    if (!shops || shops.length === 0) return '<div class="shop-cards">' + this._emptyState('🏪','Aucune boutique disponible','Revenez bientôt !') + '</div>';
    return '<div class="shop-cards">' + shops.map(s => this._shopCard(s)).join('') + '</div>';
  },

  _shopCard(s) {
    const fee = s.delivery_fee ?? s.deliveryFee ?? 500;
    return `
      <div class="shop-card" data-action="open-shop" data-id="${s.id}">
        <div class="shop-thumb">
          <span style="font-size:44px;">${s.emoji || s.logo_url || '🏪'}</span>
          ${s.badge ? `<div class="shop-thumb-badge"><span class="badge badge-orange">${s.badge}</span></div>` : ''}
        </div>
        <div class="shop-body">
          <div class="shop-name">${s.name}</div>
          <div class="shop-meta">
            <span><span class="star-icon">⭐</span> ${s.rating || '4.5'}</span>
            <span>🕐 ${s.time || s.estimated_time || '~30 min'}</span>
            <span class="${fee===0?'free':''}">${fee===0?'✓ Gratuit':Fmt.moneyShort(fee)}</span>
          </div>
        </div>
      </div>`;
  },

  _productGridHtml(shops) {
    const products = (shops||[]).flatMap(s =>
      (s.products || []).slice(0, 2).map(p => ({ ...p, shopName: s.name, shopId: s.id }))
    ).slice(0, 6);
    if (products.length === 0) return this._emptyState('📦','','');
    return products.map(p => this._productCard(p)).join('');
  },

  _productCard(p) {
    const isFav = JSON.parse(localStorage.getItem('kba_favs')||'[]').includes(p.id);
    return `
      <div class="product-card">
        <div class="product-thumb">
          <span style="font-size:52px;">${p.emoji || p.image_url || '📦'}</span>
          <div class="product-fav" data-action="toggle-fav" data-id="${p.id}">${isFav?'❤️':'🤍'}</div>
        </div>
        <div class="product-body">
          <div class="product-name">${p.name}</div>
          <div class="product-shop">${p.shopName || ''}</div>
          <div class="product-foot">
            <div class="product-price">${Fmt.moneyShort(p.price)}</div>
            <button class="add-btn" data-action="add-to-cart"
              data-id="${p.id}" data-name="${p.name}" data-price="${p.price}"
              data-emoji="${p.emoji||'📦'}" data-shopname="${p.shopName||''}" data-shopid="${p.shopId||p.shop_id||''}">+</button>
          </div>
        </div>
      </div>`;
  },

  servicesPage() {
    return `
      <div style="padding:20px 0;">
        <div class="section">
          <div class="section-hd"><span class="section-title">Nos Services</span></div>
          <div class="service-grid">
            ${SERVICES_DATA.map(s => `
              <div class="service-card" data-action="open-service" data-name="${s.name}">
                <div class="service-emoji">${s.emoji}</div>
                <div class="service-name">${s.name}</div>
                <div class="service-desc">${s.desc}</div>
                <div class="service-price">${s.price}</div>
              </div>`).join('')}
          </div>
        </div>
        <div class="section mt-20">
          <div class="section-hd"><span class="section-title">💻 Location d'Appareils</span></div>
          <div class="shop-cards">
            ${RENTAL_ITEMS.map(d => `
              <div class="shop-card" style="width:148px;cursor:pointer;" data-action="open-rental" data-name="${d.name}" data-price="${d.price}">
                <div class="shop-thumb" style="height:90px;font-size:48px;">${d.emoji}</div>
                <div class="shop-body">
                  <div class="shop-name" style="font-size:13px;">${d.name}</div>
                  <div class="text-orange font-700 mt-8" style="font-size:13px;">${Fmt.moneyShort(d.price)}/j</div>
                </div>
              </div>`).join('')}
          </div>
        </div>
        <div class="section mt-20" style="padding-bottom:20px;">
          <div class="section-hd"><span class="section-title">📦 Expédition de Colis</span></div>
          <div class="card card-pad">
            <p class="text-muted text-sm" style="margin-bottom:16px;">Expédiez dans toutes les communes du Burkina Faso et du Niger via nos partenaires de transport agréés par le gouvernement.</p>
            <div class="field" style="margin-bottom:12px;"><label>Ville de départ</label>
              <select id="svc-origin">
                <optgroup label="🇧🇫 Burkina Faso">${CITIES.BF.map(c=>`<option value="BF:${c}">🇧🇫 ${c}</option>`).join('')}</optgroup>
                <optgroup label="🇳🇪 Niger">${CITIES.NE.map(c=>`<option value="NE:${c}">🇳🇪 ${c}</option>`).join('')}</optgroup>
              </select>
            </div>
            <div class="field" style="margin-bottom:16px;"><label>Ville de destination</label>
              <select id="svc-dest">
                <optgroup label="🇧🇫 Burkina Faso">${CITIES.BF.map(c=>`<option value="BF:${c}">🇧🇫 ${c}</option>`).join('')}</optgroup>
                <optgroup label="🇳🇪 Niger">${CITIES.NE.map(c=>`<option value="NE:${c}">🇳🇪 ${c}</option>`).join('')}</optgroup>
              </select>
            </div>
            <button class="btn btn-primary" onclick="Modal.open('parcel')">Estimer le tarif & Expédier →</button>
          </div>
        </div>
      </div>`;
  },

  cartPage() {
    const cart = Store.get('cart');
    if (!cart.length) return `
      <div class="empty-state" style="height:80vh;justify-content:center;">
        <div class="empty-icon">🛒</div>
        <div class="empty-title">Votre panier est vide</div>
        <div class="empty-text">Explorez les boutiques et ajoutez des produits.</div>
        <button class="btn btn-primary" style="width:auto;margin-top:12px;" onclick="Router.navigate('home')">Découvrir les boutiques →</button>
      </div>`;
    const subtotal = Store.cartTotal();
    const delivery = 500;
    const total    = subtotal + delivery;
    const payMode  = Store.get('payMode');
    return `
      <div style="padding:20px;display:flex;flex-direction:column;gap:16px;">
        <div class="flex justify-between items-center">
          <div class="section-title">Mon Panier</div>
          <span class="badge badge-orange">${Store.cartCount()} article${Store.cartCount()>1?'s':''}</span>
        </div>
        <div class="cart-list">
          ${cart.map(item => `
            <div class="cart-row-item">
              <div class="cart-item-img">${item.emoji||'📦'}</div>
              <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-shop">${item.shopName||''}</div>
                <div class="cart-item-price">${Fmt.moneyShort(item.price)}</div>
              </div>
              <div class="qty-ctrl">
                <div class="qty-btn" data-action="remove-from-cart" data-id="${item.id}">−</div>
                <div class="qty-num">${item.qty}</div>
                <div class="qty-btn" data-action="add-to-cart"
                  data-id="${item.id}" data-name="${item.name}" data-price="${item.price}"
                  data-emoji="${item.emoji||'📦'}" data-shopname="${item.shopName||''}">+</div>
              </div>
            </div>`).join('')}
        </div>
        <div class="field">
          <label>Adresse de livraison</label>
          <input id="cart-addr" type="text" placeholder="Secteur, quartier, point de repère..." autocomplete="street-address"/>
        </div>
        <div>
          <div class="font-700 text-sm" style="margin-bottom:10px;">Mode de paiement</div>
          <div class="chips">
            ${[['wallet','👛 Portefeuille'],['orange','🟠 Orange Money'],['moov','💛 Moov Money']].map(([k,l])=>
              `<div class="chip ${payMode===k?'active':''}" onclick="Store.set({payMode:'${k}'});Router.renderPage();">${l}</div>`).join('')}
          </div>
        </div>
        <div class="cart-summary-box">
          <div class="cart-summary-row"><span>Sous-total</span><span>${Fmt.moneyShort(subtotal)}</span></div>
          <div class="cart-summary-row"><span>Livraison</span><span>${Fmt.moneyShort(delivery)}</span></div>
          <div class="cart-summary-row total"><span>Total à payer</span><span>${Fmt.moneyShort(total)}</span></div>
        </div>
        <button class="btn btn-primary" id="checkout-btn" onclick="Views._checkout()">
          Payer ${Fmt.moneyShort(total)} →
        </button>
      </div>`;
  },

  async _checkout() {
    const btn  = document.getElementById('checkout-btn');
    const addr = document.getElementById('cart-addr')?.value?.trim();
    const cart  = Store.get('cart');
    if (!addr) { Toast.show('⚠️ Entrez votre adresse de livraison'); return; }
    if (!cart.length) return;
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      // Grouper les articles par boutique
      const byShop = {};
      cart.forEach(item => {
        const sid = item.shopId || 's1';
        if (!byShop[sid]) byShop[sid] = [];
        byShop[sid].push({ productId: item.id, qty: item.qty });
      });
      const shopId = Object.keys(byShop)[0];
      const res = await API.orders.create({
        shopId,
        items:           byShop[shopId],
        deliveryAddress: addr,
        deliveryCity:    Auth.getUser()?.city || '',
        paymentMethod:   Store.get('payMode'),
      });
      Store.clearCart();
      Toast.show('✅ Commande #' + res.data.order_number + ' passée !');
      Router.navigate('orders');
    } catch (err) {
      Toast.show('❌ ' + err.message);
    } finally {
      btn && btn.classList.remove('btn-loading');
      btn && (btn.disabled = false);
    }
  },

  ordersPage() {
    return `
      <div style="padding:20px;">
        <div class="section-title" style="margin-bottom:16px;">Mes Commandes</div>
        <div id="orders-container">${this._spinner()}</div>
      </div>`;
  },

  _orderCard(o) {
    const steps = ['pending','confirmed','preparing','in_route','delivered'];
    const idx   = Math.max(0, steps.indexOf(o.status));
    const lbls  = ['Confirmé','Préparé','En route','Livré'];
    return `
      <div style="background:var(--surface);border-radius:var(--radius);padding:16px;margin-bottom:12px;border:1px solid var(--border2);">
        <div class="flex justify-between items-center" style="margin-bottom:10px;">
          <div>
            <div class="font-700" style="font-size:15px;">${o.shops?.name || 'Boutique'}</div>
            <div class="text-muted text-xs mt-8">${Fmt.relative(o.created_at)}</div>
          </div>
          <span class="badge ${Fmt.statusClass(o.status)}">${Fmt.statusLabel(o.status)}</span>
        </div>
        <div class="steps-row" style="margin:12px 0;">
          ${lbls.map((lbl,i) => `
            <div class="step">
              <div class="step-dot ${i<idx?'done':i===idx?'active':'wait'}">${i<idx?'✓':i+1}</div>
              <div class="step-lbl ${i<idx?'done':i===idx?'active':''}">${lbl}</div>
            </div>
            ${i<lbls.length-1?`<div class="step-line ${i<idx?'done':''}"></div>`:''}`).join('')}
        </div>
        <div class="flex justify-between items-center">
          <span class="text-muted text-xs" style="font-family:var(--mono);">${o.order_number}</span>
          <span class="text-orange font-800">${Fmt.moneyShort(o.total)}</span>
        </div>
        ${o.status==='in_route'?`
          <button class="btn btn-secondary btn-sm" style="margin-top:10px;width:auto;" data-action="track-order" data-id="${o.id}">
            🗺️ Suivre en temps réel
          </button>`:
        o.status==='delivered'?`
          <button class="btn btn-ghost btn-sm" style="margin-top:8px;width:auto;" data-action="review-order" data-id="${o.id}">
            ⭐ Donner un avis
          </button>`:''
        }
      </div>`;
  },

  profilePage() {
    const user      = Auth.getUser() || {};
    const isPremium = Auth.isPremium();
    return `
      <div>
        <div class="profile-hd">
          <div class="avatar avatar-xl avatar-orange">${Fmt.initials(user)}</div>
          <div class="profile-name">${user.firstName||''} ${user.lastName||''}</div>
          <div class="profile-role-badge">${Fmt.roleEmoji(user.role)} ${Fmt.roleLabel(user.role)}</div>
          ${isPremium?'<span class="badge badge-amber">👑 Premium actif</span>':''}
        </div>
        <div style="padding:0 20px 12px;">
          <div class="card card-pad" style="display:flex;justify-content:space-around;text-align:center;">
            <div><div class="font-800" style="font-size:18px;">${Store.cartCount()}</div><div class="text-muted text-xs">Panier</div></div>
            <div><div class="font-800" style="font-size:18px;">${Store.get('orders').length||'—'}</div><div class="text-muted text-xs">Commandes</div></div>
            <div><div class="font-800 text-orange" style="font-size:14px;" data-wallet-balance>${Store.get('wallet')?Fmt.moneyShort(Store.get('wallet').balance):'—'}</div><div class="text-muted text-xs">Solde</div></div>
          </div>
        </div>
        <div style="padding:0 20px;display:flex;flex-direction:column;gap:8px;">
          ${[
            { ic:'👛', bg:'rgba(255,107,0,0.1)', lbl:'Mon Portefeuille',    fn:"Modal.open('wallet')" },
            { ic:'🔔', bg:'rgba(107,104,112,0.1)',lbl:'Notifications',       fn:"Modal.open('notifications')" },
            { ic:'📦', bg:'rgba(0,200,83,0.1)',   lbl:'Mes Colis',          fn:"Modal.open('myColis')" },
            { ic:'👑', bg:'rgba(255,184,0,0.1)',  lbl:'Abonnement Premium '+(isPremium?'✓':''),fn:"Modal.open('premium')" },
            { ic:'✏️', bg:'rgba(42,130,255,0.1)', lbl:'Modifier mon profil', fn:"Modal.open('editProfile')" },
            { ic:'🌍', bg:'rgba(107,104,112,0.1)',lbl:'Langue & Région',    fn:"Toast.show('🌍 Bientôt disponible')" },
            { ic:'🚪', bg:'rgba(255,61,61,0.1)',  lbl:'Déconnexion',        fn:"Views._logout()" },
          ].map(s=>`
            <div class="settings-item" onclick="${s.fn}">
              <div class="settings-ic" style="background:${s.bg};">${s.ic}</div>
              <div class="settings-lbl">${s.lbl}</div>
              <div class="settings-arr">›</div>
            </div>`).join('')}
        </div>
        <div style="text-align:center;color:var(--text3);font-size:11px;padding:24px;">
          KibaAlo v1.0.0 — 🇧🇫 Burkina Faso & 🇳🇪 Niger
        </div>
      </div>`;
  },

  _logout() {
    Auth.logout();
    Store.clearCart();
    Store.set({ screen:'role', selectedRole:null, activeTab:'home', orders:[], wallet:null });
    SocketMgr.disconnect();
    Router.render();
    Toast.show('👋 Déconnecté avec succès');
  },

  // ══════════════════════════════════════════════════════
  // PAGES COMMERÇANT
  // ══════════════════════════════════════════════════════

  dashboard() {
    return `
      <div style="padding:20px;">
        <div class="section-title" style="margin-bottom:16px;">Tableau de bord</div>
        <div id="dashboard-container">${this._spinner()}</div>
      </div>`;
  },

  _dashboardContent(data) {
    if (!data) return this._emptyState('📊','Aucune donnée','Vos statistiques apparaîtront ici.');
    const { monthRevenue=0, monthOrders=0, todayOrders=0, pendingOrders=[], deliveredOrders=0 } = data;
    return `
      <div class="stats-grid" style="margin-bottom:16px;">
        <div class="stat-card"><div class="stat-lbl">Revenus du mois</div><div class="stat-val" style="font-size:16px;">${Fmt.moneyShort(monthRevenue)}</div></div>
        <div class="stat-card"><div class="stat-lbl">Commandes</div><div class="stat-val">${monthOrders}</div></div>
        <div class="stat-card"><div class="stat-lbl">Aujourd'hui</div><div class="stat-val">${todayOrders}</div></div>
        <div class="stat-card"><div class="stat-lbl">Livrées</div><div class="stat-val text-green">${deliveredOrders}</div></div>
      </div>
      <div style="font-weight:700;margin-bottom:12px;">Commandes en attente (${pendingOrders.length})</div>
      ${pendingOrders.length === 0
        ? '<p class="text-muted text-sm">Aucune commande en attente</p>'
        : pendingOrders.map(o => this._merchantOrderCard(o)).join('')}`;
  },

  products() {
    return `
      <div style="padding:20px;">
        <div class="flex justify-between items-center" style="margin-bottom:16px;">
          <span class="section-title">Mes Produits</span>
          <button class="btn btn-primary btn-sm" onclick="Modal.open('addProduct')">+ Ajouter</button>
        </div>
        <div id="products-container">${this._spinner()}</div>
      </div>`;
  },

  _productListAdmin(products, shopId) {
    return products.map(p => `
      <div style="background:var(--surface);border-radius:var(--radius-sm);padding:14px;display:flex;align-items:center;gap:12px;border:1px solid var(--border2);margin-bottom:10px;">
        <span style="font-size:36px;flex-shrink:0;">${p.emoji||'📦'}</span>
        <div style="flex:1;min-width:0;">
          <div class="font-700" style="font-size:14px;">${p.name}</div>
          <div class="text-orange font-700 mt-8">${Fmt.moneyShort(p.price)}</div>
          <div class="text-muted text-xs mt-8">${p.is_available ? '✅ Disponible' : '❌ Indisponible'}</div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-secondary btn-xs" data-action="delete-product" data-id="${p.id}" data-shopid="${shopId}">🗑️</button>
        </div>
      </div>`).join('');
  },

  merchantOrders() {
    return `
      <div style="padding:20px;">
        <div class="section-title" style="margin-bottom:16px;">Commandes reçues</div>
        <div id="merchant-orders-container">${this._spinner()}</div>
      </div>`;
  },

  _merchantOrderCard(o) {
    const client = o.users || o['users!client_id'];
    const clientName = client ? (client.first_name + ' ' + client.last_name) : 'Client';
    const items  = Array.isArray(o.items) ? o.items.map(i => i.name + ' x' + i.qty).join(', ') : '—';
    return `
      <div style="background:var(--surface);border-radius:var(--radius-sm);padding:16px;margin-bottom:10px;border:1px solid var(--border2);">
        <div class="flex justify-between items-center" style="margin-bottom:8px;">
          <div>
            <div class="font-700">${clientName}</div>
            <div class="text-muted text-xs mt-8">${items.substring(0,60)}${items.length>60?'...':''}</div>
          </div>
          <span class="badge ${Fmt.statusClass(o.status)}">${Fmt.statusLabel(o.status)}</span>
        </div>
        <div class="flex justify-between items-center" style="margin-bottom:12px;">
          <span class="text-muted text-xs">${Fmt.relative(o.created_at)}</span>
          <span class="font-800 text-orange">${Fmt.moneyShort(o.total)}</span>
        </div>
        ${o.status === 'pending' ? `
          <div style="display:flex;gap:10px;">
            <button class="btn btn-primary btn-sm" data-action="confirm-order" data-id="${o.id}">✅ Confirmer</button>
            <button class="btn btn-secondary btn-sm" data-action="reject-order" data-id="${o.id}">Refuser</button>
          </div>` :
        o.status === 'confirmed' ? `
          <button class="btn btn-secondary btn-sm" data-action="mark-ready" data-id="${o.id}">📦 Marquer comme prêt</button>
        ` : ''}
      </div>`;
  },

  walletPage() {
    const w = Store.get('wallet');
    return `
      <div>
        <div style="padding:20px;">
          <div class="wallet-card">
            <div class="wallet-lbl">Solde disponible</div>
            <div class="wallet-amount" data-wallet-balance>${w ? Fmt.money(w.balance) : '—'}</div>
            <div class="wallet-actions">
              ${[['💸','Retirer',"Modal.open('withdraw')"],['➕','Recharger',"Modal.open('recharge')"],['↔️','Transférer',"Toast.show('↔️ Bientôt')"],['📊','Rapport',"Toast.show('📊 Bientôt')"]].map(([ic,lbl,fn])=>`
                <button class="wallet-action" onclick="${fn}">
                  <span class="wallet-action-ic">${ic}</span>
                  <span class="wallet-action-lbl">${lbl}</span>
                </button>`).join('')}
            </div>
          </div>
        </div>
        <div style="padding:0 20px;">
          <div class="section-title" style="margin-bottom:12px;">Historique</div>
          <div id="txn-container">${this._spinner()}</div>
        </div>
      </div>`;
  },

  _transactionList(txns) {
    if (!txns || !txns.length) return this._emptyState('💳','Aucune transaction','Vos transactions apparaîtront ici.');
    return txns.map(t => `
      <div class="txn-item" style="margin-bottom:8px;">
        <div class="txn-icon" style="background:${t.type==='credit'?'rgba(0,200,83,0.12)':'rgba(255,61,61,0.12);'}">
          ${t.type==='credit'?'⬆️':'⬇️'}
        </div>
        <div class="txn-info">
          <div class="txn-name">${t.description||t.type}</div>
          <div class="txn-date">${Fmt.relative(t.created_at)}</div>
        </div>
        <div class="txn-amount ${t.type==='credit'?'credit':'debit'}">
          ${t.type==='credit'?'+':'−'}${Fmt.moneyShort(t.amount)}
        </div>
      </div>`).join('');
  },

  // ══════════════════════════════════════════════════════
  // PAGES LIVREUR
  // ══════════════════════════════════════════════════════

  livreurHome() {
    return `
      <div style="padding:20px;display:flex;flex-direction:column;gap:16px;">
        <div class="card card-pad flex justify-between items-center">
          <div>
            <div class="text-muted text-xs" style="text-transform:uppercase;letter-spacing:.5px;">Statut</div>
            <div class="font-700" style="font-size:16px;margin-top:6px;" id="livreur-status-lbl">🟢 Disponible</div>
          </div>
          <button class="btn btn-green btn-sm" id="toggle-avail-btn" onclick="Views._toggleAvail()">Actif</button>
        </div>
        <div id="delivery-request-container">
          <div class="delivery-request">
            <div class="flex justify-between items-center" style="margin-bottom:10px;">
              <div class="font-700">🆕 Nouvelle demande</div>
              <span class="badge badge-orange">0.8 km</span>
            </div>
            <div class="text-muted text-sm" style="margin-bottom:6px;">📍 Resto Wend-Zoodo → Secteur 15</div>
            <div style="display:flex;gap:8px;font-size:12px;color:var(--text2);margin-bottom:14px;">
              <span>📦 3 articles</span><span>•</span><span>💰 1 200 F</span><span>•</span><span>🕐 ~20 min</span>
            </div>
            <div style="display:flex;gap:10px;">
              <button class="btn btn-primary" style="flex:2;" onclick="Views._acceptDemoDelivery()">✅ Accepter</button>
              <button class="btn btn-secondary" style="flex:1;" onclick="document.getElementById('delivery-request-container').innerHTML=''">Refuser</button>
            </div>
          </div>
        </div>
        <div class="section-title">Statistiques du jour</div>
        <div id="livreur-stats-container">
          <div class="stats-grid">
            <div class="stat-card"><div class="stat-lbl">Courses</div><div class="stat-val">—</div></div>
            <div class="stat-card"><div class="stat-lbl">Km</div><div class="stat-val">—</div></div>
            <div class="stat-card"><div class="stat-lbl">Gains</div><div class="stat-val">—</div></div>
            <div class="stat-card"><div class="stat-lbl">Note</div><div class="stat-val">—</div></div>
          </div>
        </div>
      </div>`;
  },

  _livreurStats(data) {
    if (!data) return '';
    return `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-lbl">Courses</div><div class="stat-val">🛵 ${data.todayDeliveries||0}</div></div>
        <div class="stat-card"><div class="stat-lbl">Gains/jour</div><div class="stat-val" style="font-size:16px;">${Fmt.moneyShort(data.todayEarnings||0)}</div></div>
        <div class="stat-card"><div class="stat-lbl">Gains/mois</div><div class="stat-val" style="font-size:14px;">${Fmt.moneyShort(data.monthEarnings||0)}</div></div>
        <div class="stat-card"><div class="stat-lbl">Solde</div><div class="stat-val text-orange" style="font-size:14px;">${Fmt.moneyShort(data.walletBalance||0)}</div></div>
      </div>`;
  },

  _toggleAvail() {
    const btn    = document.getElementById('toggle-avail-btn');
    const lbl    = document.getElementById('livreur-status-lbl');
    const isOn   = btn && btn.textContent.trim() === 'Actif';
    if (btn) { btn.textContent = isOn ? 'Inactif' : 'Actif'; btn.className = 'btn btn-sm ' + (isOn ? 'btn-secondary' : 'btn-green'); }
    if (lbl) { lbl.textContent = isOn ? '🔴 Indisponible' : '🟢 Disponible'; }
    API.livreurs.setAvailability(!isOn).catch(() => {});
    Toast.show(isOn ? '🔴 Vous êtes indisponible' : '🟢 Vous êtes disponible');
  },

  _acceptDemoDelivery() {
    document.getElementById('delivery-request-container').innerHTML = '';
    Toast.show('✅ Course acceptée ! Démarrage GPS...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        API.livreurs.sendLocation(pos.coords.latitude, pos.coords.longitude).catch(() => {});
      });
    }
  },

  livreurCourses() {
    return `
      <div style="padding:20px;">
        <div class="section-title" style="margin-bottom:16px;">Mes Courses</div>
        <div id="courses-container">${this._spinner()}</div>
      </div>`;
  },

  _courseCard(o) {
    const shop   = o.shops || {};
    const client = o.users || o['users!client_id'] || {};
    return `
      <div class="order-item" style="margin-bottom:10px;">
        <div class="order-thumb">🛵</div>
        <div class="order-info">
          <div class="order-customer">${shop.name || 'Boutique'}</div>
          <div class="order-detail">→ ${o.delivery_address || o.delivery_city || '—'}</div>
        </div>
        <div class="order-right">
          <div class="order-amount">${Fmt.moneyShort(o.delivery_fee||500)}</div>
          <span class="badge ${Fmt.statusClass(o.status)} mt-8">${Fmt.statusLabel(o.status)}</span>
        </div>
      </div>`;
  },

  livreurEarnings() {
    const e = Store.get('earnings');
    return `
      <div>
        <div style="padding:20px;">
          <div class="wallet-card">
            <div class="wallet-lbl">Gains ce mois</div>
            <div class="wallet-amount" data-wallet-balance>${e ? Fmt.money(e.monthEarnings||0) : '—'}</div>
            <div style="display:flex;gap:10px;margin-top:20px;position:relative;z-index:1;">
              <button class="wallet-action" onclick="Modal.open('withdraw')"><span class="wallet-action-ic">💸</span><span class="wallet-action-lbl">Retirer</span></button>
              <button class="wallet-action" onclick="Toast.show('📊 Rapport bientôt')"><span class="wallet-action-ic">📊</span><span class="wallet-action-lbl">Rapport</span></button>
            </div>
          </div>
        </div>
        <div style="padding:0 20px;">
          <div class="section-title" style="margin-bottom:12px;">Détail des gains</div>
          <div id="earnings-container">${this._spinner()}</div>
        </div>
      </div>`;
  },

  _earningsHistory(data) {
    if (!data) return this._emptyState('💰','Aucune donnée','');
    return `
      <div class="stats-grid" style="margin-bottom:16px;">
        <div class="stat-card"><div class="stat-lbl">Aujourd'hui</div><div class="stat-val">${data.todayDeliveries||0} <span style="font-size:12px;">courses</span></div><div class="stat-change up">+${Fmt.moneyShort(data.todayEarnings||0)}</div></div>
        <div class="stat-card"><div class="stat-lbl">Ce mois</div><div class="stat-val">${data.monthDeliveries||0} <span style="font-size:12px;">courses</span></div><div class="stat-change up">+${Fmt.moneyShort(data.monthEarnings||0)}</div></div>
      </div>
      <div class="txn-item" style="margin-bottom:8px;">
        <div class="txn-icon" style="background:rgba(0,200,83,0.12);">💰</div>
        <div class="txn-info"><div class="txn-name">Solde portefeuille</div><div class="txn-date">Disponible au retrait</div></div>
        <div class="txn-amount credit">${Fmt.moneyShort(data.walletBalance||0)}</div>
      </div>`;
  },

  // ══════════════════════════════════════════════════════
  // MODALES
  // ══════════════════════════════════════════════════════

  modal(name, data) {
    const map = {
      shop:          () => this._modalShop(data),
      tracking:      () => this._modalTracking(data),
      wallet:        () => this._modalWallet(),
      recharge:      () => this._modalRecharge(),
      withdraw:      () => this._modalWithdraw(),
      parcel:        () => this._modalParcel(),
      rental:        () => this._modalRental(data),
      premium:       () => this._modalPremium(),
      addProduct:    () => this._modalAddProduct(),
      review:        () => this._modalReview(data),
      notifications: () => this._modalNotifications(),
      myColis:       () => this._modalMyColis(),
      editProfile:   () => this._modalEditProfile(),
    };
    const fn = map[name];
    return fn ? '<div class="modal-handle"></div>' + fn() : '';
  },

  _modalShop(data) {
    if (!data || !data.id) return this._spinner();
    // Si on n'a que l'id, afficher un spinner pendant le chargement (DataLoader le mettra à jour)
    if (!data.name) return this._spinner();
    const products = data.products || [];
    return `
      <div style="text-align:center;margin-bottom:16px;font-size:56px;">${data.emoji||'🏪'}</div>
      <div class="modal-title" style="text-align:center;">${data.name}</div>
      <div style="display:flex;justify-content:space-around;color:var(--text2);font-size:13px;margin-bottom:20px;">
        <span>⭐ ${data.rating||'4.5'}</span>
        <span>🕐 ${data.time||'~30 min'}</span>
        <span>${(data.delivery_fee||0)===0?'✓ Gratuit':Fmt.moneyShort(data.delivery_fee||500)}</span>
      </div>
      ${products.length === 0
        ? '<p class="text-muted text-sm" style="text-align:center;padding:20px;">Aucun produit disponible</p>'
        : products.map(p => `
          <div style="background:var(--surface);border-radius:var(--radius-sm);padding:14px;margin-bottom:10px;border:1px solid var(--border2);display:flex;align-items:center;gap:12px;">
            <span style="font-size:36px;flex-shrink:0;">${p.emoji||'📦'}</span>
            <div style="flex:1;"><div class="font-700" style="font-size:14px;">${p.name}</div><div class="text-orange font-700 mt-8">${Fmt.moneyShort(p.price)}</div></div>
            <button class="btn btn-primary btn-sm"
              data-action="add-to-cart"
              data-id="${p.id}" data-name="${p.name}" data-price="${p.price}"
              data-emoji="${p.emoji||'📦'}" data-shopname="${data.name}" data-shopid="${data.id}">+ Ajouter</button>
          </div>`).join('')}`;
  },

  _modalTracking(data) {
    const orderId = data?.orderId;
    if (orderId) {
      SocketMgr.connect(orderId);
      setTimeout(() => DataLoader.trackOrder(orderId), 0);
    }
    return `
      <div class="modal-title">📍 Suivi de commande</div>
      <div class="map-box" style="margin-bottom:16px;">
        <div class="map-grid"></div>
        <div class="map-pin">📍</div>
        <div class="map-info-badge" id="tracking-eta">🛵 En route...</div>
      </div>
      <div id="tracking-status-container">${this._spinner()}</div>`;
  },

  _trackingStatus(order) {
    if (!order) return '<p class="text-muted text-sm">Données non disponibles</p>';
    const livreur = order.livreur || order['livreur:users!livreur_id'];
    const profile = order.livreur_profile || order['livreur_profile:livreurs!livreur_id'];
    const steps   = ['pending','confirmed','preparing','in_route','delivered'];
    const idx     = steps.indexOf(order.status);
    const lbls    = ['Confirmé','Préparé','En route','Livré'];
    return `
      <div class="steps-row" style="margin-bottom:20px;">
        ${lbls.map((lbl,i)=>`
          <div class="step">
            <div class="step-dot ${i<idx?'done':i===idx?'active':'wait'}">${i<idx?'✓':i+1}</div>
            <div class="step-lbl ${i<idx?'done':i===idx?'active':''}">${lbl}</div>
          </div>
          ${i<lbls.length-1?`<div class="step-line ${i<idx?'done':''}"></div>`:''}`).join('')}
      </div>
      ${livreur ? `
        <div class="livreur-card">
          <div class="avatar avatar-md avatar-orange">${(livreur.first_name||'?')[0].toUpperCase()}</div>
          <div class="livreur-info">
            <div class="livreur-name">${livreur.first_name} ${livreur.last_name}</div>
            <div class="livreur-vehicle">${profile?.vehicle_type === 'moto' ? '🛵' : '🚗'} ${profile?.vehicle_plate || ''}</div>
            <div class="livreur-rating">⭐ ${profile?.rating || '4.8'} · ${profile?.total_deliveries || 0} livraisons</div>
          </div>
          <div class="livreur-actions">
            <button class="livreur-action-btn" onclick="Toast.show('📞 Appel de ' + '${livreur.first_name}')">📞</button>
            <button class="livreur-action-btn" onclick="Toast.show('💬 Messagerie bientôt')">💬</button>
          </div>
        </div>` : '<p class="text-muted text-sm text-center">Livreur en cours d\'assignation...</p>'}`;
  },

  _modalWallet() {
    const w = Store.get('wallet');
    return `
      <div class="modal-title">👛 Mon Portefeuille</div>
      <div class="wallet-card" style="margin-bottom:20px;">
        <div class="wallet-lbl">Solde disponible</div>
        <div class="wallet-amount" data-wallet-balance>${w ? Fmt.money(w.balance) : this._spinner()}</div>
      </div>
      <button class="btn btn-primary" style="margin-bottom:10px;" onclick="Modal.open('recharge')">💳 Recharger le portefeuille</button>
      <button class="btn btn-secondary" onclick="Modal.open('withdraw')">💸 Retirer des fonds</button>
      <div style="margin-top:16px;" id="txn-container">${this._spinner()}</div>`;
  },

  _modalRecharge() {
    return `
      <div class="modal-title">💳 Recharger le portefeuille</div>
      <div class="field-group">
        <div class="field"><label>Montant (F CFA)</label><input id="r-amount" type="number" placeholder="5000" min="500" step="500"/></div>
        <div class="field"><label>Via</label>
          <select id="r-provider">
            <option value="orange_money">🟠 Orange Money</option>
            <option value="moov_money">💛 Moov Money</option>
            <option value="card">💳 Carte bancaire</option>
          </select>
        </div>
      </div>
      <button class="btn btn-primary" style="margin-top:20px;" id="recharge-btn" onclick="Views._doRecharge()">Recharger →</button>`;
  },

  async _doRecharge() {
    const btn    = document.getElementById('recharge-btn');
    const amount = parseInt(document.getElementById('r-amount')?.value);
    const prov   = document.getElementById('r-provider')?.value;
    if (!amount || amount < 500) { Toast.show('⚠️ Minimum 500 F CFA'); return; }
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      await API.wallet.recharge({ amount, provider: prov });
      Modal.close();
      Toast.show('✅ +' + Fmt.moneyShort(amount) + ' ajoutés à votre portefeuille');
      DataLoader.wallet();
    } catch (err) { Toast.show('❌ ' + err.message); }
    finally { btn.classList.remove('btn-loading'); btn.disabled = false; }
  },

  _modalWithdraw() {
    return `
      <div class="modal-title">💸 Retirer des fonds</div>
      <div class="field-group">
        <div class="field"><label>Montant (F CFA)</label><input id="w-amount" type="number" placeholder="10000" min="1000" step="500"/></div>
        <div class="field"><label>Numéro de réception</label><input id="w-phone" type="tel" placeholder="+226 70 00 00 00"/></div>
        <div class="field"><label>Via</label>
          <select id="w-provider">
            <option value="orange_money">🟠 Orange Money</option>
            <option value="moov_money">💛 Moov Money</option>
          </select>
        </div>
      </div>
      <button class="btn btn-primary" style="margin-top:20px;" id="withdraw-btn" onclick="Views._doWithdraw()">Retirer →</button>`;
  },

  async _doWithdraw() {
    const btn    = document.getElementById('withdraw-btn');
    const amount = parseInt(document.getElementById('w-amount')?.value);
    const phone  = document.getElementById('w-phone')?.value?.trim();
    const prov   = document.getElementById('w-provider')?.value;
    if (!amount || amount < 1000) { Toast.show('⚠️ Minimum 1 000 F CFA'); return; }
    if (!phone) { Toast.show('⚠️ Numéro de téléphone requis'); return; }
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      await API.wallet.withdraw({ amount, phone, provider: prov });
      Modal.close();
      Toast.show('✅ Retrait de ' + Fmt.moneyShort(amount) + ' initié');
      DataLoader.wallet();
    } catch (err) { Toast.show('❌ ' + err.message); }
    finally { btn.classList.remove('btn-loading'); btn.disabled = false; }
  },

  _modalParcel() {
    return `
      <div class="modal-title">📦 Expédition de Colis</div>
      <div style="background:rgba(255,107,0,0.08);border:1.5px solid rgba(255,107,0,0.2);border-radius:var(--radius-sm);padding:14px;display:flex;gap:12px;align-items:center;margin-bottom:20px;">
        <span style="font-size:24px;">💡</span>
        <div><div class="font-700 text-sm">Tarif estimé</div><div class="text-orange font-800" style="font-size:18px;" id="parcel-est">Remplissez le formulaire</div></div>
      </div>
      <div class="field-group">
        <div class="row-2">
          <div class="field"><label>Pays départ</label>
            <select id="p-oc" onchange="Views._updateParcelCities()">
              <option value="BF">🇧🇫 Burkina Faso</option><option value="NE">🇳🇪 Niger</option>
            </select>
          </div>
          <div class="field"><label>Ville départ</label>
            <select id="p-ocity">${CITIES.BF.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
          </div>
        </div>
        <div class="row-2">
          <div class="field"><label>Pays dest.</label>
            <select id="p-dc" onchange="Views._updateParcelCities()">
              <option value="NE">🇳🇪 Niger</option><option value="BF">🇧🇫 Burkina Faso</option>
            </select>
          </div>
          <div class="field"><label>Ville dest.</label>
            <select id="p-dcity">${CITIES.NE.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
          </div>
        </div>
        <div class="field"><label>Poids (kg)</label><input id="p-weight" type="number" placeholder="2" min="0.1" step="0.5" oninput="Views._estimateParcel()"/></div>
        <div class="field"><label>Nom du destinataire</label><input id="p-rname" type="text" placeholder="Nom complet"/></div>
        <div class="field"><label>Téléphone destinataire</label><input id="p-rphone" type="tel" placeholder="+227 90 00 00 00"/></div>
      </div>
      <button class="btn btn-primary" style="margin-top:20px;" id="parcel-btn" onclick="Views._submitParcel()">
        Réserver l'expédition →
      </button>`;
  },

  _updateParcelCities() {
    const oc = document.getElementById('p-oc')?.value || 'BF';
    const dc = document.getElementById('p-dc')?.value || 'NE';
    const ocEl = document.getElementById('p-ocity');
    const dcEl = document.getElementById('p-dcity');
    if (ocEl) ocEl.innerHTML = (CITIES[oc]||CITIES.BF).map(c=>`<option value="${c}">${c}</option>`).join('');
    if (dcEl) dcEl.innerHTML = (CITIES[dc]||CITIES.NE).map(c=>`<option value="${c}">${c}</option>`).join('');
    this._estimateParcel();
  },

  async _estimateParcel() {
    const oc = document.getElementById('p-oc')?.value || 'BF';
    const dc = document.getElementById('p-dc')?.value || 'NE';
    const w  = document.getElementById('p-weight')?.value || '1';
    const el = document.getElementById('parcel-est');
    if (!el) return;
    try {
      const res = await API.parcels.estimate({ originCountry: oc, destCountry: dc, weightKg: parseFloat(w) });
      el.textContent = Fmt.moneyShort(res.data.estimatedPrice) + ' · ' + res.data.estimatedDays;
    } catch { el.textContent = 'Estimation indisponible'; }
  },

  async _submitParcel() {
    const btn = document.getElementById('parcel-btn');
    const rname  = document.getElementById('p-rname')?.value?.trim();
    const rphone = document.getElementById('p-rphone')?.value?.trim();
    if (!rname || !rphone) { Toast.show('⚠️ Nom et téléphone du destinataire requis'); return; }
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      const user = Auth.getUser();
      const res  = await API.parcels.create({
        senderName:    user.firstName + ' ' + user.lastName,
        senderPhone:   user.phone,
        receiverName:  rname,
        receiverPhone: rphone,
        originCity:    document.getElementById('p-ocity')?.value,
        originCountry: document.getElementById('p-oc')?.value || 'BF',
        destCity:      document.getElementById('p-dcity')?.value,
        destCountry:   document.getElementById('p-dc')?.value || 'NE',
        weightKg:      parseFloat(document.getElementById('p-weight')?.value) || 1,
      });
      Modal.close();
      Toast.show('📦 Colis enregistré ! Code : ' + (res.data?.tracking_code || '—'));
    } catch (err) { Toast.show('❌ ' + err.message); }
    finally { btn.classList.remove('btn-loading'); btn.disabled = false; }
  },

  _modalRental(data) {
    const item = RENTAL_ITEMS.find(r => r.name === data?.name) || RENTAL_ITEMS[0];
    return `
      <div class="modal-title">📺 Location d'Appareil</div>
      <div style="text-align:center;font-size:64px;margin:12px 0;">${item.emoji}</div>
      <div class="font-800" style="font-size:18px;text-align:center;margin-bottom:4px;">${item.name}</div>
      <div class="text-orange font-800" style="text-align:center;font-size:20px;margin-bottom:20px;">${Fmt.moneyShort(item.price)} / jour</div>
      <div class="field-group">
        <div class="row-2">
          <div class="field"><label>Date de début</label><input id="rent-start" type="date" min="${new Date().toISOString().split('T')[0]}"/></div>
          <div class="field"><label>Date de fin</label><input id="rent-end" type="date"/></div>
        </div>
        <div class="field"><label>Ville</label>
          <select id="rent-city">
            <optgroup label="🇧🇫 Burkina Faso">${CITIES.BF.map(c=>`<option>${c}</option>`).join('')}</optgroup>
            <optgroup label="🇳🇪 Niger">${CITIES.NE.map(c=>`<option>${c}</option>`).join('')}</optgroup>
          </select>
        </div>
      </div>
      <button class="btn btn-primary" style="margin-top:20px;" onclick="Toast.show('✅ Location réservée ! Nous vous contactons sous 2h.');Modal.close();">
        Confirmer la réservation →
      </button>`;
  },

  _modalPremium() {
    return `
      <div style="background:linear-gradient(135deg,#1a1a30,#16213e);border-radius:var(--radius);padding:24px;border:1px solid rgba(255,184,0,0.3);text-align:center;margin-bottom:20px;">
        <div style="font-size:44px;margin-bottom:10px;">👑</div>
        <div style="font-size:22px;font-weight:800;">KibaAlo Premium</div>
        <div style="color:var(--text2);font-size:13px;margin-top:6px;">Profitez de fonctionnalités exclusives</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${[
          { key:'monthly', name:'Mensuel',  price:'2 500', unit:'/mois', popular:false,
            feats:['Livraison gratuite x5/mois','Priorité de livraison','Support prioritaire'] },
          { key:'annual',  name:'Annuel',   price:'20 000', unit:'/an', popular:true,
            feats:['Livraison gratuite illimitée','Cashback 5% sur commandes','Priorité maximale','Support VIP 24/7','Accès bêta anticipé'] },
        ].map(p => `
          <div class="plan-card ${p.popular?'featured':''}">
            <div class="plan-head">
              <span class="plan-name">${p.name}</span>
              ${p.popular?`<span class="plan-popular">⭐ Populaire</span>`:''}
            </div>
            <div class="plan-price">${p.price} F <span>${p.unit}</span></div>
            <div class="plan-features">
              ${p.feats.map(f=>`<div class="plan-feature"><span class="check">✓</span> ${f}</div>`).join('')}
            </div>
            <button class="btn ${p.popular?'btn-primary':'btn-outline'}" id="plan-${p.key}" onclick="Views._subscribePlan('${p.key}')">
              S'abonner ${p.popular?'👑':''}
            </button>
          </div>`).join('')}
      </div>`;
  },

  async _subscribePlan(plan) {
    const btn = document.getElementById('plan-' + plan);
    if (btn) { btn.classList.add('btn-loading'); btn.disabled = true; }
    try {
      await API.premium.subscribe(plan);
      const me = await API.auth.me();
      Auth.setUser(me.user);
      Modal.close();
      Toast.show('👑 Abonnement ' + (plan==='annual'?'Annuel':'Mensuel') + ' activé !');
    } catch (err) { Toast.show('❌ ' + err.message); }
    finally { if (btn) { btn.classList.remove('btn-loading'); btn.disabled = false; } }
  },

  _modalAddProduct() {
    return `
      <div class="modal-title">➕ Ajouter un produit</div>
      <div class="field-group">
        <div class="field"><label>Nom du produit *</label><input id="np-name" type="text" placeholder="Ex: Riz gras au poulet"/></div>
        <div class="row-2">
          <div class="field"><label>Prix (F CFA) *</label><input id="np-price" type="number" placeholder="2500" min="0"/></div>
          <div class="field"><label>Emoji</label><input id="np-emoji" type="text" placeholder="🍚" maxlength="2"/></div>
        </div>
        <div class="field"><label>Catégorie</label>
          <select id="np-cat"><option>Alimentaire</option><option>Boissons</option><option>Électronique</option><option>Hygiène</option><option>Divers</option></select>
        </div>
        <div class="field"><label>Description</label><textarea id="np-desc" placeholder="Décrivez votre produit..."></textarea></div>
      </div>
      <div style="display:flex;gap:12px;margin-top:20px;">
        <button class="btn btn-primary" id="save-prod-btn" onclick="Views._saveProduct()">💾 Enregistrer</button>
        <button class="btn btn-secondary" onclick="Modal.close()">Annuler</button>
      </div>`;
  },

  async _saveProduct() {
    const btn   = document.getElementById('save-prod-btn');
    const name  = document.getElementById('np-name')?.value?.trim();
    const price = parseInt(document.getElementById('np-price')?.value);
    const emoji = document.getElementById('np-emoji')?.value?.trim() || '📦';
    const desc  = document.getElementById('np-desc')?.value?.trim();
    if (!name || !price) { Toast.show('⚠️ Nom et prix requis'); return; }
    let shopId = Store.get('myShopId') || localStorage.getItem('kba_shop_id');
    if (!shopId) {
      try {
        const me = await API.auth.me();
        shopId = me.shopId;
        if (shopId) { Store.set({ myShopId: shopId }); localStorage.setItem('kba_shop_id', shopId); }
      } catch { /**/ }
    }
    if (!shopId) { Toast.show('⚠️ Boutique introuvable. Déconnectez-vous et reconnectez-vous.'); return; }
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      await API.shops.addProduct(shopId, { name, price, emoji, description: desc });
      Modal.close();
      Toast.show('✅ Produit "' + name + '" ajouté !');
      DataLoader.myProducts();
    } catch (err) { Toast.show('❌ ' + err.message); }
    finally { btn.classList.remove('btn-loading'); btn.disabled = false; }
  },

  _modalReview(data) {
    return `
      <div class="modal-title">⭐ Donner un avis</div>
      <p class="text-muted text-sm" style="margin-bottom:16px;">Votre avis aide les autres clients et nos partenaires à s'améliorer.</p>
      <div class="field" style="margin-bottom:16px;">
        <label>Note de la boutique</label>
        <div class="rating" id="shop-rating">${[1,2,3,4,5].map(i=>`<span class="rating-star" data-v="${i}" onclick="document.querySelectorAll('#shop-rating .rating-star').forEach((s,j)=>s.textContent=j<${i}?'⭐':'☆')">☆</span>`).join('')}</div>
      </div>
      <div class="field" style="margin-bottom:16px;">
        <label>Note du livreur</label>
        <div class="rating" id="livreur-rating">${[1,2,3,4,5].map(i=>`<span class="rating-star" data-v="${i}" onclick="document.querySelectorAll('#livreur-rating .rating-star').forEach((s,j)=>s.textContent=j<${i}?'⭐':'☆')">☆</span>`).join('')}</div>
      </div>
      <div class="field"><label>Commentaire (optionnel)</label><textarea id="review-comment" placeholder="Partagez votre expérience..."></textarea></div>
      <button class="btn btn-primary" style="margin-top:20px;" id="review-btn" onclick="Views._submitReview('${data?.orderId||''}')">Envoyer l'avis →</button>`;
  },

  async _submitReview(orderId) {
    if (!orderId) return;
    const btn = document.getElementById('review-btn');
    const shopR    = document.querySelectorAll('#shop-rating .rating-star[style]').length || 0;
    const livreurR = document.querySelectorAll('#livreur-rating .rating-star[style]').length || 0;
    const comment  = document.getElementById('review-comment')?.value?.trim();
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      await API.orders.review(orderId, { shopRating: shopR||5, livreurRating: livreurR||5, comment });
      Modal.close();
      Toast.show('⭐ Merci pour votre avis !');
    } catch (err) { Toast.show('❌ ' + err.message); }
    finally { btn.classList.remove('btn-loading'); btn.disabled = false; }
  },

  _modalNotifications() {
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div class="modal-title" style="margin-bottom:0;">🔔 Notifications</div>
        <button class="btn btn-ghost btn-sm" onclick="API.notifications.readAll().then(()=>{Store.set({notifCount:0});Router.updateTopbar();Toast.show('✓ Tout lu');})">
          Tout marquer lu
        </button>
      </div>
      <div id="notif-container">${this._spinner()}</div>`;
  },

  _notifCard(n) {
    return `
      <div style="background:${n.is_read?'var(--surface)':'rgba(255,107,0,0.06)'};border-radius:var(--radius-sm);padding:14px;margin-bottom:8px;border:1px solid ${n.is_read?'var(--border2)':'rgba(255,107,0,0.2)'};">
        <div class="font-700" style="font-size:14px;">${n.title}</div>
        ${n.body?`<div class="text-muted text-sm mt-8">${n.body}</div>`:''}
        <div class="text-muted text-xs mt-8">${Fmt.relative(n.created_at)}</div>
      </div>`;
  },

  _modalMyColis() {
    return `
      <div class="modal-title">📦 Mes Colis</div>
      <div id="colis-container">${this._spinner()}</div>`;
    // Charger les colis
    setTimeout(async () => {
      const el = document.getElementById('colis-container');
      if (!el) return;
      try {
        const res = await API.parcels.myList();
        if (!res.data?.length) { el.innerHTML = this._emptyState('📦','Aucun colis expédié',''); return; }
        el.innerHTML = res.data.map(p => `
          <div class="card card-pad" style="margin-bottom:10px;">
            <div class="flex justify-between items-center">
              <div class="font-700">${p.tracking_code}</div>
              <span class="badge badge-orange">${p.status}</span>
            </div>
            <div class="text-muted text-sm mt-8">→ ${p.dest_city}, ${p.dest_country === 'BF' ? '🇧🇫' : '🇳🇪'}</div>
            <div class="text-muted text-xs mt-8">${Fmt.date(p.created_at)}</div>
          </div>`).join('');
      } catch (err) { if (el) el.innerHTML = this._errorState(err.message); }
    }, 0);
  },

  _modalEditProfile() {
    const user = Auth.getUser() || {};
    return `
      <div class="modal-title">✏️ Modifier mon profil</div>
      <div class="field-group">
        <div class="row-2">
          <div class="field"><label>Prénom</label><input id="ep-fname" type="text" value="${user.firstName||''}"/></div>
          <div class="field"><label>Nom</label><input id="ep-lname" type="text" value="${user.lastName||''}"/></div>
        </div>
        <div class="field"><label>Email (optionnel)</label><input id="ep-email" type="email" value="${user.email||''}" placeholder="email@exemple.com"/></div>
        <div class="field"><label>Ville</label>
          <select id="ep-city">
            <optgroup label="🇧🇫 Burkina Faso">${CITIES.BF.map(c=>`<option ${c===user.city?'selected':''}>${c}</option>`).join('')}</optgroup>
            <optgroup label="🇳🇪 Niger">${CITIES.NE.map(c=>`<option ${c===user.city?'selected':''}>${c}</option>`).join('')}</optgroup>
          </select>
        </div>
      </div>
      <button class="btn btn-primary" style="margin-top:20px;" id="save-profile-btn" onclick="Views._saveProfile()">
        💾 Enregistrer
      </button>`;
  },

  async _saveProfile() {
    const btn = document.getElementById('save-profile-btn');
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      const res = await API.auth.updateProfile({
        firstName: document.getElementById('ep-fname')?.value?.trim(),
        lastName:  document.getElementById('ep-lname')?.value?.trim(),
        email:     document.getElementById('ep-email')?.value?.trim() || undefined,
        city:      document.getElementById('ep-city')?.value,
      });
      Auth.setUser(res.user);
      Modal.close();
      Router.updateTopbar();
      Toast.show('✅ Profil mis à jour !');
    } catch (err) { Toast.show('❌ ' + err.message); }
    finally { btn.classList.remove('btn-loading'); btn.disabled = false; }
  },
};
