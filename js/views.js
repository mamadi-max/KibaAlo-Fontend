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
      