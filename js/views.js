// js/views.js — KibaAlo v2.0 — Toutes les vues complètes
// ================================================================

const SERVICES_DATA = [
  { emoji:'💻', name:'Services Informatique',  desc:'Réparation, installation, maintenance réseau', price:'Dès 5 000 F' },
  { emoji:'📺', name:"Location d'Appareils",   desc:'TV, réfrigérateur, climatiseur, PC portable',  price:'Dès 2 000 F/j' },
  { emoji:'📦', name:'Expédition de Colis',    desc:'16 pays Afrique de l\'Ouest — gares agréées', price:'Dès 2 000 F' },
  { emoji:'💻', name:'Produits Digitaux',       desc:'Formations, documents PDF, vidéos, templates',price:'Dès 500 F' },
  { emoji:'🛵', name:'Livraison Express',       desc:'En moins de 45 min dans votre ville',         price:'Dès 500 F' },
  { emoji:'🔧', name:'Dépannage Maison',        desc:'Plomberie, électricité, serrurerie',           price:'Dès 8 000 F' },
  { emoji:'🧹', name:'Ménage & Nettoyage',      desc:'Appartement, bureau, commerce',               price:'Dès 7 000 F' },
  { emoji:'🚗', name:'Auto / Moto',             desc:'Garage, pièces détachées, accessoires',       price:'Dès 3 000 F' },
];

const RENTAL_ITEMS = [
  { emoji:'📺', name:'Smart TV 55"',  price:3500 }, { emoji:'🧊', name:'Réfrigérateur', price:2000 },
  { emoji:'❄️', name:'Climatiseur',   price:4500 }, { emoji:'💻', name:'PC Portable',   price:5000 },
  { emoji:'📽️', name:'Projecteur',    price:7000 }, { emoji:'🔊', name:'Sono Complète', price:8000 },
  { emoji:'📸', name:'Appareil photo',price:6000 }, { emoji:'🎮', name:'Console jeux',  price:4000 },
];

const OB_SLIDES = [
  { emoji:'🛵', title:'Livraison <em>Ultra Rapide</em>',  text:'Commandez auprès de commerçants locaux dans 16 pays d\'Afrique de l\'Ouest. Livraison en moins de 45 min.' },
  { emoji:'💻', title:'Produits <em>Digitaux</em>',       text:'Achetez des formations, PDF, vidéos. Reçus directement dans votre boîte mail avec un mot de passe unique.' },
  { emoji:'📦', title:'Expédition <em>Partout</em>',      text:'Envoyez vos colis dans toutes les communes via nos partenaires de transport agréés — Burkina, Niger et 14 autres pays.' },
  { emoji:'💳', title:'Paiement <em>Sécurisé</em>',       text:'Orange Money, Moov Money, Wave, MTN Money, Airtel Money. Rapide, sans contact, instantané.' },
];

const CATS = [
  { id:'all',         emoji:'🌟', label:'Tout' },
  { id:'food',        emoji:'🍔', label:'Resto' },
  { id:'grocery',     emoji:'🛒', label:'Épicerie' },
  { id:'pharma',      emoji:'💊', label:'Pharma' },
  { id:'tech',        emoji:'📱', label:'Tech' },
  { id:'fashion',     emoji:'👗', label:'Mode' },
  { id:'beauty',      emoji:'💄', label:'Beauté' },
  { id:'digital',     emoji:'💻', label:'Digital' },
  { id:'electronics', emoji:'📺', label:'Électro' },
  { id:'health',      emoji:'🏥', label:'Santé' },
  { id:'books',       emoji:'📚', label:'Livres' },
  { id:'services',    emoji:'🔧', label:'Services' },
];

const Views = {

  // ── HELPERS ──────────────────────────────────────────────
  _spinner: () => '<div class="loading-center"><div class="spinner"></div></div>',
  _emptyState: (icon, title, text) => `<div class="empty-state"><div class="empty-icon">${icon}</div><div class="empty-title">${title}</div>${text?`<div class="empty-text">${text}</div>`:''}</div>`,
  _errorState: (msg, fn) => `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Erreur</div><div class="empty-text">${msg}</div>${fn?`<button class="btn btn-secondary btn-sm mt-12" onclick="(${fn.toString()})()">Réessayer</button>`:''}</div>`,

  isFav: (id) => JSON.parse(localStorage.getItem('kba_favs')||'[]').includes(id),

  // ── SPLASH ───────────────────────────────────────────────
  splashScreen() {
    const prev = document.getElementById('overlay-screen');
    if (prev) prev.remove();
    const el = document.createElement('div');
    el.id = 'overlay-screen';
    el.style.cssText = 'position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:20px;';
    el.innerHTML = `
      <div class="splash-logo">🛵</div>
      <div class="splash-title"><span>Kiba</span>Alo</div>
      <div class="splash-sub">Livraison & Services — 16 pays 🌍</div>
      <div class="splash-bar"><div class="splash-progress"></div></div>
      <div style="position:absolute;bottom:32px;color:var(--text3);font-size:11px;">v2.0 — Afrique de l'Ouest</div>
    `;
    document.getElementById('app').appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity 0.4s';
      el.style.opacity = '0';
      setTimeout(() => { el.remove(); Store.set({ screen:'onboarding' }); Router.render(); }, 400);
    }, 2300);
  },

  // ── ONBOARDING ───────────────────────────────────────────
  onboarding() {
    const prev = document.getElementById('overlay-screen');
    if (prev) prev.remove();
    const slide = Store.get('obSlide');
    const el = document.createElement('div');
    el.id = 'overlay-screen';
    el.style.cssText = 'position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;z-index:9999;';
    el.innerHTML = `
      <div style="flex:1;overflow:hidden;">
        <div style="display:flex;transform:translateX(-${slide*100}%);transition:transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94);height:100%;">
          ${OB_SLIDES.map(s=>`
            <div style="min-width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 32px;gap:20px;text-align:center;">
              <span style="font-size:88px;animation:floatY 3s ease-in-out infinite;">${s.emoji}</span>
              <h2 style="font-size:26px;font-weight:800;letter-spacing:-0.5px;line-height:1.2;">${s.title}</h2>
              <p style="color:var(--text2);font-size:15px;line-height:1.65;max-width:300px;">${s.text}</p>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="padding:24px 24px calc(24px + var(--safe-bottom));display:flex;flex-direction:column;gap:12px;align-items:center;">
        <div style="display:flex;gap:6px;margin-bottom:4px;">
          ${OB_SLIDES.map((_,i)=>`<div style="width:${i===slide?28:8}px;height:8px;border-radius:4px;background:${i===slide?'var(--orange)':'var(--surface2)'};transition:all 0.3s;"></div>`).join('')}
        </div>
        <button class="btn btn-primary" id="ob-next" style="max-width:340px;">${slide<OB_SLIDES.length-1?'Suivant →':'Commencer 🚀'}</button>
        ${slide<OB_SLIDES.length-1?`<button class="btn btn-ghost" id="ob-skip" style="max-width:340px;">Passer</button>`:''}
      </div>
    `;
    document.getElementById('app').appendChild(el);
    el.querySelector('#ob-next')?.addEventListener('click', () => {
      const cur = Store.get('obSlide');
      if (cur < OB_SLIDES.length-1) { Store.set({ obSlide: cur+1 }); el.remove(); Views.onboarding(); }
      else { el.remove(); Store.set({ screen:'role' }); Router.render(); }
    });
    el.querySelector('#ob-skip')?.addEventListener('click', () => { el.remove(); Store.set({ screen:'role' }); Router.render(); });
  },

  // ── ROLE SELECT ──────────────────────────────────────────
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
          { id:'client',     emoji:'👤', bg:'rgba(42,42,56,1)', title:'Client',     desc:'Commandez des produits et services livrés chez vous.', pill:'' },
          { id:'livreur',    emoji:'🛵', bg:'rgba(20,36,20,1)', title:'Livreur',    desc:'Effectuez des livraisons et gagnez de l\'argent.',      pill:'Revenus +' },
          { id:'commercant', emoji:'🏪', bg:'rgba(36,20,20,1)', title:'Commerçant', desc:'Vendez produits physiques et digitaux en ligne.',        pill:'Dashboard' },
        ].map(r=>`
          <div class="role-card" id="rc-${r.id}" data-role="${r.id}">
            <div class="role-card-icon" style="background:${r.bg};">${r.emoji}</div>
            <div class="role-card-info"><h3>${r.title}</h3><p>${r.desc}</p></div>
            ${r.pill?`<div class="role-pill">${r.pill}</div>`:''}
          </div>
        `).join('')}
      </div>
      <div style="padding-top:20px;">
        <button class="btn btn-primary" id="rc-continue" disabled style="opacity:.5;">Continuer →</button>
        <p style="text-align:center;color:var(--text3);font-size:12px;margin-top:12px;">Burkina Faso 🇧🇫 Niger 🇳🇪 et 14 autres pays</p>
      </div>
    `;
    document.getElementById('app').appendChild(el);
    el.querySelectorAll('.role-card').forEach(card => {
      card.addEventListener('click', () => {
        el.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        Store.set({ selectedRole: card.dataset.role });
        const btn = el.querySelector('#rc-continue');
        if (btn) { btn.disabled=false; btn.style.opacity='1'; btn.textContent=`Continuer comme ${card.querySelector('h3').textContent} →`; }
      });
    });
    el.querySelector('#rc-continue')?.addEventListener('click', () => {
      if (!Store.get('selectedRole')) return;
      el.remove(); Store.set({ screen:'auth', authMode:'register' }); Router.render();
    });
  },

  // ── AUTH ─────────────────────────────────────────────────
  authScreen() {
    const prev = document.getElementById('overlay-screen');
    if (prev) prev.remove();
    const role    = Store.get('selectedRole') || 'client';
    const mode    = Store.get('authMode');
    const isLogin = mode === 'login';
    const country = Store.get('country') || 'BF';

    const el = document.createElement('div');
    el.id = 'overlay-screen';
    el.style.cssText = 'position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;z-index:9999;animation:slideLeft 0.3s ease;';
    el.innerHTML = `
      <div style="padding:calc(var(--safe-top)+12px) 20px 0;display:flex;align-items:center;gap:14px;flex-shrink:0;">
        <button class="back-btn" id="auth-back">←</button>
        <div style="margin-left:auto;display:flex;gap:8px;align-items:center;">
          <span style="font-size:18px;">${Fmt.roleEmoji(role)}</span>
          <span style="font-size:12px;font-weight:700;color:var(--orange);">${Fmt.roleLabel(role)}</span>
        </div>
      </div>
      <div style="flex:1;overflow-y:auto;padding:20px 20px 40px;">
        <div class="tabs" style="margin-bottom:24px;">
          <div class="tab ${isLogin?'active':''}" data-t="login">Connexion</div>
          <div class="tab ${!isLogin?'active':''}" data-t="register">Inscription</div>
        </div>
        <div style="font-size:26px;font-weight:800;letter-spacing:-0.5px;margin-bottom:4px;">
          ${isLogin?`Bon retour <em style="color:var(--orange);font-style:normal;">👋</em>`:`Créer un compte <em style="color:var(--orange);font-style:normal;">${Fmt.roleEmoji(role)}</em>`}
        </div>
        <div style="color:var(--text2);font-size:14px;margin-bottom:24px;">
          ${isLogin?'Connectez-vous avec votre email':'Rejoignez KibaAlo — gratuit !'}
        </div>
        <div id="auth-error" style="background:rgba(255,61,61,0.1);border:1px solid rgba(255,61,61,0.3);border-radius:10px;padding:12px 16px;color:var(--red);font-size:14px;margin-bottom:16px;display:none;"></div>
        <div class="field-group">
          ${!isLogin?`
            <div class="row-2">
              <div class="field"><label>Prénom *</label><input id="f-fname" type="text" placeholder="Moussa" autocomplete="given-name"/></div>
              <div class="field"><label>Nom *</label><input id="f-lname" type="text" placeholder="Traoré" autocomplete="family-name"/></div>
            </div>` : ''}
          <div class="field"><label>Email *</label>
            <div class="input-wrap">
              <span class="input-icon">📧</span>
              <input id="f-email" type="email" placeholder="votre@email.com" autocomplete="email" style="padding-left:44px;"/>
            </div>
          </div>
          ${!isLogin?`
            <div class="field"><label>Téléphone</label>
              <div class="input-wrap">
                <span class="input-icon">📱</span>
                <input id="f-phone" type="tel" placeholder="+226 70 00 00 00" autocomplete="tel" style="padding-left:44px;"/>
              </div>
            </div>
            <div class="row-2">
              <div class="field"><label>Pays *</label>
                <select id="f-country">
                  ${Object.entries(COUNTRIES).map(([code,c])=>`<option value="${code}" ${code===country?'selected':''}>${c.flag} ${c.name}</option>`).join('')}
                </select>
              </div>
              <div class="field"><label>Ville *</label>
                <select id="f-city">
                  <option value="">-- Sélectionner --</option>
                  ${(CITIES[country]||CITIES.BF).map(c=>`<option>${c}</option>`).join('')}
                </select>
              </div>
            </div>
            ${role==='commercant'?`
              <div class="field"><label>Nom de la boutique *</label><input id="f-shop" type="text" placeholder="Mon Super Marché"/></div>
              <div class="row-2">
                <div class="field"><label>Type d'activité *</label>
                  <select id="f-shopcat">
                    <option value="food">🍔 Alimentation</option>
                    <option value="grocery">🛒 Épicerie</option>
                    <option value="pharma">💊 Pharmacie</option>
                    <option value="tech">📱 Tech</option>
                    <option value="fashion">👗 Mode</option>
                    <option value="beauty">💄 Beauté</option>
                    <option value="digital">💻 Digital</option>
                    <option value="electronics">📺 Électro</option>
                    <option value="health">🏥 Santé</option>
                    <option value="books">📚 Livres</option>
                    <option value="services">🔧 Services</option>
                    <option value="other">📦 Autre</option>
                  </select>
                </div>
                <div class="field"><label>WhatsApp boutique</label><input id="f-shopwa" type="tel" placeholder="+226 70..."/></div>
              </div>` : ''}
            ${role==='livreur'?`
              <div class="row-2">
                <div class="field"><label>Type de véhicule</label>
                  <select id="f-vehicle">
                    <option value="moto">🛵 Moto</option>
                    <option value="velo">🚲 Vélo</option>
                    <option value="voiture">🚗 Voiture</option>
                    <option value="tricycle">🛺 Tricycle</option>
                    <option value="pied">🚶 À pied</option>
                  </select>
                </div>
                <div class="field"><label>Plaque (optionnel)</label><input id="f-plate" type="text" placeholder="OUA-1234"/></div>
              </div>` : ''}
          `:''}
          <div class="field"><label>Mot de passe *</label>
            <div class="input-wrap">
              <span class="input-icon">🔒</span>
              <input id="f-pwd" type="password" placeholder="••••••••" autocomplete="${isLogin?'current-password':'new-password'}" style="padding-left:44px;"/>
              <span class="input-right" onclick="this.previousElementSibling.type=this.previousElementSibling.type==='password'?'text':'password';this.textContent=this.previousElementSibling.type==='password'?'👁️':'🙈';">👁️</span>
            </div>
          </div>
          ${!isLogin?`<div class="field"><label>Confirmer le mot de passe *</label>
            <div class="input-wrap">
              <span class="input-icon">🔒</span>
              <input id="f-pwd2" type="password" placeholder="••••••••" style="padding-left:44px;"/>
            </div>
          </div>`:'' }
        </div>
        ${isLogin?`<p style="text-align:right;margin:8px 0;"><span style="color:var(--orange);font-size:13px;font-weight:600;cursor:pointer;" id="forgot-link">Mot de passe oublié ?</span></p>`:''}
        <button class="btn btn-primary" id="auth-submit" style="margin-top:20px;">${isLogin?'Se connecter →':'Créer mon compte →'}</button>
        <div class="divider" style="margin:20px 0;">ou continuer avec</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
          <button class="btn btn-secondary" style="font-size:13px;" onclick="Toast.show('📱 Mobile Money — Bientôt')">📱 Mobile Money</button>
          <button class="btn btn-secondary" style="font-size:13px;" onclick="Toast.show('📩 OTP SMS — Bientôt')">📩 Code SMS</button>
        </div>
        <p style="text-align:center;color:var(--text2);font-size:14px;">
          ${isLogin?`Pas de compte ? <span style="color:var(--orange);font-weight:700;cursor:pointer;" id="auth-switch">S'inscrire</span>`:
                    `Déjà un compte ? <span style="color:var(--orange);font-weight:700;cursor:pointer;" id="auth-switch">Se connecter</span>`}
        </p>
      </div>
    `;
    document.getElementById('app').appendChild(el);
    el.querySelector('#auth-back')?.addEventListener('click', () => { el.remove(); Store.set({ screen:'role' }); Router.render(); });
    el.querySelector('#auth-switch')?.addEventListener('click', () => { el.remove(); Store.set({ authMode: isLogin?'register':'login' }); Views.authScreen(); });
    el.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => { el.remove(); Store.set({ authMode: t.dataset.t }); Views.authScreen(); }));
    el.querySelector('#f-country')?.addEventListener('change', e => {
      Store.set({ country: e.target.value });
      const cityEl = el.querySelector('#f-city');
      if (cityEl) cityEl.innerHTML = '<option value="">-- Sélectionner --</option>' + (CITIES[e.target.value]||CITIES.BF).map(c=>`<option>${c}</option>`).join('');
    });
    el.querySelector('#forgot-link')?.addEventListener('click', () => Modal.open('forgotPassword'));
    el.querySelector('#auth-submit')?.addEventListener('click', () => this._submitAuth(role, isLogin, el));
  },

  async _submitAuth(role, isLogin, el) {
    const errEl = el.querySelector('#auth-error');
    const btn   = el.querySelector('#auth-submit');
    const showErr = msg => { errEl.textContent = msg; errEl.style.display = 'block'; errEl.scrollIntoView({ behavior:'smooth', block:'center' }); };
    errEl.style.display = 'none';
    const email = el.querySelector('#f-email')?.value?.trim();
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
        const phone   = el.querySelector('#f-phone')?.value?.trim() || '';
        const country = el.querySelector('#f-country')?.value || 'BF';
        const city    = el.querySelector('#f-city')?.value || '';
        const pwd2    = el.querySelector('#f-pwd2')?.value || '';
        if (!fname || !lname) { showErr('⚠️ Prénom et nom requis'); return; }
        if (!city)   { showErr('⚠️ Veuillez sélectionner une ville'); return; }
        if (pwd.length < 8) { showErr('⚠️ Mot de passe: minimum 8 caractères'); return; }
        if (pwd !== pwd2)   { showErr('⚠️ Les mots de passe ne correspondent pas'); return; }
        const payload = { email, phone, firstName:fname, lastName:lname, password:pwd, role, country, city };
        if (role === 'commercant') {
          payload.shopName     = el.querySelector('#f-shop')?.value?.trim();
          payload.shopCategory = el.querySelector('#f-shopcat')?.value || 'other';
          payload.shopWhatsapp = el.querySelector('#f-shopwa')?.value?.trim();
          if (!payload.shopName) { showErr('⚠️ Nom de boutique requis'); return; }
        }
        if (role === 'livreur') {
          payload.vehicleType  = el.querySelector('#f-vehicle')?.value || 'moto';
          payload.vehiclePlate = el.querySelector('#f-plate')?.value?.trim();
        }
        res = await API.auth.register(payload);
      }
      Auth.setToken(res.token);
      Auth.setUser(res.user);
      if (res.shopId) { Store.set({ myShopId: res.shopId }); localStorage.setItem('kba_shop_id', res.shopId); }
      el.remove();
      Router.setupNav();
      Store.set({ screen:'app', activeTab:'home' });
      Router.render();
      await loadInitialData();
      if (!res.user.isEmailVerified) {
        setTimeout(() => Toast.show('📧 Vérifiez votre email pour activer votre compte !', 5000), 1000);
      } else {
        Toast.show(`🎉 Bienvenue ${res.user.firstName} !`);
      }
    } catch (err) {
      showErr('❌ ' + err.message);
    } finally {
      btn.classList.remove('btn-loading'); btn.disabled = false;
    }
  },

  verifyEmailScreen() {
    const prev = document.getElementById('overlay-screen');
    if (prev) prev.remove();
    const token = Store.get('verifyToken') || new URLSearchParams(window.location.search).get('token');
    const el = document.createElement('div');
    el.id = 'overlay-screen';
    el.style.cssText = 'position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;padding:32px;text-align:center;';
    el.innerHTML = `<div style="font-size:64px;margin-bottom:16px;" id="verify-icon">⏳</div><h2 id="verify-title">Vérification en cours...</h2><p id="verify-text" style="color:var(--text2);margin-top:8px;"></p>`;
    document.getElementById('app').appendChild(el);
    if (token) {
      API.auth.verifyEmail(token).then(res => {
        el.querySelector('#verify-icon').textContent = '✅';
        el.querySelector('#verify-title').textContent = 'Email vérifié !';
        el.querySelector('#verify-text').textContent = res.message;
        setTimeout(() => { el.remove(); Store.set({ screen:'role' }); Router.render(); }, 2500);
      }).catch(err => {
        el.querySelector('#verify-icon').textContent = '❌';
        el.querySelector('#verify-title').textContent = 'Erreur de vérification';
        el.querySelector('#verify-text').textContent = err.message;
      });
    }
  },

  resetPasswordScreen() {
    const prev = document.getElementById('overlay-screen');
    if (prev) prev.remove();
    const token = Store.get('resetToken') || new URLSearchParams(window.location.search).get('token');
    const el = document.createElement('div');
    el.id = 'overlay-screen';
    el.style.cssText = 'position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;z-index:9999;';
    el.innerHTML = `
      <div style="padding:calc(var(--safe-top)+20px) 20px 0;"><button class="back-btn" onclick="Store.set({screen:'role'});Router.render();">←</button></div>
      <div style="flex:1;overflow-y:auto;padding:20px 20px 40px;">
        <div style="font-size:40px;text-align:center;margin-bottom:16px;">🔑</div>
        <h2 style="font-size:24px;font-weight:800;text-align:center;margin-bottom:8px;">Nouveau mot de passe</h2>
        <p style="color:var(--text2);font-size:14px;text-align:center;margin-bottom:24px;">Choisissez un nouveau mot de passe sécurisé</p>
        <div id="rp-error" style="display:none;background:rgba(255,61,61,0.1);border:1px solid rgba(255,61,61,0.3);border-radius:10px;padding:12px;color:var(--red);font-size:14px;margin-bottom:16px;"></div>
        <div class="field-group">
          <div class="field"><label>Nouveau mot de passe *</label><input id="rp-pwd" type="password" placeholder="••••••••" minlength="8"/></div>
          <div class="field"><label>Confirmer le mot de passe *</label><input id="rp-pwd2" type="password" placeholder="••••••••"/></div>
        </div>
        <button class="btn btn-primary" style="margin-top:24px;" id="rp-submit">Réinitialiser →</button>
      </div>
    `;
    document.getElementById('app').appendChild(el);
    el.querySelector('#rp-submit')?.addEventListener('click', async () => {
      const btn  = el.querySelector('#rp-submit');
      const errEl = el.querySelector('#rp-error');
      const pwd  = el.querySelector('#rp-pwd')?.value;
      const pwd2 = el.querySelector('#rp-pwd2')?.value;
      errEl.style.display = 'none';
      if (pwd.length < 8) { errEl.textContent = 'Minimum 8 caractères'; errEl.style.display='block'; return; }
      if (pwd !== pwd2) { errEl.textContent = 'Mots de passe différents'; errEl.style.display='block'; return; }
      btn.classList.add('btn-loading'); btn.disabled = true;
      try {
        const res = await API.auth.resetPassword({ token, password: pwd });
        el.innerHTML = `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;text-align:center;"><div style="font-size:64px;margin-bottom:16px;">✅</div><h2>Mot de passe modifié !</h2><p style="color:var(--text2);margin-top:8px;">${res.message}</p><button class="btn btn-primary" style="margin-top:24px;max-width:300px;" onclick="Store.set({screen:'role'});Router.render();">Se connecter →</button></div>`;
      } catch (err) {
        errEl.textContent = '❌ ' + err.message; errEl.style.display = 'block';
        btn.classList.remove('btn-loading'); btn.disabled = false;
      }
    });
  },

  // ── HOME PAGE ────────────────────────────────────────────
  homePage() {
    const { activeCategory, isOffline } = Store.get();
    return `
      <div style="padding-top:16px;padding-bottom:20px;">
        ${isOffline ? `<div class="offline-banner" style="margin:0 20px 12px;">📡 Mode hors ligne — Données en cache (expire dans 1h)</div>` : ''}
        <!-- Banner -->
        <div class="section">
          <div class="banner">
            <h3>Livraison en<br/>30 min 🔥</h3>
            <p>16 pays d'Afrique<br/>de l'Ouest</p>
            <button class="banner-btn" onclick="Router.navigate('services')">Découvrir →</button>
          </div>
        </div>
        <!-- Selector pays -->
        <div style="padding:12px 20px 0;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:12px;color:var(--text2);">Livraison dans</span>
          <select id="country-select" style="background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:6px 12px;color:var(--text);font-size:13px;font-weight:600;" onchange="Store.set({country:this.value});DataLoader.homeData();">
            ${Object.entries(COUNTRIES).map(([code,c])=>`<option value="${code}" ${code===Store.get('country')?'selected':''}>${c.flag} ${c.name}</option>`).join('')}
          </select>
        </div>
        <!-- Catégories -->
        <div class="section mt-12">
          <div class="section-hd"><span class="section-title">Catégories</span><span class="section-link" onclick="Modal.open('allCategories')">Tout voir</span></div>
          <div class="cat-row">
            ${CATS.map(c=>`
              <div class="cat-item ${activeCategory===c.id?'active':''}" data-action="set-category" data-cat="${c.id}">
                <div class="cat-icon">${c.emoji}</div>
                <span class="cat-label">${c.label}</span>
              </div>`).join('')}
          </div>
        </div>
        <!-- Filtres rapides -->
        <div style="padding:8px 20px;"><div class="chips">
          <div class="chip ${Store.get('filters').isOpen?'active':''}" onclick="Store.set({filters:{...Store.get('filters'),isOpen:!Store.get('filters').isOpen}});DataLoader.shops();Router.renderPage();">🟢 Ouvert maintenant</div>
          <div class="chip ${Store.get('filters').freeDelivery?'active':''}" onclick="Store.set({filters:{...Store.get('filters'),freeDelivery:!Store.get('filters').freeDelivery}});DataLoader.shops();Router.renderPage();">✓ Livraison gratuite</div>
          <div class="chip" data-action="set-sort" data-sort="rating">⭐ Mieux notés</div>
          <div class="chip" data-action="set-sort" data-sort="orders">🔥 Plus populaires</div>
          <div class="chip" onclick="Modal.open('filters')">⚙️ Filtres</div>
        </div></div>
        <!-- Boutiques -->
        <div class="section mt-16">
          <div class="section-hd">
            <span class="section-title">Boutiques</span>
            <span class="section-link" onclick="Router.navigate('services')">Voir tout</span>
          </div>
          <div id="shop-list-container">${this._spinner()}</div>
        </div>
        <!-- Produits populaires -->
        <div class="section mt-20">
          <div class="section-hd"><span class="section-title">🔥 Populaires</span><span class="section-link">Voir tout</span></div>
          <div id="product-grid-container" class="product-grid">${this._spinner()}</div>
        </div>
        <!-- Produits digitaux -->
        <div class="section mt-20">
          <div class="section-hd">
            <span class="section-title">💻 Produits Digitaux</span>
            <span class="section-link" onclick="Store.set({activeCategory:'digital'});DataLoader.shops();Router.renderPage();">Voir tout</span>
          </div>
          <div id="digital-grid-container" class="product-grid">${this._spinner()}</div>
        </div>
        <!-- Premium CTA -->
        <div class="section mt-20">
          <div style="background:linear-gradient(135deg,rgba(255,184,0,0.08),rgba(255,107,0,0.08));border:1.5px solid rgba(255,184,0,0.25);border-radius:var(--r);padding:20px;cursor:pointer;" data-action="go-premium">
            <div style="font-size:28px;margin-bottom:8px;">👑</div>
            <div class="font-800" style="font-size:16px;">Passez Premium</div>
            <div class="text-muted text-sm mt-8">Livraison gratuite illimitée • Cashback 5% • Support VIP</div>
            <button class="btn btn-outline btn-sm mt-12" style="width:auto;pointer-events:none;">Voir les offres →</button>
          </div>
        </div>
      </div>`;
  },

  _shopScrollHtml(shops) {
    if (!shops?.length) return this._emptyState('🏪','Aucune boutique','Revenez bientôt !');
    return `<div class="shop-scroll">${shops.map(s=>this._shopCard(s)).join('')}</div>`;
  },

  _shopCard(s) {
    const fee = s.delivery_fee ?? 500;
    return `
      <div class="shop-card" data-action="open-shop" data-id="${s.id}">
        <div class="shop-thumb">
          <span style="font-size:44px;">${s.emoji||s.logo_url||'🏪'}</span>
          <div class="shop-thumb-badges">
            ${s.is_featured?'<span class="badge badge-amber" style="font-size:10px;">⭐ Vedette</span>':''}
            ${s.is_verified?'<span class="badge badge-verified" style="font-size:10px;">✓ Vérifié</span>':''}
          </div>
        </div>
        <div class="shop-body">
          <div class="shop-name">${s.name}</div>
          <div class="shop-meta">
            <span><span class="star-ic">⭐</span>${s.rating||'4.5'}</span>
            <span>🕐${s.estimated_time||30}min</span>
            <span class="${fee===0?'free-tag':''}">${fee===0?'✓ Gratuit':Fmt.moneyShort(fee)}</span>
            <span class="${s.is_open?'open-tag':'closed-tag'}">${s.is_open?'●Ouvert':'●Fermé'}</span>
          </div>
          ${s.distance_km?`<div style="font-size:11px;color:var(--text3);margin-top:4px;">📍 ${s.distance_km} km</div>`:''}
        </div>
      </div>`;
  },

  _productGridHtml(products) {
    if (!products?.length) return '';
    return products.slice(0,6).map(p => this._productCard({
      ...p, shopName: p.shops?.name || p.shopName || '',
      shopId: p.shops?.id || p.shop_id || p.shopId || '',
    })).join('');
  },

  _digitalGridHtml(products) {
    if (!products?.length) return this._emptyState('💻','Aucun produit digital','Bientôt disponible');
    return products.slice(0,4).map(p => this._productCard({
      ...p, shopName: p.shops?.name || '', shopId: p.shops?.id || p.shop_id || '',
    })).join('');
  },

  _productCard(p) {
    const isFav  = this.isFav(p.id);
    const isPromo = p.is_promo && p.promo_percent > 0;
    const price  = isPromo ? Math.floor(p.price*(1-p.promo_percent/100)) : p.price;
    return `
      <div class="product-card">
        <div class="product-thumb">
          <span style="font-size:52px;">${p.emoji||'📦'}</span>
          <div class="product-overlay"></div>
          <div class="product-badges">
            ${p.is_new?'<span class="badge badge-new" style="font-size:9px;">NEW</span>':''}
            ${isPromo?`<span class="badge badge-promo" style="font-size:9px;">-${p.promo_percent}%</span>`:''}
            ${p.is_digital?'<span class="badge badge-digital" style="font-size:9px;">💻 Digital</span>':''}
          </div>
          <div class="product-fav" data-action="toggle-fav" data-id="${p.id}" data-name="${p.name}">${isFav?'❤️':'🤍'}</div>
        </div>
        <div class="product-body">
          <div class="product-name truncate">${p.name}</div>
          <div class="product-shop truncate">${p.shopName||''}</div>
          <div class="product-foot">
            <div>
              <div class="product-price">${Fmt.moneyShort(price)}</div>
              ${isPromo?`<div class="product-old-price">${Fmt.moneyShort(p.price)}</div>`:''}
            </div>
            <button class="add-btn" data-action="add-to-cart"
              data-id="${p.id}" data-name="${p.name}" data-price="${price}"
              data-emoji="${p.emoji||'📦'}" data-shopname="${p.shopName||''}"
              data-shopid="${p.shopId||p.shop_id||''}"
              data-isdigital="${p.is_digital||false}">+</button>
          </div>
        </div>
      </div>`;
  },

  renderSuggestions(suggestions) {
    const existing = document.getElementById('search-suggestions');
    if (existing) existing.remove();
    if (!suggestions.length) return;
    const sb = document.getElementById('searchbar');
    if (!sb) return;
    const el = document.createElement('div');
    el.id = 'search-suggestions';
    el.className = 'search-suggestions';
    el.innerHTML = suggestions.map(s=>`
      <div class="suggestion-item" onclick="document.getElementById('search-input').value='${s.text}';DataLoader.searchQuery('${s.text}');Router.navigate('search');document.getElementById('search-suggestions')?.remove();">
        <div class="suggestion-icon">${s.icon||'🔍'}</div>
        <span>${s.text}</span>
        <span style="margin-left:auto;font-size:11px;color:var(--text3);">${s.type==='shop'?'Boutique':'Produit'}</span>
      </div>`).join('');
    sb.style.position = 'relative';
    sb.appendChild(el);
  },

  searchPage() {
    const { searchQuery, searchResults } = Store.get();
    return `
      <div style="padding:20px;">
        ${searchResults ? `
          <div class="section-title" style="margin-bottom:16px;">Résultats pour "${searchQuery}"</div>
          <div id="search-results-container">${this._searchResults(searchResults, searchQuery)}</div>
        ` : `
          <div id="search-results-container">${this._emptyState('🔍','Commencez à taper...','Recherchez des boutiques, produits, services...')}</div>
        `}
      </div>`;
  },

  _searchResults(data, q) {
    const shops    = data.shops    || [];
    const products = data.products || [];
    if (!shops.length && !products.length) return this._emptyState('🔍','Aucun résultat','Essayez avec d\'autres mots-clés.');
    return `
      ${shops.length?`<div class="section-title text-sm mb-8" style="margin-bottom:10px;">Boutiques (${shops.length})</div>
        <div class="shop-scroll" style="margin-bottom:20px;">${shops.map(s=>this._shopCard(s)).join('')}</div>`:''}
      ${products.length?`<div class="section-title text-sm" style="margin-bottom:10px;">Produits (${products.length})</div>
        <div class="product-grid">${products.map(p=>this._productCard({...p,shopName:p.shops?.name||'',shopId:p.shops?.id||''})).join('')}</div>`:''}`;
  },

  servicesPage() {
    return `
      <div style="padding:20px 0;">
        <div class="section">
          <div class="section-hd"><span class="section-title">Nos Services</span></div>
          <div class="service-grid">
            ${SERVICES_DATA.map(s=>`
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
          <div class="shop-scroll">
            ${RENTAL_ITEMS.map(d=>`
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
          <div class="section-hd"><span class="section-title">📦 Expédition — 16 pays</span></div>
          <div class="card card-pad">
            <p class="text-muted text-sm mb-16">Expédiez dans toutes les communes via nos partenaires agréés en Afrique de l'Ouest.</p>
            <div class="row-2" style="margin-bottom:12px;">
              <div class="field"><label>Départ</label>
                <select id="svc-oc"><optgroup label="Pays">${Object.entries(COUNTRIES).map(([code,c])=>`<option value="${code}">${c.flag} ${c.name}</option>`).join('')}</optgroup></select>
              </div>
              <div class="field"><label>Destination</label>
                <select id="svc-dc"><optgroup label="Pays">${Object.entries(COUNTRIES).map(([code,c])=>`<option value="${code}">${c.flag} ${c.name}</option>`).join('')}</optgroup></select>
              </div>
            </div>
            <button class="btn btn-primary" onclick="Modal.open('parcel')">Estimer & Expédier →</button>
          </div>
        </div>
      </div>`;
  },

  cartPage() {
    const cart = Store.get('cart');
    if (!cart.length) return `<div class="empty-state" style="height:80vh;justify-content:center;"><div class="empty-icon">🛒</div><div class="empty-title">Panier vide</div><div class="empty-text">Ajoutez des produits depuis les boutiques.</div><button class="btn btn-primary" style="width:auto;margin-top:12px;" onclick="Router.navigate('home')">Découvrir →</button></div>`;
    const subtotal = Store.cartTotal();
    const payMode  = Store.get('payMode');
    const providers = Store.get('paymentProviders');

    return `
      <div style="padding:20px;display:flex;flex-direction:column;gap:16px;">
        <div class="flex justify-between items-center">
          <div class="section-title">Mon Panier</div>
          <span class="badge badge-orange">${Store.cartCount()} article${Store.cartCount()>1?'s':''}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${cart.map(item=>`
            <div class="cart-item">
              <div class="cart-item-img">${item.emoji||'📦'}</div>
              <div class="cart-item-info">
                <div class="cart-item-name truncate">${item.name}</div>
                <div class="cart-item-shop">${item.shopName||''}</div>
                ${item.isDigital?'<span class="badge badge-digital" style="font-size:10px;margin-top:4px;">💻 Digital</span>':''}
                <div class="cart-item-price">${Fmt.moneyShort(item.price)}</div>
              </div>
              <div class="qty-ctrl">
                <div class="qty-btn" data-action="remove-from-cart" data-id="${item.id}">−</div>
                <div class="qty-num">${item.qty}</div>
                <div class="qty-btn" data-action="add-to-cart" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-emoji="${item.emoji||'📦'}" data-shopname="${item.shopName||''}">+</div>
              </div>
            </div>`).join('')}
        </div>
        <!-- Code promo -->
        <div>
          <div class="font-700 text-sm mb-8">Code promo</div>
          <div class="promo-box">
            <div class="field flex-1"><input id="promo-input" type="text" placeholder="KIBAALO10" style="text-transform:uppercase;"/></div>
            <button class="btn btn-secondary btn-sm" style="width:auto;white-space:nowrap;" onclick="Views._applyPromo()">Appliquer</button>
          </div>
          <div id="promo-feedback"></div>
        </div>
        <!-- Adresse -->
        <div class="field"><label>Adresse de livraison *</label>
          <div class="input-wrap">
            <span class="input-icon">📍</span>
            <input id="cart-addr" type="text" placeholder="Secteur, quartier, point de repère..." style="padding-left:44px;" autocomplete="street-address"/>
          </div>
        </div>
        <!-- Mode de paiement -->
        <div>
          <div class="font-700 text-sm mb-8">Mode de paiement</div>
          <div class="chips">
            <div class="chip ${payMode==='wallet'?'active':''}" onclick="Store.set({payMode:'wallet'});Router.renderPage();">👛 Portefeuille</div>
            ${providers.length > 0
              ? providers.map(p=>`<div class="chip ${payMode===p.key?'active':''}" onclick="Store.set({payMode:'${p.key}'});Router.renderPage();">${p.emoji} ${p.name}</div>`).join('')
              : `<div class="chip ${payMode==='orange_money'?'active':''}" onclick="Store.set({payMode:'orange_money'});Router.renderPage();">🟠 Orange Money</div>
                 <div class="chip ${payMode==='moov_money'?'active':''}" onclick="Store.set({payMode:'moov_money'});Router.renderPage();">💛 Moov Money</div>
                 <div class="chip ${payMode==='wave'?'active':''}" onclick="Store.set({payMode:'wave'});Router.renderPage();">🌊 Wave</div>`}
          </div>
        </div>
        <!-- Récap -->
        <div class="cart-summary">
          <div class="cart-row"><span>Sous-total</span><span>${Fmt.moneyShort(subtotal)}</span></div>
          <div class="cart-row"><span>Livraison</span><span>${Fmt.moneyShort(500)}</span></div>
          <div id="cart-discount-row" class="cart-row discount" style="display:none;"><span>Réduction</span><span id="cart-discount-val">-0 F</span></div>
          <div class="cart-row total"><span>Total</span><span id="cart-total">${Fmt.moneyShort(subtotal+500)}</span></div>
        </div>
        <button class="btn btn-primary" id="checkout-btn" onclick="Views._checkout()">
          Payer ${Fmt.moneyShort(subtotal+500)} →
        </button>
      </div>`;
  },

  async _applyPromo() {
    const code = document.getElementById('promo-input')?.value?.trim();
    const fb   = document.getElementById('promo-feedback');
    if (!code) return;
    try {
      const cart   = Store.get('cart');
      const shopId = cart[0]?.shopId || '';
      const subtotal = Store.cartTotal();
      const res = await API.shops.validatePromo({ code, shopId, orderAmount: subtotal });
      Store.set({ appliedPromo: res.data, promoDiscount: res.discount });
      if (fb) fb.innerHTML = `<div class="promo-success">✅ ${res.message}</div>`;
      const discRow = document.getElementById('cart-discount-row');
      const discVal = document.getElementById('cart-discount-val');
      const totalEl = document.getElementById('cart-total');
      if (discRow) discRow.style.display = 'flex';
      if (discVal) discVal.textContent = '-' + Fmt.moneyShort(res.discount);
      if (totalEl) totalEl.textContent = Fmt.moneyShort(subtotal + 500 - res.discount);
    } catch (err) {
      if (fb) fb.innerHTML = `<div class="promo-error">❌ ${err.message}</div>`;
    }
  },

  async _checkout() {
    const btn  = document.getElementById('checkout-btn');
    const addr = document.getElementById('cart-addr')?.value?.trim();
    const cart  = Store.get('cart');
    if (!addr) { Toast.show('⚠️ Entrez votre adresse de livraison'); return; }
    if (!cart.length) return;
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      const byShop = {};
      cart.forEach(item => {
        const sid = item.shopId || 's1';
        if (!byShop[sid]) byShop[sid] = [];
        byShop[sid].push({ productId: item.id, qty: item.qty });
      });
      const shopId  = Object.keys(byShop)[0];
      const promo   = Store.get('appliedPromo');
      const res = await API.orders.create({
        shopId,
        items:           byShop[shopId],
        deliveryAddress: addr,
        deliveryCity:    Auth.getUser()?.city,
        deliveryCountry: Auth.getUser()?.country,
        paymentMethod:   Store.get('payMode'),
        promoCode:       promo?.code,
      });
      Store.clearCart();
      Store.set({ appliedPromo: null, promoDiscount: 0 });
      // Redirection si paiement externe
      if (res.payment?.url) {
        window.open(res.payment.url, '_blank');
        Toast.show('🔗 Redirection vers le paiement...');
      } else if (res.payment?.message) {
        Toast.show('📱 ' + res.payment.message, 5000);
      } else {
        Toast.show('✅ Commande ' + res.data?.order_number + ' passée !');
      }
      Router.navigate('orders');
    } catch (err) {
      Toast.show('❌ ' + err.message);
    } finally {
      btn?.classList.remove('btn-loading');
      if (btn) btn.disabled = false;
    }
  },

  ordersPage() {
    return `<div style="padding:20px;"><div class="section-title mb-16">Mes Commandes</div><div id="orders-container">${this._spinner()}</div></div>`;
  },

  _orderCard(o) {
    const steps = ['pending','confirmed','preparing','in_route','delivered'];
    const idx   = Math.max(0, steps.indexOf(o.status));
    const lbls  = ['Confirmé','Préparé','En route','Livré'];
    const hasDigital = (o.items||[]).some(i => i.is_digital);
    return `
      <div style="background:var(--surface);border-radius:var(--r);padding:16px;margin-bottom:12px;border:1px solid var(--border2);">
        <div class="flex justify-between items-center mb-12">
          <div>
            <div class="font-700" style="font-size:15px;">${o.shops?.name||'Boutique'}</div>
            <div class="text-muted text-xs mt-4">${Fmt.relative(o.created_at)}</div>
          </div>
          <span class="badge ${Fmt.statusClass(o.status)}">${Fmt.statusLabel(o.status)}</span>
        </div>
        ${hasDigital?`<div class="mb-12"><span class="badge badge-digital">💻 Contient des produits digitaux — envoyés par email</span></div>`:''}
        <div class="steps-row" style="margin:12px 0;">
          ${lbls.map((lbl,i)=>`
            <div class="step">
              <div class="step-dot ${i<idx?'done':i===idx?'active':'wait'}">${i<idx?'✓':i+1}</div>
              <div class="step-lbl ${i<idx?'done':i===idx?'active':''}">${lbl}</div>
            </div>
            ${i<lbls.length-1?`<div class="step-line ${i<idx?'done':''}"></div>`:''}`).join('')}
        </div>
        <div class="flex justify-between items-center mt-12">
          <span class="text-muted text-xs mono">${o.order_number}</span>
          <span class="text-orange font-800">${Fmt.moneyShort(o.total)}</span>
        </div>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
          ${o.status==='in_route'?`<button class="btn btn-secondary btn-xs" data-action="track-order" data-id="${o.id}">🗺️ Suivre en temps réel</button>`:''}
          ${o.invoice_generated?`<button class="btn btn-ghost btn-xs" data-action="download-invoice" data-id="${o.id}">🧾 Télécharger la facture</button>`:''}
          ${o.status==='delivered'&&!o.is_reviewed?`<button class="btn btn-ghost btn-xs" data-action="review-order" data-id="${o.id}">⭐ Donner un avis</button>`:''}
        </div>
      </div>`;
  },

  profilePage() {
    const user      = Auth.getUser() || {};
    const isPremium = Auth.isPremium();
    const kycStatus = user.kycStatus || 'pending';
    const wallet    = Store.get('wallet');
    return `
      <div>
        <div class="profile-hd">
          <div class="profile-avatar-wrap">
            <div class="avatar avatar-xl avatar-orange" id="topbar-avatar" style="cursor:pointer;" onclick="Modal.open('editProfile')">
              ${user.avatarUrl?`<img src="${user.avatarUrl}" style="width:100%;height:100%;object-fit:cover;"/>`:(Fmt.initials(user)||'?')}
            </div>
            <div class="profile-avatar-edit" onclick="Modal.open('avatarUpload')">✏️</div>
          </div>
          <div class="profile-name">${user.firstName||''} ${user.lastName||''}</div>
          <div class="profile-role-badge">${Fmt.roleEmoji(user.role)} ${Fmt.roleLabel(user.role)}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
            ${isPremium?'<span class="badge badge-amber">👑 Premium actif</span>':''}
            ${kycStatus==='verified'?'<span class="badge badge-verified">✓ Identité vérifiée</span>':
              kycStatus==='submitted'?'<span class="badge badge-amber">🔍 Vérification en cours</span>':
              '<span class="badge badge-red" style="cursor:pointer;" data-action="open-kyc">⚠️ Identité non vérifiée</span>'}
            ${!user.isEmailVerified?'<span class="badge badge-red" style="font-size:10px;">📧 Email non vérifié</span>':''}
          </div>
        </div>
        <!-- Stats -->
        <div style="padding:0 20px 12px;">
          <div class="card card-pad" style="display:flex;justify-content:space-around;text-align:center;">
            <div><div class="font-800" style="font-size:18px;">${Store.cartCount()}</div><div class="text-muted text-xs">Panier</div></div>
            <div><div class="font-800" style="font-size:18px;">${Store.get('orders').length||'—'}</div><div class="text-muted text-xs">Commandes</div></div>
            <div><div class="font-800 text-orange" style="font-size:14px;" data-wallet-balance>${wallet?Fmt.moneyShort(wallet.balance):'—'}</div><div class="text-muted text-xs">Solde</div></div>
          </div>
        </div>
        <!-- Menu -->
        <div style="padding:0 20px;display:flex;flex-direction:column;gap:8px;">
          ${[
            { ic:'👛', bg:'rgba(255,107,0,0.1)', lbl:'Mon Portefeuille',     fn:"Modal.open('wallet')" },
            { ic:'🔔', bg:'rgba(107,104,112,0.1)',lbl:'Notifications',        fn:"Modal.open('notifications')" },
            { ic:'📦', bg:'rgba(0,200,83,0.1)',   lbl:'Mes Colis',           fn:"Modal.open('myColis')" },
            { ic:'❤️', bg:'rgba(255,61,61,0.1)',  lbl:'Mes Favoris',         fn:"Router.navigate('favorites')" },
            { ic:'📍', bg:'rgba(41,121,255,0.1)', lbl:'Mes Adresses',        fn:"Modal.open('addresses')" },
            { ic:'📋', bg:'rgba(107,104,112,0.1)',lbl:'Vérification d\'identité', fn:"Modal.open('kyc')" },
            { ic:'👑', bg:'rgba(255,184,0,0.1)',  lbl:`Premium ${isPremium?'✓ Actif':''}`, fn:"Modal.open('premium')" },
            { ic:'✏️', bg:'rgba(41,121,255,0.1)', lbl:'Modifier mon profil',  fn:"Modal.open('editProfile')" },
            { ic:'🔒', bg:'rgba(107,104,112,0.1)',lbl:'Changer de mot de passe', fn:"Modal.open('changePassword')" },
            { ic:'🌍', bg:'rgba(107,104,112,0.1)',lbl:'Langue & Pays',        fn:"Modal.open('langRegion')" },
            { ic:'🚪', bg:'rgba(255,61,61,0.1)',  lbl:'Déconnexion',          fn:"Views._logout()" },
          ].map(s=>`
            <div class="settings-item" onclick="${s.fn}">
              <div class="settings-ic" style="background:${s.bg};">${s.ic}</div>
              <div class="settings-lbl">${s.lbl}</div>
              <div class="settings-arr">›</div>
            </div>`).join('')}
        </div>
        <div style="text-align:center;color:var(--text3);font-size:11px;padding:24px;">KibaAlo v2.0 — 16 pays d'Afrique de l'Ouest 🌍</div>
      </div>`;
  },

  favoritesPage() {
    return `<div style="padding:20px;"><div class="section-title mb-16">❤️ Mes Favoris</div><div id="fav-container">${this._spinner()}</div></div>`;
  },

  _logout() {
    Auth.logout();
    SocketMgr.disconnect();
    OfflineCache.clear();
    Store.clearCart();
    Store.set({ screen:'role', selectedRole:null, activeTab:'home', shops:[], orders:[], wallet:null, dashStats:null, myShopId:null, authMode:'login' });
    localStorage.removeItem('kba_shop_id');
    Router.render();
    Toast.show('👋 Déconnecté avec succès');
  },

  walletPage() {
    const w = Store.get('wallet');
    return `
      <div>
        <div style="padding:20px;">
          <div class="wallet-card">
            <div class="wallet-lbl">Solde disponible</div>
            <div class="wallet-amount" data-wallet-balance>${w?Fmt.money(w.balance):'—'}</div>
            <div class="wallet-actions">
              ${[['💸','Retirer',"Modal.open('withdraw')"],['➕','Recharger',"Modal.open('recharge')"],['↔️','Transférer',"Toast.show('Bientôt')"],['📊','Rapport',"Toast.show('Bientôt')"]].map(([ic,lbl,fn])=>`
                <button class="wallet-action" onclick="${fn}"><span class="wallet-action-ic">${ic}</span><span class="wallet-action-lbl">${lbl}</span></button>`).join('')}
            </div>
          </div>
        </div>
        <div style="padding:0 20px;">
          <div class="section-title mb-12">Historique des transactions</div>
          <div id="txn-container">${this._spinner()}</div>
        </div>
      </div>`;
  },

  _transactionList(txns) {
    if (!txns?.length) return this._emptyState('💳','Aucune transaction','Vos transactions apparaîtront ici.');
    return txns.map(t=>`
      <div class="txn-item" style="margin-bottom:8px;">
        <div class="txn-icon" style="background:${t.type==='credit'?'rgba(0,200,83,0.12)':'rgba(255,61,61,0.12);'}">${t.type==='credit'?'⬆️':'⬇️'}</div>
        <div class="txn-info"><div class="txn-name">${t.description||t.type}</div><div class="txn-date">${Fmt.relative(t.created_at)}</div></div>
        <div class="txn-amount ${t.type==='credit'?'credit':'debit'}">${t.type==='credit'?'+':'−'}${Fmt.moneyShort(t.amount)}</div>
      </div>`).join('');
  },

  dashboard() {
    return `<div style="padding:20px;"><div class="section-title mb-16">Tableau de bord</div><div id="dashboard-container">${this._spinner()}</div></div>`;
  },

  _dashboardContent(data) {
    if (!data) return this._emptyState('📊','Aucune donnée','');
    const { monthRevenue=0, weekRevenue=0, monthOrders=0, deliveredOrders=0, pendingOrders=[], topProducts=[], revenueByDay=[], avgRating=0, shop } = data;
    const maxRev = Math.max(...(revenueByDay||[]).map(d=>d.revenue), 1);
    return `
      <div class="stats-grid mb-16">
        <div class="stat-card"><div class="stat-lbl">Revenus du mois</div><div class="stat-val" style="font-size:16px;color:var(--orange);">${Fmt.moneyShort(monthRevenue)}</div></div>
        <div class="stat-card"><div class="stat-lbl">Cette semaine</div><div class="stat-val" style="font-size:16px;">${Fmt.moneyShort(weekRevenue)}</div></div>
        <div class="stat-card"><div class="stat-lbl">Commandes</div><div class="stat-val">${monthOrders}</div></div>
        <div class="stat-card"><div class="stat-lbl">Livrées</div><div class="stat-val text-green">${deliveredOrders}</div></div>
      </div>
      <!-- Mini graphique -->
      <div class="card card-pad mb-16">
        <div class="font-700 mb-12">CA des 7 derniers jours</div>
        <div class="bar-chart">
          ${(revenueByDay||[]).map((d,i)=>`
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
              <div class="bar-chart-bar ${d.revenue===Math.max(...(revenueByDay||[]).map(x=>x.revenue))?'highlight':''}" style="height:${Math.max(8,(d.revenue/maxRev)*80)}px;width:100%;"></div>
              <div class="bar-chart-lbl">${d.label}</div>
            </div>`).join('')}
        </div>
        ${avgRating>0?`<div class="text-muted text-xs mt-12">Note moyenne: <span class="text-amber font-700">${avgRating} ⭐</span></div>`:''}
      </div>
      <!-- Boutique status -->
      ${shop?`<div class="card card-pad mb-16 flex justify-between items-center">
        <div><div class="font-700">${shop.name}</div><div class="text-muted text-xs">${shop.city}, ${shop.country}</div></div>
        <div class="flex gap-8 items-center">
          ${shop.is_verified?'<span class="badge badge-verified">✓ Vérifié</span>':''}
          <button class="btn btn-sm ${shop.is_open?'btn-green':'btn-secondary'}" onclick="API.shops.update('${shop.id}',{is_open:${!shop.is_open}}).then(()=>{Toast.show('Statut mis à jour');DataLoader.dashboard();}).catch(e=>Toast.show('❌ '+e.message))">
            ${shop.is_open?'🟢 Ouvert':'🔴 Fermé'}
          </button>
        </div>
      </div>`:''}
      <!-- Commandes en attente -->
      <div class="font-700 mb-12">En attente (${pendingOrders.length})</div>
      ${pendingOrders.length===0?'<p class="text-muted text-sm">Aucune commande en attente</p>':pendingOrders.map(o=>this._merchantOrderCard(o)).join('')}
      <!-- Top produits -->
      ${topProducts.length?`<div class="font-700 mb-12 mt-16">Top produits</div>
        ${topProducts.map(p=>`<div class="flex items-center gap-12 mb-8 card card-pad"><span style="font-size:28px;">${p.emoji||'📦'}</span><div class="flex-1"><div class="font-700 text-sm">${p.name}</div><div class="text-muted text-xs">${p.order_count||0} commandes</div></div><div class="text-orange font-800 text-sm">${Fmt.moneyShort(p.price)}</div></div>`).join('')}`:''}`;
  },

  products() {
    return `
      <div style="padding:20px;">
        <div class="flex justify-between items-center mb-16">
          <span class="section-title">Mes Produits</span>
          <button class="btn btn-primary btn-sm" onclick="Modal.open('addProduct')">+ Ajouter</button>
        </div>
        <div class="chips mb-16">
          <div class="chip active" onclick="">Tous</div>
          <div class="chip" onclick="">Physiques</div>
          <div class="chip" onclick="">Digitaux</div>
          <div class="chip" onclick="">En promo</div>
        </div>
        <div id="products-container">${this._spinner()}</div>
      </div>`;
  },

  _productListAdmin(products, shopId) {
    return products.map(p=>`
      <div style="background:var(--surface);border-radius:var(--r-sm);padding:14px;display:flex;align-items:center;gap:12px;border:1px solid var(--border2);margin-bottom:10px;">
        <span style="font-size:36px;flex-shrink:0;">${p.emoji||'📦'}</span>
        <div style="flex:1;min-width:0;">
          <div class="font-700 text-sm truncate">${p.name}</div>
          <div class="flex gap-8 mt-4 items-center flex-wrap">
            <div class="text-orange font-700 text-sm">${Fmt.moneyShort(p.price)}</div>
            ${p.is_digital?'<span class="badge badge-digital" style="font-size:9px;">💻 Digital</span>':''}
            ${p.is_promo?`<span class="badge badge-promo" style="font-size:9px;">-${p.promo_percent}%</span>`:''}
            <span class="text-xs ${p.is_available?'text-green':'text-red'}">${p.is_available?'✅ Dispo':'❌ Inactif'}</span>
          </div>
          <div class="text-muted text-xs mt-4">${p.order_count||0} commandes · stock: ${p.stock===-1?'∞':p.stock}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          <button class="btn btn-secondary btn-xs" data-action="delete-product" data-id="${p.id}" data-shopid="${shopId}" style="font-size:12px;">🗑️</button>
        </div>
      </div>`).join('');
  },

  merchantOrders() {
    return `
      <div style="padding:20px;">
        <div class="section-title mb-12">Commandes reçues</div>
        <div class="chips mb-16">
          <div class="chip active">Toutes</div>
          <div class="chip" onclick="DataLoader.merchantOrders()">⏳ En attente</div>
          <div class="chip">🛵 En route</div>
          <div class="chip">✅ Livrées</div>
        </div>
        <div id="merchant-orders-container">${this._spinner()}</div>
      </div>`;
  },

  _merchantOrderCard(o) {
    const client = o.users || o['users!client_id'] || o.client || {};
    const clientName = client.first_name ? `${client.first_name} ${client.last_name}` : 'Client';
    const items  = Array.isArray(o.items) ? o.items.map(i=>`${i.emoji||''}${i.name} x${i.qty}`).join(', ') : '—';
    return `
      <div style="background:var(--surface);border-radius:var(--r-sm);padding:16px;margin-bottom:10px;border:1px solid var(--border2);">
        <div class="flex justify-between items-start mb-8">
          <div class="flex gap-10 items-center">
            <div class="avatar avatar-sm avatar-orange">${(client.first_name||'?')[0].toUpperCase()}</div>
            <div><div class="font-700 text-sm">${clientName}</div><div class="text-muted text-xs">${Fmt.relative(o.created_at)}</div></div>
          </div>
          <span class="badge ${Fmt.statusClass(o.status)}">${Fmt.statusLabel(o.status)}</span>
        </div>
        <div class="text-muted text-xs mb-8 truncate">${items.substring(0,80)}${items.length>80?'...':''}</div>
        <div class="flex justify-between items-center mb-12">
          <span class="text-muted text-xs mono">${o.order_number||''}</span>
          <span class="font-800 text-orange">${Fmt.moneyShort(o.total)}</span>
        </div>
        ${o.status==='pending'?`<div class="flex gap-10"><button class="btn btn-primary btn-sm" data-action="confirm-order" data-id="${o.id}">✅ Confirmer</button><button class="btn btn-secondary btn-sm" data-action="reject-order" data-id="${o.id}">Refuser</button></div>`:
          o.status==='confirmed'?`<button class="btn btn-secondary btn-sm" data-action="mark-ready" data-id="${o.id}" style="width:auto;">📦 Marquer comme prêt</button>`:''}
      </div>`;
  },

  livreurHome() {
    return `
      <div style="padding:20px;display:flex;flex-direction:column;gap:16px;">
        <div class="card card-pad flex justify-between items-center">
          <div><div class="text-muted text-xs" style="text-transform:uppercase;letter-spacing:.5px;">Statut</div>
            <div class="font-700" style="font-size:16px;margin-top:6px;" id="livreur-status-lbl">🟢 Disponible</div></div>
          <button class="btn btn-green btn-sm" id="toggle-avail-btn" onclick="Views._toggleAvail()">Actif</button>
        </div>
        <div id="delivery-request-container">
          <div class="delivery-request">
            <div class="flex justify-between items-center mb-10">
              <div class="font-700">🆕 Nouvelle demande</div>
              <span class="badge badge-orange">0.8 km</span>
            </div>
            <div class="text-muted text-sm mb-8">📍 Boutique → Secteur 15</div>
            <div style="display:flex;gap:8px;font-size:12px;color:var(--text2);margin-bottom:14px;"><span>📦 3 articles</span><span>•</span><span>💰 1 200 F</span><span>•</span><span>🕐 ~20 min</span></div>
            <div style="display:flex;gap:10px;">
              <button class="btn btn-primary" style="flex:2;" onclick="Views._acceptDemoDelivery()">✅ Accepter</button>
              <button class="btn btn-secondary" style="flex:1;" onclick="document.getElementById('delivery-request-container').innerHTML=''">Refuser</button>
            </div>
          </div>
        </div>
        <div class="section-title">Stats du jour</div>
        <div id="livreur-stats-container">
          <div class="stats-grid">
            ${[{lbl:'Courses',val:'—'},{lbl:'Gains/jour',val:'—'},{lbl:'Gains/mois',val:'—'},{lbl:'Solde',val:'—'}].map(s=>`<div class="stat-card"><div class="stat-lbl">${s.lbl}</div><div class="stat-val" style="font-size:18px;">${s.val}</div></div>`).join('')}
          </div>
        </div>
      </div>`;
  },

  _livreurStats(data) {
    if (!data) return '';
    return `<div class="stats-grid">
      <div class="stat-card"><div class="stat-lbl">Aujourd'hui</div><div class="stat-val">🛵 ${data.todayDeliveries||0}</div><div class="stat-change up">+${Fmt.moneyShort(data.todayEarnings||0)}</div></div>
      <div class="stat-card"><div class="stat-lbl">Cette semaine</div><div class="stat-val">${data.weekDeliveries||0}</div><div class="stat-change up">+${Fmt.moneyShort(data.weekEarnings||0)}</div></div>
      <div class="stat-card"><div class="stat-lbl">Ce mois</div><div class="stat-val">${data.monthDeliveries||0}</div><div class="stat-change up">+${Fmt.moneyShort(data.monthEarnings||0)}</div></div>
      <div class="stat-card"><div class="stat-lbl">Solde</div><div class="stat-val text-orange" style="font-size:14px;" data-wallet-balance>${Fmt.moneyShort(data.walletBalance||0)}</div><div class="stat-change">${data.rating||0} ⭐</div></div>
    </div>`;
  },

  _toggleAvail() {
    const btn = document.getElementById('toggle-avail-btn');
    const lbl = document.getElementById('livreur-status-lbl');
    const isOn = btn?.textContent.trim() === 'Actif';
    if (btn) { btn.textContent = isOn?'Inactif':'Actif'; btn.className = `btn btn-sm ${isOn?'btn-secondary':'btn-green'}`; }
    if (lbl) lbl.textContent = isOn ? '🔴 Indisponible' : '🟢 Disponible';
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        API.livreurs.setAvailability(!isOn, pos.coords.latitude, pos.coords.longitude).catch(() => {});
      }, () => API.livreurs.setAvailability(!isOn).catch(() => {}));
    } else {
      API.livreurs.setAvailability(!isOn).catch(() => {});
    }
    Toast.show(isOn ? '🔴 Vous êtes indisponible' : '🟢 Vous êtes disponible');
  },

  _acceptDemoDelivery() {
    document.getElementById('delivery-request-container').innerHTML = '';
    Toast.show('✅ Course acceptée ! GPS activé...');
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(pos => {
        API.livreurs.sendLocation(pos.coords.latitude, pos.coords.longitude).catch(() => {});
      }, null, { enableHighAccuracy: true, maximumAge: 10000 });
    }
  },

  livreurCourses() {
    return `<div style="padding:20px;"><div class="section-title mb-16">Mes Courses</div><div id="courses-container">${this._spinner()}</div></div>`;
  },

  _courseCard(o) {
    const shop = o.shops || {};
    return `
      <div class="order-item mb-10">
        <div class="order-thumb">🛵</div>
        <div class="order-info">
          <div class="order-customer">${shop.name||'Boutique'}</div>
          <div class="order-detail">→ ${o.delivery_address||o.delivery_city||'—'}</div>
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
            <div class="wallet-amount" data-wallet-balance>${e?Fmt.money(e.monthEarnings||0):'—'}</div>
            <div style="display:flex;gap:10px;margin-top:20px;position:relative;z-index:1;">
              <button class="wallet-action" onclick="Modal.open('withdraw')"><span class="wallet-action-ic">💸</span><span class="wallet-action-lbl">Retirer</span></button>
              <button class="wallet-action" onclick="Toast.show('📊 Rapport — Bientôt')"><span class="wallet-action-ic">📊</span><span class="wallet-action-lbl">Rapport</span></button>
            </div>
          </div>
        </div>
        <div style="padding:0 20px;"><div class="section-title mb-12">Historique</div><div id="earnings-container">${this._spinner()}</div></div>
      </div>`;
  },

  _earningsHistory(data) {
    if (!data) return this._emptyState('💰','Aucune donnée','');
    const days = data.earningsByDay || [];
    const maxE = Math.max(...days.map(d=>d.earnings), 1);
    return `
      <div class="stats-grid mb-16">
        <div class="stat-card"><div class="stat-lbl">Courses totales</div><div class="stat-val">${data.totalDeliveries||0}</div></div>
        <div class="stat-card"><div class="stat-lbl">Note</div><div class="stat-val">${data.rating||0} ⭐</div></div>
      </div>
      ${days.length?`<div class="card card-pad mb-16">
        <div class="font-700 mb-12">Gains 7 derniers jours</div>
        <div class="bar-chart">
          ${days.map(d=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
            <div class="bar-chart-bar ${d.earnings===Math.max(...days.map(x=>x.earnings))?'highlight':''}" style="height:${Math.max(4,(d.earnings/maxE)*80)}px;width:100%;"></div>
            <div class="bar-chart-lbl">${d.label}</div>
          </div>`).join('')}
        </div>
      </div>`:''}
      <div class="txn-item" style="margin-bottom:8px;">
        <div class="txn-icon" style="background:rgba(0,200,83,0.12);">💰</div>
        <div class="txn-info"><div class="txn-name">Solde portefeuille</div><div class="txn-date">Disponible au retrait</div></div>
        <div class="txn-amount credit">${Fmt.moneyShort(data.walletBalance||0)}</div>
      </div>`;
  },

  _parcelCard(p) {
    return `
      <div class="card card-pad mb-10">
        <div class="flex justify-between items-center">
          <div class="font-700 mono text-sm">${p.tracking_code}</div>
          <span class="badge badge-orange">${p.status}</span>
        </div>
        <div class="text-muted text-xs mt-8">${Object.values(COUNTRIES).find(c=>c.name)?.flag||''} ${p.origin_city} → ${p.dest_city}</div>
        <div class="flex justify-between mt-8"><span class="text-muted text-xs">${Fmt.date(p.created_at)}</span><span class="text-orange font-700 text-sm">${Fmt.moneyShort(p.price)}</span></div>
        <button class="btn btn-ghost btn-xs mt-8 w-full" data-action="track-parcel" data-code="${p.tracking_code}">📍 Suivre ce colis</button>
      </div>`;
  },

  _addressList(addresses) {
    if (!addresses.length) return this._emptyState('📍','Aucune adresse','Ajoutez vos adresses de livraison habituelles.');
    return addresses.map(a=>`
      <div class="card card-pad mb-8 flex justify-between items-center">
        <div><div class="font-700 text-sm">${a.label}</div><div class="text-muted text-xs mt-4">${a.address}${a.city?', '+a.city:''}</div></div>
        ${a.is_default?'<span class="badge badge-orange">Par défaut</span>':''}
      </div>`).join('');
  },

  // ── MODALES ──────────────────────────────────────────────
  modal(name, data) {
    const map = {
      shopDetail:      () => this._modalShop(data),
      tracking:        () => this._modalTracking(data),
      wallet:          () => this._modalWallet(),
      recharge:        () => this._modalRecharge(),
      withdraw:        () => this._modalWithdraw(),
      parcel:          () => this._modalParcel(),
      rental:          () => this._modalRental(data),
      premium:         () => this._modalPremium(),
      addProduct:      () => this._modalAddProduct(),
      review:          () => this._modalReview(data),
      notifications:   () => this._modalNotifications(),
      myColis:         () => this._modalMyColis(),
      editProfile:     () => this._modalEditProfile(),
      avatarUpload:    () => this._modalAvatarUpload(),
      changePassword:  () => this._modalChangePassword(),
      kyc:             () => this._modalKyc(),
      addresses:       () => this._modalAddresses(),
      filters:         () => this._modalFilters(),
      forgotPassword:  () => this._modalForgotPassword(),
      digitalBuy:      () => this._modalDigitalBuy(data),
      digitalDownload: () => this._modalDigitalDownload(data),
      trackParcel:     () => this._modalTrackParcel(data),
      langRegion:      () => this._modalLangRegion(),
      allCategories:   () => this._modalAllCategories(),
    };
    const fn = map[name];
    return fn ? '<div class="modal-handle"></div>' + fn() : '';
  },

  _modalShop(data) {
    if (!data?.name) return `<div class="modal-title">Boutique</div>${this._spinner()}`;
    const products = data.products || [];
    return `
      <div style="text-align:center;margin-bottom:16px;">
        <div style="font-size:56px;">${data.emoji||'🏪'}</div>
        <div class="font-800" style="font-size:20px;margin-top:8px;">${data.name}</div>
        <div style="display:flex;justify-content:center;gap:8px;margin-top:8px;flex-wrap:wrap;">
          ${data.is_verified?'<span class="badge badge-verified">✓ Vérifié</span>':''}
          ${data.is_open?'<span class="badge badge-green">● Ouvert</span>':'<span class="badge badge-red">● Fermé</span>'}
        </div>
        <div style="display:flex;justify-content:space-around;color:var(--text2);font-size:13px;margin-top:12px;">
          <span>⭐ ${data.rating||'4.5'}</span>
          <span>🕐 ~${data.estimated_time||30} min</span>
          <span>${(data.delivery_fee||0)===0?'✓ Gratuit':Fmt.moneyShort(data.delivery_fee||500)}</span>
        </div>
        ${data.whatsapp?`<a href="https://wa.me/${data.whatsapp.replace(/\D/g,'')}" target="_blank" style="display:inline-flex;align-items:center;gap:6px;margin-top:12px;background:rgba(0,200,83,0.1);border:1px solid rgba(0,200,83,0.3);border-radius:8px;padding:8px 16px;color:var(--green);font-size:13px;font-weight:700;">💬 WhatsApp</a>`:''}
      </div>
      <!-- Sous-catégories -->
      ${data.subcategory?`<div class="chips mb-12"><div class="chip active">${data.subcategory}</div></div>`:''}
      ${products.length===0?this._emptyState('📦','Aucun produit disponible',''):
        products.map(p=>`
          <div style="background:var(--surface);border-radius:var(--r-sm);padding:14px;margin-bottom:10px;border:1px solid var(--border2);display:flex;align-items:center;gap:12px;">
            <span style="font-size:36px;flex-shrink:0;">${p.emoji||'📦'}</span>
            <div style="flex:1;min-width:0;">
              <div class="font-700 text-sm truncate">${p.name}</div>
              ${p.is_digital?'<span class="badge badge-digital" style="font-size:9px;margin-top:4px;">💻 Digital</span>':''}
              ${p.description?`<div class="text-muted text-xs mt-4 truncate">${p.description}</div>`:''}
              <div class="text-orange font-800 mt-4">${Fmt.moneyShort(p.is_promo&&p.promo_percent?Math.floor(p.price*(1-p.promo_percent/100)):p.price)}</div>
            </div>
            <button class="btn btn-primary btn-sm" style="flex-shrink:0;"
              data-action="add-to-cart"
              data-id="${p.id}" data-name="${p.name}"
              data-price="${p.is_promo&&p.promo_percent?Math.floor(p.price*(1-p.promo_percent/100)):p.price}"
              data-emoji="${p.emoji||'📦'}" data-shopname="${data.name}"
              data-shopid="${data.id}" data-isdigital="${p.is_digital||false}">+</button>
          </div>`).join('')}`;
  },

  _modalTracking(data) {
    const orderId = data?.orderId;
    if (orderId) setTimeout(() => DataLoader.trackOrder(orderId), 0);
    return `
      <div class="modal-title">📍 Suivi en temps réel</div>
      <div class="map-box mb-16">
        <div class="map-grid"></div>
        <div class="map-pin">📍</div>
        <div class="map-info-badge" id="tracking-eta">🛵 Localisation en cours...</div>
      </div>
      <div id="tracking-status-container">${this._spinner()}</div>`;
  },

  _trackingStatus(order) {
    if (!order) return '<p class="text-muted text-sm">Données non disponibles</p>';
    const livreur = order.livreur || order['livreur:users!livreur_id'];
    const profile  = order.livreur_profile || order['livreur_profile:livreurs!livreur_id'];
    const steps    = ['pending','confirmed','preparing','in_route','delivered'];
    const idx      = steps.indexOf(order.status);
    const lbls     = ['Confirmé','Préparé','En route','Livré'];
    const etaEl    = document.getElementById('tracking-eta');
    if (etaEl) etaEl.textContent = `🛵 ${order.status==='in_route'?'En route':'~'+order.estimated_time+' min'}`;
    return `
      <div class="steps-row mb-20">
        ${lbls.map((lbl,i)=>`
          <div class="step">
            <div class="step-dot ${i<idx?'done':i===idx?'active':'wait'}">${i<idx?'✓':i+1}</div>
            <div class="step-lbl ${i<idx?'done':i===idx?'active':''}">${lbl}</div>
          </div>
          ${i<lbls.length-1?`<div class="step-line ${i<idx?'done':''}"></div>`:''}`).join('')}
      </div>
      ${livreur?`
        <div class="livreur-card">
          <div class="avatar avatar-md avatar-orange">${(livreur.first_name||'?')[0].toUpperCase()}</div>
          <div class="livreur-info">
            <div class="livreur-name">${livreur.first_name} ${livreur.last_name}</div>
            <div class="livreur-vehicle">${profile?.vehicle_type==='moto'?'🛵':'🚗'} ${profile?.vehicle_plate||'—'}</div>
            <div class="livreur-rating">⭐ ${profile?.rating||'4.8'} · ${profile?.total_deliveries||0} livraisons</div>
          </div>
          <div class="livreur-actions">
            <button class="livreur-action-btn" onclick="Toast.show('📞 Appel en cours...')">📞</button>
            <button class="livreur-action-btn" onclick="Toast.show('💬 Chat — Bientôt')">💬</button>
          </div>
        </div>` : '<p class="text-muted text-sm text-center">Livreur en cours d\'assignation...</p>'}`;
  },

  _modalWallet() {
    const w = Store.get('wallet');
    return `
      <div class="modal-title">👛 Mon Portefeuille</div>
      <div class="wallet-card mb-16">
        <div class="wallet-lbl">Solde disponible</div>
        <div class="wallet-amount" data-wallet-balance>${w?Fmt.money(w.balance):'—'}</div>
      </div>
      <button class="btn btn-primary mb-10" onclick="Modal.open('recharge')">💳 Recharger</button>
      <button class="btn btn-secondary" onclick="Modal.open('withdraw')">💸 Retirer des fonds</button>
      <div class="section-title mt-20 mb-12">Historique récent</div>
      <div id="txn-container">${this._spinner()}</div>`;
  },

  _modalRecharge() {
    const providers = Store.get('paymentProviders');
    return `
      <div class="modal-title">💳 Recharger le portefeuille</div>
      <div class="field-group">
        <div class="field"><label>Montant (F CFA)</label><input id="r-amount" type="number" placeholder="5000" min="100" step="500"/></div>
        <div class="field"><label>Via</label>
          <select id="r-provider">
            <option value="orange_money">🟠 Orange Money</option>
            <option value="moov_money">💛 Moov Money</option>
            <option value="wave">🌊 Wave</option>
            <option value="mtn_money">💛 MTN Money</option>
            <option value="airtel_money">🔴 Airtel Money</option>
            <option value="card">💳 Carte bancaire</option>
          </select>
        </div>
        <div class="field"><label>Numéro Mobile Money (si différent)</label><input id="r-phone" type="tel" placeholder="+226 70 00 00 00"/></div>
      </div>
      <button class="btn btn-primary mt-20" id="recharge-btn" onclick="Views._doRecharge()">Recharger →</button>`;
  },

  async _doRecharge() {
    const btn = document.getElementById('recharge-btn');
    const amount = parseInt(document.getElementById('r-amount')?.value);
    const prov   = document.getElementById('r-provider')?.value;
    const phone  = document.getElementById('r-phone')?.value?.trim();
    if (!amount || amount < 100) { Toast.show('⚠️ Minimum 100 F CFA'); return; }
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      const res = await API.wallet.recharge({ amount, provider: prov, phone: phone||undefined });
      Modal.close();
      if (res.payment?.url) { window.open(res.payment.url, '_blank'); Toast.show('🔗 Redirection vers le paiement...'); }
      else if (res.payment?.message) Toast.show('📱 ' + res.payment.message, 5000);
      else { Toast.show(`✅ +${Fmt.moneyShort(amount)} ajoutés !`); DataLoader.wallet(); }
    } catch(err) { Toast.show('❌ ' + err.message); }
    finally { btn.classList.remove('btn-loading'); btn.disabled = false; }
  },

  _modalWithdraw() {
    return `
      <div class="modal-title">💸 Retirer des fonds</div>
      <div class="field-group">
        <div class="field"><label>Montant (F CFA)</label><input id="w-amount" type="number" placeholder="10000" min="500" step="500"/></div>
        <div class="field"><label>Numéro de réception</label><input id="w-phone" type="tel" placeholder="+226 70 00 00 00"/></div>
        <div class="field"><label>Via</label>
          <select id="w-provider">
            <option value="orange_money">🟠 Orange Money</option>
            <option value="moov_money">💛 Moov Money</option>
            <option value="wave">🌊 Wave</option>
          </select>
        </div>
      </div>
      <button class="btn btn-primary mt-20" id="withdraw-btn" onclick="Views._doWithdraw()">Retirer →</button>`;
  },

  async _doWithdraw() {
    const btn = document.getElementById('withdraw-btn');
    const amount = parseInt(document.getElementById('w-amount')?.value);
    const phone  = document.getElementById('w-phone')?.value?.trim();
    const prov   = document.getElementById('w-provider')?.value;
    if (!amount || amount < 500) { Toast.show('⚠️ Minimum 500 F CFA'); return; }
    if (!phone) { Toast.show('⚠️ Numéro requis'); return; }
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      await API.wallet.withdraw({ amount, phone, provider: prov });
      Modal.close();
      Toast.show(`✅ Retrait de ${Fmt.moneyShort(amount)} initié`);
      DataLoader.wallet();
    } catch(err) { Toast.show('❌ ' + err.message); }
    finally { btn.classList.remove('btn-loading'); btn.disabled = false; }
  },

  _modalParcel() {
    return `
      <div class="modal-title">📦 Expédition de Colis — 16 pays</div>
      <div style="background:rgba(255,107,0,0.08);border:1.5px solid rgba(255,107,0,0.2);border-radius:var(--r-sm);padding:14px;display:flex;gap:12px;align-items:center;margin-bottom:20px;">
        <span style="font-size:22px;">💡</span>
        <div><div class="font-700 text-sm">Tarif estimé</div><div class="text-orange font-800" style="font-size:18px;" id="parcel-est">Remplissez le formulaire</div></div>
      </div>
      <div class="field-group">
        <div class="row-2">
          <div class="field"><label>Pays départ</label>
            <select id="p-oc" onchange="Views._updateParcelCities()">
              ${Object.entries(COUNTRIES).map(([code,c])=>`<option value="${code}">${c.flag} ${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="field"><label>Ville départ</label>
            <select id="p-ocity">${(CITIES.BF||[]).map(c=>`<option>${c}</option>`).join('')}</select>
          </div>
        </div>
        <div class="row-2">
          <div class="field"><label>Pays destination</label>
            <select id="p-dc" onchange="Views._updateParcelCities()">
              ${Object.entries(COUNTRIES).map(([code,c])=>`<option value="${code}" ${code==='NE'?'selected':''}>${c.flag} ${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="field"><label>Ville destination</label>
            <select id="p-dcity">${(CITIES.NE||[]).map(c=>`<option>${c}</option>`).join('')}</select>
          </div>
        </div>
        <div class="row-2">
          <div class="field"><label>Poids (kg)</label><input id="p-weight" type="number" placeholder="2" min="0.1" step="0.5" oninput="Views._estimateParcel()"/></div>
          <div class="field"><label>Assurance</label>
            <div class="toggle-wrap"><span class="text-sm">Inclure (+5%)</span><label class="toggle"><input type="checkbox" id="p-insurance"/><span class="toggle-slider"></span></label></div>
          </div>
        </div>
        <div class="field"><label>Nom du destinataire *</label><input id="p-rname" type="text" placeholder="Nom complet"/></div>
        <div class="field"><label>Téléphone destinataire *</label><input id="p-rphone" type="tel" placeholder="+227 90 00 00 00"/></div>
        <div class="field"><label>Email destinataire</label><input id="p-remail" type="email" placeholder="email@exemple.com"/></div>
        <div class="field"><label>Contenu du colis</label><input id="p-content" type="text" placeholder="Vêtements, documents..."/></div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span class="text-sm">Colis fragile</span>
          <label class="toggle"><input type="checkbox" id="p-fragile"/><span class="toggle-slider"></span></label>
        </div>
      </div>
      <button class="btn btn-primary mt-20" id="parcel-btn" onclick="Views._submitParcel()">Réserver l'expédition →</button>`;
  },

  _updateParcelCities() {
    const oc = document.getElementById('p-oc')?.value || 'BF';
    const dc = document.getElementById('p-dc')?.value || 'NE';
    const ocEl = document.getElementById('p-ocity');
    const dcEl = document.getElementById('p-dcity');
    if (ocEl) ocEl.innerHTML = (CITIES[oc]||CITIES.BF).map(c=>`<option>${c}</option>`).join('');
    if (dcEl) dcEl.innerHTML = (CITIES[dc]||CITIES.NE).map(c=>`<option>${c}</option>`).join('');
    this._estimateParcel();
  },

  async _estimateParcel() {
    const oc = document.getElementById('p-oc')?.value || 'BF';
    const dc = document.getElementById('p-dc')?.value || 'NE';
    const w  = document.getElementById('p-weight')?.value || '1';
    const el = document.getElementById('parcel-est');
    if (!el) return;
    try {
      const res = await API.parcels.estimate({ originCountry:oc, destCountry:dc, weightKg:parseFloat(w) });
      const ins = document.getElementById('p-insurance')?.checked;
      const price = res.data.estimatedPrice + (ins ? res.data.insuranceAmount : 0);
      el.textContent = `${Fmt.moneyShort(price)} · ${res.data.estimatedDays}`;
    } catch { el.textContent = 'Estimation indisponible'; }
  },

  async _submitParcel() {
    const btn = document.getElementById('parcel-btn');
    const rname  = document.getElementById('p-rname')?.value?.trim();
    const rphone = document.getElementById('p-rphone')?.value?.trim();
    if (!rname||!rphone) { Toast.show('⚠️ Nom et téléphone destinataire requis'); return; }
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      const user = Auth.getUser();
      const res = await API.parcels.create({
        senderName:    `${user.firstName} ${user.lastName}`,
        senderPhone:   user.phone || '',
        senderEmail:   user.email,
        receiverName:  rname,
        receiverPhone: rphone,
        receiverEmail: document.getElementById('p-remail')?.value?.trim(),
        originCity:    document.getElementById('p-ocity')?.value,
        originCountry: document.getElementById('p-oc')?.value || 'BF',
        destCity:      document.getElementById('p-dcity')?.value,
        destCountry:   document.getElementById('p-dc')?.value || 'NE',
        weightKg:      parseFloat(document.getElementById('p-weight')?.value)||1,
        contentDesc:   document.getElementById('p-content')?.value?.trim(),
        isFragile:     document.getElementById('p-fragile')?.checked||false,
        withInsurance: document.getElementById('p-insurance')?.checked||false,
      });
      Modal.close();
      Toast.show(`📦 Colis enregistré ! Code : ${res.data?.tracking_code||'—'}`);
    } catch(err) { Toast.show('❌ ' + err.message); }
    finally { btn.classList.remove('btn-loading'); btn.disabled = false; }
  },

  _modalRental(data) {
    const item = RENTAL_ITEMS.find(r=>r.name===data?.name) || RENTAL_ITEMS[0];
    const today = new Date().toISOString().split('T')[0];
    return `
      <div class="modal-title">📺 Location d'Appareil</div>
      <div style="text-align:center;font-size:64px;margin:12px 0;">${item.emoji}</div>
      <div class="font-800" style="font-size:18px;text-align:center;">${item.name}</div>
      <div class="text-orange font-800" style="text-align:center;font-size:20px;margin-bottom:20px;">${Fmt.moneyShort(item.price)}/jour</div>
      <div class="field-group">
        <div class="row-2">
          <div class="field"><label>Date début *</label><input id="rent-start" type="date" min="${today}" onchange="Views._calcRental()"/></div>
          <div class="field"><label>Date fin *</label><input id="rent-end" type="date" min="${today}" onchange="Views._calcRental()"/></div>
        </div>
        <div id="rent-total" style="background:rgba(255,107,0,0.08);border-radius:var(--r-sm);padding:12px;text-align:center;display:none;">
          <div class="text-muted text-xs">Total estimé</div>
          <div class="text-orange font-800" style="font-size:20px;" id="rent-total-val">—</div>
        </div>
        <div class="field"><label>Ville *</label>
          <select id="rent-city">
            ${Object.entries(COUNTRIES).map(([code,c])=>`<optgroup label="${c.flag} ${c.name}">${(CITIES[code]||[]).map(city=>`<option value="${city}">${city}</option>`).join('')}</optgroup>`).join('')}
          </select>
        </div>
        <div class="field"><label>Notes</label><textarea id="rent-notes" placeholder="Instructions de livraison, horaires..."></textarea></div>
      </div>
      <button class="btn btn-primary mt-20" onclick="Toast.show('✅ Location réservée ! Nous vous contactons sous 2h.');Modal.close();">Confirmer la réservation →</button>`;
  },

  _calcRental() {
    const start = document.getElementById('rent-start')?.value;
    const end   = document.getElementById('rent-end')?.value;
    const totalEl = document.getElementById('rent-total');
    const valEl   = document.getElementById('rent-total-val');
    if (start && end) {
      const days = Math.max(1, Math.ceil((new Date(end)-new Date(start))/(1000*60*60*24)));
      const item = RENTAL_ITEMS[0]; // simplifié
      if (totalEl) totalEl.style.display = 'block';
      if (valEl) valEl.textContent = Fmt.moneyShort(days * (Store.get('modalData')?.price||3500)) + ` (${days} jour${days>1?'s':''})`;
    }
  },

  _modalPremium() {
    const isPremium = Auth.isPremium();
    const premiumUntil = Auth.getUser()?.premiumUntil;
    return `
      <div class="premium-banner mb-20">
        <span class="premium-icon">👑</span>
        <div class="premium-title">KibaAlo Premium</div>
        <div class="premium-sub">${isPremium?`✅ Actif jusqu'au ${Fmt.date(premiumUntil)}`:'Profitez de fonctionnalités exclusives'}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${[
          { key:'monthly',   name:'Mensuel',    price:'2 500', unit:'/mois', popular:false, feats:['5 livraisons gratuites/mois','Priorité de livraison','Support prioritaire'] },
          { key:'quarterly', name:'Trimestriel',price:'6 500', unit:'/3 mois', popular:false, feats:['15 livraisons gratuites','Cashback 3%','Support prioritaire'] },
          { key:'annual',    name:'Annuel',     price:'20 000', unit:'/an', popular:true, feats:['Livraisons gratuites illimitées','Cashback 5% sur chaque commande','Priorité maximale','Support VIP 24/7','Badge vérifié 🏅','Accès bêta anticipé'] },
        ].map(p=>`
          <div class="plan-card ${p.popular?'featured':''}">
            <div class="plan-head"><span class="plan-name">${p.name}</span>${p.popular?'<span class="plan-popular">⭐ Meilleur</span>':''}</div>
            <div class="plan-price">${p.price} F <span>${p.unit}</span></div>
            <div class="plan-features">${p.feats.map(f=>`<div class="plan-feature"><span class="check">✓</span> ${f}</div>`).join('')}</div>
            <button class="btn ${p.popular?'btn-primary':'btn-outline'}" id="plan-${p.key}" onclick="Views._subscribePlan('${p.key}')">
              ${isPremium?'Passer à ce plan':'S\'abonner'} ${p.popular?'👑':''}
            </button>
          </div>`).join('')}
      </div>`;
  },

  async _subscribePlan(plan) {
    const btn = document.getElementById('plan-'+plan);
    if (btn) { btn.classList.add('btn-loading'); btn.disabled=true; }
    try {
      const res = await API.premium.subscribe(plan);
      const me  = await API.auth.me();
      Auth.setUser(me.user);
      Modal.close();
      Toast.show('👑 Premium activé !');
    } catch(err) { Toast.show('❌ ' + err.message); }
    finally { if(btn){ btn.classList.remove('btn-loading'); btn.disabled=false; } }
  },

  _modalAddProduct() {
    return `
      <div class="modal-title">➕ Ajouter un produit</div>
      <div class="tabs mb-20" id="product-type-tabs">
        <div class="tab active" onclick="Views._setProductType('physical',this)">📦 Physique</div>
        <div class="tab" onclick="Views._setProductType('digital',this)">💻 Digital</div>
      </div>
      <div class="field-group">
        <div class="field"><label>Nom du produit *</label><input id="np-name" placeholder="Ex: Riz gras au poulet"/></div>
        <div class="row-2">
          <div class="field"><label>Prix (F CFA) *</label><input id="np-price" type="number" placeholder="2500" min="0"/></div>
          <div class="field"><label>Prix barré</label><input id="np-compare" type="number" placeholder="3000" min="0"/></div>
        </div>
        <div class="row-2">
          <div class="field"><label>Emoji</label><input id="np-emoji" placeholder="🍚" maxlength="2"/></div>
          <div class="field"><label>Stock (-1 = illimité)</label><input id="np-stock" type="number" placeholder="-1"/></div>
        </div>
        <div class="field"><label>Catégorie</label>
          <select id="np-cat">
            <option>Alimentaire</option><option>Boissons</option><option>Électronique</option>
            <option>Mode</option><option>Beauté</option><option>Santé</option><option>Divers</option>
          </select>
        </div>
        <div class="field"><label>Description</label><textarea id="np-desc" placeholder="Décrivez votre produit..."></textarea></div>
        <!-- Champs produit digital (cachés par défaut) -->
        <div id="digital-fields" style="display:none;border:1.5px solid rgba(124,58,237,0.25);border-radius:var(--r-sm);padding:16px;background:rgba(124,58,237,0.05);">
          <div class="font-700 text-sm mb-12" style="color:var(--purple);">💻 Produit Digital</div>
          <div class="field-group">
            <div class="field"><label>URL du fichier *</label><input id="np-file-url" placeholder="https://cloudinary.com/kibaalo/digital/..."/></div>
            <div class="field"><label>Type de fichier</label>
              <select id="np-file-type">
                <option value="pdf">📄 PDF</option>
                <option value="word">📝 Word (.docx)</option>
                <option value="excel">📊 Excel (.xlsx)</option>
                <option value="powerpoint">📊 PowerPoint (.pptx)</option>
                <option value="video">🎥 Vidéo</option>
                <option value="audio">🎵 Audio</option>
                <option value="zip">📦 Archive (ZIP)</option>
                <option value="other">📎 Autre</option>
              </select>
            </div>
          </div>
        </div>
        <!-- Options avancées -->
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div class="toggle-wrap"><span class="text-sm">Mettre en avant (featured)</span><label class="toggle"><input type="checkbox" id="np-featured"/><span class="toggle-slider"></span></label></div>
          <div class="toggle-wrap"><span class="text-sm">Nouveau produit</span><label class="toggle"><input type="checkbox" id="np-new"/><span class="toggle-slider"></span></label></div>
          <div class="toggle-wrap" id="promo-toggle-wrap"><span class="text-sm">En promotion</span><label class="toggle"><input type="checkbox" id="np-promo" onchange="document.getElementById('promo-pct').style.display=this.checked?'block':'none'"/><span class="toggle-slider"></span></label></div>
          <div class="field" id="promo-pct" style="display:none;"><label>% de réduction</label><input id="np-promo-pct" type="number" placeholder="20" min="1" max="90"/></div>
        </div>
      </div>
      <div style="display:flex;gap:12px;margin-top:20px;">
        <button class="btn btn-primary" id="save-prod-btn" onclick="Views._saveProduct()">💾 Enregistrer</button>
        <button class="btn btn-secondary" onclick="Modal.close()">Annuler</button>
      </div>`;
  },

  _setProductType(type, tabEl) {
    document.querySelectorAll('#product-type-tabs .tab').forEach(t=>t.classList.remove('active'));
    tabEl.classList.add('active');
    const digitalFields = document.getElementById('digital-fields');
    if (digitalFields) digitalFields.style.display = type==='digital' ? 'block' : 'none';
    if (document.getElementById('np-featured')) document.getElementById('np-featured').checked = type==='digital';
  },

  async _saveProduct() {
    const btn = document.getElementById('save-prod-btn');
    const name  = document.getElementById('np-name')?.value?.trim();
    const price = parseInt(document.getElementById('np-price')?.value);
    if (!name||!price) { Toast.show('⚠️ Nom et prix requis'); return; }
    const shopId = Store.get('myShopId');
    if (!shopId) { Toast.show('⚠️ Boutique introuvable'); return; }
    const isDigital = document.getElementById('digital-fields')?.style.display !== 'none';
    const isPromo   = document.getElementById('np-promo')?.checked;
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      await API.shops.addProduct(shopId, {
        name, price,
        compare_price: parseInt(document.getElementById('np-compare')?.value)||undefined,
        emoji: document.getElementById('np-emoji')?.value?.trim()||'📦',
        stock: parseInt(document.getElementById('np-stock')?.value)||-1,
        category: document.getElementById('np-cat')?.value||'Divers',
        description: document.getElementById('np-desc')?.value?.trim()||undefined,
        isDigital, isFeatured: document.getElementById('np-featured')?.checked||false,
        isNew: document.getElementById('np-new')?.checked||false,
        isPromo, promoPercent: isPromo?parseInt(document.getElementById('np-promo-pct')?.value)||0:0,
        digitalFileUrl: isDigital?(document.getElementById('np-file-url')?.value?.trim()||undefined):undefined,
        digitalFileType: isDigital?(document.getElementById('np-file-type')?.value||'pdf'):undefined,
      });
      Modal.close();
      Toast.show('✅ Produit ajouté !');
      DataLoader.myProducts();
    } catch(err) { Toast.show('❌ ' + err.message); }
    finally { btn.classList.remove('btn-loading'); btn.disabled=false; }
  },

  _modalDigitalBuy(data) {
    return `
      <div class="modal-title">💻 Acheter ce produit digital</div>
      <div class="digital-card mb-20">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
          <div class="digital-icon">${data?.emoji||'💻'}</div>
          <div><div class="font-700">${data?.name||'Produit digital'}</div><div class="text-orange font-800 mt-4">${Fmt.moneyShort(parseInt(data?.price)||0)}</div></div>
        </div>
        <div style="font-size:13px;color:var(--text2);line-height:1.5;">✅ Livré instantanément par email<br/>🔐 Mot de passe unique et personnel<br/>📥 Jusqu'à 5 téléchargements pendant 30 jours</div>
      </div>
      <div class="field mb-16"><label>Email de réception</label><input id="dg-email" type="email" value="${Auth.getUser()?.email||''}" placeholder="votre@email.com"/></div>
      <div class="font-700 text-sm mb-8">Mode de paiement</div>
      <div class="chips mb-20">
        <div class="chip active" onclick="Store.set({payMode:'wallet'})">👛 Portefeuille</div>
        <div class="chip" onclick="Store.set({payMode:'orange_money'})">🟠 Orange Money</div>
        <div class="chip" onclick="Store.set({payMode:'moov_money'})">💛 Moov Money</div>
      </div>
      <button class="btn btn-purple" id="dg-buy-btn" onclick="Views._buyDigital('${data?.id||''}','${data?.shopid||''}')">💳 Acheter maintenant →</button>`;
  },

  async _buyDigital(productId, shopId) {
    const btn = document.getElementById('dg-buy-btn');
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      const res = await API.orders.create({
        shopId, items:[{ productId, qty:1 }],
        deliveryAddress: 'Digital — livré par email',
        deliveryCity: Auth.getUser()?.city,
        paymentMethod: Store.get('payMode'),
      });
      Modal.close();
      Toast.show('🎉 Achat réussi ! Vérifiez votre email.', 5000);
      Router.navigate('orders');
    } catch(err) { Toast.show('❌ ' + err.message); }
    finally { btn.classList.remove('btn-loading'); btn.disabled=false; }
  },

  _modalDigitalDownload(data) {
    return `
      <div class="modal-title">⬇️ Télécharger mon fichier</div>
      <p class="text-muted text-sm mb-16">Entrez le mot de passe reçu par email pour télécharger votre fichier.</p>
      <div class="field mb-16"><label>Mot de passe *</label><input id="dl-pwd" type="text" placeholder="ABCD-1234" style="text-transform:uppercase;font-family:var(--mono);letter-spacing:4px;font-size:18px;text-align:center;"/></div>
      <button class="btn btn-primary" id="dl-btn" onclick="Views._doDownload('${data?.orderId||''}','${data?.purchaseId||''}')">⬇️ Télécharger →</button>`;
  },

  async _doDownload(orderId, purchaseId) {
    const btn = document.getElementById('dl-btn');
    const pwd = document.getElementById('dl-pwd')?.value?.trim().toUpperCase();
    if (!pwd) { Toast.show('⚠️ Mot de passe requis'); return; }
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      const res = await API.orders.downloadDigital(orderId, purchaseId, pwd);
      if (res.downloadUrl) { window.open(res.downloadUrl, '_blank'); Toast.show('✅ Téléchargement démarré !'); Modal.close(); }
    } catch(err) { Toast.show('❌ ' + err.message); }
    finally { btn.classList.remove('btn-loading'); btn.disabled=false; }
  },

  _modalReview(data) {
    let shopRating=5, livreurRating=5;
    return `
      <div class="modal-title">⭐ Donner un avis</div>
      <p class="text-muted text-sm mb-16">Votre avis aide nos partenaires à s'améliorer.</p>
      <div class="field mb-16"><label>Note de la boutique</label>
        <div style="display:flex;gap:8px;" id="shop-stars">
          ${[1,2,3,4,5].map(i=>`<span style="font-size:28px;cursor:pointer;transition:transform 0.1s;" onclick="shopRating=${i};document.querySelectorAll('#shop-stars span').forEach((s,j)=>s.textContent=j<${i}?'⭐':'☆')">⭐</span>`).join('')}
        </div>
      </div>
      <div class="field mb-16"><label>Note du livreur</label>
        <div style="display:flex;gap:8px;" id="livreur-stars">
          ${[1,2,3,4,5].map(i=>`<span style="font-size:28px;cursor:pointer;" onclick="livreurRating=${i};document.querySelectorAll('#livreur-stars span').forEach((s,j)=>s.textContent=j<${i}?'⭐':'☆')">⭐</span>`).join('')}
        </div>
      </div>
      <div class="field mb-20"><label>Commentaire (optionnel)</label><textarea id="review-comment" placeholder="Partagez votre expérience..."></textarea></div>
      <button class="btn btn-primary" id="review-btn" onclick="Views._submitReview('${data?.orderId||''}')">Envoyer l'avis →</button>`;
  },

  async _submitReview(orderId) {
    if (!orderId) return;
    const btn = document.getElementById('review-btn');
    const comment = document.getElementById('review-comment')?.value?.trim();
    const shopR    = document.querySelectorAll('#shop-stars span').length;
    const livreurR = document.querySelectorAll('#livreur-stars span').length;
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      await API.orders.review(orderId, { shopRating: shopR||5, livreurRating: livreurR||5, comment });
      Modal.close(); Toast.show('⭐ Merci pour votre avis !');
    } catch(err) { Toast.show('❌ ' + err.message); }
    finally { btn.classList.remove('btn-loading'); btn.disabled=false; }
  },

  _modalNotifications() {
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div class="modal-title" style="margin-bottom:0;">🔔 Notifications</div>
        <button class="btn btn-ghost btn-xs" onclick="API.notifications.readAll().then(()=>{Store.set({notifCount:0});Router.updateTopbar();Toast.show('✓ Tout lu');DataLoader.notifications();})">Tout lire</button>
      </div>
      <div id="notif-container">${this._spinner()}</div>`;
  },

  _notifCard(n) {
    return `
      <div style="background:${n.is_read?'var(--surface)':'rgba(255,107,0,0.06)'};border-radius:var(--r-sm);padding:14px;margin-bottom:8px;border:1px solid ${n.is_read?'var(--border2)':'rgba(255,107,0,0.2)'};cursor:pointer;"
        onclick="API.notifications.read('${n.id}').then(()=>DataLoader.notifications()).catch(()=>{});">
        <div class="font-700 text-sm">${n.title}</div>
        ${n.body?`<div class="text-muted text-xs mt-4">${n.body}</div>`:''}
        <div class="text-muted text-xs mt-8">${Fmt.relative(n.created_at)}</div>
      </div>`;
  },

  _modalMyColis() {
    return `
      <div class="modal-title">📦 Mes Colis</div>
      <!-- Suivi rapide -->
      <div class="flex gap-8 mb-16">
        <input id="track-input" type="text" placeholder="Code de suivi KBA-..." style="flex:1;background:var(--surface);border:1.5px solid var(--border2);border-radius:var(--r-sm);padding:12px 14px;color:var(--text);font-size:14px;"/>
        <button class="btn btn-primary btn-sm" style="width:auto;white-space:nowrap;" onclick="Modal.open('trackParcel',{code:document.getElementById('track-input').value})">Suivre</button>
      </div>
      <div class="section-title text-sm mb-12">Mes expéditions</div>
      <div id="colis-container">${this._spinner()}</div>`;
  },

  _modalTrackParcel(data) {
    const code = data?.code?.trim().toUpperCase();
    setTimeout(async () => {
      const el = document.getElementById('parcel-tracking-result');
      if (!el || !code) return;
      try {
        const res = await API.parcels.track(code);
        const p   = res.data;
        const history = p.history || [];
        el.innerHTML = `
          <div class="card card-pad mb-12">
            <div class="flex justify-between items-center mb-8">
              <div class="font-700 mono">${p.tracking_code}</div>
              <span class="badge badge-orange">${p.statusLabel}</span>
            </div>
            <div class="text-muted text-xs">📍 ${p.origin_city} → ${p.dest_city}</div>
            <div class="text-muted text-xs mt-4">🚌 ${p.transport_company||'—'}</div>
          </div>
          ${history.length?`<div class="section-title text-sm mb-12">Historique</div>
          ${history.reverse().map(h=>`<div class="card card-pad mb-8"><div class="font-700 text-sm">${h.status}</div><div class="text-muted text-xs">${h.location||''} · ${Fmt.time(h.timestamp)}</div>${h.note?`<div class="text-xs mt-4">${h.note}</div>`:''}</div>`).join('')}`:''}`;
      } catch(err) {
        if (el) el.innerHTML = this._errorState('Code invalide ou introuvable');
      }
    }, 0);
    return `
      <div class="modal-title">📍 Suivi de colis</div>
      <div class="font-700 text-sm mb-8">Code : <span class="text-orange mono">${code||'—'}</span></div>
      <div id="parcel-tracking-result">${this._spinner()}</div>`;
  },

  _modalEditProfile() {
    const user = Auth.getUser() || {};
    return `
      <div class="modal-title">✏️ Modifier mon profil</div>
      <div class="field-group">
        <div class="row-2">
          <div class="field"><label>Prénom</label><input id="ep-fname" value="${user.firstName||''}"/></div>
          <div class="field"><label>Nom</label><input id="ep-lname" value="${user.lastName||''}"/></div>
        </div>
        <div class="field"><label>Téléphone</label><input id="ep-phone" type="tel" value="${user.phone||''}" placeholder="+226 70 00 00 00"/></div>
        <div class="field"><label>Ville</label>
          <select id="ep-city">
            ${Object.entries(COUNTRIES).map(([code,c])=>`<optgroup label="${c.flag} ${c.name}">${(CITIES[code]||[]).map(city=>`<option value="${city}" ${city===user.city?'selected':''}>${city}</option>`).join('')}</optgroup>`).join('')}
          </select>
        </div>
        <div class="field"><label>Adresse</label><textarea id="ep-addr" placeholder="Votre adresse habituelle...">${user.address||''}</textarea></div>
      </div>
      <div style="display:flex;gap:12px;margin-top:20px;">
        <button class="btn btn-primary" id="save-profile-btn" onclick="Views._saveProfile()">💾 Enregistrer</button>
        <button class="btn btn-secondary" onclick="Modal.close()">Annuler</button>
      </div>`;
  },

  async _saveProfile() {
    const btn = document.getElementById('save-profile-btn');
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      const res = await API.auth.updateProfile({
        firstName: document.getElementById('ep-fname')?.value?.trim(),
        lastName:  document.getElementById('ep-lname')?.value?.trim(),
        phone:     document.getElementById('ep-phone')?.value?.trim()||undefined,
        city:      document.getElementById('ep-city')?.value,
        address:   document.getElementById('ep-addr')?.value?.trim()||undefined,
      });
      Auth.setUser(res.user);
      Modal.close();
      Router.updateTopbar();
      Toast.show('✅ Profil mis à jour !');
    } catch(err) { Toast.show('❌ ' + err.message); }
    finally { btn.classList.remove('btn-loading'); btn.disabled=false; }
  },

  _modalAvatarUpload() {
    return `
      <div class="modal-title">📸 Photo de profil</div>
      <div style="text-align:center;margin:20px 0;">
        <div class="avatar avatar-xl avatar-orange" style="margin:0 auto 16px;">${Fmt.initials(Auth.getUser())||'?'}</div>
        <label for="avatar-file" class="btn btn-secondary" style="width:auto;cursor:pointer;display:inline-flex;">📷 Choisir une photo</label>
        <input type="file" id="avatar-file" accept="image/*" style="display:none;" onchange="Views._uploadAvatar(this)"/>
        <p class="text-muted text-xs mt-12">JPG, PNG ou WebP · Max 5MB<br/>Format carré recommandé</p>
      </div>
      <div id="avatar-preview" style="display:none;text-align:center;margin-bottom:16px;">
        <img id="avatar-img-preview" style="width:80px;height:80px;border-radius:24px;object-fit:cover;margin:0 auto;display:block;"/>
      </div>
      <button class="btn btn-primary" id="save-avatar-btn" style="display:none;" onclick="Views._saveAvatar()">💾 Enregistrer la photo</button>`;
  },

  _selectedAvatarFile: null,

  _uploadAvatar(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 5*1024*1024) { Toast.show('⚠️ Fichier trop grand (max 5MB)'); return; }
    this._selectedAvatarFile = file;
    const reader = new FileReader();
    reader.onload = e => {
      const preview = document.getElementById('avatar-preview');
      const img     = document.getElementById('avatar-img-preview');
      const saveBtn = document.getElementById('save-avatar-btn');
      if (preview) preview.style.display = 'block';
      if (img) img.src = e.target.result;
      if (saveBtn) saveBtn.style.display = '';
    };
    reader.readAsDataURL(file);
  },

  async _saveAvatar() {
    if (!this._selectedAvatarFile) return;
    const btn = document.getElementById('save-avatar-btn');
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      const res = await API.auth.uploadAvatar(this._selectedAvatarFile);
      const user = Auth.getUser();
      Auth.setUser({ ...user, avatarUrl: res.avatarUrl });
      Modal.close();
      Router.updateTopbar();
      Toast.show('✅ Photo de profil mise à jour !');
      this._selectedAvatarFile = null;
    } catch(err) { Toast.show('❌ ' + err.message); }
    finally { btn.classList.remove('btn-loading'); btn.disabled=false; }
  },

  _modalChangePassword() {
    return `
      <div class="modal-title">🔒 Changer de mot de passe</div>
      <div class="field-group">
        <div class="field"><label>Mot de passe actuel</label><input id="cp-old" type="password" placeholder="••••••••"/></div>
        <div class="field"><label>Nouveau mot de passe</label><input id="cp-new" type="password" placeholder="••••••••" minlength="8"/></div>
        <div class="field"><label>Confirmer</label><input id="cp-new2" type="password" placeholder="••••••••"/></div>
      </div>
      <button class="btn btn-primary mt-20" id="cp-btn" onclick="Views._changePassword()">Modifier →</button>`;
  },

  async _changePassword() {
    const btn = document.getElementById('cp-btn');
    const old  = document.getElementById('cp-old')?.value;
    const nw   = document.getElementById('cp-new')?.value;
    const nw2  = document.getElementById('cp-new2')?.value;
    if (!old||!nw) { Toast.show('⚠️ Tous les champs sont requis'); return; }
    if (nw.length < 8) { Toast.show('⚠️ Minimum 8 caractères'); return; }
    if (nw !== nw2) { Toast.show('⚠️ Les mots de passe ne correspondent pas'); return; }
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      await API.auth.changePassword({ currentPassword: old, newPassword: nw });
      Modal.close(); Toast.show('✅ Mot de passe modifié !');
    } catch(err) { Toast.show('❌ ' + err.message); }
    finally { btn.classList.remove('btn-loading'); btn.disabled=false; }
  },

  _modalKyc() {
    const user = Auth.getUser() || {};
    const kycStatus = user.kycStatus || 'pending';
    const statusInfo = { pending: { icon:'⚠️', msg:'Votre identité n\'est pas encore vérifiée.', color:'var(--amber)' }, submitted: { icon:'🔍', msg:'Vos documents sont en cours de vérification (24-48h).', color:'var(--amber)' }, verified: { icon:'✅', msg:'Votre identité est vérifiée !', color:'var(--green)' }, rejected: { icon:'❌', msg:'Vérification refusée. Ressoumettez vos documents.', color:'var(--red)' } };
    const info = statusInfo[kycStatus] || statusInfo.pending;
    return `
      <div class="modal-title">📋 Vérification d'identité</div>
      <div style="background:rgba(0,0,0,0.2);border-radius:var(--r-sm);padding:14px;margin-bottom:20px;display:flex;gap:12px;align-items:center;">
        <span style="font-size:28px;">${info.icon}</span>
        <div><div class="font-700 text-sm" style="color:${info.color};">${info.msg}</div>
          <div class="text-muted text-xs mt-4">La vérification permet de sécuriser les transactions et rassurer les autres utilisateurs.</div>
        </div>
      </div>
      ${kycStatus==='verified'?`<div style="text-align:center;padding:20px;"><div style="font-size:64px;">🏅</div><div class="font-700 mt-12">Compte vérifié</div><div class="text-muted text-sm mt-8">Votre badge de vérification est visible sur votre profil.</div></div>`:
      kycStatus==='submitted'?`<div style="text-align:center;padding:20px;"><div style="font-size:64px;">⏳</div><div class="font-700 mt-12">En cours de vérification</div><div class="text-muted text-sm mt-8">Délai: 24 à 48 heures ouvrables</div></div>`:
      `<div class="field-group">
        <div class="field"><label>Type de pièce d'identité *</label>
          <select id="kyc-type">
            <option value="cni">🪪 Carte Nationale d'Identité (CNI)</option>
            <option value="passport">📘 Passeport</option>
            <option value="permis">🚗 Permis de conduire</option>
            <option value="sejour">📄 Titre de séjour</option>
          </select>
        </div>
        <div class="field"><label>Numéro de la pièce *</label><input id="kyc-number" placeholder="Ex: B1234567"/></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="field"><label>Recto de la pièce *</label>
            <label style="display:flex;flex-direction:column;align-items:center;gap:8px;background:var(--surface);border:1.5px dashed var(--border2);border-radius:var(--r-sm);padding:20px;cursor:pointer;text-align:center;">
              <span style="font-size:28px;" id="kyc-front-icon">📷</span>
              <span class="text-muted text-xs">Recto</span>
              <input type="file" accept="image/*" style="display:none;" onchange="document.getElementById('kyc-front-icon').textContent='✅'"/>
            </label>
          </div>
          <div class="field"><label>Verso de la pièce</label>
            <label style="display:flex;flex-direction:column;align-items:center;gap:8px;background:var(--surface);border:1.5px dashed var(--border2);border-radius:var(--r-sm);padding:20px;cursor:pointer;text-align:center;">
              <span style="font-size:28px;" id="kyc-back-icon">📷</span>
              <span class="text-muted text-xs">Verso</span>
              <input type="file" accept="image/*" style="display:none;" onchange="document.getElementById('kyc-back-icon').textContent='✅'"/>
            </label>
          </div>
        </div>
        <div class="field"><label>Selfie avec la pièce *</label>
          <label style="display:flex;align-items:center;gap:12px;background:var(--surface);border:1.5px dashed var(--border2);border-radius:var(--r-sm);padding:16px;cursor:pointer;">
            <span style="font-size:28px;" id="kyc-selfie-icon">🤳</span>
            <div><div class="text-sm font-700">Prenez un selfie</div><div class="text-muted text-xs">Tenez votre pièce à côté de votre visage</div></div>
            <input type="file" accept="image/*" capture="user" style="display:none;" onchange="document.getElementById('kyc-selfie-icon').textContent='✅'"/>
          </label>
        </div>
      </div>
      <button class="btn btn-primary mt-20" id="kyc-btn" onclick="Views._submitKyc()">📤 Soumettre pour vérification</button>`}`;
  },

  async _submitKyc() {
    const btn = document.getElementById('kyc-btn');
    const type   = document.getElementById('kyc-type')?.value;
    const number = document.getElementById('kyc-number')?.value?.trim();
    if (!number) { Toast.show('⚠️ Numéro de pièce requis'); return; }
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      await API.auth.submitKyc({ idType: type, idNumber: number }, {});
      const me = await API.auth.me();
      Auth.setUser(me.user);
      Modal.close();
      Toast.show('📋 Documents soumis ! Vérification sous 24-48h.');
      Router.renderPage();
    } catch(err) { Toast.show('❌ ' + err.message); }
    finally { btn.classList.remove('btn-loading'); btn.disabled=false; }
  },

  _modalAddresses() {
    return `
      <div class="modal-title">📍 Mes Adresses</div>
      <div id="addresses-container">${this._spinner()}</div>
      <button class="btn btn-secondary mt-16" onclick="Views._addAddress()">+ Ajouter une adresse</button>`;
  },

  async _addAddress() {
    const label   = prompt('Nom de l\'adresse (ex: Maison, Bureau)');
    const address = prompt('Adresse complète');
    if (!label || !address) return;
    try {
      await API.auth.addAddress({ label, address, isDefault: false });
      DataLoader.addresses();
      Toast.show('✅ Adresse ajoutée !');
    } catch(err) { Toast.show('❌ ' + err.message); }
  },

  _modalFilters() {
    const f = Store.get('filters');
    return `
      <div class="modal-title">⚙️ Filtres avancés</div>
      <div class="field-group">
        <div class="field"><label>Trier par</label>
          <select id="f-sort">
            <option value="rating" ${f.sortBy==='rating'?'selected':''}>⭐ Mieux notés</option>
            <option value="orders" ${f.sortBy==='orders'?'selected':''}>🔥 Plus populaires</option>
            <option value="delivery" ${f.sortBy==='delivery'?'selected':''}>🚀 Livraison la plus rapide</option>
            <option value="name" ${f.sortBy==='name'?'selected':''}>🔤 Nom (A-Z)</option>
          </select>
        </div>
        <div class="field"><label>Note minimum</label>
          <div class="chips"><div class="chip" onclick="Store.set({filters:{...Store.get('filters'),minRating:null}});">Toutes</div>${[3,4,4.5].map(r=>`<div class="chip ${f.minRating===r?'active':''}" onclick="Store.set({filters:{...Store.get('filters'),minRating:${r}}});">${r}+ ⭐</div>`).join('')}</div>
        </div>
        <div class="field"><label>Frais de livraison max</label>
          <select id="f-maxfee">
            <option value="">Tout</option>
            <option value="0">Gratuit seulement</option>
            <option value="500">Moins de 500 F</option>
            <option value="1000">Moins de 1 000 F</option>
          </select>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div class="toggle-wrap"><span class="text-sm">Boutiques ouvertes uniquement</span><label class="toggle"><input type="checkbox" ${f.isOpen?'checked':''} onchange="Store.set({filters:{...Store.get('filters'),isOpen:this.checked}})"/><span class="toggle-slider"></span></label></div>
          <div class="toggle-wrap"><span class="text-sm">Livraison gratuite uniquement</span><label class="toggle"><input type="checkbox" ${f.freeDelivery?'checked':''} onchange="Store.set({filters:{...Store.get('filters'),freeDelivery:this.checked}})"/><span class="toggle-slider"></span></label></div>
        </div>
      </div>
      <div style="display:flex;gap:12px;margin-top:20px;">
        <button class="btn btn-primary" onclick="Store.set({filters:{...Store.get('filters'),sortBy:document.getElementById('f-sort').value,maxDeliveryFee:document.getElementById('f-maxfee').value||null}});DataLoader.shops();Router.renderPage();Modal.close();">Appliquer les filtres</button>
        <button class="btn btn-secondary" onclick="Store.set({filters:{minRating:null,maxDeliveryFee:null,freeDelivery:false,isOpen:false,sortBy:'rating'}});DataLoader.shops();Router.renderPage();Modal.close();">Réinitialiser</button>
      </div>`;
  },

  _modalForgotPassword() {
    return `
      <div class="modal-title">🔑 Mot de passe oublié</div>
      <p class="text-muted text-sm mb-16">Entrez votre email. Vous recevrez un lien de réinitialisation.</p>
      <div class="field mb-20"><label>Email</label><input id="fp-email" type="email" placeholder="votre@email.com"/></div>
      <button class="btn btn-primary" id="fp-btn" onclick="Views._forgotPassword()">Envoyer le lien →</button>`;
  },

  async _forgotPassword() {
    const btn = document.getElementById('fp-btn');
    const email = document.getElementById('fp-email')?.value?.trim();
    if (!email) { Toast.show('⚠️ Email requis'); return; }
    btn.classList.add('btn-loading'); btn.disabled = true;
    try {
      await API.auth.forgotPassword(email);
      Modal.close();
      Toast.show('📧 Lien envoyé ! Vérifiez votre email.', 5000);
    } catch(err) { Toast.show('❌ ' + err.message); }
    finally { btn.classList.remove('btn-loading'); btn.disabled=false; }
  },

  _modalLangRegion() {
    const country = Store.get('country');
    return `
      <div class="modal-title">🌍 Langue & Région</div>
      <div class="field mb-16"><label>Langue</label>
        <select>
          <option value="fr" selected>🇫🇷 Français</option>
          <option value="en" disabled>🇬🇧 English (bientôt)</option>
          <option value="ar" disabled>🇸🇦 العربية (bientôt)</option>
        </select>
      </div>
      <div class="field mb-20"><label>Pays par défaut</label>
        <select id="lr-country" onchange="Store.set({country:this.value});DataLoader.homeData();Modal.close();Toast.show('🌍 Pays mis à jour');">
          ${Object.entries(COUNTRIES).map(([code,c])=>`<option value="${code}" ${code===country?'selected':''}>${c.flag} ${c.name}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-primary" onclick="Modal.close()">Enregistrer</button>`;
  },

  _modalAllCategories() {
    const FULL_CATS = [
      { id:'food',emoji:'🍔',label:'Restauration',count:'maquis, fast food, pâtisserie' },
      { id:'grocery',emoji:'🛒',label:'Épicerie',count:'supermarché, bio, import' },
      { id:'pharma',emoji:'💊',label:'Pharmacie',count:'médicaments, parapharmacie' },
      { id:'tech',emoji:'📱',label:'Téléphonie & Tech',count:'téléphones, réparation' },
      { id:'fashion',emoji:'👗',label:'Mode & Vêtements',count:'prêt-à-porter, accessoires' },
      { id:'beauty',emoji:'💄',label:'Beauté',count:'cosmétiques, coiffure, soins' },
      { id:'digital',emoji:'💻',label:'Produits Digitaux',count:'formations, PDF, vidéos' },
      { id:'electronics',emoji:'📺',label:'Électroménager',count:'TV, réfrigérateur, climatiseur' },
      { id:'health',emoji:'🏥',label:'Santé',count:'clinique, optique, sport' },
      { id:'books',emoji:'📚',label:'Livres & Presse',count:'romans, scolaire, magazines' },
      { id:'home',emoji:'🏠',label:'Maison & Déco',count:'meubles, décoration, jardin' },
      { id:'auto',emoji:'🚗',label:'Auto & Moto',count:'pièces, garage, accessoires' },
      { id:'services',emoji:'🔧',label:'Services',count:'plomberie, électricité, ménage' },
      { id:'other',emoji:'📦',label:'Autre',count:'divers' },
    ];
    return `
      <div class="modal-title">📋 Toutes les catégories</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        ${FULL_CATS.map(c=>`
          <div style="background:var(--surface);border-radius:var(--r-sm);padding:14px;cursor:pointer;border:1px solid var(--border2);" onclick="Store.set({activeCategory:'${c.id}'});DataLoader.shops();Router.navigate('home');Modal.close();">
            <div style="font-size:28px;margin-bottom:8px;">${c.emoji}</div>
            <div class="font-700 text-sm">${c.label}</div>
            <div class="text-muted text-xs mt-4">${c.count}</div>
          </div>`).join('')}
      </div>`;
  },
};
