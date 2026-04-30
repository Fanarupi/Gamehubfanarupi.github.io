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
    // Auto-award trophies based on delta
    const char = users[s.username].char || 'roux';
    if (!users[s.username].trophies) users[s.username].trophies = { roux:0, vixar:0, grizzard:0 };
    let trophyDelta = 0;
    if (delta.wins) trophyDelta += delta.wins * 8;
    if (delta.kills) trophyDelta += delta.kills * 1;
    if (delta.gamesPlayed && !delta.wins) trophyDelta += -3; // loss
    users[s.username].trophies[char] = Math.max(0, (users[s.username].trophies[char]||0) + trophyDelta);
    // Award chests: 1 per win, 1 every 3 games played
    let chestsToAdd = 0;
    if (delta.wins) chestsToAdd += delta.wins;
    if (delta.gamesPlayed) {
      const prev = users[s.username].stats.gamesPlayed - delta.gamesPlayed;
      const now  = users[s.username].stats.gamesPlayed;
      const prevMilestone = Math.floor(prev / 3);
      const nowMilestone  = Math.floor(now  / 3);
      chestsToAdd += nowMilestone - prevMilestone;
    }
    if (chestsToAdd > 0) {
      users[s.username].chests = (users[s.username].chests || 0) + chestsToAdd;
    }
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
      trophies: data.trophies || { roux:0, vixar:0, grizzard:0 },
    }));
  }

  // ── Trophies ─────────────────────────────────
  function saveTrophies(char, delta) {
    const s = getSession();
    if (!s) return;
    const users = getUsers();
    if (!users[s.username]) return;
    if (!users[s.username].trophies) users[s.username].trophies = { roux:0, vixar:0, grizzard:0 };
    users[s.username].trophies[char] = Math.max(0, (users[s.username].trophies[char]||0) + delta);
    saveUsers(users);
  }

  function getTrophies(username) {
    const users = getUsers();
    const u = username ? users[username] : users[getSession()?.username];
    if (!u) return { roux:0, vixar:0, grizzard:0 };
    return u.trophies || { roux:0, vixar:0, grizzard:0 };
  }

  // ── Unlocks ──────────────────────────────────
  function getUnlocks(username) {
    const users = getUsers();
    const u = username ? users[username] : users[getSession()?.username];
    if (!u) return { roux: true, vixar: false, grizzard: false };
    return u.unlocks || { roux: true, vixar: false, grizzard: false };
  }

  function saveUnlocks(unlocks) {
    const s = getSession();
    if (!s) return;
    const users = getUsers();
    if (!users[s.username]) return;
    users[s.username].unlocks = unlocks;
    saveUsers(users);
  }

  function getChests(username) {
    const users = getUsers();
    const u = username ? users[username] : users[getSession()?.username];
    if (!u) return 0;
    return u.chests || 0;
  }

  function addChests(n) {
    const s = getSession();
    if (!s) return;
    const users = getUsers();
    if (!users[s.username]) return;
    users[s.username].chests = (users[s.username].chests || 0) + n;
    saveUsers(users);
  }

  function useChest() {
    const s = getSession();
    if (!s) return null;
    const users = getUsers();
    if (!users[s.username]) return null;
    if ((users[s.username].chests || 0) <= 0) return null;
    users[s.username].chests = (users[s.username].chests || 0) - 1;
    saveUsers(users);
    return rollChest(users[s.username]);
  }

  function rollChest(userData) {
    // Pool: all chars except roux (always unlocked)
    const CHARS = [
      { id: 'vixar',    rarity: 'rare',      chance: 0.05 },
      { id: 'grizzard', rarity: 'epique',    chance: 0.025 },
      // Future chars:
      // { id: 'phantom',  rarity: 'mythique',  chance: 0.015 },
      // { id: 'celestia', rarity: 'legendaire',chance: 0.01  },
    ];
    const unlocks = userData.unlocks || { roux: true, vixar: false, grizzard: false };
    const roll = Math.random();
    let cumul = 0;
    for (const c of CHARS) {
      cumul += c.chance;
      if (roll < cumul) {
        const alreadyOwned = !!unlocks[c.id];
        if (!alreadyOwned) {
          unlocks[c.id] = true;
          const s = getSession();
          if (s) {
            const users = getUsers();
            if (users[s.username]) {
              users[s.username].unlocks = unlocks;
              saveUsers(users);
            }
          }
        }
        return { type: 'char', id: c.id, rarity: c.rarity, alreadyOwned };
      }
    }
    // No char: give trophies bonus instead
    const bonusTrophies = Math.floor(Math.random() * 20) + 10;
    const s = getSession();
    if (s) {
      const users = getUsers();
      if (users[s.username]) {
        const char = users[s.username].char || 'roux';
        if (!users[s.username].trophies) users[s.username].trophies = { roux:0,vixar:0,grizzard:0 };
        users[s.username].trophies[char] = (users[s.username].trophies[char]||0) + bonusTrophies;
        saveUsers(users);
      }
    }
    return { type: 'trophies', amount: bonusTrophies };
  }

  return { register, login, logout, currentUser, saveStats, saveLastChar, getLastChar, getAllPlayers, saveTrophies, getTrophies, getUnlocks, saveUnlocks, getChests, addChests, useChest };
})();

// ── TROPHY SYSTEM ───────────────────────────────
const FA_TROPHIES = (() => {
  const RANKS = [
    { name:'Bois',      min:0,    max:49,   color:'#8B6914', bg:'#3D2800', icon:'🪵', stars:0 },
    { name:'Bronze',    min:50,   max:149,  color:'#CD7F32', bg:'#3A1A00', icon:'🥉', stars:1 },
    { name:'Argent',    min:150,  max:349,  color:'#C0C0C0', bg:'#1A1A2A', icon:'🥈', stars:2 },
    { name:'Or',        min:350,  max:599,  color:'#FFD700', bg:'#2A2000', icon:'🥇', stars:3 },
    { name:'Diamant',   min:600,  max:999,  color:'#00DDFF', bg:'#001A2A', icon:'💎', stars:4 },
    { name:'Mythique',  min:1000, max:1499, color:'#FF44FF', bg:'#1A0020', icon:'🔮', stars:5 },
    { name:'Légendaire',min:1500, max:Infinity, color:'#FF6B1A', bg:'#200500', icon:'🔥', stars:6 },
  ];

  function getRank(trophies) {
    for (let i = RANKS.length-1; i >= 0; i--) {
      if (trophies >= RANKS[i].min) return { ...RANKS[i], index: i };
    }
    return { ...RANKS[0], index: 0 };
  }

  function getProgressInRank(trophies) {
    const rank = getRank(trophies);
    if (rank.max === Infinity) return 100;
    const range = rank.max - rank.min + 1;
    const progress = trophies - rank.min;
    return Math.min(100, Math.round((progress / range) * 100));
  }

  function getTotalTrophies(trophiesObj) {
    return Object.values(trophiesObj || {}).reduce((s,v) => s+(v||0), 0);
  }

  // Points awarded per event
  const TROPHY_GAINS = { win: 8, kill: 1, loss: -3 };

  function renderBadge(trophies, size='md') {
    const rank = getRank(trophies);
    const sz = size === 'sm' ? '0.65rem' : size === 'lg' ? '1rem' : '0.75rem';
    const pad = size === 'sm' ? '2px 6px' : '3px 10px';
    return `<span style="
      display:inline-flex;align-items:center;gap:4px;
      background:${rank.bg};border:1px solid ${rank.color}40;
      border-radius:20px;padding:${pad};font-size:${sz};font-weight:900;
      color:${rank.color};white-space:nowrap;
    ">${rank.icon} ${rank.name} · ${trophies}🏆</span>`;
  }

  function renderRankCard(char, trophies) {
    const rank = getRank(trophies);
    const progress = getProgressInRank(trophies);
    const nextRank = RANKS[Math.min(rank.index+1, RANKS.length-1)];
    const charIcons = { roux:'🦊', vixar:'🎯', grizzard:'🐺' };
    const charNames = { roux:'Roux', vixar:'Vixar', grizzard:'Grizzard' };
    return `
      <div style="background:#0A0500;border:1px solid ${rank.color}33;border-radius:14px;padding:14px;transition:all 0.2s;" 
           onmouseover="this.style.borderColor='${rank.color}66'" onmouseout="this.style.borderColor='${rank.color}33'">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:1.6rem">${charIcons[char]}</span>
            <div>
              <div style="font-family:'Bebas Neue',sans-serif;font-size:1rem;color:#FFF3E0;letter-spacing:1px">${charNames[char].toUpperCase()}</div>
              <div style="font-size:0.65rem;color:#FFB347;font-weight:800">${trophies} trophées</div>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:1.8rem;filter:drop-shadow(0 0 8px ${rank.color})">${rank.icon}</div>
            <div style="font-size:0.6rem;font-weight:900;color:${rank.color};letter-spacing:1px">${rank.name.toUpperCase()}</div>
          </div>
        </div>
        <div style="background:rgba(0,0,0,0.4);border-radius:8px;height:8px;overflow:hidden;margin-bottom:4px;">
          <div style="height:100%;width:${progress}%;background:linear-gradient(90deg,${rank.color}88,${rank.color});border-radius:8px;transition:width 0.5s ease;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.58rem;font-weight:800;">
          <span style="color:${rank.color}">${rank.min}🏆</span>
          <span style="color:#5C3300">${rank.max === Infinity ? '∞' : rank.max+'🏆'}</span>
        </div>
        ${rank.max !== Infinity ? `<div style="font-size:0.58rem;color:#5C3300;margin-top:4px;text-align:center">
          Prochain : <span style="color:${nextRank.color}">${nextRank.icon} ${nextRank.name}</span> (encore ${Math.max(0,rank.max+1-trophies)} 🏆)
        </div>` : `<div style="font-size:0.58rem;color:${rank.color};margin-top:4px;text-align:center;font-weight:900">⭐ RANG MAXIMUM ATTEINT</div>`}
      </div>`;
  }

  function renderAllRanksTooltip() {
    return RANKS.map((r,i) => `
      <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:8px;background:${r.bg};border:1px solid ${r.color}33;margin-bottom:4px;">
        <span style="font-size:1.2rem">${r.icon}</span>
        <div style="flex:1">
          <div style="font-weight:900;color:${r.color};font-size:0.78rem">${r.name}</div>
          <div style="font-size:0.62rem;color:#FFB347">${r.min} – ${r.max===Infinity?'∞':r.max} trophées</div>
        </div>
        <div style="display:flex;gap:2px">${'⭐'.repeat(r.stars)}</div>
      </div>`).join('');
  }

  return { getRank, getProgressInRank, getTotalTrophies, renderBadge, renderRankCard, renderAllRanksTooltip, RANKS, TROPHY_GAINS };
})();

// ── CHEST / UNLOCK UI ───────────────────────────────────
const FA_CHEST = (() => {
  const CHAR_DATA = {
    roux:     { icon:'🦊', name:'Roux',     rarity:'commun',    rarityColor:'#AAAAAA', rarityLabel:'COMMUN',    rarityStar:'⭐' },
    vixar:    { icon:'🎯', name:'Vixar',    rarity:'rare',      rarityColor:'#44AAFF', rarityLabel:'RARE',      rarityStar:'💙' },
    grizzard: { icon:'🐺', name:'Grizzard', rarity:'epique',    rarityColor:'#CC44FF', rarityLabel:'ÉPIQUE',    rarityStar:'💜' },
    phantom:  { icon:'👻', name:'Phantom',  rarity:'mythique',  rarityColor:'#FF44AA', rarityLabel:'MYTHIQUE',  rarityStar:'💗' },
    celestia: { icon:'✨', name:'Celestia', rarity:'legendaire',rarityColor:'#FF8800', rarityLabel:'LÉGENDAIRE',rarityStar:'🔥' },
  };

  const RARITY_CHANCES = {
    commun:     100,
    rare:       5,
    epique:     2.5,
    mythique:   1.5,
    legendaire: 1,
  };

  function getRarityGradient(rarity) {
    const m = {
      commun:     'linear-gradient(135deg,#333,#555)',
      rare:       'linear-gradient(135deg,#003388,#0055CC)',
      epique:     'linear-gradient(135deg,#440088,#8800CC)',
      mythique:   'linear-gradient(135deg,#880044,#CC0066)',
      legendaire: 'linear-gradient(135deg,#884400,#FF8800)',
    };
    return m[rarity] || m.commun;
  }

  function injectChestStyles() {
    if (document.getElementById('fa-chest-styles')) return;
    const s = document.createElement('style');
    s.id = 'fa-chest-styles';
    s.textContent = `
      #fa-chest-backdrop {
        position:fixed;inset:0;z-index:99999;
        background:rgba(2,1,0,0.92);backdrop-filter:blur(14px);
        display:flex;align-items:center;justify-content:center;
        opacity:0;pointer-events:none;transition:opacity 0.3s;
        font-family:'Nunito',sans-serif;
      }
      #fa-chest-backdrop.visible { opacity:1;pointer-events:all; }
      #fa-chest-box {
        background:linear-gradient(145deg,#1A0A00,#0A0500);
        border:1px solid #5C3300;border-radius:24px;
        padding:32px 40px;max-width:480px;width:90%;
        text-align:center;position:relative;
        box-shadow:0 20px 80px rgba(0,0,0,0.8),0 0 60px rgba(255,107,26,0.1);
      }
      .chest-title {
        font-family:'Bebas Neue',sans-serif;font-size:2rem;
        color:#FFD700;letter-spacing:3px;margin-bottom:4px;
      }
      .chest-count-badge {
        display:inline-flex;align-items:center;gap:6px;
        background:rgba(255,107,26,0.15);border:1px solid rgba(255,107,26,0.4);
        border-radius:20px;padding:5px 14px;font-size:0.8rem;
        font-weight:900;color:#FFB347;margin-bottom:20px;
      }
      .chest-anim-wrap {
        height:140px;display:flex;align-items:center;justify-content:center;
        margin-bottom:18px;
      }
      .chest-icon-main {
        font-size:5rem;cursor:pointer;transition:transform 0.15s;
        filter:drop-shadow(0 0 20px rgba(255,180,0,0.5));
        animation:chestIdle 2s ease-in-out infinite;
        user-select:none;
      }
      @keyframes chestIdle {
        0%,100%{transform:scale(1) rotate(-3deg)}
        50%{transform:scale(1.05) rotate(3deg)}
      }
      .chest-icon-main:hover { transform:scale(1.1)!important; }
      .chest-icon-main.shaking {
        animation:chestShake 0.5s ease-in-out;
      }
      @keyframes chestShake {
        0%,100%{transform:translateX(0)}
        20%{transform:translateX(-8px) rotate(-5deg)}
        40%{transform:translateX(8px) rotate(5deg)}
        60%{transform:translateX(-6px) rotate(-3deg)}
        80%{transform:translateX(6px) rotate(3deg)}
      }
      .chest-reveal {
        animation:revealPop 0.5s cubic-bezier(0.17,0.89,0.32,1.49) both;
      }
      @keyframes revealPop {
        0%{transform:scale(0.3) rotate(-20deg);opacity:0}
        100%{transform:scale(1) rotate(0deg);opacity:1}
      }
      .rarity-glow-rare      { box-shadow:0 0 40px rgba(68,170,255,0.4); border-color:rgba(68,170,255,0.6)!important; }
      .rarity-glow-epique    { box-shadow:0 0 40px rgba(200,68,255,0.4); border-color:rgba(200,68,255,0.6)!important; }
      .rarity-glow-mythique  { box-shadow:0 0 40px rgba(255,68,170,0.4); border-color:rgba(255,68,170,0.6)!important; }
      .rarity-glow-legendaire{ box-shadow:0 0 60px rgba(255,136,0,0.6);  border-color:rgba(255,136,0,0.8)!important; }
      .chest-particles { position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:24px; }
      .particle {
        position:absolute;width:6px;height:6px;border-radius:50%;
        animation:particleFly 1.2s ease-out forwards;
      }
      @keyframes particleFly {
        0%{transform:translate(0,0) scale(1);opacity:1}
        100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0}
      }
      .chest-result-card {
        background:linear-gradient(135deg,rgba(0,0,0,0.5),rgba(0,0,0,0.3));
        border:1px solid #3D2200;border-radius:16px;padding:18px;
        margin-bottom:16px;transition:all 0.3s;
      }
      .chest-open-btn {
        background:linear-gradient(135deg,#FF6B1A,#AA3300);
        border:2px solid rgba(255,179,71,0.6);border-radius:50px;
        color:white;font-family:'Nunito',sans-serif;font-weight:900;
        font-size:1rem;padding:12px 36px;cursor:pointer;
        box-shadow:0 0 25px rgba(255,107,26,0.4);transition:all 0.2s;
        margin:0 4px;
      }
      .chest-open-btn:hover { transform:scale(1.04);box-shadow:0 0 40px rgba(255,107,26,0.6); }
      .chest-open-btn:disabled { opacity:0.4;cursor:not-allowed;transform:none; }
      .chest-open-btn.secondary {
        background:transparent;border-color:#3D2200;color:#FFB347;
        box-shadow:none;
      }
      .chest-open-btn.secondary:hover { border-color:#FFB347;background:rgba(255,179,71,0.08); }
      .chances-grid {
        display:grid;grid-template-columns:repeat(5,1fr);gap:6px;
        margin:12px 0;
      }
      .chance-item {
        border-radius:10px;padding:8px 4px;text-align:center;border:1px solid;
      }
    `;
    document.head.appendChild(s);
  }

  function spawnParticles(color) {
    const box = document.getElementById('fa-chest-box');
    if (!box) return;
    let particles = box.querySelector('.chest-particles');
    if (!particles) { particles = document.createElement('div'); particles.className='chest-particles'; box.appendChild(particles); }
    particles.innerHTML = '';
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const angle = (Math.random() * 360) * Math.PI / 180;
      const dist = 80 + Math.random() * 120;
      p.style.cssText = `
        background:${color};left:50%;top:50%;
        --tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist}px;
        animation-delay:${Math.random()*0.2}s;
      `;
      particles.appendChild(p);
    }
    setTimeout(() => { if(particles) particles.innerHTML=''; }, 1500);
  }

  function openChestUI() {
    if (typeof FA_AUTH === 'undefined') return;
    const user = FA_AUTH.currentUser();
    if (!user) {
      alert('Connecte-toi pour ouvrir des coffres !');
      return;
    }
    injectChestStyles();
    let backdrop = document.getElementById('fa-chest-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'fa-chest-backdrop';
      backdrop.innerHTML = `<div id="fa-chest-box"><div class="chest-particles"></div></div>`;
      document.body.appendChild(backdrop);
    }
    renderChestIdle();
    setTimeout(() => backdrop.classList.add('visible'), 10);
  }

  function closeChestUI() {
    const b = document.getElementById('fa-chest-backdrop');
    if (b) { b.classList.remove('visible'); setTimeout(() => b.remove(), 300); }
    // Refresh nav button if function exists
    if (typeof refreshNavButton === 'function') refreshNavButton();
    if (typeof onUserLogin === 'function') onUserLogin();
  }

  function renderChestIdle() {
    const user = FA_AUTH.currentUser();
    const chests = user ? FA_AUTH.getChests(user.username) : 0;
    const unlocks = user ? FA_AUTH.getUnlocks(user.username) : {};
    const allUnlocked = Object.keys(CHAR_DATA).every(k => unlocks[k]);

    const box = document.getElementById('fa-chest-box');
    box.className = '';
    box.innerHTML = `
      <div class="chest-particles"></div>
      <div class="chest-title">🎁 COFFRE</div>
      <div class="chest-count-badge">📦 ${chests} coffre${chests>1?'s':''} disponible${chests>1?'s':''}</div>

      <div class="chest-anim-wrap">
        <div class="chest-icon-main" id="chest-main-icon" onclick="FA_CHEST.doOpen()">📦</div>
      </div>

      <p style="color:#FFB347;font-size:0.85rem;font-weight:700;margin-bottom:14px">
        ${chests > 0 ? 'Clique sur le coffre pour l\'ouvrir !' : '⚠️ Plus de coffres — joue pour en gagner !'}
      </p>

      <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:12px;margin-bottom:16px">
        <div style="font-size:0.65rem;font-weight:900;color:#FFB347;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px">📊 Chances de drop</div>
        <div class="chances-grid">
          ${Object.entries(RARITY_CHANCES).map(([r,c])=>{
            const cd = Object.values(CHAR_DATA).find(x=>x.rarity===r);
            return `<div class="chance-item" style="background:${getRarityGradient(r)};border-color:${cd?.rarityColor||'#555'}44">
              <div style="font-size:0.65rem;font-weight:900;color:${cd?.rarityColor||'#aaa'}">${r.toUpperCase()}</div>
              <div style="font-size:0.85rem;font-weight:900;color:white;margin:2px 0">${c}%</div>
              <div style="font-size:0.75rem">${cd?.rarityStar||'⭐'}</div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:12px;margin-bottom:16px">
        <div style="font-size:0.65rem;font-weight:900;color:#FFB347;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px">🦊 Personnages</div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px">
          ${Object.entries(CHAR_DATA).map(([id,c])=>{
            const owned = !!unlocks[id];
            return `<div style="background:${owned?getRarityGradient(c.rarity):'rgba(0,0,0,0.5)'};border:1px solid ${owned?c.rarityColor+'55':'#3D2200'};border-radius:10px;padding:8px 4px;text-align:center;opacity:${owned?1:0.5}">
              <div style="font-size:1.4rem">${owned?c.icon:'🔒'}</div>
              <div style="font-size:0.55rem;font-weight:900;color:${owned?c.rarityColor:'#5C3300'}">${c.name.toUpperCase()}</div>
              <div style="font-size:0.5rem;color:${c.rarityColor};opacity:0.8">${c.rarityLabel}</div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button class="chest-open-btn" onclick="FA_CHEST.doOpen()" ${chests<=0?'disabled':''}>📦 Ouvrir un coffre</button>
        <button class="chest-open-btn secondary" onclick="FA_CHEST.closeChestUI()">Fermer</button>
      </div>

      <div style="font-size:0.62rem;color:#3D2200;margin-top:12px">
        💡 Gagne des coffres : +1 par victoire · +1 toutes les 3 parties
      </div>
    `;
  }

  function doOpen() {
    const user = FA_AUTH.currentUser();
    if (!user) return;
    const chests = FA_AUTH.getChests(user.username);
    if (chests <= 0) return;

    // Shake animation
    const icon = document.getElementById('chest-main-icon');
    if (icon) { icon.classList.remove('shaking'); void icon.offsetWidth; icon.classList.add('shaking'); }

    setTimeout(() => {
      const result = FA_AUTH.useChest();
      if (!result) return;
      renderChestResult(result);
    }, 500);
  }

  function renderChestResult(result) {
    const box = document.getElementById('fa-chest-box');
    const user = FA_AUTH.currentUser();
    const chests = user ? FA_AUTH.getChests(user.username) : 0;

    let content = '';
    let glowClass = '';
    let particleColor = '#FFD700';

    if (result.type === 'char') {
      const cd = CHAR_DATA[result.id];
      glowClass = `rarity-glow-${result.rarity}`;
      particleColor = cd.rarityColor;
      content = `
        <div class="chest-title" style="color:${cd.rarityColor}">${result.alreadyOwned ? 'DOUBLON !' : 'NOUVEAU !'}</div>
        <div class="chest-anim-wrap">
          <div style="font-size:5.5rem;filter:drop-shadow(0 0 30px ${cd.rarityColor});animation:chestIdle 2s ease-in-out infinite" class="chest-reveal">${cd.icon}</div>
        </div>
        <div class="chest-result-card" style="background:${getRarityGradient(result.rarity)};border-color:${cd.rarityColor}66">
          <div style="font-size:1.8rem;font-family:'Bebas Neue',sans-serif;color:${cd.rarityColor};letter-spacing:3px;margin-bottom:4px">${cd.name.toUpperCase()}</div>
          <div style="display:inline-block;background:rgba(0,0,0,0.4);border:1px solid ${cd.rarityColor}44;border-radius:12px;padding:3px 12px;font-size:0.7rem;font-weight:900;color:${cd.rarityColor};letter-spacing:2px;margin-bottom:6px">${cd.rarityStar} ${cd.rarityLabel} · ${RARITY_CHANCES[result.rarity]}%</div>
          ${result.alreadyOwned
            ? `<div style="color:#FFD700;font-size:0.75rem;font-weight:800">Déjà débloqué — tu reçois +15 🏆 à la place !</div>`
            : `<div style="color:#88FF88;font-size:0.75rem;font-weight:800">✅ Personnage débloqué ! Il est maintenant disponible en jeu.</div>`
          }
        </div>
      `;
    } else {
      // Trophies bonus
      glowClass = '';
      particleColor = '#FFD700';
      content = `
        <div class="chest-title">BONUS !</div>
        <div class="chest-anim-wrap">
          <div style="font-size:5rem;animation:chestIdle 2s ease-in-out infinite" class="chest-reveal">🏆</div>
        </div>
        <div class="chest-result-card">
          <div style="font-size:1.5rem;font-family:'Bebas Neue',sans-serif;color:#FFD700;letter-spacing:3px;margin-bottom:4px">+${result.amount} TROPHÉES</div>
          <div style="color:#FFB347;font-size:0.75rem;font-weight:800">Bonus de trophées ajouté à ton renard principal !</div>
          <div style="font-size:0.65rem;color:#5C3300;margin-top:4px">Continue à jouer pour débloquer les personnages rares !</div>
        </div>
      `;
    }

    box.className = glowClass;
    box.innerHTML = `
      <div class="chest-particles"></div>
      ${content}
      <div style="color:#FFB347;font-size:0.75rem;font-weight:700;margin-bottom:14px">📦 ${chests} coffre${chests>1?'s':''} restant${chests>1?'s':''}</div>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        ${chests > 0
          ? `<button class="chest-open-btn" onclick="FA_CHEST.renderChestIdle();FA_CHEST.doOpen()">📦 Ouvrir encore</button>`
          : ''}
        <button class="chest-open-btn" onclick="FA_CHEST.renderChestIdle()">🔙 Voir mes persos</button>
        <button class="chest-open-btn secondary" onclick="FA_CHEST.closeChestUI()">Fermer</button>
      </div>
    `;
    spawnParticles(particleColor);
  }

  return { openChestUI, closeChestUI, doOpen, renderChestIdle, CHAR_DATA, RARITY_CHANCES, getRarityGradient };
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
    const trophies = FA_AUTH.getTrophies(user.username);
    const rank = (typeof FA_TROPHIES !== 'undefined') ? FA_TROPHIES.getRank(trophies[user.char]||0) : null;
    const rankIcon = rank ? rank.icon : '';
    btn.innerHTML = `${charIcons[user.char]||'🦊'} ${user.username} ${rankIcon}`;
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
    const trophies = FA_AUTH.getTrophies(user.username);
    const totalTrophies = FA_TROPHIES.getTotalTrophies(trophies);
    const mainRank = FA_TROPHIES.getRank(trophies[user.char]||0);
    content.innerHTML = `
      <div class="auth-profile">
        <span class="auth-avatar">${charIcons[user.char]||'🦊'}</span>
        <div class="auth-username">${user.username}</div>
        <div style="margin-bottom:10px">${FA_TROPHIES.renderBadge(trophies[user.char]||0,'md')}</div>
        <div style="font-size:0.65rem;color:#FFB347;margin-bottom:14px">🏆 Total tous renards : <strong style="color:#FFD700">${totalTrophies}</strong></div>
        
        <div style="margin-bottom:14px">
          ${FA_TROPHIES.renderRankCard('roux', trophies.roux||0)}
          <div style="height:6px"></div>
          ${FA_TROPHIES.renderRankCard('vixar', trophies.vixar||0)}
          <div style="height:6px"></div>
          ${FA_TROPHIES.renderRankCard('grizzard', trophies.grizzard||0)}
        </div>

        <div style="background:rgba(0,0,0,0.3);border-radius:10px;padding:10px;margin-bottom:12px">
          <div style="font-size:0.65rem;font-weight:900;color:#FFB347;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">📊 Statistiques</div>
          <div class="auth-stats-grid">
            <div class="auth-stat-card"><span class="val">${user.stats.kills}</span><span class="lbl">⚔️ Éliminations</span></div>
            <div class="auth-stat-card"><span class="val">${user.stats.wins}</span><span class="lbl">🏆 Victoires</span></div>
            <div class="auth-stat-card"><span class="val">${user.stats.gems}</span><span class="lbl">💎 Gemmes</span></div>
            <div class="auth-stat-card"><span class="val">${kd}</span><span class="lbl">🎯 K/D</span></div>
          </div>
        </div>
        <div style="font-size:0.72rem;color:#5C3300;margin-bottom:12px">🎮 ${user.stats.gamesPlayed} parties jouées</div>
        <button class="chest-open-btn" style="width:100%;background:linear-gradient(135deg,#FF6B1A,#AA3300);border:2px solid rgba(255,179,71,0.6);border-radius:50px;color:white;font-family:'Nunito',sans-serif;font-weight:900;font-size:0.95rem;padding:11px 20px;cursor:pointer;margin-bottom:8px;box-shadow:0 0 20px rgba(255,107,26,0.3);transition:all 0.2s" onclick="closeAuthModal();FA_CHEST.openChestUI()">
          📦 Coffres disponibles : <strong>${FA_AUTH.getChests(user.username)||0}</strong>
        </button>
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
