// ═══════════════════════════════════════════════
//  FOX ARENA — AUTH MODULE (localStorage)
//  Gère : inscription, connexion, déconnexion,
//          lecture/écriture de la progression
// ═══════════════════════════════════════════════

const FA_AUTH = (() => {
  const STORAGE_KEY = 'foxarena_users';
  const SESSION_KEY = 'foxarena_session';

  // ── Helpers ──────────────────────────────────
  function getUsers() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }
  function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }
  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch { return null; }
  }
  function setSession(username) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username, ts: Date.now() }));
  }
  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  // ── Password hash (simple, client-side only) ─
  async function hashPwd(pwd) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pwd));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  // ── API ──────────────────────────────────────
  async function register(username, password) {
    username = username.trim();
    if (!username || !password) return { ok: false, msg: 'Champs requis.' };
    if (username.length < 3)    return { ok: false, msg: 'Pseudo trop court (min. 3 car.).' };
    if (password.length < 4)    return { ok: false, msg: 'Mot de passe trop court (min. 4 car.).' };
    const users = getUsers();
    if (users[username])        return { ok: false, msg: 'Ce pseudo est déjà pris.' };
    const hash = await hashPwd(password);
    users[username] = {
      hash,
      createdAt: Date.now(),
      stats: { kills:0, wins:0, gems:0, deaths:0, shots:0, gamesPlayed:0 },
      char: 'roux',
    };
    saveUsers(users);
    setSession(username);
    return { ok: true, username };
  }

  async function login(username, password) {
    username = username.trim();
    if (!username || !password) return { ok: false, msg: 'Champs requis.' };
    const users = getUsers();
    if (!users[username])       return { ok: false, msg: 'Pseudo introuvable.' };
    const hash = await hashPwd(password);
    if (users[username].hash !== hash) return { ok: false, msg: 'Mot de passe incorrect.' };
    setSession(username);
    return { ok: true, username };
  }

  function logout() {
    clearSession();
    window.location.reload();
  }

  function currentUser() {
    const s = getSession();
    if (!s) return null;
    const users = getUsers();
    if (!users[s.username]) { clearSession(); return null; }
    return { username: s.username, ...users[s.username] };
  }

  function saveStats(delta) {
    const s = getSession();
    if (!s) return;
    const users = getUsers();
    if (!users[s.username]) return;
    const st = users[s.username].stats;
    Object.keys(delta).forEach(k => {
      if (k in st) st[k] += delta[k];
    });
    users[s.username].stats = st;
    saveUsers(users);
  }

  function saveLastChar(char) {
    const s = getSession();
    if (!s) return;
    const users = getUsers();
    if (!users[s.username]) return;
    users[s.username].char = char;
    saveUsers(users);
  }

  function getLastChar() {
    const u = currentUser();
    return u ? (u.char || 'roux') : 'roux';
  }

  function getAllPlayers() {
    const users = getUsers();
    return Object.entries(users).map(([name, data]) => ({
      name,
      ...data.stats,
      char: data.char || 'roux',
      createdAt: data.createdAt,
    }));
  }

  return { register, login, logout, currentUser, saveStats, saveLastChar, getLastChar, getAllPlayers };
})();


// ═══════════════════════════════════════════════
//  AUTH UI — injecte le bouton + modal dans la nav
// ═══════════════════════════════════════════════
function initAuthUI() {
  injectStyles();
  injectNavButton();
  injectModal();
  refreshNavButton();
}

// ── CSS ─────────────────────────────────────────
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* ── AUTH BUTTON ── */
    #auth-nav-btn {
      display: inline-flex; align-items: center; gap: 7px;
      background: linear-gradient(135deg,#FF6B1A,#AA3300);
      border: 2px solid rgba(255,179,71,0.6);
      border-radius: 22px; padding: 7px 16px;
      color: white; font-family: 'Nunito', sans-serif;
      font-weight: 900; font-size: 0.8rem; cursor: pointer;
      transition: all 0.2s; letter-spacing: 0.3px;
      box-shadow: 0 0 14px rgba(255,107,26,0.4);
    }
    #auth-nav-btn:hover { transform: scale(1.05); box-shadow: 0 0 22px rgba(255,107,26,0.6); }
    #auth-nav-btn.logged-in {
      background: linear-gradient(135deg,#1A4A1A,#0A2A0A);
      border-color: rgba(80,200,80,0.5);
      box-shadow: 0 0 10px rgba(50,200,50,0.2);
    }
    #auth-nav-btn.logged-in:hover { box-shadow: 0 0 18px rgba(50,200,50,0.4); }

    /* ── MODAL BACKDROP ── */
    #auth-modal-backdrop {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(5,2,0,0.85); backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none; transition: opacity 0.25s;
    }
    #auth-modal-backdrop.visible { opacity: 1; pointer-events: all; }

    /* ── MODAL BOX ── */
    #auth-modal {
      background: linear-gradient(145deg,#140900,#0A0500);
      border: 1px solid #5C3300; border-radius: 20px;
      padding: 36px 40px; width: 100%; max-width: 400px;
      box-shadow: 0 20px 80px rgba(0,0,0,0.8), 0 0 40px rgba(255,107,26,0.15);
      position: relative; font-family: 'Nunito', sans-serif;
      transform: translateY(20px); transition: transform 0.25s;
    }
    #auth-modal-backdrop.visible #auth-modal { transform: translateY(0); }

    #auth-modal-close {
      position: absolute; top: 14px; right: 18px;
      background: none; border: none; color: #5C3300;
      font-size: 1.4rem; cursor: pointer; transition: color 0.2s; line-height:1;
    }
    #auth-modal-close:hover { color: #FF6B1A; }

    .auth-logo { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem;
      color: #FF6B1A; letter-spacing: 3px; text-align: center;
      text-shadow: 0 0 20px rgba(255,107,26,0.5); display: block; margin-bottom: 6px; }
    .auth-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
    .auth-tab {
      flex: 1; padding: 9px; border-radius: 12px;
      border: 1px solid #3D2200; background: transparent;
      color: #FFB347; font-family: 'Nunito', sans-serif;
      font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
    }
    .auth-tab.active { background: rgba(255,107,26,0.2); border-color: #FF6B1A; color: #FFD700; }
    .auth-tab:hover:not(.active) { border-color: #FFB347; }

    .auth-field { margin-bottom: 14px; }
    .auth-field label { display: block; font-size: 0.7rem; font-weight: 900;
      color: #FFB347; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 5px; }
    .auth-field input {
      width: 100%; padding: 11px 14px;
      background: rgba(0,0,0,0.4); border: 1px solid #3D2200;
      border-radius: 10px; color: #FFF3E0;
      font-family: 'Nunito', sans-serif; font-size: 0.9rem; font-weight: 700;
      outline: none; transition: border-color 0.2s;
    }
    .auth-field input:focus { border-color: #FF6B1A; }
    .auth-field input::placeholder { color: #3D2200; }

    .auth-submit {
      width: 100%; padding: 12px; margin-top: 8px;
      background: linear-gradient(135deg,#FF6B1A,#AA3300);
      border: 2px solid rgba(255,179,71,0.5);
      border-radius: 50px; color: white;
      font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 1rem;
      cursor: pointer; transition: all 0.2s;
      box-shadow: 0 0 20px rgba(255,107,26,0.3);
    }
    .auth-submit:hover { transform: scale(1.03); box-shadow: 0 0 30px rgba(255,107,26,0.5); }
    .auth-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .auth-error {
      background: rgba(200,0,0,0.2); border: 1px solid rgba(200,0,0,0.4);
      border-radius: 8px; padding: 8px 12px; margin-bottom: 12px;
      font-size: 0.8rem; font-weight: 800; color: #FF8888; display: none;
    }
    .auth-success {
      background: rgba(0,150,0,0.2); border: 1px solid rgba(0,200,0,0.3);
      border-radius: 8px; padding: 8px 12px; margin-bottom: 12px;
      font-size: 0.8rem; font-weight: 800; color: #88FF88; display: none;
    }

    /* ── PROFILE PANEL ── */
    .auth-profile { text-align: center; }
    .auth-avatar { font-size: 3.5rem; display: block; margin-bottom: 8px; }
    .auth-username { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem;
      color: #FFD700; letter-spacing: 2px; }
    .auth-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
      margin: 18px 0; }
    .auth-stat-card { background: rgba(0,0,0,0.3); border: 1px solid #3D2200;
      border-radius: 10px; padding: 10px 8px; }
    .auth-stat-card .val { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem;
      color: #FFD700; display: block; }
    .auth-stat-card .lbl { font-size: 0.6rem; color: #FFB347; font-weight: 800;
      text-transform: uppercase; letter-spacing: 1px; }
    .auth-logout {
      width: 100%; padding: 10px; margin-top: 4px;
      background: transparent; border: 1px solid #3D2200;
      border-radius: 50px; color: #FFB347;
      font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 0.85rem;
      cursor: pointer; transition: all 0.2s;
    }
    .auth-logout:hover { border-color: #FF3355; color: #FF3355; }
  `;
  document.head.appendChild(style);
}

// ── NAV BUTTON ──────────────────────────────────
function injectNavButton() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;
  const btn = document.createElement('button');
  btn.id = 'auth-nav-btn';
  btn.onclick = () => openAuthModal();
  navLinks.appendChild(btn);
}

function refreshNavButton() {
  const btn = document.getElementById('auth-nav-btn');
  if (!btn) return;
  const user = FA_AUTH.currentUser();
  if (user) {
    const charIcons = { roux:'🦊', vixar:'🎯', grizzard:'🐺' };
    btn.innerHTML = `${charIcons[user.char]||'🦊'} ${user.username}`;
    btn.classList.add('logged-in');
    btn.title = 'Voir mon profil';
  } else {
    btn.innerHTML = `🔑 Connexion`;
    btn.classList.remove('logged-in');
    btn.title = 'Se connecter ou s\'inscrire';
  }
}

// ── MODAL ───────────────────────────────────────
function injectModal() {
  const backdrop = document.createElement('div');
  backdrop.id = 'auth-modal-backdrop';
  backdrop.innerHTML = `
    <div id="auth-modal">
      <button id="auth-modal-close" onclick="closeAuthModal()">✕</button>
      <span class="auth-logo">🦊 FOX ARENA</span>
      <div id="auth-modal-content"></div>
    </div>
  `;
  backdrop.addEventListener('click', e => { if(e.target === backdrop) closeAuthModal(); });
  document.body.appendChild(backdrop);
}

function openAuthModal() {
  const user = FA_AUTH.currentUser();
  renderModalContent(user ? 'profile' : 'login');
  document.getElementById('auth-modal-backdrop').classList.add('visible');
}

function closeAuthModal() {
  document.getElementById('auth-modal-backdrop').classList.remove('visible');
}

function renderModalContent(view) {
  const content = document.getElementById('auth-modal-content');
  if (view === 'profile') {
    const user = FA_AUTH.currentUser();
    const charIcons = { roux:'🦊', vixar:'🎯', grizzard:'🐺' };
    const kd = user.stats.deaths > 0 ? (user.stats.kills / user.stats.deaths).toFixed(2) : user.stats.kills;
    content.innerHTML = `
      <div class="auth-profile">
        <span class="auth-avatar">${charIcons[user.char]||'🦊'}</span>
        <div class="auth-username">${user.username}</div>
        <div style="font-size:0.7rem;color:#FFB347;margin-bottom:4px">Renard préféré : <strong style="color:#FFD700">${user.char.toUpperCase()}</strong></div>
        <div class="auth-stats-grid">
          <div class="auth-stat-card"><span class="val">${user.stats.kills}</span><span class="lbl">⚔️ Éliminations</span></div>
          <div class="auth-stat-card"><span class="val">${user.stats.wins}</span><span class="lbl">🏆 Victoires</span></div>
          <div class="auth-stat-card"><span class="val">${user.stats.gems}</span><span class="lbl">💎 Gemmes</span></div>
          <div class="auth-stat-card"><span class="val">${kd}</span><span class="lbl">🎯 K/D</span></div>
        </div>
        <div style="font-size:0.72rem;color:#5C3300;margin-bottom:12px">🎮 ${user.stats.gamesPlayed} parties jouées</div>
        <button class="auth-logout" onclick="FA_AUTH.logout()">🚪 Se déconnecter</button>
      </div>`;
  } else {
    const isLogin = view === 'login';
    content.innerHTML = `
      <div class="auth-tabs">
        <button class="auth-tab ${isLogin?'active':''}" onclick="renderModalContent('login')">🔑 Connexion</button>
        <button class="auth-tab ${!isLogin?'active':''}" onclick="renderModalContent('register')">✨ Inscription</button>
      </div>
      <div class="auth-error" id="auth-err"></div>
      <div class="auth-success" id="auth-ok"></div>
      <div class="auth-field">
        <label>Pseudo</label>
        <input id="auth-uname" type="text" placeholder="TonPseudo" maxlength="20" autocomplete="username"/>
      </div>
      <div class="auth-field">
        <label>Mot de passe</label>
        <input id="auth-pwd" type="password" placeholder="••••••" autocomplete="${isLogin?'current-password':'new-password'}"/>
      </div>
      ${!isLogin ? `<div class="auth-field">
        <label>Confirmer le mot de passe</label>
        <input id="auth-pwd2" type="password" placeholder="••••••" autocomplete="new-password"/>
      </div>` : ''}
      <button class="auth-submit" id="auth-sub-btn" onclick="${isLogin?'doLogin()':'doRegister()'}">
        ${isLogin ? '🔑 Se connecter' : '✨ Créer mon compte'}
      </button>`;
    // Enter key support
    setTimeout(() => {
      document.querySelectorAll('#auth-modal input').forEach(inp => {
        inp.addEventListener('keydown', e => { if(e.key==='Enter') document.getElementById('auth-sub-btn').click(); });
      });
    }, 50);
  }
}

function showAuthMsg(type, msg) {
  const el = document.getElementById(type === 'err' ? 'auth-err' : 'auth-ok');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { if(el) el.style.display='none'; }, 4000);
}

async function doLogin() {
  const btn = document.getElementById('auth-sub-btn');
  btn.disabled = true; btn.textContent = '⏳ Connexion...';
  const u = document.getElementById('auth-uname').value;
  const p = document.getElementById('auth-pwd').value;
  const res = await FA_AUTH.login(u, p);
  if (res.ok) {
    showAuthMsg('ok', `Bienvenue, ${res.username} ! 🦊`);
    setTimeout(() => { closeAuthModal(); refreshNavButton(); if(typeof onUserLogin==='function') onUserLogin(); }, 800);
  } else {
    showAuthMsg('err', res.msg);
    btn.disabled = false; btn.textContent = '🔑 Se connecter';
  }
}

async function doRegister() {
  const btn = document.getElementById('auth-sub-btn');
  btn.disabled = true; btn.textContent = '⏳ Création...';
  const u = document.getElementById('auth-uname').value;
  const p = document.getElementById('auth-pwd').value;
  const p2 = document.getElementById('auth-pwd2')?.value;
  if (p2 !== undefined && p !== p2) {
    showAuthMsg('err', 'Les mots de passe ne correspondent pas.');
    btn.disabled = false; btn.textContent = '✨ Créer mon compte';
    return;
  }
  const res = await FA_AUTH.register(u, p);
  if (res.ok) {
    showAuthMsg('ok', `Compte créé ! Bienvenue ${res.username} 🎉`);
    setTimeout(() => { closeAuthModal(); refreshNavButton(); if(typeof onUserLogin==='function') onUserLogin(); }, 900);
  } else {
    showAuthMsg('err', res.msg);
    btn.disabled = false; btn.textContent = '✨ Créer mon compte';
  }
}

// Auto-init dès que le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthUI);
} else {
  initAuthUI();
}
