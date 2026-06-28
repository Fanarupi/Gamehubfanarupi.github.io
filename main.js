// BLOBINFO main.js

const input        = document.getElementById('searchInput');
const suggestions  = document.getElementById('suggestions');
const gameGrid     = document.getElementById('gameGrid');
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');

function renderCards(list) {
  gameGrid.innerHTML = '';
  list.forEach(g => {
    const hasTips = getGameTipsKey(g) !== null;
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML =
      '<span class="card-icon">' + g.icon + '</span>' +
      '<div class="card-title">' + g.name + '</div>' +
      '<div class="card-genre">' + g.genre + '</div>' +
      '<div class="card-desc">' + g.desc.slice(0, 90) + '...</div>' +
      (hasTips ? '<div class="card-tips-badge">💡 Conseils dispo</div>' : '');
    card.addEventListener('click', function() { openModal(g); });
    gameGrid.appendChild(card);
  });
}

function getGameTipsKey(g) {
  if (g.name.toLowerCase().includes('valorant')) return 'valorant';
  return null;
}

renderCards(GAMES);

function showSuggestions(query) {
  if (!query) { suggestions.innerHTML = ''; suggestions.classList.remove('open'); return; }
  const matches = GAMES.filter(function(g) {
    return g.name.toLowerCase().includes(query.toLowerCase()) ||
           g.genre.toLowerCase().includes(query.toLowerCase()) ||
           g.tags.some(function(t) { return t.toLowerCase().includes(query.toLowerCase()); });
  }).slice(0, 7);
  if (!matches.length) { suggestions.innerHTML = ''; suggestions.classList.remove('open'); return; }
  suggestions.innerHTML = matches.map(function(g) {
    return '<div class="suggestion-item" data-id="' + g.id + '">' +
           '<span class="s-icon">' + g.icon + '</span>' +
           '<span class="s-name">' + g.name + '</span>' +
           '<span class="s-genre">' + g.genre + '</span></div>';
  }).join('');
  suggestions.classList.add('open');
  suggestions.querySelectorAll('.suggestion-item').forEach(function(item) {
    item.addEventListener('click', function() {
      const game = GAMES.find(function(g) { return g.id === parseInt(item.dataset.id); });
      if (game) { openModal(game); closeSuggestions(); input.value = ''; }
    });
  });
}

input.addEventListener('input', function(e) { showSuggestions(e.target.value.trim()); });
document.addEventListener('click', function(e) {
  if (!e.target.closest('.search-wrapper')) closeSuggestions();
});

function closeSuggestions() {
  suggestions.innerHTML = '';
  suggestions.classList.remove('open');
}

function doSearch() {
  const q = input.value.trim().toLowerCase();
  closeSuggestions();
  if (!q) { renderCards(GAMES); return; }
  const results = GAMES.filter(function(g) {
    return g.name.toLowerCase().includes(q) ||
           g.genre.toLowerCase().includes(q) ||
           g.tags.some(function(t) { return t.toLowerCase().includes(q); }) ||
           g.dev.toLowerCase().includes(q);
  });
  renderCards(results.length ? results : GAMES);
  if (!results.length) {
    gameGrid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;font-size:1rem;padding:20px 0">Aucun jeu trouvé pour "' + input.value + '" — affichage de tous les jeux.</p>' + gameGrid.innerHTML;
  }
}

input.addEventListener('keydown', function(e) { if (e.key === 'Enter') doSearch(); });

// MODAL
var _currentGame = null;

function openModal(g) {
  _currentGame = g;
  const tipsKey = getGameTipsKey(g);
  const hasTips = tipsKey !== null;

  let tabsHTML = '';
  if (hasTips) {
    tabsHTML = '<div class="modal-tabs">' +
      '<button class="modal-tab active" data-tab="info" onclick="switchTab(\'info\')">📋 Infos</button>' +
      '<button class="modal-tab" data-tab="weapons" onclick="switchTab(\'weapons\')">🔫 Armes & Éco</button>' +
      '<button class="modal-tab" data-tab="maps" onclick="switchTab(\'maps\')">🗺️ Agents / Maps</button>' +
      '<button class="modal-tab" data-tab="tierlist" onclick="switchTab(\'tierlist\')">📊 Tier List</button>' +
      '<button class="modal-tab" data-tab="tips" onclick="switchTab(\'tips\')">💡 Conseils</button>' +
    '</div>';
  }

  modalContent.innerHTML =
    '<span class="modal-icon">' + g.icon + '</span>' +
    '<div class="modal-title">' + g.name + '</div>' +
    '<div class="modal-genre">' + g.genre + '</div>' +
    tabsHTML +
    '<div id="tabContent"></div>';

  renderTab('info', g, tipsKey);
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function switchTab(tab) {
  document.querySelectorAll('.modal-tab').forEach(function(t) {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  renderTab(tab, _currentGame, getGameTipsKey(_currentGame));
}

function renderTab(tab, g, tipsKey) {
  const el = document.getElementById('tabContent');
  if (!el || !g) return;
  if (tab === 'info') {
    el.innerHTML =
      '<p class="modal-desc">' + g.desc + '</p>' +
      '<p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:14px">🏢 ' + g.dev + ' &nbsp;·&nbsp; 📅 ' + g.year + '</p>' +
      '<div class="modal-tags">' + g.tags.map(function(t) { return '<span class="modal-tag">' + t + '</span>'; }).join('') + '</div>';
  } else if (tab === 'weapons' && tipsKey === 'valorant') {
    renderWeaponsTab(el);
  } else if (tab === 'maps' && tipsKey === 'valorant') {
    renderMapsTab(el);
  } else if (tab === 'tierlist' && tipsKey === 'valorant') {
    renderTierlistTab(el);
  } else if (tab === 'tips' && tipsKey === 'valorant') {
    renderGeneralTipsTab(el);
  }
}

function renderWeaponsTab(el) {
  const eco = VALORANT_TIPS.economy;
  el.innerHTML = '<div class="tips-header"><div class="tips-title">' + eco.title + '</div><div class="tips-sub">' + eco.subtitle + '</div></div>' +
    eco.rounds.map(function(r) {
      return '<div class="round-block">' +
        '<div class="round-header" style="border-left-color:' + r.color + '">' +
          '<span class="round-emoji">' + r.emoji + '</span>' +
          '<div><div class="round-name">' + r.name + '</div><div class="round-credits">' + r.credits + '</div></div>' +
        '</div>' +
        '<div class="buy-list">' +
          r.buys.map(function(b) {
            return '<div class="buy-item"><div class="buy-weapon">' + b.weapon + '</div><div class="buy-tip">' + b.tip + '</div></div>';
          }).join('') +
        '</div>' +
        '<div class="round-advice">' + r.advice + '</div>' +
      '</div>';
    }).join('');
}

function renderMapsTab(el) {
  const maps = VALORANT_TIPS.maps;
  el.innerHTML = '<div class="tips-header"><div class="tips-title">' + maps.title + '</div><div class="tips-sub">' + maps.subtitle + '</div></div>' +
    '<div class="map-selector">' +
      maps.list.map(function(m, i) {
        return '<button class="map-btn' + (i === 0 ? ' active' : '') + '" onclick="showMap(' + i + ')">' + m.emoji + ' ' + m.name + '</button>';
      }).join('') +
    '</div>' +
    '<div id="mapDetail">' + renderMapDetail(maps.list[0]) + '</div>';
}

window.showMap = function(idx) {
  document.querySelectorAll('.map-btn').forEach(function(b, i) { b.classList.toggle('active', i === idx); });
  const d = document.getElementById('mapDetail');
  if (d) d.innerHTML = renderMapDetail(VALORANT_TIPS.maps.list[idx]);
};

function renderMapDetail(m) {
  return '<div class="map-info-block">' +
      '<div class="map-desc-text">' + m.desc + '</div>' +
      '<div class="map-tip-box">🎯 ' + m.tip + '</div>' +
    '</div>' +
    '<div class="agents-list">' +
      m.agents.map(function(a, i) {
        return '<div class="agent-card">' +
          '<div class="agent-rank">#' + (i+1) + '</div>' +
          '<div class="agent-icon">' + a.icon + '</div>' +
          '<div class="agent-info">' +
            '<div class="agent-name">' + a.name + ' <span class="agent-role">' + a.role + '</span></div>' +
            '<div class="agent-reason">' + a.reason + '</div>' +
          '</div>' +
          '<div class="agent-tier tier-' + a.tier + '">' + a.tier + '</div>' +
        '</div>';
      }).join('') +
    '</div>';
}

function renderTierlistTab(el) {
  const tl = VALORANT_TIPS.tierlist;
  el.innerHTML = '<div class="tips-header"><div class="tips-title">' + tl.title + '</div><div class="tips-sub">' + tl.subtitle + '</div></div>' +
    tl.tiers.map(function(t) {
      return '<div class="tier-row">' +
        '<div class="tier-label" style="background:' + t.color + '22;color:' + t.color + ';border-color:' + t.color + '44">' + t.tier + '</div>' +
        '<div class="tier-agents">' +
          t.agents.map(function(a) {
            return '<div class="tier-agent">' +
              '<div class="tier-agent-name">' + a.name + '</div>' +
              '<div class="tier-agent-wr">WR ' + a.wr + '</div>' +
              '<div class="tier-agent-note">' + a.note + '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';
    }).join('');
}

function renderGeneralTipsTab(el) {
  el.innerHTML = '<div class="tips-header"><div class="tips-title">💡 Conseils pour progresser</div><div class="tips-sub">Les fondamentaux qui font monter en rank, quel que soit ton niveau</div></div>' +
    '<div class="general-tips">' +
      VALORANT_TIPS.general.map(function(t) {
        return '<div class="general-tip">' +
          '<span class="tip-icon">' + t.icon + '</span>' +
          '<div><div class="tip-title">' + t.title + '</div><div class="tip-text">' + t.tip + '</div></div>' +
        '</div>';
      }).join('') +
    '</div>';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
