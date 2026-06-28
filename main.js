// ── BLOBINFO — main.js ──

const input       = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');
const gameGrid    = document.getElementById('gameGrid');
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');

// ── Rendu des cartes ──
function renderCards(list) {
  gameGrid.innerHTML = '';
  list.forEach(g => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <span class="card-icon">${g.icon}</span>
      <div class="card-title">${g.name}</div>
      <div class="card-genre">${g.genre}</div>
      <div class="card-desc">${g.desc.slice(0, 90)}…</div>
    `;
    card.addEventListener('click', () => openModal(g));
    gameGrid.appendChild(card);
  });
}

// Affiche tous les jeux au chargement
renderCards(GAMES);

// ── Suggestions ──
function showSuggestions(query) {
  if (!query) { suggestions.innerHTML = ''; suggestions.classList.remove('open'); return; }
  const matches = GAMES.filter(g =>
    g.name.toLowerCase().includes(query.toLowerCase()) ||
    g.genre.toLowerCase().includes(query.toLowerCase()) ||
    g.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 7);

  if (!matches.length) { suggestions.innerHTML = ''; suggestions.classList.remove('open'); return; }

  suggestions.innerHTML = matches.map(g => `
    <div class="suggestion-item" data-id="${g.id}">
      <span class="s-icon">${g.icon}</span>
      <span class="s-name">${g.name}</span>
      <span class="s-genre">${g.genre}</span>
    </div>
  `).join('');
  suggestions.classList.add('open');

  suggestions.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      const game = GAMES.find(g => g.id === parseInt(item.dataset.id));
      if (game) { openModal(game); closeSuggestions(); input.value = ''; }
    });
  });
}

input.addEventListener('input', e => showSuggestions(e.target.value.trim()));
document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrapper')) closeSuggestions();
});

function closeSuggestions() {
  suggestions.innerHTML = '';
  suggestions.classList.remove('open');
}

// ── Recherche ──
function doSearch() {
  const q = input.value.trim().toLowerCase();
  closeSuggestions();
  if (!q) { renderCards(GAMES); return; }
  const results = GAMES.filter(g =>
    g.name.toLowerCase().includes(q) ||
    g.genre.toLowerCase().includes(q) ||
    g.tags.some(t => t.toLowerCase().includes(q)) ||
    g.dev.toLowerCase().includes(q)
  );
  renderCards(results.length ? results : GAMES);
  if (!results.length) {
    gameGrid.innerHTML = `<p style="color:var(--text-muted);grid-column:1/-1;font-size:1rem;padding:20px 0">Aucun jeu trouvé pour "<strong style="color:var(--blue-light)">${input.value}</strong>" — affichage de tous les jeux.</p>` + gameGrid.innerHTML;
  }
}

input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

// ── Modal ──
function openModal(g) {
  modalContent.innerHTML = `
    <span class="modal-icon">${g.icon}</span>
    <div class="modal-title">${g.name}</div>
    <div class="modal-genre">${g.genre}</div>
    <p class="modal-desc">${g.desc}</p>
    <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:14px">
      🏢 ${g.dev} &nbsp;·&nbsp; 📅 ${g.year}
    </p>
    <div class="modal-tags">
      ${g.tags.map(t => `<span class="modal-tag">${t}</span>`).join('')}
    </div>
  `;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
